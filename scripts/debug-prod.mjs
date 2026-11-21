import { neon } from "@neondatabase/serverless";
import fs from "fs";

const envFile = fs.readFileSync(".env", "utf8");
const dbMatch = envFile.match(/DATABASE_URL="?([^"\n\r]+)"?/);
const sql = neon(dbMatch[1]);

async function runExactRouteQuery() {
  const category = null;
  const rows = await sql`
      SELECT p.id, p.name, p.short_description, p.full_description,
             p.category, p.subcategory, p.brand, p.mrp, p.selling_price,
             p.stock, p.sku, p.main_image_url, p.gallery_images, p.details,
             p.is_popular, p.is_deal, p.featured,
             flash_sale.name AS flash_sale_name,
             flash_sale.end_at AS flash_sale_end_at,
             flash_sale.discount_type AS flash_discount_type,
             flash_sale.discount_value AS flash_discount_value,
             daily_deal.discount_percent AS daily_discount_percent,
             COALESCE(review_summary.rating, 0) AS rating,
             COALESCE(review_summary.reviews, 0) AS reviews
      FROM admin_products p
      JOIN admin_categories c
        ON LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
        AND c.active = TRUE
      JOIN admin_group_categories g
        ON g.id = c.group_id AND g.active = TRUE
      LEFT JOIN LATERAL (
        SELECT sale.name, sale.end_at, sale.discount_type, sale.discount_value
        FROM admin_flash_sales AS sale
        JOIN admin_flash_sale_products AS linked ON linked.sale_id = sale.id
        WHERE linked.product_id = p.id
          AND sale.is_active = TRUE
          AND sale.start_at <= CURRENT_TIMESTAMP
          AND sale.end_at > CURRENT_TIMESTAMP
        ORDER BY sale.start_at DESC, sale.id DESC
        LIMIT 1
      ) AS flash_sale ON TRUE
      LEFT JOIN LATERAL (
        SELECT deal.discount_percent
        FROM admin_daily_deals AS deal
        WHERE deal.product_id = p.id
          AND deal.deal_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE
          AND deal.is_active = TRUE
        LIMIT 1
      ) AS daily_deal ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::INT AS reviews,
               COALESCE(AVG(review.rating), 0)::NUMERIC(3, 2) AS rating
        FROM customer_product_reviews AS review
        WHERE review.product_id = p.id AND review.status = 'approved'
      ) AS review_summary ON TRUE
      WHERE p.status = 'active'
        AND (${category}::text IS NULL
          OR LOWER(TRIM(c.name)) = LOWER(TRIM(${category}))
          OR LOWER(TRIM(c.slug)) = LOWER(TRIM(${category})))
      ORDER BY p.is_popular DESC, p.featured DESC, p.created_at DESC, p.id DESC
  `;
  console.log('Exact query rows count:', rows.length);
  console.log('IDs returned:', rows.map(r => ({ id: r.id, name: r.name })));
}

runExactRouteQuery().catch(console.error);
