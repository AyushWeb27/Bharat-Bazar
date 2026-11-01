import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifySellerSessionToken, SELLER_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

function checkSellerAuth(req: NextRequest) {
  const token = req.cookies.get(SELLER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySellerSessionToken(token);
}

export async function GET(req: NextRequest) {
  try {
    const session = checkSellerAuth(req);
    if (!session || !session.id) {
      return NextResponse.json({ success: false, authenticated: false, message: "Unauthorized merchant session." }, { status: 401 });
    }

    const rows = await sql`
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
        status,
        kyc_status,
        kyc_rejection_reason,
        created_at,
        updated_at
      FROM sellers
      WHERE id = ${session.id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, authenticated: false, message: "Seller account not found in database." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      seller: rows[0],
    });
  } catch (err: any) {
    console.error("GET /api/seller/kyc error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to load seller KYC data." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = checkSellerAuth(req);
    if (!session || !session.id) {
      return NextResponse.json({ success: false, authenticated: false, message: "Unauthorized merchant session." }, { status: 401 });
    }

    const body = await req.json();
    const {
      gst_doc_url,
      pan_doc_url,
      aadhaar_doc_url,
      bank_doc_url,
      trade_license_url,
      store_logo_url,
      store_banner_url,
    } = body;

    const updated = await sql`
      UPDATE sellers
      SET
        gst_doc_url = COALESCE(${gst_doc_url}, gst_doc_url),
        pan_doc_url = COALESCE(${pan_doc_url}, pan_doc_url),
        aadhaar_doc_url = COALESCE(${aadhaar_doc_url}, aadhaar_doc_url),
        bank_doc_url = COALESCE(${bank_doc_url}, bank_doc_url),
        trade_license_url = COALESCE(${trade_license_url}, trade_license_url),
        store_logo_url = COALESCE(${store_logo_url}, store_logo_url),
        store_banner_url = COALESCE(${store_banner_url}, store_banner_url),
        kyc_status = 'Under Review',
        status = 'Pending Verification',
        kyc_rejection_reason = '',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${session.id}
      RETURNING id, owner_name, email, store_name, status, kyc_status, gst_doc_url, pan_doc_url, aadhaar_doc_url, bank_doc_url, trade_license_url, updated_at
    `;

    if (updated.length === 0) {
      return NextResponse.json({ success: false, message: "Seller not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "KYC documents submitted successfully. Verification status changed to Under Review.",
      seller: updated[0],
    });
  } catch (err: any) {
    console.error("POST /api/seller/kyc error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to submit KYC documents." },
      { status: 500 }
    );
  }
}

