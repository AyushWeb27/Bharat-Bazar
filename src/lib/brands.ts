import { NextRequest } from "next/server";
import { getActiveAdminId } from "@/lib/group-categories";

export interface AdminBrandInput {
  name: string;
  slug: string;
  category: string;
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
    typeof input.category !== "string" ||
    typeof input.logoColor !== "string" ||
    typeof input.country !== "string" ||
    typeof input.countryFlag !== "string" ||
    typeof input.website !== "string" ||
    typeof input.description !== "string" ||
    typeof input.featured !== "boolean" ||
    typeof input.active !== "boolean" ||
    typeof input.premium !== "boolean"
  ) return null;

  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  const category = input.category.trim();
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
    name, slug, category, logoColor, country, countryFlag, website,
    description, featured: input.featured, active: input.active, premium: input.premium,
  };
}

export function mapAdminBrand(row: Record<string, unknown>) {
  const name = String(row.name);
  return {
    id: Number(row.id),
    name,
    slug: String(row.slug),
    category: String(row.category),
    logoColor: String(row.logo_color),
    logoInit: name.split(/\s+/).map(word => word[0]).join("").slice(0, 2),
    logoUrl: row.logo_url ? String(row.logo_url) : undefined,
    products: Number(row.products || 0),
    country: String(row.country),
    countryFlag: String(row.country_flag),
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
