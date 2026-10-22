import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveAdmin } from "@/lib/categories";
import {
  deleteBannerImage,
  deleteBannerProductImage,
  detectBannerImageType,
  saveBannerImage,
  saveBannerProductImage,
} from "@/lib/profile-storage";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const bannerTypes = ["hero", "strip", "popup"] as const;
const bannerStatuses = ["active", "scheduled", "paused"] as const;

type BannerInput = {
  id?: number;
  title: string;
  badge: string;
  line1: string;
  line2: string;
  line3: string;
  offer: string;
  subtitle: string;
  cta: string;
  ctaSub: string;
  tags: string[];
  stats: Array<{ v: string; l: string }>;
  link: string;
  type: typeof bannerTypes[number];
  status: typeof bannerStatuses[number];
  gradientFrom: string;
  gradientTo: string;
  startDate: string | null;
  endDate: string | null;
  sort: number;
};

function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length <= maxLength ? text : null;
}

function readDate(value: unknown): string | null | undefined {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value ? undefined : value;
}

function mapDate(value: unknown): string {
  if (!value) return "";
  const dateText = value instanceof Date ? value.toISOString() : String(value);
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(dateText);
  return match?.[1] ?? "";
}

function parseBanner(value: unknown): BannerInput | null {
  if (!isRecord(value)) return null;
  const title = readString(value.title, 120);
  const badge = readString(value.badge ?? "", 80);
  const line1 = readString(value.line1 ?? value.title, 80);
  const line2 = readString(value.line2 ?? "", 80);
  const line3 = readString(value.line3 ?? "", 80);
  const offer = readString(value.offer ?? value.subtitle, 160);
  const subtitle = readString(value.subtitle, 240);
  const cta = readString(value.cta, 40);
  const ctaSub = readString(value.ctaSub ?? "", 100);
  const tags = value.tags === undefined ? [] : value.tags;
  const stats = value.stats === undefined ? [] : value.stats;
  const link = readString(value.link, 500);
  const gradientFrom = readString(value.gradientFrom, 7);
  const gradientTo = readString(value.gradientTo, 7);
  const startDate = readDate(value.startDate);
  const endDate = readDate(value.endDate);
  const sort = value.sort;
  const id = value.id;
  if (
    !title || badge === null || !line1 || line2 === null || line3 === null ||
    offer === null || subtitle === null || cta === null || ctaSub === null || link === null ||
    !Array.isArray(tags) || tags.length > 8 ||
    !tags.every(tag => typeof tag === "string" && tag.trim().length > 0 && tag.trim().length <= 40) ||
    !Array.isArray(stats) || stats.length > 3 ||
    !stats.every(stat => isRecord(stat) &&
      typeof stat.v === "string" && stat.v.trim().length <= 20 &&
      typeof stat.l === "string" && stat.l.trim().length <= 32 &&
      (Boolean(stat.v.trim()) === Boolean(stat.l.trim()))) ||
    !bannerTypes.includes(value.type as typeof bannerTypes[number]) ||
    !bannerStatuses.includes(value.status as typeof bannerStatuses[number]) ||
    !gradientFrom || !/^#[\da-f]{6}$/i.test(gradientFrom) ||
    !gradientTo || !/^#[\da-f]{6}$/i.test(gradientTo) ||
    startDate === undefined || endDate === undefined ||
    (startDate && endDate && endDate < startDate) ||
    typeof sort !== "number" || !Number.isSafeInteger(sort) || sort < 1 || sort > 10000 ||
    (id !== undefined && (typeof id !== "number" || !Number.isSafeInteger(id) || id < 1))
  ) return null;
  if (link && !link.startsWith("/") && !/^https?:\/\//i.test(link)) return null;
  if (link.startsWith("//")) return null;
  return {
    ...(typeof id === "number" ? { id } : {}),
    title,
    badge,
    line1,
    line2,
    line3,
    offer,
    subtitle,
    cta,
    ctaSub,
    tags: tags.map(tag => tag.trim()),
    stats: stats
      .filter(stat => stat.v.trim() && stat.l.trim())
      .map(stat => ({ v: stat.v.trim(), l: stat.l.trim() })),
    link,
    type: value.type as BannerInput["type"],
    status: value.status as BannerInput["status"],
    gradientFrom,
    gradientTo,
    startDate,
    endDate,
    sort,
  };
}

function mapBanner(row: Record<string, unknown>) {
  const id = Number(row.id);
  return {
    id,
    title: String(row.title || ""),
    badge: String(row.badge || ""),
    line1: String(row.line_1 || row.title || ""),
    line2: String(row.line_2 || ""),
    line3: String(row.line_3 || ""),
    offer: String(row.offer || row.subtitle || ""),
    subtitle: String(row.subtitle || ""),
    cta: String(row.cta || ""),
    ctaSub: String(row.cta_sub || ""),
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
    stats: Array.isArray(row.stats)
      ? row.stats.filter((stat): stat is { v: string; l: string } =>
        isRecord(stat) && typeof stat.v === "string" && typeof stat.l === "string")
      : [],
    link: String(row.link || ""),
    type: String(row.type),
    status: String(row.status),
    imageUrl: row.image_url ? `/api/admin/banners/${id}/image` : "",
    productImageUrl: row.product_image_url ? `/api/admin/banners/${id}/image?kind=product` : "",
    gradientFrom: String(row.gradient_from || "#009966"),
    gradientTo: String(row.gradient_to || "#0d9488"),
    startDate: mapDate(row.start_date),
    endDate: mapDate(row.end_date),
    clicks: Number(row.clicks) || 0,
    impressions: Number(row.impressions) || 0,
    sort: Number(row.sort_order) || 1,
  };
}

async function readImage(formData: FormData, field: string) {
  const file = formData.get(field);
  if (file === null) return null;
  if (!(file instanceof File)) throw new Error("Invalid banner image upload.");
  if (!file.size || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Banner images must be between 1 byte and 5 MB.");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = detectBannerImageType(bytes);
  if (!contentType) {
    throw new Error("Use a valid JPEG, PNG, WebP, GIF, BMP, TIFF, or AVIF banner image. SVG is not supported.");
  }
  return { bytes, contentType };
}

async function readForm(req: NextRequest): Promise<{
  input: BannerInput;
  image: Awaited<ReturnType<typeof readImage>>;
  productImage: Awaited<ReturnType<typeof readImage>>;
  removeProductImage: boolean;
} | null> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return null;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("banner") ?? ""));
  } catch {
    return null;
  }
  const input = parseBanner(raw);
  if (!input) return null;
  const image = await readImage(formData, "image");
  const productImage = await readImage(formData, "productImage");
  const removeProductImage = formData.get("removeProductImage") === "true";
  if (removeProductImage && productImage) return null;
  return { input, image, productImage, removeProductImage };
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized. Please log in as an administrator.", 401);
    const rows = await sql`SELECT * FROM admin_banners ORDER BY sort_order ASC, id ASC`;
    return NextResponse.json({ success: true, banners: rows.map(row => mapBanner(row)) });
  } catch (error) {
    console.error("GET /api/admin/banners error:", error);
    return failure("Failed to load banners.", 500);
  }
}

