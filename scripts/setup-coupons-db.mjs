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

async function setupCoupons() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_coupons (
      id SERIAL PRIMARY KEY,
      code VARCHAR(40) NOT NULL UNIQUE,
      discount_type VARCHAR(10) NOT NULL CHECK (discount_type IN ('flat', 'percent')),
      discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
      min_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
      max_discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (max_discount_amount >= 0),
      expires_at TIMESTAMP WITH TIME ZONE,
      used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
      usage_limit INTEGER NOT NULL DEFAULT 0 CHECK (usage_limit >= 0),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS admin_coupons_active_expiry_idx
    ON admin_coupons (is_active, expires_at)
  `;
  await sql`
    ALTER TABLE customer_orders
    ADD COLUMN IF NOT EXISTS coupon_id INTEGER REFERENCES admin_coupons(id) ON DELETE SET NULL
  `;
  await sql`
    ALTER TABLE customer_orders
    ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(40)
  `;
  await sql`
    ALTER TABLE customer_orders
    ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(12, 2) NOT NULL DEFAULT 0
      CHECK (coupon_discount >= 0)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS customer_coupon_redemptions (
      id SERIAL PRIMARY KEY,
      coupon_id INTEGER NOT NULL REFERENCES admin_coupons(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_id INTEGER NOT NULL UNIQUE REFERENCES customer_orders(id) ON DELETE CASCADE,
      redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (coupon_id, user_id)
    )
  `;
  await sql`
    INSERT INTO customer_coupon_redemptions (coupon_id, user_id, order_id)
    SELECT coupon_id, user_id, id
    FROM customer_orders
    WHERE coupon_id IS NOT NULL
      AND coupon_discount > 0
    ON CONFLICT (coupon_id, user_id) DO NOTHING
  `;
  console.log("Coupon table and order discount columns are ready.");
}

setupCoupons().catch(error => {
  console.error("Failed to set up coupons:", error);
  process.exitCode = 1;
});
