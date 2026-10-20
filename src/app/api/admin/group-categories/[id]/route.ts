import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  getActiveAdminId,
  isUniqueViolation,
  mapGroupCategory,
  parseGroupCategoryInput,
} from "@/lib/group-categories";

type RouteContext = { params: { id: string } };

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Unauthorized. Please log in as an administrator." },
    { status: 401 }
  );
}

function parseId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await getActiveAdminId(req))) return unauthorized();
    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid group category ID." }, { status: 400 });
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

    const input = parseGroupCategoryInput(body);
    if (!input) {
      return NextResponse.json(
        { success: false, message: "Enter a valid name, slug, color, description, and status." },
        { status: 400 }
      );
    }

    const rows = await sql`
      UPDATE admin_group_categories
      SET name = ${input.name},
          slug = ${input.slug},
          color = ${input.color},
          description = ${input.description},
          active = ${input.active},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, slug, color, description, active
    `;
    if (!rows.length) {
      return NextResponse.json({ success: false, message: "Group category not found." }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "Group category updated.",
      group: mapGroupCategory(rows[0]),
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { success: false, message: "A group category with this slug already exists." },
        { status: 409 }
      );
    }
    console.error("PUT /api/admin/group-categories/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update group category." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await getActiveAdminId(req))) return unauthorized();
    const id = parseId(params.id);
    if (!id) {
      return NextResponse.json({ success: false, message: "Invalid group category ID." }, { status: 400 });
    }

    const deleted = await sql`
      DELETE FROM admin_group_categories
      WHERE id = ${id}
      RETURNING id
    `;
    if (!deleted.length) {
      return NextResponse.json({ success: false, message: "Group category not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Group category deleted." });
  } catch (error) {
    console.error("DELETE /api/admin/group-categories/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete group category." },
      { status: 500 }
    );
  }
}
