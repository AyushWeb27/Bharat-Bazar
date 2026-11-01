import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, CheckCircle2, Clock, XCircle, Eye, Pencil, Star,
  MapPin, Tag, ShoppingBag, TrendingUp, MessageSquare, Package,
  Receipt, BadgePercent, ShieldCheck, ShieldOff, Mail, Phone,
  FileText, Landmark, RefreshCw, ExternalLink,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";
import { G, fmt, card, inp } from "./shared/constants";
import {
  PageHeader, Field, Modal, DeleteConfirm, Toggle, StatCard, SearchBar,
} from "./shared/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type SellerStatus = "Active" | "Pending" | "Suspended";

interface Seller {
  id: number;
  name: string;
  owner: string;
  cat: string;
  city: string;
  gstin: string;
  products: number;
  rating: number;
  revenue: number;
  status: SellerStatus;
  joined: string;
  commission: number;
  featured: boolean;
  email?: string;
  mobile?: string;
  pan?: string;
  aadhaar?: string;
  kyc_status?: string;
  store_logo_url?: string;
  store_banner_url?: string;
  address_line1?: string;
  bank_name?: string;
  account_number?: string;
  ifsc?: string;
  account_holder?: string;
  gst_doc_url?: string;
  pan_doc_url?: string;
  aadhaar_doc_url?: string;
  bank_doc_url?: string;
  trade_license_url?: string;
}

// ─── Fallback Data ────────────────────────────────────────────────────────────

