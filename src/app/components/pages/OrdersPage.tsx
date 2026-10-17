import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package, Truck, CheckCircle, XCircle, Clock, ChevronRight,
  ChevronDown, RotateCcw, Star, MapPin, Search, Filter,
  ArrowRight, Download, RotateCw, X, Upload, AlertCircle,
} from "lucide-react";
import { G } from "../data/index";
import type { Page } from "../types/index";
import { fmt } from "../utils/format";

type ReturnItem = { name: string; brand: string; qty: number; price: number; img: string };

function ReturnModal({
  item,
  orderId,
  onClose,
}: {
  item: ReturnItem;
  orderId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!reason) return;
    setSubmitted(true);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <RotateCw size={16} className="text-red-500" />
            <h2 className="font-black text-foreground">Return / Refund</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Order item */}
                <div className="flex items-center gap-3 bg-muted/50 rounded-2xl p-3">
                  <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground line-clamp-2">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.brand} · Qty: {item.qty}</p>
                    <p className="text-sm font-black text-foreground">{fmt(item.price)}</p>
                  </div>
                </div>

                {/* Order ID */}
                <p className="text-[10px] text-muted-foreground font-semibold">Order #{orderId}</p>

                {/* Reason select */}
                <div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest block mb-2">
                    Reason for Return *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-red-400 transition-colors"
                  >
                    <option value="">Select a reason...</option>
                    <option value="damaged">Product is Damaged</option>
                    <option value="wrong">Wrong Item Delivered</option>
                    <option value="quality">Quality Issue</option>
                    <option value="changed">Changed My Mind</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest block mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    rows={3}
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-red-400 transition-colors resize-none"
                  />
                </div>

                {/* Photo upload UI */}
                <div>
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest block mb-2">
                    Attach Photos (Optional)
                  </label>
                  <div className="border-2 border-dashed border-border rounded-2xl p-5 flex flex-col items-center gap-2 bg-muted/30 cursor-pointer hover:border-red-300 transition-colors">
                    <Upload size={20} className="text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground text-center">
                      Tap to upload photos of the issue
                    </p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB each · Max 3 photos</p>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSubmit}
                  disabled={!reason}
                  className="w-full py-3.5 rounded-2xl text-white text-sm font-black transition-opacity"
                  style={{
                    background: !reason ? "var(--muted)" : "linear-gradient(to right, #dc2626, #ef4444)",
                    color: !reason ? "var(--muted-foreground)" : "#fff",
                    cursor: !reason ? "not-allowed" : "pointer",
                  }}
                >
                  Submit Return Request
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8 gap-4 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 16, stiffness: 260 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "#e6fff5" }}
                >
                  <CheckCircle size={32} style={{ color: G }} />
                </motion.div>
                <div>
                  <p className="text-lg font-black text-foreground">Return Request Submitted!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll contact you within 24 hours.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-2xl p-4 w-full text-left">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={14} style={{ color: G }} className="shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Pickup will be arranged within 2–3 business days. Refund will be processed after quality check (3–5 business days).
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl text-white text-sm font-black"
                  style={{ background: G }}
                >
                  Done
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

