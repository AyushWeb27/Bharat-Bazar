import { motion } from "motion/react";
import {
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  Package,
  RotateCcw,
  Star,
  AlertTriangle,
  Clock,
  MessageSquare,
  Plus,
  ListOrdered,
} from "lucide-react";
import {
  AreaChart,
  Area,
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

const recentOrders = [
  { id: "BB-4847", customer: "Priya S.",   product: "Samsung A55",      amount: 18999, status: "Processing", time: "5m ago"  },
  { id: "BB-4846", customer: "Rahul G.",   product: "Boat Airdopes",    amount: 2499,  status: "Delivered",  time: "18m ago" },
  { id: "BB-4845", customer: "Anita K.",   product: "OnePlus Nord",     amount: 27999, status: "Pending",    time: "34m ago" },
  { id: "BB-4844", customer: "Vikram P.",  product: "JBL Speaker",      amount: 4999,  status: "Shipped",    time: "1h ago"  },
  { id: "BB-4843", customer: "Neha J.",    product: "Apple Watch",      amount: 42999, status: "Delivered",  time: "2h ago"  },
  { id: "BB-4842", customer: "Arjun M.",   product: "Mi Band 8",        amount: 3499,  status: "Processing", time: "3h ago"  },
  { id: "BB-4841", customer: "Deepa N.",   product: "Sony WH1000",      amount: 22999, status: "Pending",    time: "4h ago"  },
  { id: "BB-4840", customer: "Suresh R.",  product: "HP Laptop",        amount: 54999, status: "Delivered",  time: "5h ago"  },
  { id: "BB-4839", customer: "Kavitha I.", product: "Redmi Note 13",    amount: 16999, status: "Shipped",    time: "6h ago"  },
  { id: "BB-4838", customer: "Mohan D.",   product: "Noise ColorFit",   amount: 2999,  status: "Delivered",  time: "8h ago"  },
];

const orderStatusData = [
  { name: "Delivered",  value: 756, color: "#009966" },
  { name: "Processing", value: 456, color: "#3b82f6" },
  { name: "Shipped",    value: 312, color: "#8b5cf6" },
  { name: "Pending",    value: 234, color: "#f59e0b" },
  { name: "Cancelled",  value: 89,  color: "#ef4444" },
  { name: "Returned",   value: 42,  color: "#6b7280" },
];

const topProducts = [
  { rank: 1, name: "Samsung Galaxy A55",  cat: "Electronics", sales: 142, revenue: 2695858, stock: 12, rating: 4.8 },
  { rank: 2, name: "Boat Airdopes 141",   cat: "Electronics", sales: 98,  revenue: 244902,  stock: 34, rating: 4.6 },
  { rank: 3, name: "OnePlus Nord CE4",    cat: "Electronics", sales: 76,  revenue: 2127924, stock: 8,  rating: 4.5 },
  { rank: 4, name: "JBL Flip 6",         cat: "Electronics", sales: 63,  revenue: 314937,  stock: 22, rating: 4.7 },
  { rank: 5, name: "Mi Band 8",          cat: "Electronics", sales: 51,  revenue: 178449,  stock: 45, rating: 4.3 },
];

const STATUS_COLOR: Record<string, string> = {
  Processing: "#3b82f6",
  Delivered:  "#009966",
  Pending:    "#f59e0b",
  Shipped:    "#8b5cf6",
  Cancelled:  "#ef4444",
  Returned:   "#6b7280",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "#6b7280";
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ color, backgroundColor: color + "20" }}
    >
      {status}
    </span>
  );
}

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

// ─── Main Component ───────────────────────────────────────────────────────────

