import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import readline from "readline";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ ERROR: DATABASE_URL is not defined in environment variables.");
  process.exit(1);
}

const sql = neon(databaseUrl);

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  let name = args[0];
  let email = args[1];
  let password = args[2];
  let role = args[3] || "superadmin";

  console.log("\n==============================================");
  console.log("   BharatBazar - Manual Admin Creator (Neon)  ");
  console.log("==============================================\n");

  if (!name) {
    name = await prompt("Enter Admin Full Name: ");
  }
  if (!email) {
    email = await prompt("Enter Admin Email: ");
  }
  if (!password) {
    password = await prompt("Enter Admin Password: ");
  }

  if (!email || !password || !name) {
    console.error("❌ Error: Name, email, and password are required.");
    process.exit(1);
  }

  // Email format validation
  email = email.toLowerCase().trim();
  if (!email.includes("@") || !email.includes(".")) {
    console.error("❌ Error: Please enter a valid email address.");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("❌ Error: Password must be at least 6 characters long.");
    process.exit(1);
  }

  console.log("\n⏳ Checking existing admin records in Neon database...");
  const existing = await sql`SELECT id, email FROM admins WHERE email = ${email}`;

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing.length > 0) {
    console.log(`⚠️ Admin with email ${email} already exists (ID: ${existing[0].id}). Updating password and details...`);
    const updated = await sql`
      UPDATE admins
      SET name = ${name}, password_hash = ${passwordHash}, role = ${role}, updated_at = CURRENT_TIMESTAMP
      WHERE email = ${email}
      RETURNING id, name, email, role, updated_at
    `;
    console.log("\n✅ Admin updated successfully in Neon database:");
    console.log("   ID:        ", updated[0].id);
    console.log("   Name:      ", updated[0].name);
    console.log("   Email:     ", updated[0].email);
    console.log("   Role:      ", updated[0].role);
    console.log("   Updated At:", updated[0].updated_at);
  } else {
    const inserted = await sql`
      INSERT INTO admins (name, email, password_hash, role, status)
      VALUES (${name}, ${email}, ${passwordHash}, ${role}, 'active')
      RETURNING id, name, email, role, created_at
    `;
    console.log("\n🎉 New Admin added successfully to Neon database table:");
    console.log("   ID:        ", inserted[0].id);
    console.log("   Name:      ", inserted[0].name);
    console.log("   Email:     ", inserted[0].email);
    console.log("   Role:      ", inserted[0].role);
    console.log("   Created At:", inserted[0].created_at);
  }

  console.log("\n🔑 Login Credentials:");
  console.log("   Email:    ", email);
  console.log("   Password: ", password);
  console.log("   Portal URL: http://localhost:3000/admin/login\n");
}

main().catch((err) => {
  console.error("❌ Error adding admin:", err);
  process.exit(1);
});
