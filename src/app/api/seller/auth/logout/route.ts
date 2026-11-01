import { NextRequest, NextResponse } from "next/server";
import { SELLER_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Signed out of seller portal successfully.",
  });

  response.cookies.delete(SELLER_COOKIE_NAME);
  return response;
}

