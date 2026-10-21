import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveAdmin } from "@/lib/categories";
import type { TaxType } from "@/app/components/pages/admin/shared/types";

export const runtime = "nodejs";

type TaxRuleInput = {
  name: string;
  rate: number | null;
  rateLabel: string;
  type: TaxType;
  category: string;
  active: boolean;
};

const TAX_TYPES: TaxType[] = [
  "GST", "IGST", "Customs", "Central Tax", "State Tax",
  "Union Territory Tax", "Integrated Tax", "Cess",
];

function response(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseTaxRule(value: unknown): TaxRuleInput | null {
  if (!isRecord(value)) return null;
  const rate = value.rate;
  const rateLabel = typeof value.rateLabel === "string" ? value.rateLabel.trim() : "";
  if (
    typeof value.name !== "string" ||
    (rate !== null && (typeof rate !== "number" || !Number.isFinite(rate) || rate < 0 || rate > 100)) ||
    !TAX_TYPES.includes(value.type as TaxType) ||
    typeof value.category !== "string" ||
    typeof value.active !== "boolean" ||
    rateLabel.length > 40 ||
    (rate === null && !rateLabel)
  ) return null;

  const name = value.name.trim();
  const category = value.category.trim();
  if (!name || name.length > 120 || !category || category.length > 120) return null;
  return {
    name,
    rate: rate as number | null,
    rateLabel: rateLabel || `${rate}%`,
    type: value.type as TaxType,
    category,
    active: value.active,
  };
}

function mapTaxRule(row: Record<string, unknown>) {
  const rate = row.rate === null ? null : Number(row.rate);
  return {
    id: Number(row.id),
    name: String(row.name),
    slab: rate,
    rateLabel: String(row.rate_label || (rate === null ? "" : `${rate}%`)),
    type: String(row.type) as TaxType,
    category: String(row.category),
    products: Number(row.products) || 0,
    active: Boolean(row.active),
  };
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return response("Unauthorized.", 401);
    const rows = await sql`
      SELECT rule.id, rule.name, rule.rate, rule.rate_label, rule.type, rule.category, rule.active,
             COUNT(product.id)::INT AS products
      FROM admin_tax_rules AS rule
      LEFT JOIN admin_products AS product ON product.tax_rule_id = rule.id
      GROUP BY rule.id
      ORDER BY rule.id ASC
    `;
    return NextResponse.json({ success: true, taxes: rows.map(mapTaxRule) });
  } catch (error) {
    console.error("GET /api/admin/taxes error:", error);
    return response("Failed to load tax rules. Ensure the tax database setup has been run.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return response("Unauthorized.", 401);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return response("Request body must be valid JSON.", 400);
    }
    const input = parseTaxRule(body);
    if (!input) return response("Enter a name, valid tax rate, type, category, and status.", 400);

    const rows = await sql`
      INSERT INTO admin_tax_rules (name, rate, rate_label, type, category, active)
      VALUES (${input.name}, ${input.rate}, ${input.rateLabel}, ${input.type}, ${input.category}, ${input.active})
      RETURNING id, name, rate, rate_label, type, category, active, 0::INT AS products
    `;
    return NextResponse.json({ success: true, tax: mapTaxRule(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/taxes error:", error);
    return response("Failed to create tax rule.", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return response("Unauthorized.", 401);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return response("Request body must be valid JSON.", 400);
    }
    if (!isRecord(body) || typeof body.id !== "number" || !Number.isSafeInteger(body.id) || body.id < 1) {
      return response("A valid tax rule ID is required.", 400);
    }
    const input = parseTaxRule(body);
    if (!input) return response("Enter a name, valid tax rate, type, category, and status.", 400);

    const rows = await sql`
      UPDATE admin_tax_rules
      SET name = ${input.name}, rate = ${input.rate}, rate_label = ${input.rateLabel}, type = ${input.type},
          category = ${input.category}, active = ${input.active}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${body.id}
      RETURNING id, name, rate, rate_label, type, category, active
    `;
    if (!rows.length) return response("Tax rule not found.", 404);
    const count = await sql`
      SELECT COUNT(*)::INT AS products
      FROM admin_products
      WHERE tax_rule_id = ${body.id}
    `;
    return NextResponse.json({
      success: true,
      tax: mapTaxRule({ ...rows[0], products: count[0].products }),
    });
  } catch (error) {
    console.error("PUT /api/admin/taxes error:", error);
    return response("Failed to update tax rule.", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return response("Unauthorized.", 401);
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) return response("A valid tax rule ID is required.", 400);
    const rows = await sql`DELETE FROM admin_tax_rules WHERE id = ${id} RETURNING id`;
    if (!rows.length) return response("Tax rule not found.", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/taxes error:", error);
    return response("Failed to delete tax rule.", 500);
  }
}