const ORDERS = [
  {
    id: "BB2025071001", date: "10 Jul 2025", status: "Delivered",
    eta: "Delivered on 13 Jul 2025", items: [
      { name: "Banarasi Silk Saree — Crimson Gold", brand: "Varanasi Weavers", qty: 1, price: 2499, img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=120&h=120&fit=crop&auto=format" },
      { name: "Premium Spice Box — 7 Spices", brand: "MDH Masala", qty: 2, price: 349, img: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=120&h=120&fit=crop&auto=format" },
    ],
    total: 3197, payMode: "UPI — GPay", address: "12, MG Road, Bengaluru — 560001",
  },
  {
    id: "BB2025070501", date: "5 Jul 2025", status: "Out for Delivery",
    eta: "Expected today by 8 PM", items: [
      { name: "Samsung Galaxy S24 Ultra", brand: "Samsung", qty: 1, price: 89999, img: "https://images.unsplash.com/photo-1771860886801-52d8400be525?w=120&h=120&fit=crop&auto=format" },
    ],
    total: 89999, payMode: "No Cost EMI — HDFC", address: "45, Linking Road, Mumbai — 400050",
  },
  {
    id: "BB2025062801", date: "28 Jun 2025", status: "Processing",
    eta: "Will ship by 12 Jul 2025", items: [
      { name: "SG English Willow Cricket Bat", brand: "SG Sports", qty: 1, price: 3499, img: "https://images.unsplash.com/photo-1542185091-dee192e9df7a?w=120&h=120&fit=crop&auto=format" },
    ],
    total: 3499, payMode: "Paytm Wallet", address: "7, Nehru Place, Delhi — 110019",
  },
  {
    id: "BB2025061501", date: "15 Jun 2025", status: "Cancelled",
    eta: "Refund processed on 18 Jun 2025", items: [
      { name: "MacBook Air M3 — Midnight", brand: "Apple", qty: 1, price: 114900, img: "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?w=120&h=120&fit=crop&auto=format" },
    ],
    total: 114900, payMode: "Credit Card — ICICI", address: "34, Park Street, Kolkata — 700016",
  },
  {
    id: "BB2025060101", date: "1 Jun 2025", status: "Delivered",
    eta: "Delivered on 4 Jun 2025", items: [
      { name: "Patanjali Ayurvedic Kit", brand: "Patanjali", qty: 3, price: 999, img: "https://images.unsplash.com/photo-1564594326930-17381130fd2e?w=120&h=120&fit=crop&auto=format" },
      { name: "22KT Gold Temple Necklace", brand: "Malabar Gold", qty: 1, price: 48500, img: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=120&h=120&fit=crop&auto=format" },
    ],
    total: 51497, payMode: "COD", address: "89, Anna Salai, Chennai — 600002",
  },
];

const STATUS_META: Record<string, { color: string; bg: string; icon: React.ReactNode; steps: string[] }> = {
  "Processing":       { color:"#f59e0b", bg:"#fffbeb", icon:<Clock size={13}/>,     steps:["Order Placed","Processing","Shipped","Delivered"] },
  "Out for Delivery": { color:"#3b82f6", bg:"#eff6ff", icon:<Truck size={13}/>,     steps:["Order Placed","Processing","Shipped","Out for Delivery"] },
  "Delivered":        { color:"#009966", bg:"#f0fdf4", icon:<CheckCircle size={13}/>,steps:["Order Placed","Processing","Shipped","Delivered"] },
  "Cancelled":        { color:"#ef4444", bg:"#fef2f2", icon:<XCircle size={13}/>,   steps:["Order Placed","Cancelled"] },
};

const TABS = ["All", "Active", "Delivered", "Cancelled"];

function OrderCard({ order }: { order: typeof ORDERS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [returnItem, setReturnItem] = useState<ReturnItem | null>(null);
  const meta = STATUS_META[order.status];
  const stepIdx = meta.steps.indexOf(order.status);

  return (
    <motion.div layout className="bg-card border border-border rounded-2xl overflow-hidden"
      whileHover={{ boxShadow: `0 8px 30px -4px ${G}12` }} transition={{ duration:0.2 }}>

      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-black text-foreground">#{order.id}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full"
              style={{ background: meta.bg, color: meta.color }}>
              {meta.icon} {order.status}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{order.date} · {order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: meta.color }}>{order.eta}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-black text-foreground">{fmt(order.total)}</p>
          <p className="text-[10px] text-muted-foreground">{order.payMode}</p>
        </div>
      </div>

      {/* Item thumbnails */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <div className="flex -space-x-2">
          {order.items.slice(0,3).map((item, i) => (
            <div key={i} className="w-10 h-10 rounded-xl border-2 border-card overflow-hidden bg-muted">
              <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="w-10 h-10 rounded-xl border-2 border-card bg-muted flex items-center justify-center text-xs font-black text-muted-foreground">
              +{order.items.length - 3}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{order.items[0].name}</p>
          {order.items.length > 1 && <p className="text-[10px] text-muted-foreground">& {order.items.length - 1} more item{order.items.length > 2 ? "s" : ""}</p>}
        </div>
      </div>

      {/* Progress tracker */}
      {order.status !== "Cancelled" && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-0">
            {meta.steps.map((s, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all"
                    style={{
                      background: i <= stepIdx ? G : "var(--muted)",
                      borderColor: i <= stepIdx ? G : "var(--border)",
                    }}>
                    {i < stepIdx && <CheckCircle size={10} className="text-white"/>}
                    {i === stepIdx && <div className="w-2 h-2 bg-white rounded-full"/>}
                  </div>
                  <p className="text-[8px] text-center leading-tight font-medium"
                    style={{ color: i <= stepIdx ? G : "var(--muted-foreground)", whiteSpace:"nowrap" }}>
                    {s}
                  </p>
                </div>
                {i < meta.steps.length - 1 && (
                  <div className="flex-1 h-0.5 mb-3 transition-all"
                    style={{ background: i < stepIdx ? G : "var(--border)" }}/>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expand toggle */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30 hover:bg-muted/60 transition-colors text-xs font-bold text-muted-foreground">
        <span>Order Details</span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14}/>
        </motion.div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
            transition={{ duration:0.25 }} className="overflow-hidden">
            <div className="p-4 space-y-3 border-t border-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.img} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-muted shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground line-clamp-2">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.brand} · Qty: {item.qty}</p>
                    <p className="text-sm font-black text-foreground mt-0.5">{fmt(item.price)}</p>
                  </div>
                  {order.status === "Delivered" && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <button className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border border-border hover:border-amber-400 text-amber-500 transition-colors">
                        <Star size={10}/> Rate
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={(e) => { e.stopPropagation(); setReturnItem(item); }}
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <RotateCw size={10}/> Return
                      </motion.button>
                    </div>
                  )}
                </div>
              ))}

              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Payment</span><span className="font-bold text-foreground">{order.payMode}</span></div>
                <div className="flex items-start justify-between text-xs gap-2">
                  <span className="text-muted-foreground shrink-0">Delivery</span>
                  <span className="font-semibold text-foreground text-right">{order.address}</span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-border mt-1">
                  <span className="font-black text-foreground">Order Total</span>
                  <span className="font-black text-foreground">{fmt(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 px-4 pb-4 flex-wrap">
              {order.status === "Delivered" && (
                <motion.button whileTap={{ scale:0.95 }}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white"
                  style={{ background:G }}>
                  <RotateCcw size={12}/> Reorder
                </motion.button>
              )}
              {order.status === "Delivered" && (
                <motion.button whileTap={{ scale:0.95 }}
                  onClick={() => setReturnItem(order.items[0])}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 transition-colors">
                  <RotateCw size={12}/> Return / Refund
                </motion.button>
              )}
              {order.status === "Out for Delivery" && (
                <motion.button whileTap={{ scale:0.95 }}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white"
                  style={{ background:"#3b82f6" }}>
                  <MapPin size={12}/> Track Order
                </motion.button>
              )}
              {order.status === "Cancelled" && (
                <motion.button whileTap={{ scale:0.95 }}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white"
                  style={{ background:G }}>
                  <ArrowRight size={12}/> Buy Again
                </motion.button>
              )}
              <motion.button whileTap={{ scale:0.95 }}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border border-border text-muted-foreground hover:border-[#009966] hover:text-foreground transition-colors">
                <Download size={12}/> Invoice
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return modal */}
      <AnimatePresence>
        {returnItem && (
          <ReturnModal
            item={returnItem}
            orderId={order.id}
            onClose={() => setReturnItem(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function OrdersPage({ setPage }: { setPage: (p: Page) => void }) {
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ORDERS.filter(o => {
    if (tab === "Active" && !["Processing","Out for Delivery"].includes(o.status)) return false;
    if (tab === "Delivered" && o.status !== "Delivered") return false;
    if (tab === "Cancelled" && o.status !== "Cancelled") return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) &&
        !o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{ORDERS.length} orders placed</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted px-3 py-2 rounded-xl">
          <Package size={13} style={{ color:G }}/> Track all deliveries
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by order ID or product name..."
          className="w-full bg-muted border border-border rounded-2xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#009966] transition-colors"/>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map(t => {
          const count = t === "All" ? ORDERS.length
            : t === "Active" ? ORDERS.filter(o => ["Processing","Out for Delivery"].includes(o.status)).length
            : ORDERS.filter(o => o.status === t).length;
          return (
            <motion.button key={t} whileTap={{ scale:0.95 }}
              onClick={() => setTab(t)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border"
              style={tab === t
                ? { background:G, color:"#fff", borderColor:G }
                : { background:"var(--card)", color:"var(--muted-foreground)", borderColor:"var(--border)" }}>
              {t}
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black"
                style={tab === t ? { background:"rgba(255,255,255,0.25)", color:"#fff" } : { background:"var(--muted)", color:"var(--muted-foreground)" }}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Package size={52} strokeWidth={1} className="text-muted-foreground"/>
          <p className="font-black text-foreground">No orders found</p>
          <p className="text-sm text-muted-foreground">Try a different filter or search term</p>
          <motion.button whileTap={{ scale:0.95 }} onClick={() => setPage("products")}
            className="text-white px-6 py-2.5 rounded-xl text-sm font-black mt-2" style={{ background:G }}>
            Start Shopping
          </motion.button>
        </div>
      ) : (
        <motion.div layout className="space-y-4">
          <AnimatePresence>
            {filtered.map(order => (
              <motion.div key={order.id} layout initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}>
                <OrderCard order={order} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
