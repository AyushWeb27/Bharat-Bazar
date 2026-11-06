import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveAdmin } from "@/lib/categories";

export const dynamic = "force-dynamic";

type FlashSaleInput = {
  id?: number;
  name: string;
  discountType: "percent" | "flat";
  discountValue: number;
  startDate: string;
  endDate: string;
  active: boolean;
  productIds: number[];
};

function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseFlashSale(value: unknown, id?: number): FlashSaleInput | null {
  if (!isRecord(value)) return null;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const discountType = value.discountType;
  const discountValue = value.discountValue;
  const startDate = value.startDate;
  const endDate = value.endDate;
  const productIds = value.productIds;

  if (
    !name || name.length > 120 ||
    (discountType !== "percent" && discountType !== "flat") ||
    typeof discountValue !== "number" || !Number.isFinite(discountValue) ||
    discountValue <= 0 || (discountType === "percent" && discountValue > 100) ||
    typeof startDate !== "string" || Number.isNaN(Date.parse(startDate)) ||
    typeof endDate !== "string" || Number.isNaN(Date.parse(endDate)) ||
    Date.parse(startDate) >= Date.parse(endDate) ||
    typeof value.active !== "boolean" ||
    !Array.isArray(productIds) || productIds.length > 200 ||
    !productIds.every(productId => typeof productId === "number" &&
      Number.isSafeInteger(productId) && productId > 0) ||
    new Set(productIds).size !== productIds.length
  ) return null;

  return {
    ...(id === undefined ? {} : { id }),
    name,
    discountType,
    discountValue,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    active: value.active,
    productIds,
  };
}

