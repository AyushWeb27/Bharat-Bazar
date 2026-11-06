import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getActiveCartUserId } from "@/lib/customer-cart";
import { calculateCouponDiscount, type CouponType } from "@/lib/coupons";

export const dynamic = "force-dynamic";

function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getActiveCartUserId(req);
    if (!userId) return failure("Sign in to apply a coupon.", 401);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return failure("Request body must be valid JSON.", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return failure("Enter a coupon code and order subtotal.", 400);
    }

    const input = body as Record<string, unknown>;
    const code = typeof input.code === "string" ? input.code.trim().toUpperCase() : "";
    const subtotal = input.subtotal;
    if (!/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(code) ||
        typeof subtotal !== "number" || !Number.isFinite(subtotal) || subtotal < 0) {
      return failure("Enter a valid coupon code and order subtotal.", 400);
    }

    const rows = await sql`
      SELECT id, code, discount_type, discount_value, min_order_amount,
             max_discount_amount, usage_limit, used_count
      FROM admin_coupons
      WHERE code = ${code}
        AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        AND (usage_limit = 0 OR used_count < usage_limit)
      LIMIT 1
    `;
    if (!rows.length) return failure("This coupon is invalid, expired, inactive, or fully redeemed.", 400);
    const coupon = rows[0];
    const previousRedemption = await sql`
      SELECT id
      FROM customer_coupon_redemptions
      WHERE coupon_id = ${coupon.id} AND user_id = ${userId}
      LIMIT 1
    `;
    if (previousRedemption.length) {
      return failure("You have already used this coupon. Each coupon can be used once per customer.", 409);
    }
    const minimum = Number(coupon.min_order_amount);
    if (subtotal < minimum) {
      return failure(`Add ${new Intl.NumberFormat("en-IN").format(minimum - subtotal)} more to use this coupon.`, 400);
    }

    const discount = calculateCouponDiscount(
      String(coupon.discount_type) as CouponType,
      Number(coupon.discount_value),
      Number(coupon.max_discount_amount),
      subtotal
    );
    if (discount <= 0) return failure("This coupon does not apply to the current order.", 400);
    return NextResponse.json({
      success: true,
      coupon: { code: String(coupon.code), discount },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return failure("Could not validate this coupon. Please try again.", 500);
  }
}
