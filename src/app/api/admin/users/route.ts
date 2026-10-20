import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

// GET all admins (Protected)
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const admins = await sql`
      SELECT id, name, email, role, status, last_login, created_at, updated_at
      FROM admins
      ORDER BY id ASC
    `;

    return NextResponse.json({ success: true, admins });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST create admin manually into table (Protected)
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check if email already exists
    const existing = await sql`
      SELECT id FROM admins WHERE LOWER(email) = ${cleanEmail}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "An admin with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const assignedRole = role || "superadmin";

    const inserted = await sql`
      INSERT INTO admins (name, email, password_hash, role, status)
      VALUES (${name.trim()}, ${cleanEmail}, ${passwordHash}, ${assignedRole}, 'active')
      RETURNING id, name, email, role, status, created_at
    `;

    return NextResponse.json({
      success: true,
      message: "Admin user added successfully.",
      admin: inserted[0],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
