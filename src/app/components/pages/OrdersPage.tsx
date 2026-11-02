"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight, Check, ChevronDown, Clock3, Package, RefreshCw, Search,
  ShoppingBag, Truck, XCircle,
} from "lucide-react";
import { G } from "../data/index";
import type { Page } from "../types/index";
import { fmt } from "../utils/format";

type OrderItem = {
  productName: string;
  variantTitle: string | null;
  quantity: number;
  lineTotal: number | string;
  image: string | null;
};

type CustomerOrder = {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number | string;
  created_at: string;
  item_count: number;
  items: OrderItem[];
};

type OrderFilter = "All" | "Active" | "Delivered" | "Cancelled";

const FILTERS: OrderFilter[] = ["All", "Active", "Delivered", "Cancelled"];
const ACTIVE_STATUSES = new Set(["placed", "processing", "shipped", "out_for_delivery"]);

function isOrder(value: unknown): value is CustomerOrder {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const order = value as Record<string, unknown>;
  return typeof order.id === "number" &&
    typeof order.order_number === "string" &&
    typeof order.status === "string" &&
    typeof order.payment_method === "string" &&
    typeof order.payment_status === "string" &&
    (typeof order.total_amount === "number" || typeof order.total_amount === "string") &&
    typeof order.created_at === "string" &&
    typeof order.item_count === "number" &&
    Array.isArray(order.items) &&
    order.items.every(item => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return false;
      const row = item as Record<string, unknown>;
      return typeof row.productName === "string" &&
        (typeof row.variantTitle === "string" || row.variantTitle === null) &&
        typeof row.quantity === "number" &&
        (typeof row.lineTotal === "number" || typeof row.lineTotal === "string") &&
        (typeof row.image === "string" || row.image === null);
    });
}

function statusKey(status: string) {
  return status.toLowerCase().replace(/[\s-]+/g, "_");
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Date unavailable";
}

function formatAmount(value: number | string) {
  const parsed = Number(value);
  return fmt(Number.isFinite(parsed) ? parsed : 0);
}

function statusPresentation(status: string) {
  const key = statusKey(status);
  if (["delivered", "completed"].includes(key)) {
    return {
      label: "Delivered",
      classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
      Icon: Check,
    };
  }
  if (["cancelled", "refunded"].includes(key)) {
    return {
      label: key === "refunded" ? "Refunded" : "Cancelled",
      classes: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
      Icon: XCircle,
    };
  }
  if (key === "out_for_delivery") {
    return {
      label: "Out for delivery",
      classes: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
      Icon: Truck,
    };
  }
  return {
    label: status.replace(/[_-]+/g, " "),
    classes: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    Icon: Clock3,
  };
}

