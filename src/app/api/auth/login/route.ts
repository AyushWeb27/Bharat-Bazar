import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword, createUserSessionToken, USER_COOKIE_NAME } from "@/lib/auth";

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

    // Query user from Neon database
    const rows = await sql`
      SELECT id, name, email, password_hash, phone, avatar_url, email_verified, auth_provider, status
      FROM users
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No account found with this email. Please register." },
        { status: 404 }
      );
    }

    const user = rows[0];

    if (user.status && user.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Your account is inactive. Please contact support." },
        { status: 403 }
      );
    }

    if (!user.password_hash) {
      return NextResponse.json(
        {
          success: false,
          message: "This account was created with Google. Please use 'Sign in with Google'.",
        },
        { status: 400 }
      );
    }

    // Verify bcrypt password hash
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid password. Please check your credentials." },
        { status: 401 }
      );
    }

    // Verify and update email verification & last_login in Neon DB on successful login
    const updated = await sql`
      UPDATE users
      SET 
        email_verified = TRUE,
        last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
      RETURNING id, name, email, phone, avatar_url, email_verified, auth_provider
    `;

    const activeUser = updated[0];

    // Create session token
    const token = createUserSessionToken({
      id: activeUser.id,
      name: activeUser.name,
      email: activeUser.email,
      avatar_url: activeUser.avatar_url,
      auth_provider: activeUser.auth_provider,
      email_verified: activeUser.email_verified,
    });

    const response = NextResponse.json({
      success: true,
      message: "Welcome back! Login verified.",
      user: {
        id: activeUser.id,
        name: activeUser.name,
        email: activeUser.email,
        phone: activeUser.phone,
        avatar_url: activeUser.avatar_url,
        email_verified: activeUser.email_verified,
        auth_provider: activeUser.auth_provider,
      },
    });

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error("User login error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error during login." },
      { status: 500 }
    );
  }
}
