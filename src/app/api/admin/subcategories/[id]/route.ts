import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  isUniqueSlugViolation,
  mapSubcategory,
  parentCategoryExists,
  parseSubcategoryInput,
  requireActiveAdmin,
} from "@/lib/subcategories";

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
    if (!id) return NextResponse.json({ success: false, message: "Invalid subcategory ID." }, { status: 400 });

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

    const updated = await sql`
      UPDATE admin_subcategories
      SET name = ${input.name},
          slug = ${input.slug},
          parent_id = ${input.parent_id},
          emoji = ${input.emoji},
          sort_order = ${input.sort},
          active = ${input.active},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id
    `;
    if (!updated.length) {
      return NextResponse.json({ success: false, message: "Subcategory not found." }, { status: 404 });
    }

    const rows = await sql`
      SELECT s.id, s.name, s.slug, s.parent_id, c.name AS parent_name,
             s.emoji, s.image_url, s.sort_order, s.active, 0::INT AS products
      FROM admin_subcategories s
      JOIN admin_categories c ON c.id = s.parent_id
      WHERE s.id = ${id}
      LIMIT 1
    `;
    return NextResponse.json({
      success: true,
      message: "Subcategory updated.",
      subcategory: mapSubcategory(rows[0]),
    });
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return NextResponse.json(
        { success: false, message: "A subcategory with this slug already exists." },
        { status: 409 }
      );
    }
    console.error("PUT /api/admin/subcategories/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subcategory." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await requireActiveAdmin(req))) return unauthorized();
    const id = parseId(params.id);
    if (!id) return NextResponse.json({ success: false, message: "Invalid subcategory ID." }, { status: 400 });

    const deleted = await sql`
      DELETE FROM admin_subcategories
      WHERE id = ${id}
      RETURNING id
    `;
    if (!deleted.length) {
      return NextResponse.json({ success: false, message: "Subcategory not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Subcategory deleted." });
  } catch (error) {
    console.error("DELETE /api/admin/subcategories/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subcategory." },
      { status: 500 }
    );
  }
}
