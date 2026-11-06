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

async function setupDealOfDay() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_daily_deals (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES admin_products(id) ON DELETE CASCADE,
      discount_percent NUMERIC(5, 2) NOT NULL
        CHECK (discount_percent > 0 AND discount_percent < 100),
      deal_date DATE NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      show_on_homepage BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (deal_date, product_id)
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS admin_daily_deals_one_featured_per_day_idx
    ON admin_daily_deals (deal_date)
    WHERE is_featured = TRUE
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS admin_daily_deals_live_idx
    ON admin_daily_deals (deal_date, is_active, show_on_homepage)
  `;

  console.log("Deal of the Day table is ready.");
}

setupDealOfDay().catch(error => {
  console.error("Failed to set up Deal of the Day:", error);
  process.exitCode = 1;
});
