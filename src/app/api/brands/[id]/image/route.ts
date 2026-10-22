import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { loadBrandImage } from "@/lib/profile-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

function notFound() {
  return NextResponse.json({ success: false, message: "Brand image not found." }, { status: 404 });
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const id = Number(params.id);
    if (!Number.isSafeInteger(id) || id < 1) return notFound();

    const rows = await sql`
      SELECT id
      FROM admin_brands
      WHERE id = ${id} AND active = TRUE AND logo_url IS NOT NULL
      LIMIT 1
    `;
    if (!rows.length) return notFound();

    const image = await loadBrandImage(id);
    if (!image.Body) return notFound();
    const contentType = image.ContentType || "application/octet-stream";
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      return NextResponse.json({ success: false, message: "Unsupported brand image." }, { status: 415 });
    }

    const bytes = await image.Body.transformToByteArray();
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("GET /api/brands/[id]/image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load brand image." },
      { status: 500 }
    );
  }
}
