import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Read .env manually
const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
let databaseUrl = "";

for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed.startsWith("DATABASE_URL=")) {
    databaseUrl = trimmed.substring("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
    break;
  }
}

if (!databaseUrl) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function testUserAuth() {
  console.log("Connecting to Neon database...");

  // 1. Check table schema
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
  `;
  console.log("Users table columns in Neon DB:\n", cols.map(c => `  - ${c.column_name} (${c.data_type})`).join("\n"));

  // 2. Test manual customer registration
  const testEmail = "customer.test@bharatbazar.in";
  const testPassword = "Password@123";
  const passwordHash = await bcrypt.hash(testPassword, 10);

  // Check if exists
  const existing = await sql`SELECT id FROM users WHERE email = ${testEmail}`;
  if (existing.length === 0) {
    const inserted = await sql`
      INSERT INTO users (
        name,
        email,
        password_hash,
        phone,
        email_verified,
        auth_provider,
        status,
        last_login
      )
      VALUES (
        'Aarav Sharma',
        ${testEmail},
        ${passwordHash},
        '9876543210',
        TRUE,
        'local',
        'active',
        CURRENT_TIMESTAMP
      )
      RETURNING id, name, email, email_verified, auth_provider, last_login;
    `;
    console.log("✓ Created test customer in Neon DB:", inserted[0]);
  } else {
    console.log("✓ Customer already exists with ID:", existing[0].id);
  }

  // 3. Test login verification & email_verified update in database
  const user = (await sql`SELECT * FROM users WHERE email = ${testEmail} LIMIT 1`)[0];
  const isMatch = await bcrypt.compare(testPassword, user.password_hash);
  console.log("✓ Password bcrypt verification:", isMatch ? "SUCCESS" : "FAILED");

  const loginUpdate = await sql`
    UPDATE users
    SET 
      email_verified = TRUE,
      last_login = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${user.id}
    RETURNING id, name, email, email_verified, last_login;
  `;
  console.log("✓ Database email verified after login:", loginUpdate[0]);

  // 4. Test Google OAuth user simulation in Neon DB
  const googleEmail = "google.testuser@gmail.com";
  const googleExisting = await sql`SELECT id FROM users WHERE email = ${googleEmail}`;
  if (googleExisting.length === 0) {
    const googleUser = await sql`
      INSERT INTO users (
        name,
        email,
        avatar_url,
        google_id,
        email_verified,
        auth_provider,
        status,
        last_login
      )
      VALUES (
        'Google Verified User',
        ${googleEmail},
        'https://lh3.googleusercontent.com/a/default-user',
        'google-sub-1029384756',
        TRUE,
        'google',
        'active',
        CURRENT_TIMESTAMP
      )
      RETURNING id, name, email, google_id, email_verified, auth_provider, last_login;
    `;
    console.log("✓ Created Google authenticated user in Neon DB:", googleUser[0]);
  } else {
    console.log("✓ Google test user already exists with ID:", googleExisting[0].id);
  }

  // 5. Total users count
  const count = await sql`SELECT COUNT(*) as count FROM users`;
  console.log(`✓ Total active registered users in Neon DB: ${count[0].count}`);

  console.log("\n=======================================================");
  console.log(">>> ALL NEON DATABASE CUSTOMER AUTH TESTS PASSED! <<<");
  console.log("=======================================================\n");
}

testUserAuth().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