export function OrdersPage({ setPage }: { setPage: (p: Page) => void }) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [filter, setFilter] = useState<OrderFilter>("All");
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadOrders() {
      setLoading(true);
      setError("");
      setSignedOut(false);
      try {
        const response = await fetch("/api/customer/orders", {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        const result: unknown = await response.json();
        if (response.status === 401) {
          setSignedOut(true);
          return;
        }
        if (!response.ok || !result || typeof result !== "object" || Array.isArray(result) ||
            !("success" in result) || result.success !== true ||
            !("orders" in result) || !Array.isArray(result.orders) ||
            !result.orders.every(isOrder)) {
          const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
            ? result.message : "Could not load your orders.";
          throw new Error(message);
        }
        setOrders(result.orders);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          console.error("Failed to load orders page:", loadError);
          setError(loadError instanceof Error ? loadError.message : "Could not load your orders.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadOrders();
    return () => controller.abort();
  }, [reload]);

  const activeCount = orders.filter(order => ACTIVE_STATUSES.has(statusKey(order.status))).length;
  const deliveredCount = orders.filter(order => ["delivered", "completed"].includes(statusKey(order.status))).length;
  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter(order => {
      const key = statusKey(order.status);
      if (filter === "Active" && !ACTIVE_STATUSES.has(key)) return false;
      if (filter === "Delivered" && !["delivered", "completed"].includes(key)) return false;
      if (filter === "Cancelled" && !["cancelled", "refunded"].includes(key)) return false;
      return !term ||
        order.order_number.toLowerCase().includes(term) ||
        order.items.some(item => item.productName.toLowerCase().includes(term));
    });
  }, [filter, orders, search]);

  const counts: Record<OrderFilter, number> = {
    All: orders.length,
    Active: activeCount,
    Delivered: deliveredCount,
    Cancelled: orders.filter(order => ["cancelled", "refunded"].includes(statusKey(order.status))).length,
  };

  return (
    <main className="mx-auto max-w-5xl space-y-5 pb-8">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#073d2d] px-5 py-7 text-white shadow-[0_24px_70px_-38px_rgba(4,70,48,0.8)] sm:px-8 sm:py-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-20 -z-10 h-64 w-64 rounded-full border-[38px] border-white/[0.05]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-white/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
              <ShoppingBag size={13} /> Your Bharat-Bazar account
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Every order, all in one place.</h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-emerald-50/70">
              Check what’s on its way, revisit a delivery, and keep your shopping history close.
            </p>
          </div>
          <button type="button" onClick={() => setPage("products")}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-xs font-black text-[#073d2d] transition hover:bg-emerald-200">
            Explore products <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <section aria-label="Order summary" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Total orders", value: orders.length, icon: Package, tone: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-950/50" },
          { label: "On the way", value: activeCount, icon: Truck, tone: "text-sky-700 dark:text-sky-300", bg: "bg-sky-100 dark:bg-sky-950/50" },
          { label: "Delivered", value: deliveredCount, icon: Check, tone: "text-violet-700 dark:text-violet-300", bg: "bg-violet-100 dark:bg-violet-950/50" },
        ].map(({ label, value, icon: Icon, tone, bg }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${bg} ${tone}`}><Icon size={15} /></span>
            </div>
            <p className="mt-3 text-2xl font-black tracking-tight text-foreground">{loading ? "—" : value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Order history</p>
            <h2 className="mt-1 text-xl font-black text-foreground">Your purchases</h2>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={event => setSearch(event.target.value)}
              placeholder="Search order or product"
              aria-label="Search order or product"
              className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-4 text-xs text-foreground outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15" />
          </label>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(item => (
            <button type="button" key={item} onClick={() => setFilter(item)}
              aria-pressed={filter === item}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black transition ${
                filter === item
                  ? "border-[#087a51] bg-[#087a51] text-white shadow-sm"
                  : "border-border bg-muted/35 text-muted-foreground hover:bg-muted"
              }`}>
              {item}<span className={`rounded-full px-1.5 py-0.5 text-[9px] ${filter === item ? "bg-white/20 text-white" : "bg-background text-muted-foreground"}`}>{counts[item]}</span>
            </button>
          ))}
        </div>

        <div className="mt-5">
          {loading ? (
            <div role="status" aria-label="Loading orders" className="space-y-3">
              {[0, 1, 2].map(item => <div key={item} className="h-40 animate-pulse rounded-2xl bg-muted" />)}
            </div>
          ) : error ? (
            <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/25">
              <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>
              <button type="button" onClick={() => setReload(value => value + 1)}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:text-rose-300">
                <RefreshCw size={13} /> Try again
              </button>
            </div>
          ) : signedOut ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">
              <Package size={30} className="mx-auto text-muted-foreground" />
              <h3 className="mt-3 text-sm font-black text-foreground">Sign in to see your orders</h3>
              <p className="mt-1 text-xs text-muted-foreground">Your order history will be waiting here.</p>
              <button type="button" onClick={() => setPage("signin")}
                className="mt-4 rounded-xl px-5 py-2.5 text-xs font-black text-white" style={{ background: G }}>
                Sign in
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">
              <Package size={30} className="mx-auto text-muted-foreground" />
              <h3 className="mt-3 text-sm font-black text-foreground">Your next favorite is out there</h3>
              <p className="mt-1 text-xs text-muted-foreground">There aren’t any orders on your account yet.</p>
              <button type="button" onClick={() => setPage("products")}
                className="mt-4 rounded-xl px-5 py-2.5 text-xs font-black text-white" style={{ background: G }}>
                Start shopping
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center">
              <Search size={26} className="mx-auto text-muted-foreground" />
              <h3 className="mt-3 text-sm font-black text-foreground">No matching orders</h3>
              <p className="mt-1 text-xs text-muted-foreground">Try another status or search term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map(order => {
                  const presentation = statusPresentation(order.status);
                  const StatusIcon = presentation.Icon;
                  const expanded = expandedOrder === order.id;
                  return (
                    <motion.article key={order.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="overflow-hidden rounded-2xl border border-border bg-card transition hover:border-emerald-700/30 hover:shadow-[0_12px_30px_-24px_rgba(4,70,48,0.55)]">
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <Package size={18} />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="break-all text-xs font-black text-foreground">{order.order_number}</p>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black capitalize ${presentation.classes}`}>
                                <StatusIcon size={11} /> {presentation.label}
                              </span>
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              Placed {formatDate(order.created_at)} · {order.item_count} {order.item_count === 1 ? "item" : "items"}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              {order.items.slice(0, 4).map((item, index) => (
                                <span key={`${order.id}-${index}`} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50">
                                  {item.image
                                    ? <img src={item.image} alt="" className="h-full w-full object-contain p-1" />
                                    : <Package size={15} className="text-muted-foreground" />}
                                </span>
                              ))}
                              {order.item_count > 4 && <span className="text-[10px] font-bold text-muted-foreground">+{order.item_count - 4}</span>}
                              <span className="ml-1 min-w-0 truncate text-[10px] text-muted-foreground">
                                {order.items[0]?.productName || "Order items"}
                                {order.item_count > 1 ? ` and ${order.item_count - 1} more` : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-border pt-3 sm:border-0 sm:pt-0">
                          <div className="sm:text-right">
                            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Order total</p>
                            <p className="mt-0.5 text-lg font-black text-foreground">{formatAmount(order.total_amount)}</p>
                          </div>
                          <button type="button" onClick={() => setExpandedOrder(expanded ? null : order.id)}
                            aria-expanded={expanded}
                            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-[10px] font-black text-foreground transition hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                            Details <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden">
                            <div className="border-t border-border bg-muted/20 px-4 py-4 sm:px-5">
                              <div className="divide-y divide-border">
                                {order.items.map((item, index) => (
                                  <div key={`${order.id}-detail-${index}`} className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
                                      {item.image
                                        ? <img src={item.image} alt="" className="h-full w-full object-contain p-1.5" />
                                        : <Package size={17} className="text-muted-foreground" />}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <p className="break-words text-xs font-bold text-foreground">{item.productName}</p>
                                      <p className="mt-1 text-[10px] text-muted-foreground">
                                        Qty {item.quantity}{item.variantTitle ? ` · ${item.variantTitle}` : ""}
                                      </p>
                                    </div>
                                    <p className="shrink-0 text-xs font-black text-foreground">{formatAmount(item.lineTotal)}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                                <p className="text-[10px] text-muted-foreground">
                                  Payment: <span className="font-bold uppercase text-foreground">{order.payment_method.replace(/[_-]+/g, " ")}</span>
                                  {" · "}<span className="capitalize">{order.payment_status}</span>
                                </p>
                                <button type="button" onClick={() => setPage("account")}
                                  className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-800 hover:underline dark:text-emerald-300">
                                  Account details <ArrowRight size={12} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
