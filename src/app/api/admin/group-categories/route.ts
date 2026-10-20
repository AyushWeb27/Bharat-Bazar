import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  getActiveAdminId,
  isUniqueViolation,
  mapGroupCategory,
  parseGroupCategoryInput,
} from "@/lib/group-categories";

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Unauthorized. Please log in as an administrator." },
    { status: 401 }
  );
}

export async function GET(req: NextRequest) {
  try {
    if (!(await getActiveAdminId(req))) return unauthorized();

    const rows = await sql`
      SELECT id, name, slug, color, description, active
      FROM admin_group_categories
      ORDER BY id ASC
    `;
    return NextResponse.json({
      success: true,
      groups: rows.map(row => mapGroupCategory(row)),
    });
  } catch (error) {
    console.error("GET /api/admin/group-categories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load group categories." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await getActiveAdminId(req))) return unauthorized();

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
      INSERT INTO admin_group_categories (name, slug, color, description, active)
      VALUES (${input.name}, ${input.slug}, ${input.color}, ${input.description}, ${input.active})
      RETURNING id, name, slug, color, description, active
    `;
    return NextResponse.json(
      {
        success: true,
        message: "Group category created.",
        group: mapGroupCategory(rows[0]),
      },
      { status: 201 }
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { success: false, message: "A group category with this slug already exists." },
        { status: 409 }
      );
    }
    console.error("POST /api/admin/group-categories error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create group category." },
      { status: 500 }
    );
  }
}
