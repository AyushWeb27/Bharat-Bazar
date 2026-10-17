import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star, ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw,
  ChevronLeft, ChevronRight, ZoomIn, Check, Plus, Minus, Tag,
  ThumbsUp, ShieldCheck, MessageSquare, Package, ChevronDown, X,
  Clock, MapPin, IndianRupee, Eye, TrendingUp,
  Bookmark, ExternalLink, ImageIcon, Info,
} from "lucide-react";
import { G, fmt, disc } from "./shared/constants";

// ─── Data ────────────────────────────────────────────────────────────────────

const GD = "#007a52";

const PRODUCT = {
  id: 1,
  name: "iPhone 15 Pro Max 256GB Natural Titanium",
  brand: "Apple",
  brandLogo: "🍎",
  category: "Electronics",
  subcategory: "Smartphones",
  sku: "APL-IP15PM-256NT",
  mrp: 159900,
  price: 134900,
  costPrice: 110000,
  stock: 42,
  rating: 4.6,
  reviewCount: 284,
  sold: 1243,
  views: 8421,
  images: ["📱", "📱", "📱", "📱", "📱"],
  imageColors: ["#e8f4f0", "#f0eef8", "#f8f0ee", "#eef0f8", "#f4f8ee"],
  shortDesc:
    "Experience the pinnacle of iPhone engineering — A17 Pro chip, aerospace-grade titanium, and a pro camera system that redefines mobile photography.",
  highlights: [
    "A17 Pro chip — fastest chip ever in a smartphone",
    "48MP Main camera with 5x Optical Zoom",
    "Titanium design — stronger, lighter than stainless steel",
    "USB 3 speeds for pro workflows",
    "All-day battery life with up to 29hr video playback",
    "Action Button for instant access to your favourite features",
  ],
  tags: ["iPhone", "Apple", "Smartphone", "5G", "Pro", "Titanium"],
  popular: true,
  dealOfDay: false,
  status: "active",
  warranty: "1 Year Manufacturer Warranty",
  delivery: "3–5 Business Days",
  returnable: true,
  returnDays: 7,
  hsn: "85171200",
  madeIn: "China",
  manufacturer: "Apple Inc.",
  specifications: [
    {
      group: "Display",
      icon: "🖥️",
      specs: [
        ["Size", "6.7 inches"],
        ["Resolution", "2796 × 1290 px"],
        ["Technology", "Super Retina XDR OLED"],
        ["Refresh Rate", "1–120Hz ProMotion"],
      ],
    },
    {
      group: "Performance",
      icon: "⚡",
      specs: [
        ["Chip", "Apple A17 Pro"],
        ["CPU", "6-core"],
        ["GPU", "6-core"],
        ["RAM", "8 GB"],
      ],
    },
    {
      group: "Camera",
      icon: "📸",
      specs: [
        ["Main", "48 MP, f/1.78"],
        ["Ultra-wide", "12 MP, f/2.2"],
        ["Telephoto", "12 MP, f/2.8, 5× Optical Zoom"],
        ["Front", "12 MP, f/1.9"],
      ],
    },
    {
      group: "Storage",
      icon: "💾",
      specs: [
        ["Internal", "256 GB"],
        ["Expandable", "No"],
      ],
    },
    {
      group: "Battery",
      icon: "🔋",
      specs: [
        ["Capacity", "4422 mAh"],
        ["Video Playback", "Up to 29 hrs"],
        ["Charging", "USB-C, MagSafe 15W"],
      ],
    },
    {
      group: "Design",
      icon: "✨",
      specs: [
        ["Material", "Titanium frame + Ceramic Shield"],
        ["Colors", "Natural, Black, White, Blue"],
        ["Water Resistance", "IP68 (6m, 30min)"],
        ["Dimensions", "159.9 × 76.7 × 8.25 mm"],
        ["Weight", "221 g"],
      ],
    },
    {
      group: "Connectivity",
      icon: "📡",
      specs: [
        ["5G", "Yes"],
        ["WiFi", "802.11ax Wi-Fi 6E"],
        ["Bluetooth", "5.3"],
        ["NFC", "Yes"],
        ["USB", "USB-C USB 3"],
      ],
    },
  ],
  variants: [
    {
      type: "Color",
      values: [
        { label: "Natural Titanium", dot: "#b5a99e" },
        { label: "Black Titanium", dot: "#3a3a3a" },
        { label: "White Titanium", dot: "#ebebeb" },
        { label: "Blue Titanium", dot: "#5b7fad" },
      ],
    },
    { type: "Storage", values: [{ label: "256 GB" }, { label: "512 GB" }, { label: "1 TB" }] },
  ],
  sellers: [
    { id: 1, name: "Ravi Electro Hub", rating: 4.8, orders: 1241, verified: true, city: "Mumbai" },
    { id: 2, name: "Delhi Tech Store", rating: 4.5, orders: 893, verified: true, city: "New Delhi" },
    { id: 3, name: "TechMart India", rating: 4.3, orders: 512, verified: false, city: "Bengaluru" },
  ],
};

