import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  hashPassword,
  createSellerSessionToken,
  SELLER_COOKIE_NAME,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      ownerName,
      email,
      password,
      mobile,
      altPhone = "",
      aadhaar = "",
      emailVerified = false,
      mobileVerified = false,

      businessName,
      businessType = "Sole Proprietorship",
      gstin = "",
      pan = "",
      businessCategory = "Fashion",
      yearEstablished = "",
      monthlyTurnover = "₹5L–₹20L",

      storeName,
      storeSlug,
      storeDescription = "",
      websiteUrl = "",
      productCount = "50",
      storeLogoUrl = "",
      storeBannerUrl = "",
      storeAccentColor = "#009966",

      addressLine1,
      addressLine2 = "",
      city,
      state,
      pincode,
      country = "India",
      shippingModel = "express",
      sameAsPickup = true,
      returnAddress = "",

      accountHolder = "",
      bankName = "State Bank of India",
      accountType = "Current Account",
      accountNumber = "",
      ifsc = "",

      gstDocUrl = "",
      panDocUrl = "",
      aadhaarDocUrl = "",
      bankDocUrl = "",
      tradeLicenseUrl = "",

      allowCOD = true,
      autoApprove = true,
    } = body;

    // Validate essential required fields
    if (!ownerName?.trim()) {
      return NextResponse.json({ success: false, message: "Owner full name is required." }, { status: 400 });
    }
    if (!email?.trim() || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "A valid email address is required." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!mobile?.trim()) {
      return NextResponse.json({ success: false, message: "Mobile number is required." }, { status: 400 });
    }
    if (!businessName?.trim()) {
      return NextResponse.json({ success: false, message: "Business name is required." }, { status: 400 });
    }
    if (!storeName?.trim()) {
      return NextResponse.json({ success: false, message: "Store display name is required." }, { status: 400 });
    }
    if (!addressLine1?.trim() || !city?.trim() || !state?.trim() || !pincode?.trim()) {
      return NextResponse.json({ success: false, message: "Complete pickup warehouse address is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existingSeller = await sql`
      SELECT id FROM sellers WHERE LOWER(email) = ${cleanEmail} LIMIT 1
    `;
    if (existingSeller.length > 0) {
      return NextResponse.json(
        { success: false, message: "This email address is already registered as a seller." },
        { status: 409 }
      );
    }

    // Generate/Validate unique store slug
    let finalSlug = (storeSlug || storeName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!finalSlug) finalSlug = `store-${Date.now()}`;

    // Check slug collision
    const slugCheck = await sql`
      SELECT id FROM sellers WHERE LOWER(store_slug) = ${finalSlug} LIMIT 1
    `;
    if (slugCheck.length > 0) {
      finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert into Neon sellers table
    const result = await sql`
      INSERT INTO sellers (
        owner_name,
        email,
        password_hash,
        mobile,
        alt_phone,
        aadhaar,
        email_verified,
        mobile_verified,

        business_name,
        business_type,
        gstin,
        pan,
        business_category,
        year_established,
        monthly_turnover,

        store_name,
        store_slug,
        store_description,
        website_url,
        product_count,
        store_logo_url,
        store_banner_url,
        store_accent_color,

        address_line1,
        address_line2,
        city,
        state,
        pincode,
        country,
        shipping_model,
        same_as_pickup,
        return_address,

        account_holder,
        bank_name,
        account_type,
        account_number,
        ifsc,

        gst_doc_url,
        pan_doc_url,
        aadhaar_doc_url,
        bank_doc_url,
        trade_license_url,

        allow_cod,
        auto_approve,
        status,
        kyc_status,
        last_login
      ) VALUES (
        ${ownerName.trim()},
        ${cleanEmail},
        ${passwordHash},
        ${mobile.trim()},
        ${altPhone.trim()},
        ${aadhaar.trim()},
        ${Boolean(emailVerified)},
        ${Boolean(mobileVerified)},

        ${businessName.trim()},
        ${businessType},
        ${gstin.trim().toUpperCase()},
        ${pan.trim().toUpperCase()},
        ${businessCategory},
        ${yearEstablished.toString()},
        ${monthlyTurnover},

        ${storeName.trim()},
        ${finalSlug},
        ${storeDescription.trim()},
        ${websiteUrl.trim()},
        ${productCount.toString()},
        ${storeLogoUrl.trim()},
        ${storeBannerUrl.trim()},
        ${storeAccentColor || "#009966"},

        ${addressLine1.trim()},
        ${addressLine2.trim()},
        ${city.trim()},
        ${state.trim()},
        ${pincode.trim()},
        ${(country || "India").trim()},
        ${shippingModel},
        ${Boolean(sameAsPickup)},
        ${returnAddress.trim()},

        ${accountHolder.trim()},
        ${bankName.trim()},
        ${accountType},
        ${accountNumber.trim()},
        ${ifsc.trim().toUpperCase()},

        ${gstDocUrl.trim()},
        ${panDocUrl.trim()},
        ${aadhaarDocUrl.trim()},
        ${bankDocUrl.trim()},
        ${tradeLicenseUrl.trim()},

        ${Boolean(allowCOD)},
        ${Boolean(autoApprove)},
        'Pending Verification',
        'Pending',
        CURRENT_TIMESTAMP
      )
      RETURNING id, owner_name, email, store_name, store_slug, status, kyc_status, created_at
    `;

    const newSeller = result[0];

    // Create session token and set cookie
    const token = createSellerSessionToken({
      id: newSeller.id,
      owner_name: newSeller.owner_name,
      store_name: newSeller.store_name,
      store_slug: newSeller.store_slug,
      email: newSeller.email,
      status: newSeller.status,
    });

    const response = NextResponse.json({
      success: true,
      message: "Seller registered successfully in Neon database.",
      seller: {
        id: newSeller.id,
        applicationId: `BB-SLR-${String(newSeller.id).padStart(6, "0")}`,
        owner_name: newSeller.owner_name,
        email: newSeller.email,
        store_name: newSeller.store_name,
        store_slug: newSeller.store_slug,
        status: newSeller.status,
        kyc_status: newSeller.kyc_status,
      },
    });

    response.cookies.set({
      name: SELLER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("POST /api/seller/auth/register error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to register seller." },
      { status: 500 }
    );
  }
}

