import { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { sql } from "@/lib/db";

export interface GroupCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
  description: string;
  active: boolean;
}

export interface GroupCategoryInput {
  name: string;
  slug: string;
  color: string;
  description: string;
  active: boolean;
}

export async function getActiveAdminId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;
  if (!session?.id || !Number.isSafeInteger(session.id) || session.id < 1) return null;

  const admins = await sql`
    SELECT id
    FROM admins
    WHERE id = ${session.id} AND status = 'active'
    LIMIT 1
  `;
  return admins.length ? session.id : null;
}

export function parseGroupCategoryInput(value: unknown): GroupCategoryInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (
    typeof input.name !== "string" ||
    typeof input.slug !== "string" ||
    typeof input.color !== "string" ||
    (input.description !== undefined && typeof input.description !== "string") ||
    typeof input.active !== "boolean"
  ) {
    return null;
  }

  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  const color = input.color.trim();
  const description = typeof input.description === "string" ? input.description.trim() : "";
  if (
    !name || name.length > 120 ||
    slug.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !/^#[0-9a-f]{6}$/i.test(color) ||
    description.length > 1000
  ) {
    return null;
  }

  return { name, slug, color, description, active: input.active };
}

export function mapGroupCategory(row: Record<string, unknown>): GroupCategory {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    color: String(row.color),
    description: String(row.description || ""),
    active: Boolean(row.active),
  };
}

export function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
  );
}
