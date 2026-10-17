import React from "react";
import { CheckCircle2, Clock, Truck, XCircle, RefreshCw, Check, Ban } from "lucide-react";

export const G  = "#009966";
export const GD = "#007a52";

export const fmt     = (n: number) => "₹" + n.toLocaleString("en-IN");
export const toSlug  = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const disc    = (mrp: number, price: number) => mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

export const orderStatusMeta: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  Delivered:  { color: G,         bg: `${G}18`,               icon: React.createElement(CheckCircle2, { size: 11 }) },
  Processing: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: React.createElement(Clock,        { size: 11 }) },
  Shipped:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: React.createElement(Truck,        { size: 11 }) },
  Cancelled:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: React.createElement(XCircle,      { size: 11 }) },
  Returned:   { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: React.createElement(RefreshCw,    { size: 11 }) },
};

export const prodStatusMeta: Record<string, { label: string; color: string; bg: string }> = {
  active:       { label: "Active",       color: G,         bg: `${G}15`                  },
  inactive:     { label: "Inactive",     color: "#6b7280", bg: "rgba(107,114,128,0.1)"   },
  out_of_stock: { label: "Out of Stock", color: "#ef4444", bg: "rgba(239,68,68,0.1)"     },
  low_stock:    { label: "Low Stock",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)"    },
};

export const reqStatusMeta: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:  { label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: React.createElement(Clock, { size: 10 }) },
  approved: { label: "Approved", color: G,         bg: `${G}15`,                icon: React.createElement(Check, { size: 10 }) },
  rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)",   icon: React.createElement(Ban,   { size: 10 }) },
};

export const taxTypeMeta: Record<string, { color: string; bg: string }> = {
  GST:     { color: G,         bg: `${G}12`                    },
  IGST:    { color: "#3b82f6", bg: "rgba(59,130,246,0.1)"      },
  Customs: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)"      },
};

export const GROUP_COLORS = ["#3b82f6","#ec4899","#f59e0b","#10b981","#8b5cf6","#f97316",G,"#ef4444","#06b6d4","#84cc16"];

export const BRAND_CAT_COLOR: Record<string, string> = {
  Electronics:     "#3b82f6",
  Fashion:         "#ec4899",
  Beauty:          "#a855f7",
  Sports:          "#10b981",
  "Home & Living": "#f59e0b",
  Grocery:         "#ef4444",
};

export function getBrandCatColor(cat: string) {
  return BRAND_CAT_COLOR[cat] ?? "#6366f1";
}

export const inp  = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white";
export const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
