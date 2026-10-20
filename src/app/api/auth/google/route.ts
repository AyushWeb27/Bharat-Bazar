import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  verifyGoogleIdToken,
  createUserSessionToken,
  USER_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { success: false, message: "Google ID token credential is required." },
        { status: 400 }
      );
    }

    // Cryptographically verify Google token
    const googlePayload = await verifyGoogleIdToken(credential);

    if (!googlePayload || !googlePayload.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Google verification failed. Token is invalid or expired.",
        },
        { status: 401 }
      );
    }

    const cleanEmail = googlePayload.email.trim().toLowerCase();
    const userName = googlePayload.name || cleanEmail.split("@")[0];
    const avatarUrl = googlePayload.picture || "";
    const googleId = googlePayload.sub || "";

    // Query Neon database for existing user
    const existing = await sql`
      SELECT id, name, email, phone, avatar_url, email_verified, auth_provider, status
      FROM users
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1
    `;

    let activeUser;

    if (existing.length > 0) {
      const u = existing[0];
      if (u.status && u.status !== "active") {
        return NextResponse.json(
          { success: false, message: "Your account is deactivated. Please contact support." },
          { status: 403 }
        );
      }

      // Update existing user with Google info & mark email as verified in database
      const updated = await sql`
        UPDATE users
        SET 
          google_id = COALESCE(NULLIF(${googleId}, ''), google_id),
          avatar_url = CASE WHEN avatar_url = '' OR avatar_url IS NULL THEN ${avatarUrl} ELSE avatar_url END,
          email_verified = TRUE,
          last_login = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${u.id}
        RETURNING id, name, email, phone, avatar_url, email_verified, auth_provider
      `;
      activeUser = updated[0];
    } else {
      // Insert new verified user into Neon database
      const inserted = await sql`
        INSERT INTO users (
          name,
          email,
          avatar_url,
          google_id,
          email_verified,
          auth_provider,
          status,
          last_login
        )
        VALUES (
          ${userName},
          ${cleanEmail},
          ${avatarUrl},
          ${googleId},
          TRUE,
          'google',
          'active',
          CURRENT_TIMESTAMP
        )
        RETURNING id, name, email, phone, avatar_url, email_verified, auth_provider
      `;
      activeUser = inserted[0];
    }

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
      message: "Google sign-in verified and completed!",
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
    console.error("Google authentication route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error during Google authentication.",
      },
      { status: 500 }
    );
  }
}
