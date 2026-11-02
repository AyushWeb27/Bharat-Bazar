"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight, BadgeCheck, Check, ChevronRight, CircleCheck, Clock3,
  Copy, MapPin, Package, RotateCcw, ShieldCheck, ShoppingBag, Truck,
} from "lucide-react";
import type { Page } from "../types/index";
import { fmt } from "../utils/format";

type OrderItem = {
  product_name: string;
  variant_title: string;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
  product_snapshot: unknown;
};

type Order = {
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number | string;
  tax_amount: number | string;
  shipping_amount: number | string;
  total_amount: number | string;
  shipping_address: unknown;
  created_at: string;
};

type OrderResponse = { order: Order; items: OrderItem[] };
type LooseRecord = Record<string, unknown>;

function isRecord(value: unknown): value is LooseRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isOrderResponse(value: unknown): value is OrderResponse {
  if (!isRecord(value) || !isRecord(value.order) || !Array.isArray(value.items)) return false;
  const order = value.order;
  return typeof order.order_number === "string" &&
    typeof order.status === "string" &&
    typeof order.payment_method === "string" &&
    typeof order.payment_status === "string" &&
    order.total_amount !== undefined &&
    value.items.every(item => isRecord(item) && typeof item.product_name === "string" &&
      typeof item.quantity === "number");
}

function readJsonRecord(value: unknown): LooseRecord {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return isRecord(value) ? value : {};
}

