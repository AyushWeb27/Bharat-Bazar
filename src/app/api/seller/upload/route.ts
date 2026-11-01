import { NextRequest, NextResponse } from "next/server";
import {
  saveSellerFile,
  detectSellerFileType,
  MAX_SELLER_DOCUMENT_SIZE,
  MAX_SELLER_IMAGE_SIZE,
} from "@/lib/seller-storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const kind = (formData.get("kind") as string) || "misc";
    const tempId = (formData.get("tempId") as string) || `anon_${Date.now()}`;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No file was provided." },
        { status: 400 }
      );
    }

    const isDoc = kind.startsWith("doc") || kind === "gst" || kind === "pan" || kind === "aadhaar" || kind === "bank" || kind === "trade";
    const maxSize = isDoc ? MAX_SELLER_DOCUMENT_SIZE : MAX_SELLER_IMAGE_SIZE;

    if (file.size === 0 || file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: `File size must be between 1 byte and ${isDoc ? "10 MB" : "5 MB"}.`,
        },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    let detectedMime = detectSellerFileType(bytes);

    // Fallback for svg/other formats
    if (!detectedMime && file.type) {
      detectedMime = file.type;
    }

    if (!detectedMime) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported file format. Please upload PDF, PNG, JPG, or WebP.",
        },
        { status: 400 }
      );
    }

    // Determine extension
    const ext =
      detectedMime === "application/pdf"
        ? "pdf"
        : detectedMime === "image/png"
        ? "png"
        : detectedMime === "image/jpeg"
        ? "jpg"
        : detectedMime === "image/webp"
        ? "webp"
        : file.name.split(".").pop() || "bin";

    // Clean filename
    const cleanName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 50);

    const s3Key = `sellers/${tempId}/${kind}_${Date.now()}_${cleanName}`;

    const url = await saveSellerFile(s3Key, bytes, detectedMime);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully to bucket seller-file.",
      url,
      key: s3Key,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      contentType: detectedMime,
    });
  } catch (err: any) {
    console.error("POST /api/seller/upload error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to upload seller file." },
      { status: 500 }
    );
  }
}

