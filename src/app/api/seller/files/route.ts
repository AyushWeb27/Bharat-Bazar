import { NextRequest, NextResponse } from "next/server";
import { loadSellerFile } from "@/lib/seller-storage";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { success: false, message: "File key is required." },
        { status: 400 }
      );
    }

    // Security check: prevent directory traversal or invalid keys
    if (key.includes("..") || key.startsWith("/")) {
      return NextResponse.json(
        { success: false, message: "Invalid file key path." },
        { status: 400 }
      );
    }

    const s3Response = await loadSellerFile(key);

    if (!s3Response.Body) {
      return NextResponse.json(
        { success: false, message: "File not found." },
        { status: 404 }
      );
    }

    // Convert S3 Body to ReadableStream
    let stream: ReadableStream;
    if (s3Response.Body instanceof Readable) {
      stream = Readable.toWeb(s3Response.Body) as ReadableStream;
    } else if (typeof (s3Response.Body as any).transformToWebStream === "function") {
      stream = (s3Response.Body as any).transformToWebStream();
    } else {
      const bytes = await s3Response.Body.transformToByteArray();
      return new NextResponse(Buffer.from(bytes), {
        headers: {
          "Content-Type": s3Response.ContentType || "application/octet-stream",
          "Content-Length": s3Response.ContentLength?.toString() || bytes.length.toString(),
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return new NextResponse(stream, {
      headers: {
        "Content-Type": s3Response.ContentType || "application/octet-stream",
        ...(s3Response.ContentLength ? { "Content-Length": s3Response.ContentLength.toString() } : {}),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    if (err?.name === "NoSuchKey" || err?.$metadata?.httpStatusCode === 404) {
      return NextResponse.json(
        { success: false, message: "File not found." },
        { status: 404 }
      );
    }
    console.error("GET /api/seller/files error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load seller file." },
      { status: 500 }
    );
  }
}

