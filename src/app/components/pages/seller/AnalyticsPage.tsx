import { useState } from "react";
import { motion } from "motion/react";
import {
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  BarChart2,
  Star,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { S, fmt, card } from "./shared/constants";

// ─── Data ────────────────────────────────────────────────────────────────────

const revenueData = [
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

const categoryData = [
  { cat: "Electronics", sales: 142 },
  { cat: "Mobiles",     sales: 89  },
  { cat: "Accessories", sales: 67  },
  { cat: "Audio",       sales: 54  },
  { cat: "Wearables",   sales: 43  },
  { cat: "Laptops",     sales: 31  },
];

const trafficData = [
  { name: "Direct",  value: 38, color: S         },
  { name: "Search",  value: 29, color: "#3b82f6" },
  { name: "Social",  value: 18, color: "#8b5cf6" },
  { name: "Email",   value: 11, color: "#f59e0b" },
  { name: "Other",   value: 4,  color: "#6b7280" },
];

// Sep 1–14 daily sales
const dailySalesData = [
  { day: "Sep 1",  sales: 22400  },
  { day: "Sep 2",  sales: 18900  },
  { day: "Sep 3",  sales: 31500  },
  { day: "Sep 4",  sales: 28700  },
  { day: "Sep 5",  sales: 41200  },
  { day: "Sep 6",  sales: 15600  },
  { day: "Sep 7",  sales: 38000  },
  { day: "Sep 8",  sales: 24300  },
  { day: "Sep 9",  sales: 44800  },
  { day: "Sep 10", sales: 12100  },
  { day: "Sep 11", sales: 33700  },
  { day: "Sep 12", sales: 27600  },
  { day: "Sep 13", sales: 39400  },
  { day: "Sep 14", sales: 21800  },
];

const topProducts = [
  { rank: 1, name: "Samsung Galaxy A55",  sales: 142, revenue: 2695858, rating: 4.8, growth: 12.4 },
  { rank: 2, name: "Boat Airdopes 141",   sales: 98,  revenue: 244902,  rating: 4.6, growth: 8.7  },
  { rank: 3, name: "OnePlus Nord CE4",    sales: 76,  revenue: 2127924, rating: 4.5, growth: 6.2  },
  { rank: 4, name: "JBL Flip 6",         sales: 63,  revenue: 314937,  rating: 4.7, growth: 15.1 },
  { rank: 5, name: "Mi Band 8",          sales: 51,  revenue: 178449,  rating: 4.3, growth: 4.8  },
];

const DATE_RANGES = ["Today", "7D", "30D", "90D"] as const;
type DateRange = (typeof DATE_RANGES)[number];

const fulfillmentMetrics = [
  { label: "On-Time Delivery Rate", value: 94.2, max: 100, color: S           },
  { label: "Return Rate",           value: 2.3,  max: 10,  color: "#f59e0b"   },
  { label: "Customer Satisfaction", value: 94,   max: 100, color: S           },
  { label: "Product Approval Rate", value: 98.1, max: 100, color: "#10b981"   },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`${card} p-3 text-sm shadow-lg`}>
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p style={{ color: S }}>Revenue: ₹{payload[0]?.value}L</p>
      <p style={{ color: "#3b82f6" }}>Orders: {payload[1]?.value}</p>
    </div>
  );
};

const DailyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`${card} p-3 text-sm shadow-lg`}>
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p style={{ color: S }}>Sales: {fmt(payload[0]?.value)}</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function SellerAnalyticsPage() {
  const [range, setRange] = useState<DateRange>("30D");

  return (
    <div className="space-y-6 p-4 sm:p-6">

      {/* 1. Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track your store performance and sales trends</p>
        </div>
        {/* Date range pills */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl self-start sm:self-auto">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                range === r
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 2. KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "GMV",              value: fmt(18420000), change: "+22.4%", icon: IndianRupee, color: S,          pos: true },
          { label: "Orders",           value: "1,847",       change: "+18.3%", icon: ShoppingCart, color: "#3b82f6", pos: true },
          { label: "Conversion Rate",  value: "3.2%",        change: "+0.8%",  icon: TrendingUp,   color: "#10b981", pos: true },
          { label: "Avg Order Value",  value: fmt(9972),     change: "+5.1%",  icon: BarChart2,    color: "#f59e0b", pos: true },
        ].map(({ label, value, change, icon: Icon, color, pos }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className={`${card} p-4`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: color + "18" }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pos ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                {change}
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* 3. Revenue + Orders AreaChart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className={`${card} p-5`}
      >
        <h2 className="text-base font-semibold text-gray-900 mb-4">Revenue & Orders (Jan – Sep)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="aGRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={S}         stopOpacity={0.25} />
                <stop offset="95%" stopColor={S}         stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="aGOrd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="m" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="rev" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
            <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip content={<RevenueTooltip />} />
            <Area yAxisId="rev" type="monotone" dataKey="rev" stroke={S}       strokeWidth={2.5} fill="url(#aGRev)" />
            <Area yAxisId="ord" type="monotone" dataKey="ord" stroke="#3b82f6" strokeWidth={2}   fill="url(#aGOrd)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-5 mt-3 justify-center">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="inline-block w-3 h-1 rounded-full" style={{ backgroundColor: S }} />
            Revenue (₹ Lakhs)
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="inline-block w-3 h-1 rounded-full bg-blue-500" />
            Orders
          </span>
        </div>
      </motion.div>

      {/* 4. Sales by Category + Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4">

        {/* Category BarChart — 55% */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`${card} p-5 lg:col-span-6`}
        >
          <h2 className="text-base font-semibold text-gray-900 mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="cat"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={82}
              />
              <Tooltip
                formatter={(v: number) => [v, "Sales"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }}
              />
              <Bar dataKey="sales" fill={S} radius={[0, 6, 6, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Traffic Sources donut — 45% */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.33, duration: 0.4 }}
          className={`${card} p-5 lg:col-span-5 flex flex-col`}
        >
          <h2 className="text-base font-semibold text-gray-900 mb-2">Traffic Sources</h2>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${value}%`}
                  labelLine={false}
                >
                  {trafficData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [`${v}%`, name]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* 5. Order Fulfillment Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className={`${card} p-5`}
      >
        <h2 className="text-base font-semibold text-gray-900 mb-5">Order Fulfillment Metrics</h2>
        <div className="space-y-5">
          {fulfillmentMetrics.map(({ label, value, max, color }) => {
            const pct = Math.min(100, (value / max) * 100);
            const displayVal = max === 10 ? `${value}%` : max === 5 ? `${value}/5` : `${value}%`;
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700 font-medium">{label}</span>
                  <span className="text-sm font-semibold" style={{ color }}>{displayVal}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 6. Daily Sales last 14 days */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className={`${card} p-5`}
      >
        <h2 className="text-base font-semibold text-gray-900 mb-4">Daily Sales — Sep 1–14</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={dailySalesData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={48}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<DailyTooltip />} />
            <Bar dataKey="sales" fill={S} radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 7. Top Performing Products */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className={`${card} p-5`}
      >
        <h2 className="text-base font-semibold text-gray-900 mb-4">Top Performing Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 pr-4 font-medium">Rank</th>
                <th className="pb-2 pr-4 font-medium">Product</th>
                <th className="pb-2 pr-4 font-medium text-right">Sales</th>
                <th className="pb-2 pr-4 font-medium text-right">Revenue</th>
                <th className="pb-2 pr-4 font-medium text-center">Rating</th>
                <th className="pb-2 font-medium text-right">Growth</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr
                  key={p.rank}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: S }}
                    >
                      {p.rank}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-900 max-w-[200px] truncate">{p.name}</td>
                  <td className="py-3 pr-4 text-right font-medium text-gray-800">{p.sales}</td>
                  <td className="py-3 pr-4 text-right font-medium text-gray-900">{fmt(p.revenue)}</td>
                  <td className="py-3 pr-4 text-center">
                    <span className="inline-flex items-center gap-1 text-amber-500 font-medium text-xs">
                      <Star size={12} fill="currentColor" />
                      {p.rating}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-xs bg-green-50 px-2 py-0.5 rounded-full">
                      +{p.growth}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}
