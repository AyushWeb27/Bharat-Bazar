import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  getActiveCartUserId,
  getAvailableCartProduct,
  loadCustomerCart,
} from "@/lib/customer-cart";

export const dynamic = "force-dynamic";

type RouteContext = { params: { itemId: string } };

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Sign in to view and manage your cart." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getActiveCartUserId(req);
    if (!userId) return unauthorized();

    const itemId = Number(params.itemId);
    if (!Number.isSafeInteger(itemId) || itemId < 1) {
      return NextResponse.json({ success: false, message: "A valid cart item is required." }, { status: 400 });
    }

    const body: unknown = await req.json();
    const quantity = body && typeof body === "object" && !Array.isArray(body)
      ? Number((body as Record<string, unknown>).quantity)
      : Number.NaN;
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      return NextResponse.json({ success: false, message: "Quantity must be between 1 and 99." }, { status: 400 });
    }

    const lines = await sql`
      SELECT product_id, variant_title
      FROM customer_cart_items
      WHERE id = ${itemId} AND user_id = ${userId}
      LIMIT 1
    `;
    if (!lines.length) {
      return NextResponse.json({ success: false, message: "Cart item not found." }, { status: 404 });
    }

    const available = await getAvailableCartProduct(
      Number(lines[0].product_id),
      String(lines[0].variant_title || "")
    );
    if (!available || available.invalidVariant || quantity > available.stock) {
      return NextResponse.json(
        { success: false, message: `Only ${Math.max(available?.stock ?? 0, 0)} item(s) are available.` },
        { status: 409 }
      );
    }

    const updated = await sql`
      UPDATE customer_cart_items
      SET quantity = ${quantity}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${itemId} AND user_id = ${userId}
      RETURNING id
    `;
    if (!updated.length) {
      return NextResponse.json({ success: false, message: "Cart item not found." }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, items: await loadCustomerCart(userId) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("PATCH /api/cart/[itemId] error:", error);
    return NextResponse.json(
      { success: false, message: "Could not update your cart. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getActiveCartUserId(req);
    if (!userId) return unauthorized();

    const itemId = Number(params.itemId);
    if (!Number.isSafeInteger(itemId) || itemId < 1) {
      return NextResponse.json({ success: false, message: "A valid cart item is required." }, { status: 400 });
    }

    const deleted = await sql`
      DELETE FROM customer_cart_items
      WHERE id = ${itemId} AND user_id = ${userId}
      RETURNING id
    `;
    if (!deleted.length) {
      return NextResponse.json({ success: false, message: "Cart item not found." }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, items: await loadCustomerCart(userId) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("DELETE /api/cart/[itemId] error:", error);
    return NextResponse.json(
      { success: false, message: "Could not remove this cart item. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
