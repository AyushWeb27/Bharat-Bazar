import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getActiveCartUserId } from "@/lib/customer-cart";

export const dynamic = "force-dynamic";

type RouteContext = { params: { orderNumber: string } };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getActiveCartUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Sign in to view this order." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const orderNumber = params.orderNumber.trim();
    if (!/^BB\d{6}[A-F0-9]{8}$/.test(orderNumber)) {
      return NextResponse.json(
        { success: false, message: "This order could not be found." },
        { status: 404 }
      );
    }

    const orders = await sql`
      SELECT customer_orders.order_number, customer_orders.status, payment_method, payment_status,
             subtotal, tax_amount, shipping_amount, total_amount,
             shipping_address, created_at, customer_orders.updated_at,
             order_return.status AS return_status,
             order_return.requested_at AS return_requested_at,
             order_return.reason AS return_reason,
             COALESCE((
               SELECT JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'status', return_history.status,
                   'changedAt', return_history.changed_at
                 )
                 ORDER BY return_history.changed_at, return_history.id
               )
               FROM customer_order_return_status_history return_history
               WHERE return_history.return_id = order_return.id
             ), CASE
               WHEN order_return.id IS NULL THEN '[]'::json
               ELSE JSON_BUILD_ARRAY(
                 JSON_BUILD_OBJECT('status', order_return.status, 'changedAt', order_return.updated_at)
               )
             END) AS return_status_history,
             (
               LOWER(REPLACE(REPLACE(BTRIM(customer_orders.status), ' ', '_'), '-', '_'))
                 IN ('delivered', 'completed')
               AND order_return.id IS NULL
               AND COALESCE(delivery_event.delivered_at, customer_orders.updated_at)
                 >= CURRENT_TIMESTAMP - INTERVAL '7 days'
             ) AS return_eligible,
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
               WHERE history.order_id = customer_orders.id
             ), JSON_BUILD_ARRAY(
               JSON_BUILD_OBJECT(
                 'status', customer_orders.status,
                 'changedAt', customer_orders.updated_at
               )
             )) AS status_history
      FROM customer_orders
      LEFT JOIN customer_order_returns order_return ON order_return.order_id = customer_orders.id
      LEFT JOIN LATERAL (
        SELECT history.changed_at AS delivered_at
        FROM customer_order_status_history history
        WHERE history.order_id = customer_orders.id
          AND LOWER(REPLACE(REPLACE(BTRIM(history.status), ' ', '_'), '-', '_'))
            IN ('delivered', 'completed')
        ORDER BY history.changed_at DESC, history.id DESC
        LIMIT 1
      ) delivery_event ON TRUE
      WHERE customer_orders.order_number = ${orderNumber}
        AND customer_orders.user_id = ${userId}
      LIMIT 1
    `;
    if (!orders.length) {
      return NextResponse.json(
        { success: false, message: "This order could not be found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const items = await sql`
      SELECT product_name, variant_title, quantity, unit_price, line_total,
             product_snapshot
      FROM customer_order_items
      WHERE order_id = (
        SELECT id FROM customer_orders
        WHERE order_number = ${orderNumber} AND user_id = ${userId}
      )
      ORDER BY id
    `;
    return NextResponse.json(
      { success: true, order: orders[0], items },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/orders/[orderNumber] error:", error);
    return NextResponse.json(
      { success: false, message: "Could not load this order. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
