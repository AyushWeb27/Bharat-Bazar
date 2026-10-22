import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT c.id, c.name, c.slug, c.emoji, c.image_url,
             COUNT(p.id)::INT AS product_count
      FROM admin_categories c
      LEFT JOIN admin_products p
        ON LOWER(TRIM(p.category)) = LOWER(TRIM(c.name))
        AND p.status = 'active'
      WHERE c.active = TRUE
      GROUP BY c.id
      ORDER BY c.name ASC, c.id ASC
    `;

    return NextResponse.json(
      {
        success: true,
        categories: rows.map(row => ({
          id: Number(row.id),
          name: String(row.name || ""),
          slug: String(row.slug || ""),
          emoji: String(row.emoji || "📦"),
          imageUrl: row.image_url ? `/api/categories/${Number(row.id)}/image` : "",
          count: Number(row.product_count) || 0,
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load storefront categories." },
      { status: 500 }
    );
  }
}
