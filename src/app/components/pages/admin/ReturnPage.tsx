"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  RotateCcw, CheckCircle2, XCircle, IndianRupee, Clock, Eye,
  RefreshCw, Truck, Search, CalendarDays, PackageCheck, ClipboardCheck,
} from "lucide-react";
import { Modal, PageHeader, StatCard, SectionCard, SearchBar } from "./shared/ui";
import { G, fmt } from "./shared/constants";

type ReturnStatus =
  | "requested"
  | "approved"
  | "pickup_scheduled"
  | "product_picked_up"
  | "warehouse_received"
  | "quality_inspection"
  | "refund_initiated"
  | "refund_completed"
  | "rejected"
  | "cancelled";
type ReturnProduct = { product: string; variant: string; quantity: number };
type OrderTimelineEvent = { status: string; changedAt: string; reason?: string | null };
type ReturnTimelineEvent = { status: ReturnStatus; changedAt: string };
type ReturnRequest = {
  id: number;
  orderId: string;
  orderStatus: string;
  customer: string;
  email: string;
  phone: string;
  products: ReturnProduct[];
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  reason: string;
  status: ReturnStatus;
  orderStatusHistory: OrderTimelineEvent[];
  returnStatusHistory: ReturnTimelineEvent[];
  requestedAt: string;
  updatedAt: string;
};

const STATUS_META: Record<ReturnStatus, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  requested: { color: "#f59e0b", bg: "#fffbeb", icon: Clock, label: "Return Request Placed" },
  approved: { color: "#3b82f6", bg: "#eff6ff", icon: CheckCircle2, label: "Return Request Approved" },
  pickup_scheduled: { color: "#6366f1", bg: "#eef2ff", icon: CalendarDays, label: "Pickup Scheduled" },
  product_picked_up: { color: "#8b5cf6", bg: "#f5f3ff", icon: Truck, label: "Product Picked Up" },
  warehouse_received: { color: "#0d9488", bg: "#f0fdfa", icon: PackageCheck, label: "Product Received at Warehouse" },
  quality_inspection: { color: "#d97706", bg: "#fffbeb", icon: ClipboardCheck, label: "Quality Inspection" },
  refund_initiated: { color: "#2563eb", bg: "#eff6ff", icon: IndianRupee, label: "Refund Initiated" },
  refund_completed: { color: "#009966", bg: "#e8fff6", icon: CheckCircle2, label: "Refund Completed" },
  rejected: { color: "#ef4444", bg: "#fef2f2", icon: XCircle, label: "Rejected" },
  cancelled: { color: "#6b7280", bg: "#f3f4f6", icon: XCircle, label: "Cancelled" },
};

const STATUS_OPTIONS: Record<ReturnStatus, ReturnStatus[]> = {
  requested: ["approved", "rejected", "cancelled"],
  approved: ["pickup_scheduled", "cancelled"],
  pickup_scheduled: ["product_picked_up", "cancelled"],
  product_picked_up: ["warehouse_received"],
  warehouse_received: ["quality_inspection"],
  quality_inspection: ["refund_initiated", "rejected"],
  refund_initiated: ["refund_completed"],
  refund_completed: [],
  rejected: [],
  cancelled: [],
};

const STATUS_FILTERS: Array<ReturnStatus | "all"> = [
  "all", "requested", "approved", "pickup_scheduled", "product_picked_up",
  "warehouse_received", "quality_inspection", "refund_initiated", "refund_completed",
  "rejected", "cancelled",
];

const RETURN_STEPS: ReturnStatus[] = [
  "requested",
  "approved",
  "pickup_scheduled",
  "product_picked_up",
  "warehouse_received",
  "quality_inspection",
  "refund_initiated",
  "refund_completed",
];

function isReturnProduct(value: unknown): value is ReturnProduct {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const product = value as Record<string, unknown>;
  return typeof product.product === "string" &&
    typeof product.variant === "string" &&
    typeof product.quantity === "number";
}

function isReturnRequest(value: unknown): value is ReturnRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const request = value as Record<string, unknown>;
  return typeof request.id === "number" &&
    typeof request.orderId === "string" &&
  typeof request.orderStatus === "string" &&
    typeof request.customer === "string" &&
    typeof request.email === "string" &&
    typeof request.phone === "string" &&
    Array.isArray(request.products) && request.products.every(isReturnProduct) &&
    typeof request.amount === "number" &&
    typeof request.paymentMethod === "string" &&
    typeof request.paymentStatus === "string" &&
    typeof request.reason === "string" &&
    typeof request.status === "string" && request.status in STATUS_META &&
    Array.isArray(request.orderStatusHistory) && request.orderStatusHistory.every(event =>
      Boolean(event) &&
      typeof event === "object" &&
      typeof event.status === "string" &&
      typeof event.changedAt === "string" &&
      (event.reason === undefined || typeof event.reason === "string" || event.reason === null)
    ) &&
    Array.isArray(request.returnStatusHistory) && request.returnStatusHistory.every(event =>
      Boolean(event) &&
      typeof event === "object" &&
      typeof event.status === "string" && event.status in STATUS_META &&
      typeof event.changedAt === "string"
    ) &&
    typeof request.requestedAt === "string" &&
    typeof request.updatedAt === "string";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
      timeZone: "Asia/Kolkata",
    })
    : "Date unavailable";
}

