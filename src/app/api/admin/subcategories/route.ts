import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  isUniqueSlugViolation,
  mapSubcategory,
  parentCategoryExists,
  parseSubcategoryInput,
  requireActiveAdmin,
} from "@/lib/subcategories";

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Unauthorized. Please log in as an administrator." },
    { status: 401 }
  );
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return unauthorized();
    const rows = await sql`
      SELECT s.id, s.name, s.slug, s.parent_id, c.name AS parent_name,
             s.emoji, s.image_url, s.sort_order, s.active, 0::INT AS products
      FROM admin_subcategories s
      JOIN admin_categories c ON c.id = s.parent_id
      ORDER BY s.parent_id ASC, s.sort_order ASC, s.id ASC
    `;
    return NextResponse.json({
      success: true,
      subcategories: rows.map(row => mapSubcategory(row)),
    });
  } catch (error) {
    console.error("GET /api/admin/subcategories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load subcategories." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return unauthorized();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body must be valid JSON." },
        { status: 400 }
      );
    }
    const input = parseSubcategoryInput(body);
    if (!input) {
      return NextResponse.json(
        { success: false, message: "Enter a valid name, slug, parent category, icon, sort order, and status." },
        { status: 400 }
      );
    }
    if (!(await parentCategoryExists(input.parent_id))) {
      return NextResponse.json(
        { success: false, message: "Choose a valid parent category." },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO admin_subcategories (name, slug, parent_id, emoji, sort_order, active)
      VALUES (${input.name}, ${input.slug}, ${input.parent_id}, ${input.emoji}, ${input.sort}, ${input.active})
      RETURNING id
    `;
    const created = await sql`
      SELECT s.id, s.name, s.slug, s.parent_id, c.name AS parent_name,
             s.emoji, s.image_url, s.sort_order, s.active, 0::INT AS products
      FROM admin_subcategories s
      JOIN admin_categories c ON c.id = s.parent_id
      WHERE s.id = ${rows[0].id}
      LIMIT 1
    `;
    return NextResponse.json(
      { success: true, message: "Subcategory created.", subcategory: mapSubcategory(created[0]) },
      { status: 201 }
    );
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return NextResponse.json(
        { success: false, message: "A subcategory with this slug already exists." },
        { status: 409 }
      );
    }
    console.error("POST /api/admin/subcategories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create subcategory." },
      { status: 500 }
    );
  }
}
