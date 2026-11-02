import { neon } from "@neondatabase/serverless";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL, POSTGRES_URL, or NEON_DATABASE_URL is required.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setupOrders() {
  await sql`
    CREATE TABLE IF NOT EXISTS customer_orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(40) NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      status VARCHAR(30) NOT NULL DEFAULT 'placed',
      payment_method VARCHAR(30) NOT NULL CHECK (payment_method = 'cod'),
      payment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
      subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
      tax_amount NUMERIC(12, 2) NOT NULL CHECK (tax_amount >= 0),
      shipping_amount NUMERIC(12, 2) NOT NULL CHECK (shipping_amount >= 0),
      total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
      shipping_address JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS customer_order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES admin_products(id) ON DELETE SET NULL,
      product_name VARCHAR(300) NOT NULL,
      variant_title VARCHAR(200) NOT NULL DEFAULT '',
      sku VARCHAR(100) NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99),
      unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
      line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
      product_snapshot JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS customer_orders_user_created_idx
    ON customer_orders (user_id, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS customer_order_items_order_idx
    ON customer_order_items (order_id)
  `;
  await sql`
    CREATE OR REPLACE FUNCTION reserve_customer_product_stock(
      requested_product_id INTEGER,
      requested_variant_title TEXT,
      requested_quantity INTEGER
    ) RETURNS VOID
    LANGUAGE plpgsql
    AS $$
    DECLARE
      variant_has_stock BOOLEAN;
      affected_rows INTEGER;
    BEGIN
      SELECT EXISTS (
        SELECT 1
        FROM admin_products p
        CROSS JOIN LATERAL jsonb_array_elements(
          CASE
            WHEN jsonb_typeof(p.details::jsonb -> 'variants') = 'array'
            THEN p.details::jsonb -> 'variants'
            ELSE '[]'::jsonb
          END
        ) AS variant(value)
        WHERE p.id = requested_product_id
          AND COALESCE(variant.value ->> 'title', '') = requested_variant_title
          AND COALESCE(variant.value ->> 'status', '') <> 'Inactive'
          AND COALESCE(variant.value ->> 'stock', '') ~ '^[0-9]+$'
      ) INTO variant_has_stock;

      UPDATE admin_products p
      SET stock = CASE
            WHEN variant_has_stock THEN p.stock
            ELSE p.stock - requested_quantity
          END,
          details = CASE
            WHEN variant_has_stock THEN jsonb_set(
              COALESCE(p.details::jsonb, '{}'::jsonb),
              '{variants}',
              (
                SELECT jsonb_agg(
                  CASE
                    WHEN COALESCE(variant.value ->> 'title', '') = requested_variant_title
                    THEN jsonb_set(
                      variant.value,
                      '{stock}',
                      to_jsonb((variant.value ->> 'stock')::INTEGER - requested_quantity),
                      TRUE
                    )
                    ELSE variant.value
                  END
                  ORDER BY variant.ordinality
                )
                FROM jsonb_array_elements(
                  CASE
                    WHEN jsonb_typeof(p.details::jsonb -> 'variants') = 'array'
                    THEN p.details::jsonb -> 'variants'
                    ELSE '[]'::jsonb
                  END
                ) WITH ORDINALITY AS variant(value, ordinality)
              ),
              TRUE
            )
            ELSE p.details::jsonb
          END
      WHERE p.id = requested_product_id
        AND p.status = 'active'
        AND EXISTS (
          SELECT 1
          FROM admin_categories c
          JOIN admin_group_categories g ON g.id = c.group_id AND g.active = TRUE
          WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
            AND c.active = TRUE
        )
        AND CASE
          WHEN variant_has_stock THEN EXISTS (
            SELECT 1
            FROM jsonb_array_elements(
              CASE
                WHEN jsonb_typeof(p.details::jsonb -> 'variants') = 'array'
                THEN p.details::jsonb -> 'variants'
                ELSE '[]'::jsonb
              END
            ) AS variant(value)
            WHERE COALESCE(variant.value ->> 'title', '') = requested_variant_title
              AND COALESCE(variant.value ->> 'status', '') <> 'Inactive'
              AND COALESCE(variant.value ->> 'stock', '') ~ '^[0-9]+$'
              AND (variant.value ->> 'stock')::INTEGER >= requested_quantity
          )
          ELSE COALESCE(p.stock, 0) >= requested_quantity
        END;

      GET DIAGNOSTICS affected_rows = ROW_COUNT;
      IF affected_rows = 0 THEN
        RAISE EXCEPTION 'Product is unavailable or stock changed'
          USING ERRCODE = 'P0001';
      END IF;
    END;
    $$
  `;
  console.log("Customer order tables and inventory reservation function are ready.");
}

setupOrders().catch(error => {
  console.error("Failed to set up customer orders:", error);
  process.exitCode = 1;
});
