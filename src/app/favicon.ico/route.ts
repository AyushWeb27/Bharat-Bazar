import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { loadStoreAsset } from "@/lib/profile-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT value FROM store_settings WHERE key = 'favicon_url' LIMIT 1
    `;

    const faviconUrl = rows.length && rows[0].value ? String(rows[0].value).trim() : null;

    if (faviconUrl) {
      if (faviconUrl.startsWith("/api/store-assets/favicon")) {
        try {
          const object = await loadStoreAsset("favicon");
          if (object.Body) {
            const bytes = await object.Body.transformToByteArray();
            const body = new ArrayBuffer(bytes.byteLength);
            new Uint8Array(body).set(bytes);
            return new NextResponse(body, {
              headers: {
                "Content-Type": object.ContentType || "image/x-icon",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                "X-Content-Type-Options": "nosniff",
              },
            });
          }
        } catch {
          // If S3 fetch fails, redirect to faviconUrl
        }
      } else if (faviconUrl.startsWith("http")) {
        return NextResponse.redirect(new URL(faviconUrl));
      }
    }

    // Default SVG IndianRupee favicon if no database favicon is set
    const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="#009966"/>
      <text x="16" y="22" font-family="sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">₹</text>
    </svg>`;

    return new NextResponse(defaultSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("GET /favicon.ico error:", error);
    return new NextResponse(null, { status: 404 });
  }
}
