import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ListOrdered, Clock, PackageCheck, Package, Truck,
  Navigation, CheckCircle2, XCircle, Eye, X,
  MapPin, Phone, IndianRupee, ChevronDown,
  Search, Filter, Download, RefreshCw,
} from "lucide-react";
import { G, fmt, inp } from "./shared/constants";
import { StatCard } from "./shared/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "Pending"
  | "Received"
  | "Processed"
  | "Shipped"
  | "Out For Delivery"
  | "Delivered"
  | "Cancelled";

type Order = {
  id: string;
  customer: string;
  phone: string;
  email: string;
  items: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: OrderStatus;
  city: string;
  address: string;
  pincode: string;
  createdAt: string;
  updatedAt: string;
  products: string[];
  statusHistory: { status: OrderStatus; changedAt: string }[];
};

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(STATUS_META, value);
}

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const order = value as Record<string, unknown>;
  return typeof order.id === "string" &&
    typeof order.customer === "string" &&
    typeof order.phone === "string" &&
    typeof order.email === "string" &&
    typeof order.items === "number" &&
    typeof order.subtotal === "number" &&
    typeof order.taxAmount === "number" &&
    typeof order.shippingAmount === "number" &&
    typeof order.amount === "number" &&
    typeof order.paymentMethod === "string" &&
    typeof order.paymentStatus === "string" &&
    isOrderStatus(order.status) &&
    typeof order.city === "string" &&
    typeof order.address === "string" &&
    typeof order.pincode === "string" &&
    typeof order.createdAt === "string" &&
    typeof order.updatedAt === "string" &&
    Array.isArray(order.products) &&
    order.products.every(product => typeof product === "string") &&
    Array.isArray(order.statusHistory) &&
    order.statusHistory.every(event =>
      Boolean(event) &&
      typeof event === "object" &&
      isOrderStatus((event as Record<string, unknown>).status) &&
      typeof (event as Record<string, unknown>).changedAt === "string"
    );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Date unavailable";
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }).toLowerCase()
    : "";
}

function formatDateTime(value: string) {
  const time = formatTime(value);
  return `${time ? `${time} · ` : ""}${formatDate(value)}`;
}

// ─── Status meta ─────────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  "Pending":          { color: "#f59e0b", bg: "#fffbeb", icon: Clock,         label: "Pending"          },
  "Received":         { color: "#0d9488", bg: "#f0fdfa", icon: PackageCheck,  label: "Received"         },
  "Processed":        { color: "#3b82f6", bg: "#eff6ff", icon: Package,       label: "Processed"        },
  "Shipped":          { color: "#8b5cf6", bg: "#f5f3ff", icon: Truck,         label: "Shipped"          },
  "Out For Delivery": { color: "#ec4899", bg: "#fdf2f8", icon: Navigation,    label: "Out For Delivery" },
  "Delivered":        { color: "#009966", bg: "#e8fff6", icon: CheckCircle2,  label: "Delivered"        },
  "Cancelled":        { color: "#ef4444", bg: "#fef2f2", icon: XCircle,       label: "Cancelled"        },
};

