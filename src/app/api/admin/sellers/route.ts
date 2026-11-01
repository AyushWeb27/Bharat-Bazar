import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function GET(req: NextRequest) {
  try {
    const admin = checkAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const status = searchParams.get("status") || "All";
    const kycStatus = searchParams.get("kyc_status") || "All";

    const allSellers = await sql`
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
      ORDER BY id DESC
    `;

    // Filter in-memory if search or status specified
    let filtered = allSellers;

    if (search) {
      filtered = filtered.filter((s: any) =>
        (s.store_name && s.store_name.toLowerCase().includes(search)) ||
        (s.owner_name && s.owner_name.toLowerCase().includes(search)) ||
        (s.email && s.email.toLowerCase().includes(search)) ||
        (s.business_name && s.business_name.toLowerCase().includes(search)) ||
        (s.gstin && s.gstin.toLowerCase().includes(search)) ||
        (s.city && s.city.toLowerCase().includes(search)) ||
        (s.business_category && s.business_category.toLowerCase().includes(search))
      );
    }

    if (status !== "All") {
      filtered = filtered.filter((s: any) =>
        s.status && s.status.toLowerCase().includes(status.toLowerCase())
      );
    }

    if (kycStatus !== "All") {
      filtered = filtered.filter((s: any) =>
        s.kyc_status && s.kyc_status.toLowerCase() === kycStatus.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      sellers: filtered,
      total: filtered.length,
      allTotal: allSellers.length,
    });
  } catch (err: any) {
    console.error("GET /api/admin/sellers error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch sellers from Neon database." },
      { status: 500 }
    );
  }
}
