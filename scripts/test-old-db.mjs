import { neon } from "@neondatabase/serverless";

async function testOld() {
  try {
    const sql = neon('postgresql://neondb_owner:npg_W16xrzUwOaJM@ep-mute-leaf-b4h1d286-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
    const res = await sql`SELECT id, name FROM admin_products`;
    console.log('Old password connected! Products:', res);
  } catch (e) {
    console.log('Old password failed:', e.message);
  }
}
testOld();
