import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ ERROR: DATABASE_URL is not defined in environment variables.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setupUsers() {
  console.log("🚀 Creating 'users' table in Neon database if not exists...");

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      phone VARCHAR(30) DEFAULT '',
      avatar_url TEXT DEFAULT '',
      email_verified BOOLEAN DEFAULT FALSE,
      auth_provider VARCHAR(50) DEFAULT 'local',
      google_id VARCHAR(255) DEFAULT '',
      status VARCHAR(50) DEFAULT 'active',
      last_login TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(30)`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS vip BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);`;

  console.log("✅ 'users' table and indexes verified/created successfully in Neon DB.");

  const count = await sql`SELECT COUNT(*)::int as total FROM users`;
  console.log(`📊 Current customer count in Neon DB: ${count[0].total}`);
}

setupUsers().catch(err => {
  console.error("❌ Migration error:", err);
  process.exit(1);
});
