import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveBrandAdmin } from "@/lib/brands";

type CustomerInput = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string | null;
  status: "active" | "inactive";
  vip: boolean;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function parseCustomerInput(value: unknown): CustomerInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.phone !== "string" ||
    typeof body.gender !== "string" ||
    typeof body.status !== "string" ||
    typeof body.vip !== "boolean"
  ) return null;

  const name = body.name.trim();
  const email = body.email.trim().toLowerCase();
  const phone = body.phone.trim();
  const gender = body.gender.trim().toLowerCase();
  const dateOfBirthText = typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() : "";
  const dateOfBirth = dateOfBirthText || null;
  const parsedDateOfBirth = dateOfBirth ? new Date(`${dateOfBirth}T00:00:00.000Z`) : null;
  if (
    !name || name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 ||
    phone.length > 30 ||
    !["", "female", "male", "other", "prefer-not-to-say"].includes(gender) ||
    (dateOfBirth !== null && (
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
      !parsedDateOfBirth || Number.isNaN(parsedDateOfBirth.getTime()) ||
      parsedDateOfBirth.toISOString().slice(0, 10) !== dateOfBirth ||
      parsedDateOfBirth.getTime() > Date.now()
    )) ||
    !["active", "inactive"].includes(body.status)
  ) return null;

  return {
    name,
    email,
    phone,
    gender,
    dateOfBirth,
    status: body.status as CustomerInput["status"],
    vip: body.vip,
  };
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) return errorResponse("Unauthorized.", 401);

    const [rows, statsRows] = await Promise.all([
      sql`
        SELECT id, name, email, phone, gender, date_of_birth::TEXT AS date_of_birth,
               status, vip, email_verified, auth_provider, created_at, last_login
        FROM users
        ORDER BY created_at DESC, id DESC
      `,
      sql`
        SELECT
          COUNT(*)::INT AS total,
          COUNT(*) FILTER (
            WHERE created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP)
          )::INT AS new_this_month,
          COUNT(*) FILTER (WHERE status = 'active')::INT AS active,
          COUNT(*) FILTER (WHERE vip = TRUE)::INT AS vip
        FROM users
      `,
    ]);

    return NextResponse.json({
      success: true,
      customers: rows.map(row => ({
        id: Number(row.id),
        name: String(row.name || ""),
        email: String(row.email || ""),
        phone: String(row.phone || ""),
        gender: String(row.gender || ""),
        dateOfBirth: row.date_of_birth ? String(row.date_of_birth).slice(0, 10) : "",
        orders: null,
        spent: null,
        status: row.status === "active" ? "Active" : "Inactive",
        vip: Boolean(row.vip),
        emailVerified: Boolean(row.email_verified),
        authProvider: String(row.auth_provider || "local"),
        joined: row.created_at,
        lastLogin: row.last_login,
      })),
      stats: {
        total: Number(statsRows[0]?.total) || 0,
        newThisMonth: Number(statsRows[0]?.new_this_month) || 0,
        active: Number(statsRows[0]?.active) || 0,
        vip: Number(statsRows[0]?.vip) || 0,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/admin/customers error:", error);
    return errorResponse("Failed to load customers.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) return errorResponse("Unauthorized.", 401);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Request body must be valid JSON.", 400);
    }
    const input = parseCustomerInput(body);
    if (!input) return errorResponse("Enter valid customer details.", 400);

    const rows = await sql`
      INSERT INTO users
        (name, email, phone, gender, date_of_birth, status, vip, email_verified, auth_provider)
      VALUES
        (${input.name}, ${input.email}, ${input.phone}, ${input.gender || null},
         ${input.dateOfBirth}::DATE, ${input.status}, ${input.vip}, FALSE, 'admin-created')
      RETURNING id, name, email, phone, gender, date_of_birth::TEXT AS date_of_birth,
                status, vip, email_verified, auth_provider, created_at, last_login
    `;

    return NextResponse.json({
      success: true,
      customer: mapCustomer(rows[0]),
    }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) return errorResponse("A customer with this email already exists.", 409);
    console.error("POST /api/admin/customers error:", error);
    return errorResponse("Failed to create customer.", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) return errorResponse("Unauthorized.", 401);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Request body must be valid JSON.", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse("Invalid customer update.", 400);
    }
    const inputBody = body as Record<string, unknown>;
    const id = Number(inputBody.id);
    const input = parseCustomerInput(inputBody);
    if (!Number.isSafeInteger(id) || id < 1 || !input) return errorResponse("Enter valid customer details.", 400);

    const rows = await sql`
      UPDATE users
      SET name = ${input.name}, email = ${input.email}, phone = ${input.phone},
          gender = ${input.gender || null}, date_of_birth = ${input.dateOfBirth}::DATE,
          status = ${input.status}, vip = ${input.vip}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, email, phone, gender, date_of_birth::TEXT AS date_of_birth,
                status, vip, email_verified, auth_provider, created_at, last_login
    `;
    if (!rows.length) return errorResponse("Customer not found.", 404);

    return NextResponse.json({ success: true, customer: mapCustomer(rows[0]) });
  } catch (error) {
    if (isUniqueViolation(error)) return errorResponse("A customer with this email already exists.", 409);
    console.error("PUT /api/admin/customers error:", error);
    return errorResponse("Failed to update customer.", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) return errorResponse("Unauthorized.", 401);
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) return errorResponse("A valid customer ID is required.", 400);

    const rows = await sql`
      UPDATE users
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id
    `;
    if (!rows.length) return errorResponse("Customer not found.", 404);
    return NextResponse.json({ success: true, message: "Customer account deactivated." });
  } catch (error) {
    console.error("DELETE /api/admin/customers error:", error);
    return errorResponse("Failed to deactivate customer.", 500);
  }
}

function mapCustomer(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    name: String(row.name || ""),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    gender: String(row.gender || ""),
    dateOfBirth: row.date_of_birth ? String(row.date_of_birth).slice(0, 10) : "",
    orders: null,
    spent: null,
    status: row.status === "active" ? "Active" : "Inactive",
    vip: Boolean(row.vip),
    emailVerified: Boolean(row.email_verified),
    authProvider: String(row.auth_provider || "local"),
    joined: row.created_at,
    lastLogin: row.last_login,
  };
}

function isUniqueViolation(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}