function mapDate(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) {
      return failure("Unauthorized. Please log in as an administrator.", 401);
    }

    const [sales, products, selectedProducts] = await Promise.all([
      sql`
        SELECT id, name, discount_type, discount_value, start_at, end_at, is_active
        FROM admin_flash_sales
        ORDER BY created_at DESC, id DESC
      `,
      sql`
        SELECT product.id, product.name, product.brand, product.category,
               product.selling_price, product.stock, product.main_image_url,
               (
                 product.status = 'active'
                 AND EXISTS (
                   SELECT 1
                   FROM admin_categories AS category
                   JOIN admin_group_categories AS category_group
                     ON category_group.id = category.group_id AND category_group.active = TRUE
                   WHERE LOWER(TRIM(category.name)) = LOWER(TRIM(product.category))
                     AND category.active = TRUE
                 )
               ) AS selectable
        FROM admin_products AS product
        WHERE (
          product.status = 'active'
          AND EXISTS (
            SELECT 1
            FROM admin_categories AS category
            JOIN admin_group_categories AS category_group
              ON category_group.id = category.group_id AND category_group.active = TRUE
            WHERE LOWER(TRIM(category.name)) = LOWER(TRIM(product.category))
              AND category.active = TRUE
          )
        ) OR EXISTS (
          SELECT 1
          FROM admin_flash_sale_products AS linked
          WHERE linked.product_id = product.id
        )
        ORDER BY product.name ASC, product.id ASC
      `,
      sql`
        SELECT sale_product.sale_id, sale_product.product_id, product.name
        FROM admin_flash_sale_products AS sale_product
        JOIN admin_products AS product ON product.id = sale_product.product_id
        ORDER BY product.name ASC
      `,
    ]);

    const productIdsBySale = new Map<number, number[]>();
    const productNamesBySale = new Map<number, string[]>();
    for (const row of selectedProducts) {
      const saleId = Number(row.sale_id);
      productIdsBySale.set(saleId, [...(productIdsBySale.get(saleId) || []), Number(row.product_id)]);
      productNamesBySale.set(saleId, [...(productNamesBySale.get(saleId) || []), String(row.name)]);
    }

    return NextResponse.json({
      success: true,
      sales: sales.map(row => ({
        id: Number(row.id),
        name: String(row.name),
        discountType: String(row.discount_type) as FlashSaleInput["discountType"],
        discountValue: Number(row.discount_value),
        startDate: mapDate(row.start_at),
        endDate: mapDate(row.end_at),
        active: Boolean(row.is_active),
        productIds: productIdsBySale.get(Number(row.id)) || [],
        productNames: productNamesBySale.get(Number(row.id)) || [],
      })),
      products: products.map(row => ({
        id: Number(row.id),
        name: String(row.name),
        brand: String(row.brand || ""),
        category: String(row.category || ""),
        price: Number(row.selling_price) || 0,
        stock: Number(row.stock) || 0,
        imageUrl: row.main_image_url ? `/api/products/${Number(row.id)}/image` : "",
        selectable: Boolean(row.selectable),
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/admin/flash-sales error:", error);
    return failure("Failed to load flash sales.", 500);
  }
}

async function saveFlashSale(req: NextRequest, method: "POST" | "PUT") {
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
      return failure("A valid flash sale ID is required.", 400);
    }
    const input = parseFlashSale(body, id);
    if (!input || (method === "POST" && !input.productIds.length)) {
      return failure("Enter valid flash sale details and select at least one product.", 400);
    }

    if (id !== undefined) {
      const existing = await sql`SELECT id FROM admin_flash_sales WHERE id = ${id} LIMIT 1`;
      if (!existing.length) return failure("Flash sale not found.", 404);
    }

    const products = await sql`
      SELECT id
      FROM admin_products
      WHERE id = ANY(${input.productIds}::INT[])
        AND status = 'active'
        AND EXISTS (
          SELECT 1
          FROM admin_categories AS category
          JOIN admin_group_categories AS category_group
            ON category_group.id = category.group_id AND category_group.active = TRUE
          WHERE LOWER(TRIM(category.name)) = LOWER(TRIM(admin_products.category))
            AND category.active = TRUE
        )
    `;
    if (products.length !== input.productIds.length) {
      return failure("One or more selected products are no longer active. Refresh and try again.", 409);
    }

    const result = await sql`
      WITH saved AS (
        INSERT INTO admin_flash_sales (
          id, name, discount_type, discount_value, start_at, end_at, is_active, updated_at
        )
        VALUES (
          COALESCE(
            ${id ?? null}::INTEGER,
            nextval(pg_get_serial_sequence('admin_flash_sales', 'id'))::INTEGER
          ),
          ${input.name}, ${input.discountType}, ${input.discountValue},
          ${input.startDate}::TIMESTAMPTZ, ${input.endDate}::TIMESTAMPTZ,
          ${input.active}, CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          discount_type = EXCLUDED.discount_type,
          discount_value = EXCLUDED.discount_value,
          start_at = EXCLUDED.start_at,
          end_at = EXCLUDED.end_at,
          is_active = EXCLUDED.is_active,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      ),
      removed AS (
        DELETE FROM admin_flash_sale_products AS linked
        USING saved
        WHERE linked.sale_id = saved.id
          AND NOT (linked.product_id = ANY(${input.productIds}::INT[]))
        RETURNING linked.product_id
      ),
      attached AS (
        INSERT INTO admin_flash_sale_products (sale_id, product_id)
        SELECT saved.id, selected.product_id
        FROM saved
        CROSS JOIN UNNEST(${input.productIds}::INT[]) AS selected(product_id)
        ON CONFLICT (sale_id, product_id) DO NOTHING
        RETURNING product_id
      )
      SELECT id FROM saved
    `;

    return NextResponse.json({ success: true, id: Number(result[0].id) }, {
      status: method === "POST" ? 201 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(`${method} /api/admin/flash-sales error:`, error);
    return failure("Failed to save flash sale.", 500);
  }
}

export async function POST(req: NextRequest) {
  return saveFlashSale(req, "POST");
}

export async function PUT(req: NextRequest) {
  return saveFlashSale(req, "PUT");
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) {
      return failure("Unauthorized. Please log in as an administrator.", 401);
    }
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) return failure("A valid flash sale ID is required.", 400);

    const rows = await sql`DELETE FROM admin_flash_sales WHERE id = ${id} RETURNING id`;
    if (!rows.length) return failure("Flash sale not found.", 404);
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("DELETE /api/admin/flash-sales error:", error);
    return failure("Failed to delete flash sale.", 500);
  }
}
