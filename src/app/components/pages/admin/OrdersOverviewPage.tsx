"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ShoppingCart, Clock, Package, Truck, CheckCircle2, XCircle,
  ListOrdered, RotateCcw, BrainCircuit, Printer, TrendingUp, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { G, fmt, card } from "./shared/constants";
import { PageHeader, StatCard, SectionCard } from "./shared/ui";

type OrderStatus = "Pending" | "Received" | "Processed" | "Shipped" |
  "Out For Delivery" | "Delivered" | "Cancelled" | "Other";
type OverviewOrder = {
  id: string;
  customer: string;
  amount: number;
  items: number;
  status: OrderStatus;
  createdAt: string;
};
type DistributionItem = { name: OrderStatus; value: number };
type DailyOrderValue = { date: string; label: string; value: number };
type OverviewData = {
  metrics: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    requestedReturns: number;
  };
  statusDistribution: DistributionItem[];
  recentOrders: OverviewOrder[];
  dailyOrderValue: DailyOrderValue[];
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  Delivered: G,
  Shipped: "#8b5cf6",
  "Out For Delivery": "#ec4899",
  Received: "#0d9488",
  Processed: "#3b82f6",
  Pending: "#f59e0b",
  Cancelled: "#ef4444",
  Other: "#6b7280",
};

const STATUS_BACKGROUND: Record<OrderStatus, string> = {
  Delivered: `${G}18`,
  Shipped: "rgba(139,92,246,0.12)",
  "Out For Delivery": "rgba(236,72,153,0.12)",
  Received: "rgba(13,148,136,0.12)",
  Processed: "rgba(59,130,246,0.12)",
  Pending: "rgba(245,158,11,0.12)",
  Cancelled: "rgba(239,68,68,0.12)",
  Other: "rgba(107,114,128,0.12)",
};

const QUICK_ACTIONS = [
  { label: "Order List", sub: "View all orders", navId: "order-list", Icon: ListOrdered, color: "#3b82f6" },
  { label: "Returns", sub: "Handle return requests", navId: "returns", Icon: RotateCcw, color: "#ef4444" },
  { label: "AI Insights", sub: "Smart order analytics", navId: "ai-insights", Icon: BrainCircuit, color: "#8b5cf6" },
  { label: "Bulk Print", sub: "Print shipping labels", navId: "bulk-print", Icon: Printer, color: "#64748b" },
];

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(STATUS_COLORS, value);
}

function isOverviewOrder(value: unknown): value is OverviewOrder {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const order = value as Record<string, unknown>;
  return typeof order.id === "string" &&
    typeof order.customer === "string" &&
    typeof order.amount === "number" &&
    typeof order.items === "number" &&
    isOrderStatus(order.status) &&
    typeof order.createdAt === "string";
}

function isOverviewData(value: unknown): value is OverviewData {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  if (!data.metrics || typeof data.metrics !== "object" || Array.isArray(data.metrics)) return false;
  const metrics = data.metrics as Record<string, unknown>;
  return ["total", "pending", "processing", "shipped", "delivered", "cancelled", "requestedReturns"]
      .every(key => typeof metrics[key] === "number") &&
    Array.isArray(data.statusDistribution) &&
    data.statusDistribution.every(entry => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
      const item = entry as Record<string, unknown>;
      return isOrderStatus(item.name) && typeof item.value === "number";
    }) &&
    Array.isArray(data.recentOrders) && data.recentOrders.every(isOverviewOrder) &&
    Array.isArray(data.dailyOrderValue) &&
    data.dailyOrderValue.every(entry => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
      const day = entry as Record<string, unknown>;
      return typeof day.date === "string" && typeof day.label === "string" && typeof day.value === "number";
    });
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString("en-IN", {
        day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
      })
    : "Date unavailable";
}

