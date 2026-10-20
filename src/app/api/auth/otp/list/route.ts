import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get("identifier");
    const type = searchParams.get("type");
    const limitParam = parseInt(searchParams.get("limit") || "50", 10);
    const limit = Math.min(Math.max(limitParam, 1), 100);

    let rows;

    if (identifier && type) {
      rows = await sql`
        SELECT 
          id, 
          identifier, 
          type, 
          otp_code, 
          expires_at, 
          verified, 
          attempts, 
          ip_address, 
          created_at,
          CASE 
            WHEN verified THEN 'verified'
            WHEN expires_at < CURRENT_TIMESTAMP THEN 'expired'
            ELSE 'active'
          END as status
        FROM otps
        WHERE identifier = ${identifier} AND type = ${type}
        ORDER BY id DESC
        LIMIT ${limit};
      `;
    } else if (identifier) {
      rows = await sql`
        SELECT 
          id, 
          identifier, 
          type, 
          otp_code, 
          expires_at, 
          verified, 
          attempts, 
          ip_address, 
          created_at,
          CASE 
            WHEN verified THEN 'verified'
            WHEN expires_at < CURRENT_TIMESTAMP THEN 'expired'
            ELSE 'active'
          END as status
        FROM otps
        WHERE identifier = ${identifier}
        ORDER BY id DESC
        LIMIT ${limit};
      `;
    } else if (type) {
      rows = await sql`
        SELECT 
          id, 
          identifier, 
          type, 
          otp_code, 
          expires_at, 
          verified, 
          attempts, 
          ip_address, 
          created_at,
          CASE 
            WHEN verified THEN 'verified'
            WHEN expires_at < CURRENT_TIMESTAMP THEN 'expired'
            ELSE 'active'
          END as status
        FROM otps
        WHERE type = ${type}
        ORDER BY id DESC
        LIMIT ${limit};
      `;
    } else {
      rows = await sql`
        SELECT 
          id, 
          identifier, 
          type, 
          otp_code, 
          expires_at, 
          verified, 
          attempts, 
          ip_address, 
          created_at,
          CASE 
            WHEN verified THEN 'verified'
            WHEN expires_at < CURRENT_TIMESTAMP THEN 'expired'
            ELSE 'active'
          END as status
        FROM otps
        ORDER BY id DESC
        LIMIT ${limit};
      `;
    }

    return NextResponse.json({
      success: true,
      total: rows.length,
      otps: rows,
    });
  } catch (error: any) {
    console.error("Error fetching OTPs list:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch OTPs from database." },
      { status: 500 }
    );
  }
}
