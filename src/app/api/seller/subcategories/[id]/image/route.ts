import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { loadSubcategoryImage } from "@/lib/profile-storage";

export const runtime = "nodejs";

type RouteContext = { params: { id: string } };

function parseId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * GET /api/seller/subcategories/[id]/image
 * Public read-only image endpoint — no auth required.
 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const subcategoryId = parseId(params.id);
    if (!subcategoryId) {
      return NextResponse.json({ success: false, message: "Invalid ID." }, { status: 400 });
    }

    const rows = await sql`
      SELECT image_url FROM admin_subcategories
      WHERE id = ${subcategoryId} AND active = TRUE
      LIMIT 1
    `;
    if (!rows.length || !rows[0].image_url) {
      return NextResponse.json({ success: false, message: "Image not found." }, { status: 404 });
    }

    const image = await loadSubcategoryImage(subcategoryId);
    if (!image.Body) {
      return NextResponse.json({ success: false, message: "Image not found." }, { status: 404 });
    }

    const contentType = image.ContentType || "image/jpeg";
    const bytes = await image.Body.transformToByteArray();
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET /api/seller/subcategories/[id]/image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load image." },
      { status: 500 }
    );
  }
}

