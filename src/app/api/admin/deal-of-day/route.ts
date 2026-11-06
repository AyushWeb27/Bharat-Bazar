import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveAdmin } from "@/lib/categories";

export const dynamic = "force-dynamic";

type DealInput = {
  id?: number;
  productId: number;
  discountPercent: number;
  dealDate: string;
  active: boolean;
  featured: boolean;
  showOnHomepage: boolean;
};

function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value;
}

function parseDeal(value: unknown, id?: number): DealInput | null {
  if (!isRecord(value)) return null;
  const dealDate = readDate(value.dealDate);
  if (
    typeof value.productId !== "number" || !Number.isSafeInteger(value.productId) || value.productId < 1 ||
    typeof value.discountPercent !== "number" || !Number.isFinite(value.discountPercent) ||
    value.discountPercent <= 0 || value.discountPercent >= 100 ||
    !dealDate ||
    typeof value.active !== "boolean" ||
    typeof value.featured !== "boolean" ||
    typeof value.showOnHomepage !== "boolean"
  ) return null;

  return {
    ...(id === undefined ? {} : { id }),
    productId: value.productId,
    discountPercent: value.discountPercent,
    dealDate,
    active: value.active,
    featured: value.featured,
    showOnHomepage: value.showOnHomepage,
  };
}

function dateValue(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value || "").slice(0, 10);
}

function isUniqueViolation(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}

