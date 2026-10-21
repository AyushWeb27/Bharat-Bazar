import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapAdminBrand, parseAdminBrandInput, requireActiveBrandAdmin } from "@/lib/brands";
import { deleteBrandImage } from "@/lib/profile-storage";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized. Please log in as an administrator." }, { status: 401 });
}

function isUniqueViolation(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) return unauthorized();
    const rows = await sql`SELECT * FROM admin_brands ORDER BY id ASC`;
    return NextResponse.json({ success: true, brands: rows.map(mapAdminBrand) });
  } catch (error) {
    console.error("GET /api/admin/brands error:", error);
    return NextResponse.json({ success: false, message: "Failed to load brands." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) return unauthorized();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: "Request body must be valid JSON." }, { status: 400 });
    }
    const input = parseAdminBrandInput(body);
    if (!input) return NextResponse.json({ success: false, message: "Enter valid brand details." }, { status: 400 });

    const rows = await sql`
      INSERT INTO admin_brands
        (name, slug, category, logo_color, country, country_flag, website, description, featured, active, premium)
      VALUES
        (${input.name}, ${input.slug}, ${input.category}, ${input.logoColor}, ${input.country},
         ${input.countryFlag}, ${input.website}, ${input.description}, ${input.featured}, ${input.active}, ${input.premium})
      RETURNING *
    `;
    return NextResponse.json({ success: true, brand: mapAdminBrand(rows[0]) }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ success: false, message: "A brand with this slug already exists." }, { status: 409 });
    }
    console.error("POST /api/admin/brands error:", error);
    return NextResponse.json({ success: false, message: "Failed to create brand." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) return unauthorized();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: "Request body must be valid JSON." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: "Invalid brand update." }, { status: 400 });
    }
    const inputBody = body as Record<string, unknown>;
    const id = Number(inputBody.id);
    const input = parseAdminBrandInput(inputBody);
    if (!Number.isSafeInteger(id) || id < 1 || !input) {
      return NextResponse.json({ success: false, message: "Enter valid brand details." }, { status: 400 });
    }
    const rows = await sql`
      UPDATE admin_brands
      SET name = ${input.name}, slug = ${input.slug}, category = ${input.category},
          logo_color = ${input.logoColor}, country = ${input.country},
          country_flag = ${input.countryFlag}, website = ${input.website}, description = ${input.description},
          featured = ${input.featured}, active = ${input.active}, premium = ${input.premium},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows.length) return NextResponse.json({ success: false, message: "Brand not found." }, { status: 404 });
    return NextResponse.json({ success: true, brand: mapAdminBrand(rows[0]) });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ success: false, message: "A brand with this slug already exists." }, { status: 409 });
    }
    console.error("PUT /api/admin/brands error:", error);
    return NextResponse.json({ success: false, message: "Failed to update brand." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) return unauthorized();
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) {
      return NextResponse.json({ success: false, message: "A valid brand ID is required." }, { status: 400 });
    }
    const existing = await sql`SELECT logo_url FROM admin_brands WHERE id = ${id} LIMIT 1`;
    if (!existing.length) return NextResponse.json({ success: false, message: "Brand not found." }, { status: 404 });
    if (existing[0].logo_url) await deleteBrandImage(id);
    const rows = await sql`DELETE FROM admin_brands WHERE id = ${id} RETURNING id`;
    if (!rows.length) return NextResponse.json({ success: false, message: "Brand not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/brands error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete brand." }, { status: 500 });
  }
}
