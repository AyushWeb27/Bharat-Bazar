import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveBrandAdmin } from "@/lib/brands";
import {
  deleteBrandImage,
  detectProfileImageType,
  loadBrandImage,
  saveBrandImage,
} from "@/lib/profile-storage";

const MAX_BRAND_IMAGE_SIZE = 2 * 1024 * 1024;

function parseId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function badRequest(message: string, details?: Record<string, string | number>) {
  return NextResponse.json(
    { success: false, message, ...(details ? { details } : {}) },
    { status: 400 }
  );
}

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    if (!(await requireActiveBrandAdmin(req))) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const id = parseId(context.params.id);
    if (!id) return badRequest("Invalid brand ID.");
    const rows = await sql`SELECT logo_url FROM admin_brands WHERE id = ${id} LIMIT 1`;
    if (!rows.length || !rows[0].logo_url) {
      return NextResponse.json({ success: false, message: "Brand image not found." }, { status: 404 });
    }
    const object = await loadBrandImage(id);
    if (!object.Body) return NextResponse.json({ success: false, message: "Brand image not found." }, { status: 404 });
    const imageBytes = await object.Body.transformToByteArray();
    const responseBody = new ArrayBuffer(imageBytes.byteLength);
    new Uint8Array(responseBody).set(imageBytes);
    return new NextResponse(responseBody, {
      headers: {
        "Content-Type": object.ContentType || "application/octet-stream",
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/brands/[id]/image error:", error);
    return NextResponse.json({ success: false, message: "Failed to load brand image." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    if (!(await requireActiveBrandAdmin(req))) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const id = parseId(context.params.id);
    if (!id) return badRequest("Invalid brand ID.");
    const rows = await sql`SELECT id FROM admin_brands WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ success: false, message: "Brand not found." }, { status: 404 });

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return badRequest("Upload must use multipart/form-data with a field named 'image'.");
    }
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return badRequest("Choose an image file and submit it in the 'image' field.");
    }
    if (!file.size) {
      return badRequest("The selected image file is empty.");
    }
    if (file.size > MAX_BRAND_IMAGE_SIZE) {
      return badRequest("Brand images must be 2 MB or smaller.", {
        maximumBytes: MAX_BRAND_IMAGE_SIZE,
        receivedBytes: file.size,
      });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = detectProfileImageType(bytes);
    if (!contentType) {
      return badRequest("The uploaded file is not a supported PNG, JPG, or WebP image.", {
        detectedContentType: file.type || "unknown",
        fileName: file.name.slice(0, 120),
      });
    }

    await saveBrandImage(id, bytes, contentType);
    const logoUrl = `/api/admin/brands/${id}/image`;
    await sql`UPDATE admin_brands SET logo_url = ${logoUrl}, updated_at = NOW() WHERE id = ${id}`;
    return NextResponse.json({ success: true, logoUrl });
  } catch (error) {
    console.error("POST /api/admin/brands/[id]/image error:", error);
    return NextResponse.json({ success: false, message: "Failed to save brand image." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    if (!(await requireActiveBrandAdmin(req))) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const id = parseId(context.params.id);
    if (!id) return NextResponse.json({ success: false, message: "Invalid brand ID." }, { status: 400 });
    const rows = await sql`SELECT id FROM admin_brands WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ success: false, message: "Brand not found." }, { status: 404 });
    await deleteBrandImage(id);
    await sql`UPDATE admin_brands SET logo_url = NULL, updated_at = NOW() WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/brands/[id]/image error:", error);
    return NextResponse.json({ success: false, message: "Failed to remove brand image." }, { status: 500 });
  }
}
