import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isUniqueViolation, requireActiveAdmin } from "@/lib/categories";
import type { CouponType } from "@/lib/coupons";

export const dynamic = "force-dynamic";

type CouponInput = {
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  maxDisc: number;
  expiry: string;
  limit: number;
  active: boolean;
};

function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseCoupon(value: unknown): CouponInput | null {
  if (!isRecord(value)) return null;
  const code = typeof value.code === "string" ? value.code.trim().toUpperCase() : "";
  const expiry = typeof value.expiry === "string" ? value.expiry.trim() : "";
  const type = value.type;
  const amountFields = [value.value, value.minOrder, value.maxDisc, value.limit];
  if (
    !/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(code) ||
    (type !== "flat" && type !== "percent") ||
    !amountFields.every(amount => typeof amount === "number" && Number.isFinite(amount)) ||
    typeof value.active !== "boolean" ||
    (expiry && !/^\d{4}-\d{2}-\d{2}$/.test(expiry))
  ) return null;

  const discountValue = value.value as number;
  const minOrder = value.minOrder as number;
  const maxDiscount = value.maxDisc as number;
  const usageLimit = value.limit as number;
  const [year, month, day] = expiry ? expiry.split("-").map(Number) : [];
  const validDate = !expiry || (
    month >= 1 && month <= 12 &&
    day >= 1 &&
    new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === expiry
  );
  if (
    !validDate ||
    discountValue <= 0 ||
    (type === "percent" && discountValue > 100) ||
    minOrder < 0 ||
    maxDiscount < 0 ||
    (type === "percent" && maxDiscount <= 0) ||
    !Number.isSafeInteger(usageLimit) ||
    usageLimit < 0
  ) return null;

  return {
    code,
    type,
    value: discountValue,
    minOrder,
    maxDisc: maxDiscount,
    expiry,
    limit: usageLimit,
    active: value.active,
  };
}

function mapCoupon(row: Record<string, unknown>) {
  const expiryValue = row.expires_at;
  const dateParts = expiryValue
    ? new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date(String(expiryValue)))
    : [];
  const expiry = expiryValue
    ? `${dateParts.find(part => part.type === "year")?.value}-${dateParts.find(part => part.type === "month")?.value}-${dateParts.find(part => part.type === "day")?.value}`
    : "";
  return {
    id: Number(row.id),
    code: String(row.code),
    type: String(row.discount_type) as CouponType,
    value: Number(row.discount_value),
    minOrder: Number(row.min_order_amount),
    maxDisc: Number(row.max_discount_amount),
    expiry,
    used: Number(row.used_count),
    limit: Number(row.usage_limit),
    active: Boolean(row.is_active),
  };
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized.", 401);
    const rows = await sql`
      SELECT id, code, discount_type, discount_value, min_order_amount,
             max_discount_amount, expires_at, used_count, usage_limit, is_active
      FROM admin_coupons
      ORDER BY created_at DESC, id DESC
    `;
    return NextResponse.json({ success: true, coupons: rows.map(mapCoupon) }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET /api/admin/coupons error:", error);
    return failure("Failed to load coupons. Ensure the coupon database setup has been run.", 500);
  }
}

async function saveCoupon(req: NextRequest, method: "POST" | "PUT") {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized.", 401);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return failure("Request body must be valid JSON.", 400);
    }

    const id = method === "PUT" && isRecord(body) &&
      typeof body.id === "number" && Number.isSafeInteger(body.id) && body.id > 0
      ? body.id
      : undefined;
    if (method === "PUT" && id === undefined) return failure("A valid coupon ID is required.", 400);
    const input = parseCoupon(body);
    if (!input) return failure("Enter a valid code, discount, minimum order, expiry, usage limit, and status.", 400);

    const expiresAt = input.expiry ? `${input.expiry}T23:59:59.999+05:30` : null;
    const rows = id === undefined
      ? await sql`
          INSERT INTO admin_coupons (
            code, discount_type, discount_value, min_order_amount,
            max_discount_amount, expires_at, usage_limit, is_active
          )
          VALUES (
            ${input.code}, ${input.type}, ${input.value}, ${input.minOrder},
            ${input.maxDisc}, ${expiresAt}::TIMESTAMP WITH TIME ZONE, ${input.limit}, ${input.active}
          )
          RETURNING id, code, discount_type, discount_value, min_order_amount,
                    max_discount_amount, expires_at, used_count, usage_limit, is_active
        `
      : await sql`
          UPDATE admin_coupons
          SET code = ${input.code}, discount_type = ${input.type}, discount_value = ${input.value},
              min_order_amount = ${input.minOrder}, max_discount_amount = ${input.maxDisc},
              expires_at = ${expiresAt}::TIMESTAMP WITH TIME ZONE,
              usage_limit = ${input.limit}, is_active = ${input.active},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING id, code, discount_type, discount_value, min_order_amount,
                    max_discount_amount, expires_at, used_count, usage_limit, is_active
        `;
    if (!rows.length) return failure("Coupon not found.", 404);
    return NextResponse.json({ success: true, coupon: mapCoupon(rows[0]) }, {
      status: id === undefined ? 201 : 200,
    });
  } catch (error) {
    if (isUniqueViolation(error)) return failure("A coupon with this code already exists.", 409);
    console.error(`${method} /api/admin/coupons error:`, error);
    return failure("Failed to save coupon.", 500);
  }
}

export async function POST(req: NextRequest) {
  return saveCoupon(req, "POST");
}

export async function PUT(req: NextRequest) {
  return saveCoupon(req, "PUT");
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized.", 401);
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) return failure("A valid coupon ID is required.", 400);
    const rows = await sql`DELETE FROM admin_coupons WHERE id = ${id} RETURNING id`;
    if (!rows.length) return failure("Coupon not found.", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/coupons error:", error);
    return failure("Failed to delete coupon.", 500);
  }
}
