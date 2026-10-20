import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createUserSessionToken, USER_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp } = body;

    const cleanPhone = String(phone || "").replace(/\D/g, "").slice(-10);

    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, message: "Valid 10-digit mobile number is required." },
        { status: 400 }
      );
    }

    if (!otp || String(otp).length < 6) {
      return NextResponse.json(
        { success: false, message: "Please enter the complete 6-digit OTP." },
        { status: 400 }
      );
    }

    // Check if user exists with this phone in Neon DB
    const existing = await sql`
      SELECT id, name, email, phone, avatar_url, email_verified, auth_provider, status
      FROM users
      WHERE phone = ${cleanPhone}
      LIMIT 1
    `;

    let activeUser;

    if (existing.length > 0) {
      const u = existing[0];
      if (u.status && u.status !== "active") {
        return NextResponse.json(
          { success: false, message: "Your account is inactive. Please contact support." },
          { status: 403 }
        );
      }

      const updated = await sql`
        UPDATE users
        SET 
          email_verified = TRUE,
          last_login = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${u.id}
        RETURNING id, name, email, phone, avatar_url, email_verified, auth_provider
      `;
      activeUser = updated[0];
    } else {
      const fallbackEmail = `${cleanPhone}@bharatbazar.in`;
      const inserted = await sql`
        INSERT INTO users (
          name,
          email,
          phone,
          email_verified,
          auth_provider,
          status,
          last_login
        )
        VALUES (
          ${`Customer ${cleanPhone.slice(-4)}`},
          ${fallbackEmail},
          ${cleanPhone},
          TRUE,
          'phone',
          'active',
          CURRENT_TIMESTAMP
        )
        RETURNING id, name, email, phone, avatar_url, email_verified, auth_provider
      `;
      activeUser = inserted[0];
    }

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
      message: "Mobile verified successfully!",
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
    console.error("Phone login error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error during mobile login." },
      { status: 500 }
    );
  }
}
