import { NextRequest } from "next/server";
import { getActiveAdminId, isUniqueViolation } from "@/lib/group-categories";
import { sql } from "@/lib/db";

export interface AdminSubcategory {
  id: number;
  name: string;
  slug: string;
  parent_id: number;
  parent: string;
  image_url: string;
  emoji: string;
  products: number;
  sort: number;
  active: boolean;
}

export interface AdminSubcategoryInput {
  name: string;
  slug: string;
  parent_id: number;
  sort: number;
  emoji: string;
  active: boolean;
}

export { isUniqueViolation };

export async function requireActiveAdmin(req: NextRequest) {
  return getActiveAdminId(req);
}

export function parseSubcategoryInput(value: unknown): AdminSubcategoryInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (
    typeof input.name !== "string" ||
    typeof input.slug !== "string" ||
    typeof input.parent_id !== "number" ||
    !Number.isSafeInteger(input.parent_id) ||
    typeof input.sort !== "number" ||
    !Number.isSafeInteger(input.sort) ||
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
    input.parent_id < 1 ||
    input.sort < 1 || input.sort > 10000
  ) {
    return null;
  }
  return { name, slug, parent_id: input.parent_id, sort: input.sort, emoji, active: input.active };
}

export function mapSubcategory(row: Record<string, unknown>): AdminSubcategory {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    parent_id: Number(row.parent_id),
    parent: String(row.parent_name || ""),
    emoji: String(row.emoji || "📁"),
    image_url: String(row.image_url || ""),
    products: Number(row.products || 0),
    sort: Number(row.sort_order || 1),
    active: Boolean(row.active),
  };
}

export function isUniqueSlugViolation(error: unknown) {
  return isUniqueViolation(error);
}

export async function parentCategoryExists(parentId: number) {
  const parents = await sql`
    SELECT id
    FROM admin_categories
    WHERE id = ${parentId}
    LIMIT 1
  `;
  return parents.length > 0;
}