function mapDeal(row: Record<string, unknown>) {
  const originalPrice = Number(row.selling_price) || 0;
  const discountPercent = Number(row.discount_percent) || 0;
  return {
    id: Number(row.id),
    productId: Number(row.product_id),
    productName: String(row.product_name || ""),
    brand: String(row.brand || ""),
    category: String(row.category || ""),
    imageUrl: row.main_image_url ? `/api/products/${Number(row.product_id)}/image` : "",
    originalPrice,
    dealPrice: Math.max(0, Math.round(originalPrice * (1 - discountPercent / 100) * 100) / 100),
    discountPercent,
    stock: Number(row.stock) || 0,
    dealDate: dateValue(row.deal_date),
    active: Boolean(row.is_active),
    featured: Boolean(row.is_featured),
    showOnHomepage: Boolean(row.show_on_homepage),
  };
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) {
      return failure("Unauthorized. Please log in as an administrator.", 401);
    }

    const [deals, products] = await Promise.all([
      sql`
        SELECT deal.id, deal.product_id, deal.discount_percent, deal.deal_date,
               deal.is_active, deal.is_featured, deal.show_on_homepage,
               product.name AS product_name, product.brand, product.category,
               product.selling_price, product.stock, product.main_image_url
        FROM admin_daily_deals AS deal
        JOIN admin_products AS product ON product.id = deal.product_id
        ORDER BY deal.deal_date DESC, deal.is_featured DESC, deal.id DESC
      `,
      sql`
        SELECT product.id, product.name, product.brand, product.category,
               product.selling_price, product.stock, product.main_image_url,
               product.status = 'active' AND EXISTS (
                 SELECT 1
                 FROM admin_categories AS category
                 JOIN admin_group_categories AS category_group
                   ON category_group.id = category.group_id AND category_group.active = TRUE
                 WHERE LOWER(TRIM(category.name)) = LOWER(TRIM(product.category))
                   AND category.active = TRUE
               ) AS selectable
        FROM admin_products AS product
        WHERE product.status = 'active' OR EXISTS (
          SELECT 1 FROM admin_daily_deals AS deal WHERE deal.product_id = product.id
        )
        ORDER BY product.name ASC, product.id ASC
      `,
    ]);

    return NextResponse.json({
      success: true,
      deals: deals.map(row => mapDeal(row)),
      products: products.map(row => ({
        id: Number(row.id),
        name: String(row.name || ""),
        brand: String(row.brand || ""),
        category: String(row.category || ""),
        price: Number(row.selling_price) || 0,
        stock: Number(row.stock) || 0,
        imageUrl: row.main_image_url ? `/api/products/${Number(row.id)}/image` : "",
        selectable: Boolean(row.selectable),
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/admin/deal-of-day error:", error);
    return failure("Failed to load Deal of the Day campaigns.", 500);
  }
}

async function saveDeal(req: NextRequest, method: "POST" | "PUT") {
  try {
    if (!(await requireActiveAdmin(req))) {
      return failure("Unauthorized. Please log in as an administrator.", 401);
    }

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
    if (method === "PUT" && id === undefined) {
      return failure("A valid Deal of the Day ID is required.", 400);
    }
    const deal = parseDeal(body, id);
    if (!deal) return failure("Enter valid product, discount, date, and display settings.", 400);

    if (id !== undefined) {
      const existing = await sql`SELECT id FROM admin_daily_deals WHERE id = ${id} LIMIT 1`;
      if (!existing.length) return failure("Deal of the Day campaign not found.", 404);
    }

    const products = await sql`
      SELECT product.id
      FROM admin_products AS product
      WHERE product.id = ${deal.productId}
        AND product.status = 'active'
        AND product.selling_price > 0
        AND EXISTS (
          SELECT 1
          FROM admin_categories AS category
          JOIN admin_group_categories AS category_group
            ON category_group.id = category.group_id AND category_group.active = TRUE
          WHERE LOWER(TRIM(category.name)) = LOWER(TRIM(product.category))
            AND category.active = TRUE
        )
    `;
    if (!products.length) {
      return failure("Select an active product with an active category and a valid price.", 409);
    }

    const clearFeatured = deal.featured
      ? sql`
          UPDATE admin_daily_deals
          SET is_featured = FALSE, updated_at = CURRENT_TIMESTAMP
          WHERE deal_date = ${deal.dealDate}::DATE
            AND is_featured = TRUE
            AND id != ${id ?? 0}
        `
      : sql`SELECT 1`;
    const save = id === undefined
      ? sql`
          INSERT INTO admin_daily_deals (
            product_id, discount_percent, deal_date, is_active,
            is_featured, show_on_homepage, updated_at
          )
          VALUES (
            ${deal.productId}, ${deal.discountPercent}, ${deal.dealDate}::DATE,
            ${deal.active}, ${deal.featured}, ${deal.showOnHomepage}, CURRENT_TIMESTAMP
          )
          RETURNING id
        `
      : sql`
          UPDATE admin_daily_deals
          SET product_id = ${deal.productId},
              discount_percent = ${deal.discountPercent},
              deal_date = ${deal.dealDate}::DATE,
              is_active = ${deal.active},
              is_featured = ${deal.featured},
              show_on_homepage = ${deal.showOnHomepage},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING id
        `;

    const results = await sql.transaction([clearFeatured, save]);
    const saved = results[1] as Array<{ id: number }>;
    if (!saved.length) return failure("Deal of the Day campaign not found.", 404);
    return NextResponse.json({ success: true, id: Number(saved[0].id) }, {
      status: method === "POST" ? 201 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return failure("This product already has a deal on that date.", 409);
    }
    console.error(`${method} /api/admin/deal-of-day error:`, error);
    return failure("Failed to save Deal of the Day campaign.", 500);
  }
}

export async function POST(req: NextRequest) {
  return saveDeal(req, "POST");
}

export async function PUT(req: NextRequest) {
  return saveDeal(req, "PUT");
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) {
      return failure("Unauthorized. Please log in as an administrator.", 401);
    }
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) return failure("A valid Deal of the Day ID is required.", 400);

    const rows = await sql`DELETE FROM admin_daily_deals WHERE id = ${id} RETURNING id`;
    if (!rows.length) return failure("Deal of the Day campaign not found.", 404);
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("DELETE /api/admin/deal-of-day error:", error);
    return failure("Failed to delete Deal of the Day campaign.", 500);
  }
}
