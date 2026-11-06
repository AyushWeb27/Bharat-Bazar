import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveBrandAdmin } from "@/lib/brands";

export const dynamic = "force-dynamic";

const ORDER_STATUSES = [
  "Pending",
  "Received",
  "Processed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
  "Cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

const STATUS_TO_DATABASE: Record<OrderStatus, string> = {
  Pending: "pending",
  Received: "received",
  Processed: "processed",
  Shipped: "shipped",
  "Out For Delivery": "out_for_delivery",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function displayStatus(value: unknown): OrderStatus | null {
  const status = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["pending", "placed"].includes(status)) return "Pending";
  if (["received", "confirmed"].includes(status)) return "Received";
  if (["processed", "processing"].includes(status)) return "Processed";
  if (["shipped", "in_transit"].includes(status)) return "Shipped";
  if (status === "out_for_delivery") return "Out For Delivery";
  if (["delivered", "completed"].includes(status)) return "Delivered";
  if (["cancelled", "canceled", "refunded"].includes(status)) return "Cancelled";
  return null;
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && ORDER_STATUSES.includes(value as OrderStatus);
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) {
      return errorResponse("Unauthorized. Please log in as an administrator.", 401);
    }

    const rows = await sql`
      SELECT
        o.order_number,
        o.status,
        o.subtotal,
        o.tax_amount,
        o.shipping_amount,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.created_at,
        o.updated_at,
        u.name AS customer_name,
        u.email AS customer_email,
        COALESCE(NULLIF(o.shipping_address ->> 'phone', ''), u.phone, '') AS customer_phone,
        COALESCE(NULLIF(o.shipping_address ->> 'city', ''), '') AS city,
        COALESCE(
          NULLIF(CONCAT_WS(', ',
            NULLIF(o.shipping_address ->> 'line1', ''),
            NULLIF(o.shipping_address ->> 'line2', ''),
            NULLIF(o.shipping_address ->> 'state', '')
          ), ''),
          ''
        ) AS address,
        COALESCE(o.shipping_address ->> 'postalCode', '') AS pincode,
        COUNT(oi.id)::INT AS item_count,
        COALESCE(
          JSON_AGG(oi.product_name ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) AS products,
        COALESCE((
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT('status', history.status, 'changedAt', history.changed_at)
            ORDER BY history.changed_at, history.id
          )
          FROM customer_order_status_history history
          WHERE history.order_id = o.id
        ), '[]'::json) AS status_history
      FROM customer_orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN customer_order_items oi ON oi.order_id = o.id
      GROUP BY o.id, u.id
      ORDER BY o.created_at DESC, o.id DESC
    `;

    const orders = rows.map(row => {
      const createdAt = row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at);
      const updatedAt = row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at);
      const address = row.address ? String(row.address) : "";
      const status = displayStatus(row.status);
      if (!status) throw new Error(`Unknown order status for ${String(row.order_number)}.`);
      const statusHistory = Array.isArray(row.status_history)
        ? row.status_history.map((event: { status?: unknown; changedAt?: unknown }) => {
            const eventStatus = displayStatus(event.status);
            if (!eventStatus) {
              throw new Error(`Unknown order status history for ${String(row.order_number)}.`);
            }
            return {
              status: eventStatus,
              changedAt: event.changedAt instanceof Date
                ? event.changedAt.toISOString()
                : String(event.changedAt || ""),
            };
          })
        : [];

      return {
        id: String(row.order_number),
        customer: String(row.customer_name || "Customer"),
        phone: String(row.customer_phone || ""),
        email: String(row.customer_email || ""),
        items: Number(row.item_count) || 0,
        subtotal: Number(row.subtotal) || 0,
        taxAmount: Number(row.tax_amount) || 0,
        shippingAmount: Number(row.shipping_amount) || 0,
        amount: Number(row.total_amount) || 0,
        paymentMethod: String(row.payment_method || ""),
        paymentStatus: String(row.payment_status || ""),
        status,
        city: String(row.city || ""),
        address,
        pincode: String(row.pincode || ""),
        createdAt,
        updatedAt,
        products: Array.isArray(row.products) ? row.products.map(String) : [],
        statusHistory,
      };
    });

    return NextResponse.json(
      { success: true, orders },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return errorResponse("Failed to load orders.", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminId = await requireActiveBrandAdmin(req);
    if (!adminId) {
      return errorResponse("Unauthorized. Please log in as an administrator.", 401);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid order update.", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse("Invalid order update.", 400);
    }

    const input = body as Record<string, unknown>;
    const orderNumber = typeof input.orderNumber === "string" ? input.orderNumber.trim() : "";
    if (!orderNumber || orderNumber.length > 40 || !isOrderStatus(input.status)) {
      return errorResponse("A valid order number and status are required.", 400);
    }

    const status = STATUS_TO_DATABASE[input.status];
    const rows = await sql`
      WITH target AS MATERIALIZED (
        SELECT id, order_number, status, updated_at
        FROM customer_orders
        WHERE order_number = ${orderNumber}
        FOR UPDATE
      ),
      updated AS (
        UPDATE customer_orders AS order_row
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
        FROM target
        WHERE order_row.id = target.id
          AND LOWER(order_row.status) IS DISTINCT FROM ${status}
        RETURNING order_row.id, order_row.order_number, order_row.status, order_row.updated_at
      ),
      event AS (
        INSERT INTO customer_order_status_history (order_id, status, changed_by_admin_id, changed_at)
        SELECT id, status, ${adminId}, updated_at
        FROM updated
        RETURNING order_id
      )
      SELECT
        COALESCE(updated.order_number, target.order_number) AS order_number,
        COALESCE(updated.status, target.status) AS status,
        COALESCE(updated.updated_at, target.updated_at) AS updated_at
      FROM target
      LEFT JOIN updated ON updated.id = target.id
      CROSS JOIN (SELECT COUNT(*) FROM event) AS event_result
    `;

    if (!rows.length) return errorResponse("Order not found.", 404);

    const changedAt = rows[0].updated_at instanceof Date
      ? rows[0].updated_at.toISOString()
      : String(rows[0].updated_at);

    return NextResponse.json(
      {
        success: true,
        order: {
          orderNumber: String(rows[0].order_number),
          status: displayStatus(rows[0].status),
          changedAt,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("PATCH /api/admin/orders error:", error);
    return errorResponse("Failed to update order status.", 500);
  }
}