import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const requestedType = new URL(req.url).searchParams.get("type");
    if (requestedType && requestedType !== "hero" && requestedType !== "strip") {
      return NextResponse.json(
        { success: false, message: "Banner type must be hero or strip." },
        { status: 400 }
      );
    }
    const bannerType = requestedType || "hero";
    const rows = await sql`
      SELECT id, title, badge, line_1, line_2, line_3, offer, subtitle, cta, cta_sub, tags, stats,
             product_image_url,
             link, image_url, gradient_from, gradient_to, sort_order
      FROM admin_banners
      WHERE type = ${bannerType}
        AND status IN ('active', 'scheduled')
        AND (status = 'active' OR (
          status = 'scheduled'
          AND start_date IS NOT NULL
          AND start_date <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date
        ))
        AND (start_date IS NULL OR start_date <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date)
        AND (end_date IS NULL OR end_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date)
      ORDER BY sort_order ASC, id ASC
    `;
    return NextResponse.json(
      {
        success: true,
        banners: rows.map(row => ({
          id: Number(row.id),
          title: String(row.title || ""),
          badge: String(row.badge || ""),
          line1: String(row.line_1 || row.title || ""),
          line2: String(row.line_2 || ""),
          line3: String(row.line_3 || ""),
          offer: String(row.offer || row.subtitle || ""),
          subtitle: String(row.subtitle || ""),
          cta: String(row.cta || ""),
          ctaSub: String(row.cta_sub || ""),
          tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
          stats: Array.isArray(row.stats)
            ? row.stats.filter((stat): stat is { v: string; l: string } =>
              Boolean(stat && typeof stat === "object" &&
                "v" in stat && typeof stat.v === "string" &&
                "l" in stat && typeof stat.l === "string"))
            : [],
          link: String(row.link || ""),
          imageUrl: row.image_url ? `/api/banners/${Number(row.id)}/image` : "",
          productImageUrl: row.product_image_url
            ? `/api/banners/${Number(row.id)}/image?kind=product`
            : "",
          gradientFrom: String(row.gradient_from || "#009966"),
          gradientTo: String(row.gradient_to || "#0d9488"),
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/banners error:", error);
    return NextResponse.json({ success: false, message: "Failed to load storefront banners." }, { status: 500 });
  }
}
