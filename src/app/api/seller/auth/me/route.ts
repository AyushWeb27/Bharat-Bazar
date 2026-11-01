import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  verifySellerSessionToken,
  SELLER_COOKIE_NAME,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SELLER_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ success: false, authenticated: false, seller: null }, { status: 401 });
    }

    const session = verifySellerSessionToken(token);
    if (!session || !session.id) {
      const response = NextResponse.json({ success: false, authenticated: false, seller: null }, { status: 401 });
      response.cookies.delete(SELLER_COOKIE_NAME);
      return response;
    }

    const sellers = await sql`
      SELECT 
        id,
        owner_name,
        email,
        mobile,
        alt_phone,
        aadhaar,
        business_name,
        business_type,
        business_category,
        gstin,
        pan,
        year_established,
        monthly_turnover,
        store_name,
        store_slug,
        store_description,
        website_url,
        store_logo_url,
        store_banner_url,
        store_accent_color,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        shipping_model,
        same_as_pickup,
        return_address,
        account_holder,
        bank_name,
        account_type,
        account_number,
        ifsc,
        gst_doc_url,
        pan_doc_url,
        aadhaar_doc_url,
        bank_doc_url,
        trade_license_url,
        allow_cod,
        auto_approve,
        status,
        kyc_status,
        kyc_rejection_reason,
        commission_rate,
        rating,
        revenue,
        products_count,
        featured,
        created_at,
        updated_at,
        last_login
      FROM sellers
      WHERE id = ${session.id}
      LIMIT 1
    `;

    if (sellers.length === 0) {
      const response = NextResponse.json({ success: false, authenticated: false, seller: null }, { status: 401 });
      response.cookies.delete(SELLER_COOKIE_NAME);
      return response;
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      seller: sellers[0],
    });
  } catch (err: any) {
    console.error("GET /api/seller/auth/me error:", err);
    return NextResponse.json(
      { success: false, authenticated: false, seller: null, message: err?.message },
      { status: 500 }
    );
  }
}