const REVIEWS = [
  { id: 1, name: "Priya Sharma", city: "Mumbai", avatar: "PS", rating: 5, title: "Absolutely worth every rupee!", body: "The titanium build feels premium and the camera is insane. ProRes video on a phone is mind-blowing. Battery easily lasts a full day.", date: "2 Oct 2026", helpful: 42, hasPurchased: true, verified: true, images: 2 },
  { id: 2, name: "Rahul Verma", city: "Delhi", avatar: "RV", rating: 4, title: "Great phone, steep price", body: "Camera quality is unmatched. The Action Button is a gimmick at first but now I love it. Wish the price was lower.", date: "28 Sep 2026", helpful: 28, hasPurchased: true, verified: true, images: 0 },
  { id: 3, name: "Ananya Iyer", city: "Bengaluru", avatar: "AI", rating: 5, title: "Best iPhone yet", body: "Switched from Android and I'm never going back. The ecosystem integration is seamless and the camera blows my old phone out of the water.", date: "25 Sep 2026", helpful: 19, hasPurchased: true, verified: true, images: 3 },
  { id: 4, name: "Karthik Nair", city: "Chennai", avatar: "KN", rating: 4, title: "Excellent but heavy", body: "Performance is stellar, display is gorgeous. The only downside is the weight — 221g feels noticeable after extended use.", date: "20 Sep 2026", helpful: 15, hasPurchased: true, verified: true, images: 1 },
  { id: 5, name: "Sneha Patel", city: "Ahmedabad", avatar: "SP", rating: 5, title: "Pro camera system is a game changer", body: "The 5x zoom is incredible. I shoot wildlife photography and this phone now travels with me everywhere as a backup.", date: "15 Sep 2026", helpful: 37, hasPurchased: true, verified: true, images: 5 },
  { id: 6, name: "Arjun Mehta", city: "Pune", avatar: "AM", rating: 3, title: "Good but not a huge upgrade from 14 Pro", body: "If you're on a 14 Pro, think twice. The improvements are incremental. For anyone on an older device, this is a massive leap.", date: "10 Sep 2026", helpful: 22, hasPurchased: true, verified: false, images: 0 },
  { id: 7, name: "Divya Krishnan", city: "Hyderabad", avatar: "DK", rating: 5, title: "Titanium feels luxurious", body: "The Natural Titanium color is stunning. Paired with the weight reduction vs steel, it's the best feeling iPhone in years. The USB-C switch is welcome.", date: "5 Sep 2026", helpful: 31, hasPurchased: true, verified: true, images: 2 },
  { id: 8, name: "Vikram Singh", city: "Jaipur", avatar: "VS", rating: 4, title: "Top-tier performance, solid daily driver", body: "Gaming is silky smooth, apps launch instantly. Heat management is much better than previous Pro models. Battery is slightly better too.", date: "1 Sep 2026", helpful: 18, hasPurchased: true, verified: true, images: 0 },
];

const RATING_DIST = [
  { stars: 5, pct: 68 },
  { stars: 4, pct: 22 },
  { stars: 3, pct: 6 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 2 },
];

const AVATAR_COLORS: Record<string, string> = {
  PS: "#7c3aed", RV: "#2563eb", AI: "#db2777", KN: "#059669",
  SP: "#d97706", AM: "#dc2626", DK: "#0891b2", VS: "#4f46e5",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const full = rating >= s;
        const half = !full && rating >= s - 0.5;
        return (
          <svg key={s} width={size} height={size} viewBox="0 0 20 20" fill="none">
            <defs>
              <linearGradient id={`hg-${s}`}>
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <polygon
              points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
              fill={full ? "#f59e0b" : half ? `url(#hg-${s})` : "#e5e7eb"}
            />
          </svg>
        );
      })}
    </span>
  );
}

