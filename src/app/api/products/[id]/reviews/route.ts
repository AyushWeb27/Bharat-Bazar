import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getActiveCartUserId } from "@/lib/customer-cart";

export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

function failure(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function validProductId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function isoDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid product review date.");
  return date.toISOString();
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const productId = validProductId(params.id);
  if (!productId) return failure("This product is not available.", 404);

  try {
    const userId = await getActiveCartUserId(req);
    const [reviewRows, summaryRows, ownRows] = await Promise.all([
      sql`
        SELECT review.id, review.rating, review.title, review.body, review.admin_reply,
               review.created_at, customer.name AS reviewer_name
        FROM customer_product_reviews review
        JOIN users customer ON customer.id = review.user_id
        WHERE review.product_id = ${productId}
          AND review.status = 'approved'
        ORDER BY review.created_at DESC, review.id DESC
        LIMIT 50
      `,
      sql`
        SELECT COUNT(*)::INT AS count,
               COALESCE(AVG(rating), 0)::NUMERIC(3, 2) AS average,
               COUNT(*) FILTER (WHERE rating = 5)::INT AS five_star,
               COUNT(*) FILTER (WHERE rating = 4)::INT AS four_star,
               COUNT(*) FILTER (WHERE rating = 3)::INT AS three_star,
               COUNT(*) FILTER (WHERE rating = 2)::INT AS two_star,
               COUNT(*) FILTER (WHERE rating = 1)::INT AS one_star
        FROM customer_product_reviews
        WHERE product_id = ${productId} AND status = 'approved'
      `,
      userId
        ? sql`
            SELECT review.id, review.rating, review.title, review.body, review.status, review.created_at
            FROM customer_product_reviews review
            WHERE review.product_id = ${productId} AND review.user_id = ${userId}
            LIMIT 1
          `
        : Promise.resolve([]),
    ]);

    let canReview = false;
    if (userId && !ownRows.length) {
      const eligibilityRows = await sql`
        SELECT EXISTS (
          SELECT 1
          FROM customer_orders order_row
          JOIN customer_order_items item ON item.order_id = order_row.id
          WHERE order_row.user_id = ${userId}
            AND item.product_id = ${productId}
            AND LOWER(REPLACE(REPLACE(BTRIM(order_row.status), ' ', '_'), '-', '_'))
              IN ('delivered', 'completed')
        ) AS eligible
      `;
      canReview = eligibilityRows[0]?.eligible === true;
    }

    const summary = summaryRows[0];
    return NextResponse.json(
      {
        success: true,
        data: {
          summary: {
            count: Number(summary?.count) || 0,
            average: Number(summary?.average) || 0,
            distribution: [
              Number(summary?.one_star) || 0,
              Number(summary?.two_star) || 0,
              Number(summary?.three_star) || 0,
              Number(summary?.four_star) || 0,
              Number(summary?.five_star) || 0,
            ],
          },
          reviews: reviewRows.map(row => ({
            id: Number(row.id),
            rating: Number(row.rating),
            title: String(row.title),
            body: String(row.body),
            reply: typeof row.admin_reply === "string" ? row.admin_reply : null,
            reviewerName: String(row.reviewer_name || "Verified customer"),
            createdAt: isoDate(row.created_at),
          })),
          authenticated: Boolean(userId),
          canReview,
          ownReview: ownRows.length ? {
            rating: Number(ownRows[0].rating),
            title: String(ownRows[0].title),
            body: String(ownRows[0].body),
            status: String(ownRows[0].status),
            createdAt: isoDate(ownRows[0].created_at),
          } : null,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/products/[id]/reviews error:", error);
    return failure("Could not load product reviews. Please try again.", 500);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const userId = await getActiveCartUserId(req);
    if (!userId) return failure("Sign in to write a product review.", 401);

    const productId = validProductId(params.id);
    if (!productId) return failure("This product is not available.", 404);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return failure("Enter a valid product review.", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return failure("Enter a valid product review.", 400);
    }

    const input = body as Record<string, unknown>;
    const rating = input.rating;
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const reviewBody = typeof input.body === "string" ? input.body.trim() : "";
    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return failure("Choose a rating from 1 to 5 stars.", 400);
    }
    if (title.length < 3 || title.length > 120 || reviewBody.length < 10 || reviewBody.length > 3000) {
      return failure("Review title must be 3–120 characters and review details 10–3000 characters.", 400);
    }

    const rows = await sql`
      INSERT INTO customer_product_reviews (user_id, product_id, order_id, rating, title, body)
      SELECT ${userId}, ${productId}, eligible.order_id, ${rating}, ${title}, ${reviewBody}
      FROM (
        SELECT order_row.id AS order_id
        FROM customer_orders order_row
        JOIN customer_order_items item ON item.order_id = order_row.id
        WHERE order_row.user_id = ${userId}
          AND item.product_id = ${productId}
          AND LOWER(REPLACE(REPLACE(BTRIM(order_row.status), ' ', '_'), '-', '_'))
            IN ('delivered', 'completed')
        ORDER BY order_row.updated_at DESC, order_row.id DESC
        LIMIT 1
      ) eligible
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING id, rating, title, body, status, created_at
    `;

    if (!rows.length) {
      const existing = await sql`
        SELECT id FROM customer_product_reviews
        WHERE user_id = ${userId} AND product_id = ${productId}
        LIMIT 1
      `;
      if (existing.length) return failure("You have already reviewed this product.", 409);

      const purchased = await sql`
        SELECT EXISTS (
          SELECT 1
          FROM customer_orders order_row
          JOIN customer_order_items item ON item.order_id = order_row.id
          WHERE order_row.user_id = ${userId} AND item.product_id = ${productId}
        ) AS purchased
      `;
      if (purchased[0]?.purchased !== true) {
        return failure("Only customers who purchased this product can review it.", 403);
      }
      return failure("You can write a review after this order has been delivered.", 409);
    }

    return NextResponse.json(
      {
        success: true,
        review: {
          id: Number(rows[0].id),
          rating: Number(rows[0].rating),
          title: String(rows[0].title),
          body: String(rows[0].body),
          status: String(rows[0].status),
          createdAt: isoDate(rows[0].created_at),
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("POST /api/products/[id]/reviews error:", error);
    return failure("Could not save your review. Please try again.", 500);
  }
}
