import { NextRequest } from "next/server";
import { getActiveAdminId } from "@/lib/group-categories";
import { sql } from "@/lib/db";

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  group_id: number;
  group: string;
  emoji: string;
  image_url: string;
  products: number;
  active: boolean;
  description?: string;
}

export interface AdminCategoryInput {
  name: string;
  slug: string;
  group_id: number;
  emoji: string;
  active: boolean;
}

export { getActiveAdminId };

export function parseAdminCategoryInput(value: unknown): AdminCategoryInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (
    typeof input.name !== "string" ||
    typeof input.slug !== "string" ||
    typeof input.group_id !== "number" ||
    !Number.isSafeInteger(input.group_id) ||
    typeof input.emoji !== "string" ||
    typeof input.active !== "boolean"
  ) {
    return null;
  }

  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  const emoji = input.emoji.trim();
  if (
    !name || name.length > 120 ||
    slug.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !emoji || emoji.length > 16 ||
    input.group_id < 1
  ) {
    return null;
  }
  return { name, slug, group_id: input.group_id, emoji, active: input.active };
}

export function mapAdminCategory(row: Record<string, unknown>): AdminCategory {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    group_id: Number(row.group_id),
    group: String(row.group_name || ""),
    emoji: String(row.emoji || "📦"),
    image_url: String(row.image_url || ""),
    products: Number(row.products || 0),
    active: Boolean(row.active),
    description: String(row.description || ""),
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

export async function requireActiveAdmin(req: NextRequest) {
  return getActiveAdminId(req);
}

export async function groupExists(groupId: number) {
  const groups = await sql`
    SELECT id
    FROM admin_group_categories
    WHERE id = ${groupId}
    LIMIT 1
  `;
  return groups.length > 0;
}
