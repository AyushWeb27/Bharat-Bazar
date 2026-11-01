import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

function checkAdminAuth(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = checkAdminAuth(req);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const sellerId = parseInt(params.id, 10);
    if (isNaN(sellerId)) {
      return NextResponse.json({ success: false, message: "Invalid seller ID." }, { status: 400 });
    }

    const body = await req.json();
    const {
      status,
      kyc_status,
      commission_rate,
      featured,
      owner_name,
      city,
      business_category,
    } = body;

    const updated = await sql`
      UPDATE sellers
      SET
        status = COALESCE(${status}, status),
        kyc_status = COALESCE(${kyc_status}, kyc_status),
        commission_rate = COALESCE(${commission_rate}, commission_rate),
        featured = COALESCE(${featured}, featured),
        owner_name = COALESCE(${owner_name}, owner_name),
        city = COALESCE(${city}, city),
        business_category = COALESCE(${business_category}, business_category),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sellerId}
      RETURNING id, owner_name, email, store_name, city, business_category, status, kyc_status, commission_rate, featured, updated_at
    `;

    if (updated.length === 0) {
      return NextResponse.json({ success: false, message: "Seller not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Seller updated successfully in Neon database.",
      seller: updated[0],
    });
  } catch (err: any) {
    console.error("PATCH /api/admin/sellers/[id]/status error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to update seller status." },
      { status: 500 }
    );
  }
}