function formatStatusLabel(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const labels: Record<string, string> = {
    placed: "Pending",
    pending: "Pending",
    confirmed: "Received",
    processing: "Processed",
    in_transit: "Shipped",
    out_for_delivery: "Out For Delivery",
    completed: "Delivered",
    canceled: "Cancelled",
  };
  return labels[normalized] || normalized.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}

export function ReturnPage() {
  const [items, setItems] = useState<ReturnRequest[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | "all">("all");
  const [detail, setDetail] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  const loadReturns = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/returns", {
        credentials: "same-origin",
        cache: "no-store",
        signal,
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || Array.isArray(result) ||
          !("success" in result) || result.success !== true ||
          !("returns" in result) || !Array.isArray(result.returns) ||
          !result.returns.every(isReturnRequest)) {
        const message = result && typeof result === "object" && "message" in result &&
          typeof result.message === "string" ? result.message : "Could not load return requests.";
        throw new Error(message);
      }
      setItems(result.returns);
    } catch (loadError) {
      if (!signal?.aborted) {
        console.error("Failed to load admin return requests:", loadError);
        setError(loadError instanceof Error ? loadError.message : "Could not load return requests.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadReturns(controller.signal);
    return () => controller.abort();
  }, [loadReturns]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter(item => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesTerm = !term || [
        String(item.id), item.orderId, item.customer, item.email, item.phone, item.reason,
        ...item.products.map(product => product.product),
      ].some(value => value.toLowerCase().includes(term));
      return matchesStatus && matchesTerm;
    });
  }, [items, q, statusFilter]);

  const counts = useMemo(() => ({
    requested: items.filter(item => item.status === "requested").length,
    approved: items.filter(item => item.status === "approved").length,
    resolved: items.filter(item => ["refund_completed", "rejected", "cancelled"].includes(item.status)).length,
    refunded: items.filter(item => item.status === "refund_completed").reduce((total, item) => total + item.amount, 0),
  }), [items]);

  const reasonBreakdown = useMemo(() => {
    const frequencies = new Map<string, number>();
    for (const item of items) {
      const reason = item.reason.trim() || "No reason provided";
      frequencies.set(reason, (frequencies.get(reason) ?? 0) + 1);
    }
    return Array.from(frequencies.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [items]);

  async function updateStatus(item: ReturnRequest, status: ReturnStatus) {
    setUpdatingId(item.id);
    setActionError("");
    try {
      const response = await fetch("/api/admin/returns", {
        method: "PATCH",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || Array.isArray(result) ||
          !("success" in result) || result.success !== true ||
          !("returnRequest" in result) || !result.returnRequest ||
          typeof result.returnRequest !== "object" || Array.isArray(result.returnRequest)) {
        const message = result && typeof result === "object" && "message" in result &&
          typeof result.message === "string" ? result.message : "Could not update this return request.";
        throw new Error(message);
      }

      const updated = result.returnRequest as Record<string, unknown>;
      if (updated.id !== item.id || updated.status !== status ||
          typeof updated.updatedAt !== "string" || typeof updated.changedAt !== "string") {
        throw new Error("The return update response was invalid.");
      }
      const next = {
        ...item,
        status,
        updatedAt: updated.updatedAt,
        returnStatusHistory: [
          ...item.returnStatusHistory,
          { status, changedAt: updated.changedAt },
        ],
      };
      setItems(previous => previous.map(current => current.id === item.id ? next : current));
      setDetail(current => current?.id === item.id ? next : current);
    } catch (updateError) {
      console.error("Failed to update admin return request:", updateError);
      setActionError(updateError instanceof Error ? updateError.message : "Could not update this return request.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Orders / Returns" title="Return Requests"
        subtitle="Review customer return requests, approve or reject them, and track refunds"
        count={items.length}>
        <button type="button" onClick={() => void loadReturns()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </PageHeader>

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => void loadReturns()} className="font-bold underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Returns" val={items.length} color={G} icon={RotateCcw} />
        <StatCard label="Awaiting Review" val={counts.requested} color="#f59e0b" icon={Clock} />
        <StatCard label="Refunded Total" val={fmt(counts.refunded)} color="#009966" icon={IndianRupee} />
        <StatCard label="Resolved" val={counts.resolved} color="#8b5cf6" icon={CheckCircle2} />
      </div>

      <SectionCard>
        <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-gray-400">Most common customer reasons</p>
        {reasonBreakdown.length ? (
          <div className="space-y-2">
            {reasonBreakdown.map(([reason, count]) => (
              <div key={reason} className="flex min-w-0 items-center gap-3">
                <p className="w-48 shrink-0 truncate text-xs text-gray-600">{reason}</p>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <motion.div className="h-full rounded-full" style={{ background: G }}
                    initial={{ width: 0 }}
                    animate={{ width: `${items.length ? Math.round(count / items.length * 100) : 0}%` }}
                    transition={{ duration: 0.5 }} />
                </div>
                <span className="w-6 text-right text-[10px] font-black text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-400">No return reasons yet.</p>}
      </SectionCard>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar value={q} onChange={setQ} placeholder="Search request, order, customer or product…" />
        <span className="text-xs text-gray-400">{filtered.length} request{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(status => {
          const count = status === "all" ? items.length : items.filter(item => item.status === status).length;
          const meta = status === "all" ? null : STATUS_META[status];
          return (
            <button type="button" key={status} onClick={() => setStatusFilter(status)}
              className="rounded-xl px-3 py-2 text-xs font-bold transition"
              style={statusFilter === status
                ? { background: meta?.color ?? G, color: "#fff" }
                : { background: meta?.bg ?? "#f3f4f6", color: meta?.color ?? "#6b7280" }}>
              {status === "all" ? "All" : meta?.label} ({count})
            </button>
          );
        })}
      </div>

      {loading && items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400">Loading return requests…</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map(item => {
            const meta = STATUS_META[item.status];
            const StatusIcon = meta.icon;
            const actions = STATUS_OPTIONS[item.status];
            return (
              <motion.article key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-gray-900">{item.customer}</p>
                    <p className="mt-1 break-all text-[10px] text-gray-400">
                      Return #{item.id} · Order {item.orderId}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold"
                    style={{ color: meta.color, background: meta.bg }}>
                    <StatusIcon size={11} /> {meta.label}
                  </span>
                </div>
                <div className="mb-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-bold text-gray-800">
                    {item.products.map(product => product.product).join(", ") || "Order items"}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {item.products.map(product => `Qty ${product.quantity}`).join(" · ") || "Quantity unavailable"}
                    {" · "}{fmt(item.amount)}
                  </p>
                </div>
                <p className="mb-3 line-clamp-3 text-xs text-gray-600">
                  <span className="font-bold text-gray-800">Reason: </span>{item.reason || "No reason provided"}
                </p>
                <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400">
                  <span>Requested: {formatDate(item.requestedAt)}</span>
                  {item.updatedAt !== item.requestedAt && <span>Updated: {formatDate(item.updatedAt)}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                  {actions.map(status => {
                    const actionMeta = STATUS_META[status];
                    const ActionIcon = actionMeta.icon;
                    const label = status === "approved"
                      ? "Approve"
                      : status === "rejected"
                        ? "Reject"
                        : status === "cancelled"
                          ? "Cancel return"
                          : `Mark ${actionMeta.label}`;
                    return (
                      <button key={status} type="button" disabled={updatingId === item.id}
                        onClick={() => void updateStatus(item, status)}
                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-black text-white disabled:opacity-50"
                        style={{ background: status === "rejected" || status === "cancelled" ? "#ef4444" : G }}>
                        <ActionIcon size={12} /> {label}
                      </button>
                    );
                  })}
                  <button type="button" onClick={() => { setDetail(item); setActionError(""); }}
                    className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600"
                    aria-label={`View return request ${item.id}`}>
                    <Eye size={13} />
                  </button>
                </div>
              </motion.article>
            );
          })}
          {!filtered.length && (
            <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 py-16 text-gray-400">
              <Search size={25} />
              <p className="text-sm font-bold">{items.length ? "No return requests match your filters" : "No return requests yet"}</p>
            </div>
          )}
        </div>
      )}

      <Modal open={detail !== null} onClose={() => { setDetail(null); setActionError(""); }}
        title={`Return Request · ${detail ? `#${detail.id}` : ""}`} wide>
        {detail && (
          <div className="space-y-4">
            {actionError && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{actionError}</p>}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold"
                style={{ color: STATUS_META[detail.status].color, background: STATUS_META[detail.status].bg }}>
                {STATUS_META[detail.status].label}
              </span>
              <span className="text-xs font-bold text-gray-600">Order {detail.orderId}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-3 text-xs">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">Customer</p>
                <p className="font-bold text-gray-800">{detail.customer}</p>
                {detail.email && <p className="mt-1 break-all text-gray-500">{detail.email}</p>}
                {detail.phone && <p className="mt-1 text-gray-500">{detail.phone}</p>}
              </div>
              <div className="rounded-xl border border-gray-200 p-3 text-xs">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">Order payment</p>
                <p className="font-black" style={{ color: G }}>{fmt(detail.amount)}</p>
                <p className="mt-1 capitalize text-gray-500">
                  {detail.paymentMethod.replace(/[_-]+/g, " ")} · {detail.paymentStatus.replace(/[_-]+/g, " ")}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-gray-400">Returned items</p>
              <div className="space-y-2">
                {detail.products.map((product, index) => (
                  <div key={`${product.product}-${index}`} className="flex items-start justify-between gap-3 text-xs">
                    <span className="font-semibold text-gray-800">
                      {product.product}{product.variant ? ` · ${product.variant}` : ""}
                    </span>
                    <span className="shrink-0 text-gray-500">Qty {product.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">Customer reason</p>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{detail.reason || "No reason provided"}</p>
            </div>
            <section aria-label={`Order timeline for ${detail.orderId}`} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-500">Order Timeline</h3>
                <span className="text-[10px] text-gray-400">Placed {formatDate(detail.orderStatusHistory[0]?.changedAt || detail.requestedAt)}</span>
              </div>
              <div className="mt-4 space-y-0">
                {detail.orderStatusHistory.map((event, index) => {
                  const isCurrent = index === detail.orderStatusHistory.length - 1;
                  return (
                    <div key={`${event.status}-${event.changedAt}-${index}`} className="relative flex min-h-11 items-start gap-3">
                      {index < detail.orderStatusHistory.length - 1 && (
                        <span aria-hidden="true" className="absolute left-[9px] top-5 h-[calc(100%-5px)] w-0.5 bg-gray-200" />
                      )}
                      <span className={`relative z-10 mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 bg-white ${isCurrent ? "border-emerald-600" : "border-gray-300"}`} />
                      <div className="pb-3">
                        <p className="text-xs font-bold text-gray-800">
                          {formatStatusLabel(event.status)}
                          {isCurrent && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700">Current status</span>}
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-400">{formatDate(event.changedAt)}</p>
                        {event.reason && <p className="mt-0.5 text-[10px] text-gray-500">Reason: {event.reason}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <section aria-label={`Return tracking for ${detail.orderId}`} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-600">Return Tracking Timeline</h3>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-black"
                  style={{ color: STATUS_META[detail.status].color, background: STATUS_META[detail.status].bg }}>
                  {STATUS_META[detail.status].label}
                </span>
              </div>
              <div className="mt-4 space-y-0">
                {RETURN_STEPS.map((status, index) => {
                  const meta = STATUS_META[status];
                  const EventIcon = meta.icon;
                  const event = detail.returnStatusHistory.find(item => item.status === status);
                  const isCurrent = detail.status === status;
                  return (
                    <div key={status} className="relative flex min-h-11 items-start gap-3">
                      {index < RETURN_STEPS.length - 1 && (
                        <span aria-hidden="true" className={`absolute left-[9px] top-5 h-[calc(100%-5px)] w-0.5 ${event ? "bg-amber-300" : "bg-gray-200"}`} />
                      )}
                      <span className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white"
                        style={{ borderColor: event ? meta.color : "#d1d5db", color: event ? meta.color : "#9ca3af" }}>
                        <EventIcon size={10} />
                      </span>
                      <div className="pb-3">
                        <p className={`text-xs font-bold ${event ? "text-gray-800" : "text-gray-400"}`}>
                          {meta.label}
                          {isCurrent && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-amber-900">Current status</span>}
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-400">{event ? formatDate(event.changedAt) : "Pending"}</p>
                      </div>
                    </div>
                  );
                })}
                {["rejected", "cancelled"].includes(detail.status) && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-red-400 bg-white text-red-500">
                      <XCircle size={10} />
                    </span>
                    <div className="pb-3">
                      <p className="text-xs font-bold text-red-600">
                        {STATUS_META[detail.status].label}
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-black text-red-700">Current status</span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-400">
                        {formatDate(detail.returnStatusHistory.find(event => event.status === detail.status)?.changedAt || detail.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
            <div className="grid grid-cols-1 gap-2 text-[11px] text-gray-500 sm:grid-cols-2">
              <p>Requested: {formatDate(detail.requestedAt)}</p>
              <p>Last updated: {formatDate(detail.updatedAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
              {STATUS_OPTIONS[detail.status].map(status => (
                <button key={status} type="button" disabled={updatingId === detail.id}
                  onClick={() => void updateStatus(detail, status)}
                  className="rounded-xl px-4 py-2.5 text-xs font-black text-white transition disabled:cursor-wait disabled:opacity-50"
                  style={{ background: status === "rejected" || status === "cancelled" ? "#ef4444" : G }}>
                  {updatingId === detail.id ? "Updating…" : `Mark ${STATUS_META[status].label.toLowerCase()}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ReturnPage;
