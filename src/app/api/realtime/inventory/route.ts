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
        id,
        name,
        stock::INT,
        low_stock_alert::INT,
        status,
        category
      FROM admin_products
      WHERE status = 'active'
      ORDER BY stock ASC, name ASC
      LIMIT 50`
    ),
  });
  return NextResponse.json({ success: true, sealedQuery });
}
