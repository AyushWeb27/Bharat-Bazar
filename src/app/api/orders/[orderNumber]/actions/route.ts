import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getActiveCartUserId } from "@/lib/customer-cart";

export const dynamic = "force-dynamic";

type RouteContext = { params: { orderNumber: string } };
type OrderAction = "cancel" | "return";

function failure(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getActiveCartUserId(req);
    if (!userId) return failure("Sign in to manage this order.", 401);

    const orderNumber = params.orderNumber.trim();
    if (!/^BB\d{6}[A-F0-9]{8}$/.test(orderNumber)) {
      return failure("This order could not be found.", 404);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return failure("Choose a valid order action.", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        !("action" in body) || !["cancel", "return"].includes(String(body.action))) {
      return failure("Choose a valid order action.", 400);
    }

    if (!("reason" in body) || typeof body.reason !== "string") {
      return failure("Please provide a reason for this request.", 400);
    }
    const reason = body.reason.trim();
    if (reason.length < 5 || reason.length > 500) {
      return failure("The reason must be between 5 and 500 characters.", 400);
    }

    const action = body.action as OrderAction;

    if (action === "cancel") {
      const rows = await sql`
        WITH target AS MATERIALIZED (
          SELECT id, order_number, status
          FROM customer_orders
          WHERE order_number = ${orderNumber} AND user_id = ${userId}
          FOR UPDATE
        ),
        updated AS (
          UPDATE customer_orders AS order_row
          SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
          FROM target
          WHERE order_row.id = target.id
            AND LOWER(REPLACE(REPLACE(BTRIM(target.status), ' ', '_'), '-', '_'))
              IN ('placed', 'pending', 'received', 'confirmed', 'processing', 'processed')
          RETURNING order_row.id, order_row.status, order_row.updated_at
        ),
        event AS (
          INSERT INTO customer_order_status_history (order_id, status, reason, changed_at)
          SELECT id, status, ${reason}, updated_at
          FROM updated
          RETURNING order_id
        )
        SELECT target.order_number, target.status AS previous_status,
               updated.status, updated.updated_at,
               EXISTS (SELECT 1 FROM event) AS status_changed
        FROM target
        LEFT JOIN updated ON updated.id = target.id
      `;

      if (!rows.length) return failure("This order could not be found.", 404);
      if (!rows[0].status_changed) {
        return failure("This order can only be cancelled before it is shipped.", 409);
      }

      const changedAt = rows[0].updated_at instanceof Date
        ? rows[0].updated_at.toISOString()
        : String(rows[0].updated_at);
      return NextResponse.json(
        {
          success: true,
          action,
          status: "cancelled",
          changedAt,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const rows = await sql`
      WITH target AS MATERIALIZED (
        SELECT
          o.id,
          o.order_number,
          o.status,
          COALESCE(delivery_event.delivered_at, o.updated_at) AS delivered_at
        FROM customer_orders o
        LEFT JOIN LATERAL (
          SELECT history.changed_at AS delivered_at
          FROM customer_order_status_history history
          WHERE history.order_id = o.id
            AND LOWER(REPLACE(REPLACE(BTRIM(history.status), ' ', '_'), '-', '_'))
              IN ('delivered', 'completed')
          ORDER BY history.changed_at DESC, history.id DESC
          LIMIT 1
        ) delivery_event ON TRUE
        WHERE o.order_number = ${orderNumber} AND o.user_id = ${userId}
        FOR UPDATE OF o
      ),
      inserted AS (
        INSERT INTO customer_order_returns (order_id, reason)
        SELECT id, ${reason}
        FROM target
        WHERE LOWER(REPLACE(REPLACE(BTRIM(target.status), ' ', '_'), '-', '_'))
            IN ('delivered', 'completed')
          AND target.delivered_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
        ON CONFLICT (order_id) DO NOTHING
        RETURNING order_id, status, requested_at
      )
      SELECT
        target.order_number,
        target.status AS order_status,
        target.delivered_at,
        COALESCE(inserted.status, existing.status) AS return_status,
        COALESCE(inserted.requested_at, existing.requested_at) AS requested_at,
        inserted.order_id IS NOT NULL AS created
      FROM target
      LEFT JOIN inserted ON inserted.order_id = target.id
      LEFT JOIN customer_order_returns existing ON existing.order_id = target.id
    `;

    if (!rows.length) return failure("This order could not be found.", 404);
    const orderStatus = String(rows[0].order_status).trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (!["delivered", "completed"].includes(orderStatus)) {
      return failure("A return can only be requested after the order is delivered.", 409);
    }
    if (!rows[0].created) {
      if (rows[0].return_status) {
        return failure("A return request has already been submitted for this order.", 409);
      }
      return failure("The 7-day return window for this order has ended.", 409);
    }

    const requestedAt = rows[0].requested_at instanceof Date
      ? rows[0].requested_at.toISOString()
      : String(rows[0].requested_at);
    return NextResponse.json(
      {
        success: true,
        action,
        returnStatus: String(rows[0].return_status),
        requestedAt,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("POST /api/orders/[orderNumber]/actions error:", error);
    return failure("Could not update this order. Please try again.", 500);
  }
}
