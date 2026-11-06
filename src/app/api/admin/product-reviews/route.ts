import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveBrandAdmin } from "@/lib/brands";

export const dynamic = "force-dynamic";
const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;

function failure(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function isoDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid product review date.");
  return date.toISOString();
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) {
      return failure("Unauthorized. Please log in as an administrator.", 401);
    }

    const rows = await sql`
      SELECT review.id, review.product_id, product.name AS product_name,
             product.category, review.rating, review.title, review.body,
             review.status, review.admin_reply, review.created_at,
             customer.name AS reviewer_name,
             COALESCE(order_row.shipping_address ->> 'city', '') AS reviewer_city
      FROM customer_product_reviews review
      JOIN admin_products product ON product.id = review.product_id
      JOIN users customer ON customer.id = review.user_id
      JOIN customer_orders order_row ON order_row.id = review.order_id
      ORDER BY
        CASE WHEN review.status = 'pending' THEN 0 ELSE 1 END,
        review.created_at DESC,
        review.id DESC
    `;

    return NextResponse.json(
      {
        success: true,
        reviews: rows.map(row => {
          const reviewerName = String(row.reviewer_name || "Customer");
          return {
            id: Number(row.id),
            productId: Number(row.product_id),
            productName: String(row.product_name),
            category: String(row.category || ""),
            reviewer: {
              name: reviewerName,
              avatar: reviewerName.split(/\s+/).map(part => part[0] ?? "").join("").slice(0, 2).toUpperCase(),
              city: String(row.reviewer_city || ""),
              hasPurchased: true,
            },
            rating: Number(row.rating),
            title: String(row.title),
            body: String(row.body),
            date: isoDate(row.created_at),
            status: String(row.status),
            helpful: 0,
            images: 0,
            reply: typeof row.admin_reply === "string" ? row.admin_reply : null,
          };
        }),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/admin/product-reviews error:", error);
    return failure("Failed to load product reviews.", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminId = await requireActiveBrandAdmin(req);
    if (!adminId) {
      return failure("Unauthorized. Please log in as an administrator.", 401);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return failure("Invalid product review update.", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return failure("Invalid product review update.", 400);
    }

    const input = body as Record<string, unknown>;
    const id = typeof input.id === "number" && Number.isSafeInteger(input.id) ? input.id : 0;
    const status = input.status;
    const hasReply = Object.prototype.hasOwnProperty.call(input, "reply");
    const reply = input.reply;
    if (id < 1 ||
        (status !== undefined && (typeof status !== "string" ||
          !REVIEW_STATUSES.includes(status as (typeof REVIEW_STATUSES)[number]))) ||
        (hasReply && reply !== null && (typeof reply !== "string" || reply.trim().length > 2000)) ||
        (status === undefined && !hasReply)) {
      return failure("A valid review ID, status, or reply is required.", 400);
    }

    const rows = await sql`
      UPDATE customer_product_reviews
      SET status = COALESCE(${typeof status === "string" ? status : null}, status),
          admin_reply = CASE
            WHEN ${hasReply} THEN ${typeof reply === "string" && reply.trim() ? reply.trim() : null}
            ELSE admin_reply
          END,
          updated_by_admin_id = ${adminId},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, status, admin_reply, updated_at
    `;
    if (!rows.length) return failure("Product review not found.", 404);

    return NextResponse.json(
      {
        success: true,
        review: {
          id: Number(rows[0].id),
          status: String(rows[0].status),
          reply: typeof rows[0].admin_reply === "string" ? rows[0].admin_reply : null,
          updatedAt: isoDate(rows[0].updated_at),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("PATCH /api/admin/product-reviews error:", error);
    return failure("Failed to update product review.", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireActiveBrandAdmin(req))) {
      return failure("Unauthorized. Please log in as an administrator.", 401);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return failure("Invalid product review deletion.", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        !("id" in body) || typeof body.id !== "number" || !Number.isSafeInteger(body.id) || body.id < 1) {
      return failure("A valid product review ID is required.", 400);
    }

    const rows = await sql`
      DELETE FROM customer_product_reviews
      WHERE id = ${body.id}
      RETURNING id
    `;
    if (!rows.length) return failure("Product review not found.", 404);

    return NextResponse.json(
      { success: true, deletedId: Number(rows[0].id) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("DELETE /api/admin/product-reviews error:", error);
    return failure("Failed to delete product review.", 500);
  }
}
