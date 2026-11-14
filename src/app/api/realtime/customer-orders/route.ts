import { NextRequest, NextResponse } from "next/server";
import { getActiveCartUserId } from "@/lib/customer-cart";
import { realtime, rawSql } from "@/lib/realtime-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = await getActiveCartUserId(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Sign in to view your orders." },
      { status: 401 }
    );
  }

  const sealedQuery = await realtime.seal({
    query: rawSql(
      `SELECT
        o.id,
        o.order_number,
        o.status,
        o.total_amount::NUMERIC,
        o.created_at,
        o.updated_at
      FROM customer_orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT 100`,
      [userId]
    ),
  });
  return NextResponse.json({ success: true, sealedQuery });
}
