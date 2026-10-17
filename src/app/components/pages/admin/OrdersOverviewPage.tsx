import { motion } from "motion/react";
import {
  ShoppingCart, Clock, Package, Truck, CheckCircle2, XCircle,
  ListOrdered, RotateCcw, BrainCircuit, Printer, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { G, fmt, card } from "./shared/constants";
import { PageHeader, StatCard, SectionCard } from "./shared/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "Delivered" | "Shipped" | "Processing" | "Pending" | "Cancelled";

const STATUS_META: Record<OrderStatus, { color: string; bg: string }> = {
  Delivered:  { color: G,         bg: `${G}18`                   },
  Shipped:    { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)"    },
  Processing: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)"    },
  Pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)"    },
  Cancelled:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)"     },
};

// ─── Sample data ──────────────────────────────────────────────────────────────

const RECENT = [
  { id: "BB-2847", customer: "Priya Sharma",   av: "PS", amount: 2340, items: 3, status: "Delivered"  as OrderStatus, time: "2m ago"  },
  { id: "BB-2846", customer: "Rahul Gupta",    av: "RG", amount: 5670, items: 2, status: "Shipped"    as OrderStatus, time: "8m ago"  },
  { id: "BB-2845", customer: "Anita Singh",    av: "AS", amount:  890, items: 1, status: "Processing" as OrderStatus, time: "15m ago" },
  { id: "BB-2844", customer: "Vikram Patel",   av: "VP", amount: 3120, items: 4, status: "Pending"    as OrderStatus, time: "22m ago" },
  { id: "BB-2843", customer: "Neha Joshi",     av: "NJ", amount: 7840, items: 6, status: "Delivered"  as OrderStatus, time: "31m ago" },
  { id: "BB-2842", customer: "Arjun Kumar",    av: "AK", amount: 1560, items: 2, status: "Cancelled"  as OrderStatus, time: "45m ago" },
  { id: "BB-2841", customer: "Deepa Nair",     av: "DN", amount: 4230, items: 3, status: "Shipped"    as OrderStatus, time: "1h ago"  },
  { id: "BB-2840", customer: "Suresh Rao",     av: "SR", amount:  990, items: 1, status: "Delivered"  as OrderStatus, time: "1h ago"  },
  { id: "BB-2839", customer: "Kavitha Iyer",   av: "KI", amount: 6780, items: 5, status: "Processing" as OrderStatus, time: "2h ago"  },
  { id: "BB-2838", customer: "Mohan Das",      av: "MD", amount: 2100, items: 2, status: "Shipped"    as OrderStatus, time: "2h ago"  },
  { id: "BB-2837", customer: "Sunita Verma",   av: "SV", amount: 3450, items: 3, status: "Delivered"  as OrderStatus, time: "3h ago"  },
  { id: "BB-2836", customer: "Ravi Krishnan",  av: "RK", amount: 1230, items: 1, status: "Pending"    as OrderStatus, time: "3h ago"  },
];

const PIE_DATA = [
  { name: "Delivered",  value: 756, color: G          },
  { name: "Processing", value: 456, color: "#3b82f6"  },
  { name: "Shipped",    value: 312, color: "#8b5cf6"  },
  { name: "Pending",    value: 234, color: "#f59e0b"  },
  { name: "Cancelled",  value:  89, color: "#ef4444"  },
];

const REVENUE_DATA = [
  { day: "Sep 1",  rev: 3.2 }, { day: "Sep 2",  rev: 4.1 }, { day: "Sep 3",  rev: 5.8 },
  { day: "Sep 4",  rev: 3.9 }, { day: "Sep 5",  rev: 6.2 }, { day: "Sep 6",  rev: 7.4 },
  { day: "Sep 7",  rev: 5.1 }, { day: "Sep 8",  rev: 4.8 }, { day: "Sep 9",  rev: 6.9 },
  { day: "Sep 10", rev: 8.2 }, { day: "Sep 11", rev: 5.6 }, { day: "Sep 12", rev: 7.1 },
  { day: "Sep 13", rev: 9.3 }, { day: "Sep 14", rev: 8.7 },
];