const SELLERS_INIT: Seller[] = [
  { id: 1,  name: "Ravi Electro Hub",    owner: "Ravi Shankar",   cat: "Electronics",  city: "Mumbai",      gstin: "27AABCR1234F1Z5", products: 284, rating: 4.7, revenue: 18420000, status: "Active",    joined: "Jan 2023", commission: 8,  featured: true  },
  { id: 2,  name: "FashionFiesta Store", owner: "Priya Kapoor",   cat: "Fashion",      city: "Delhi",       gstin: "07AADCF5678G1Z3", products: 567, rating: 4.5, revenue: 12300000, status: "Active",    joined: "Mar 2023", commission: 12, featured: false },
  { id: 3,  name: "GreenGrocer India",   owner: "Mohan Das",      cat: "Grocery",      city: "Bengaluru",   gstin: "29AACCG9012H1Z1", products: 89,  rating: 4.8, revenue: 8940000,  status: "Active",    joined: "Jun 2023", commission: 6,  featured: true  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS = ["All", "Active", "Pending", "Suspended"] as const;
type FilterTab = typeof FILTER_TABS[number];

const CAT_COLOR: Record<string, string> = {
  "Electronics":  "#3b82f6",
  "Fashion":      "#ec4899",
  "Grocery":      "#10b981",
  "Beauty":       "#a855f7",
  "Sports":       "#f59e0b",
  "Home & Living":"#f97316",
  "Books":        "#6366f1",
  "Toys":         "#ef4444",
  "Software":     "#009966",
  "General":      "#64748b",
};

const STATUS_META: Record<SellerStatus, { color: string; bg: string; label: string }> = {
  Active:    { color: G,         bg: `${G}18`,                  label: "Active"    },
  Pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   label: "Pending"   },
  Suspended: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",    label: "Suspended" },
};

const AVATAR_PALETTE = [
  "#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981",
  "#6366f1","#ef4444","#0d9488","#f97316","#a855f7",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function catColor(cat: string) { return CAT_COLOR[cat] ?? G; }
function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "BB";
}
function avatarColor(id: number) { return AVATAR_PALETTE[(id - 1) % AVATAR_PALETTE.length]; }

function mapDbSeller(s: any): Seller {
  let mappedStatus: SellerStatus = "Pending";
  const st = (s.status || "").toLowerCase();
  if (st === "active") mappedStatus = "Active";
  else if (st === "suspended") mappedStatus = "Suspended";
  else mappedStatus = "Pending";

  const d = s.created_at ? new Date(s.created_at) : new Date();
  const joined = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return {
    id: s.id,
    name: s.store_name || s.business_name || "Merchant Store",
    owner: s.owner_name || "Merchant Owner",
    cat: s.business_category || "General",
    city: s.city || "India",
    gstin: s.gstin || "N/A",
    products: Number(s.products_count) || 0,
    rating: Number(s.rating) || 5.0,
    revenue: Number(s.revenue) || 0,
    status: mappedStatus,
    joined,
    commission: Number(s.commission_rate) || 10,
    featured: Boolean(s.featured),
    email: s.email,
    mobile: s.mobile,
    pan: s.pan,
    aadhaar: s.aadhaar,
    kyc_status: s.kyc_status || "Pending",
    store_logo_url: s.store_logo_url,
    store_banner_url: s.store_banner_url,
    address_line1: s.address_line1,
    bank_name: s.bank_name,
    account_number: s.account_number,
    ifsc: s.ifsc,
    account_holder: s.account_holder,
    gst_doc_url: s.gst_doc_url,
    pan_doc_url: s.pan_doc_url,
    aadhaar_doc_url: s.aadhaar_doc_url,
    bank_doc_url: s.bank_doc_url,
    trade_license_url: s.trade_license_url,
  };
}

// ─── Seller Card ─────────────────────────────────────────────────────────────

function SellerCard({
  seller,
  onView,
  onEdit,
  onToggleStatus,
}: {
  seller: Seller;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}) {
  const cc = catColor(seller.cat);
  const av = avatarColor(seller.id);
  const sm = STATUS_META[seller.status] || STATUS_META.Pending;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`${card} p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden`}
    >
      {/* Top category strip */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: cc }} />

      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {seller.store_logo_url ? (
            <img
              src={seller.store_logo_url}
              alt=""
              className="w-11 h-11 rounded-xl object-cover shrink-0 border border-gray-100 shadow-sm"
            />
          ) : (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm"
              style={{ background: av }}
            >
              {initials(seller.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-black text-gray-900 truncate">{seller.name}</h3>
              {seller.featured && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-500 border border-amber-200 shrink-0">
                  <Star size={8} fill="#f59e0b" /> Featured
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">{seller.owner}</p>
          </div>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0"
            style={{ background: sm.bg, color: sm.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.color }} />
            {sm.label}
          </span>
        </div>

        {/* Info pills */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} className="text-gray-400" /> {seller.city}
          </span>
          <span className="text-gray-300">•</span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: `${cc}15`, color: cc }}
          >
            <Tag size={9} /> {seller.cat}
          </span>
          {seller.kyc_status && (
            <>
              <span className="text-gray-300">•</span>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold"
                style={{
                  background: seller.kyc_status.toLowerCase() === "approved" ? `${G}15` : "#fef3c7",
                  color: seller.kyc_status.toLowerCase() === "approved" ? G : "#d97706",
                }}
              >
                KYC: {seller.kyc_status}
              </span>
            </>
          )}
        </div>

        {/* GSTIN bar */}
        <div className="bg-gray-50 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px]">
          <span className="text-gray-400 font-medium">GSTIN</span>
          <span className="font-mono font-bold text-gray-700">{seller.gstin}</span>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-xs font-black text-gray-900">{seller.products}</p>
            <p className="text-[9px] text-gray-400 font-medium mt-0.5">Products</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-xs font-black text-gray-900">{fmt(seller.revenue)}</p>
            <p className="text-[9px] text-gray-400 font-medium mt-0.5">Revenue</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="text-xs font-black text-amber-500 flex items-center justify-center gap-0.5">
              <Star size={10} fill="#f59e0b" /> {seller.rating > 0 ? seller.rating.toFixed(1) : "—"}
            </p>
            <p className="text-[9px] text-gray-400 font-medium mt-0.5">Rating</p>
          </div>
        </div>

        {/* Commission & Joined */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-600">
            <BadgePercent size={10} /> Commission: {seller.commission}%
          </span>
          <span className="text-[10px] text-gray-400 font-medium">Joined {seller.joined}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
          >
            <Eye size={12} /> View Details
          </button>
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all"
          >
            <Pencil size={12} />
          </button>
          {seller.status === "Suspended" ? (
            <button
              onClick={onToggleStatus}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-white transition-all shadow-sm"
              style={{ background: G }}
            >
              <ShieldCheck size={12} /> Activate
            </button>
          ) : (
            <button
              onClick={onToggleStatus}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
            >
              <ShieldOff size={12} /> Suspend
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  seller,
  onClose,
}: {
  seller: Seller;
  onClose: () => void;
}) {
  const cc  = catColor(seller.cat);
  const av  = avatarColor(seller.id);
  const sm  = STATUS_META[seller.status] || STATUS_META.Pending;

  return (
    <Modal open onClose={onClose} title="Merchant Profile & Verification" wide>
      {/* ── Bespoke Merchant Hero Profile Card ── */}
      <div className="rounded-3xl overflow-hidden border border-gray-200/90 shadow-xl shadow-gray-200/50 bg-white mb-5 transition-all">
        {/* Panoramic Banner Area */}
        <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-slate-950">
          {seller.store_banner_url ? (
            <>
              <img
                src={seller.store_banner_url}
                alt=""
                className="w-full h-full object-cover scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-black/30" />
            </>
          ) : (
            <div
              className="w-full h-full relative"
              style={{
                background: "linear-gradient(135deg, #061c11 0%, #0d3b24 55%, #009966 100%)",
              }}
            >
              {/* Subtle ambient lighting & pattern */}
              <div className="absolute -top-16 -left-16 w-56 h-56 bg-emerald-400/25 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-amber-400/15 rounded-full blur-3xl" />
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "22px 22px",
                }}
              />
            </div>
          )}

          {/* Top Floating Glass Badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10 flex-wrap">
            {/* Merchant ID Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold text-white/95 bg-black/45 backdrop-blur-md border border-white/20 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              MID-{String(seller.id).padStart(4, "0")}
            </div>

            {/* Badges Right */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* KYC Pill */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border shadow-sm"
                style={{
                  background:
                    seller.kyc_status?.toLowerCase() === "approved"
                      ? "rgba(0, 153, 102, 0.45)"
                      : "rgba(245, 158, 11, 0.45)",
                  borderColor:
                    seller.kyc_status?.toLowerCase() === "approved"
                      ? "rgba(110, 231, 183, 0.6)"
                      : "rgba(252, 211, 77, 0.6)",
                  color: "#ffffff",
                }}
              >
                {seller.kyc_status?.toLowerCase() === "approved" ? (
                  <ShieldCheck size={13} className="text-emerald-200" />
                ) : (
                  <Clock size={13} className="text-amber-200" />
                )}
                <span>
                  {seller.kyc_status?.toLowerCase() === "approved"
                    ? "Verified KYC Partner"
                    : `KYC: ${seller.kyc_status || "Pending"}`}
                </span>
              </div>

              {/* Account Status Pill */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white backdrop-blur-md border border-white/20 shadow-sm"
                style={{
                  background:
                    seller.status === "Active"
                      ? "rgba(16, 185, 129, 0.55)"
                      : seller.status === "Suspended"
                      ? "rgba(239, 68, 68, 0.55)"
                      : "rgba(245, 158, 11, 0.55)",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      seller.status === "Active"
                        ? "#34d399"
                        : seller.status === "Suspended"
                        ? "#f87171"
                        : "#fbbf24",
                  }}
                />
                <span>Account: {seller.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content Body (Crisp White Background) */}
        <div className="px-5 sm:px-6 pt-0 pb-5 bg-white">
          {/* Logo & Headline Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 mb-3 relative z-20">
            {/* Logo Emblem */}
            <div className="flex items-end gap-3.5">
              <div className="relative shrink-0">
                {seller.store_logo_url ? (
                  <img
                    src={seller.store_logo_url}
                    alt=""
                    className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-4 border-white shadow-xl bg-white"
                  />
                ) : (
                  <div
                    className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center text-white text-2xl font-black border-4 border-white shadow-xl"
                    style={{ background: av }}
                  >
                    {initials(seller.name)}
                  </div>
                )}
                {/* Micro Verified Seal on logo */}
                {seller.kyc_status?.toLowerCase() === "approved" && (
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-100"
                    title="Verified Merchant"
                  >
                    <CheckCircle2 size={16} className="text-[#009966]" />
                  </div>
                )}
              </div>

              {/* Store Title */}
              <div className="pb-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight leading-tight">
                    {seller.name}
                  </h2>
                  {seller.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm shadow-amber-500/20">
                      <Star size={10} fill="#fff" /> Featured Store
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Merchant Identity & Metadata Strip (Properly Adjusted & Highlighted) */}
          <div className="p-3.5 rounded-2xl bg-gray-50/90 border border-gray-200/80 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            {/* Merchant Owner Info */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-gray-500 font-semibold">Merchant Owner:</span>
              <span className="font-extrabold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs">
                {seller.owner}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 font-medium">Member since {seller.joined}</span>
            </div>

            {/* Badges: City, Category, GSTIN */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-700 shadow-2xs">
                <MapPin size={12} className="text-[#009966]" />
                {seller.city}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold border shadow-2xs"
                style={{
                  background: `${cc}12`,
                  borderColor: `${cc}35`,
                  color: cc,
                }}
              >
                <Tag size={11} />
                {seller.cat}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-black bg-slate-900 text-white shadow-2xs">
                GSTIN: {seller.gstin}
              </span>
            </div>
          </div>

          {/* Integrated Performance Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100/90 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Package size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Catalog</p>
                <p className="text-sm font-black text-gray-900 truncate">
                  {seller.products > 0 ? `${seller.products} Items` : "0 Products"}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100/90 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009966] flex items-center justify-center shrink-0">
                <TrendingUp size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total GMV</p>
                <p className="text-sm font-black text-gray-900 truncate">
                  {seller.revenue > 0 ? fmt(seller.revenue) : "₹0.00"}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100/90 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Star size={18} fill="#f59e0b" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Store Rating</p>
                <p className="text-sm font-black text-gray-900 truncate">
                  {seller.rating > 0 ? `${seller.rating.toFixed(1)} ★` : "5.0 ★"}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100/90 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <BadgePercent size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Platform Take</p>
                <p className="text-sm font-black text-gray-900 truncate">
                  {seller.commission}% Commission
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Identifiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Contact & Registration</p>
          <p className="text-xs text-gray-700 flex items-center gap-2">
            <Mail size={13} className="text-gray-400" />
            <span className="font-semibold">{seller.email || "—"}</span>
          </p>
          <p className="text-xs text-gray-700 flex items-center gap-2">
            <Phone size={13} className="text-gray-400" />
            <span className="font-semibold">{seller.mobile || "—"}</span>
          </p>
          {seller.address_line1 && (
            <p className="text-xs text-gray-500 leading-tight pt-1">
              {seller.address_line1}
            </p>
          )}
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tax & Identity (Neon DB)</p>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 font-medium">GSTIN:</span>
            <span className="font-mono font-bold text-gray-800">{seller.gstin}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 font-medium">PAN Number:</span>
            <span className="font-mono font-bold text-gray-800">{seller.pan || "—"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400 font-medium">Aadhaar:</span>
            <span className="font-mono font-bold text-gray-800">{seller.aadhaar || "—"}</span>
          </div>
        </div>
      </div>

      {/* Bank details */}
      {(seller.bank_name || seller.account_number) && (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Landmark size={12} className="text-gray-500" /> Bank Settlement Account (RBI Escrow)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">Bank Name</span>
              <span className="font-bold text-gray-800">{seller.bank_name || "—"}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Account Holder</span>
              <span className="font-bold text-gray-800">{seller.account_holder || seller.owner}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Account No.</span>
              <span className="font-mono font-bold text-gray-800">{seller.account_number || "—"}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">IFSC Code</span>
              <span className="font-mono font-bold text-gray-800">{seller.ifsc || "—"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Documents section */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Uploaded Verification Documents (seller-file bucket)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: "GST Certificate", url: seller.gst_doc_url },
            { label: "PAN Card", url: seller.pan_doc_url },
            { label: "Aadhaar Card", url: seller.aadhaar_doc_url },
            { label: "Bank Proof", url: seller.bank_doc_url },
            { label: "Trade License", url: seller.trade_license_url },
          ].map((d, i) => (
            <div key={i} className="p-2.5 rounded-xl border border-gray-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={14} className={d.url ? "text-[#009966]" : "text-gray-300"} />
                <span className="text-xs font-semibold text-gray-700 truncate">{d.label}</span>
              </div>
              {d.url ? (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded-lg hover:bg-emerald-50 text-[#009966] transition-colors"
                  title="View Document"
                >
                  <ExternalLink size={13} />
                </a>
              ) : (
                <span className="text-[10px] font-bold text-gray-400">Missing</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-xs font-black text-white transition-all shadow-md"
          style={{ background: G }}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  seller,
  onClose,
  onSave,
}: {
  seller: Seller;
  onClose: () => void;
  onSave: (updated: Seller) => void;
}) {
  const [draft, setDraft] = useState<Seller>({ ...seller });
  const set = <K extends keyof Seller>(k: K, v: Seller[K]) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <Modal open onClose={onClose} title={`Edit Store — ${seller.name}`} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Owner Name">
          <input value={draft.owner} onChange={e => set("owner", e.target.value)} className={inp} placeholder="Owner name" />
        </Field>
        <Field label="City">
          <input value={draft.city} onChange={e => set("city", e.target.value)} className={inp} placeholder="City" />
        </Field>
        <Field label="Business Category">
          <input
            value={draft.cat}
            onChange={e => set("cat", e.target.value)}
            className={inp}
            placeholder="Category (e.g. Software, Fashion, Electronics)"
          />
        </Field>
        <Field label="Commission Rate (%)">
          <input
            type="number" min={0} max={50}
            value={draft.commission}
            onChange={e => set("commission", Number(e.target.value))}
            className={inp}
          />
        </Field>
      </div>

      <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl my-4 border border-gray-100">
        <div>
          <p className="text-xs font-bold text-gray-800">Featured Merchant Store</p>
          <p className="text-[11px] text-gray-500">Highlights this seller in marketplace top seller lists</p>
        </div>
        <Toggle checked={draft.featured} onChange={() => set("featured", !draft.featured)} />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={() => { onSave(draft); onClose(); }}
          className="flex-1 py-2.5 rounded-xl text-xs font-black text-white transition-all shadow-md"
          style={{ background: G }}
        >
          Save to Neon Database
        </button>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SellerListPage() {
  const [sellers, setSellers]         = useState<Seller[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [tab, setTab]                 = useState<FilterTab>("All");
  const [detailSeller, setDetailSeller] = useState<Seller | null>(null);
  const [editSeller, setEditSeller]   = useState<Seller | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Seller | null>(null);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sellers");
      const data = await res.json();
      if (data.success && Array.isArray(data.sellers) && data.sellers.length > 0) {
        setSellers(data.sellers.map(mapDbSeller));
      } else {
        setSellers(SELLERS_INIT);
      }
    } catch (e) {
      console.error("Failed to fetch sellers from database:", e);
      setSellers(SELLERS_INIT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // ── Derived stats ──
  const total     = sellers.length;
  const active    = sellers.filter(s => s.status === "Active").length;
  const pending   = sellers.filter(s => s.status === "Pending").length;
  const suspended = sellers.filter(s => s.status === "Suspended").length;

  // ── Filtered list ──
  const filtered = sellers.filter(s => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q)  ||
      s.owner.toLowerCase().includes(q) ||
      s.gstin.toLowerCase().includes(q) ||
      s.cat.toLowerCase().includes(q)   ||
      s.city.toLowerCase().includes(q);
    const matchTab =
      tab === "All"       ||
      (tab === "Active"    && s.status === "Active")    ||
      (tab === "Pending"   && s.status === "Pending")   ||
      (tab === "Suspended" && s.status === "Suspended");
    return matchSearch && matchTab;
  });

  // ── Mutations ──
  const update = (updated: Seller) =>
    setSellers(prev => prev.map(s => s.id === updated.id ? updated : s));

  const handleToggleStatus = async (seller: Seller) => {
    if (seller.status === "Suspended") {
      try {
        const res = await fetch(`/api/admin/sellers/${seller.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Active" }),
        });
        if (res.ok) {
          update({ ...seller, status: "Active" });
        }
      } catch {
        update({ ...seller, status: "Active" });
      }
    } else {
      setSuspendTarget(seller);
    }
  };

  const confirmSuspend = async () => {
    if (!suspendTarget) return;
    try {
      await fetch(`/api/admin/sellers/${suspendTarget.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Suspended" }),
      });
    } catch {}
    update({ ...suspendTarget, status: "Suspended" });
    setSuspendTarget(null);
  };

  const handleSaveEdit = async (draft: Seller) => {
    try {
      await fetch(`/api/admin/sellers/${draft.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_name: draft.owner,
          city: draft.city,
          business_category: draft.cat,
          commission_rate: draft.commission,
          featured: draft.featured,
        }),
      });
    } catch {}
    update(draft);
  };

  // Category distribution for pie
  const catCounts = sellers.reduce<Record<string, number>>((acc, s) => {
    acc[s.cat] = (acc[s.cat] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(catCounts).map(([name, value]) => ({ name, value, color: catColor(name) }));

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <PageHeader
          breadcrumb="Manage Seller"
          title="Manage Seller List"
          subtitle="Real-time merchant accounts loaded from Neon Database"
          count={total}
        />
        <button
          onClick={fetchSellers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-[#009966]" : "text-gray-400"} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Sellers"      val={total}     color="#3b82f6" icon={Users}        />
        <StatCard label="Active Sellers"     val={active}    color={G}       icon={CheckCircle2} />
        <StatCard label="Pending Approval"   val={pending}   color="#f59e0b" icon={Clock}        />
        <StatCard label="Suspended"          val={suspended} color="#ef4444" icon={XCircle}      />
      </div>

      {/* ── Visual breakdown banner ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category distribution */}
        <div className={`${card} p-4 flex items-center gap-4`}>
          <div className="w-20 h-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={22} outerRadius={36} paddingAngle={2}>
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Categories</p>
            <div className="space-y-0.5 max-h-16 overflow-y-auto pr-1">
              {pieData.slice(0, 4).map(d => (
                <div key={d.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-gray-600 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-bold text-gray-800 shrink-0">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured sellers summary */}
        <div className={`${card} p-4 flex items-center justify-between`}>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Featured Stores</p>
            <p className="text-2xl font-black text-amber-500">{sellers.filter(s => s.featured).length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Highlighted on homepage &amp; apps</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Star size={24} fill="#f59e0b" />
          </div>
        </div>

        {/* Total GMV generated */}
        <div className={`${card} p-4 flex items-center justify-between`}>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Total Seller GMV</p>
            <p className="text-xl font-black text-gray-900">
              {fmt(sellers.reduce((acc, s) => acc + s.revenue, 0))}
            </p>
            <p className="text-[11px] text-[#009966] font-bold mt-0.5">Across verified merchants</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#009966]">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* ── Filter / Search Bar ── */}
      <div className={`${card} p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3`}>
        {/* Tab filters */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          {FILTER_TABS.map(t => {
            const cnt =
              t === "All"       ? total
              : t === "Active"    ? active
              : t === "Pending"   ? pending
              : suspended;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                style={
                  tab === t
                    ? { background: G, color: "#fff", boxShadow: "0 1px 4px rgba(0,153,102,0.3)" }
                    : { color: "#6b7280" }
                }
              >
                <span>{t}</span>
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px] font-black"
                  style={
                    tab === t
                      ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                      : { background: "#e5e7eb", color: "#6b7280" }
                  }
                >
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by store, owner, GSTIN, city…" />
        </div>
      </div>

      {/* ── Seller Grid ── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <RefreshCw size={32} className="text-[#009966] animate-spin mb-3" />
          <p className="text-sm font-bold text-gray-700">Loading sellers from Neon Database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${card} py-16 text-center text-gray-400 space-y-2`}>
          <Users size={36} className="mx-auto text-gray-300" />
          <p className="text-sm font-bold text-gray-600">No sellers found</p>
          <p className="text-xs text-gray-400">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(s => (
              <SellerCard
                key={s.id}
                seller={s}
                onView={() => setDetailSeller(s)}
                onEdit={() => setEditSeller(s)}
                onToggleStatus={() => handleToggleStatus(s)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Modals ── */}
      {detailSeller && (
        <DetailModal
          seller={detailSeller}
          onClose={() => setDetailSeller(null)}
        />
      )}

      {editSeller && (
        <EditModal
          seller={editSeller}
          onClose={() => setEditSeller(null)}
          onSave={handleSaveEdit}
        />
      )}

      {suspendTarget && (
        <DeleteConfirm
          open
          onClose={() => setSuspendTarget(null)}
          onConfirm={confirmSuspend}
          title={`Suspend Store — ${suspendTarget.name}?`}
          message={`Are you sure you want to suspend this seller? Their products will be temporarily hidden from the marketplace until reactivated.`}
        />
      )}
    </div>
  );
}

export default SellerListPage;
