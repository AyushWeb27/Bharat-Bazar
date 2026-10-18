import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ ERROR: DATABASE_URL is not defined in environment variables.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setup() {
  console.log("🚀 Creating 'admins' table in Neon database if not exists...");

  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'superadmin',
      status VARCHAR(50) DEFAULT 'active',
      last_login TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log("✅ 'admins' table verified/created successfully.");

  // Check if any admin exists
  const existingAdmins = await sql`SELECT id, name, email, role, status, created_at FROM admins`;
  console.log(`📊 Found ${existingAdmins.length} admin(s) in database.`);

  if (existingAdmins.length === 0) {
    console.log("ℹ️ No admin found. Creating default initial Super Admin...");
    const defaultEmail = "admin@bharatbazar.com";
    const defaultPassword = "Admin@123Bharat!";
    const defaultName = "Bharat Super Admin";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const inserted = await sql`
      INSERT INTO admins (name, email, password_hash, role, status)
      VALUES (${defaultName}, ${defaultEmail}, ${passwordHash}, 'superadmin', 'active')
      RETURNING id, name, email, role, created_at
    `;

    console.log("🎉 Default Admin created successfully in Neon database:");
    console.log("   Name:     ", inserted[0].name);
    console.log("   Email:    ", inserted[0].email);
    console.log("   Password: ", defaultPassword);
    console.log("   Role:     ", inserted[0].role);
  } else {
    console.log("👥 Existing Admins in Neon database:");
    existingAdmins.forEach((adm, idx) => {
      console.log(`   ${idx + 1}. [ID: ${adm.id}] ${adm.name} (${adm.email}) - Role: ${adm.role} - Status: ${adm.status}`);
    });
  }
}

setup().catch((err) => {
  console.error("❌ Setup error:", err);
  process.exit(1);
});
