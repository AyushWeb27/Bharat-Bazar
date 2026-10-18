import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword, createSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Query admin from Neon database
    const users = await sql`
      SELECT id, name, email, password_hash, role, status
      FROM admins
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "No admin found with this email address." },
        { status: 401 }
      );
    }

    const admin = users[0];

    if (admin.status && admin.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Your admin account is inactive. Please contact system owner." },
        { status: 403 }
      );
    }

    // Verify hashed password
    const isPasswordValid = await verifyPassword(password, admin.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid password. Please verify and try again." },
        { status: 401 }
      );
    }

    // Update last_login timestamp in Neon database
    await sql`
      UPDATE admins
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ${admin.id}
    `;

    // Create secure session token
    const token = createSessionToken({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    // Set HTTP-only secure cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Admin login API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error during authentication.",
      },
      { status: 500 }
    );
  }
}
