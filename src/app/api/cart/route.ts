import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  getActiveCartUserId,
  getAvailableCartProduct,
  loadCustomerCart,
} from "@/lib/customer-cart";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Sign in to view and manage your cart." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

function serverError(message: string) {
  return NextResponse.json(
    { success: false, message },
    { status: 500, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getActiveCartUserId(req);
    if (!userId) return unauthorized();
    const items = await loadCustomerCart(userId);
    return NextResponse.json(
      { success: true, items },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return serverError("Could not load your cart. Please try again.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getActiveCartUserId(req);
    if (!userId) return unauthorized();

    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: "A valid cart item is required." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const productId = Number(input.productId);
    const quantity = input.quantity === undefined ? 1 : Number(input.quantity);
    const variantTitle = typeof input.variantTitle === "string" ? input.variantTitle.trim() : "";
    if (!Number.isSafeInteger(productId) || productId < 1 ||
        !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99 ||
        variantTitle.length > 200) {
      return NextResponse.json({ success: false, message: "The product, variant, or quantity is invalid." }, { status: 400 });
    }

    const available = await getAvailableCartProduct(productId, variantTitle);
    if (!available) {
      return NextResponse.json({ success: false, message: "This product is no longer available." }, { status: 404 });
    }
    if (available.invalidVariant) {
      return NextResponse.json({ success: false, message: "This product option is no longer available." }, { status: 409 });
    }
    if (available.stock < 1) {
      return NextResponse.json({ success: false, message: "This product is out of stock." }, { status: 409 });
    }

    const inserted = await sql`
      INSERT INTO customer_cart_items (user_id, product_id, variant_title, quantity)
      SELECT ${userId}, ${productId}, ${variantTitle}, ${quantity}
      WHERE ${quantity} <= LEAST(${available.stock}, 99)
      ON CONFLICT (user_id, product_id, variant_title)
      DO UPDATE SET
        quantity = customer_cart_items.quantity + EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP
      WHERE customer_cart_items.quantity + EXCLUDED.quantity <= LEAST(${available.stock}, 99)
      RETURNING id
    `;
    if (!inserted.length) {
      return NextResponse.json(
        { success: false, message: `Only ${Math.min(available.stock, 99)} item(s) are available.` },
        { status: 409 }
      );
    }

    const items = await loadCustomerCart(userId);
    return NextResponse.json(
      { success: true, items, message: "Added to your cart." },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return serverError("Could not add this product to your cart. Please try again.");
  }
}
