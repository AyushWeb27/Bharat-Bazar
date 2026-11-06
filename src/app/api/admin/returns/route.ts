import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveBrandAdmin } from "@/lib/brands";

export const dynamic = "force-dynamic";

const RETURN_STATUSES = ["requested", "approved", "rejected", "received", "refunded", "cancelled"] as const;
type ReturnStatus = (typeof RETURN_STATUSES)[number];

function failure(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) {
      return failure("Unauthorized. Please log in as an administrator.", 401);
    }

    const rows = await sql`
      SELECT
        r.id,
        r.order_id,
        r.status,
        r.reason,
        r.requested_at,
        r.updated_at,
        o.order_number,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        u.name AS customer_name,
        u.email AS customer_email,
        COALESCE(NULLIF(o.shipping_address ->> 'phone', ''), u.phone, '') AS customer_phone,
        order_items.items
      FROM customer_order_returns r
      JOIN customer_orders o ON o.id = r.order_id
      JOIN users u ON u.id = o.user_id
      LEFT JOIN LATERAL (
        SELECT COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'product', oi.product_name,
              'variant', oi.variant_title,
              'quantity', oi.quantity
            ) ORDER BY oi.id
          ),
          '[]'::json
        ) AS items
        FROM customer_order_items oi
        WHERE oi.order_id = o.id
      ) order_items ON TRUE
      ORDER BY
        CASE WHEN r.status = 'requested' THEN 0 ELSE 1 END,
        r.requested_at DESC,
        r.id DESC
    `;

    const returns = rows.map(row => ({
      id: Number(row.id),
      orderId: String(row.order_number),
      customer: String(row.customer_name || "Customer"),
      email: String(row.customer_email || ""),
      phone: String(row.customer_phone || ""),
      products: Array.isArray(row.items) ? row.items : [],
      amount: Number(row.total_amount) || 0,
      paymentMethod: String(row.payment_method || ""),
      paymentStatus: String(row.payment_status || ""),
      reason: String(row.reason || ""),
      status: String(row.status),
      requestedAt: row.requested_at instanceof Date
        ? row.requested_at.toISOString()
        : String(row.requested_at),
      updatedAt: row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : String(row.updated_at),
    }));

    return NextResponse.json(
      { success: true, returns },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/admin/returns error:", error);
    return failure("Failed to load return requests.", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminId = await requireActiveBrandAdmin(req);
    if (!adminId) return failure("Unauthorized. Please log in as an administrator.", 401);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return failure("Invalid return request update.", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return failure("Invalid return request update.", 400);
    }

    const input = body as Record<string, unknown>;
    const id = typeof input.id === "number" && Number.isInteger(input.id) ? input.id : 0;
    const status = typeof input.status === "string" ? input.status : "";
    if (id < 1 || !RETURN_STATUSES.includes(status as ReturnStatus)) {
      return failure("A valid return request ID and status are required.", 400);
    }

    const rows = await sql`
      UPDATE customer_order_returns
      SET status = ${status},
          updated_by_admin_id = ${adminId},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
        AND (
          (status = 'requested' AND ${status} IN ('approved', 'rejected', 'cancelled'))
          OR (status = 'approved' AND ${status} IN ('received', 'refunded', 'cancelled'))
          OR (status = 'received' AND ${status} = 'refunded')
        )
      RETURNING id, status, updated_at
    `;

    if (!rows.length) {
      const existing = await sql`SELECT id FROM customer_order_returns WHERE id = ${id} LIMIT 1`;
      if (!existing.length) return failure("Return request not found.", 404);
      return failure("This return request cannot be moved to that status.", 409);
    }

    return NextResponse.json(
      {
        success: true,
        returnRequest: {
          id: Number(rows[0].id),
          status: String(rows[0].status),
          updatedAt: rows[0].updated_at instanceof Date
            ? rows[0].updated_at.toISOString()
            : String(rows[0].updated_at),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("PATCH /api/admin/returns error:", error);
    return failure("Failed to update return request.", 500);
  }
}
