import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  verifyGoogleIdToken,
  verifyGoogleAccessToken,
  createSellerSessionToken,
  SELLER_COOKIE_NAME,
  GoogleTokenPayload,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, access_token } = body;

    if (!credential && !access_token) {
      return NextResponse.json(
        {
          success: false,
          message: "Google credential or access token is required.",
        },
        { status: 400 }
      );
    }

    // Verify token with Google
    let googlePayload: GoogleTokenPayload | null = null;
    if (credential) {
      googlePayload = await verifyGoogleIdToken(credential);
    } else if (access_token) {
      googlePayload = await verifyGoogleAccessToken(access_token);
    }

    if (!googlePayload || !googlePayload.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Google verification failed. The provided token is invalid or expired.",
        },
        { status: 401 }
      );
    }

    const cleanEmail = googlePayload.email.trim().toLowerCase();

    // Query Neon database for registered seller with this email
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

    // Check if seller's email is available in the database
    if (sellers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          notRegistered: true,
          email: cleanEmail,
          name: googlePayload.name,
          picture: googlePayload.picture,
          message: `No registered seller account found for "${cleanEmail}". Please register your store first.`,
        },
        { status: 404 }
      );
    }

    const seller = sellers[0];

    // Check if seller account is suspended
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

    // Update email_verified and last_login in database
    await sql`
      UPDATE sellers
      SET 
        email_verified = TRUE,
        last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${seller.id}
    `;

    // Optionally set logo if missing and google picture is available
    if ((!seller.store_logo_url || seller.store_logo_url === "") && googlePayload.picture) {
      try {
        await sql`
          UPDATE sellers
          SET store_logo_url = ${googlePayload.picture}
          WHERE id = ${seller.id} AND (store_logo_url IS NULL OR store_logo_url = '')
        `;
        seller.store_logo_url = googlePayload.picture;
      } catch {
        // non-critical
      }
    }

    // Create secure seller session token
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
      message: "Signed in with Google successfully.",
      seller: {
        id: seller.id,
        owner_name: seller.owner_name,
        email: seller.email,
        store_name: seller.store_name,
        store_slug: seller.store_slug,
        store_logo_url: seller.store_logo_url || googlePayload.picture || "",
        store_banner_url: seller.store_banner_url,
        status: seller.status,
        kyc_status: seller.kyc_status,
        kyc_rejection_reason: seller.kyc_rejection_reason,
        business_name: seller.business_name,
        business_category: seller.business_category,
      },
    });

    // Set HTTP-only cookie
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
    console.error("POST /api/seller/auth/google error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Failed to authenticate seller with Google.",
      },
      { status: 500 }
    );
  }
}

