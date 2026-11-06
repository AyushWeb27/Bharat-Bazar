import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  getActiveCartUserId,
  loadCustomerCart,
  loadOrderProduct,
} from "@/lib/customer-cart";
import { calculateCouponDiscount, type CouponType } from "@/lib/coupons";
import type { CartItem } from "@/app/components/types";

export const dynamic = "force-dynamic";

type ShippingAddress = {
  recipient: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: "India";
};

type OrderLine = {
  productId: number;
  variantTitle: string;
  quantity: number;
  product: CartItem["product"];
};

function failure(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getAddress(value: unknown): ShippingAddress | null {
  if (!isRecord(value)) return null;
  const fields = ["recipient", "phone", "line1", "line2", "city", "state", "postalCode"];
  if (fields.some(field => typeof value[field] !== "string")) return null;

  const address = {
    recipient: String(value.recipient).trim(),
    phone: String(value.phone).trim(),
    line1: String(value.line1).trim(),
    line2: String(value.line2).trim(),
    city: String(value.city).trim(),
    state: String(value.state).trim(),
    postalCode: String(value.postalCode).trim(),
    country: "India" as const,
  };
  if (address.recipient.length < 2 || address.recipient.length > 100 ||
      !/^[6-9]\d{9}$/.test(address.phone) ||
      address.line1.length < 3 || address.line1.length > 200 ||
      address.line2.length > 200 ||
      address.city.length < 2 || address.city.length > 100 ||
      address.state.length < 2 || address.state.length > 100 ||
      !/^\d{6}$/.test(address.postalCode)) {
    return null;
  }
  return address;
}

function parseProductRequest(url: URL) {
  const productId = Number(url.searchParams.get("productId"));
  const quantity = Number(url.searchParams.get("quantity") || "1");
  const variantTitle = url.searchParams.get("variantTitle")?.trim() || "";
  if (!Number.isSafeInteger(productId) || productId < 1 ||
      !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99 ||
      variantTitle.length > 200) return null;
  return { productId, quantity, variantTitle };
}

function getTotals(lines: OrderLine[]) {
  const subtotal = lines.reduce(
    (sum, line) => sum + Math.round(line.product.price * line.quantity * 100) / 100,
    0
  );
  const taxAmount = Math.round(subtotal * 0.18);
  const shippingAmount = subtotal > 499 ? 0 : 49;
  return { subtotal, taxAmount, shippingAmount, total: subtotal + taxAmount + shippingAmount };
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getActiveCartUserId(req);
    if (!userId) return failure("Sign in to continue to checkout.", 401);

    const request = parseProductRequest(new URL(req.url));
    if (!request) return failure("The product, variant, or quantity is invalid.", 400);
    const product = await loadOrderProduct(request.productId, request.variantTitle);
    if (!product) return failure("This product or option is no longer available.", 404);
    if (!product.inStock || request.quantity > (product.stock ?? 0)) {
      return failure("The requested quantity is not available.", 409);
    }

    return NextResponse.json(
      { success: true, item: { id: product.id, quantity: request.quantity, product } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/orders checkout preview error:", error);
    return failure("Could not load checkout details. Please try again.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getActiveCartUserId(req);
    if (!userId) return failure("Sign in to place your order.", 401);

    const body: unknown = await req.json();
    if (!isRecord(body)) return failure("A valid order is required.", 400);
    if (body.paymentMethod !== "cod") {
      return failure("Only Cash on Delivery is currently available.", 400);
    }
    const address = getAddress(body.address);
    if (!address) return failure("Enter a valid delivery address to continue.", 400);

    let lines: OrderLine[];
    let fromCart = body.source === "cart";
    if (fromCart) {
      const cart = await loadCustomerCart(userId);
      if (!cart.length) return failure("Your cart is empty.", 409);
      lines = cart.map(item => ({
        productId: item.product.id,
        variantTitle: item.product.selectedSize || "",
        quantity: item.quantity,
        product: item.product,
      }));
    } else if (body.source === "direct") {
      const productId = Number(body.productId);
      const quantity = Number(body.quantity);
      const variantTitle = typeof body.variantTitle === "string" ? body.variantTitle.trim() : "";
      if (!Number.isSafeInteger(productId) || productId < 1 ||
          !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99 ||
          variantTitle.length > 200) {
        return failure("The product, variant, or quantity is invalid.", 400);
      }
      const product = await loadOrderProduct(productId, variantTitle);
      if (!product) return failure("This product or option is no longer available.", 404);
      lines = [{ productId, variantTitle, quantity, product }];
    } else {
      return failure("The checkout source is invalid.", 400);
    }

    if (lines.some(line => !line.product.inStock || line.quantity > (line.product.stock ?? 0))) {
      return failure("One or more items no longer have enough stock. Refresh checkout and try again.", 409);
    }
    if (lines.some(line => !line.product.cod)) {
      return failure("Cash on Delivery is not available for one or more items in this order.", 409);
    }

    const totals = getTotals(lines);
    const couponCode = body.couponCode;
    let coupon: {
      id: number;
      code: string;
      type: CouponType;
      value: number;
      minOrder: number;
      maxDiscount: number;
      usedCount: number;
      usageLimit: number;
      expiresAt: string | null;
      discount: number;
    } | null = null;
    if (couponCode !== undefined) {
      if (typeof couponCode !== "string" || !/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(couponCode)) {
        return failure("Enter a valid coupon code.", 400);
      }
      const couponRows = await sql`
        SELECT id, code, discount_type, discount_value, min_order_amount,
               max_discount_amount, expires_at, used_count, usage_limit
        FROM admin_coupons
        WHERE code = ${couponCode}
          AND is_active = TRUE
          AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
          AND (usage_limit = 0 OR used_count < usage_limit)
        LIMIT 1
      `;
      if (!couponRows.length) {
        return failure("This coupon is invalid, expired, inactive, or fully redeemed.", 400);
      }
      const row = couponRows[0];
      const previousRedemption = await sql`
        SELECT id
        FROM customer_coupon_redemptions
        WHERE coupon_id = ${row.id} AND user_id = ${userId}
        LIMIT 1
      `;
      if (previousRedemption.length) {
        return failure("You have already used this coupon. Each coupon can be used once per customer.", 409);
      }
      const minOrder = Number(row.min_order_amount);
      if (totals.subtotal < minOrder) {
        return failure(`This coupon requires a minimum order of ₹${minOrder.toLocaleString("en-IN")}.`, 400);
      }
      const type = String(row.discount_type) as CouponType;
      const value = Number(row.discount_value);
      const maxDiscount = Number(row.max_discount_amount);
      const expiresAt = row.expires_at
        ? new Date(String(row.expires_at)).toISOString()
        : null;
      const discount = calculateCouponDiscount(type, value, maxDiscount, totals.subtotal);
      if (discount <= 0) return failure("This coupon does not apply to the current order.", 400);
      coupon = {
        id: Number(row.id),
        code: String(row.code),
        type,
        value,
        minOrder,
        maxDiscount,
        usedCount: Number(row.used_count),
        usageLimit: Number(row.usage_limit),
        expiresAt,
        discount,
      };
    }

    const finalTotal = totals.total - (coupon?.discount || 0);
    const dateStamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const orderNumber = `BB${dateStamp}${randomBytes(4).toString("hex").toUpperCase()}`;
    const insertOrder = coupon
      ? sql`
          WITH claimed_coupon AS (
            UPDATE admin_coupons
            SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${coupon.id}
              AND code = ${coupon.code}
              AND discount_type = ${coupon.type}
              AND discount_value = ${coupon.value}
              AND min_order_amount = ${coupon.minOrder}
              AND max_discount_amount = ${coupon.maxDiscount}
              AND expires_at IS NOT DISTINCT FROM ${coupon.expiresAt}::TIMESTAMP WITH TIME ZONE
              AND is_active = TRUE
              AND (usage_limit = 0 OR used_count < usage_limit)
              AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
              AND min_order_amount <= ${totals.subtotal}
              AND NOT EXISTS (
                SELECT 1
                FROM customer_coupon_redemptions
                WHERE coupon_id = ${coupon.id} AND user_id = ${userId}
              )
            RETURNING id
          ),
          created_order AS (
            INSERT INTO customer_orders (
              order_number, user_id, status, payment_method, payment_status,
              subtotal, tax_amount, shipping_amount, total_amount, shipping_address,
              coupon_id, coupon_code, coupon_discount
            )
            SELECT
              ${orderNumber}, ${userId}, 'placed', 'cod', 'pending',
              ${totals.subtotal}, ${totals.taxAmount}, ${totals.shippingAmount},
              ${finalTotal}, ${JSON.stringify(address)}::jsonb,
              claimed_coupon.id, ${coupon.code}, ${coupon.discount}
            FROM claimed_coupon
            RETURNING id, order_number, coupon_id
          ),
          recorded_redemption AS (
            INSERT INTO customer_coupon_redemptions (coupon_id, user_id, order_id)
            SELECT created_order.coupon_id, ${userId}, created_order.id
            FROM created_order
            RETURNING order_id
          )
          SELECT created_order.id, created_order.order_number
          FROM created_order
          JOIN recorded_redemption ON recorded_redemption.order_id = created_order.id
        `
      : sql`
          INSERT INTO customer_orders (
            order_number, user_id, status, payment_method, payment_status,
            subtotal, tax_amount, shipping_amount, total_amount, shipping_address
          )
          VALUES (
            ${orderNumber}, ${userId}, 'placed', 'cod', 'pending',
            ${totals.subtotal}, ${totals.taxAmount}, ${totals.shippingAmount},
            ${finalTotal}, ${JSON.stringify(address)}::jsonb
          )
          RETURNING id, order_number
        `;
    const reserveQueries = lines.map(line => sql`
      SELECT reserve_customer_product_stock(
        ${line.productId},
        ${line.variantTitle},
        ${line.quantity}
      )
      WHERE EXISTS (
        SELECT 1 FROM customer_orders WHERE order_number = ${orderNumber}
      )
    `);
    const insertLines = lines.map(line => sql`
      INSERT INTO customer_order_items (
        order_id, product_id, product_name, variant_title, sku,
        quantity, unit_price, line_total, product_snapshot
      )
      SELECT id, ${line.productId}, ${line.product.name}, ${line.variantTitle},
             ${line.product.sku || ""}, ${line.quantity}, ${line.product.price},
             ${Math.round(line.product.price * line.quantity * 100) / 100},
             ${JSON.stringify({
               name: line.product.name,
               brand: line.product.brand,
               image: line.product.img,
               category: line.product.cat,
               variantTitle: line.variantTitle,
             })}::jsonb
      FROM customer_orders
      WHERE order_number = ${orderNumber}
    `);
    const insertInitialStatus = sql`
      INSERT INTO customer_order_status_history (order_id, status, changed_at)
      SELECT id, 'pending', created_at
      FROM customer_orders
      WHERE order_number = ${orderNumber}
    `;
    const clearCart = fromCart
      ? [sql`
          DELETE FROM customer_cart_items
          WHERE user_id = ${userId}
            AND EXISTS (SELECT 1 FROM customer_orders WHERE order_number = ${orderNumber})
        `]
      : [];
    const results = await sql.transaction([
      insertOrder,
      ...reserveQueries,
      ...insertLines,
      insertInitialStatus,
      ...clearCart,
    ]);
    const orderRows = results[0] as Array<{ id: number; order_number: string }>;
    const order = orderRows[0];
    if (!order && coupon) {
      return failure("This coupon is no longer available. Refresh checkout and try again.", 409);
    }
    if (!order) throw new Error("Order transaction completed without returning an order.");

    return NextResponse.json(
      { success: true, orderNumber: order.order_number, total: finalTotal },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (isRecord(error) && error.code === "P0001") {
      return failure("Stock changed while placing your order. Refresh checkout and try again.", 409);
    }
    if (isRecord(error) && error.code === "23505" &&
        error.constraint === "customer_coupon_redemptions_coupon_id_user_id_key") {
      return failure("You have already used this coupon. Each coupon can be used once per customer.", 409);
    }
    console.error("POST /api/orders error:", error);
    return failure("Could not place your order. Please try again.", 500);
  }
}
