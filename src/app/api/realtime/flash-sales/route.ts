import { NextRequest, NextResponse } from "next/server";
import { requireActiveBrandAdmin } from "@/lib/brands";
import { realtime, rawSql } from "@/lib/realtime-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await requireActiveBrandAdmin(req))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const sealedQuery = await realtime.seal({
    query: rawSql(
      `SELECT
        fs.id,
        fs.name,
        fs.discount_type,
        fs.discount_value::NUMERIC,
        fs.start_at,
        fs.end_at,
        fs.is_active
      FROM admin_flash_sales fs
      ORDER BY fs.start_at DESC`
    ),
  });
  return NextResponse.json({ success: true, sealedQuery });
}
