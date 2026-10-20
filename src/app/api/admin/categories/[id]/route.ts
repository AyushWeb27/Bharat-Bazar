import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  groupExists,
  isUniqueViolation,
  mapAdminCategory,
  parseAdminCategoryInput,
  requireActiveAdmin,
} from "@/lib/categories";

type RouteContext = { params: { id: string } };

function parseId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Unauthorized. Please log in as an administrator." },
    { status: 401 }
  );
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await requireActiveAdmin(req))) return unauthorized();
    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid category ID." }, { status: 400 });
    }

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

    const updated = await sql`
      UPDATE admin_categories
      SET name = ${input.name},
          slug = ${input.slug},
          group_id = ${input.group_id},
          emoji = ${input.emoji},
          active = ${input.active},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id
    `;
    if (!updated.length) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    const rows = await sql`
      SELECT c.id, c.name, c.slug, c.group_id, g.name AS group_name,
             c.emoji, c.image_url, c.active, 0::INT AS products
      FROM admin_categories c
      JOIN admin_group_categories g ON g.id = c.group_id
      WHERE c.id = ${id}
      LIMIT 1
    `;
    return NextResponse.json({
      success: true,
      message: "Category updated.",
      category: mapAdminCategory(rows[0]),
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { success: false, message: "A category with this slug already exists." },
        { status: 409 }
      );
    }
    console.error("PUT /api/admin/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await requireActiveAdmin(req))) return unauthorized();
    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid category ID." }, { status: 400 });
    }

    const rows = await sql`
      DELETE FROM admin_categories
      WHERE id = ${id}
      RETURNING id
    `;
    if (!rows.length) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Category deleted." });
  } catch (error) {
    console.error("DELETE /api/admin/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category." },
      { status: 500 }
    );
  }
}
