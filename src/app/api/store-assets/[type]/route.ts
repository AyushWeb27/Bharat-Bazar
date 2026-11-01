import { NextRequest, NextResponse } from "next/server";
import { loadStoreAsset, StoreAssetType } from "@/lib/profile-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ type: string }> | { type: string };
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const rawParams = await Promise.resolve(context.params);
    const type = rawParams.type?.toLowerCase();

    if (type !== "logo" && type !== "favicon") {
      return NextResponse.json(
        { success: false, message: "Asset type must be 'logo' or 'favicon'." },
        { status: 400 }
      );
    }

    try {
      const object = await loadStoreAsset(type as StoreAssetType);
      if (!object.Body) {
        return NextResponse.json(
          { success: false, message: `${type} not found.` },
          { status: 404 }
        );
      }

      const contentType = object.ContentType || (type === "favicon" ? "image/x-icon" : "image/png");
      const bytes = await object.Body.transformToByteArray();
      const body = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(body).set(bytes);

      return new NextResponse(body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          "X-Content-Type-Options": "nosniff",
          "Content-Disposition": "inline",
        },
      });
    } catch (s3Error: unknown) {
      const err = s3Error as { name?: string; code?: string; $metadata?: { httpStatusCode?: number } };
      if (err.name === "NoSuchKey" || err.code === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
        return NextResponse.json(
          { success: false, message: `No ${type} uploaded yet.` },
          { status: 404 }
        );
      }
      throw s3Error;
    }
  } catch (error) {
    console.error("GET /api/store-assets/[type] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load store asset." },
      { status: 500 }
    );
  }
}
