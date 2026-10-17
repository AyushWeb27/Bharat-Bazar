import React, { useState } from "react";
import { motion } from "motion/react";
import {
  IndianRupee, ShoppingCart, TrendingUp, BarChart2, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { G, fmt, card } from "./shared/constants";
import { PageHeader, SectionCard } from "./shared/ui";

/* ─── Data ─────────────────────────────────────────────── */
const REVENUE_DATA = [
  { month: "Jan", revenue: 18.4, orders: 1240 },
  { month: "Feb", revenue: 22.1, orders: 1480 },
  { month: "Mar", revenue: 19.8, orders: 1320 },
  { month: "Apr", revenue: 28.3, orders: 1890 },
  { month: "May", revenue: 31.2, orders: 2080 },
  { month: "Jun", revenue: 26.7, orders: 1780 },
  { month: "Jul", revenue: 35.4, orders: 2360 },
  { month: "Aug", revenue: 38.9, orders: 2590 },
  { month: "Sep", revenue: 32.1, orders: 2140 },
];

const CATEGORY_DATA = [
  { name: "Electronics",   revenue: 84.2 },
  { name: "Fashion",       revenue: 67.8 },
  { name: "Grocery",       revenue: 52.4 },
  { name: "Beauty",        revenue: 43.1 },
  { name: "Sports",        revenue: 31.7 },
  { name: "Home & Living", revenue: 28.9 },
  { name: "Books",         revenue: 19.3 },
  { name: "Toys",          revenue: 12.8 },
];

const ORDER_STATUS_DATA = [
  { name: "Delivered",  value: 756, color: G         },
  { name: "Processing", value: 456, color: "#3b82f6" },
  { name: "Shipped",    value: 312, color: "#8b5cf6" },
  { name: "Pending",    value: 234, color: "#f59e0b" },
  { name: "Cancelled",  value: 89,  color: "#ef4444" },
];

const CITY_DATA = [
  { city: "Mumbai",    revenue: 28.4 },
  { city: "Delhi",     revenue: 24.7 },
  { city: "Bengaluru", revenue: 19.2 },
  { city: "Hyderabad", revenue: 14.8 },
  { city: "Pune",      revenue: 11.3 },
  { city: "Kolkata",   revenue: 8.9  },
  { city: "Chennai",   revenue: 9.7  },
  { city: "Jaipur",    revenue: 7.2  },
];

const TRAFFIC_DATA = [
  { name: "Direct",           value: 34, color: "#3b82f6" },
  { name: "Organic Search",   value: 28, color: G         },
  { name: "Social Media",     value: 22, color: "#8b5cf6" },
  { name: "Email",            value: 11, color: "#f59e0b" },
  { name: "Referral",         value: 5,  color: "#6b7280" },
];

const RANGE_TABS = ["Today", "7D", "30D", "90D"] as const;

/* ─── Metric Card ───────────────────────────────────────── */
interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  color: string;
  Icon: React.ElementType;
  index: number;
}
function MetricCard({ label, value, change, color, Icon, index }: MetricCardProps) {
  return (
    <motion.div
      className={`${card} p-5`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, color }}
        >
          <Icon size={18} />
        </div>
        <span
          className="flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#dcfce7", color: "#16a34a" }}
        >
          <ArrowUpRight size={11} />
          {change}
        </span>
      </div>
      <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
      <p className="text-[11px] text-gray-400 font-semibold mt-1">{label}</p>
    </motion.div>
  );
}

