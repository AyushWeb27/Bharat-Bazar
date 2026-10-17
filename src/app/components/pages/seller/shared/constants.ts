export const S  = "#6366f1";   // seller primary (indigo)
export const SD = "#4f46e5";   // seller primary dark

export const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
export const pct = (n: number, d: number) => d > 0 ? ((n / d) * 100).toFixed(1) + "%" : "0%";

export const inp  = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all bg-white";
export const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";

export const ORDER_STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  Pending:         { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Pending"         },
  Processing:      { color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  label: "Processing"      },
  Shipped:         { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  label: "Shipped"         },
  "Out for Delivery": { color: "#ec4899", bg: "rgba(236,72,153,0.12)", label: "Out for Delivery" },
  Delivered:       { color: "#009966", bg: "rgba(0,153,102,0.12)",   label: "Delivered"       },
  Cancelled:       { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "Cancelled"       },
  Returned:        { color: "#6b7280", bg: "rgba(107,114,128,0.12)", label: "Returned"        },
};

export const CAT_COLORS: Record<string, string> = {
  Electronics:     "#3b82f6",
  Fashion:         "#ec4899",
  Beauty:          "#a855f7",
  Sports:          "#10b981",
  "Home & Living": "#f59e0b",
  Grocery:         "#ef4444",
  Books:           "#6366f1",
  Toys:            "#f97316",
};
