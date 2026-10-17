"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Download,
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  BarChart2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

const periods = ["Today", "7D", "30D", "90D", "Custom"];

const monthlyTrend = [
  { month: "Jan", revenue: 840000,   orders: 84  },
  { month: "Feb", revenue: 1210000,  orders: 121 },
  { month: "Mar", revenue: 980000,   orders: 98  },
  { month: "Apr", revenue: 1530000,  orders: 154 },
  { month: "May", revenue: 1870000,  orders: 187 },
  { month: "Jun", revenue: 1420000,  orders: 143 },
  { month: "Jul", revenue: 2140000,  orders: 215 },
  { month: "Aug", revenue: 2460000,  orders: 247 },
  { month: "Sep", revenue: 1840000,  orders: 184 },
];

const dailySales = [
  { d: "Sep 1",  sales: 28400  },
  { d: "Sep 2",  sales: 31200  },
  { d: "Sep 3",  sales: 22800  },
  { d: "Sep 4",  sales: 41500  },
  { d: "Sep 5",  sales: 38200  },
  { d: "Sep 6",  sales: 29700  },
  { d: "Sep 7",  sales: 45800  },
  { d: "Sep 8",  sales: 33400  },
  { d: "Sep 9",  sales: 27600  },
  { d: "Sep 10", sales: 39100  },
  { d: "Sep 11", sales: 42300  },
  { d: "Sep 12", sales: 31800  },
  { d: "Sep 13", sales: 28900  },
  { d: "Sep 14", sales: 36700  },
];

const monthlySummary = [
  { month: "Sep 2026", orders: 284,  revenue: 2840000, avg: 10000, returns: 14, growth: "+8.2%",  up: true  },
  { month: "Aug 2026", orders: 462,  revenue: 4620000, avg: 10000, returns: 23, growth: "+12.4%", up: true  },
  { month: "Jul 2026", orders: 398,  revenue: 3980000, avg: 9950,  returns: 19, growth: "+18.7%", up: true  },
  { month: "Jun 2026", orders: 334,  revenue: 3340000, avg: 9940,  returns: 16, growth: "+22.1%", up: true  },
  { month: "May 2026", orders: 369,  revenue: 3690000, avg: 9950,  returns: 18, growth: "+15.3%", up: true  },
];

export function SellerSalesReportPage() {
  const [period, setPeriod] = useState("30D");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Comprehensive sales analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: G }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </motion.button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sales",  value: "₹1.84 Cr",  icon: IndianRupee,  color: "text-green-600", bg: "bg-green-50"  },
          { label: "Orders",       value: "1,847",      icon: ShoppingCart, color: "text-blue-600",  bg: "bg-blue-50"   },
          { label: "Avg Order",    value: "₹9,972",     icon: BarChart2,    color: "text-purple-600",bg: "bg-purple-50" },
          { label: "Growth",       value: "+22.4%",     icon: TrendingUp,   color: "text-amber-600", bg: "bg-amber-50"  },
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
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Trend Dual Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`${card} p-6`}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-4">Revenue &amp; Orders Trend</h2>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyTrend}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={G}         stopOpacity={0.25} />
                <stop offset="95%" stopColor={G}         stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6"   stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6"   stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="rev" orientation="left"  tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
            <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number, name: string) => [name === "revenue" ? fmt(v) : v, name === "revenue" ? "Revenue" : "Orders"]} />
            <Legend />
            <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke={G}       strokeWidth={2} fill="url(#revGrad)" dot={{ fill: G, r: 3 }} />
            <Area yAxisId="ord" type="monotone" dataKey="orders"  name="Orders"  stroke="#3b82f6" strokeWidth={2} fill="url(#ordGrad)" dot={{ fill: "#3b82f6", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Daily Sales BarChart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${card} p-6`}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-4">Daily Sales — Sep 1–14</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailySales}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="d" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [fmt(v), "Sales"]} />
            <Bar dataKey="sales" fill={G} radius={[6, 6, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Monthly Breakdown Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`${card} p-6`}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Month", "Orders", "Revenue", "Avg Order", "Returns", "Growth"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlySummary.map((row, i) => (
                <motion.tr
                  key={row.month}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-3 px-3 font-medium text-gray-800">{row.month}</td>
                  <td className="py-3 px-3 text-gray-700">{row.orders.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-3 font-medium text-gray-700">{fmt(row.revenue)}</td>
                  <td className="py-3 px-3 text-gray-600">{fmt(row.avg)}</td>
                  <td className="py-3 px-3 text-gray-600">{row.returns}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {row.growth}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Channel Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${card} p-6`}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-4">Channel Breakdown</h2>
        <div className="space-y-4">
          {[
            { label: "Online Orders", pct: 87, color: G          },
            { label: "POS Orders",    pct: 13, color: "#6366f1"  },
          ].map((c) => (
            <div key={c.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-700 font-medium">{c.label}</span>
                <span className="font-bold text-gray-800">{c.pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-3 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
