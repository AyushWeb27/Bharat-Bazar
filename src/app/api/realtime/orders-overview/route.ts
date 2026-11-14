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
        status,
        COUNT(*)::INT AS count,
        COALESCE(SUM(total_amount), 0)::NUMERIC AS total_amount
      FROM customer_orders
      GROUP BY status`
    ),
  });
  return NextResponse.json({ success: true, sealedQuery });
}
