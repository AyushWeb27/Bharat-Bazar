import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req?: NextRequest) {
  try {
    const category = req?.nextUrl?.searchParams?.get("category")?.trim();
    const rows = category
      ? await sql`
          SELECT id, name, slug, category, categories, logo_color, logo_url, country_flag, featured
          FROM admin_brands
          WHERE active = TRUE
            AND (
              LOWER(TRIM(category)) = LOWER(TRIM(${category}))
              OR categories @> ${JSON.stringify([category])}::jsonb
              OR LOWER(TRIM(category)) = 'all'
              OR LOWER(TRIM(category)) = 'general'
            )
          ORDER BY featured DESC, name ASC, id ASC
        `
      : await sql`
          SELECT id, name, slug, category, categories, logo_color, logo_url, country_flag, featured
          FROM admin_brands
          WHERE active = TRUE
          ORDER BY featured DESC, name ASC, id ASC
        `;

    return NextResponse.json(
      {
        success: true,
        brands: rows.map(row => {
          let categories: string[] = [];
          if (Array.isArray(row.categories)) {
            categories = (row.categories as unknown[]).map(c => String(c || "").trim()).filter(Boolean);
          } else if (typeof row.categories === "string") {
            try {
              const parsed = JSON.parse(row.categories);
              if (Array.isArray(parsed)) {
                categories = parsed.map(c => String(c || "").trim()).filter(Boolean);
              }
            } catch {
              categories = row.categories.split(",").map(c => c.trim()).filter(Boolean);
            }
          }
          const primaryCategory = String(row.category || "").trim();
          if (categories.length === 0 && primaryCategory) {
            categories = [primaryCategory];
          }
          categories = Array.from(new Set(categories));

          return {
            id: Number(row.id),
            name: String(row.name || ""),
            slug: String(row.slug || ""),
            category: categories[0] || primaryCategory,
            categories,
            logoColor: String(row.logo_color || "#009966"),
            logoInit: String(row.name || "").split(/\s+/).map(word => word[0]).join("").slice(0, 2),
            logoUrl: row.logo_url ? `/api/brands/${Number(row.id)}/image` : "",
            countryFlag: String(row.country_flag || ""),
            featured: Boolean(row.featured),
          };
        }),
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
