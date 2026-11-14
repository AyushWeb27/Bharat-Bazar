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
        o.order_number,
        o.status,
        o.total_amount::NUMERIC,
        o.created_at,
        o.updated_at,
        u.name AS customer_name
      FROM customer_orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT 100`
    ),
  });
  return NextResponse.json({ success: true, sealedQuery });
}
