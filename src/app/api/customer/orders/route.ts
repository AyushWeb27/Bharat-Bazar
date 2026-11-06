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
             order_items.item_count,
             order_items.items,
             COALESCE((
               SELECT JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'status', history.status,
                   'changedAt', history.changed_at,
                   'reason', history.reason
                 )
                 ORDER BY history.changed_at, history.id
               )
               FROM customer_order_status_history history
               WHERE history.order_id = o.id
             ), '[]'::json) AS status_history,
             order_return.status AS return_status,
             order_return.requested_at AS return_requested_at,
             order_return.reason AS return_reason,
             (
               LOWER(REPLACE(REPLACE(BTRIM(o.status), ' ', '_'), '-', '_'))
                 IN ('delivered', 'completed')
               AND order_return.id IS NULL
               AND COALESCE(delivery_event.delivered_at, o.updated_at)
                 >= CURRENT_TIMESTAMP - INTERVAL '7 days'
             ) AS return_eligible
      FROM customer_orders o
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*)::INT AS item_count,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'productId', oi.product_id,
                'productName', oi.product_name,
                'variantTitle', oi.variant_title,
                'quantity', oi.quantity,
                'lineTotal', oi.line_total,
                'image', oi.product_snapshot ->> 'image',
                'reviewStatus', product_review.status
              ) ORDER BY oi.id
            ),
            '[]'::json
          ) AS items
        FROM customer_order_items oi
        LEFT JOIN customer_product_reviews product_review
          ON product_review.product_id = oi.product_id
          AND product_review.user_id = o.user_id
        WHERE oi.order_id = o.id
      ) order_items ON TRUE
      LEFT JOIN customer_order_returns order_return ON order_return.order_id = o.id
      LEFT JOIN LATERAL (
        SELECT history.changed_at AS delivered_at
        FROM customer_order_status_history history
        WHERE history.order_id = o.id
          AND LOWER(REPLACE(REPLACE(BTRIM(history.status), ' ', '_'), '-', '_'))
            IN ('delivered', 'completed')
        ORDER BY history.changed_at DESC, history.id DESC
        LIMIT 1
      ) delivery_event ON TRUE
      WHERE o.user_id = ${userId}
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
