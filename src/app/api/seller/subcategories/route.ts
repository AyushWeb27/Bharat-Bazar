import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/seller/subcategories
 * Public endpoint — no auth required.
 * Returns all active subcategories with parent category info,
 * group info, product count, and image URL.
 */
export async function GET() {
  try {
    const rows = await sql`
      SELECT
        s.id,
        s.name,
        s.slug,
        s.emoji,
        s.image_url,
        s.sort_order,
        s.parent_id,
        c.name        AS parent_name,
        c.slug        AS parent_slug,
        c.emoji       AS parent_emoji,
        c.image_url   AS parent_image_url,
        g.id          AS group_id,
        g.name        AS group_name,
        g.color       AS group_color,
        COUNT(p.id)::INT AS product_count
      FROM admin_subcategories s
      JOIN admin_categories c
        ON c.id = s.parent_id
        AND c.active = TRUE
      JOIN admin_group_categories g
        ON g.id = c.group_id
        AND g.active = TRUE
      LEFT JOIN admin_products p
        ON LOWER(TRIM(p.category))    = LOWER(TRIM(c.name))
        AND LOWER(TRIM(p.subcategory)) = LOWER(TRIM(s.name))
        AND p.status = 'active'
      WHERE s.active = TRUE
      GROUP BY s.id, c.id, g.id
      ORDER BY g.id ASC, c.name ASC, s.sort_order ASC, s.name ASC
    `;

    const subcategories = rows.map((row) => ({
      id:            Number(row.id),
      name:          String(row.name || ""),
      slug:          String(row.slug || ""),
      emoji:         String(row.emoji || "📁"),
      imageUrl:      row.image_url ? `/api/seller/subcategories/${Number(row.id)}/image` : "",
      count:         Number(row.product_count) || 0,
      parentId:      Number(row.parent_id),
      parentName:    String(row.parent_name || ""),
      parentSlug:    String(row.parent_slug || ""),
      parentEmoji:   String(row.parent_emoji || "📦"),
      parentImageUrl: row.parent_image_url
        ? `/api/categories/${Number(row.parent_id)}/image`
        : "",
      groupId:       Number(row.group_id),
      groupName:     String(row.group_name || ""),
      groupColor:    String(row.group_color || "#009966"),
    }));

    return NextResponse.json(
      { success: true, count: subcategories.length, subcategories },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/seller/subcategories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load subcategories." },
      { status: 500 }
    );
  }
}

