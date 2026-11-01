import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category")?.trim();
  if (!category) {
    return NextResponse.json(
      { success: false, message: "A category is required." },
      { status: 400 }
    );
  }

  try {
    const rows = await sql`
      SELECT p.id, p.name, p.short_description, p.category, p.subcategory, p.brand,
             p.mrp, p.selling_price, p.stock, p.main_image_url,
             p.is_deal, p.featured
      FROM admin_products p
      JOIN admin_categories c
        ON LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
        AND c.active = TRUE
      JOIN admin_group_categories g
        ON g.id = c.group_id AND g.active = TRUE
      WHERE p.status = 'active'
        AND (
          LOWER(TRIM(c.name)) = LOWER(TRIM(${category}))
          OR LOWER(TRIM(c.slug)) = LOWER(TRIM(${category}))
        )
      ORDER BY p.is_popular DESC, p.featured DESC, p.created_at DESC, p.id DESC
    `;

    return NextResponse.json(
      {
        success: true,
        products: rows.map(row => {
          const price = Number(row.selling_price) || 0;
          const mrp = Number(row.mrp) || price;
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
            mrp,
            rating: 0,
            reviews: 0,
            off: mrp > 0 ? Math.max(0, Math.round((1 - price / mrp) * 100)) : 0,
            cod: false,
            emi: false,
            freeShip: false,
            inStock: Number(row.stock) > 0,
            tag: row.is_deal ? "Deal" : row.featured ? "Featured" : "",
            tagClr: row.is_deal ? "#f97316" : "#009966",
            img: image,
            img2: image,
            desc: String(row.short_description || ""),
            sizes: [],
            spec: {},
          };
        }),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load category products." },
      { status: 500 }
    );
  }
}
