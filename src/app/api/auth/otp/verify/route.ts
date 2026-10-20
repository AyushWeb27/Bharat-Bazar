import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createUserSessionToken, USER_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, otp, type } = body;

    if (!identifier || !otp) {
      return NextResponse.json(
        { success: false, message: "Identifier and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const rawId = String(identifier).trim();
    let cleanId = rawId;

    if (/^\d{10}$/.test(rawId.replace(/\D/g, "").slice(-10))) {
      cleanId = rawId.replace(/\D/g, "").slice(-10);
    } else if (rawId.includes("@")) {
      cleanId = rawId.toLowerCase();
    }

    const cleanOtp = String(otp).trim();

    // Query active matching OTP from Neon database otps table
    const rows = await sql`
      SELECT id, identifier, type, otp_code, expires_at, verified, attempts
      FROM otps
      WHERE identifier = ${cleanId}
        AND otp_code = ${cleanOtp}
        AND verified = FALSE
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY id DESC
      LIMIT 1;
    `;

    if (rows.length === 0) {
      // Increment attempt counter for non-verified matching identifier records
      await sql`
        UPDATE otps
        SET attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP
        WHERE identifier = ${cleanId} AND verified = FALSE;
      `;

      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired OTP code. Please enter the latest OTP.",
        },
        { status: 400 }
      );
    }

    const otpRecord = rows[0];

    // Mark OTP as verified in Neon database
    await sql`
      UPDATE otps
      SET 
        verified = TRUE,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${otpRecord.id};
    `;

    // If verification is for login, log in the user and issue session
    const resolvedType = type || otpRecord.type;
    if (resolvedType === "phone_login" || resolvedType === "email_login") {
      let activeUser;

      // Query user in Neon database
      const existingUsers = await sql`
        SELECT id, name, email, phone, avatar_url, email_verified, auth_provider, status
        FROM users
        WHERE phone = ${cleanId} OR LOWER(email) = ${cleanId}
        LIMIT 1;
      `;

      if (existingUsers.length > 0) {
        const u = existingUsers[0];
        const updated = await sql`
          UPDATE users
          SET 
            email_verified = TRUE,
            last_login = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${u.id}
          RETURNING id, name, email, phone, avatar_url, email_verified, auth_provider;
        `;
        activeUser = updated[0];
      } else {
        const fallbackEmail = cleanId.includes("@") ? cleanId : `${cleanId}@bharatbazar.in`;
        const cleanPhone = cleanId.includes("@") ? "" : cleanId;
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
            ${cleanPhone ? `Customer ${cleanPhone.slice(-4)}` : cleanId.split("@")[0]},
            ${fallbackEmail},
            ${cleanPhone},
            TRUE,
            'phone',
            'active',
            CURRENT_TIMESTAMP
          )
          RETURNING id, name, email, phone, avatar_url, email_verified, auth_provider;
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
        verified: true,
        message: "OTP verified! Welcome to BharatBazar.",
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
    }

    // For registration or other verification types
    return NextResponse.json({
      success: true,
      verified: true,
      message: "OTP verified successfully! You can now complete registration.",
      otpId: otpRecord.id,
    });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to verify OTP." },
      { status: 500 }
    );
  }
}
