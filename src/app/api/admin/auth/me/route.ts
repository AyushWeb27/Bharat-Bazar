import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false, message: "No active admin session." },
        { status: 401 }
      );
    }

    const payload = verifySessionToken(sessionCookie);

    if (!payload) {
      return NextResponse.json(
        { authenticated: false, message: "Session expired or invalid." },
        { status: 401 }
      );
    }

    // Optionally check if admin still exists and is active in Neon DB
    const admins = await sql`
      SELECT id, name, email, role, status, last_login
      FROM admins
      WHERE id = ${payload.id} AND status = 'active'
      LIMIT 1
    `;

    if (admins.length === 0) {
      return NextResponse.json(
        { authenticated: false, message: "Admin user not found or deactivated." },
        { status: 401 }
      );
    }

    const currentAdmin = admins[0];

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: currentAdmin.id,
        name: currentAdmin.name,
        email: currentAdmin.email,
        role: currentAdmin.role,
        last_login: currentAdmin.last_login,
      },
    });
  } catch (error: any) {
    console.error("Admin session check error:", error);
    return NextResponse.json(
      { authenticated: false, message: "Error verifying session." },
      { status: 500 }
    );
  }
}