function Avatar({ initials }: { initials: string }) {
  const bg = AVATAR_COLORS[initials] ?? "#6b7280";
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-white shadow"
      style={{ background: bg }}
    >
      {initials}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ProductDetailPage() {
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({
    Color: "Natural Titanium",
    Storage: "256 GB",
  });
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews" | "sellers">("description");
  const [hasPurchased, setHasPurchased] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [openSpecGroup, setOpenSpecGroup] = useState<string | null>("Display");
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: "", body: "" });
  const [reviewHover, setReviewHover] = useState(0);
  const [helpfulVotes, setHelpfulVotes] = useState<Set<number>>(new Set());
  const tabsRef = useRef<HTMLDivElement>(null);

  const discPct = disc(PRODUCT.mrp, PRODUCT.price);
  const savings = PRODUCT.mrp - PRODUCT.price;

  // ── image display placeholder ──────────────────────────────────────────────
  function ImgPlaceholder({ idx, size = "lg" }: { idx: number; size?: "lg" | "sm" }) {
    const bg = PRODUCT.imageColors[idx] ?? "#f0f0f0";
    const labels = ["Front View", "Side Profile", "Camera Detail", "Action Button", "Port Detail"];
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center gap-2 rounded-2xl ${size === "sm" ? "rounded-xl" : ""}`}
        style={{ background: bg }}
      >
        <span className="text-5xl select-none">{PRODUCT.images[idx]}</span>
        <span className={`text-gray-500 font-medium ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
          {labels[idx]}
        </span>
      </div>
    );
  }

  const TABS = [
    { id: "description", label: "Description" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: `Reviews (${REVIEWS.length})` },
    { id: "sellers", label: `Sellers (${PRODUCT.sellers.length})` },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-['Plus_Jakarta_Sans']">

      {/* ── Page header breadcrumb ──────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-[20] backdrop-blur">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-semibold text-gray-700">Products</span>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="font-semibold text-gray-700">Smartphones</span>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-[#009966] font-semibold truncate max-w-[200px]">iPhone 15 Pro Max</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors">
            <ExternalLink size={12} /> Edit Product
          </button>
          <div className="flex items-center gap-1.5 bg-[#009966]/10 text-[#009966] text-xs font-bold px-3 py-1.5 rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-[#009966] animate-pulse" />
            Active
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="flex flex-col xl:flex-row">

            {/* LEFT: Image gallery */}
            <div className="xl:w-[520px] shrink-0 p-6 flex flex-col gap-4">

              {/* Main image */}
              <div className="relative group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImg}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="h-[380px] rounded-2xl overflow-hidden cursor-zoom-in relative"
                    onClick={() => setZoomOpen(true)}
                  >
                    <ImgPlaceholder idx={selectedImg} />
                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl" />
                    <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn size={15} className="text-gray-600" />
                    </button>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {PRODUCT.popular && (
                        <span className="bg-[#009966] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">Popular</span>
                      )}
                      <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                        -{discPct}% OFF
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Prev/Next */}
                {selectedImg > 0 && (
                  <button
                    onClick={() => setSelectedImg(p => p - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={15} />
                  </button>
                )}
                {selectedImg < PRODUCT.images.length - 1 && (
                  <button
                    onClick={() => setSelectedImg(p => p + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={15} />
                  </button>
                )}
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {PRODUCT.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                      selectedImg === i
                        ? "ring-2 ring-[#009966] ring-offset-2 scale-105"
                        : "ring-1 ring-gray-200 opacity-60 hover:opacity-100 hover:ring-gray-300"
                    }`}
                  >
                    <ImgPlaceholder idx={i} size="sm" />
                  </button>
                ))}
              </div>

              {/* Share / Bookmark row */}
              <div className="flex items-center gap-2 pt-1">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-xl hover:bg-gray-50">
                  <Share2 size={13} /> Share
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-xl hover:bg-gray-50">
                  <Bookmark size={13} /> Save
                </button>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
                  <Eye size={12} /> {PRODUCT.views.toLocaleString("en-IN")} views
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden xl:block w-px bg-gray-100 self-stretch my-6" />

            {/* RIGHT: Info panel */}
            <div className="flex-1 p-6 xl:p-8 flex flex-col gap-5">

              {/* Brand + category chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                  {PRODUCT.brandLogo} {PRODUCT.brand}
                </span>
                <span className="text-gray-300 text-sm">•</span>
                <span className="text-gray-400 text-xs">{PRODUCT.category} / {PRODUCT.subcategory}</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-gray-400 font-mono bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                  SKU: {PRODUCT.sku}
                </span>
              </div>

              {/* Product name */}
              <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">
                {PRODUCT.name}
              </h1>

              {/* Rating bar */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl">
                  <Stars rating={PRODUCT.rating} size={15} />
                  <span className="text-sm font-bold text-amber-600">{PRODUCT.rating}</span>
                </div>
                <span className="text-sm text-gray-500">{PRODUCT.reviewCount} reviews</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <TrendingUp size={13} className="text-[#009966]" />
                  {PRODUCT.sold.toLocaleString("en-IN")} sold
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Package size={13} className="text-blue-500" />
                  {PRODUCT.stock} in stock
                </span>
              </div>

              {/* Price block */}
              <div className="bg-gradient-to-br from-[#009966]/8 via-[#009966]/4 to-transparent rounded-2xl p-4 border border-[#009966]/15">
                <div className="flex items-end gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <IndianRupee size={22} className="text-gray-900 mb-0.5" strokeWidth={2.5} />
                    <span className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                      {PRODUCT.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    <span className="text-base text-gray-400 line-through">
                      ₹{PRODUCT.mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-lg">
                      {discPct}% OFF
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#009966] font-semibold mt-1.5 flex items-center gap-1">
                  <Tag size={11} />
                  You save ₹{savings.toLocaleString("en-IN")} on this product
                </p>
              </div>

              {/* Variants */}
              {PRODUCT.variants.map((variant) => (
                <div key={variant.type}>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2.5">
                    {variant.type}
                    {selectedVariants[variant.type] && (
                      <span className="normal-case font-semibold text-gray-700 ml-2">
                        — {selectedVariants[variant.type]}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variant.values.map((v) => {
                      const label = typeof v === "string" ? v : v.label;
                      const dot = typeof v === "object" ? (v as any).dot : undefined;
                      const active = selectedVariants[variant.type] === label;
                      return (
                        <button
                          key={label}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.type]: label }))}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                            active
                              ? "border-[#009966] bg-[#009966]/8 text-[#009966]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                          }`}
                        >
                          {dot && (
                            <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" style={{ background: dot }} />
                          )}
                          {label}
                          {active && <Check size={13} className="text-[#009966]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Quantity + Actions */}
              <div className="flex items-center gap-3 flex-wrap pt-1">
                {/* Qty stepper */}
                <div className="flex items-center gap-0 bg-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-gray-800">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-100"
                  style={{ background: `linear-gradient(135deg, ${G}, ${GD})` }}
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => setWishlist(w => !w)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all ${
                    wishlist ? "border-red-400 bg-red-50 text-red-500" : "border-gray-200 text-gray-400 hover:border-red-300"
                  }`}
                >
                  <Heart size={16} className={wishlist ? "fill-red-400" : ""} />
                </button>
              </div>

              {/* Buy Now */}
              <button className="w-full py-3 rounded-xl text-sm font-bold text-gray-800 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                Buy Now
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { icon: <Shield size={16} className="text-[#009966]" />, label: PRODUCT.warranty },
                  { icon: <Truck size={16} className="text-blue-500" />, label: PRODUCT.delivery },
                  { icon: <RotateCcw size={16} className="text-amber-500" />, label: `${PRODUCT.returnDays}-Day Returns` },
                  { icon: <ShieldCheck size={16} className="text-violet-500" />, label: "100% Genuine" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-xl p-3 text-center">
                    {icon}
                    <span className="text-[10px] font-semibold text-gray-600 leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Highlights</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {PRODUCT.highlights.map((h) => (
                    <div key={h} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 rounded-full bg-[#009966]/15 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Check size={9} className="text-[#009966]" />
                      </div>
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Sales", value: PRODUCT.sold.toLocaleString("en-IN"), icon: <TrendingUp size={16} />, color: "text-[#009966]", bg: "bg-[#009966]/10" },
            { label: "Page Views", value: PRODUCT.views.toLocaleString("en-IN"), icon: <Eye size={16} />, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Avg. Rating", value: `${PRODUCT.rating} / 5`, icon: <Star size={16} />, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Stock Left", value: `${PRODUCT.stock} units`, icon: <Package size={16} />, color: "text-violet-500", bg: "bg-violet-50" },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
                {icon}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold">{label}</p>
                <p className="text-base font-black text-gray-800 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabbed content ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

          {/* Tab bar */}
          <div ref={tabsRef} className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? "text-[#009966]" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#009966] rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="p-6 sm:p-8"
            >

              {/* ── Description ────────────────────────────────────── */}
              {activeTab === "description" && (
                <div className="max-w-3xl space-y-6">
                  <p className="text-gray-600 text-base leading-relaxed">{PRODUCT.shortDesc}</p>

                  {/* Tags */}
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {PRODUCT.tags.map((t) => (
                        <span key={t} className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-xl">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Product meta */}
                  <div className="bg-gray-50 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "SKU", value: PRODUCT.sku },
                      { label: "HSN Code", value: PRODUCT.hsn },
                      { label: "Made In", value: PRODUCT.madeIn },
                      { label: "Manufacturer", value: PRODUCT.manufacturer },
                      { label: "Warranty", value: PRODUCT.warranty },
                      { label: "Returns", value: PRODUCT.returnable ? `${PRODUCT.returnDays} days` : "Non-returnable" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Specifications ─────────────────────────────────── */}
              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PRODUCT.specifications.map((grp) => (
                    <div
                      key={grp.group}
                      className="rounded-2xl border border-gray-100 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenSpecGroup(openSpecGroup === grp.group ? null : grp.group)}
                        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{grp.icon}</span>
                          <span className="text-sm font-black text-gray-700">{grp.group}</span>
                        </div>
                        <ChevronDown
                          size={15}
                          className={`text-gray-400 transition-transform ${openSpecGroup === grp.group ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openSpecGroup === grp.group && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {grp.specs.map(([k, v], i) => (
                              <div
                                key={k}
                                className={`flex items-center px-5 py-2.5 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"} border-t border-gray-100`}
                              >
                                <span className="text-xs font-semibold text-gray-400 w-32 flex-shrink-0">{k}</span>
                                <span className="text-sm font-semibold text-gray-800">{v}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Reviews ────────────────────────────────────────── */}
              {activeTab === "reviews" && (
                <div className="space-y-8">

                  {/* Rating overview */}
                  <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                    {/* Big number */}
                    <div className="text-center sm:border-r sm:border-amber-200 sm:pr-8">
                      <div className="text-6xl font-black text-amber-500 leading-none">{PRODUCT.rating}</div>
                      <div className="mt-2"><Stars rating={PRODUCT.rating} size={18} /></div>
                      <div className="text-xs text-gray-500 mt-1.5 font-semibold">{PRODUCT.reviewCount} reviews</div>
                    </div>
                    {/* Bars */}
                    <div className="flex-1 space-y-2 w-full">
                      {RATING_DIST.map(({ stars, pct }) => (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12 shrink-0 justify-end">
                            <span className="text-xs font-bold text-gray-600">{stars}</span>
                            <Star size={11} className="text-amber-400 fill-amber-400" />
                          </div>
                          <div className="flex-1 h-2.5 bg-amber-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: (5 - stars) * 0.05 }}
                              className="h-full rounded-full"
                              style={{ background: pct > 40 ? "#f59e0b" : pct > 15 ? "#fbbf24" : "#fcd34d" }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-500 w-9 text-right">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Demo toggle for "has purchased" */}
                  <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-[#009966]/30 bg-[#009966]/5">
                    <div className="w-8 h-8 rounded-xl bg-[#009966]/15 flex items-center justify-center">
                      <Info size={14} className="text-[#009966]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-700">Preview: Verified Buyer State</p>
                      <p className="text-xs text-gray-500">Toggle to simulate a verified purchase</p>
                    </div>
                    <button
                      onClick={() => setHasPurchased(p => !p)}
                      className={`relative w-10 h-5.5 rounded-full transition-colors flex items-center ${hasPurchased ? "bg-[#009966]" : "bg-gray-200"}`}
                      style={{ width: 42, height: 24 }}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${hasPurchased ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                  </div>

                  {/* Write a review — only for verified buyers */}
                  <AnimatePresence>
                    {hasPurchased && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="border-2 border-[#009966]/20 rounded-2xl p-6 bg-[#009966]/3 space-y-4"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#009966] flex items-center justify-center">
                            <MessageSquare size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800">Write a Review</p>
                            <p className="text-xs text-[#009966] font-semibold">Verified Purchase</p>
                          </div>
                        </div>

                        {/* Star picker */}
                        <div>
                          <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Your Rating</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                onMouseEnter={() => setReviewHover(s)}
                                onMouseLeave={() => setReviewHover(0)}
                                onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                              >
                                <Star
                                  size={24}
                                  className={`transition-colors ${s <= (reviewHover || reviewForm.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                                />
                              </button>
                            ))}
                            {reviewForm.rating > 0 && (
                              <span className="ml-2 text-sm font-bold text-amber-500 self-center">
                                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewForm.rating]}
                              </span>
                            )}
                          </div>
                        </div>

                        <input
                          value={reviewForm.title}
                          onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="Review title (e.g. Best phone I've used)"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white"
                        />
                        <textarea
                          value={reviewForm.body}
                          onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                          rows={3}
                          placeholder="Share your experience in detail..."
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setReviewForm({ rating: 0, title: "", body: "" })}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            className="text-xs font-bold text-white px-5 py-2 rounded-xl shadow-sm transition-opacity hover:opacity-90"
                            style={{ background: G }}
                          >
                            Submit Review
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Review cards */}
                  <div className="space-y-4">
                    {REVIEWS.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="bg-gray-50 rounded-2xl p-5 border border-gray-100"
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <Avatar initials={r.avatar} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-800">{r.name}</span>
                                {r.verified && (
                                  <span className="flex items-center gap-1 bg-[#009966]/10 text-[#009966] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    <ShieldCheck size={9} /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Stars rating={r.rating} size={12} />
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <MapPin size={9} /> {r.city}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {r.images > 0 && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                <ImageIcon size={9} /> {r.images} photos
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock size={9} /> {r.date}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-800 mt-3">{r.title}</p>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.body}</p>
                        <button
                          onClick={() => {
                            const next = new Set(helpfulVotes);
                            next.has(r.id) ? next.delete(r.id) : next.add(r.id);
                            setHelpfulVotes(next);
                          }}
                          className={`mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                            helpfulVotes.has(r.id)
                              ? "bg-[#009966]/10 text-[#009966]"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <ThumbsUp size={12} className={helpfulVotes.has(r.id) ? "fill-[#009966]" : ""} />
                          Helpful ({r.helpful + (helpfulVotes.has(r.id) ? 1 : 0)})
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Sellers ────────────────────────────────────────── */}
              {activeTab === "sellers" && (
                <div className="space-y-4 max-w-2xl">
                  {PRODUCT.sellers.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-5 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:border-[#009966]/30 hover:bg-[#009966]/3 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                        🏪
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-800">{s.name}</p>
                          {s.verified && (
                            <span className="flex items-center gap-1 bg-[#009966]/10 text-[#009966] text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <ShieldCheck size={9} /> Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Stars rating={s.rating} size={11} />
                            <span className="text-xs font-bold text-amber-600">{s.rating}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Package size={10} /> {s.orders.toLocaleString("en-IN")} orders
                          </span>
                          <span className="text-[10px] text-gray-400">•</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin size={10} /> {s.city}
                          </span>
                        </div>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-xs font-bold text-white px-4 py-2 rounded-xl shadow-sm transition-all"
                        style={{ background: G }}
                      >
                        View
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Zoom modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setZoomOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-lg aspect-square rounded-3xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full h-full" style={{ background: PRODUCT.imageColors[selectedImg] }}>
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <span className="text-[120px] select-none">{PRODUCT.images[selectedImg]}</span>
                  <span className="text-white/80 font-semibold text-sm">Image {selectedImg + 1} of {PRODUCT.images.length}</span>
                </div>
              </div>
            </motion.div>
            <button
              className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setZoomOpen(false)}
            >
              <X size={18} />
            </button>
            {/* Prev / Next in zoom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
              {PRODUCT.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedImg(i); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === selectedImg ? "bg-white scale-125" : "bg-white/40"}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductDetailPage;
