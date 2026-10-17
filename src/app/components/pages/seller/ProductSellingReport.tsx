"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  BarChart2,
  Download,
  Package,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingBag,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

const topProducts = [
  { p: "Samsung A55",      sales: 142 },
  { p: "Redmi Note 13",    sales: 89  },
  { p: "Realme Buds Air 5",sales: 71  },
  { p: "Boat Airdopes",    sales: 98  },
  { p: "Zebronics Mouse",  sales: 112 },
  { p: "Noise ColorFit",   sales: 54  },
  { p: "iQOO Z9 Lite",     sales: 45  },
  { p: "OnePlus Nord",     sales: 76  },
  { p: "JBL Flip 6",       sales: 63  },
  { p: "Mi Band 8",        sales: 51  },
];

const productTable = [
  { rank: 1,  product: "Samsung A55",       category: "Smartphones", units: 142, revenue: 2697858, avgPrice: 18999, returnRate: "2.1%", trend: "+18%",  up: true  },
  { rank: 2,  product: "Zebronics Mouse",   category: "Accessories", units: 112, revenue: 279888,  avgPrice: 2499,  returnRate: "0.9%", trend: "+24%",  up: true  },
  { rank: 3,  product: "Boat Airdopes",     category: "Audio",       units: 98,  revenue: 293902,  avgPrice: 2999,  returnRate: "3.2%", trend: "+11%",  up: true  },
  { rank: 4,  product: "Redmi Note 13",     category: "Smartphones", units: 89,  revenue: 1512311, avgPrice: 16992, returnRate: "1.7%", trend: "+9%",   up: true  },
  { rank: 5,  product: "OnePlus Nord",      category: "Smartphones", units: 76,  revenue: 2127924, avgPrice: 27999, returnRate: "2.6%", trend: "-3%",   up: false },
  { rank: 6,  product: "Realme Buds Air 5", category: "Audio",       units: 71,  revenue: 163229,  avgPrice: 2299,  returnRate: "4.1%", trend: "+7%",   up: true  },
  { rank: 7,  product: "JBL Flip 6",        category: "Audio",       units: 63,  revenue: 314937,  avgPrice: 4999,  returnRate: "1.2%", trend: "+5%",   up: true  },
  { rank: 8,  product: "Noise ColorFit",    category: "Wearables",   units: 54,  revenue: 188892,  avgPrice: 3498,  returnRate: "2.8%", trend: "-7%",   up: false },
  { rank: 9,  product: "Mi Band 8",         category: "Wearables",   units: 51,  revenue: 178449,  avgPrice: 3499,  returnRate: "1.5%", trend: "+14%",  up: true  },
  { rank: 10, product: "iQOO Z9 Lite",      category: "Smartphones", units: 45,  revenue: 674955,  avgPrice: 14999, returnRate: "2.3%", trend: "+31%",  up: true  },
  { rank: 11, product: "HP Laptop 14",      category: "Laptops",     units: 38,  revenue: 2089962, avgPrice: 54999, returnRate: "3.7%", trend: "+6%",   up: true  },
  { rank: 12, product: "JBL Tune 720BT",    category: "Audio",       units: 34,  revenue: 135966,  avgPrice: 3999,  returnRate: "1.8%", trend: "-2%",   up: false },
  { rank: 13, product: "Sony WH-1000XM5",   category: "Audio",       units: 28,  revenue: 643972,  avgPrice: 22999, returnRate: "4.6%", trend: "+19%",  up: true  },
  { rank: 14, product: "Dell Monitor 24",   category: "Laptops",     units: 22,  revenue: 614978,  avgPrice: 27999, returnRate: "2.1%", trend: "+8%",   up: true  },
  { rank: 15, product: "Realme Narzo 70",   category: "Smartphones", units: 19,  revenue: 265981,  avgPrice: 13999, returnRate: "1.4%", trend: "+42%",  up: true  },
];

const categoryData = [
  { name: "Smartphones", value: 37 },
  { name: "Audio",       value: 24 },
  { name: "Wearables",   value: 18 },
  { name: "Laptops",     value: 12 },
  { name: "Others",      value: 9  },
];

const COLORS = [G, "#3b82f6", "#f59e0b", "#8b5cf6", "#6b7280"];
const periods = ["7D", "30D", "90D", "1Y"];

export function SellerProductSellingReport() {
  const [period, setPeriod] = useState("30D");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Selling Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sales performance by product</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  period === p ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: G }}
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sales",      value: "1,847 units",     icon: ShoppingBag,  color: "text-green-600", bg: "bg-green-50"  },
          { label: "Revenue",          value: "₹1.84 Cr",        icon: IndianRupee,  color: "text-blue-600",  bg: "bg-blue-50"   },
          { label: "Best Seller",      value: "Samsung A55",     icon: Package,      color: "text-purple-600",bg: "bg-purple-50" },
          { label: "Avg Selling Price",value: "₹9,972",          icon: BarChart2,    color: "text-amber-600", bg: "bg-amber-50"  },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`${card} p-5`}
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Top 10 by Sales — BarChart + Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`${card} p-6 lg:col-span-2`}
        >
          <h2 className="text-base font-semibold text-gray-800 mb-4">Top 10 Products by Sales</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="p" type="category" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(v: number) => [v + " units", "Sales"]} />
              <Bar dataKey="sales" fill={G} radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${card} p-6`}
        >
          <h2 className="text-base font-semibold text-gray-800 mb-4">Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {categoryData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  {d.name}
                </span>
                <span className="font-semibold text-gray-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Product Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`${card} p-6`}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-4">Product Performance Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Rank", "Product", "Category", "Units Sold", "Revenue", "Avg Price", "Return Rate", "Trend"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productTable.map((row, i) => (
                <motion.tr
                  key={row.rank}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-3 px-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${row.rank <= 3 ? "text-white" : "bg-gray-100 text-gray-600"}`}
                      style={row.rank <= 3 ? { backgroundColor: G } : {}}>
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-800">{row.product}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-xs text-gray-600">{row.category}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-700">{row.units.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-3 font-medium text-gray-700">{fmt(row.revenue)}</td>
                  <td className="py-3 px-3 text-gray-600">{fmt(row.avgPrice)}</td>
                  <td className="py-3 px-3 text-gray-600">{row.returnRate}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${row.up ? "text-green-600" : "text-red-500"}`}>
                      {row.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {row.trend}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
