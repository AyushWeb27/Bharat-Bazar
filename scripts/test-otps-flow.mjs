import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

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

async function testOtpsFlow() {
  console.log("==================================================");
  console.log("Testing Neon Database 'otps' Table & Multi-Type OTPs");
  console.log("==================================================");

  // 1. Generate & Insert OTP for 'phone_login'
  const phoneOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const phoneRecord = await sql`
    INSERT INTO otps (identifier, type, otp_code, expires_at, verified, ip_address)
    VALUES ('9876543210', 'phone_login', ${phoneOtpCode}, CURRENT_TIMESTAMP + INTERVAL '10 minutes', FALSE, '127.0.0.1')
    RETURNING id, identifier, type, otp_code, expires_at, verified, created_at;
  `;
  console.log("✓ Created 'phone_login' OTP in Neon DB:", phoneRecord[0]);

  // 2. Generate & Insert OTP for 'registration'
  const regOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const regRecord = await sql`
    INSERT INTO otps (identifier, type, otp_code, expires_at, verified, ip_address)
    VALUES ('9811223344', 'registration', ${regOtpCode}, CURRENT_TIMESTAMP + INTERVAL '10 minutes', FALSE, '127.0.0.1')
    RETURNING id, identifier, type, otp_code, expires_at, verified, created_at;
  `;
  console.log("✓ Created 'registration' OTP in Neon DB:", regRecord[0]);

  // 3. Generate & Insert OTP for 'email_login'
  const emailOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const emailRecord = await sql`
    INSERT INTO otps (identifier, type, otp_code, expires_at, verified, ip_address)
    VALUES ('rahul@bharatbazar.in', 'email_login', ${emailOtpCode}, CURRENT_TIMESTAMP + INTERVAL '10 minutes', FALSE, '127.0.0.1')
    RETURNING id, identifier, type, otp_code, expires_at, verified, created_at;
  `;
  console.log("✓ Created 'email_login' OTP in Neon DB:", emailRecord[0]);

  // 4. Test Verification: Mark the phone OTP as verified
  const verifiedUpdate = await sql`
    UPDATE otps
    SET verified = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${phoneRecord[0].id}
    RETURNING id, identifier, type, otp_code, verified, updated_at;
  `;
  console.log("✓ Verified phone OTP in Neon DB:", verifiedUpdate[0]);

  // 5. Query All Types of OTPs from Neon DB
  const allOtps = await sql`
    SELECT 
      id, 
      identifier, 
      type, 
      otp_code, 
      verified, 
      CASE 
        WHEN verified THEN 'verified'
        WHEN expires_at < CURRENT_TIMESTAMP THEN 'expired'
        ELSE 'active'
      END as status,
      created_at
    FROM otps
    ORDER BY id DESC
    LIMIT 10;
  `;

  console.log("\n--- Recent Records in Neon DB 'otps' Table ---");
  allOtps.forEach(o => {
    console.log(`[ID ${o.id}] Type: ${o.type.padEnd(14)} | Ident: ${o.identifier.padEnd(20)} | Code: ${o.otp_code} | Status: ${o.status}`);
  });

  console.log("\n==================================================");
  console.log(">>> ALL NEON DATABASE OTP TESTS PASSED! <<<");
  console.log("==================================================");
}

testOtpsFlow().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