export async function POST(req: NextRequest) {
  let adminId: number | null;
  try {
    adminId = await requireActiveAdmin(req);
  } catch (error) {
    console.error("POST /api/admin/banners authorization error:", error);
    return failure("Failed to verify administrator access.", 500);
  }
  if (!adminId) return failure("Unauthorized. Please log in as an administrator.", 401);

  let form: Awaited<ReturnType<typeof readForm>>;
  try {
    form = await readForm(req);
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Invalid banner image upload.", 400);
  }
  if (!form) return failure("Enter valid banner details.", 400);
  if (!form.image && form.input.type === "hero") return failure("Choose a banner image.", 400);

  let bannerId: number | null = null;
  try {
    const rows = await sql`
      INSERT INTO admin_banners (
        title, badge, line_1, line_2, line_3, offer, subtitle, cta, cta_sub, tags, stats,
        link, type, status, image_url, product_image_url, gradient_from, gradient_to,
        start_date, end_date, sort_order
      ) VALUES (
        ${form.input.title}, ${form.input.badge}, ${form.input.line1}, ${form.input.line2},
        ${form.input.line3}, ${form.input.offer}, ${form.input.subtitle}, ${form.input.cta},
        ${form.input.ctaSub}, ${JSON.stringify(form.input.tags)}::JSONB,
        ${JSON.stringify(form.input.stats)}::JSONB, ${form.input.link},
        ${form.input.type}, ${form.input.status}, '', '', ${form.input.gradientFrom}, ${form.input.gradientTo},
        ${form.input.startDate}, ${form.input.endDate}, ${form.input.sort}
      )
      RETURNING id
    `;
    bannerId = Number(rows[0].id);
    if (form.image) await saveBannerImage(bannerId, form.image.bytes, form.image.contentType);
    if (form.productImage) {
      await saveBannerProductImage(bannerId, form.productImage.bytes, form.productImage.contentType);
    }
    const updated = await sql`
      UPDATE admin_banners
      SET image_url = ${form.image ? `/api/banners/${bannerId}/image` : ""},
          product_image_url = ${form.productImage ? `/api/banners/${bannerId}/image?kind=product` : ""},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${bannerId}
      RETURNING *
    `;
    return NextResponse.json({ success: true, banner: mapBanner(updated[0]) }, { status: 201 });
  } catch (error) {
    if (bannerId) {
      try {
        await deleteBannerImage(bannerId);
      } catch (cleanupError) {
        console.error("Failed to clean up banner image after creation error:", cleanupError);
      }
      try {
        await deleteBannerProductImage(bannerId);
      } catch (cleanupError) {
        console.error("Failed to clean up banner product image after creation error:", cleanupError);
      }
      try {
        await sql`DELETE FROM admin_banners WHERE id = ${bannerId}`;
      } catch (cleanupError) {
        console.error("Failed to clean up banner record after creation error:", cleanupError);
      }
    }
    console.error("POST /api/admin/banners error:", error);
    return failure("Failed to create banner. Check database and banner storage configuration.", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized. Please log in as an administrator.", 401);
    let form: Awaited<ReturnType<typeof readForm>>;
    try {
      form = await readForm(req);
    } catch (error) {
      return failure(error instanceof Error ? error.message : "Invalid banner image upload.", 400);
    }
    if (!form || !form.input.id) return failure("Enter valid banner details.", 400);
    const existing = await sql`SELECT id, image_url, product_image_url FROM admin_banners WHERE id = ${form.input.id} LIMIT 1`;
    if (!existing.length) return failure("Banner not found.", 404);
    if (form.input.type === "hero" && !existing[0].image_url && !form.image) {
      return failure("Choose a banner image.", 400);
    }

    if (form.image) await saveBannerImage(form.input.id, form.image.bytes, form.image.contentType);
    if (form.removeProductImage && existing[0].product_image_url) {
      await deleteBannerProductImage(form.input.id);
    }
    if (form.productImage) await saveBannerProductImage(form.input.id, form.productImage.bytes, form.productImage.contentType);
    const rows = await sql`
      UPDATE admin_banners
      SET title = ${form.input.title},
          badge = ${form.input.badge},
          line_1 = ${form.input.line1},
          line_2 = ${form.input.line2},
          line_3 = ${form.input.line3},
          offer = ${form.input.offer},
          subtitle = ${form.input.subtitle},
          cta = ${form.input.cta},
          cta_sub = ${form.input.ctaSub},
          tags = ${JSON.stringify(form.input.tags)}::JSONB,
          stats = ${JSON.stringify(form.input.stats)}::JSONB,
          link = ${form.input.link},
          type = ${form.input.type},
          status = ${form.input.status},
          image_url = ${form.image
            ? `/api/banners/${form.input.id}/image`
            : existing[0].image_url || ""},
          product_image_url = ${form.productImage
            ? `/api/banners/${form.input.id}/image?kind=product`
            : form.removeProductImage
              ? ""
            : existing[0].product_image_url || ""},
          gradient_from = ${form.input.gradientFrom},
          gradient_to = ${form.input.gradientTo},
          start_date = ${form.input.startDate},
          end_date = ${form.input.endDate},
          sort_order = ${form.input.sort},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${form.input.id}
      RETURNING *
    `;
    return NextResponse.json({ success: true, banner: mapBanner(rows[0]) });
  } catch (error) {
    console.error("PUT /api/admin/banners error:", error);
    return failure("Failed to update banner.", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized. Please log in as an administrator.", 401);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return failure("Request body must be valid JSON.", 400);
    }
    if (!isRecord(body) || !Array.isArray(body.ids) || !body.ids.length || body.ids.length > 500 ||
        !body.ids.every(id => typeof id === "number" && Number.isSafeInteger(id) && id > 0) ||
        new Set(body.ids).size !== body.ids.length) {
      return failure("Provide a valid ordered list of banner IDs.", 400);
    }
    const ids = body.ids as number[];
    const existing = await sql`SELECT id FROM admin_banners WHERE id = ANY(${ids}::int[])`;
    if (existing.length !== ids.length) return failure("One or more banners no longer exist.", 409);
    const rows = await sql`
      UPDATE admin_banners AS banner
      SET sort_order = ordered.position::INT, updated_at = CURRENT_TIMESTAMP
      FROM UNNEST(${ids}::INT[]) WITH ORDINALITY AS ordered(id, position)
      WHERE banner.id = ordered.id
      RETURNING banner.*
    `;
    return NextResponse.json({ success: true, banners: rows.map(row => mapBanner(row)) });
  } catch (error) {
    console.error("PATCH /api/admin/banners error:", error);
    return failure("Failed to reorder banners.", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized. Please log in as an administrator.", 401);
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) return failure("A valid banner ID is required.", 400);
    const existing = await sql`SELECT id, image_url, product_image_url FROM admin_banners WHERE id = ${id} LIMIT 1`;
    if (!existing.length) return failure("Banner not found.", 404);
    if (existing[0].image_url) await deleteBannerImage(id);
    if (existing[0].product_image_url) await deleteBannerProductImage(id);
    await sql`DELETE FROM admin_banners WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/banners error:", error);
    return failure("Failed to delete banner.", 500);
  }
}
