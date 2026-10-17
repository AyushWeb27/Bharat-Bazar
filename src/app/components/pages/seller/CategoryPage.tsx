import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle, XCircle, Layers, FolderOpen, Search, Package } from "lucide-react";

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";

const CATEGORIES = [
  { id: 1,  name: "Smartphones",  slug: "smartphones",  products: 89, status: "Active",   image: "📱" },
  { id: 2,  name: "Laptops",      slug: "laptops",       products: 27, status: "Active",   image: "💻" },
  { id: 3,  name: "Audio",        slug: "audio",         products: 42, status: "Active",   image: "🎧" },
  { id: 4,  name: "Wearables",    slug: "wearables",     products: 31, status: "Active",   image: "⌚" },
  { id: 5,  name: "Cameras",      slug: "cameras",       products: 14, status: "Active",   image: "📷" },
  { id: 6,  name: "Accessories",  slug: "accessories",   products: 67, status: "Active",   image: "🔌" },
  { id: 7,  name: "Speakers",     slug: "speakers",      products: 18, status: "Active",   image: "🔊" },
  { id: 8,  name: "Gaming",       slug: "gaming",        products: 9,  status: "Inactive", image: "🎮" },
  { id: 9,  name: "Tablets",      slug: "tablets",       products: 12, status: "Active",   image: "📟" },
  { id: 10, name: "Networking",   slug: "networking",    products: 7,  status: "Active",   image: "📡" },
  { id: 11, name: "Power Banks",  slug: "power-banks",   products: 11, status: "Active",   image: "🔋" },
  { id: 12, name: "Smart Home",   slug: "smart-home",    products: 8,  status: "Inactive", image: "🏠" },
];

const CARD_ACCENTS: Record<string, { bg: string; ring: string; text: string }> = {
  Smartphones: { bg: "#eff6ff", ring: "#bfdbfe", text: "#3b82f6" },
  Laptops:     { bg: "#f5f3ff", ring: "#ddd6fe", text: "#8b5cf6" },
  Audio:       { bg: "#fffbeb", ring: "#fde68a", text: "#d97706" },
  Wearables:   { bg: "#fdf2f8", ring: "#fbcfe8", text: "#ec4899" },
  Cameras:     { bg: "#f0fdf4", ring: "#bbf7d0", text: "#10b981" },
  Accessories: { bg: "#fff7ed", ring: "#fed7aa", text: "#f97316" },
  Speakers:    { bg: "#f0f9ff", ring: "#bae6fd", text: "#0ea5e9" },
  Gaming:      { bg: "#fef2f2", ring: "#fecaca", text: "#ef4444" },
  Tablets:     { bg: "#f0fdf4", ring: "#bbf7d0", text: "#059669" },
  Networking:  { bg: "#f8fafc", ring: "#e2e8f0", text: "#64748b" },
  "Power Banks":{ bg: "#fefce8", ring: "#fef08a", text: "#ca8a04" },
  "Smart Home":{ bg: "#fdf4ff", ring: "#e9d5ff", text: "#a855f7" },
};

export function SellerCategoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Inactive">("All");

  const visible = CATEGORIES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const total    = CATEGORIES.length;
  const active   = CATEGORIES.filter(c => c.status === "Active").length;
  const inactive = CATEGORIES.filter(c => c.status === "Inactive").length;
  const mapped   = CATEGORIES.reduce((a, c) => a + c.products, 0);

  const STATS = [
    { label: "Total Categories", value: total,    icon: <Layers size={18} />,      color: "#3b82f6" },
    { label: "Active",           value: active,   icon: <CheckCircle size={18} />, color: G          },
    { label: "Inactive",         value: inactive, icon: <XCircle size={18} />,     color: "#ef4444"  },
    { label: "Products Mapped",  value: mapped,   icon: <FolderOpen size={18} />,  color: "#f59e0b"  },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">Category</h1>
        <p className="text-sm text-gray-500 mt-0.5">Browse all product categories in your store</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`${card} p-4 flex items-center gap-3`}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.color + "18", color: s.color }}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all"
            placeholder="Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["All", "Active", "Inactive"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border"
              style={
                filter === f
                  ? { background: G, color: "#fff", borderColor: G }
                  : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Category Cards Grid */}
      {visible.length === 0 ? (
        <div className={`${card} py-16 text-center text-gray-400`}>
          <Package size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((cat, i) => {
            const accent = CARD_ACCENTS[cat.name] ?? { bg: "#f8fafc", ring: "#e2e8f0", text: "#64748b" };
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card top accent strip */}
                <div
                  className="h-1.5 w-full"
                  style={{ background: accent.text }}
                />

                <div className="p-5">
                  {/* Icon + Status row */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ background: accent.bg, border: `1.5px solid ${accent.ring}` }}
                    >
                      {cat.image}
                    </div>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={
                        cat.status === "Active"
                          ? { background: "#dcfce7", color: "#16a34a" }
                          : { background: "#fee2e2", color: "#dc2626" }
                      }
                    >
                      {cat.status}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-bold text-gray-900 mb-1">{cat.name}</h3>

                  {/* Slug */}
                  <p className="font-mono text-xs text-gray-400 mb-4">/{cat.slug}</p>

                  {/* Product count bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Products</span>
                      <span className="text-xs font-bold" style={{ color: accent.text }}>{cat.products}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: accent.text }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((cat.products / 100) * 100, 100)}%` }}
                        transition={{ delay: i * 0.05 + 0.3, duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center text-xs text-gray-400"
      >
        Showing {visible.length} of {total} categories
      </motion.div>
    </div>
  );
}
