import { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { getActiveAdminId } from "@/lib/group-categories";

let hasEnsuredCategoriesColumn = false;
export async function ensureBrandCategoriesColumn() {
  if (hasEnsuredCategoriesColumn) return;
  try {
    await sql`ALTER TABLE admin_brands ADD COLUMN IF NOT EXISTS categories JSONB NOT NULL DEFAULT '[]'::jsonb`;
    hasEnsuredCategoriesColumn = true;
  } catch (err) {
    console.error("Failed to ensure categories column in admin_brands:", err);
  }
}

export interface AdminBrandInput {
  name: string;
  slug: string;
  category: string;
  categories: string[];
  logoColor: string;
  country: string;
  countryFlag: string;
  website: string;
  description: string;
  featured: boolean;
  active: boolean;
  premium: boolean;
}

export function parseAdminBrandInput(value: unknown): AdminBrandInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (
    typeof input.name !== "string" ||
    typeof input.slug !== "string" ||
    typeof input.logoColor !== "string" ||
    typeof input.country !== "string" ||
    typeof input.countryFlag !== "string" ||
    typeof input.website !== "string" ||
    typeof input.description !== "string" ||
    typeof input.featured !== "boolean" ||
    typeof input.active !== "boolean" ||
    typeof input.premium !== "boolean"
  ) return null;

  // Handle multiple categories
  let rawCategories: string[] = [];
  if (Array.isArray(input.categories)) {
    rawCategories = input.categories
      .filter((c): c is string => typeof c === "string")
      .map(c => c.trim())
      .filter(Boolean);
  }

  // Fallback to single category if categories array is not provided or empty
  if (rawCategories.length === 0 && typeof input.category === "string" && input.category.trim()) {
    rawCategories = [input.category.trim()];
  }

  const uniqueCategories = Array.from(new Set(rawCategories));
  if (uniqueCategories.length === 0) return null;
  if (uniqueCategories.some(c => c.length > 120)) return null;

  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  const category = uniqueCategories[0];
  const logoColor = input.logoColor.trim();
  const country = input.country.trim();
  const countryFlag = input.countryFlag.trim();
  const website = input.website.trim();
  const description = input.description.trim();
  if (
    !name || name.length > 120 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120 ||
    !category || category.length > 120 ||
    !/^#[0-9a-f]{6}$/i.test(logoColor) ||
    !country || country.length > 100 ||
    countryFlag.length > 16 ||
    website.length > 255 ||
    description.length > 1000 ||
    (website && !/^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(website))
  ) return null;

  return {
    name,
    slug,
    category,
    categories: uniqueCategories,
    logoColor,
    country,
    countryFlag,
    website,
    description,
    featured: input.featured,
    active: input.active,
    premium: input.premium,
  };
}

export function mapAdminBrand(row: Record<string, unknown>) {
  const name = String(row.name || "");
  let categories: string[] = [];
  if (Array.isArray(row.categories)) {
    categories = (row.categories as unknown[]).map(c => String(c || "").trim()).filter(Boolean);
  } else if (typeof row.categories === "string") {
    try {
      const parsed = JSON.parse(row.categories);
      if (Array.isArray(parsed)) {
        categories = parsed.map(c => String(c || "").trim()).filter(Boolean);
      }
    } catch {
      categories = row.categories.split(",").map(c => c.trim()).filter(Boolean);
    }
  }

  const primaryCategory = String(row.category || "").trim();
  if (categories.length === 0 && primaryCategory) {
    categories = [primaryCategory];
  }
  categories = Array.from(new Set(categories));
  const category = categories[0] || primaryCategory;

  return {
    id: Number(row.id),
    name,
    slug: String(row.slug || ""),
    category,
    categories,
    logoColor: String(row.logo_color || "#009966"),
    logoInit: name.split(/\s+/).map(word => word[0]).join("").slice(0, 2),
    logoUrl: row.logo_url ? String(row.logo_url) : undefined,
    products: Number(row.products || 0),
    country: String(row.country || "India"),
    countryFlag: String(row.country_flag || "🇮🇳"),
    website: String(row.website || ""),
    description: String(row.description || ""),
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    premium: Boolean(row.premium),
  };
}

export async function requireActiveBrandAdmin(req: NextRequest) {
  return getActiveAdminId(req);
}
