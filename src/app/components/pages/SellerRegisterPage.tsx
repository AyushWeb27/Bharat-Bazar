"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, User, Store, Landmark, MapPin, Settings2,
  CheckCircle2, Circle, ShieldCheck, Users, ArrowRight, ArrowLeft,
  Upload, FileText, Check, AlertCircle, Eye, EyeOff, Lock, Mail,
  Phone, Sparkles, HelpCircle, X, ExternalLink, RefreshCw, Star,
  ShoppingBag, Truck, IndianRupee, Award, ChevronRight, Download,
  FileCheck, Info, Shield, CheckCircle, Clock, Save, Trash2,
  Camera, Image as ImageIcon, Loader2
} from "lucide-react";
import type { Page } from "../types/index";

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const G  = "#009966";
const GD = "#007a52";
const GL = "#f0fdf8";

// ─── Types ────────────────────────────────────────────────────────────────────
export type BusinessType = string;

export type BusinessCategory = string;

export interface DbCategoryItem {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  groupId: number | null;
  groupName: string;
}

export interface DbBusinessType {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
}

export interface DbTurnoverRange {
  id: number;
  label: string;
  displayText: string;
  minValue: number;
  maxValue: number | null;
}

export interface DbCountry {
  id: number;
  name: string;
  code: string;
  phoneCode: string;
  currency: string;
  flagEmoji: string;
  isDefault: boolean;
}

export interface DbState {
  id: number;
  name: string;
  code: string | null;
  gstCode: string | null;
  type: string;
  countryCode: string;
}

interface DbPickupLocation {
  city: string;
  pincode: string;
}

export interface KycDocState {
  file: File | null;
  name: string;
  size: string;
  uploadedAt: string;
  status: "pending" | "uploaded" | "verified";
  previewUrl?: string;
}

export interface SellerRegistrationForm {
  // 1. Account & Owner
  ownerName: string;
  email: string;
  emailVerified: boolean;
  mobile: string;
  mobileVerified: boolean;
  altPhone: string;
  aadhaar: string;
  password: string;
  confirmPassword: string;

  // 2. Business & Tax
  businessName: string;
  businessType: BusinessType;
  gstin: string;
  pan: string;
  businessCategory: BusinessCategory | "";
  yearEstablished: string;
  monthlyTurnover: string;

  // 3. Store Profile
  storeName: string;
  storeSlug: string;
  storeDescription: string;
  websiteUrl: string;
  productCount: string;
  storeLogoUrl: string;
  storeBannerUrl: string;
  storeAccentColor: string;

  // 4. Pickup Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  shippingModel: "express" | "self";
  sameAsPickup: boolean;
  returnAddress: string;

  // 5. Bank Account & Settlements
  accountHolder: string;
  bankName: string;
  accountType: "Current Account" | "Savings Account";
  accountNumber: string;
  confirmAccount: string;
  ifsc: string;

  // 6. Settings & Declarations
  allowCOD: boolean;
  autoApprove: boolean;
  agreedToTerms: boolean;
  agreedToAntiCounterfeit: boolean;
}

const INITIAL_FORM: SellerRegistrationForm = {
  ownerName: "",
  email: "",
  emailVerified: false,
  mobile: "",
  mobileVerified: false,
  altPhone: "",
  aadhaar: "",
  password: "",
  confirmPassword: "",

  businessName: "",
  businessType: "Sole Proprietorship",
  gstin: "",
  pan: "",
  businessCategory: "Fashion",
  yearEstablished: "2021",
  monthlyTurnover: "₹5L–₹20L",

  storeName: "",
  storeSlug: "",
  storeDescription: "",
  websiteUrl: "",
  productCount: "50",
  storeLogoUrl: "",
  storeBannerUrl: "",
  storeAccentColor: "#009966",

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
  shippingModel: "express",
  sameAsPickup: true,
  returnAddress: "",

  accountHolder: "",
  bankName: "State Bank of India",
  accountType: "Current Account",
  accountNumber: "",
  confirmAccount: "",
  ifsc: "",

  allowCOD: true,
  autoApprove: true,
  agreedToTerms: false,
  agreedToAntiCounterfeit: false,
};

// ─── Indian States & UTs ──────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi (NCT)",
  "Jammu & Kashmir", "Ladakh", "Chandigarh", "Puducherry"
];

// ─── Popular Banks for One-Click Select ────────────────────────────────────────
const POPULAR_BANKS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
  "Punjab National Bank", "Kotak Mahindra Bank", "Bank of Baroda"
];

// ─── Categories with metadata ─────────────────────────────────────────────────
const CATEGORIES_DATA: Array<{ label: BusinessCategory; icon: string; desc: string }> = [
  { label: "Fashion",             icon: "👗", desc: "Sarees, kurtis, western & ethnic wear" },
  { label: "Electronics",         icon: "📱", desc: "Gadgets, mobiles, audio & accessories" },
  { label: "Grocery",             icon: "🌾", desc: "Spices, dry fruits, staples & pulses" },
  { label: "Beauty",              icon: "💄", desc: "Skincare, cosmetics & personal care" },
  { label: "Home & Living",       icon: "🛋️", desc: "Décor, kitchenware, bedding & furniture" },
  { label: "Sports",              icon: "🏏", desc: "Cricket gear, fitness equipment & activewear" },
  { label: "Books",               icon: "📚", desc: "Regional literature, educational & novels" },
  { label: "Toys",                icon: "🧸", desc: "Kids games, wooden toys & learning kits" },
  { label: "Handcrafted & Ethnic",icon: "🪔", desc: "Artisanal crafts, brassware & pottery" },
  { label: "Other",               icon: "📦", desc: "Specialty & multi-category goods" },
];

// ─── Step Metadata ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: "Owner & Login",      short: "Owner",     icon: User,      desc: "Personal & security credentials" },
  { id: 2, title: "Business & Tax",     short: "Business",  icon: Building2, desc: "GSTIN, PAN & legal entity" },
  { id: 3, title: "Store Profile",      short: "Store",     icon: Store,      desc: "Branding, slug & catalog" },
  { id: 4, title: "Pickup Location",    short: "Logistics", icon: MapPin,     desc: "Warehouse & shipping settings" },
  { id: 5, title: "Bank & Payouts",     short: "Bank",      icon: Landmark,   desc: "Weekly settlement account" },
  { id: 6, title: "KYC Documents",      short: "Documents", icon: FileCheck,  desc: "GST, PAN & Bank verification" },
  { id: 7, title: "Review & Submit",    short: "Review",    icon: ShieldCheck,desc: "Confirm details & agreement" },
];

