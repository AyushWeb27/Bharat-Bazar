import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  groupExists,
  isUniqueViolation,
  mapAdminCategory,
  parseAdminCategoryInput,
  requireActiveAdmin,
} from "@/lib/categories";

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
      SELECT c.id, c.name, c.slug, c.group_id, g.name AS group_name,
             c.emoji, c.image_url, c.active, 0::INT AS products
      FROM admin_categories c
      JOIN admin_group_categories g ON g.id = c.group_id
      ORDER BY c.id ASC
    `;
    return NextResponse.json({
      success: true,
      categories: rows.map(row => mapAdminCategory(row)),
    });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load categories." },
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

    const input = parseAdminCategoryInput(body);
    if (!input) {
      return NextResponse.json(
        { success: false, message: "Enter a valid name, slug, group, icon, and status." },
        { status: 400 }
      );
    }
    if (!(await groupExists(input.group_id))) {
      return NextResponse.json(
        { success: false, message: "Choose a valid group category." },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO admin_categories (name, slug, group_id, emoji, active)
      VALUES (${input.name}, ${input.slug}, ${input.group_id}, ${input.emoji}, ${input.active})
      RETURNING id, name, slug, group_id, emoji, image_url, active
    `;
    const created = await sql`
      SELECT c.id, c.name, c.slug, c.group_id, g.name AS group_name,
             c.emoji, c.image_url, c.active, 0::INT AS products
      FROM admin_categories c
      JOIN admin_group_categories g ON g.id = c.group_id
      WHERE c.id = ${rows[0].id}
      LIMIT 1
    `;
    return NextResponse.json(
      { success: true, message: "Category created.", category: mapAdminCategory(created[0]) },
      { status: 201 }
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { success: false, message: "A category with this slug already exists." },
        { status: 409 }
      );
    }
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category." },
      { status: 500 }
    );
  }
}
