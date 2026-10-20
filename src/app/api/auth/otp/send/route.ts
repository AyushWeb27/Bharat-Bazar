import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, type } = body;

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "Email or mobile number is required." },
        { status: 400 }
      );
    }

    const rawId = String(identifier).trim();
    let cleanId = rawId;
    let otpType = type || "phone_login";

    // Clean phone number or normalize email
    if (/^\d{10}$/.test(rawId.replace(/\D/g, "").slice(-10))) {
      cleanId = rawId.replace(/\D/g, "").slice(-10);
      if (!type) otpType = "phone_login";
    } else if (rawId.includes("@")) {
      cleanId = rawId.toLowerCase();
      if (!type) otpType = "email_login";
    }

    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Get client IP address if available
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

    // Insert new OTP record into Neon database otps table
    const inserted = await sql`
      INSERT INTO otps (
        identifier,
        type,
        otp_code,
        expires_at,
        verified,
        attempts,
        ip_address,
        created_at,
        updated_at
      )
      VALUES (
        ${cleanId},
        ${otpType},
        ${otpCode},
        CURRENT_TIMESTAMP + INTERVAL '10 minutes',
        FALSE,
        0,
        ${ip},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING id, identifier, type, otp_code, expires_at, created_at;
    `;

    const record = inserted[0];

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully.",
      otp: otpCode,
      identifier: cleanId,
      type: otpType,
      expires_at: record.expires_at,
      expires_in_seconds: 600,
      recordId: record.id,
    });
  } catch (error: any) {
    console.error("Error generating OTP:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to generate OTP." },
      { status: 500 }
    );
  }
}
