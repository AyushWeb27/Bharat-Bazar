import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getActiveCartUserId } from "@/lib/customer-cart";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = await getActiveCartUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Sign in to view your orders." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const rows = await sql`
      SELECT o.id, o.order_number, o.status, o.payment_method, o.payment_status,
             o.subtotal, o.tax_amount, o.shipping_amount, o.total_amount,
             o.created_at,
             COUNT(oi.id)::INT AS item_count,
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'productName', oi.product_name,
                   'variantTitle', oi.variant_title,
                   'quantity', oi.quantity,
                   'lineTotal', oi.line_total,
                   'image', oi.product_snapshot ->> 'image'
                 ) ORDER BY oi.id
               ) FILTER (WHERE oi.id IS NOT NULL),
               '[]'::json
             ) AS items
      FROM customer_orders o
      LEFT JOIN customer_order_items oi ON oi.order_id = o.id
      WHERE o.user_id = ${userId}
      GROUP BY o.id
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT 100
    `;

    return NextResponse.json(
      { success: true, orders: rows },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/customer/orders error:", error);
    return NextResponse.json(
      { success: false, message: "Could not load your orders. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