const QUICK_ACTIONS = [
  { label: "Order List",   sub: "View all orders",      navId: "order-list", Icon: ListOrdered, color: "#3b82f6", badge: null    },
  { label: "Returns",      sub: "Handle return requests", navId: "returns",   Icon: RotateCcw,   color: "#ef4444", badge: "24"   },
  { label: "AI Insights",  sub: "Smart order analytics", navId: "ai-insights",Icon: BrainCircuit,color: "#8b5cf6", badge: null   },
  { label: "Bulk Print",   sub: "Print shipping labels", navId: "bulk-print", Icon: Printer,     color: "#64748b", badge: null   },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function OrdersOverviewPage({ onNav }: { onNav: (id: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="Orders"
        title="Orders Overview"
        subtitle="Manage and track all customer orders"
      />

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        <StatCard label="Total Orders" val="1,847"  color="#3b82f6" icon={ShoppingCart} />
        <StatCard label="Pending"      val="234"    color="#f59e0b" icon={Clock}        />
        <StatCard label="Processing"   val="456"    color="#6366f1" icon={Package}      />
        <StatCard label="Shipped"      val="312"    color="#8b5cf6" icon={Truck}        />
        <StatCard label="Delivered"    val="756"    color={G}       icon={CheckCircle2} />
        <StatCard label="Cancelled"    val="89"     color="#ef4444" icon={XCircle}      />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {QUICK_ACTIONS.map(({ label, sub, navId, Icon, color, badge }) => (
          <button
            key={navId}
            onClick={() => onNav(navId)}
            className={`${card} p-4 text-left hover:shadow-md transition-all group`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}15`, color }}
              >
                <Icon size={18} />
              </div>
              {badge && (
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                  style={{ background: color }}
                >
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm font-black text-gray-900 group-hover:text-gray-700">{label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
          </button>
        ))}
      </motion.div>

      {/* Table + Pie */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Recent Orders Table — 3/5 */}
        <div className={`${card} overflow-hidden lg:col-span-3`}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-[#fafafa]">
            <ShoppingCart size={14} className="text-gray-400" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Recent Orders</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-right px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="text-center px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {RECENT.map((o, i) => {
                  const m = STATUS_META[o.status];
                  return (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-black text-gray-700">{o.id}</span>
                        <span className="text-gray-400 ml-1">· {o.items} item{o.items > 1 ? "s" : ""}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                            style={{ background: `hsl(${(i * 47) % 360},55%,55%)` }}
                          >
                            {o.av}
                          </div>
                          <span className="font-semibold text-gray-700 whitespace-nowrap">{o.customer}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-black text-gray-800">{fmt(o.amount)}</td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap"
                          style={{ background: m.bg, color: m.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: m.color }} />
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-400">{o.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie Chart — 2/5 */}
        <div className={`${card} overflow-hidden lg:col-span-2`}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-[#fafafa]">
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Status Distribution</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [v.toLocaleString("en-IN"), "Orders"]}
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="space-y-2 mt-2">
              {PIE_DATA.map((d) => {
                const total = PIE_DATA.reduce((s, x) => s + x.value, 0);
                const pct = Math.round((d.value / total) * 100);
                return (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: d.color }} />
                      <span className="text-gray-600 font-semibold">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{d.value.toLocaleString("en-IN")}</span>
                      <span className="font-black text-gray-700 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <SectionCard title="Revenue — Last 14 Days" icon={TrendingUp}>
          <div className="text-xs text-gray-400 -mt-2 mb-2">Values in lakhs (₹)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={G} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={G} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}L`}
              />
              <Tooltip
                formatter={(v: number) => [`₹${v}L`, "Revenue"]}
                contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="rev"
                stroke={G}
                strokeWidth={2.5}
                fill="url(#revGrad)"
                dot={{ r: 3, fill: G, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: G, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </motion.div>
    </div>
  );
}
