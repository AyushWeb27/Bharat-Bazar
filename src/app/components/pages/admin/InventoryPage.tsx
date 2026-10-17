import { useState } from "react";
import { motion } from "motion/react";
import {
  Boxes, AlertTriangle, XCircle, Package,
  RotateCcw, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";
import { PageHeader, StatCard, SectionCard } from "./shared/ui";
import { G, fmt, card } from "./shared/constants";

/* ─── static data ─────────────────────────────────────────────────────────── */

const BY_CATEGORY = [
  { cat: "Electronics",   inStock: 8420, lowStock: 340, outStock: 82 },
  { cat: "Fashion",       inStock: 6230, lowStock: 290, outStock: 67 },
  { cat: "Grocery",       inStock: 4180, lowStock: 178, outStock: 43 },
  { cat: "Beauty",        inStock: 3290, lowStock: 145, outStock: 31 },
  { cat: "Sports",        inStock: 2140, lowStock: 98,  outStock: 21 },
  { cat: "Home & Living", inStock: 1890, lowStock: 87,  outStock: 19 },
  { cat: "Books",         inStock: 980,  lowStock: 67,  outStock: 14 },
];

const MOVEMENTS = [
  { day: "Mon", added: 450, sold: 380 },
  { day: "Tue", added: 320, sold: 410 },
  { day: "Wed", added: 580, sold: 290 },
  { day: "Thu", added: 210, sold: 520 },
  { day: "Fri", added: 670, sold: 480 },
  { day: "Sat", added: 390, sold: 610 },
  { day: "Sun", added: 280, sold: 340 },
];

type Product = {
  id: number; name: string; sku: string; cat: string;
  stock: number; minStock: number; status: "Low" | "Critical" | "Out";
};

const LOW_STOCK_PRODUCTS: Product[] = [
  { id: 1,  name: "Samsung Galaxy A55",   sku: "EL-SA55-BLK",  cat: "Electronics",   stock: 12, minStock: 50,  status: "Low"      },
  { id: 2,  name: "Boat Airdopes 141",    sku: "EL-BA141-WH",  cat: "Electronics",   stock: 8,  minStock: 30,  status: "Low"      },
  { id: 3,  name: "Levi's 511 Slim Jeans",sku: "FA-LV511-32",  cat: "Fashion",       stock: 5,  minStock: 20,  status: "Critical" },
  { id: 4,  name: "Himalaya Face Wash",   sku: "BE-HF200-100", cat: "Beauty",        stock: 23, minStock: 60,  status: "Low"      },
  { id: 5,  name: "Tata Salt 1kg",        sku: "GR-TS1KG",     cat: "Grocery",       stock: 0,  minStock: 100, status: "Out"      },
  { id: 6,  name: "Nike Air Zoom",        sku: "SP-NK-AZ-42",  cat: "Sports",        stock: 3,  minStock: 15,  status: "Critical" },
  { id: 7,  name: "Godrej Almirah",       sku: "HL-GA3D-WHT",  cat: "Home & Living", stock: 7,  minStock: 10,  status: "Low"      },
  { id: 8,  name: "OnePlus Nord CE4",     sku: "EL-OP-NCE4",   cat: "Electronics",   stock: 0,  minStock: 25,  status: "Out"      },
  { id: 9,  name: "Fabindia Kurta",       sku: "FA-FI-KRT-M",  cat: "Fashion",       stock: 14, minStock: 40,  status: "Low"      },
  { id: 10, name: "Mamaearth Vitamin C",  sku: "BE-ME-VC50",   cat: "Beauty",        stock: 19, minStock: 50,  status: "Low"      },
  { id: 11, name: "Aashirvaad Atta 5kg",  sku: "GR-AA5KG",     cat: "Grocery",       stock: 0,  minStock: 80,  status: "Out"      },
  { id: 12, name: "Puma Running Shoes",   sku: "SP-PU-RS-41",  cat: "Sports",        stock: 6,  minStock: 20,  status: "Critical" },
  { id: 13, name: "Prestige Cooker 5L",   sku: "HL-PC5L",      cat: "Home & Living", stock: 9,  minStock: 15,  status: "Low"      },
  { id: 14, name: "Redmi Note 13",        sku: "EL-RN13-BLU",  cat: "Electronics",   stock: 2,  minStock: 30,  status: "Critical" },
  { id: 15, name: "Van Heusen Shirt",     sku: "FA-VH-SHT-L",  cat: "Fashion",       stock: 11, minStock: 35,  status: "Low"      },
];

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function statusMeta(status: Product["status"]) {
  if (status === "Low")      return { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Low Stock"  };
  if (status === "Critical") return { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "Critical"   };
  return                            { color: "#ef4444", bg: "rgba(239,68,68,0.18)",   label: "Out of Stock"};
}

/* ─── component ───────────────────────────────────────────────────────────── */

export function InventoryPage() {
  const [reordering, setReordering] = useState<number | null>(null);

  const handleReorder = (id: number) => {
    setReordering(id);
    setTimeout(() => setReordering(null), 1500);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <PageHeader
        breadcrumb="Operations / Inventory"
        title="Inventory"
        subtitle="Monitor stock levels, alerts and movements"
      />

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <StatCard label="Total SKUs"        val="28,394"  color="#3b82f6" icon={Boxes}         />
        <StatCard label="In Stock"          val="26,841"  color={G}       icon={Package}       />
        <div className={`${card} p-4 flex items-center gap-3`}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-lg font-black text-gray-900">1,247</p>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-red-100 text-red-600">Alert</span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold">Low Stock Alerts</p>
          </div>
        </div>
        <div className={`${card} p-4 flex items-center gap-3`}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
            <XCircle size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-lg font-black text-gray-900">306</p>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-red-100 text-red-600">OOS</span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold">Out of Stock</p>
          </div>
        </div>
      </motion.div>

      {/* Stock by Category chart */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className={card}
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
          <TrendingUp size={14} className="text-gray-400" />
          <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Stock by Category</span>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={BY_CATEGORY}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 16, bottom: 0 }}
              barCategoryGap="28%"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="cat"
                width={92}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                formatter={(v) => v === "inStock" ? "In Stock" : v === "lowStock" ? "Low Stock" : "Out of Stock"}
              />
              <Bar dataKey="inStock"  stackId="a" fill={G}         radius={[0, 0, 0, 0]} name="inStock"  />
              <Bar dataKey="lowStock" stackId="a" fill="#f59e0b"    radius={[0, 0, 0, 0]} name="lowStock" />
              <Bar dataKey="outStock" stackId="a" fill="#ef4444"    radius={[0, 4, 4, 0]} name="outStock" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Low Stock Alerts table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.14 }}
        className={card}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Low Stock Alerts</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-600">
              {LOW_STOCK_PRODUCTS.length}
            </span>
          </div>
          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
          >
            <RotateCcw size={12} /> Reorder All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {["Product", "SKU", "Category", "Current Stock", "Min Stock", "Status", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {LOW_STOCK_PRODUCTS.map((p, i) => {
                const meta   = statusMeta(p.status);
                const ratio  = Math.min(p.stock / p.minStock, 1);
                const isReordering = reordering === p.id;
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap max-w-[180px] truncate">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-400 whitespace-nowrap">{p.sku}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.cat}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="font-black" style={{ color: ratio < 0.3 ? "#ef4444" : "#374151" }}>
                          {p.stock}
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${ratio * 100}%`,
                              background: ratio === 0 ? "#ef4444" : ratio < 0.3 ? "#ef4444" : ratio < 0.6 ? "#f59e0b" : G,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.minStock}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleReorder(p.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: isReordering ? "#6b7280" : G }}
                      >
                        <RotateCcw size={10} className={isReordering ? "animate-spin" : ""} />
                        {isReordering ? "Ordering…" : "Reorder"}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stock Movement chart */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={card}
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
          <TrendingUp size={14} className="text-gray-400" />
          <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Stock Movement — Last 7 Days</span>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={MOVEMENTS} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAdded" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={G}        stopOpacity={0.2} />
                  <stop offset="95%" stopColor={G}        stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradSold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444"  stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444"  stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
                cursor={{ stroke: "#e5e7eb" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => v === "added" ? "Stock Added" : "Units Sold"} />
              <Area
                type="monotone"
                dataKey="added"
                stroke={G}
                strokeWidth={2}
                fill="url(#gradAdded)"
                dot={{ r: 3, fill: G, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Area
                type="monotone"
                dataKey="sold"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#gradSold)"
                dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Unused imports suppressor — fmt is available via shared */}
      {false && fmt(0)}
    </div>
  );
}
