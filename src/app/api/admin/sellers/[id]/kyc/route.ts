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
    const { action, reason, requestedDocs } = body;

    let targetKycStatus = "Pending";
    let targetSellerStatus = "Pending Verification";
    let rejectionReason = "";

    if (action === "approve") {
      targetKycStatus = "Approved";
      targetSellerStatus = "Active";
      rejectionReason = "";
    } else if (action === "reject") {
      targetKycStatus = "Rejected";
      targetSellerStatus = "Pending Verification";
      rejectionReason = String(reason || "KYC documents do not meet verification criteria.").trim();
    } else if (action === "request_docs") {
      targetKycStatus = "Under Review";
      targetSellerStatus = "Pending Verification";
      const docsList = Array.isArray(requestedDocs) && requestedDocs.length > 0
        ? requestedDocs.join(", ")
        : "Additional verification proofs required";
      rejectionReason = `Action required: Please re-upload the following documents: ${docsList}`;
    } else {
      return NextResponse.json({ success: false, message: "Invalid action. Expected approve, reject, or request_docs." }, { status: 400 });
    }

    const updated = await sql`
      UPDATE sellers
      SET
        kyc_status = ${targetKycStatus},
        status = ${targetSellerStatus},
        kyc_rejection_reason = ${rejectionReason},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sellerId}
      RETURNING id, owner_name, email, store_name, status, kyc_status, kyc_rejection_reason, updated_at
    `;

    if (updated.length === 0) {
      return NextResponse.json({ success: false, message: "Seller not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Seller KYC ${targetKycStatus.toLowerCase()} successfully in Neon database.`,
      seller: updated[0],
    });
  } catch (err: any) {
    console.error("PATCH /api/admin/sellers/[id]/kyc error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to update KYC status." },
      { status: 500 }
    );
  }
}

