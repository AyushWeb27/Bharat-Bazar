import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveBrandAdmin } from "@/lib/brands";

export const dynamic = "force-dynamic";

function failure(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function normalizedStatus(value: unknown) {
  const status = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["pending", "placed"].includes(status)) return "Pending";
  if (["received", "confirmed"].includes(status)) return "Received";
  if (["processed", "processing"].includes(status)) return "Processed";
  if (["shipped", "in_transit"].includes(status)) return "Shipped";
  if (status === "out_for_delivery") return "Out For Delivery";
  if (["delivered", "completed"].includes(status)) return "Delivered";
  if (["cancelled", "canceled", "refunded"].includes(status)) return "Cancelled";
  return "Other";
}

function isoDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid order date returned by database.");
  return date.toISOString();
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) {
      return failure("Unauthorized. Please log in as an administrator.", 401);
    }

    const [statusRows, recentRows, dailyRows, returnRows] = await Promise.all([
      sql`
        SELECT status, COUNT(*)::INT AS count
        FROM customer_orders
        GROUP BY status
      `,
      sql`
        SELECT
          o.order_number,
          o.status,
          o.total_amount,
          o.created_at,
          u.name AS customer_name,
          COALESCE(items.item_count, 0)::INT AS item_count
        FROM customer_orders o
        JOIN users u ON u.id = o.user_id
        LEFT JOIN LATERAL (
          SELECT COUNT(*)::INT AS item_count
          FROM customer_order_items oi
          WHERE oi.order_id = o.id
        ) items ON TRUE
        ORDER BY o.created_at DESC, o.id DESC
        LIMIT 12
      `,
      sql`
        WITH days AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '13 days',
            CURRENT_DATE,
            INTERVAL '1 day'
          )::date AS report_date
        )
        SELECT
          days.report_date,
          COALESCE(SUM(o.total_amount) FILTER (
            WHERE LOWER(REPLACE(REPLACE(BTRIM(o.status), ' ', '_'), '-', '_'))
              NOT IN ('cancelled', 'canceled', 'refunded')
          ), 0) AS order_value
        FROM days
        LEFT JOIN customer_orders o
          ON o.created_at >= days.report_date
          AND o.created_at < days.report_date + INTERVAL '1 day'
        GROUP BY days.report_date
        ORDER BY days.report_date
      `,
      sql`
        SELECT COUNT(*)::INT AS count
        FROM customer_order_returns
        WHERE status = 'requested'
      `,
    ]);

    const statusCounts = new Map<string, number>();
    for (const row of statusRows) {
      const status = normalizedStatus(row.status);
      statusCounts.set(status, (statusCounts.get(status) ?? 0) + Number(row.count || 0));
    }
    const distribution = [
      "Pending", "Received", "Processed", "Shipped", "Out For Delivery",
      "Delivered", "Cancelled", "Other",
    ].map(name => ({ name, value: statusCounts.get(name) ?? 0 }));
    const totalOrders = distribution.reduce((total, item) => total + item.value, 0);

    const recentOrders = recentRows.map(row => ({
      id: String(row.order_number),
      customer: String(row.customer_name || "Customer"),
      amount: Number(row.total_amount) || 0,
      items: Number(row.item_count) || 0,
      status: normalizedStatus(row.status),
      createdAt: isoDate(row.created_at),
    }));

    const dailyOrderValue = dailyRows.map(row => {
      const date = isoDate(row.report_date);
      return {
        date,
        label: new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value: Number(row.order_value) || 0,
      };
    });

    return NextResponse.json(
      {
        success: true,
        overview: {
          metrics: {
            total: totalOrders,
            pending: statusCounts.get("Pending") ?? 0,
            processing: (statusCounts.get("Received") ?? 0) + (statusCounts.get("Processed") ?? 0),
            shipped: (statusCounts.get("Shipped") ?? 0) + (statusCounts.get("Out For Delivery") ?? 0),
            delivered: statusCounts.get("Delivered") ?? 0,
            cancelled: statusCounts.get("Cancelled") ?? 0,
            requestedReturns: Number(returnRows[0]?.count) || 0,
          },
          statusDistribution: distribution.filter(item => item.value > 0),
          recentOrders,
          dailyOrderValue,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/admin/orders/overview error:", error);
    return failure("Failed to load the orders overview.", 500);
  }
}
