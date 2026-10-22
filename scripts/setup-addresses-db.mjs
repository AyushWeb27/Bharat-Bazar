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

async function setupAddresses() {
  await sql`
    CREATE TABLE IF NOT EXISTS user_addresses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label VARCHAR(40) NOT NULL,
      recipient VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      line1 VARCHAR(200) NOT NULL,
      line2 VARCHAR(200) NOT NULL DEFAULT '',
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(12) NOT NULL,
      country VARCHAR(100) NOT NULL DEFAULT 'India',
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS user_addresses_user_idx
    ON user_addresses (user_id, is_default DESC, created_at DESC)
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS user_addresses_one_default_per_user_idx
    ON user_addresses (user_id)
    WHERE is_default = TRUE
  `;

  const result = await sql`SELECT COUNT(*)::INT AS count FROM user_addresses`;
  console.log(`Customer addresses table is ready (${result[0].count} saved addresses).`);
}

setupAddresses().catch(error => {
  console.error("Failed to set up customer addresses:", error);
  process.exitCode = 1;
});
