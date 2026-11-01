import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT key, value, label, section, description
      FROM store_settings
      ORDER BY section ASC, key ASC
    `;

    const settings: Record<string, string> = {
      store_name: "BharatBazar",
      store_tagline: "India's favourite online supermarket",
      support_email: "support@bharatbazar.com",
      support_phone: "+91 1800-BB-STORE",
      business_address: "BharatBazar HQ, Sector 62, Noida, UP 201301",
      gst_number: "",
      logo_url: "",
      favicon_url: "",
      currency: "INR",
      timezone: "Asia/Kolkata",
      language: "English (India)",
      min_order_amount: "99",
      delivery_charge: "49",
      free_delivery_above: "499",
      maintenance_mode: "false",
      guest_checkout: "true",
      reviews_enabled: "true",
      multiple_addresses: "true",
    };

    for (const row of rows) {
      if (row.key && row.value !== undefined && row.value !== null) {
        settings[String(row.key)] = String(row.value);
      }
    }

    return NextResponse.json(
      {
        success: true,
        settings,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/store-settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load store settings." },
      { status: 500 }
    );
  }
}
