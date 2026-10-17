import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IndianRupee, ShoppingCart, Monitor, Package, RotateCcw, Star,
  TrendingUp, TrendingDown, Plus, Eye, AlertTriangle, RefreshCw,
  CheckCircle2, BadgeCheck,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { fmt, card } from "./shared/constants";

// ─── Constants ────────────────────────────────────────────────────────────────

const G = "#009966";

// ─── Revenue chart data ───────────────────────────────────────────────────────

const CHART_DATA = [
  { m: "Jan", rev: 8.4,  ord: 840  },
  { m: "Feb", rev: 12.1, ord: 1210 },
  { m: "Mar", rev: 9.8,  ord: 980  },
  { m: "Apr", rev: 15.3, ord: 1530 },
  { m: "May", rev: 18.7, ord: 1870 },
  { m: "Jun", rev: 14.2, ord: 1420 },
  { m: "Jul", rev: 21.4, ord: 2140 },
  { m: "Aug", rev: 24.6, ord: 2460 },
  { m: "Sep", rev: 18.4, ord: 1847 },
];

// ─── KPI cards ────────────────────────────────────────────────────────────────

const KPIS = [
  { label: "Total Revenue",    value: "₹1,84,20,000", change: "+22.4%", up: true,  lowerBetter: false, icon: IndianRupee, color: G,         bg: "rgba(0,153,102,0.10)"  },
  { label: "Total Orders",     value: "1,847",         change: "+18.3%", up: true,  lowerBetter: false, icon: ShoppingCart, color: "#3b82f6", bg: "rgba(59,130,246,0.10)" },
  { label: "POS Orders",       value: "234",           change: "+8.1%",  up: true,  lowerBetter: false, icon: Monitor,      color: "#8b5cf6", bg: "rgba(139,92,246,0.10)" },
  { label: "Products Listed",  value: "284",           change: "+12",    up: true,  lowerBetter: false, icon: Package,      color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  { label: "Return Rate",      value: "2.3%",          change: "-0.4%",  up: false, lowerBetter: true,  icon: RotateCcw,    color: "#ef4444", bg: "rgba(239,68,68,0.10)"  },
  { label: "Rating",           value: "4.7★",          change: "+0.1",   up: true,  lowerBetter: false, icon: Star,         color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
];

// ─── Recent orders ────────────────────────────────────────────────────────────

const RECENT_ORDERS = [
  { id: "BB-4847", customer: "Priya S.",   product: "Samsung A55",    amount: 18999, status: "Processing", time: "5m"  },
  { id: "BB-4846", customer: "Rahul G.",   product: "Boat Airdopes",  amount: 2499,  status: "Delivered",  time: "18m" },
  { id: "BB-4845", customer: "Anita K.",   product: "OnePlus Nord",   amount: 27999, status: "Pending",    time: "34m" },
  { id: "BB-4844", customer: "Vikram P.",  product: "JBL Speaker",    amount: 4999,  status: "Shipped",    time: "1h"  },
  { id: "BB-4843", customer: "Neha J.",    product: "Apple Watch",    amount: 42999, status: "Delivered",  time: "2h"  },
  { id: "BB-4842", customer: "Arjun M.",   product: "Mi Band 8",      amount: 3499,  status: "Processing", time: "3h"  },
  { id: "BB-4841", customer: "Deepa N.",   product: "Sony WH1000",    amount: 22999, status: "Pending",    time: "4h"  },
  { id: "BB-4840", customer: "Suresh R.",  product: "HP Laptop",      amount: 54999, status: "Delivered",  time: "5h"  },
  { id: "BB-4839", customer: "Kavitha I.", product: "Redmi Note 13",  amount: 16999, status: "Shipped",    time: "6h"  },
  { id: "BB-4838", customer: "Mohan D.",   product: "Noise ColorFit", amount: 2999,  status: "Delivered",  time: "8h"  },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  Processing: { color: "#3b82f6", bg: "rgba(59,130,246,0.10)"  },
  Delivered:  { color: G,         bg: "rgba(0,153,102,0.10)"   },
  Pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.10)"  },
  Shipped:    { color: "#8b5cf6", bg: "rgba(139,92,246,0.10)"  },
};

// ─── Donut chart data ─────────────────────────────────────────────────────────

const DONUT_DATA = [
  { name: "Delivered",  value: 756, color: G          },
  { name: "Processing", value: 456, color: "#3b82f6"  },
  { name: "Shipped",    value: 312, color: "#8b5cf6"  },
  { name: "Pending",    value: 234, color: "#f59e0b"  },
  { name: "Cancelled",  value: 89,  color: "#ef4444"  },
  { name: "Returned",   value: 42,  color: "#6b7280"  },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === "rev" ? `Revenue: ₹${p.value}L` : `Orders: ${p.value}`}
        </p>
      ))}
    </div>
  );
}

// ─── Live dot ─────────────────────────────────────────────────────────────────