export function SellerOverviewPage({ onNav }: { onNav: (id: string) => void }) {
  return (
    <div className="space-y-6 p-4 sm:p-6">

      {/* 1. Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-6 sm:p-8 text-white"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold">Good morning, Ravi! 👋</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-indigo-200 font-medium">Ravi Electro Hub</span>
              <span className="inline-flex items-center rounded-full bg-indigo-500/30 border border-indigo-400/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-100">
                ✓ Verified Seller
              </span>
            </div>
            {/* Live dot */}
            <div className="flex items-center gap-2 mt-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <span className="text-green-300 text-sm font-medium">Store is Live</span>
            </div>
          </div>

          {/* Today snapshot */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {[
              { label: "Sales Today", value: fmt(28400) },
              { label: "Orders Today", value: "12" },
              { label: "Pending", value: "3" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-center min-w-[90px]"
              >
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-indigo-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => onNav("add-product")}
            className="flex items-center gap-2 rounded-xl bg-white text-indigo-700 font-semibold text-sm px-5 py-2.5 hover:bg-indigo-50 transition-colors"
          >
            <Plus size={16} />
            Add Product
          </button>
          <button
            onClick={() => onNav("all-orders")}
            className="flex items-center gap-2 rounded-xl bg-white/15 border border-white/30 text-white font-semibold text-sm px-5 py-2.5 hover:bg-white/25 transition-colors"
          >
            <ListOrdered size={16} />
            View Orders
          </button>
        </div>
      </motion.div>

      {/* 2. KPI stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: "Total Revenue",   value: fmt(18420000),   change: "+22.4% this month", icon: IndianRupee, color: S,          pos: true  },
          { label: "Total Orders",    value: "1,847",         change: "+18.3%",             icon: ShoppingCart, color: "#3b82f6", pos: true  },
          { label: "Avg Order Value", value: fmt(9972),       change: "+5.1%",              icon: TrendingUp,   color: "#8b5cf6", pos: true  },
          { label: "Products Listed", value: "284",           change: "+12 new",            icon: Package,      color: "#10b981", pos: true  },
          { label: "Return Rate",     value: "2.3%",          change: "-0.4% (good)",       icon: RotateCcw,    color: "#f59e0b", pos: true  },
          { label: "Rating",          value: "4.7★",          change: "+0.1",               icon: Star,         color: "#f59e0b", pos: true  },
        ].map(({ label, value, change, icon: Icon, color, pos }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className={`${card} p-4 flex flex-col gap-2`}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: color + "18" }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
            <p className="text-xs text-gray-500 leading-tight">{label}</p>
            <p className={`text-xs font-medium ${pos ? "text-green-600" : "text-red-500"}`}>
              {change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 3. Revenue trend chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className={`${card} p-5`}
      >
        <h2 className="text-base font-semibold text-gray-900 mb-4">Revenue Trend (Jan – Sep)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={S}         stopOpacity={0.25} />
                <stop offset="95%" stopColor={S}         stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gOrd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="m" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="rev" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
            <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip content={<RevenueTooltip />} />
            <Area yAxisId="rev" type="monotone" dataKey="rev" stroke={S}        strokeWidth={2.5} fill="url(#gRev)" name="Revenue (₹L)" />
            <Area yAxisId="ord" type="monotone" dataKey="ord" stroke="#3b82f6"  strokeWidth={2}   fill="url(#gOrd)" name="Orders"        />
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

      {/* 4. Two-column section: Orders table + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent Orders — 60% */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className={`${card} p-5 lg:col-span-3`}
        >
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-2 pr-3 font-medium">Order ID</th>
                  <th className="pb-2 pr-3 font-medium">Customer</th>
                  <th className="pb-2 pr-3 font-medium hidden sm:table-cell">Product</th>
                  <th className="pb-2 pr-3 font-medium text-right">Amount</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 font-medium hidden sm:table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o, i) => (
                  <tr
                    key={o.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-2.5 pr-3 text-indigo-600 font-medium">{o.id}</td>
                    <td className="py-2.5 pr-3 text-gray-700 whitespace-nowrap">{o.customer}</td>
                    <td className="py-2.5 pr-3 text-gray-600 hidden sm:table-cell max-w-[140px] truncate">{o.product}</td>
                    <td className="py-2.5 pr-3 text-gray-900 font-medium text-right whitespace-nowrap">{fmt(o.amount)}</td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-2.5 text-gray-400 text-xs hidden sm:table-cell whitespace-nowrap">{o.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Order Status Donut — 40% */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
          className={`${card} p-5 lg:col-span-2 flex flex-col`}
        >
          <h2 className="text-base font-semibold text-gray-900 mb-2">Order Status</h2>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value, name]}
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

      {/* 5. Top Products table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className={`${card} p-5`}
      >
        <h2 className="text-base font-semibold text-gray-900 mb-4">Top Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 pr-4 font-medium">#</th>
                <th className="pb-2 pr-4 font-medium">Product</th>
                <th className="pb-2 pr-4 font-medium hidden sm:table-cell">Category</th>
                <th className="pb-2 pr-4 font-medium text-right">Sales</th>
                <th className="pb-2 pr-4 font-medium text-right">Revenue</th>
                <th className="pb-2 pr-4 font-medium">Stock</th>
                <th className="pb-2 font-medium text-center">Rating</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => {
                const stockPct = Math.min(100, (p.stock / 50) * 100);
                const lowStock = p.stock < 15;
                return (
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
                    <td className="py-3 pr-4 font-medium text-gray-900 max-w-[180px] truncate">{p.name}</td>
                    <td className="py-3 pr-4 text-gray-500 hidden sm:table-cell">{p.cat}</td>
                    <td className="py-3 pr-4 text-right font-medium text-gray-800">{p.sales}</td>
                    <td className="py-3 pr-4 text-right font-medium text-gray-900">{fmt(p.revenue)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${stockPct}%`,
                              backgroundColor: lowStock ? "#ef4444" : "#10b981",
                            }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${lowStock ? "text-red-500" : "text-gray-600"}`}>
                          {p.stock}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-amber-500 font-medium text-xs">
                        <Star size={12} fill="currentColor" />
                        {p.rating}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 6. Alerts row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: AlertTriangle,
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.1)",
            title: "Low Stock Alert",
            desc: "12 products low stock",
            nav: "s-inventory",
            cta: "View Inventory",
          },
          {
            icon: Clock,
            color: "#ef4444",
            bg: "rgba(239,68,68,0.1)",
            title: "Pending Orders",
            desc: "8 orders need attention",
            nav: "s-pending",
            cta: "Review Orders",
          },
          {
            icon: MessageSquare,
            color: S,
            bg: "rgba(99,102,241,0.1)",
            title: "New Review",
            desc: "3 new reviews to respond",
            nav: "reviews",
            cta: "View Reviews",
          },
        ].map(({ icon: Icon, color, bg, title, desc, nav, cta }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.05, duration: 0.35 }}
            className={`${card} p-5 flex items-center gap-4`}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => onNav(nav)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
              style={{ color, backgroundColor: bg }}
            >
              {cta}
            </button>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
