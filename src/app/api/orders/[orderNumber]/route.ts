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
      SELECT order_number, status, payment_method, payment_status,
             subtotal, tax_amount, shipping_amount, total_amount,
             shipping_address, created_at
      FROM customer_orders
      WHERE order_number = ${orderNumber} AND user_id = ${userId}
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
