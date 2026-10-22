import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  loadBannerImage,
  loadBannerProductImage,
  SUPPORTED_BANNER_IMAGE_TYPES,
} from "@/lib/profile-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

function notFound() {
  return NextResponse.json({ success: false, message: "Banner image not found." }, { status: 404 });
}

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const id = Number(params.id);
    if (!Number.isSafeInteger(id) || id < 1) return notFound();
    const kind = new URL(req.url).searchParams.get("kind");
    if (kind && kind !== "product") return notFound();
    const rows = await sql`
      SELECT id, type, image_url, product_image_url
      FROM admin_banners
      WHERE id = ${id}
        AND type IN ('hero', 'strip')
        AND status IN ('active', 'scheduled')
        AND (status = 'active' OR (
          status = 'scheduled'
          AND start_date IS NOT NULL
          AND start_date <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date
        ))
        AND image_url <> ''
        AND (start_date IS NULL OR start_date <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date)
        AND (end_date IS NULL OR end_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date)
      LIMIT 1
    `;
    if (!rows.length) return notFound();
    if (kind === "product" && rows[0].type !== "hero") return notFound();
    if (kind === "product" ? !rows[0].product_image_url : !rows[0].image_url) return notFound();
    const object = kind === "product" ? await loadBannerProductImage(id) : await loadBannerImage(id);
    if (!object.Body) return notFound();
    const contentType = object.ContentType || "application/octet-stream";
    if (!SUPPORTED_BANNER_IMAGE_TYPES.has(contentType)) {
      return NextResponse.json({ success: false, message: "Unsupported banner image." }, { status: 415 });
    }
    const bytes = await object.Body.transformToByteArray();
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("GET /api/banners/[id]/image error:", error);
    return NextResponse.json({ success: false, message: "Failed to load banner image." }, { status: 500 });
  }
}