export function OrdersOverviewPage({ onNav }: { onNav: (id: string) => void }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/orders/overview", {
        credentials: "same-origin",
        cache: "no-store",
        signal,
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || Array.isArray(result) ||
          !("success" in result) || result.success !== true ||
          !("overview" in result) || !isOverviewData(result.overview)) {
        const message = result && typeof result === "object" && "message" in result &&
          typeof result.message === "string" ? result.message : "Could not load the orders overview.";
        throw new Error(message);
      }
      setData(result.overview);
    } catch (loadError) {
      if (!signal?.aborted) {
        console.error("Failed to load orders overview:", loadError);
        setError(loadError instanceof Error ? loadError.message : "Could not load the orders overview.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadOverview(controller.signal);
    return () => controller.abort();
  }, [loadOverview]);

  const chartDistribution = useMemo(
    () => (data?.statusDistribution ?? []).map(item => ({ ...item, color: STATUS_COLORS[item.name] })),
    [data]
  );
  const totalDistribution = chartDistribution.reduce((total, item) => total + item.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader breadcrumb="Orders" title="Orders Overview"
        subtitle="Manage and track customer orders using live database data">
        <button type="button" onClick={() => void loadOverview()} disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </PageHeader>

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => void loadOverview()} className="font-bold underline">Retry</button>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Orders" val={data?.metrics.total ?? "—"} color="#3b82f6" icon={ShoppingCart} />
        <StatCard label="Pending" val={data?.metrics.pending ?? "—"} color="#f59e0b" icon={Clock} />
        <StatCard label="Processing" val={data?.metrics.processing ?? "—"} color="#6366f1" icon={Package} />
        <StatCard label="Shipped" val={data?.metrics.shipped ?? "—"} color="#8b5cf6" icon={Truck} />
        <StatCard label="Delivered" val={data?.metrics.delivered ?? "—"} color={G} icon={CheckCircle2} />
        <StatCard label="Cancelled" val={data?.metrics.cancelled ?? "—"} color="#ef4444" icon={XCircle} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map(({ label, sub, navId, Icon, color }) => (
          <button key={navId} type="button" onClick={() => onNav(navId)}
            className={`${card} group p-4 text-left transition-all hover:shadow-md`}>
            <div className="mb-3 flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}15`, color }}>
                <Icon size={18} />
              </span>
              {navId === "returns" && data && data.metrics.requestedReturns > 0 && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{ background: color }}>
                  {data.metrics.requestedReturns}
                </span>
              )}
            </div>
            <p className="text-sm font-black text-gray-900 group-hover:text-gray-700">{label}</p>
            <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>
          </button>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className={`${card} overflow-hidden lg:col-span-3`}>
          <div className="flex items-center gap-2 border-b border-gray-100 bg-[#fafafa] px-5 py-3.5">
            <ShoppingCart size={14} className="text-gray-400" />
            <span className="text-xs font-black uppercase tracking-wider text-gray-600">Recent Orders</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {["Order ID", "Customer", "Amount", "Status", "Date"].map((heading, index) => (
                    <th key={heading} className={`${index === 0 || index === 4 ? "px-5" : "px-3"} py-3 text-[10px] font-black uppercase tracking-wider text-gray-400 ${index === 2 || index === 4 ? "text-right" : index === 3 ? "text-center" : "text-left"}`}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.recentOrders ?? []).map((order, index) => (
                  <tr key={order.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/60">
                    <td className="px-5 py-3">
                      <span className="font-black text-gray-700">{order.id}</span>
                      <span className="ml-1 text-gray-400">· {order.items} item{order.items === 1 ? "" : "s"}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[9px] font-black text-white"
                          style={{ background: `hsl(${(index * 47) % 360},55%,55%)` }}>
                          {order.customer.split(/\s+/).map(part => part[0] ?? "").join("").slice(0, 2).toUpperCase()}
                        </span>
                        <span className="whitespace-nowrap font-semibold text-gray-700">{order.customer}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-black text-gray-800">{fmt(order.amount)}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-black"
                        style={{ background: STATUS_BACKGROUND[order.status], color: STATUS_COLORS[order.status] }}>
                        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLORS[order.status] }} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-400">{formatTime(order.createdAt)}</td>
                  </tr>
                ))}
                {!loading && !data?.recentOrders.length && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${card} overflow-hidden lg:col-span-2`}>
          <div className="flex items-center gap-2 border-b border-gray-100 bg-[#fafafa] px-5 py-3.5">
            <span className="text-xs font-black uppercase tracking-wider text-gray-600">Status Distribution</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {chartDistribution.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => [value.toLocaleString("en-IN"), "Orders"]}
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-2">
              {chartDistribution.map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                    <span className="font-semibold text-gray-600">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{item.value.toLocaleString("en-IN")}</span>
                    <span className="w-8 text-right font-black text-gray-700">
                      {totalDistribution ? Math.round(item.value / totalDistribution * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
              {!loading && !chartDistribution.length && <p className="text-center text-xs text-gray-400">No order statuses yet.</p>}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SectionCard title="Order Value — Last 14 Days" icon={TrendingUp}>
          <div className="-mt-2 mb-2 text-xs text-gray-400">Order totals by order date (₹)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.dailyOrderValue ?? []} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="ordersValueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={G} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={G} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                tickFormatter={value => value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : `₹${Math.round(value / 1000)}k`} />
              <Tooltip formatter={(value: number) => [fmt(value), "Order value"]}
                contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }} />
              <Area type="monotone" dataKey="value" stroke={G} strokeWidth={2.5}
                fill="url(#ordersValueGradient)" dot={{ r: 3, fill: G, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: G, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>
      </motion.div>
    </div>
  );
}
