import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  deleteSubcategoryImage,
  detectProfileImageType,
  loadSubcategoryImage,
  MAX_PROFILE_IMAGE_SIZE,
  saveSubcategoryImage,
} from "@/lib/profile-storage";
import { requireActiveAdmin } from "@/lib/subcategories";

export const runtime = "nodejs";

type RouteContext = { params: { id: string } };

function parseId(value: string) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized. Please log in as an administrator.", 401);
    const subcategoryId = parseId(params.id);
    if (!subcategoryId) return failure("Invalid subcategory ID.", 400);

    const formData = await req.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) return failure("Choose an image file to upload.", 400);
    if (file.size === 0 || file.size > MAX_PROFILE_IMAGE_SIZE) {
      return failure("Image must be between 1 byte and 5 MB.", 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = detectProfileImageType(bytes);
    if (!contentType || file.type !== contentType) {
      return failure("Use a valid JPEG, PNG, or WebP image.", 400);
    }

    const subcategory = await sql`
      SELECT id
      FROM admin_subcategories
      WHERE id = ${subcategoryId}
      LIMIT 1
    `;
    if (!subcategory.length) return failure("Subcategory not found.", 404);

    await saveSubcategoryImage(subcategoryId, bytes, contentType);
    const imageUrl = `/api/admin/subcategories/${subcategoryId}/image`;
    const updated = await sql`
      UPDATE admin_subcategories
      SET image_url = ${imageUrl}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${subcategoryId}
      RETURNING id
    `;
    if (!updated.length) return failure("Subcategory not found.", 404);
    return NextResponse.json({
      success: true,
      message: "Subcategory image saved.",
      image_url: imageUrl,
    });
  } catch (error) {
    console.error("POST /api/admin/subcategories/[id]/image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save subcategory image." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized. Please log in as an administrator.", 401);
    const subcategoryId = parseId(params.id);
    if (!subcategoryId) return failure("Invalid subcategory ID.", 400);

    const subcategory = await sql`
      SELECT id, image_url
      FROM admin_subcategories
      WHERE id = ${subcategoryId}
      LIMIT 1
    `;
    if (!subcategory.length || !subcategory[0].image_url) return failure("Subcategory image not found.", 404);

    const image = await loadSubcategoryImage(subcategoryId);
    if (!image.Body) return failure("Subcategory image not found.", 404);
    const contentType = image.ContentType || "application/octet-stream";
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      return failure("Subcategory image has an unsupported format.", 415);
    }

    const bytes = await image.Body.transformToByteArray();
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/subcategories/[id]/image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load subcategory image." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized. Please log in as an administrator.", 401);
    const subcategoryId = parseId(params.id);
    if (!subcategoryId) return failure("Invalid subcategory ID.", 400);

    const existing = await sql`
      SELECT id
      FROM admin_subcategories
      WHERE id = ${subcategoryId}
      LIMIT 1
    `;
    if (!existing.length) return failure("Subcategory not found.", 404);
    await deleteSubcategoryImage(subcategoryId);
    const updated = await sql`
      UPDATE admin_subcategories
      SET image_url = '', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${subcategoryId}
      RETURNING id
    `;
    if (!updated.length) return failure("Subcategory not found.", 404);
    return NextResponse.json({ success: true, message: "Subcategory image removed." });
  } catch (error) {
    console.error("DELETE /api/admin/subcategories/[id]/image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove subcategory image." },
      { status: 500 }
    );
  }
}