export function SellerRegisterPage({ setPage }: { setPage: (p: Page) => void }) {
  const [step, setStep] = useState<number>(1);
  const [form, setForm] = useState<SellerRegistrationForm>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState<"email" | "mobile" | null>(null);
  const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(45);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; filename: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState("");
  const [draftToast, setDraftToast] = useState<string | null>(null);
  const [dbCategories, setDbCategories] = useState<DbCategoryItem[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<Record<string, DbCategoryItem[]>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Database-driven field options (Neon DB)
  const [dbBusinessTypes, setDbBusinessTypes] = useState<DbBusinessType[]>([]);
  const [loadingBusinessTypes, setLoadingBusinessTypes] = useState(true);

  const [dbTurnoverRanges, setDbTurnoverRanges] = useState<DbTurnoverRange[]>([]);
  const [loadingTurnoverRanges, setLoadingTurnoverRanges] = useState(true);

  const [dbCountries, setDbCountries] = useState<DbCountry[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [dbStates, setDbStates] = useState<DbState[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [pickupLocations, setPickupLocations] = useState<DbPickupLocation[]>([]);
  const [loadingPickupLocations, setLoadingPickupLocations] = useState(false);
  const [pickupLocationsError, setPickupLocationsError] = useState("");

  // Live Pincode DB verification
  const [isLookingUpPincode, setIsLookingUpPincode] = useState(false);
  const [pincodeHubInfo, setPincodeHubInfo] = useState<{
    office?: string;
    city?: string;
    state?: string;
    serviceable?: boolean;
    foundInDb?: boolean;
  } | null>(null);

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [validationBanner, setValidationBanner] = useState<string | null>(null);

  // KYC Uploads state (Aligned with Admin Manage Seller KYC)
  const [kycDocs, setKycDocs] = useState<{
    gstCert: KycDocState;
    panCard: KycDocState;
    aadhaarCard: KycDocState;
    bankProof: KycDocState;
    tradeLicense: KycDocState;
  }>({
    gstCert:      { file: null, name: "", size: "", uploadedAt: "", status: "pending" },
    panCard:      { file: null, name: "", size: "", uploadedAt: "", status: "pending" },
    aadhaarCard:  { file: null, name: "", size: "", uploadedAt: "", status: "pending" },
    bankProof:    { file: null, name: "", size: "", uploadedAt: "", status: "pending" },
    tradeLicense: { file: null, name: "", size: "", uploadedAt: "", status: "pending" },
  });

  // Load saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bharat_seller_registration_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.form) setForm(prev => ({ ...prev, ...parsed.form }));
        if (parsed.step) setStep(parsed.step);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Fetch Primary Business Categories from admin_categories database table
  useEffect(() => {
    let isMounted = true;
    setLoadingCategories(true);
    fetch("/api/seller/categories")
      .then(r => r.json())
      .then(data => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setDbCategories(data.categories);
          if (data.grouped) setGroupedCategories(data.grouped);
          // If no category is selected yet, preselect first database category
          setForm(prev => {
            if (!prev.businessCategory && data.categories[0]?.name) {
              return { ...prev, businessCategory: data.categories[0].name };
            }
            return prev;
          });
        }
        setLoadingCategories(false);
      })
      .catch(err => {
        console.warn("Failed to fetch admin_categories table:", err);
        if (isMounted) setLoadingCategories(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Business Types, Turnover Ranges, Countries & States from Neon DB tables
  useEffect(() => {
    let isMounted = true;
    setLoadingBusinessTypes(true);
    setLoadingTurnoverRanges(true);
    setLoadingCountries(true);
    setLoadingStates(true);

    fetch("/api/seller/options")
      .then(r => r.json())
      .then(data => {
        if (!isMounted) return;
        if (data.success) {
          if (Array.isArray(data.businessTypes) && data.businessTypes.length > 0) {
            setDbBusinessTypes(data.businessTypes);
            setForm(prev => {
              if (!prev.businessType) {
                return { ...prev, businessType: data.businessTypes[0].name };
              }
              return prev;
            });
          }
          if (Array.isArray(data.turnoverRanges) && data.turnoverRanges.length > 0) {
            setDbTurnoverRanges(data.turnoverRanges);
            setForm(prev => {
              if (!prev.monthlyTurnover) {
                return { ...prev, monthlyTurnover: data.turnoverRanges[0].label };
              }
              return prev;
            });
          }
          if (Array.isArray(data.countries) && data.countries.length > 0) {
            setDbCountries(data.countries);
            setForm(prev => {
              const savedCountryExists = data.countries.some(
                (country: DbCountry) => country.name === prev.country
              );
              const defaultCountry = data.countries.find((country: DbCountry) => country.isDefault);
              return {
                ...prev,
                country: savedCountryExists ? prev.country : defaultCountry?.name || "",
                state: savedCountryExists ? prev.state : "",
                city: savedCountryExists ? prev.city : "",
                pincode: savedCountryExists ? prev.pincode : "",
              };
            });
          } else {
            setDbCountries([]);
            setForm(prev => ({ ...prev, country: "", state: "", city: "", pincode: "" }));
          }
          if (Array.isArray(data.states) && data.states.length > 0) {
            setDbStates(data.states);
          }
        }
      })
      .catch(err => {
        console.warn("Failed to fetch registration options from DB:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingBusinessTypes(false);
          setLoadingTurnoverRanges(false);
          setLoadingCountries(false);
          setLoadingStates(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCountry = dbCountries.find(country => country.name === form.country);
  const selectedCountryCode = selectedCountry?.code || (form.country === "India" ? "IN" : "");
  const availableStates = dbStates.length > 0
    ? dbStates.filter(state => state.countryCode.toUpperCase() === selectedCountryCode.toUpperCase())
    : form.country === "India"
      ? INDIAN_STATES.map((name, index) => ({
          id: index,
          name,
          code: null,
          gstCode: null,
          type: "State",
          countryCode: "IN",
        }))
      : [];

  useEffect(() => {
    if (!selectedCountryCode || !form.state) {
      setPickupLocations([]);
      setPickupLocationsError("");
      setLoadingPickupLocations(false);
      return;
    }

    const controller = new AbortController();
    setPickupLocations([]);
    setPickupLocationsError("");
    setLoadingPickupLocations(true);

    fetch(
      `/api/seller/pincodes?countryCode=${encodeURIComponent(selectedCountryCode)}&state=${encodeURIComponent(form.state)}`,
      { signal: controller.signal }
    )
      .then(async response => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch pickup locations.");
        }
        return data.locations as DbPickupLocation[];
      })
      .then(locations => setPickupLocations(Array.isArray(locations) ? locations : []))
      .catch(error => {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch pickup locations:", error);
          setPickupLocationsError("Could not load cities for this state. You can enter the city and pincode manually.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingPickupLocations(false);
      });

    return () => controller.abort();
  }, [selectedCountryCode, form.state]);

  // Live Pincode Hub Lookup from admin_pincodes database table
  const lookupPincodeInDb = async (pin: string) => {
    if (pin.length !== 6) {
      setPincodeHubInfo(null);
      return;
    }

    setIsLookingUpPincode(true);
    try {
      const res = await fetch(`/api/seller/pincodes?pincode=${encodeURIComponent(pin)}`);
      const data = await res.json();
      if (data.success && data.found) {
        setPincodeHubInfo({
          office: data.office,
          city: data.city,
          state: data.state,
          serviceable: data.serviceable,
          foundInDb: true,
        });
      } else {
        setPincodeHubInfo({
          office: undefined,
          serviceable: true,
          foundInDb: false,
        });
      }
    } catch (err) {
      console.warn("Pincode lookup error:", err);
    } finally {
      setIsLookingUpPincode(false);
    }
  };

  // Update field helper
  const updateField = <K extends keyof SellerRegistrationForm>(
    key: K,
    val: SellerRegistrationForm[K]
  ) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      // Auto-generate store slug when storeName changes if user hasn't explicitly customized slug
      if (key === "storeName" && typeof val === "string") {
        const generatedSlug = val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        if (!prev.storeSlug || prev.storeSlug === prev.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
          next.storeSlug = generatedSlug;
        }
      }
      return next;
    });

    if (stepErrors[key as string]) {
      setStepErrors(prev => {
        const copy = { ...prev };
        delete copy[key as string];
        return copy;
      });
    }
  };

  // Step-by-step required fields validation
  const validateStep = (s: number): { valid: boolean; errors: Record<string, string>; message?: string } => {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!form.ownerName.trim()) {
        errs.ownerName = "Full Name is required";
      } else if (form.ownerName.trim().length < 3) {
        errs.ownerName = "Full Name must be at least 3 characters";
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!form.email.trim()) {
        errs.email = "Email Address is required";
      } else if (!emailPattern.test(form.email.trim())) {
        errs.email = "Enter a valid email address (e.g. name@domain.com)";
      }

      const mobileDigits = form.mobile.replace(/\D/g, "");
      if (!mobileDigits) {
        errs.mobile = "Mobile Number is required";
      } else if (mobileDigits.length !== 10) {
        errs.mobile = "Enter a valid 10-digit mobile number";
      }

      if (!form.password) {
        errs.password = "Password is required";
      } else if (form.password.length < 8) {
        errs.password = "Password must be at least 8 characters long";
      }

      if (!form.confirmPassword) {
        errs.confirmPassword = "Confirm password is required";
      } else if (form.confirmPassword !== form.password) {
        errs.confirmPassword = "Passwords do not match";
      }
    } else if (s === 2) {
      if (!form.businessName.trim()) {
        errs.businessName = "Registered Business Name is required";
      }
      if (!form.businessCategory.trim()) {
        errs.businessCategory = "Primary Business Category is required";
      }
      const gstinVal = form.gstin.trim();
      if (!gstinVal) {
        errs.gstin = "GSTIN Number is required";
      } else if (gstinVal.length !== 15) {
        errs.gstin = "GSTIN must be exactly 15 characters";
      }
      const panVal = form.pan.trim();
      if (!panVal) {
        errs.pan = "Company / Owner PAN is required";
      } else if (panVal.length !== 10) {
        errs.pan = "PAN must be exactly 10 characters";
      }
    } else if (s === 3) {
      if (!form.storeName.trim()) {
        errs.storeName = "Store / Brand Display Name is required";
      }
      if (!form.storeSlug.trim()) {
        errs.storeSlug = "Storefront URL slug is required";
      }
      if (!form.storeDescription.trim()) {
        errs.storeDescription = "Store description is required";
      }
    } else if (s === 4) {
      if (!form.addressLine1.trim()) {
        errs.addressLine1 = "Pickup address line 1 is required";
      }
      if (!form.city.trim()) {
        errs.city = "City is required";
      }
      if (!form.state.trim()) {
        errs.state = "State is required";
      }
      if (!form.country?.trim()) {
        errs.country = "Country is required";
      }
      const pin = form.pincode.replace(/\D/g, "");
      if (!pin) {
        errs.pincode = "Pincode is required";
      } else if (pin.length !== 6) {
        errs.pincode = "Enter a valid 6-digit pincode";
      }
    } else if (s === 5) {
      if (!form.accountHolder.trim()) {
        errs.accountHolder = "Account Holder Name is required";
      }
      if (!form.bankName.trim()) {
        errs.bankName = "Bank Name is required";
      }
      if (!form.ifsc.trim()) {
        errs.ifsc = "IFSC code is required";
      } else if (form.ifsc.trim().length !== 11) {
        errs.ifsc = "IFSC code must be 11 characters";
      }
      if (!form.accountNumber.trim()) {
        errs.accountNumber = "Bank Account Number is required";
      }
      if (!form.confirmAccount.trim()) {
        errs.confirmAccount = "Please confirm account number";
      } else if (form.confirmAccount !== form.accountNumber) {
        errs.confirmAccount = "Account numbers do not match";
      }
    } else if (s === 6) {
      if (kycDocs.gstCert.status !== "verified") {
        errs.gstCert = "GST Registration Certificate is required";
      }
      if (kycDocs.panCard.status !== "verified") {
        errs.panCard = "Company / Owner PAN Card copy is required";
      }
      if (kycDocs.bankProof.status !== "verified") {
        errs.bankProof = "Cancelled Cheque or Bank Passbook is required";
      }
    } else if (s === 7) {
      if (!form.agreedToTerms) {
        errs.agreedToTerms = "Please agree to the BharatBazar Merchant Agreement";
      }
      if (!form.agreedToAntiCounterfeit) {
        errs.agreedToAntiCounterfeit = "Please confirm the Genuine Products Guarantee";
      }
    }

    const valid = Object.keys(errs).length === 0;
    return {
      valid,
      errors: errs,
      message: valid ? undefined : Object.values(errs)[0],
    };
  };

  const handleNextStep = () => {
    const check = validateStep(step);
    if (!check.valid) {
      setStepErrors(check.errors);
      setValidationBanner(check.message || "Please complete all required fields marked with * before moving to next step.");
      window.scrollTo({ top: 140, behavior: "smooth" });
      return;
    }
    setStepErrors({});
    setValidationBanner(null);
    if (step < STEPS.length) {
      setStep(step + 1);
      window.scrollTo({ top: 140, behavior: "smooth" });
    }
  };

  const handleJumpToStep = (targetStep: number) => {
    if (targetStep < step) {
      setStepErrors({});
      setValidationBanner(null);
      setStep(targetStep);
      window.scrollTo({ top: 140, behavior: "smooth" });
      return;
    }
    if (targetStep === step) return;

    for (let s = 1; s < targetStep; s++) {
      const check = validateStep(s);
      if (!check.valid) {
        setStep(s);
        setStepErrors(check.errors);
        setValidationBanner(`Please complete required fields in Step ${s} (${STEPS[s - 1].title}) before moving forward.`);
        window.scrollTo({ top: 140, behavior: "smooth" });
        return;
      }
    }
    setStepErrors({});
    setValidationBanner(null);
    setStep(targetStep);
    window.scrollTo({ top: 140, behavior: "smooth" });
  };

  // Save draft helper
  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        "bharat_seller_registration_draft",
        JSON.stringify({ form, step, savedAt: new Date().toISOString() })
      );
      setDraftToast("Draft saved successfully! You can resume anytime.");
      setTimeout(() => setDraftToast(null), 3500);
    } catch {
      // Ignore
    }
  };

  const handleClearDraft = () => {
    if (confirm("Reset all fields and start fresh?")) {
      localStorage.removeItem("bharat_seller_registration_draft");
      setForm(INITIAL_FORM);
      setStep(1);
      setDraftToast("Form reset to default.");
      setTimeout(() => setDraftToast(null), 3000);
    }
  };

  // Mock File Upload Simulator
  const handleMockUpload = (
    docKey: keyof typeof kycDocs,
    mockFileName: string,
    mockSize: string
  ) => {
    setKycDocs(prev => ({
      ...prev,
      [docKey]: {
        file: null,
        name: mockFileName,
        size: mockSize,
        uploadedAt: "Just now",
        status: "verified",
      },
    }));
  };

  const handleRemoveDoc = (docKey: keyof typeof kycDocs) => {
    setKycDocs(prev => ({
      ...prev,
      [docKey]: {
        file: null,
        name: "",
        size: "",
        uploadedAt: "",
        status: "pending",
      },
    }));
  };

  // Real File Upload Handlers for Store Logo & Banner (Stored in "seller-file" bucket)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Logo image size should be under 5MB");
      return;
    }
    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      updateField("storeLogoUrl", event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to bucket "seller-file"
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "logo");
      formData.append("tempId", `seller_${Date.now()}`);

      const res = await fetch("/api/seller/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        updateField("storeLogoUrl", data.url);
      }
    } catch (err) {
      console.warn("Could not save logo to seller-file bucket:", err);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Banner image size should be under 10MB");
      return;
    }
    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      updateField("storeBannerUrl", event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to bucket "seller-file"
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "banner");
      formData.append("tempId", `seller_${Date.now()}`);

      const res = await fetch("/api/seller/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        updateField("storeBannerUrl", data.url);
      }
    } catch (err) {
      console.warn("Could not save banner to seller-file bucket:", err);
    }
  };

  // Real Document Upload to "seller-file" bucket
  const handleRealDocUpload = async (docKey: keyof typeof kycDocs, file: File) => {
    setUploadingDoc(docKey);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", docKey);
      formData.append("tempId", `seller_docs_${Date.now()}`);

      const res = await fetch("/api/seller/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to upload document to seller-file bucket");
        setUploadingDoc(null);
        return;
      }

      setKycDocs(prev => ({
        ...prev,
        [docKey]: {
          file,
          name: data.name || file.name,
          size: data.size || `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: "Just now",
          status: "verified",
          previewUrl: data.url,
        },
      }));
      setUploadingDoc(null);
    } catch (err: any) {
      alert("Document upload error: " + (err?.message || "Please try again."));
      setUploadingDoc(null);
    }
  };

  // OTP Timer countdown
  useEffect(() => {
    if (!showOtpModal) return;
    setOtpTimer(45);
    const interval = setInterval(() => {
      setOtpTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtpModal]);

  const verifyOtp = () => {
    if (showOtpModal === "email") {
      updateField("emailVerified", true);
    } else if (showOtpModal === "mobile") {
      updateField("mobileVerified", true);
    }
    setShowOtpModal(null);
    setOtpInput(["", "", "", "", "", ""]);
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = form.password;
    if (!pwd) return { score: 0, label: "Empty", color: "#9ca3af" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score: 25, label: "Weak", color: "#ef4444" };
    if (score === 2) return { score: 50, label: "Fair", color: "#f59e0b" };
    if (score === 3) return { score: 75, label: "Good", color: "#3b82f6" };
    return { score: 100, label: "Strong & Secure", color: G };
  }, [form.password]);

  // Real-time Readiness & Completeness Calculation
  const readiness = useMemo(() => {
    let score = 0;
    const items: Array<{ label: string; passed: boolean }> = [];

    // 1. Owner & Login
    const ownerPassed = !!(form.ownerName.trim() && form.email.trim() && form.mobile.trim());
    items.push({ label: "Owner & Contact Details", passed: ownerPassed });
    if (ownerPassed) score += 18;

    // 2. Business & Tax
    const gstPassed = !!(form.businessName.trim() && form.gstin.trim().length >= 14 && form.pan.trim().length >= 9);
    items.push({ label: "GSTIN & PAN Identification", passed: gstPassed });
    if (gstPassed) score += 20;

    // 3. Store Profile
    const storePassed = !!(form.storeName.trim() && form.storeDescription.trim());
    items.push({ label: "Store Branding & Catalog Info", passed: storePassed });
    if (storePassed) score += 18;

    // 4. Pickup Address
    const addressPassed = !!(form.addressLine1.trim() && form.city.trim() && form.pincode.trim().length === 6 && form.country?.trim());
    items.push({ label: "Pickup Warehouse & Pincode", passed: addressPassed });
    if (addressPassed) score += 16;

    // 5. Bank Account
    const bankPassed = !!(form.accountHolder.trim() && form.accountNumber.trim() && form.ifsc.trim());
    items.push({ label: "Bank Account for Payouts", passed: bankPassed });
    if (bankPassed) score += 16;

    // 6. KYC Docs
    const kycCount = [
      kycDocs.gstCert.status === "verified",
      kycDocs.panCard.status === "verified",
      kycDocs.bankProof.status === "verified",
    ].filter(Boolean).length;
    const kycPassed = kycCount >= 2;
    items.push({ label: "KYC Documents Attached", passed: kycPassed });
    if (kycPassed) score += 12;

    return { score: Math.min(score, 100), items };
  }, [form, kycDocs]);

  // Submission handler connected to Neon DB & "seller-file" bucket
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        ownerName: form.ownerName,
        email: form.email,
        password: form.password,
        mobile: form.mobile,
        altPhone: form.altPhone,
        aadhaar: form.aadhaar,
        emailVerified: form.emailVerified,
        mobileVerified: form.mobileVerified,

        businessName: form.businessName,
        businessType: form.businessType,
        gstin: form.gstin,
        pan: form.pan,
        businessCategory: form.businessCategory,
        yearEstablished: form.yearEstablished,
        monthlyTurnover: form.monthlyTurnover,

        storeName: form.storeName,
        storeSlug: form.storeSlug,
        storeDescription: form.storeDescription,
        websiteUrl: form.websiteUrl,
        productCount: form.productCount,
        storeLogoUrl: form.storeLogoUrl,
        storeBannerUrl: form.storeBannerUrl,
        storeAccentColor: form.storeAccentColor,

        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country || "India",
        shippingModel: form.shippingModel,
        sameAsPickup: form.sameAsPickup,
        returnAddress: form.returnAddress,

        accountHolder: form.accountHolder,
        bankName: form.bankName,
        accountType: form.accountType,
        accountNumber: form.accountNumber,
        ifsc: form.ifsc,

        gstDocUrl: kycDocs.gstCert.previewUrl || kycDocs.gstCert.name,
        panDocUrl: kycDocs.panCard.previewUrl || kycDocs.panCard.name,
        aadhaarDocUrl: kycDocs.aadhaarCard.previewUrl || kycDocs.aadhaarCard.name,
        bankDocUrl: kycDocs.bankProof.previewUrl || kycDocs.bankProof.name,
        tradeLicenseUrl: kycDocs.tradeLicense.previewUrl || kycDocs.tradeLicense.name,

        allowCOD: form.allowCOD,
        autoApprove: form.autoApprove,
      };

      const res = await fetch("/api/seller/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data.message || "Failed to register seller in database.");
        setIsSubmitting(false);
        return;
      }

      setApplicationId(data.seller?.applicationId || `BB-SLR-${String(data.seller?.id || "000001").padStart(6, "0")}`);
      setIsSubmitted(true);
      setIsSubmitting(false);
      localStorage.removeItem("bharat_seller_registration_draft");

      // Confetti celebration
      try {
        const module = await import("canvas-confetti");
        const confetti = module.default;
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#009966", "#00cc88", "#fbbf24", "#10b981", "#3b82f6"],
        });
      } catch {
        // Fallback
      }
    } catch (err: any) {
      setSubmitError(err?.message || "An unexpected error occurred during registration.");
      setIsSubmitting(false);
    }
  };

  // Reusable styling helpers
  const inputStyle =
    "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all font-sans";
  const labelStyle =
    "block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5";

  // ─────────────────────────────────────────────────────────────────────────────
  // SUCCESS / CELEBRATION VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl w-full bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-6 sm:p-10 text-center relative"
        >
          {/* Top glowing radial */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none blur-3xl"
            style={{ background: G }}
          />

          {/* Success Animated Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15, delay: 0.15 }}
            className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-[#009966]/25 mb-6"
            style={{ background: `linear-gradient(135deg, ${G}, #00cc88)` }}
          >
            <CheckCircle2 size={44} className="text-white stroke-[2.5]" />
          </motion.div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 mb-3">
            <Sparkles size={13} className="text-emerald-600" />
            Registration Application Submitted
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
            Welcome to the BharatBazar Merchant Family!
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto mb-8">
            Your seller registration has been securely routed to the Admin Manage Seller KYC team.
            Your shop storefront is currently being provisioned.
          </p>

          {/* Application Reference Box */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-5 mb-8 text-left max-w-lg mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Application Reference ID</span>
              <span className="text-xs font-mono font-black text-[#009966] bg-[#009966]/10 px-2.5 py-1 rounded-lg">
                {applicationId}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
              <div>
                <p className="text-gray-400 font-medium">Business / Shop Name</p>
                <p className="font-bold text-gray-800 mt-0.5 truncate">{form.storeName || form.businessName || "Your Store"}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Verification Status</p>
                <p className="font-bold text-amber-600 flex items-center gap-1 mt-0.5">
                  <Clock size={12} /> Pending Verification
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Registered Mobile</p>
                <p className="font-bold text-gray-800 mt-0.5">{form.mobile || "+91 98765 43210"}</p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Expected Approval</p>
                <p className="font-bold text-gray-800 mt-0.5">Under 12-24 Hours</p>
              </div>
            </div>
          </div>

          {/* Onboarding Next Steps Timeline */}
          <div className="text-left max-w-lg mx-auto mb-8 space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400">What happens next?</p>
            <div className="space-y-2.5">
              {[
                { title: "1. Document Verification", desc: "Admin reviews GSTIN, PAN, and Bank details", status: "In Progress", active: true },
                { title: "2. WhatsApp & SMS Confirmation", desc: "You will receive an activation SMS with your merchant credentials", status: "Queued", active: false },
                { title: "3. Catalog Upload & Doorstep Pickup Setup", desc: "List your first product and begin receiving orders from 2Cr+ shoppers", status: "Upcoming", active: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-black ${
                      item.active ? "bg-[#009966] text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-800">{item.title}</p>
                      <span className={`text-[10px] font-bold ${item.active ? "text-[#009966]" : "text-gray-400"}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setPage("seller-login")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-black text-white shadow-lg transition-all"
              style={{ background: G, boxShadow: `0 8px 25px ${G}35` }}
            >
              Go to Seller Login →
            </motion.button>
            <button
              onClick={() => setPage("home")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Return to Marketplace
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN REGISTRATION FORM VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f7f9fa] text-gray-900 pb-16">

      {/* ── TOP HEADER / PORTAL NAVIGATION BAR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">

          {/* Brand Logo & Portal Tag */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setPage("home")}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-[#009966]/20 shrink-0"
                style={{ background: `linear-gradient(135deg, ${G}, #00cc88)` }}
              >
                <ShoppingBag size={20} className="text-white" />
              </div>
              <div className="leading-tight">
                <span className="text-lg font-black text-gray-900 tracking-tight">
                  Bharat<span style={{ color: G }}>Bazar</span>
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#009966] bg-[#009966]/10 px-1.5 py-0.5 rounded">
                    Seller Portal
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">• Vendor Onboarding</span>
                </div>
              </div>
            </button>
          </div>

          {/* Step indicator pill & Progress (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-black text-gray-800">
                Step {step} of {STEPS.length}: {STEPS[step - 1].title}
              </p>
              <p className="text-[11px] text-gray-400 font-medium">
                {readiness.score}% Onboarding Completeness
              </p>
            </div>
            {/* Circular mini progress */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="#e5e7eb" strokeWidth="3" fill="transparent" />
                <circle
                  cx="20" cy="20" r="16"
                  stroke={G}
                  strokeWidth="3"
                  strokeDasharray={100}
                  strokeDashoffset={100 - readiness.score}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-gray-700">{readiness.score}%</span>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              title="Save draft"
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Save size={14} className="text-gray-500" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelpDrawer(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 px-3 py-2 rounded-xl transition-colors"
            >
              <HelpCircle size={14} />
              <span className="hidden sm:inline">Seller Support</span>
            </button>

            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            <button
              onClick={() => setPage("seller-login")}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Already registered? <span className="font-black text-[#009966] underline">Sign In</span>
            </button>
          </div>
        </div>

        {/* Linear progress bar across header bottom */}
        <div className="w-full bg-gray-100 h-1 relative overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#009966] to-[#00cc88]"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / STEPS.length) * 100}%` }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
        </div>
      </header>

      {/* Draft Notification Toast */}
      <AnimatePresence>
        {draftToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{draftToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SECOND HEADER: SIMPLE & AUTHENTIC MERCHANT ONBOARDING STEPS ── */}
      <section className="bg-white border-b border-gray-200 shadow-xs relative">
        {/* Top subtle tri-color hairline accent for authentic Bharat identity */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[#ff9933] via-white to-[#009966]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">

          {/* ── TOP AUTHENTICATION & TRUST RIBBON ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
            {/* Left: Official Portal Verification Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#009966] shrink-0">
                <ShieldCheck size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black text-[#009966] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Official Merchant Portal
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-black text-gray-800">
                    Step {step} of {STEPS.length}: {STEPS[step - 1].title}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#007a52] border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    In Progress
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {STEPS[step - 1].desc}
                </p>
              </div>
            </div>

            {/* Right: Security & Authentication Badges + Controls */}
            <div className="flex items-center gap-3 flex-wrap justify-between sm:justify-end">
              <div className="hidden lg:flex items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 font-medium">
                  <Lock size={12} className="text-emerald-600" /> 256-Bit SSL Encrypted
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 font-medium">
                  <Landmark size={12} className="text-blue-600" /> RBI Escrow Protected
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 font-medium">
                  <FileText size={12} className="text-amber-600" /> GSTIN Compliant
                </span>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={() => handleJumpToStep(step - 1)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back
                </button>
                <button
                  type="button"
                  disabled={step === STEPS.length}
                  onClick={handleNextStep}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#009966] hover:bg-[#007a52] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  Continue <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ── SIMPLE CONNECTED TIMELINE STEPPER ── */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <div className="relative min-w-[780px] py-1">

              {/* Connecting Background Line */}
              <div className="absolute top-[22px] left-[32px] right-[32px] h-[2px] bg-gray-200 -z-0">
                <div
                  className="h-full bg-[#009966] transition-all duration-300"
                  style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {/* 7 Step Nodes */}
              <div className="grid grid-cols-7 gap-2 relative z-10">
                {STEPS.map((s) => {
                  const isCurrent = step === s.id;
                  const isCompleted = step > s.id;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleJumpToStep(s.id)}
                      className="flex flex-col items-center text-center group cursor-pointer focus:outline-none"
                    >
                      {/* Step Circle */}
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-black transition-all duration-200 ${
                          isCompleted
                            ? "bg-[#009966] text-white shadow-xs"
                            : isCurrent
                            ? "bg-[#009966] text-white ring-4 ring-[#009966]/20 shadow-sm"
                            : "bg-white border-2 border-gray-300 text-gray-400 group-hover:border-gray-400 group-hover:text-gray-600"
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={18} className="stroke-[3]" />
                        ) : (
                          <span>{s.id}</span>
                        )}
                      </div>

                      {/* Step Title & Status */}
                      <div className="mt-2 w-full">
                        <p
                          className={`text-xs font-bold truncate leading-tight ${
                            isCurrent
                              ? "text-[#009966]"
                              : isCompleted
                              ? "text-gray-800 group-hover:text-[#009966]"
                              : "text-gray-500 group-hover:text-gray-700"
                          }`}
                        >
                          {s.title}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 font-bold flex items-center justify-center gap-1 ${
                            isCurrent
                              ? "text-[#009966]"
                              : isCompleted
                              ? "text-emerald-600"
                              : "text-gray-400"
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#009966] animate-pulse" />
                              In Progress
                            </>
                          ) : isCompleted ? (
                            "Completed ✓"
                          ) : (
                            `Step ${s.id}`
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ═══════════════════════════════════════════════════════════
              LEFT COLUMN: STEP WIZARD FORM (7 COLS / 8 COLS)
             ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-6">

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8"
              >
                {/* Step Section Header */}
                <div className="flex items-start justify-between pb-6 border-b border-gray-100 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-[#009966] bg-[#009966]/10 mb-2">
                      <Sparkles size={12} />
                      Manage Seller Alignment • Section {step} of 7
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                      {STEPS[step - 1].title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {STEPS[step - 1].desc}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <span className="text-xs font-mono font-bold text-gray-400">
                      Step {step} / {STEPS.length}
                    </span>
                  </div>
                </div>

                {/* Step Validation Banner if user tried to move without required fields */}
                {validationBanner && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 mb-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 text-xs font-semibold shadow-xs"
                  >
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-black text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        Incomplete Required Fields
                      </p>
                      <p className="text-amber-800 mt-1 leading-relaxed">{validationBanner}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setValidationBanner(null)}
                      className="text-amber-500 hover:text-amber-800 p-1 cursor-pointer"
                      title="Dismiss"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                )}

                {/* ════════════════════════════════════════════════════════
                    STEP 1: OWNER & SECURITY CREDENTIALS
                   ════════════════════════════════════════════════════════ */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3">
                      <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900 leading-relaxed">
                        <strong className="font-bold">Government ID Matching:</strong> Please provide the legal name exactly as shown on your PAN Card or Aadhaar Card. This is verified during Admin KYC review.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Owner Full Name */}
                      <div className="sm:col-span-2">
                        <label className={labelStyle}>Owner / Authorized Signatory Full Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={form.ownerName}
                            onChange={e => updateField("ownerName", e.target.value)}
                            placeholder="e.g. Rajesh Kumar Sharma"
                            className={`${inputStyle} pl-10 ${
                              stepErrors.ownerName ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                            }`}
                          />
                        </div>
                        {stepErrors.ownerName && (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.ownerName}
                          </p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>Email Address <span className="text-red-500">*</span></label>
                          {form.emailVerified ? (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 size={12} /> Verified
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowOtpModal("email")}
                              disabled={!form.email}
                              className="text-[10px] font-bold text-[#009966] hover:underline disabled:opacity-40"
                            >
                              Verify with OTP
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={form.email}
                            onChange={e => updateField("email", e.target.value)}
                            placeholder="seller@example.com"
                            className={`${inputStyle} pl-10 ${
                              stepErrors.email ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                            }`}
                          />
                        </div>
                        {stepErrors.email && (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.email}
                          </p>
                        )}
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>Primary Mobile Number <span className="text-red-500">*</span></label>
                          {form.mobileVerified ? (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 size={12} /> Verified
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowOtpModal("mobile")}
                              disabled={!form.mobile}
                              className="text-[10px] font-bold text-[#009966] hover:underline disabled:opacity-40"
                            >
                              Verify via OTP
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={form.mobile}
                            onChange={e => updateField("mobile", e.target.value.replace(/\D/g, ""))}
                            placeholder="98765 43210"
                            className={`${inputStyle} pl-12 ${
                              stepErrors.mobile ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                            }`}
                          />
                        </div>
                        {stepErrors.mobile && (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.mobile}
                          </p>
                        )}
                      </div>

                      {/* Alternate Phone */}
                      <div>
                        <label className={labelStyle}>Alternate / WhatsApp Business Phone</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            maxLength={10}
                            value={form.altPhone}
                            onChange={e => updateField("altPhone", e.target.value.replace(/\D/g, ""))}
                            placeholder="91234 56789"
                            className={`${inputStyle} pl-10`}
                          />
                        </div>
                      </div>

                      {/* Aadhaar Number */}
                      <div>
                        <label className={labelStyle}>Aadhaar Number (UIDAI)</label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={14}
                            value={form.aadhaar}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
                              const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
                              updateField("aadhaar", formatted);
                            }}
                            placeholder="XXXX XXXX XXXX"
                            className={`${inputStyle} font-mono tracking-wider`}
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className={labelStyle}>Create Seller Account Password <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={e => updateField("password", e.target.value)}
                            placeholder="Min. 8 characters"
                            className={`${inputStyle} pl-10 pr-10 ${
                              stepErrors.password ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {stepErrors.password ? (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.password}
                          </p>
                        ) : form.password ? (
                          <div className="mt-2 space-y-1">
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full transition-all duration-300"
                                style={{ width: `${passwordStrength.score}%`, background: passwordStrength.color }}
                              />
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: passwordStrength.color }}>
                              Strength: {passwordStrength.label}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className={labelStyle}>Confirm Password <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={e => updateField("confirmPassword", e.target.value)}
                            placeholder="Re-enter password"
                            className={`${inputStyle} pl-10 pr-10 ${
                              stepErrors.confirmPassword || (form.confirmPassword && form.confirmPassword !== form.password)
                                ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20"
                                : ""
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {(stepErrors.confirmPassword || (form.confirmPassword && form.confirmPassword !== form.password)) && (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.confirmPassword || "Passwords do not match"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    STEP 2: BUSINESS & TAX VERIFICATION (GST & PAN)
                   ════════════════════════════════════════════════════════ */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Legal Business Name */}
                      <div className="sm:col-span-2">
                        <label className={labelStyle}>Registered Business / Enterprise Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={form.businessName}
                          onChange={e => updateField("businessName", e.target.value)}
                          placeholder="e.g. Sharma Textiles & Crafts Pvt Ltd"
                          className={`${inputStyle} ${
                            stepErrors.businessName ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                          }`}
                        />
                        {stepErrors.businessName ? (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.businessName}
                          </p>
                        ) : (
                          <p className="text-[11px] text-gray-400 mt-1">As registered on your GST Certificate or Trade License</p>
                        )}
                      </div>

                      {/* Business Structure (Database-driven from admin_business_types) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>Business Constitution / Type <span className="text-red-500">*</span></label>
                          {loadingBusinessTypes ? (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                              <Loader2 size={11} className="animate-spin text-[#009966]" /> Fetching DB types...
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {dbBusinessTypes.length > 0 ? `${dbBusinessTypes.length} Types from DB` : "Standard Types"}
                            </span>
                          )}
                        </div>
                        <select
                          value={form.businessType}
                          onChange={e => updateField("businessType", e.target.value)}
                          className={`${inputStyle} cursor-pointer`}
                        >
                          {dbBusinessTypes.length > 0 ? (
                            dbBusinessTypes.map(bt => (
                              <option key={bt.id} value={bt.name} title={bt.description || undefined}>
                                {bt.name}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Sole Proprietorship">Sole Proprietorship</option>
                              <option value="Partnership">Partnership</option>
                              <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                              <option value="LLP">Limited Liability Partnership (LLP)</option>
                              <option value="Public Limited">Public Limited</option>
                              <option value="One Person Company (OPC)">One Person Company (OPC)</option>
                              <option value="Trust / Society / NGO">Trust / Society / NGO</option>
                            </>
                          )}
                        </select>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Fetched dynamically from BharatBazar <span className="font-mono text-gray-600 bg-gray-100 px-1 py-0.5 rounded">admin_business_types</span> table
                        </p>
                      </div>

                      {/* Business Category (Fetched dynamically from admin_categories database table) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>Primary Business Category <span className="text-red-500">*</span></label>
                          {loadingCategories ? (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                              <Loader2 size={11} className="animate-spin text-[#009966]" /> Fetching DB categories...
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {dbCategories.length} Categories from DB
                            </span>
                          )}
                        </div>
                        <select
                          value={form.businessCategory}
                          onChange={e => updateField("businessCategory", e.target.value)}
                          className={`${inputStyle} cursor-pointer ${
                            stepErrors.businessCategory ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                          }`}
                        >
                          <option value="" disabled>-- Select Primary Business Category --</option>
                          {Object.keys(groupedCategories).length > 0
                            ? Object.entries(groupedCategories).map(([groupName, items]) => (
                                <optgroup key={groupName} label={groupName}>
                                  {items.map(c => (
                                    <option key={c.id} value={c.name}>
                                      {c.emoji ? `${c.emoji} ` : ""} {c.name}
                                    </option>
                                  ))}
                                </optgroup>
                              ))
                            : dbCategories.length > 0
                            ? dbCategories.map(c => (
                                <option key={c.id} value={c.name}>
                                  {c.emoji ? `${c.emoji} ` : ""} {c.name}
                                </option>
                              ))
                            : CATEGORIES_DATA.map(c => (
                                <option key={c.label} value={c.label}>
                                  {c.icon} {c.label}
                                </option>
                              ))}
                        </select>
                        {stepErrors.businessCategory ? (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.businessCategory}
                          </p>
                        ) : (
                          <p className="text-[11px] text-gray-400 mt-1">
                            Fetched dynamically from BharatBazar <span className="font-mono text-gray-600 bg-gray-100 px-1 py-0.5 rounded">admin_categories</span> table
                          </p>
                        )}
                      </div>

                      {/* GSTIN Input with Live breakdown */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>GSTIN Number <span className="text-red-500">*</span></label>
                          {form.gstin.length === 15 && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Valid 15-Digit Format
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={15}
                          value={form.gstin}
                          onChange={e => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                            updateField("gstin", val);
                            // Auto-extract PAN from characters 3-12 of GSTIN if PAN is empty!
                            if (val.length >= 12 && !form.pan) {
                              updateField("pan", val.slice(2, 12));
                            }
                          }}
                          placeholder="27AAAAA0000A1Z5"
                          className={`${inputStyle} font-mono uppercase tracking-wider ${
                            stepErrors.gstin ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                          }`}
                        />
                        {stepErrors.gstin ? (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.gstin}
                          </p>
                        ) : (
                          <p className="text-[11px] text-gray-400 mt-1">
                            Format: 2 Digit State Code + 10 Char PAN + Entity Code + Z + Checksum
                          </p>
                        )}
                      </div>

                      {/* PAN Number */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>Company / Owner PAN Number <span className="text-red-500">*</span></label>
                          {form.pan.length === 10 && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Valid 10-Digit PAN
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={10}
                          value={form.pan}
                          onChange={e => updateField("pan", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                          placeholder="AAAAA9999A"
                          className={`${inputStyle} font-mono uppercase tracking-wider ${
                            stepErrors.pan ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                          }`}
                        />
                        {stepErrors.pan && (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.pan}
                          </p>
                        )}
                      </div>

                      {/* Year Established */}
                      <div>
                        <label className={labelStyle}>Year Established</label>
                        <input
                          type="number"
                          min={1950}
                          max={new Date().getFullYear()}
                          value={form.yearEstablished}
                          onChange={e => updateField("yearEstablished", e.target.value)}
                          placeholder="2020"
                          className={inputStyle}
                        />
                      </div>

                      {/* Monthly Turnover Range (Database-driven from admin_turnover_ranges) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>Estimated Monthly Turnover</label>
                          {loadingTurnoverRanges ? (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                              <Loader2 size={11} className="animate-spin text-[#009966]" /> Fetching DB tiers...
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {dbTurnoverRanges.length > 0 ? `${dbTurnoverRanges.length} Tiers from DB` : "Standard Tiers"}
                            </span>
                          )}
                        </div>
                        <select
                          value={form.monthlyTurnover}
                          onChange={e => updateField("monthlyTurnover", e.target.value)}
                          className={`${inputStyle} cursor-pointer`}
                        >
                          {dbTurnoverRanges.length > 0 ? (
                            dbTurnoverRanges.map(tr => (
                              <option key={tr.id} value={tr.label}>
                                {tr.displayText || tr.label}
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Below ₹1L">Below ₹1 Lakh</option>
                              <option value="₹1L–₹5L">₹1 Lakh – ₹5 Lakhs</option>
                              <option value="₹5L–₹20L">₹5 Lakhs – ₹20 Lakhs</option>
                              <option value="₹20L–₹50L">₹20 Lakhs – ₹50 Lakhs</option>
                              <option value="₹50L–₹1Cr">₹50 Lakhs – ₹1 Crore</option>
                              <option value="Above ₹1Cr">Above ₹1 Crore</option>
                            </>
                          )}
                        </select>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Fetched dynamically from BharatBazar <span className="font-mono text-gray-600 bg-gray-100 px-1 py-0.5 rounded">admin_turnover_ranges</span> table
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    STEP 3: STORE PROFILE & BRANDING
                   ════════════════════════════════════════════════════════ */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Store Display Name */}
                      <div className="sm:col-span-2">
                        <label className={labelStyle}>Store / Brand Display Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={form.storeName}
                            onChange={e => updateField("storeName", e.target.value)}
                            placeholder="e.g. Sharma Fashion Hub"
                            className={`${inputStyle} pl-10`}
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">This name appears to customers on product pages and search results.</p>
                      </div>

                      {/* Store URL Slug preview & customizer */}
                      <div className="sm:col-span-2">
                        <label className={labelStyle}>Storefront Custom URL Slug</label>
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#009966] focus-within:ring-2 focus-within:ring-[#009966]/20 transition-all">
                          <span className="bg-gray-100 text-gray-500 px-3.5 py-3 text-xs font-mono font-medium border-r border-gray-200 shrink-0">
                            bharatbazar.com/store/
                          </span>
                          <input
                            type="text"
                            value={form.storeSlug}
                            onChange={e => updateField("storeSlug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                            placeholder="your-store-handle"
                            className="flex-1 bg-transparent px-3 py-3 text-sm font-mono text-gray-800 outline-none"
                          />
                          <span className="px-3 text-xs font-bold text-emerald-600 bg-emerald-50 h-full flex items-center border-l border-emerald-200 shrink-0">
                            ✓ Available
                          </span>
                        </div>
                      </div>

                      {/* ── INSIDE SECTION: STORE BANNER & PROFILE BRANDING ── */}
                      <div className="sm:col-span-2 rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/90 to-white p-4 sm:p-5 shadow-xs space-y-4">
                        {/* Inside Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200/80">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-[#009966] flex items-center justify-center shrink-0">
                              <ImageIcon size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                Store Visual Identity & Branding
                                <span className="text-[10px] font-bold text-[#009966] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  Banner & Logo
                                </span>
                              </h4>
                              <p className="text-xs text-gray-500">
                                Upload your official store logo / profile photo and storefront cover banner
                              </p>
                            </div>
                          </div>
                          <div className="text-[10px] font-mono text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shrink-0 self-start sm:self-center">
                            Banner: 1200×400px • Logo: 500×500px
                          </div>
                        </div>

                        {/* Interactive Live Canvas: Cover Banner with Overlaid Avatar */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                            Storefront Header Live Preview
                          </label>

                          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
                            {/* 1. Cover Banner Canvas */}
                            <div
                              className="w-full h-40 sm:h-48 relative bg-cover bg-center transition-all duration-300 flex items-start justify-end p-3.5"
                              style={{
                                backgroundImage: form.storeBannerUrl ? `url(${form.storeBannerUrl})` : undefined,
                                background: form.storeBannerUrl
                                  ? undefined
                                  : `linear-gradient(135deg, #0d2318 0%, #164e32 50%, ${form.storeAccentColor || G} 100%)`,
                              }}
                            >
                              {/* Dark gradient overlay at bottom for readability */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                              {/* Banner Action Buttons (Top-Right) */}
                              <div className="relative z-10 flex items-center gap-2">
                                <label
                                  htmlFor="store-banner-upload-input"
                                  className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer shadow-sm"
                                >
                                  <Camera size={13} />
                                  <span>{form.storeBannerUrl ? "Change Banner" : "Upload Banner"}</span>
                                </label>
                                <input
                                  id="store-banner-upload-input"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleBannerUpload}
                                  className="hidden"
                                />

                                {form.storeBannerUrl && (
                                  <button
                                    type="button"
                                    onClick={() => updateField("storeBannerUrl", "")}
                                    className="p-1.5 rounded-xl bg-black/60 hover:bg-red-600/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
                                    title="Remove Banner"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>

                              {/* Storefront Verification Pill on Banner */}
                              <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
                                <ShieldCheck size={12} className="text-emerald-400" />
                                <span>BharatBazar Verified Storefront</span>
                              </div>
                            </div>

                            {/* 2. Store Profile / Logo (Overlaid bottom-left) */}
                            <div className="px-5 pb-4 pt-0 -mt-10 sm:-mt-12 relative z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                              <div className="flex items-end gap-3.5">
                                {/* Avatar frame */}
                                <div className="relative group">
                                  <div
                                    className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl font-black shrink-0 overflow-hidden relative bg-cover bg-center"
                                    style={{ background: form.storeAccentColor || G }}
                                  >
                                    {form.storeLogoUrl ? (
                                      <img
                                        src={form.storeLogoUrl}
                                        alt="Store Logo"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : form.storeName.trim() ? (
                                      form.storeName.trim()[0].toUpperCase()
                                    ) : (
                                      <Store size={28} className="text-white/80" />
                                    )}
                                  </div>

                                  {/* Quick camera button overlay on avatar */}
                                  <label
                                    htmlFor="store-logo-upload-input"
                                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#009966] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[#007a52] transition-colors cursor-pointer"
                                    title="Upload Store Logo"
                                  >
                                    <Camera size={13} />
                                  </label>
                                  <input
                                    id="store-logo-upload-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                  />
                                </div>

                                {/* Store Info label beside avatar */}
                                <div className="pb-1">
                                  <h5 className="text-sm sm:text-base font-black text-gray-900 leading-tight flex items-center gap-1.5">
                                    {form.storeName.trim() || "Your Store Name"}
                                    <CheckCircle2 size={15} className="text-[#009966]" />
                                  </h5>
                                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                                    bharatbazar.com/store/{form.storeSlug || "your-store"}
                                  </p>
                                </div>
                              </div>

                              {form.storeLogoUrl && (
                                <button
                                  type="button"
                                  onClick={() => updateField("storeLogoUrl", "")}
                                  className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 self-start sm:self-end pb-1 cursor-pointer"
                                >
                                  <Trash2 size={13} /> Remove Custom Logo
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Dedicated Upload Cards Grid (Logo & Banner) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">

                          {/* Box A: Store Profile / Logo Upload Box */}
                          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-gray-900 block">1. Store Logo / Profile Picture</span>
                                <span className="text-[11px] text-gray-400">Square 1:1 • Min 500×500px</span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                PNG / JPG
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label
                                htmlFor="store-logo-upload-input-2"
                                className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-[#009966] bg-emerald-50/50 hover:bg-emerald-50 text-xs font-bold text-[#009966] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                              >
                                <Upload size={14} />
                                <span>{form.storeLogoUrl ? "Replace Logo" : "Choose Logo File"}</span>
                              </label>
                              <input
                                id="store-logo-upload-input-2"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                            </div>

                            {/* Preset Avatar Icons */}
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                Or Quick Pick Brand Icon
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                  { label: "Crown", icon: "👑" },
                                  { label: "Retail", icon: "🛍️" },
                                  { label: "Craft", icon: "🪔" },
                                  { label: "Gadget", icon: "📱" },
                                  { label: "Organic", icon: "🌾" },
                                ].map(p => (
                                  <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => {
                                      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="30" fill="${form.storeAccentColor || '#009966'}"/><text x="50%" y="54%" font-size="90" text-anchor="middle" dominant-baseline="middle">${p.icon}</text></svg>`;
                                      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
                                      updateField("storeLogoUrl", dataUrl);
                                    }}
                                    className="text-sm px-2.5 py-1 rounded-lg border border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                    title={`Use ${p.label} icon`}
                                  >
                                    {p.icon}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Box B: Store Cover Banner Upload Box */}
                          <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-gray-900 block">2. Storefront Cover Banner</span>
                                <span className="text-[11px] text-gray-400">Landscape 3:1 • Min 1200×400px</span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Max 10MB
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <label
                                htmlFor="store-banner-upload-input-2"
                                className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-[#009966] bg-emerald-50/50 hover:bg-emerald-50 text-xs font-bold text-[#009966] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                              >
                                <Upload size={14} />
                                <span>{form.storeBannerUrl ? "Replace Banner" : "Choose Banner File"}</span>
                              </label>
                              <input
                                id="store-banner-upload-input-2"
                                type="file"
                                accept="image/*"
                                onChange={handleBannerUpload}
                                className="hidden"
                              />
                            </div>

                            {/* Preset Banner Themes */}
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                Or Quick Pick Curated Banner
                              </p>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[
                                  { label: "Silk", gradient: "linear-gradient(135deg, #831843, #be185d)" },
                                  { label: "Gold", gradient: "linear-gradient(135deg, #78350f, #f59e0b)" },
                                  { label: "Emerald", gradient: "linear-gradient(135deg, #064e3b, #00cc88)" },
                                  { label: "Slate", gradient: "linear-gradient(135deg, #0f172a, #334155)" },
                                ].map(b => (
                                  <button
                                    key={b.label}
                                    type="button"
                                    onClick={() => {
                                      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${b.label === 'Silk' ? '#831843' : b.label === 'Gold' ? '#78350f' : b.label === 'Emerald' ? '#064e3b' : '#0f172a'}"/><stop offset="100%" stop-color="${b.label === 'Silk' ? '#be185d' : b.label === 'Gold' ? '#f59e0b' : b.label === 'Emerald' ? '#00cc88' : '#334155'}"/></linearGradient></defs><rect width="1200" height="400" fill="url(#g)"/><circle cx="1100" cy="80" r="150" fill="white" opacity="0.05"/><circle cx="100" cy="350" r="200" fill="white" opacity="0.05"/></svg>`;
                                      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
                                      updateField("storeBannerUrl", dataUrl);
                                    }}
                                    className="h-7 rounded-lg border border-gray-200 text-[10px] font-bold text-white shadow-xs flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                                    style={{ background: b.gradient }}
                                    title={`Use ${b.label} banner`}
                                  >
                                    {b.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Store Description / Brand Story */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>Store Bio & Brand Story <span className="text-red-500">*</span></label>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {form.storeDescription.length}/300 chars
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          maxLength={300}
                          value={form.storeDescription}
                          onChange={e => updateField("storeDescription", e.target.value)}
                          placeholder="Tell customers about your craftsmanship, authentic sourcing, or product specialty…"
                          className={`${inputStyle} resize-none`}
                        />
                      </div>

                      {/* Product SKU Catalog Size */}
                      <div>
                        <label className={labelStyle}>Estimated Number of Products (SKUs)</label>
                        <select
                          value={form.productCount}
                          onChange={e => updateField("productCount", e.target.value)}
                          className={`${inputStyle} cursor-pointer`}
                        >
                          <option value="10">1 – 20 items (Artisan / Boutique)</option>
                          <option value="50">20 – 100 items (Growing Seller)</option>
                          <option value="250">100 – 500 items (Retail Enterprise)</option>
                          <option value="1000">500+ items (Wholesale Distributor)</option>
                        </select>
                      </div>

                      {/* Website URL */}
                      <div>
                        <label className={labelStyle}>External Website / Instagram (Optional)</label>
                        <input
                          type="url"
                          value={form.websiteUrl}
                          onChange={e => updateField("websiteUrl", e.target.value)}
                          placeholder="https://yourbrand.in"
                          className={inputStyle}
                        />
                      </div>

                      {/* Store Brand Color Theme Picker */}
                      <div className="sm:col-span-2 pt-2">
                        <label className={labelStyle}>Storefront Theme Accent Color</label>
                        <div className="flex items-center gap-3">
                          {["#009966", "#3b82f6", "#ec4899", "#8b5cf6", "#f59e0b", "#0d9488"].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updateField("storeAccentColor", c)}
                              className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
                              style={{
                                background: c,
                                borderColor: form.storeAccentColor === c ? "#000" : "transparent",
                              }}
                            >
                              {form.storeAccentColor === c && <Check size={14} className="text-white" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    STEP 4: PICKUP & WAREHOUSE LOGISTICS
                   ════════════════════════════════════════════════════════ */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 flex items-start gap-3">
                      <Truck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-900 leading-relaxed">
                        <strong className="font-bold">BharatBazar Express Logistics:</strong> Free doorstep pickup across 28,000+ Indian pincodes. Automated shipping labels, transit insurance, and fastest COD cash remittance.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Country Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>Country <span className="text-red-500">*</span></label>
                          {loadingCountries && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                              <Loader2 size={11} className="animate-spin text-[#009966]" /> Fetching countries...
                            </span>
                          )}
                        </div>
                        <select
                          value={form.country}
                          disabled={loadingCountries}
                          onChange={e => {
                            updateField("country", e.target.value);
                            updateField("state", "");
                            updateField("city", "");
                            updateField("pincode", "");
                            setPincodeHubInfo(null);
                          }}
                          className={`${inputStyle} cursor-pointer`}
                        >
                          <option value="">Select country</option>
                          {dbCountries.length > 0 ? (
                            dbCountries.map(country => (
                              <option key={country.id} value={country.name}>
                                {country.flagEmoji} {country.name} ({country.code})
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>No countries available from database</option>
                          )}
                        </select>
                      </div>

                      {/* State Selection filtered by country */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>State / Union Territory <span className="text-red-500">*</span></label>
                          {loadingStates && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                              <Loader2 size={11} className="animate-spin text-[#009966]" /> Fetching states...
                            </span>
                          )}
                        </div>
                        <select
                          value={form.state}
                          disabled={!form.country || loadingStates || availableStates.length === 0}
                          onChange={e => {
                            updateField("state", e.target.value);
                            updateField("city", "");
                            updateField("pincode", "");
                            setPincodeHubInfo(null);
                          }}
                          className={`${inputStyle} cursor-pointer ${
                            stepErrors.state ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                          }`}
                        >
                          <option value="">Select state</option>
                          {availableStates.map(state => (
                            <option key={state.id} value={state.name}>
                              {state.name} {state.gstCode ? `(GST Code: ${state.gstCode})` : ""} [{state.type}]
                            </option>
                          ))}
                        </select>
                        {stepErrors.state && (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.state}
                          </p>
                        )}
                      </div>

                      {/* City / District Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>City / District <span className="text-red-500">*</span></label>
                          {loadingPickupLocations && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                              <Loader2 size={11} className="animate-spin text-[#009966]" /> Fetching cities...
                            </span>
                          )}
                        </div>
                        {pickupLocations.length > 0 ? (
                          <select
                            value={form.city}
                            disabled={!form.state || loadingPickupLocations}
                            onChange={e => {
                              const location = pickupLocations.find(item => item.city === e.target.value);
                              updateField("city", e.target.value);
                              updateField("pincode", location?.pincode || "");
                              setPincodeHubInfo(location
                                ? { city: location.city, state: form.state, serviceable: true, foundInDb: true }
                                : null);
                            }}
                            className={`${inputStyle} cursor-pointer ${
                              stepErrors.city ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                            }`}
                          >
                            <option value="">Select city / district</option>
                            {pickupLocations.map(location => (
                              <option key={location.city} value={location.city}>{location.city}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={form.city}
                            disabled={!form.state || loadingPickupLocations}
                            onChange={e => {
                              updateField("city", e.target.value);
                              updateField("pincode", "");
                              setPincodeHubInfo(null);
                            }}
                            placeholder={form.state ? "Enter city / district" : "Select a state first"}
                            className={`${inputStyle} ${
                              stepErrors.city ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                            }`}
                          />
                        )}
                        {stepErrors.city ? (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.city}
                          </p>
                        ) : pickupLocationsError ? (
                          <p className="text-[11px] text-amber-600 mt-1">{pickupLocationsError}</p>
                        ) : form.state && pickupLocations.length === 0 && !loadingPickupLocations ? (
                          <p className="text-[11px] text-gray-400 mt-1">
                            No directory locations found for this state. Enter the city and pincode manually.
                          </p>
                        ) : null}
                      </div>

                      {/* Pincode is populated from the selected city / district */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>Pickup Pincode <span className="text-red-500">*</span></label>
                          {isLookingUpPincode ? (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                              <Loader2 size={11} className="animate-spin text-[#009966]" /> Checking DB hub...
                            </span>
                          ) : pincodeHubInfo?.foundInDb ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 size={11} /> DB Hub Verified
                            </span>
                          ) : null}
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={form.pincode}
                          onChange={e => {
                            const pin = e.target.value.replace(/\D/g, "");
                            updateField("pincode", pin);
                            if (pin.length === 6) {
                              lookupPincodeInDb(pin);
                            } else {
                              setPincodeHubInfo(null);
                            }
                          }}
                          placeholder="Select a city to fetch pincode"
                          className={`${inputStyle} font-mono ${
                            stepErrors.pincode ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : ""
                          }`}
                        />
                        {stepErrors.pincode ? (
                          <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {stepErrors.pincode}
                          </p>
                        ) : pincodeHubInfo?.office ? (
                          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-[#009966]" /> Hub: {pincodeHubInfo.office} ({pincodeHubInfo.city}, {pincodeHubInfo.state})
                          </p>
                        ) : (
                          <p className="text-[11px] text-gray-400 mt-1">
                            {pickupLocations.some(location => location.city === form.city)
                              ? "Automatically filled from the selected city / district."
                              : "Validated with the BharatBazar pincode directory."}
                          </p>
                        )}
                      </div>

                      {/* Address Line 1 */}
                      <div className="sm:col-span-2">
                        <label className={labelStyle}>Warehouse / Shop Address Line 1 <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={form.addressLine1}
                          onChange={e => updateField("addressLine1", e.target.value)}
                          placeholder="Shop / Unit No., Building Name, Industrial Estate"
                          className={inputStyle}
                        />
                      </div>

                      {/* Address Line 2 */}
                      <div className="sm:col-span-2">
                        <label className={labelStyle}>Address Line 2 (Area & Landmark)</label>
                        <input
                          type="text"
                          value={form.addressLine2}
                          onChange={e => updateField("addressLine2", e.target.value)}
                          placeholder="Street, Near Landmark, Sector / Ward"
                          className={inputStyle}
                        />
                      </div>

                      {/* Shipping Logistics Mode Selector */}
                      <div className="sm:col-span-2 pt-2">
                        <label className={labelStyle}>Preferred Shipping Method</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => updateField("shippingModel", "express")}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              form.shippingModel === "express"
                                ? "border-[#009966] bg-emerald-50/40 ring-2 ring-[#009966]/20"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                                <Truck size={14} className="text-[#009966]" /> BharatBazar Express (Recommended)
                              </span>
                              {form.shippingModel === "express" && (
                                <CheckCircle2 size={16} className="text-[#009966]" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500">
                              Free doorstep daily pickup. Courier assigns delivery boy directly to your shop.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => updateField("shippingModel", "self")}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              form.shippingModel === "self"
                                ? "border-[#009966] bg-emerald-50/40 ring-2 ring-[#009966]/20"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                                <Building2 size={14} className="text-gray-600" /> Self-Ship / Vendor Logistics
                              </span>
                              {form.shippingModel === "self" && (
                                <CheckCircle2 size={16} className="text-[#009966]" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500">
                              Ship via your own preferred courier partner (Bluedart, Delhivery, DTDC).
                            </p>
                          </button>
                        </div>
                      </div>

                      {/* Same return warehouse toggle */}
                      <div className="sm:col-span-2 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={form.sameAsPickup}
                            onChange={e => updateField("sameAsPickup", e.target.checked)}
                            className="w-4 h-4 text-[#009966] rounded accent-[#009966]"
                          />
                          <span className="text-xs font-bold text-gray-700">
                            Customer return address is the same as this pickup location
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    STEP 5: BANK ACCOUNT & PAYOUT SETTLEMENTS
                   ════════════════════════════════════════════════════════ */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 flex items-start gap-3">
                      <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-900 leading-relaxed">
                        <strong className="font-bold">100% RBI Escrow Compliant:</strong> BharatBazar processes merchant earnings automatically every Tuesday directly to this account via NEFT/RTGS.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Popular bank quick-pick pills */}
                      <div className="sm:col-span-2">
                        <label className={labelStyle}>Quick Select Bank</label>
                        <div className="flex flex-wrap gap-2">
                          {POPULAR_BANKS.map(b => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => updateField("bankName", b)}
                              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                                form.bankName === b
                                  ? "bg-[#009966] text-white border-[#009966] font-bold"
                                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Account Holder Name */}
                      <div className="sm:col-span-2">
                        <label className={labelStyle}>Bank Account Holder Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={form.accountHolder}
                          onChange={e => updateField("accountHolder", e.target.value)}
                          placeholder="Exact name as printed on Passbook / Cheque"
                          className={inputStyle}
                        />
                      </div>

                      {/* Account Type */}
                      <div>
                        <label className={labelStyle}>Account Type <span className="text-red-500">*</span></label>
                        <select
                          value={form.accountType}
                          onChange={e => updateField("accountType", e.target.value as any)}
                          className={`${inputStyle} cursor-pointer`}
                        >
                          <option value="Current Account">Current Account (Recommended for GST)</option>
                          <option value="Savings Account">Savings Account</option>
                        </select>
                      </div>

                      {/* IFSC Code */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>IFSC Code <span className="text-red-500">*</span></label>
                          {form.ifsc.length === 11 && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Validated Branch
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={11}
                          value={form.ifsc}
                          onChange={e => updateField("ifsc", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                          placeholder="SBIN0001234"
                          className={`${inputStyle} font-mono uppercase tracking-wider`}
                        />
                      </div>

                      {/* Bank Account Number */}
                      <div>
                        <label className={labelStyle}>Bank Account Number <span className="text-red-500">*</span></label>
                        <input
                          type="password"
                          value={form.accountNumber}
                          onChange={e => updateField("accountNumber", e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter account number"
                          className={`${inputStyle} font-mono tracking-wider`}
                        />
                      </div>

                      {/* Confirm Bank Account Number */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>Confirm Account Number <span className="text-red-500">*</span></label>
                          {form.confirmAccount && form.confirmAccount === form.accountNumber && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 size={12} /> Numbers Match
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={form.confirmAccount}
                          onChange={e => updateField("confirmAccount", e.target.value.replace(/\D/g, ""))}
                          placeholder="Re-enter to confirm"
                          className={`${inputStyle} font-mono tracking-wider ${
                            form.confirmAccount && form.confirmAccount !== form.accountNumber
                              ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                              : ""
                          }`}
                        />
                        {form.confirmAccount && form.confirmAccount !== form.accountNumber && (
                          <p className="text-[10px] text-red-500 font-bold mt-1">Account numbers do not match</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    STEP 6: KYC DOCUMENT UPLOADS (Admin KYC Aligned)
                   ════════════════════════════════════════════════════════ */}
                {step === 6 && (
                  <div className="space-y-6">
                    <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 flex items-start gap-3">
                      <Award size={18} className="text-[#009966] shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-900 leading-relaxed">
                        <strong className="font-bold">Instant KYC Fast-Track:</strong> As per Admin Manage Seller KYC guidelines, upload clear scans or photos of your GST Certificate, PAN, and Bank Proof. Formats: PDF, PNG, JPG up to 10MB.
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* 1. GST Certificate */}
                      <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/40 hover:bg-white transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <FileText size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-900">GST Registration Certificate (Form GST REG-06) <span className="text-red-500">*</span></p>
                              <p className="text-[11px] text-gray-400">All pages including Annexure A & B showing legal name & address</p>
                            </div>
                          </div>
                          {kycDocs.gstCert.status === "verified" ? (
                            <div className="flex items-center gap-2">
                              {kycDocs.gstCert.previewUrl ? (
                                <a
                                  href={kycDocs.gstCert.previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                                  title="View document in new tab"
                                >
                                  <Check size={14} className="stroke-[3]" /> {kycDocs.gstCert.name}
                                  <ExternalLink size={12} className="ml-0.5 text-emerald-600" />
                                </a>
                              ) : (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                  <Check size={14} className="stroke-[3]" /> {kycDocs.gstCert.name}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc("gstCert")}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                                title="Remove document"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <label className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#009966] hover:bg-[#007a52] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs">
                                {uploadingDoc === "gstCert" ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" /> Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload size={14} /> Upload Doc
                                    <input
                                      type="file"
                                      accept=".pdf,.png,.jpg,.jpeg"
                                      className="hidden"
                                      disabled={uploadingDoc !== null}
                                      onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleRealDocUpload("gstCert", file);
                                        e.target.value = "";
                                      }}
                                    />
                                  </>
                                )}
                              </label>
                              <button
                                type="button"
                                onClick={() => handleMockUpload("gstCert", "GST_Certificate_2026.pdf", "1.4 MB")}
                                className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Use demo document"
                              >
                                Sample
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. PAN Card */}
                      <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/40 hover:bg-white transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                              <ShieldCheck size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-900">Company / Proprietor PAN Card Copy <span className="text-red-500">*</span></p>
                              <p className="text-[11px] text-gray-400">Clear scanned copy of front side with signature visible</p>
                            </div>
                          </div>
                          {kycDocs.panCard.status === "verified" ? (
                            <div className="flex items-center gap-2">
                              {kycDocs.panCard.previewUrl ? (
                                <a
                                  href={kycDocs.panCard.previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                                  title="View document in new tab"
                                >
                                  <Check size={14} className="stroke-[3]" /> {kycDocs.panCard.name}
                                  <ExternalLink size={12} className="ml-0.5 text-emerald-600" />
                                </a>
                              ) : (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                  <Check size={14} className="stroke-[3]" /> {kycDocs.panCard.name}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc("panCard")}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                                title="Remove document"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <label className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#009966] hover:bg-[#007a52] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs">
                                {uploadingDoc === "panCard" ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" /> Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload size={14} /> Upload PAN
                                    <input
                                      type="file"
                                      accept=".pdf,.png,.jpg,.jpeg"
                                      className="hidden"
                                      disabled={uploadingDoc !== null}
                                      onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleRealDocUpload("panCard", file);
                                        e.target.value = "";
                                      }}
                                    />
                                  </>
                                )}
                              </label>
                              <button
                                type="button"
                                onClick={() => handleMockUpload("panCard", "PAN_Card_Owner.jpg", "840 KB")}
                                className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Use demo document"
                              >
                                Sample
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. Bank Proof / Cancelled Cheque */}
                      <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/40 hover:bg-white transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                              <Landmark size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-900">Cancelled Cheque or Bank Passbook / Statement <span className="text-red-500">*</span></p>
                              <p className="text-[11px] text-gray-400">Must clearly show Account Holder Name, Account Number & IFSC code</p>
                            </div>
                          </div>
                          {kycDocs.bankProof.status === "verified" ? (
                            <div className="flex items-center gap-2">
                              {kycDocs.bankProof.previewUrl ? (
                                <a
                                  href={kycDocs.bankProof.previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                                  title="View document in new tab"
                                >
                                  <Check size={14} className="stroke-[3]" /> {kycDocs.bankProof.name}
                                  <ExternalLink size={12} className="ml-0.5 text-emerald-600" />
                                </a>
                              ) : (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                  <Check size={14} className="stroke-[3]" /> {kycDocs.bankProof.name}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc("bankProof")}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                                title="Remove document"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <label className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#009966] hover:bg-[#007a52] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs">
                                {uploadingDoc === "bankProof" ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" /> Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload size={14} /> Upload Bank Proof
                                    <input
                                      type="file"
                                      accept=".pdf,.png,.jpg,.jpeg"
                                      className="hidden"
                                      disabled={uploadingDoc !== null}
                                      onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleRealDocUpload("bankProof", file);
                                        e.target.value = "";
                                      }}
                                    />
                                  </>
                                )}
                              </label>
                              <button
                                type="button"
                                onClick={() => handleMockUpload("bankProof", "Cancelled_Cheque_Bank.pdf", "980 KB")}
                                className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Use demo document"
                              >
                                Sample
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 4. Aadhaar Card Front & Back */}
                      <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/40 hover:bg-white transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#009966] flex items-center justify-center shrink-0">
                              <User size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-900">Owner Aadhaar Card / Address Proof</p>
                              <p className="text-[11px] text-gray-400">Mask first 8 digits or submit e-Aadhaar PDF</p>
                            </div>
                          </div>
                          {kycDocs.aadhaarCard.status === "verified" ? (
                            <div className="flex items-center gap-2">
                              {kycDocs.aadhaarCard.previewUrl ? (
                                <a
                                  href={kycDocs.aadhaarCard.previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                                  title="View document in new tab"
                                >
                                  <Check size={14} className="stroke-[3]" /> {kycDocs.aadhaarCard.name}
                                  <ExternalLink size={12} className="ml-0.5 text-emerald-600" />
                                </a>
                              ) : (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                  <Check size={14} className="stroke-[3]" /> {kycDocs.aadhaarCard.name}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc("aadhaarCard")}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                                title="Remove document"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <label className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#009966] hover:bg-[#007a52] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs">
                                {uploadingDoc === "aadhaarCard" ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" /> Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload size={14} /> Upload Aadhaar
                                    <input
                                      type="file"
                                      accept=".pdf,.png,.jpg,.jpeg"
                                      className="hidden"
                                      disabled={uploadingDoc !== null}
                                      onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleRealDocUpload("aadhaarCard", file);
                                        e.target.value = "";
                                      }}
                                    />
                                  </>
                                )}
                              </label>
                              <button
                                type="button"
                                onClick={() => handleMockUpload("aadhaarCard", "Aadhaar_Document_Masked.pdf", "1.1 MB")}
                                className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Use demo document"
                              >
                                Sample
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 5. MSME Udyam / Trade License (Optional) */}
                      <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/40 hover:bg-white transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                              <Building2 size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-900">MSME Udyam Certificate / Trade License <span className="text-xs font-normal text-gray-400">(Optional)</span></p>
                              <p className="text-[11px] text-gray-400">Gives your store the "Verified MSME Artisan" badge on BharatBazar</p>
                            </div>
                          </div>
                          {kycDocs.tradeLicense.status === "verified" ? (
                            <div className="flex items-center gap-2">
                              {kycDocs.tradeLicense.previewUrl ? (
                                <a
                                  href={kycDocs.tradeLicense.previewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                                  title="View document in new tab"
                                >
                                  <Check size={14} className="stroke-[3]" /> {kycDocs.tradeLicense.name}
                                  <ExternalLink size={12} className="ml-0.5 text-emerald-600" />
                                </a>
                              ) : (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                  <Check size={14} className="stroke-[3]" /> {kycDocs.tradeLicense.name}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveDoc("tradeLicense")}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                                title="Remove document"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <label className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs">
                                {uploadingDoc === "tradeLicense" ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" /> Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload size={14} /> Upload MSME Doc
                                    <input
                                      type="file"
                                      accept=".pdf,.png,.jpg,.jpeg"
                                      className="hidden"
                                      disabled={uploadingDoc !== null}
                                      onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleRealDocUpload("tradeLicense", file);
                                        e.target.value = "";
                                      }}
                                    />
                                  </>
                                )}
                              </label>
                              <button
                                type="button"
                                onClick={() => handleMockUpload("tradeLicense", "MSME_Udyam_Registration.pdf", "720 KB")}
                                className="px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Use demo document"
                              >
                                Sample
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════
                    STEP 7: FINAL REVIEW & LEGAL AGREEMENTS
                   ════════════════════════════════════════════════════════ */}
                {step === 7 && (
                  <div className="space-y-6">
                    {/* Review breakdown cards */}
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-2">
                          <span className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 size={14} className="text-[#009966]" /> Business & Store Details
                          </span>
                          <button onClick={() => setStep(2)} className="text-xs font-bold text-[#009966] hover:underline">
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-gray-400">Store Name</p>
                            <p className="font-bold text-gray-800">{form.storeName || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Business Legal Name</p>
                            <p className="font-bold text-gray-800 truncate">{form.businessName || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">GSTIN Number</p>
                            <p className="font-mono font-bold text-gray-800">{form.gstin || "Pending"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Category</p>
                            <p className="font-bold text-gray-800">{form.businessCategory || "General"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Store Slug</p>
                            <p className="font-mono font-bold text-[#009966]">/store/{form.storeSlug || "store"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Business Type</p>
                            <p className="font-bold text-gray-800">{form.businessType}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-2">
                          <span className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin size={14} className="text-[#009966]" /> Pickup & Bank Settlements
                          </span>
                          <button onClick={() => setStep(4)} className="text-xs font-bold text-[#009966] hover:underline">
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-gray-400">Pickup Hub City</p>
                            <p className="font-bold text-gray-800">{form.city}, {form.state} ({form.pincode}), {form.country || "India"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Shipping Partner</p>
                            <p className="font-bold text-emerald-600">BharatBazar Express Logistics</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Bank Name</p>
                            <p className="font-bold text-gray-800">{form.bankName}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Account Holder</p>
                            <p className="font-bold text-gray-800 truncate">{form.accountHolder || form.ownerName}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Account Number</p>
                            <p className="font-mono font-bold text-gray-800">
                              {form.accountNumber ? `•••• •••• ${form.accountNumber.slice(-4)}` : "Pending"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Settlement Payouts</p>
                            <p className="font-bold text-emerald-600">Weekly (Every Tuesday)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Preferences (from Admin AddSellerPage) */}
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-black text-gray-700 uppercase tracking-wider">Store Operational Preferences</p>
                      <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                        <div>
                          <p className="text-xs font-bold text-gray-800">Allow Cash on Delivery (COD)</p>
                          <p className="text-[11px] text-gray-400">Enable cash payment option on delivery for buyers across India</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.allowCOD}
                          onChange={e => updateField("allowCOD", e.target.checked)}
                          className="w-5 h-5 rounded accent-[#009966]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer">
                        <div>
                          <p className="text-xs font-bold text-gray-800">Auto-Approve Catalog Listings</p>
                          <p className="text-[11px] text-gray-400">Automatically sync and publish newly uploaded products to the storefront</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.autoApprove}
                          onChange={e => updateField("autoApprove", e.target.checked)}
                          className="w-5 h-5 rounded accent-[#009966]"
                        />
                      </label>
                    </div>

                    {/* Declarations & Legal agreements */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.agreedToTerms}
                          onChange={e => updateField("agreedToTerms", e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded accent-[#009966]"
                        />
                        <span className="text-xs text-gray-600 leading-snug">
                          I agree to the <strong className="text-gray-900">BharatBazar Merchant Master Agreement</strong>, Marketplace Commission Schedule, and Privacy Policy. I confirm all provided details and GSTIN documents are genuine.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.agreedToAntiCounterfeit}
                          onChange={e => updateField("agreedToAntiCounterfeit", e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded accent-[#009966]"
                        />
                        <span className="text-xs text-gray-600 leading-snug">
                          I commit to the <strong className="text-gray-900">100% Genuine & Authentic Products Guarantee</strong>. I will not list duplicate, refurbished (unless specified), or restricted items.
                        </span>
                      </label>
                    </div>

                    {/* Submit Error Banner if registration fails */}
                    {submitError && (
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700">
                        <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
                        <div className="text-xs">
                          <p className="font-bold text-red-800">Registration Issue Encountered</p>
                          <p className="text-red-600 mt-0.5 leading-relaxed">{submitError}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP NAVIGATION CONTROLS (BOTTOM BAR) ── */}
                <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-8">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(step - 1)}
                      className="px-5 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={16} /> Back to {STEPS[step - 2].short}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPage("seller-login")}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600"
                    >
                      Cancel & Return to Login
                    </button>
                  )}

                  {step < STEPS.length ? (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={handleNextStep}
                      className="px-7 py-3 rounded-xl text-xs font-black text-white flex items-center gap-2 transition-all cursor-pointer shadow-md"
                      style={{ background: G, boxShadow: `0 6px 20px ${G}35` }}
                    >
                      Continue to {STEPS[step].short} <ArrowRight size={16} />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting || !form.agreedToTerms || !form.agreedToAntiCounterfeit}
                      className="px-9 py-3.5 rounded-xl text-sm font-black text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: `linear-gradient(135deg, ${G}, #00cc88)`, boxShadow: `0 8px 25px ${G}40` }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Registering Seller & Saving...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} /> Submit Seller Application
                        </>
                      )}
                    </motion.button>
                  )}
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

          {/* ═══════════════════════════════════════════════════════════
              RIGHT COLUMN: LIVE DYNAMIC STOREFRONT CARD & READINESS
             ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

            {/* 1. Live Digital Storefront Card (Interactive Real-Time Preview) */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div
                className="px-5 py-3 border-b border-gray-100 flex items-center justify-between"
                style={{ background: "linear-gradient(90deg, #f8fafc, #f1f5f9)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-600">
                    Live Storefront Preview
                  </span>
                </div>
                <span className="text-[9px] font-bold text-[#009966] bg-[#009966]/10 px-2 py-0.5 rounded-full">
                  Customer View
                </span>
              </div>

              {/* Storefront Hero Card */}
              <div className="p-5">
                {/* Store banner preview */}
                <div
                  className="w-full h-24 rounded-2xl relative overflow-hidden flex items-end p-3 mb-3 shadow-inner bg-cover bg-center transition-all duration-300"
                  style={{
                    backgroundImage: form.storeBannerUrl ? `url(${form.storeBannerUrl})` : undefined,
                    background: form.storeBannerUrl
                      ? undefined
                      : `linear-gradient(135deg, #0d1f15, ${form.storeAccentColor || G})`,
                  }}
                >
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-white">
                    <ShieldCheck size={11} className="text-emerald-400" /> Verified Seller
                  </div>
                </div>

                {/* Avatar & Store Info */}
                <div className="flex items-start gap-3 -mt-8 relative z-10 px-1 mb-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white shrink-0 overflow-hidden bg-cover bg-center"
                    style={{ background: form.storeAccentColor || G }}
                  >
                    {form.storeLogoUrl ? (
                      <img src={form.storeLogoUrl} alt="Store Logo" className="w-full h-full object-cover" />
                    ) : form.storeName.trim() ? (
                      form.storeName.trim()[0].toUpperCase()
                    ) : form.businessName.trim() ? (
                      form.businessName.trim()[0].toUpperCase()
                    ) : (
                      "B"
                    )}
                  </div>
                  <div className="pt-7 min-w-0 flex-1">
                    <h3 className="text-base font-black text-gray-900 truncate">
                      {form.storeName.trim() || "Your Store Display Name"}
                    </h3>
                    <p className="text-xs font-mono text-gray-400 truncate">
                      bharatbazar.com/store/{form.storeSlug || "your-store"}
                    </p>
                  </div>
                </div>

                {/* Store Metadata Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                    🏷️ {form.businessCategory || "Multi-Category"}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    📍 {form.city || "India"} Hub
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                    <Star size={11} className="fill-amber-400 text-amber-400" /> 5.0 (New)
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 italic mb-4">
                  "{form.storeDescription.trim() || "Quality products directly from authentic Indian artisans and verified vendors."}"
                </p>

                {/* Payout & Logistics Preview */}
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5"><Truck size={12} className="text-[#009966]" /> Logistics</span>
                    <span className="font-bold text-gray-900">BharatBazar Express</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5"><Landmark size={12} className="text-[#009966]" /> Payout Cycle</span>
                    <span className="font-bold text-gray-900">Every 7 Days</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5"><IndianRupee size={12} className="text-[#009966]" /> Intro Commission</span>
                    <span className="font-bold text-emerald-600">0% for 30 Days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. KYC Readiness Score Widget */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400">KYC Verification Score</p>
                  <p className="text-lg font-black text-gray-900">
                    {readiness.score >= 80 ? "Fast-Track Eligible" : "Onboarding Progress"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#009966]">{readiness.score}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#009966] to-[#00cc88] transition-all duration-500 rounded-full"
                  style={{ width: `${readiness.score}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="space-y-2 pt-1 text-xs">
                {readiness.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600">{item.label}</span>
                    {item.passed ? (
                      <span className="text-[#009966] font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Completed
                      </span>
                    ) : (
                      <span className="text-gray-300 font-medium flex items-center gap-1">
                        <Circle size={13} /> Required
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Why Sell on BharatBazar? Highlights */}
            <div
              className="rounded-3xl p-5 text-white space-y-3 relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, #0d1e16 0%, #0d281a 60%, #173624 100%)" }}
            >
              <div className="flex items-center gap-2">
                <Award size={18} className="text-amber-400" />
                <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Seller Benefits & Perks
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-white/80">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <strong>0% Commission</strong> for the first 30 days of onboarding
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Access to <strong>2 Crore+ active Indian shoppers</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Free doorstep pickup across <strong>28,000+ pincodes</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Weekly payouts directly to bank via <strong>RBI Escrow</strong>
                </li>
              </ul>
            </div>

            {/* Reset Form Option */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Reset form and start over
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* ── SIMULATED OTP VERIFICATION MODAL ── */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative"
            >
              <button
                onClick={() => setShowOtpModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#009966] flex items-center justify-center mx-auto mb-4">
                {showOtpModal === "email" ? <Mail size={24} /> : <Phone size={24} />}
              </div>

              <h3 className="text-lg font-black text-gray-900 mb-1">
                Enter 6-Digit OTP
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Sent to {showOtpModal === "email" ? form.email : `+91 ${form.mobile}`}
              </p>

              {/* 6 Digit Inputs */}
              <div className="flex justify-center gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5].map(idx => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={otpInput[idx] || ""}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, "");
                      const next = [...otpInput];
                      next[idx] = val;
                      setOtpInput(next);
                      if (val && idx < 5) {
                        (document.getElementById(`otp-${idx + 1}`) as HTMLInputElement)?.focus();
                      }
                    }}
                    className="w-10 h-12 text-center text-lg font-mono font-bold border border-gray-200 rounded-xl focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 outline-none"
                  />
                ))}
              </div>

              {/* Quick Auto-fill button for testing convenience */}
              <button
                type="button"
                onClick={() => setOtpInput(["1", "2", "3", "4", "5", "6"])}
                className="text-[11px] font-bold text-[#009966] bg-[#009966]/10 px-3 py-1 rounded-lg mb-4 hover:bg-[#009966]/20 transition-colors"
              >
                ⚡ Auto-Fill Demo OTP (123456)
              </button>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-6 px-2">
                <span>Resend OTP in <strong className="text-gray-700">{otpTimer}s</strong></span>
                <button
                  disabled={otpTimer > 0}
                  onClick={() => setOtpTimer(45)}
                  className="font-bold text-[#009966] disabled:opacity-40"
                >
                  Resend
                </button>
              </div>

              <button
                type="button"
                onClick={verifyOtp}
                className="w-full py-3 rounded-xl text-sm font-black text-white shadow-md transition-all"
                style={{ background: G }}
              >
                Verify & Confirm
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SELLER SUPPORT & FAQ SLIDE-OVER DRAWER ── */}
      <AnimatePresence>
        {showHelpDrawer && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <HelpCircle size={18} className="text-[#009966]" />
                  <span className="font-black text-sm text-gray-900">Merchant Help & FAQ</span>
                </div>
                <button
                  onClick={() => setShowHelpDrawer(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-gray-700">
                {/* Emergency Contact Card */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <p className="font-black text-sm">Need Help Onboarding?</p>
                  <p className="text-xs text-emerald-800">Our dedicated merchant support executives are available 9 AM – 9 PM IST.</p>
                  <div className="pt-2 flex items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                      📞 1800-200-8899
                    </span>
                    <span className="font-bold text-xs text-emerald-700">
                      💬 WhatsApp Support
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px]">Frequently Asked Questions</h4>

                  <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                    <p className="font-bold text-gray-900">1. Is GSTIN mandatory to sell on BharatBazar?</p>
                    <p className="text-gray-500 leading-relaxed">
                      Yes, as per Government of India e-commerce guidelines, all sellers selling goods inter-state or intra-state must provide a valid GSTIN. Artisans selling exempt books or handicraft categories can apply for Composition Scheme exemption.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                    <p className="font-bold text-gray-900">2. How and when are payouts credited?</p>
                    <p className="text-gray-500 leading-relaxed">
                      Payouts are settled directly to your registered bank account every Tuesday for all orders delivered 7 days prior, directly through RBI Escrow.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                    <p className="font-bold text-gray-900">3. How does Doorstep Courier Pickup work?</p>
                    <p className="text-gray-500 leading-relaxed">
                      Once an order is received, pack the item and click "Schedule Pickup" on your seller dashboard. The BharatBazar Express courier partner visits your pickup address on the same day.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                    <p className="font-bold text-gray-900">4. How long does Admin KYC approval take?</p>
                    <p className="text-gray-500 leading-relaxed">
                      If all uploaded documents (GST, PAN, Cheque) are legible and match your details, verification is usually completed within 12 to 24 hours.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
                <button
                  type="button"
                  onClick={() => setShowHelpDrawer(false)}
                  className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs"
                >
                  Close Help Drawer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
