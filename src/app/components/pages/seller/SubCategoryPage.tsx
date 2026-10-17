import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle, XCircle, Layers, Search, Package } from "lucide-react";

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";

const SUBCATEGORIES = [
  { id: 1,  name: "Android Phones",       category: "Smartphones", products: 54, status: "Active"   },
  { id: 2,  name: "iPhones",              category: "Smartphones", products: 23, status: "Active"   },
  { id: 3,  name: "Budget Phones",        category: "Smartphones", products: 12, status: "Active"   },
  { id: 4,  name: "Gaming Laptops",       category: "Laptops",     products: 11, status: "Active"   },
  { id: 5,  name: "Business Laptops",     category: "Laptops",     products: 9,  status: "Active"   },
  { id: 6,  name: "Ultrabooks",           category: "Laptops",     products: 7,  status: "Active"   },
  { id: 7,  name: "Wireless Earbuds",     category: "Audio",       products: 18, status: "Active"   },
  { id: 8,  name: "Over-ear Headphones",  category: "Audio",       products: 14, status: "Active"   },
  { id: 9,  name: "Neckbands",            category: "Audio",       products: 10, status: "Active"   },
  { id: 10, name: "Smartwatches",         category: "Wearables",   products: 21, status: "Active"   },
  { id: 11, name: "Fitness Bands",        category: "Wearables",   products: 10, status: "Active"   },
  { id: 12, name: "DSLR Cameras",         category: "Cameras",     products: 8,  status: "Active"   },
  { id: 13, name: "Action Cameras",       category: "Cameras",     products: 6,  status: "Active"   },
  { id: 14, name: "Phone Cases",          category: "Accessories", products: 31, status: "Inactive" },
  { id: 15, name: "Chargers & Cables",    category: "Accessories", products: 36, status: "Active"   },
];

const PARENT_CATS = ["Smartphones", "Laptops", "Audio", "Wearables", "Cameras", "Accessories"];

const CAT_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Smartphones: { bg: "#eff6ff", text: "#3b82f6",  dot: "#3b82f6"  },
  Laptops:     { bg: "#f5f3ff", text: "#8b5cf6",  dot: "#8b5cf6"  },
  Audio:       { bg: "#fffbeb", text: "#d97706",  dot: "#f59e0b"  },
  Wearables:   { bg: "#fdf2f8", text: "#ec4899",  dot: "#ec4899"  },
  Cameras:     { bg: "#f0fdf4", text: "#059669",  dot: "#10b981"  },
  Accessories: { bg: "#fff7ed", text: "#f97316",  dot: "#f97316"  },
};

const CAT_ICONS: Record<string, string> = {
  Smartphones: "📱",
  Laptops:     "💻",
  Audio:       "🎧",
  Wearables:   "⌚",
  Cameras:     "📷",
  Accessories: "🔌",
};

export function SellerSubCategoryPage() {
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filtered = SUBCATEGORIES.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchTab    = activeTab === "All" || s.category === activeTab;
    return matchSearch && matchTab;
  });

  const total    = SUBCATEGORIES.length;
  const active   = SUBCATEGORIES.filter(s => s.status === "Active").length;
  const inactive = SUBCATEGORIES.filter(s => s.status === "Inactive").length;

  const tabCounts = Object.fromEntries(
    PARENT_CATS.map(cat => [cat, SUBCATEGORIES.filter(s => s.category === cat).length])
  );

  const STATS = [
    { label: "Total SubCategories", value: total,    icon: <Layers size={18} />,      color: "#3b82f6" },
    { label: "Active",              value: active,   icon: <CheckCircle size={18} />, color: G          },
    { label: "Inactive",            value: inactive, icon: <XCircle size={18} />,     color: "#ef4444"  },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">SubCategory</h1>
        <p className="text-sm text-gray-500 mt-0.5">Browse all sub-categories under each parent category</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

      {/* Parent category overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {PARENT_CATS.map((cat, i) => {
          const style = CAT_STYLE[cat];
          const count = tabCounts[cat] ?? 0;
          return (
            <motion.button
              key={cat}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveTab(activeTab === cat ? "All" : cat)}
              className={`rounded-2xl border-2 p-3 text-left transition-all ${
                activeTab === cat ? "shadow-md" : "bg-white hover:shadow-sm"
              }`}
              style={
                activeTab === cat
                  ? { background: style.bg, borderColor: style.dot }
                  : { background: "#fff", borderColor: "#e5e7eb" }
              }
            >
              <div className="text-2xl mb-2">{CAT_ICONS[cat]}</div>
              <p className="text-xs font-bold text-gray-800 leading-tight">{cat}</p>
              <p className="text-xs mt-0.5" style={{ color: style.text }}>{count} sub</p>
            </motion.button>
          );
        })}
      </div>

      {/* Search + active filter label */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all"
            placeholder="Search sub-categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("All")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
            style={
              activeTab === "All"
                ? { background: G, color: "#fff", borderColor: G }
                : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
            }
          >
            All ({total})
          </button>
          {activeTab !== "All" && (
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: CAT_STYLE[activeTab]?.bg, color: CAT_STYLE[activeTab]?.text }}
            >
              {CAT_ICONS[activeTab]} {activeTab} · {filtered.length} results
            </span>
          )}
        </div>
      </div>

      {/* SubCategory Table */}
      {filtered.length === 0 ? (
        <div className={`${card} py-16 text-center text-gray-400`}>
          <Package size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No sub-categories found</p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide w-10">#</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">SubCategory</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Parent Category</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide w-36">Products</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide w-28">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const cs = CAT_STYLE[s.category] ?? { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af" };
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{i + 1}</td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {/* Color dot */}
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cs.dot }} />
                          <span className="font-semibold text-gray-800">{s.name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={{ background: cs.bg, color: cs.text }}
                        >
                          {CAT_ICONS[s.category]}
                          {s.category}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: cs.dot }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((s.products / 60) * 100, 100)}%` }}
                              transition={{ delay: i * 0.03 + 0.2, duration: 0.5 }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-700">{s.products}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={
                            s.status === "Active"
                              ? { background: "#dcfce7", color: "#16a34a" }
                              : { background: "#fee2e2", color: "#dc2626" }
                          }
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.status === "Active" ? "bg-green-500" : "bg-red-400"}`} />
                          {s.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
              <span className="font-semibold text-gray-600">{total}</span> sub-categories
            </p>
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400" /> Active: {active}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Inactive: {inactive}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
