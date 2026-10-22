import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, slug, category, logo_color, logo_url, country_flag, featured
      FROM admin_brands
      WHERE active = TRUE
      ORDER BY featured DESC, name ASC, id ASC
    `;

    return NextResponse.json(
      {
        success: true,
        brands: rows.map(row => ({
          id: Number(row.id),
          name: String(row.name || ""),
          slug: String(row.slug || ""),
          category: String(row.category || ""),
          logoColor: String(row.logo_color || "#009966"),
          logoInit: String(row.name || "").split(/\s+/).map(word => word[0]).join("").slice(0, 2),
          logoUrl: row.logo_url ? `/api/brands/${Number(row.id)}/image` : "",
          countryFlag: String(row.country_flag || ""),
          featured: Boolean(row.featured),
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/brands error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load storefront brands." },
      { status: 500 }
    );
  }
}