/* ─── Custom Tooltip ─────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-black text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.name === "revenue" ? `₹${p.value}L` : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function SimpleTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-black text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? G }} className="font-semibold">
          {unit === "rupee" ? `₹${p.value}L` : `${p.value}%`}
        </p>
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export function AnalyticsPage() {
  const [rangeTab, setRangeTab] = useState<typeof RANGE_TABS[number]>("30D");

  const metrics = [
    { label: "Gross Merchandise Value", value: fmt(28491200), change: "+18.4%", color: G,         Icon: IndianRupee  },
    { label: "Total Orders",            value: "1,847",       change: "+12.3%", color: "#3b82f6", Icon: ShoppingCart },
    { label: "Avg Order Value",         value: fmt(15424),    change: "+5.7%",  color: "#8b5cf6", Icon: TrendingUp   },
    { label: "Conversion Rate",         value: "3.84%",       change: "+0.4%",  color: "#f59e0b", Icon: BarChart2    },
  ];

  const totalOrders = ORDER_STATUS_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="Analytics"
        title="Analytics"
        subtitle="Sales intelligence, trends and performance insights"
      />

      {/* Date Range Tabs */}
      <motion.div
        className="flex gap-1.5"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {RANGE_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setRangeTab(tab)}
            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
            style={
              rangeTab === tab
                ? { background: G, color: "#fff" }
                : { background: "#f3f4f6", color: "#6b7280" }
            }
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <MetricCard key={m.label} {...m} index={i} />
        ))}
      </div>

      {/* Revenue Trend */}
      <motion.div
        className={card}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="px-5 pt-5 pb-2">
          <p className="text-xs font-black text-gray-600 uppercase tracking-wider">Revenue Trend</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Monthly revenue (₹L) and order volume</p>
        </div>
        <div className="px-2 pb-5">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={G}         stopOpacity={0.18} />
                  <stop offset="95%" stopColor={G}         stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              <Area yAxisId="left"  type="monotone" dataKey="revenue" name="revenue" stroke={G}         strokeWidth={2.5} fill="url(#gradRevenue)" dot={false} />
              <Area yAxisId="right" type="monotone" dataKey="orders"  name="orders"  stroke="#3b82f6"   strokeWidth={2.5} fill="url(#gradOrders)"  dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Categories + Order Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Top Categories — 3/5 */}
        <motion.div
          className={`${card} md:col-span-3`}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="px-5 pt-5 pb-2">
            <p className="text-xs font-black text-gray-600 uppercase tracking-wider">Top Categories</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Revenue by category (₹L)</p>
          </div>
          <div className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                layout="vertical"
                data={CATEGORY_DATA}
                margin={{ top: 0, right: 48, left: 16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}L`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(v: any) => [`₹${v}L`, "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="revenue" fill={G} radius={[0, 6, 6, 0]} label={{ position: "right", formatter: (v: any) => `₹${v}L`, fontSize: 10, fill: "#6b7280" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Status — 2/5 */}
        <motion.div
          className={`${card} md:col-span-2`}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="px-5 pt-5 pb-2">
            <p className="text-xs font-black text-gray-600 uppercase tracking-wider">Order Status</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{totalOrders.toLocaleString()} total orders</p>
          </div>
          <div className="flex flex-col items-center pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={ORDER_STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {ORDER_STATUS_DATA.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => [v.toLocaleString(), "Orders"]}
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="w-full px-5 space-y-1.5">
              {ORDER_STATUS_DATA.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-gray-600 font-medium">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-800">{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Cities + Traffic Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Cities */}
        <motion.div
          className={card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="px-5 pt-5 pb-2">
            <p className="text-xs font-black text-gray-600 uppercase tracking-wider">Top Cities</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Revenue contribution by city (₹L)</p>
          </div>
          <div className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={CITY_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="city" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}L`} />
                <Tooltip
                  formatter={(v: any) => [`₹${v}L`, "Revenue"]}
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="revenue" fill={G} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div
          className={card}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="px-5 pt-5 pb-2">
            <p className="text-xs font-black text-gray-600 uppercase tracking-wider">Traffic Sources</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Visitor acquisition breakdown</p>
          </div>
          <div className="flex flex-col items-center pb-5">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={TRAFFIC_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {TRAFFIC_DATA.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => [`${v}%`, "Share"]}
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="w-full px-5 space-y-1.5">
              {TRAFFIC_DATA.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-gray-600 font-medium">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
