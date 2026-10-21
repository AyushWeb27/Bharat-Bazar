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

async function setupTaxes() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_tax_rules (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      rate NUMERIC(5, 2) CHECK (rate >= 0 AND rate <= 100),
      rate_label VARCHAR(40) NOT NULL DEFAULT '',
      type VARCHAR(32) NOT NULL CHECK (
        type IN ('GST', 'IGST', 'Customs', 'Central Tax', 'State Tax',
                 'Union Territory Tax', 'Integrated Tax', 'Cess')
      ),
      category VARCHAR(120) NOT NULL DEFAULT '*',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`ALTER TABLE admin_tax_rules ALTER COLUMN rate DROP NOT NULL`;
  await sql`ALTER TABLE admin_tax_rules ALTER COLUMN type TYPE VARCHAR(32)`;
  await sql`ALTER TABLE admin_tax_rules ADD COLUMN IF NOT EXISTS rate_label VARCHAR(40) NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE admin_tax_rules DROP CONSTRAINT IF EXISTS admin_tax_rules_type_check`;
  await sql`
    ALTER TABLE admin_tax_rules
    ADD CONSTRAINT admin_tax_rules_type_check
    CHECK (
      type IN ('GST', 'IGST', 'Customs', 'Central Tax', 'State Tax',
               'Union Territory Tax', 'Integrated Tax', 'Cess')
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS admin_tax_rules_active_category_idx
    ON admin_tax_rules (active, category)
  `;
  await sql`
    ALTER TABLE admin_products
    ADD COLUMN IF NOT EXISTS tax_rule_id INTEGER REFERENCES admin_tax_rules(id) ON DELETE SET NULL
  `;
  await sql`
    ALTER TABLE admin_products
    ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0
  `;
  await sql`
    ALTER TABLE admin_products
    ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0
  `;
  await sql`
    ALTER TABLE admin_products
    ADD COLUMN IF NOT EXISTS price_with_tax NUMERIC(12, 2)
  `;

  const seedRules = [
    ["GST Exempt", 0, "GST", "Exempt Goods/Services", "0%"],
    ["GST Nil Rated", 0, "GST", "Nil-Rated Goods", "0%"],
    ["GST 5%", 5, "GST", "Goods/Services", "5%"],
    ["GST 12%", 12, "GST", "Goods/Services", "12%"],
    ["GST 18%", 18, "GST", "Goods/Services", "18%"],
    ["GST 28%", 28, "GST", "Goods/Services", "28%"],
    ["CGST", null, "Central Tax", "Intra-state", "0%–14%*"],
    ["SGST", null, "State Tax", "Intra-state", "0%–14%*"],
    ["UTGST", null, "Union Territory Tax", "Intra-UT", "Applicable rate*"],
    ["IGST", null, "Integrated Tax", "Inter-state", "0%–28%*"],
    ["Compensation Cess", null, "Cess", "Specified goods", "Product-specific"],
  ];

  for (const [name, rate, type, category, rateLabel] of seedRules) {
    await sql`
      INSERT INTO admin_tax_rules (name, rate, type, category, rate_label)
      SELECT ${name}, ${rate}, ${type}, ${category}, ${rateLabel}
      WHERE NOT EXISTS (
        SELECT 1 FROM admin_tax_rules
        WHERE name = ${name} AND type = ${type} AND category = ${category}
      )
    `;
  }

  const result = await sql`SELECT COUNT(*)::INT AS count FROM admin_tax_rules`;
  console.log(`Tax rules table is ready (${result[0].count} rules).`);
}

setupTaxes().catch(error => {
  console.error("Failed to set up tax rules:", error);
  process.exitCode = 1;
});
