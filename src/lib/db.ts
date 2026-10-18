import { neon } from "@neondatabase/serverless";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  console.warn("⚠️ Warning: DATABASE_URL is not set in environment variables.");
}

export const sql = neon(databaseUrl || "");

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
}
