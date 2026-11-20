import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category")?.trim() || null;

  try {
    const stats = await sql`
      SELECT 
        COALESCE(MIN(p.selling_price), 0)::NUMERIC AS min_price,
        COALESCE(MAX(p.selling_price), 0)::NUMERIC AS max_price,
        COALESCE(MAX(p.mrp), 0)::NUMERIC AS max_mrp,
        COUNT(*)::INT AS total_count
      FROM admin_products p
      JOIN admin_categories c
        ON LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
        AND c.active = TRUE
      JOIN admin_group_categories g
        ON g.id = c.group_id AND g.active = TRUE
      WHERE p.status = 'active'
        AND (${category}::text IS NULL
          OR LOWER(TRIM(c.name)) = LOWER(TRIM(${category}))
          OR LOWER(TRIM(c.slug)) = LOWER(TRIM(${category})))
    `;

    const minPrice = 0;
    const highestProductPrice = Math.max(0, Math.ceil(Number(stats[0]?.max_price || 0)));
    const maxPrice = highestProductPrice;

    return NextResponse.json(
      {
        success: true,
        minPrice,
        maxPrice,
        highestPrice: highestProductPrice,
        highestProductPrice,
        priceRange: {
          min: minPrice,
          max: maxPrice,
          highestPrice: highestProductPrice,
        },
        totalProducts: Number(stats[0]?.total_count || 0),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/products/price-range error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch price range." },
      { status: 500 }
    );
  }
}

