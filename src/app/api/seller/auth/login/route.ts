import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  verifyPassword,
  createSellerSessionToken,
  SELLER_COOKIE_NAME,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { success: false, message: "Please enter both your registered email address and password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query seller by email
    const sellers = await sql`
      SELECT 
        id,
        owner_name,
        email,
        password_hash,
        store_name,
        store_slug,
        store_logo_url,
        store_banner_url,
        status,
        kyc_status,
        kyc_rejection_reason,
        business_name,
        business_category
      FROM sellers
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1
    `;

    if (sellers.length === 0) {
      return NextResponse.json(
        { success: false, message: "No registered merchant account found with this email address." },
        { status: 401 }
      );
    }

    const seller = sellers[0];

    // Verify password hash (check raw and trimmed)
    let isValid = await verifyPassword(password, seller.password_hash);
    if (!isValid && typeof password === "string") {
      isValid = await verifyPassword(password.trim(), seller.password_hash);
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect password. Please verify and try again." },
        { status: 401 }
      );
    }

    const statusLower = (seller.status || "").toLowerCase();
    if (statusLower === "suspended") {
      return NextResponse.json(
        {
          success: false,
          message: "Your merchant account has been suspended by BharatBazar Administration. Please contact seller support.",
        },
        { status: 403 }
      );
    }

    // Update last_login in Neon
    await sql`
      UPDATE sellers
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ${seller.id}
    `;

    // Create session token
    const token = createSellerSessionToken({
      id: seller.id,
      owner_name: seller.owner_name,
      store_name: seller.store_name,
      store_slug: seller.store_slug,
      email: seller.email,
      status: seller.status,
    });

    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully.",
      seller: {
        id: seller.id,
        owner_name: seller.owner_name,
        email: seller.email,
        store_name: seller.store_name,
        store_slug: seller.store_slug,
        store_logo_url: seller.store_logo_url,
        store_banner_url: seller.store_banner_url,
        status: seller.status,
        kyc_status: seller.kyc_status,
        kyc_rejection_reason: seller.kyc_rejection_reason,
        business_name: seller.business_name,
        business_category: seller.business_category,
      },
    });

    response.cookies.set({
      name: SELLER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("POST /api/seller/auth/login error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to sign in seller." },
      { status: 500 }
    );
  }
}