function money(value: number | string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? fmt(parsed) : fmt(0);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Order received";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function OrderConfirmationPage({ setPage }: { setPage: (page: Page) => void }) {
  const [data, setData] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const orderNumber = new URLSearchParams(window.location.search).get("order") || "";
    if (!orderNumber) {
      setError("Order reference is missing. Check My Orders to view your purchases.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async response => {
        const result: unknown = await response.json();
        if (!response.ok || !isRecord(result) || result.success !== true || !isOrderResponse(result)) {
          const message = isRecord(result) && typeof result.message === "string"
            ? result.message
            : "Could not load your order.";
          throw new Error(message);
        }
        if (active) setData(result);
      })
      .catch(loadError => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load your order.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [retry]);

  async function copyOrderNumber() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.order.order_number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (copyError) {
      console.error("Could not copy order number:", copyError);
      setError("Could not copy the order number. You can select and copy it manually.");
    }
  }

  if (loading) {
    return (
      <div aria-label="Loading order confirmation" className="mx-auto max-w-4xl animate-pulse space-y-5">
        <div className="h-64 rounded-[2rem] bg-muted" />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="h-52 rounded-3xl bg-muted" />
          <div className="h-52 rounded-3xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <section role="alert" className="mx-auto max-w-xl rounded-[2rem] border border-border bg-card px-6 py-12 text-center sm:px-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <Package size={25} />
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-tight text-foreground">Order details aren’t available</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{error}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => setRetry(value => value + 1)}
            className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-foreground hover:bg-muted">
            Try again
          </button>
          <button type="button" onClick={() => window.location.assign("/account?section=orders")}
            className="rounded-xl bg-[#087a51] px-5 py-3 text-sm font-black text-white">
            View My Orders
          </button>
        </div>
      </section>
    );
  }

  const order = data.order;
  const address = readJsonRecord(order.shipping_address);
  const isCod = order.payment_method.toLowerCase() === "cod";
  const statusLabel = order.status.replace(/[_-]+/g, " ");
  const itemCount = data.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="mx-auto max-w-5xl pb-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-[#073d2d] text-white shadow-[0_24px_70px_-38px_rgba(4,70,48,0.8)]"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[42px] border-white/[0.045]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 left-1/3 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.7fr)] lg:items-center lg:p-10">
          <div>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.12 }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-emerald-300 text-[#073d2d] shadow-[0_12px_35px_-12px_rgba(110,231,183,0.7)]"
            >
              <Check size={34} strokeWidth={3} />
            </motion.div>
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200">
              <BadgeCheck size={14} /> Order safely placed
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              It’s official.<br className="hidden sm:block" /> Your order is on its way.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-emerald-50/75">
              Thanks for shopping with Bharat-Bazar. We’ve saved your order and delivery details.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100/20 bg-white/[0.08] px-3 py-1.5 font-bold text-white">
                <CircleCheck size={13} className="text-emerald-300" /> {statusLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100/20 bg-white/[0.08] px-3 py-1.5 font-semibold text-emerald-50/80">
                <Clock3 size={13} /> {formatDate(order.created_at)}
              </span>
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/15 bg-white/[0.075] p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-100/65">Your order reference</p>
                <p className="mt-2 break-all text-xl font-black tracking-wide text-white sm:text-2xl">{order.order_number}</p>
              </div>
              <button type="button" onClick={() => void copyOrderNumber()} aria-label="Copy order number"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] text-white transition hover:bg-white/[0.16]">
                {copied ? <Check size={17} /> : <Copy size={16} />}
              </button>
            </div>
            <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/15 pt-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-100/65">
                  {isCod ? "Pay when delivered" : "Order total"}
                </p>
                <p className="mt-1 text-3xl font-black tracking-tight text-white">{money(order.total_amount)}</p>
              </div>
              <span className="rounded-full bg-emerald-300/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-100">
                {isCod ? "Cash on delivery" : order.payment_method}
              </span>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[11px] leading-relaxed text-emerald-50/65">
              <ShieldCheck size={14} className="shrink-0 text-emerald-200" />
              Keep this reference handy to check your order later.
            </p>
          </div>
        </div>
      </motion.section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">In the bag</p>
                <h2 className="mt-1 text-lg font-black text-foreground">Order items</h2>
              </div>
              <span className="rounded-full bg-muted px-3 py-1.5 text-[10px] font-black text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="mt-5 divide-y divide-border">
              {data.items.map((item, index) => {
                const snapshot = readJsonRecord(item.product_snapshot);
                const image = typeof snapshot.image === "string" ? snapshot.image : "";
                const brand = typeof snapshot.brand === "string" ? snapshot.brand : "";
                return (
                  <div key={`${item.product_name}-${index}`} className="flex min-w-0 items-center gap-3 py-4 sm:gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/50 sm:h-[76px] sm:w-[76px]">
                      {image
                        ? <img src={image} alt="" className="h-full w-full object-contain p-2" />
                        : <Package size={21} className="text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      {brand && <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">{brand}</p>}
                      <p className="mt-0.5 break-words text-sm font-bold leading-snug text-foreground">{item.product_name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Qty {item.quantity}{item.variant_title ? ` · ${item.variant_title}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-foreground">{money(item.line_total)}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                <Truck size={19} />
              </span>
              <div>
                <h2 className="text-sm font-black text-foreground">Delivery destination</h2>
                <p className="text-[10px] text-muted-foreground">We’ll bring it right to your door</p>
              </div>
              <MapPin size={16} className="ml-auto text-muted-foreground" />
            </div>
            <div className="p-5 sm:px-6 sm:py-5">
              <p className="text-sm font-black text-foreground">{String(address.recipient || "Delivery recipient")}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {[address.line1, address.line2, address.city, address.state, address.postalCode, address.country]
                  .filter(value => typeof value === "string" && value.trim())
                  .join(", ")}
              </p>
              {typeof address.phone === "string" && (
                <p className="mt-2 text-xs font-semibold text-muted-foreground">📞 {address.phone}</p>
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit overflow-hidden rounded-3xl border border-border bg-card lg:sticky lg:top-24">
          <div className="border-b border-border bg-muted/35 px-5 py-4 sm:px-6">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">The numbers</p>
            <h2 className="mt-1 text-lg font-black text-foreground">Payment summary</h2>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            <div className="flex justify-between gap-3 text-sm text-muted-foreground">
              <span>Subtotal</span><span className="font-semibold text-foreground">{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-3 text-sm text-muted-foreground">
              <span>Tax</span><span className="font-semibold text-foreground">{money(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between gap-3 text-sm text-muted-foreground">
              <span>Delivery</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                {Number(order.shipping_amount) === 0 ? "FREE" : money(order.shipping_amount)}
              </span>
            </div>
            <div className="border-t border-dashed border-border pt-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-foreground">Total</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {isCod ? "Due on delivery" : `Payment ${order.payment_status}`}
                  </p>
                </div>
                <p className="text-2xl font-black tracking-tight text-foreground">{money(order.total_amount)}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50/80 p-3.5 dark:bg-emerald-950/25">
              <p className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <CircleCheck size={15} /> Order saved successfully
              </p>
              <p className="mt-1 pl-[23px] text-[10px] leading-relaxed text-emerald-800/75 dark:text-emerald-200/65">
                You can view this order anytime from your account.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <footer className="mt-5 flex flex-col justify-between gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
            <ShoppingBag size={18} />
          </span>
          <div>
            <p className="text-sm font-black text-foreground">What would you like to do next?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Your order details are saved to your account.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:shrink-0">
          <button type="button" onClick={() => window.location.assign("/account?section=orders")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087a51] px-4 py-3 text-xs font-black text-white transition hover:bg-[#066641]">
            View My Orders <ArrowRight size={14} />
          </button>
          <button type="button" onClick={() => setPage("home")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-xs font-black text-foreground transition hover:bg-muted">
            <RotateCcw size={14} /> Continue shopping <ChevronRight size={13} />
          </button>
        </div>
      </footer>
    </main>
  );
}