const SIDE_NAV: { id: string; label: string; status: OrderStatus | null; icon: React.ElementType; color: string }[] = [
  { id: "all",           label: "All Orders",       status: null,              icon: ListOrdered,  color: "#6366f1" },
  { id: "pending",       label: "Pending Order",    status: "Pending",         icon: Clock,        color: "#f59e0b" },
  { id: "received",      label: "Received Order",   status: "Received",        icon: PackageCheck, color: "#0d9488" },
  { id: "processed",     label: "Processed Order",  status: "Processed",       icon: Package,      color: "#3b82f6" },
  { id: "shipped",       label: "Shipped Order",    status: "Shipped",         icon: Truck,        color: "#8b5cf6" },
  { id: "out-delivery",  label: "Out For Delivery", status: "Out For Delivery",icon: Navigation,   color: "#ec4899" },
  { id: "delivered",     label: "Delivered Order",  status: "Delivered",       icon: CheckCircle2, color: "#009966" },
  { id: "cancelled",     label: "Cancelled Order",  status: "Cancelled",       icon: XCircle,      color: "#ef4444" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const PAGE_DESCRIPTIONS: Record<string, string> = {
  all:          "Every order placed across all statuses",
  pending:      "Orders awaiting confirmation from your team",
  received:     "Orders confirmed and logged in the system",
  processed:    "Orders packed and ready for handover to courier",
  shipped:      "Orders dispatched with the courier partner",
  "out-delivery": "Orders currently with the delivery agent",
  delivered:    "Successfully completed deliveries",
  cancelled:    "Orders cancelled by customer or admin",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderListPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [q, setQ]             = useState("");
  const [detail, setDetail]   = useState<Order | null>(null);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", {
        credentials: "same-origin",
        cache: "no-store",
        signal,
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || Array.isArray(result)) {
        const message = result && typeof result === "object" && "message" in result &&
          typeof result.message === "string"
          ? result.message : "Could not load orders.";
        throw new Error(message);
      }

      const payload = result as Record<string, unknown>;
      if (payload.success !== true || !Array.isArray(payload.orders) ||
          !payload.orders.every(isOrder)) {
        throw new Error("The orders response was invalid. Please try again.");
      }
      setOrders(payload.orders);
    } catch (loadError) {
      if (!(loadError instanceof Error && loadError.name === "AbortError")) {
        console.error("Failed to load admin orders:", loadError);
        setError(loadError instanceof Error ? loadError.message : "Could not load orders.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadOrders(controller.signal);
    return () => controller.abort();
  }, [loadOrders]);

  const navItem     = SIDE_NAV.find(n => n.id === activeTab)!;
  const countOf     = (status: OrderStatus | null) => status ? orders.filter(o => o.status === status).length : orders.length;

  const displayed = useMemo(() => orders.filter(o => {
    const statusOk = !navItem.status || o.status === navItem.status;
    const qOk      = !q || o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.toLowerCase().includes(q.toLowerCase()) || o.city.toLowerCase().includes(q.toLowerCase());
    return statusOk && qOk;
  }), [navItem.status, orders, q]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdatingOrderId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: id, status }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || Array.isArray(result) ||
          !("success" in result) || result.success !== true ||
          !("order" in result) || !result.order || typeof result.order !== "object" ||
          !("status" in result.order) || !isOrderStatus(result.order.status) ||
          !("changedAt" in result.order) || typeof result.order.changedAt !== "string") {
        const message = result && typeof result === "object" && "message" in result &&
          typeof result.message === "string"
          ? result.message : "Could not update order status.";
        throw new Error(message);
      }

      const changedAt = result.order.changedAt;
      const current = orders.find(order => order.id === id);
      const statusHistory = current && current.status !== status
        ? [...current.statusHistory, { status, changedAt }]
        : current?.statusHistory ?? [];
      const updatedAt = current && current.status !== status ? changedAt : current?.updatedAt ?? changedAt;
      setOrders(previous => previous.map(order => order.id === id
        ? { ...order, status, statusHistory, updatedAt }
        : order));
      setDetail(previous => previous?.id === id
        ? { ...previous, status, statusHistory, updatedAt }
        : previous);
    } catch (updateError) {
      console.error("Failed to update order status:", updateError);
      setError(updateError instanceof Error ? updateError.message : "Could not update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const totalRevenue = displayed.reduce((s, o) => s + o.amount, 0);
  const exportOrders = () => {
    const fields = ["Order ID", "Customer", "Phone", "Email", "Amount", "Items", "Status", "City", "Address", "Pincode", "Created At"];
    const csvValue = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = displayed.map(order => [
      order.id, order.customer, order.phone, order.email, order.amount, order.items,
      order.status, order.city, order.address, order.pincode, order.createdAt,
    ]);
    const csv = [fields, ...rows].map(row => row.map(csvValue).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "bharat-bazar-orders.csv";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] -m-4 md:-m-5 overflow-hidden">

      {/* ── MOBILE HORIZONTAL NAV ── */}
      <div className="md:hidden grid shrink-0 grid-cols-4 border-b border-gray-200 bg-white">
        {SIDE_NAV.map(nav => {
          const Icon = nav.icon;
          const isActive = activeTab === nav.id;
          const short = nav.id === "all" ? "All" : nav.id === "out-delivery" ? "Delivery" : (nav.status ?? "All");
          return (
            <button key={nav.id} onClick={() => { setActiveTab(nav.id); setQ(""); }}
              className="flex min-w-0 flex-col items-center gap-1 border-b-2 px-1 py-2.5 transition-all"
              style={{ borderBottomColor: isActive ? nav.color : "transparent",
                       color: isActive ? nav.color : "#6b7280" }}>
              <Icon size={15}/>
              <span className="max-w-full truncate text-[9px] font-bold">{short}</span>
            </button>
          );
        })}
      </div>

      {/* ── LEFT SIDE NAV (desktop) ── */}
      <motion.div
        animate={{ width: sideCollapsed ? 56 : 220 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="hidden md:flex shrink-0 flex-col border-r border-gray-200 bg-white overflow-hidden min-h-0 h-full">

        {/* Panel header */}
        <div className={`flex items-center border-b border-gray-100 px-3 py-3.5 ${sideCollapsed ? "justify-center" : "justify-between"}`}>
          {!sideCollapsed && <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">Order Status</span>}
          <button onClick={() => setSideCollapsed(v => !v)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0">
            <Filter size={12}/>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
          {SIDE_NAV.map(nav => {
            const Icon    = nav.icon;
            const count   = countOf(nav.status);
            const isActive = activeTab === nav.id;
            return (
              <button key={nav.id} onClick={() => { setActiveTab(nav.id); setQ(""); }}
                title={sideCollapsed ? nav.label : undefined}
                className={`relative w-full flex items-center transition-all group ${sideCollapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5"}`}
                style={{ background: isActive ? `${nav.color}12` : "transparent" }}>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full" style={{ background: nav.color }}/>}

                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={isActive ? { background: `${nav.color}20` } : { background: "transparent" }}>
                  <Icon size={14} style={{ color: isActive ? nav.color : "#9ca3af" }}
                    className="transition-colors group-hover:text-gray-600"/>
                </div>

                {!sideCollapsed && (
                  <>
                    <span className="flex-1 text-left text-xs font-bold truncate transition-colors"
                      style={{ color: isActive ? nav.color : "#374151" }}>
                      {nav.label}
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 transition-all"
                      style={isActive
                        ? { background: `${nav.color}20`, color: nav.color }
                        : { background: "#f3f4f6", color: "#9ca3af" }}>
                      {count}
                    </span>
                  </>
                )}

                {/* Tooltip when collapsed */}
                {sideCollapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-[10px] font-semibold px-2 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-1.5">
                      {nav.label}
                      <span className="font-black text-gray-400">{count}</span>
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"/>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Total count footer */}
        {!sideCollapsed && (
          <div className="border-t border-gray-100 px-3 py-3">
            <p className="text-[9px] text-gray-400 font-semibold">{orders.length} total orders</p>
          </div>
        )}
      </motion.div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 p-3 sm:p-4 md:p-5 space-y-4 overflow-y-auto overflow-x-hidden">

        {/* Page title */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.16 }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${navItem.color}15` }}>
                  <navItem.icon size={18} style={{ color: navItem.color }}/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Orders</p>
                  <h2 className="text-lg font-black text-gray-900">{navItem.label}</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">{PAGE_DESCRIPTIONS[activeTab]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={exportOrders} disabled={loading || displayed.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all disabled:cursor-not-allowed disabled:opacity-50">
                  <Download size={12}/> Export
                </button>
                <button type="button" onClick={() => void loadOrders()} disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" style={{ background: navItem.color }}>
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""}/> Refresh
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <AnimatePresence mode="wait">
          <motion.div key={`stats-${activeTab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total"        val={displayed.length}                     color={navItem.color}  icon={navItem.icon}  />
            <StatCard label="Order Value"  val={`₹${(totalRevenue/1000).toFixed(1)}k`} color="#3b82f6"      icon={IndianRupee}   />
            <StatCard label="Avg Order"    val={displayed.length ? `₹${Math.round(totalRevenue/displayed.length).toLocaleString("en-IN")}` : "₹0"} color="#8b5cf6" icon={IndianRupee}/>
            <StatCard label="Cities"       val={new Set(displayed.map(o => o.city)).size} color="#f59e0b"   icon={MapPin}        />
          </motion.div>
        </AnimatePresence>

        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder={`Search in ${navItem.label}…`}
              className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-8 py-2 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all"/>
            {q && (
              <button onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X size={12}/>
              </button>
            )}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{displayed.length} result{displayed.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Order table */}
        <AnimatePresence mode="wait">
          <motion.div key={`table-${activeTab}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div role="status" className="px-4 py-12 text-center text-xs font-semibold text-gray-400">
                Loading orders from the database…
              </div>
            ) : displayed.length > 0 ? (
              <>
              <div className="hidden 2xl:block w-full">
                <table className="w-full table-fixed">
                  <thead>
                    <tr style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                      {[
                        ["Order ID", "w-[15%]"],
                        ["Customer", "w-[19%]"],
                        ["Amount", "w-[11%]"],
                        ["Items", "w-[7%]"],
                        ["City", "w-[11%]"],
                        ["Status", "w-[15%]"],
                        ["Date", "w-[15%]"],
                        ["", "w-[7%]"],
                      ].map(([h, width]) => (
                        <th key={h} className={`${width} text-left text-[9px] font-black text-gray-400 uppercase tracking-wider px-3 py-3 first:rounded-tl-2xl`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {displayed.map(o => {
                      const sm = STATUS_META[o.status];
                      const SI = sm.icon;
                      return (
                        <motion.tr key={o.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="group hover:bg-gray-50/60 transition-colors">
                          {/* Order ID */}
                          <td className="px-4 py-3">
                            <span className="block truncate text-[11px] font-mono font-bold text-gray-400" title={`#${o.id}`}>#{o.id}</span>
                          </td>
                          {/* Customer */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shrink-0"
                                style={{ background: navItem.color }}>
                                {initials(o.customer)}
                              </div>
                              <div>
                                <p className="truncate text-xs font-bold text-gray-800" title={o.customer}>{o.customer}</p>
                                <p className="truncate text-[9px] text-gray-400">{o.phone}</p>
                              </div>
                            </div>
                          </td>
                          {/* Amount */}
                          <td className="px-4 py-3">
                            <span className="text-xs font-black text-gray-900">{fmt(o.amount)}</span>
                          </td>
                          {/* Items */}
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-500">{o.items}</span>
                          </td>
                          {/* City */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin size={10} className="text-gray-300 shrink-0"/>
                              {o.city}
                            </div>
                          </td>
                          {/* Status — hover to change */}
                          <td className="px-4 py-3">
                            <div className="relative group/st">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer select-none"
                                style={{ color: sm.color, background: sm.bg }}>
                                <SI size={10}/> {o.status}
                                <ChevronDown size={9} className="opacity-60"/>
                              </span>
                              <div className="hidden group-hover/st:block absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden w-44">
                                {(Object.keys(STATUS_META) as OrderStatus[]).map(st => {
                                  const m2 = STATUS_META[st];
                                  const I2 = m2.icon;
                                  return (
                                    <button key={st} type="button" disabled={updatingOrderId === o.id} onClick={() => void updateStatus(o.id, st)}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold hover:bg-gray-50 transition-colors text-left"
                                      style={{ color: m2.color }}>
                                      <I2 size={11}/> {st}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                          {/* Date */}
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-[10px] text-gray-500">{formatDate(o.createdAt)}</p>
                              <p className="text-[9px] text-gray-400">{formatTime(o.createdAt)}</p>
                            </div>
                          </td>
                          {/* Actions */}
                          <td className="px-4 py-3">
                            <button onClick={() => setDetail(o)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                              <Eye size={13}/>
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4 2xl:hidden">
                {displayed.map(order => {
                  const statusMeta = STATUS_META[order.status];
                  const StatusIcon = statusMeta.icon;
                  return (
                    <article key={order.id} className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-[10px] font-bold text-gray-400" title={order.id}>#{order.id}</p>
                          <h3 className="mt-1 truncate text-sm font-bold text-gray-900" title={order.customer}>{order.customer}</h3>
                          {order.phone && <p className="mt-0.5 truncate text-[10px] text-gray-500">{order.phone}</p>}
                        </div>
                        <span className="inline-flex max-w-[48%] shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-bold"
                          style={{ color: statusMeta.color, background: statusMeta.bg }}>
                          <StatusIcon size={11} className="shrink-0" />
                          <span className="truncate">{order.status}</span>
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-gray-100 pt-3">
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Total</p>
                          <p className="mt-0.5 truncate text-xs font-black text-gray-900">{fmt(order.amount)}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Items</p>
                          <p className="mt-0.5 truncate text-xs font-bold text-gray-700">{order.items}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Delivery city</p>
                          <p className="mt-0.5 truncate text-xs text-gray-700" title={order.city || "Not provided"}>
                            {order.city || "Not provided"}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Placed</p>
                          <p className="mt-0.5 truncate text-[10px] text-gray-700">{formatDate(order.createdAt)}</p>
                          <p className="truncate text-[9px] text-gray-400">{formatTime(order.createdAt)}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex min-w-0 items-center gap-2 border-t border-gray-100 pt-3">
                        <label className="sr-only" htmlFor={`order-status-${order.id}`}>Update status for order {order.id}</label>
                        <select
                          id={`order-status-${order.id}`}
                          value={order.status}
                          disabled={updatingOrderId === order.id}
                          onChange={event => {
                            if (isOrderStatus(event.target.value)) void updateStatus(order.id, event.target.value);
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-[10px] font-bold text-gray-700 disabled:opacity-60"
                        >
                          {(Object.keys(STATUS_META) as OrderStatus[]).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          aria-label={`View order ${order.id}`}
                          onClick={() => setDetail(order)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${navItem.color}12` }}>
                  <navItem.icon size={28} style={{ color: navItem.color, opacity: 0.5 }}/>
                </div>
                <p className="text-sm font-black text-gray-400">No {navItem.label.toLowerCase()} found</p>
                {q && <button onClick={() => setQ("")} className="text-xs font-bold" style={{ color: G }}>Clear search</button>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── ORDER DETAIL DRAWER ── */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetail(null)}/>
            <motion.div initial={{ x: 380, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 380, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col overflow-hidden">

              {/* Drawer header */}
              <div className="shrink-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Order Detail</p>
                  <p className="text-sm font-black text-gray-900">#{detail.id}</p>
                </div>
                <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                  <X size={15}/>
                </button>
              </div>

              {/* Status bar */}
              <div className="shrink-0 px-5 py-3 flex items-center gap-3 border-b border-gray-100" style={{ background: `${STATUS_META[detail.status].bg}` }}>
                {(() => { const sm = STATUS_META[detail.status]; const SI = sm.icon; return (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl" style={{ color: sm.color, background: "rgba(255,255,255,0.6)" }}>
                    <SI size={12}/> {detail.status}
                  </span>
                ); })()}
                <select value={detail.status} disabled={updatingOrderId === detail.id}
                  onChange={e => { if (isOrderStatus(e.target.value)) void updateStatus(detail.id, e.target.value); }}
                  className={`${inp} flex-1 text-xs disabled:opacity-60`}>
                  {(Object.keys(STATUS_META) as OrderStatus[]).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Customer */}
                <div className="rounded-2xl border border-gray-200 p-3.5 space-y-2.5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0"
                      style={{ background: G }}>{initials(detail.customer)}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{detail.customer}</p>
                      <p className="text-[10px] text-gray-400">{detail.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={11} className="text-gray-400"/> {detail.phone}
                  </div>
                </div>

                {/* Address */}
                <div className="rounded-2xl border border-gray-200 p-3.5 space-y-1.5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Delivery Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0"/>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">{detail.address}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{detail.city} — {detail.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="rounded-2xl border border-gray-200 p-3.5 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Products ({detail.items})</p>
                  {detail.products.map((pr, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Package size={12} className="text-gray-400"/>
                      </div>
                      <span className="text-xs text-gray-700">{pr}</span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="rounded-2xl border border-gray-200 p-3.5 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Summary</p>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Subtotal</span><span className="font-bold text-gray-800">{fmt(detail.subtotal)}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Tax</span><span className="font-bold text-gray-800">{fmt(detail.taxAmount)}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Delivery</span><span className="font-bold text-gray-800">{detail.shippingAmount ? fmt(detail.shippingAmount) : "FREE"}</span></div>
                  <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-black">
                    <span className="text-gray-900">Total</span>
                    <span style={{ color: G }}>{fmt(detail.amount)}</span>
                  </div>
                  <p className="pt-1 text-[10px] text-gray-500">
                    Payment: <span className="font-bold uppercase text-gray-700">{detail.paymentMethod.replace(/[_-]+/g, " ")}</span>
                    {" · "}<span className="capitalize">{detail.paymentStatus}</span>
                  </p>
                </div>

                {/* Order timeline */}
                <div className="rounded-2xl border border-gray-200 p-3.5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Order Timeline</p>
                  {(["Pending","Received","Processed","Shipped","Out For Delivery","Delivered"] as OrderStatus[]).map((step, i, arr) => {
                    const sm    = STATUS_META[step];
                    const SI    = sm.icon;
                    const stepIdx = arr.indexOf(step);
                    const curIdx  = arr.indexOf(detail.status);
                    const isDone  = stepIdx <= curIdx && detail.status !== "Cancelled";
                    const isCur   = step === detail.status;
                    const statusEvent = detail.statusHistory.filter(event => event.status === step).slice(-1)[0];
                    return (
                      <div key={step} className="flex items-start gap-3 relative">
                        {i < arr.length - 1 && (
                          <div className="absolute left-[11px] top-5 w-[2px] h-6 rounded-full"
                            style={{ background: isDone && stepIdx < curIdx ? sm.color : "#e5e7eb" }}/>
                        )}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2"
                          style={isDone
                            ? { background: `${sm.color}15`, borderColor: sm.color }
                            : { background: "#f9fafb", borderColor: "#e5e7eb" }}>
                          <SI size={10} style={{ color: isDone ? sm.color : "#d1d5db" }}/>
                        </div>
                        <div className="pb-4">
                          <p className="text-xs font-bold" style={{ color: isDone ? (isCur ? sm.color : "#111827") : "#9ca3af" }}>{step}</p>
                          {statusEvent && <p className="text-[9px] font-medium text-gray-400">{formatDateTime(statusEvent.changedAt)}</p>}
                        </div>
                      </div>
                    );
                  })}
                  {detail.status === "Cancelled" && (
                    <div className="flex items-center gap-2.5 pt-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2" style={{ background: "#fef2f2", borderColor: "#ef4444" }}>
                        <XCircle size={10} className="text-red-500"/>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-500">Cancelled</p>
                        {detail.statusHistory.filter(event => event.status === "Cancelled").slice(-1)[0] && (
                          <p className="text-[9px] font-medium text-gray-400">
                            {formatDateTime(detail.statusHistory.filter(event => event.status === "Cancelled").slice(-1)[0].changedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OrderListPage;