function LiveDot() {
  return (
    <span className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: G }}
          animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: G }} />
      </span>
      <span className="text-xs font-semibold text-white/70">Store is Live</span>
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SellerDashboardPage({ onNav }: { onNav: (id: string) => void }) {
  const [_tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">

      {/* ── Welcome hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #0d1117 0%, #161b22 60%, #0d2a1e 100%)" }}
      >
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: G }}
        />
        <div className="relative px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <LiveDot />
              <h1 className="mt-3 text-2xl md:text-3xl font-black text-white">
                Good morning, Ravi! 👋
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm text-white/60 font-medium">Ravi Electro Hub</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(0,153,102,0.28)", color: "#4ade80" }}>
                  <BadgeCheck size={11} /> Verified Seller
                </span>
              </div>
              <div className="flex flex-wrap gap-6 mt-5">
                {[
                  { label: "Sales Today",   value: fmt(28400) },
                  { label: "Orders Today",  value: "12"       },
                  { label: "Pending",       value: "3"        },
                ].map(s => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">{s.label}</span>
                    <span className="text-xl font-black text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 md:mt-2">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => onNav("add-product")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: G }}
              >
                <Plus size={15} /> Add Product
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => onNav("orders")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white border border-white/20 hover:bg-white/10 transition-all"
              >
                <Eye size={15} /> View Orders
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPIS.map((k, i) => {
          const Icon = k.icon;
          const positive = k.lowerBetter ? !k.up : k.up;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`${card} p-4 flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
                  <Icon size={17} style={{ color: k.color }} />
                </div>
                <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${positive ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"}`}>
                  {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {k.change}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{k.label}</p>
                <p className="text-lg font-black text-gray-900 leading-tight">{k.value}</p>
                {k.lowerBetter && <p className="text-[9px] text-gray-400 mt-0.5">lower is better</p>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Revenue chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`${card} p-5`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-black text-gray-900">Revenue &amp; Orders</h2>
            <p className="text-xs text-gray-400 mt-0.5">Jan – Sep 2026</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: G }} />Revenue (₹L)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: "#3b82f6" }} />Orders
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={CHART_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={G}         stopOpacity={0.3} />
                <stop offset="100%" stopColor={G}         stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3b82f6"  stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3b82f6"  stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="rev" stroke={G}         strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: G         }} />
            <Area type="monotone" dataKey="ord" stroke="#3b82f6"  strokeWidth={2}   fill="url(#ordGrad)" dot={false} activeDot={{ r: 4, fill: "#3b82f6"  }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Two-column section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className={`${card} p-5 lg:col-span-3 overflow-hidden`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-gray-900">Recent Orders</h2>
            <button onClick={() => onNav("orders")} className="text-xs font-semibold hover:underline" style={{ color: G }}>
              View all
            </button>
          </div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs min-w-[540px]">
              <thead>
                <tr className="text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-100">
                  {["Order ID", "Customer", "Product", "Amount", "Status", "Time"].map(h => (
                    <th key={h} className="text-left pb-2 px-1 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o, i) => {
                  const sm = STATUS_STYLE[o.status] ?? STATUS_STYLE.Processing;
                  return (
                    <motion.tr
                      key={o.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.03 }}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="py-2.5 px-1 font-bold text-gray-800">{o.id}</td>
                      <td className="py-2.5 px-1 text-gray-600">{o.customer}</td>
                      <td className="py-2.5 px-1 text-gray-600 max-w-[110px] truncate">{o.product}</td>
                      <td className="py-2.5 px-1 font-bold text-gray-900">{fmt(o.amount)}</td>
                      <td className="py-2.5 px-1">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ color: sm.color, background: sm.bg }}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-1 text-gray-400">{o.time} ago</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Donut chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className={`${card} p-5 lg:col-span-2`}
        >
          <h2 className="text-sm font-black text-gray-900 mb-1">Order Status</h2>
          <p className="text-xs text-gray-400 mb-2">Total 1,889 orders</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={DONUT_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {DONUT_DATA.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any, n: any) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
            {DONUT_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-[10px] text-gray-500 truncate">{d.name}</span>
                <span className="text-[10px] font-bold text-gray-800 ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Alert row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: AlertTriangle, title: "Low Stock Alert",  value: "12 items", desc: "Need restocking",       color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  nav: "stock-management" },
          { icon: ShoppingCart,  title: "Pending Orders",   value: "8 orders", desc: "Awaiting processing",   color: "#ef4444", bg: "rgba(239,68,68,0.08)",   nav: "orders"           },
          { icon: RefreshCw,     title: "New Returns",      value: "5 new",    desc: "Requires attention",    color: "#ef4444", bg: "rgba(239,68,68,0.08)",   nav: "return"           },
        ].map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.button
              key={a.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNav(a.nav)}
              className={`${card} p-4 flex items-center gap-4 text-left hover:shadow-md transition-all`}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: a.bg }}>
                <Icon size={20} style={{ color: a.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">{a.title}</p>
                <p className="text-lg font-black" style={{ color: a.color }}>{a.value}</p>
                <p className="text-[10px] text-gray-400">{a.desc}</p>
              </div>
              <CheckCircle2 size={16} className="text-gray-300 shrink-0" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
