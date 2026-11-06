import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      WITH current_sale AS (
        SELECT id, name, discount_type, discount_value, end_at
        FROM admin_flash_sales
        WHERE is_active = TRUE
          AND start_at <= CURRENT_TIMESTAMP
          AND end_at > CURRENT_TIMESTAMP
        ORDER BY start_at DESC, id DESC
        LIMIT 1
      )
      SELECT sale.id AS sale_id, sale.name AS sale_name, sale.end_at,
             sale.discount_type, sale.discount_value,
             product.id, product.name, product.short_description, product.category,
             product.subcategory, product.brand, product.selling_price, product.mrp,
             product.stock, product.main_image_url
      FROM current_sale AS sale
      JOIN admin_flash_sale_products AS linked ON linked.sale_id = sale.id
      JOIN admin_products AS product ON product.id = linked.product_id
      WHERE product.status = 'active'
        AND product.stock > 0
        AND product.selling_price > 0
        AND NOT EXISTS (
          SELECT 1
          FROM admin_daily_deals AS daily_deal
          WHERE daily_deal.product_id = product.id
            AND daily_deal.deal_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE
            AND daily_deal.is_active = TRUE
        )
        AND EXISTS (
          SELECT 1
          FROM admin_categories AS category
          JOIN admin_group_categories AS category_group
            ON category_group.id = category.group_id AND category_group.active = TRUE
          WHERE LOWER(TRIM(category.name)) = LOWER(TRIM(product.category))
            AND category.active = TRUE
        )
      ORDER BY linked.product_id ASC
    `;

    if (!rows.length) {
      return NextResponse.json(
        { success: true, sale: null },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const sale = rows[0];
    const endDate = sale.end_at instanceof Date
      ? sale.end_at.toISOString()
      : new Date(String(sale.end_at)).toISOString();
    const products = rows.map(row => {
      const basePrice = Number(row.selling_price) || 0;
      const discountValue = Number(row.discount_value) || 0;
      const discount = row.discount_type === "percent"
        ? basePrice * discountValue / 100
        : discountValue;
      const price = Math.max(0, basePrice - discount);
      const image = row.main_image_url
        ? `/api/products/${Number(row.id)}/image`
        : "";

      return {
        id: Number(row.id),
        name: String(row.name || ""),
        brand: String(row.brand || "Bharat Bazar"),
        cat: String(row.category || ""),
        subcategory: String(row.subcategory || ""),
        price,
        mrp: basePrice,
        rating: 0,
        reviews: 0,
        off: basePrice > 0 ? Math.round((basePrice - price) / basePrice * 100) : 0,
        cod: false,
        emi: false,
        freeShip: false,
        inStock: Number(row.stock) > 0,
        stock: Number(row.stock) || 0,
        tag: "Flash Sale",
        tagClr: "#ef4444",
        img: image,
        img2: image,
        desc: String(row.short_description || ""),
        sizes: [],
        spec: {},
      };
    });

    return NextResponse.json({
      success: true,
      sale: {
        id: Number(sale.sale_id),
        name: String(sale.sale_name),
        endDate,
        products,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/flash-sales error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load current flash sale." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
