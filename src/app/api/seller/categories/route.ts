import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.emoji, 
        c.group_id,
        g.name AS group_name
      FROM admin_categories c
      LEFT JOIN admin_group_categories g ON g.id = c.group_id
      WHERE c.active = TRUE
      ORDER BY g.name ASC NULLS LAST, c.name ASC;
    `;

    const categories = rows.map(r => ({
      id: Number(r.id),
      name: String(r.name || "").trim(),
      slug: String(r.slug || "").trim(),
      emoji: String(r.emoji || "📦").trim(),
      groupId: r.group_id ? Number(r.group_id) : null,
      groupName: r.group_name ? String(r.group_name).trim() : "General Categories",
    }));

    // Build grouped map for optgroup rendering in dropdowns
    const grouped: Record<string, typeof categories> = {};
    for (const cat of categories) {
      const gName = cat.groupName;
      if (!grouped[gName]) {
        grouped[gName] = [];
      }
      grouped[gName].push(cat);
    }

    return NextResponse.json(
      {
        success: true,
        count: categories.length,
        categories,
        grouped,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/seller/categories error fetching from admin_categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories from admin_categories table." },
      { status: 500 }
    );
  }
}

