import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, createUserSessionToken, USER_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists in Neon database
    const existing = await sql`
      SELECT id, email, password_hash, auth_provider
      FROM users
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1
    `;

    if (existing.length > 0) {
      if (existing[0].auth_provider === "google" && !existing[0].password_hash) {
        return NextResponse.json(
          {
            success: false,
            message: "An account already exists with Google. Please use 'Sign in with Google'.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists. Please sign in.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const cleanPhone = phone ? String(phone).trim() : "";

    // Insert new user into Neon DB users table (verified in database on creation)
    const inserted = await sql`
      INSERT INTO users (
        name,
        email,
        password_hash,
        phone,
        email_verified,
        auth_provider,
        status,
        last_login
      )
      VALUES (
        ${name.trim()},
        ${cleanEmail},
        ${passwordHash},
        ${cleanPhone},
        TRUE,
        'local',
        'active',
        CURRENT_TIMESTAMP
      )
      RETURNING id, name, email, phone, avatar_url, email_verified, auth_provider, created_at
    `;

    const user = inserted[0];

    // Create session token
    const token = createUserSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      auth_provider: user.auth_provider,
      email_verified: user.email_verified,
    });

    const response = NextResponse.json({
      success: true,
      message: "Registration successful! Welcome to BharatBazar.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
        auth_provider: user.auth_provider,
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
    console.error("User registration error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
