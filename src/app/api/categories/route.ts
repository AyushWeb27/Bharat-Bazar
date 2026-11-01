import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rows, groupRows, subcategoryRows] = await Promise.all([
      sql`
      SELECT c.id, c.name, c.slug, c.emoji, c.image_url, c.group_id,
             g.name AS group_name, g.color AS group_color,
             COUNT(p.id)::INT AS product_count
      FROM admin_categories c
      JOIN admin_group_categories g ON g.id = c.group_id AND g.active = TRUE
      LEFT JOIN admin_products p
        ON LOWER(TRIM(p.category)) = LOWER(TRIM(c.name))
        AND p.status = 'active'
      WHERE c.active = TRUE
      GROUP BY c.id, g.id
      ORDER BY g.id ASC, c.name ASC, c.id ASC
    `,
      sql`
      SELECT id, name, color
      FROM admin_group_categories
      WHERE active = TRUE
      ORDER BY id ASC
    `,
      sql`
      SELECT s.id, s.name, s.slug, s.parent_id, s.emoji,
             COUNT(p.id)::INT AS product_count
      FROM admin_subcategories s
      JOIN admin_categories c ON c.id = s.parent_id AND c.active = TRUE
      JOIN admin_group_categories g ON g.id = c.group_id AND g.active = TRUE
      LEFT JOIN admin_products p
        ON LOWER(TRIM(p.category)) = LOWER(TRIM(c.name))
        AND LOWER(TRIM(p.subcategory)) = LOWER(TRIM(s.name))
        AND p.status = 'active'
      WHERE s.active = TRUE
      GROUP BY s.id
      ORDER BY s.parent_id ASC, s.sort_order ASC, s.id ASC
    `,
    ]);
    const subcategoriesByParent = new Map<number, Array<{
      id: number;
      name: string;
      slug: string;
      emoji: string;
      imageUrl: string;
      count: number;
    }>>();
    for (const row of subcategoryRows) {
      const parentId = Number(row.parent_id);
      const subcategories = subcategoriesByParent.get(parentId) ?? [];
      subcategories.push({
        id: Number(row.id),
        name: String(row.name || ""),
        slug: String(row.slug || ""),
        emoji: String(row.emoji || "📁"),
        imageUrl: "",
        count: Number(row.product_count) || 0,
      });
      subcategoriesByParent.set(parentId, subcategories);
    }

    return NextResponse.json(
      {
        success: true,
        groups: groupRows.map(row => ({
          id: Number(row.id),
          name: String(row.name || ""),
          color: String(row.color || "#009966"),
        })),
        categories: rows.map(row => ({
          id: Number(row.id),
          name: String(row.name || ""),
          slug: String(row.slug || ""),
          emoji: String(row.emoji || "📦"),
          imageUrl: row.image_url ? `/api/categories/${Number(row.id)}/image` : "",
          count: Number(row.product_count) || 0,
          groupId: Number(row.group_id),
          groupName: String(row.group_name || ""),
          groupColor: String(row.group_color || "#009966"),
          subcategories: subcategoriesByParent.get(Number(row.id)) ?? [],
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
