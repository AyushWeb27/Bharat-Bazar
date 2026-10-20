import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

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

const sql = neon(databaseUrl);

async function debug() {
  console.log("=== Testing date_of_birth::TEXT cast (the fix) ===");
  const users = await sql`
    SELECT id, name, gender,
           date_of_birth::TEXT AS dob_text
    FROM users
    ORDER BY id DESC
    LIMIT 5
  `;

  users.forEach(u => {
    console.log(`\nUser #${u.id}: ${u.name}`);
    console.log(`  gender    : ${JSON.stringify(u.gender)}`);
    console.log(`  dob_text  : ${JSON.stringify(u.dob_text)}  (typeof: ${typeof u.dob_text})`);
    if (u.dob_text) {
      console.log(`  slice(0,10): ${String(u.dob_text).slice(0, 10)}  <-- what the date input gets`);
    }
  });
}

debug().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
