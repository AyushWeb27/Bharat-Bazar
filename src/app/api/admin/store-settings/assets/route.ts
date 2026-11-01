import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import {
  saveStoreAsset,
  deleteStoreAsset,
  detectStoreAssetType,
  StoreAssetType,
  STORE_LOGO_BUCKET_NAME,
} from "@/lib/profile-storage";

export const runtime = "nodejs";

const MAX_LOGO_SIZE = 5 * 1024 * 1024;    // 5 MB
const MAX_FAVICON_SIZE = 2 * 1024 * 1024; // 2 MB

async function requireAdmin(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;
  if (!session?.id || !Number.isSafeInteger(session.id) || session.id < 1) return null;

  const rows = await sql`
    SELECT id FROM admins WHERE id = ${session.id} AND status = 'active' LIMIT 1
  `;
  return rows.length ? session.id : null;
}

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Unauthorized. Please log in as an administrator." },
    { status: 401 }
  );
}

// ─── POST – upload logo or favicon to store-logo bucket ───────────────────────
export async function POST(req: NextRequest) {
  try {
    const adminId = await requireAdmin(req);
    if (!adminId) return unauthorized();

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request must be multipart/form-data." },
        { status: 400 }
      );
    }

    const typeRaw = formData.get("type");
    const type = typeof typeRaw === "string" ? typeRaw.toLowerCase() : "";
    if (type !== "logo" && type !== "favicon") {
      return NextResponse.json(
        { success: false, message: "Asset type must be 'logo' or 'favicon'." },
        { status: 400 }
      );
    }

    const file = formData.get("file") || formData.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Please provide an image file in 'file' or 'image' field." },
        { status: 400 }
      );
    }

    if (!file.size) {
      return NextResponse.json(
        { success: false, message: "The selected file is empty." },
        { status: 400 }
      );
    }

    const maxSize = type === "favicon" ? MAX_FAVICON_SIZE : MAX_LOGO_SIZE;
    if (file.size > maxSize) {
      const limitMb = maxSize / (1024 * 1024);
      return NextResponse.json(
        { success: false, message: `${type === "favicon" ? "Favicon" : "Logo"} file size must be under ${limitMb}MB.` },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = detectStoreAssetType(bytes, file.type);
    if (!contentType) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported file format. Please upload a valid PNG, JPG, WebP, SVG, or ICO file.",
        },
        { status: 400 }
      );
    }

    // Save directly to "store-logo" bucket
    await saveStoreAsset(type as StoreAssetType, bytes, contentType);

    // Formulate asset URL
    const timestamp = Date.now();
    const assetUrl = `/api/store-assets/${type}?v=${timestamp}`;
    const settingKey = type === "logo" ? "logo_url" : "favicon_url";

    // Update store_settings table
    await sql`
      INSERT INTO store_settings (key, value, type, label, section, description, updated_at)
      VALUES (
        ${settingKey},
        ${assetUrl},
        'text',
        ${type === "logo" ? "Logo URL" : "Favicon URL"},
        'identity',
        ${type === "logo" ? "URL of the store logo image" : "URL of the store favicon"},
        NOW()
      )
      ON CONFLICT (key) DO UPDATE
      SET value = ${assetUrl}, updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      message: `${type === "logo" ? "Store logo" : "Store favicon"} uploaded successfully to '${STORE_LOGO_BUCKET_NAME}' bucket!`,
      url: assetUrl,
      type,
      bucket: STORE_LOGO_BUCKET_NAME,
      contentType,
    });
  } catch (error) {
    console.error("POST /api/admin/store-settings/assets error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload store asset to bucket." },
      { status: 500 }
    );
  }
}

// ─── DELETE – remove logo or favicon from store-logo bucket ────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const adminId = await requireAdmin(req);
    if (!adminId) return unauthorized();

    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "").toLowerCase();

    if (type !== "logo" && type !== "favicon") {
      return NextResponse.json(
        { success: false, message: "Parameter 'type' must be 'logo' or 'favicon'." },
        { status: 400 }
      );
    }

    // Delete from "store-logo" bucket
    try {
      await deleteStoreAsset(type as StoreAssetType);
    } catch (s3Err) {
      console.warn("Delete asset warning (object might not exist in S3):", s3Err);
    }

    const settingKey = type === "logo" ? "logo_url" : "favicon_url";

    // Clear value in store_settings table
    await sql`
      UPDATE store_settings
      SET value = '', updated_at = NOW()
      WHERE key = ${settingKey}
    `;

    return NextResponse.json({
      success: true,
      message: `${type === "logo" ? "Store logo" : "Store favicon"} removed from '${STORE_LOGO_BUCKET_NAME}' bucket.`,
      type,
    });
  } catch (error) {
    console.error("DELETE /api/admin/store-settings/assets error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete store asset." },
      { status: 500 }
    );
  }
}
