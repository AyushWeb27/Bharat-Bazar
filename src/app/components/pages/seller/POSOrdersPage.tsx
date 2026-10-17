import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Monitor, Plus, Printer, Search, X, ShoppingBag,
  CreditCard, Banknote, Smartphone, IndianRupee, Trash2,
  TrendingUp, Users,
} from "lucide-react";
import { fmt, card, inp } from "./shared/constants";

// ─── Constants ────────────────────────────────────────────────────────────────

const G = "#009966";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = "Cash" | "UPI" | "Card";

type POSOrder = {
  id: string;
  customer: string;
  items: number;
  amount: number;
  payment: PaymentMethod;
  time: string;
  date: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

// ─── POS Orders data ──────────────────────────────────────────────────────────

const POS_ORDERS: POSOrder[] = [
  { id:"POS-418",customer:"Walk-in",   items:3,amount:4200, payment:"Cash", time:"10:24 AM",date:"Sep 4" },
  { id:"POS-417",customer:"Rahul G.",  items:1,amount:18999,payment:"UPI",  time:"10:11 AM",date:"Sep 4" },
  { id:"POS-416",customer:"Walk-in",   items:5,amount:1840, payment:"Cash", time:"9:54 AM", date:"Sep 4" },
  { id:"POS-415",customer:"Anita K.",  items:2,amount:6499, payment:"Card", time:"9:38 AM", date:"Sep 4" },
  { id:"POS-414",customer:"Walk-in",   items:1,amount:2499, payment:"UPI",  time:"9:12 AM", date:"Sep 4" },
  { id:"POS-413",customer:"Vikram P.", items:1,amount:42999,payment:"Card", time:"8:55 AM", date:"Sep 4" },
  { id:"POS-412",customer:"Walk-in",   items:4,amount:3200, payment:"Cash", time:"8:30 AM", date:"Sep 4" },
  { id:"POS-411",customer:"Neha J.",   items:2,amount:7998, payment:"UPI",  time:"6:22 PM", date:"Sep 3" },
  { id:"POS-410",customer:"Walk-in",   items:1,amount:899,  payment:"Cash", time:"5:48 PM", date:"Sep 3" },
  { id:"POS-409",customer:"Arjun M.",  items:3,amount:9497, payment:"Card", time:"5:14 PM", date:"Sep 3" },
  { id:"POS-408",customer:"Walk-in",   items:2,amount:1798, payment:"Cash", time:"4:39 PM", date:"Sep 3" },
  { id:"POS-407",customer:"Deepa N.",  items:1,amount:22999,payment:"UPI",  time:"4:02 PM", date:"Sep 3" },
  { id:"POS-406",customer:"Walk-in",   items:6,amount:5640, payment:"Cash", time:"3:28 PM", date:"Sep 3" },
  { id:"POS-405",customer:"Suresh R.", items:1,amount:54999,payment:"Card", time:"2:50 PM", date:"Sep 3" },
  { id:"POS-404",customer:"Walk-in",   items:2,amount:4998, payment:"UPI",  time:"2:15 PM", date:"Sep 3" },
];

// ─── Payment style ────────────────────────────────────────────────────────────

const PAYMENT_STYLE: Record<PaymentMethod, { color: string; bg: string; icon: any }> = {
  Cash: { color: G,         bg: "rgba(0,153,102,0.10)",  icon: Banknote    },
  UPI:  { color: "#3b82f6", bg: "rgba(59,130,246,0.10)", icon: Smartphone  },
  Card: { color: "#8b5cf6", bg: "rgba(139,92,246,0.10)", icon: CreditCard  },
};

// ─── Sample products for search ───────────────────────────────────────────────

const PRODUCTS = [
  { id:"p1", name:"Samsung A55",     price:18999 },
  { id:"p2", name:"Boat Airdopes",   price:2499  },
  { id:"p3", name:"OnePlus Nord",    price:27999 },
  { id:"p4", name:"JBL Speaker",     price:4999  },
  { id:"p5", name:"Apple Watch",     price:42999 },
  { id:"p6", name:"Mi Band 8",       price:3499  },
  { id:"p7", name:"Sony WH1000",     price:22999 },
  { id:"p8", name:"HP Laptop",       price:54999 },
  { id:"p9", name:"Redmi Note 13",   price:16999 },
  { id:"p10",name:"Noise ColorFit",  price:2999  },
];

// ─── Summary totals ───────────────────────────────────────────────────────────

const SUMMARY = { cash: 12600, upi: 14200, card: 16000, total: 42800 };

// ─── POS Create Sale Panel ────────────────────────────────────────────────────

function POSSalePanel({ onClose }: { onClose: () => void }) {
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart]           = useState<CartItem[]>([]);
  const [payment, setPayment]     = useState<PaymentMethod>("Cash");
  const [tendered, setTendered]   = useState("");
  const [discount, setDiscount]   = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredProducts = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discAmt    = discount ? Math.round(subtotal * (parseFloat(discount) / 100)) : 0;
  const total      = subtotal - discAmt;
  const change     = payment === "Cash" && tendered ? Math.max(0, parseFloat(tendered) - total) : 0;

  function addToCart(p: typeof PRODUCTS[0]) {
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
    setProductSearch("");
    setShowSearch(false);
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(c => c.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className={`${card} p-5 mb-2`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,153,102,0.10)" }}>
            <Monitor size={16} style={{ color: G }} />
          </div>
          <h3 className="text-sm font-black text-gray-900">New POS Sale</h3>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: product search + cart */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={productSearch}
              onChange={e => { setProductSearch(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              placeholder="Search product to add..."
              className={`${inp} pl-8`}
            />
            <AnimatePresence>
              {showSearch && productSearch && filteredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 mt-1 max-h-48 overflow-y-auto"
                >
                  {filteredProducts.map(p => (
                    <button key={p.id} onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left">
                      <span className="font-medium text-gray-800">{p.name}</span>
                      <span className="font-bold text-gray-900">{fmt(p.price)}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart items */}
          <div className="space-y-2 min-h-[120px]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-gray-300 gap-2">
                <ShoppingBag size={28} />
                <p className="text-xs">No items added</p>
              </div>
            ) : (
              cart.map(item => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500">{fmt(item.price)} / unit</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all text-xs font-bold">−</button>
                    <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all text-xs font-bold">+</button>
                  </div>
                  <span className="text-xs font-bold text-gray-900 w-20 text-right">{fmt(item.price * item.qty)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right: payment */}
        <div className="space-y-4">
          {/* Payment method tabs */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {(["Cash", "Card", "UPI"] as PaymentMethod[]).map(m => {
                const s = PAYMENT_STYLE[m];
                const Icon = s.icon;
                return (
                  <button key={m} onClick={() => setPayment(m)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-bold transition-all ${payment === m ? "border-current shadow-sm" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                    style={payment === m ? { color: s.color, background: s.bg, borderColor: s.color } : {}}>
                    <Icon size={18} />
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              placeholder="0"
              className={`${inp} mt-1`}
            />
          </div>

          {/* Amount tendered (Cash only) */}
          {payment === "Cash" && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Tendered (₹)</label>
              <input
                type="number"
                value={tendered}
                onChange={e => setTendered(e.target.value)}
                placeholder="Enter amount"
                className={`${inp} mt-1`}
              />
              {tendered && parseFloat(tendered) >= total && (
                <p className="text-xs font-bold mt-1.5" style={{ color: G }}>
                  Change: {fmt(change)}
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span className="font-semibold text-gray-800">{fmt(subtotal)}</span>
            </div>
            {discAmt > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({discount}%)</span><span className="font-semibold">− {fmt(discAmt)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-gray-900 text-sm border-t border-gray-200 pt-2">
              <span>Total</span><span>{fmt(total)}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            disabled={cart.length === 0}
            className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: G }}
          >
            Complete Sale · {fmt(total)}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SellerPOSOrdersPage() {
  const [showNew, setShowNew] = useState(false);
  const [search,  setSearch]  = useState("");

  const filtered = POS_ORDERS.filter(o =>
    !search ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">POS Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Counter Sales Management</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: G }}
        >
          <Plus size={15} /> New POS Sale
        </motion.button>
      </div>

      {/* New sale panel */}
      <AnimatePresence>
        {showNew && <POSSalePanel onClose={() => setShowNew(false)} />}
      </AnimatePresence>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Today's Sales",     value: fmt(42800), icon: IndianRupee,  color: G,         bg: "rgba(0,153,102,0.10)"   },
          { label: "POS Orders Today",  value: "18",       icon: Monitor,      color: "#3b82f6", bg: "rgba(59,130,246,0.10)"  },
          { label: "Avg POS Value",     value: fmt(2378),  icon: TrendingUp,   color: "#8b5cf6", bg: "rgba(139,92,246,0.10)"  },
          { label: "Cash Transactions", value: "14",       icon: Users,        color: "#f59e0b", bg: "rgba(245,158,11,0.10)"  },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }} className={`${card} p-4 flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className="text-lg font-black text-gray-900">{s.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search + table */}
      <div className={`${card} overflow-hidden`}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search POS orders..."
              className={`${inp} pl-8`}
            />
          </div>
          <span className="text-xs text-gray-400 font-semibold">{filtered.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                {["POS ID", "Customer", "Items", "Amount", "Payment", "Time", "Date", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const ps = PAYMENT_STYLE[o.payment];
                const PIcon = ps.icon;
                return (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.025 }}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-gray-800 text-xs">{o.id}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`font-semibold ${o.customer === "Walk-in" ? "text-gray-400 italic" : "text-gray-800"}`}>
                        {o.customer}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-semibold">{o.items}</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-900">{fmt(o.amount)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ color: ps.color, background: ps.bg }}>
                        <PIcon size={10} />
                        {o.payment}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{o.time}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{o.date}</td>
                    <td className="px-4 py-3">
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-all">
                        <Printer size={13} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's summary card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className={`${card} p-5`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-gray-900">Today's Payment Summary</h2>
          <span className="text-sm font-black" style={{ color: G }}>Total {fmt(SUMMARY.total)}</span>
        </div>

        {/* Bar chart visual */}
        <div className="space-y-3">
          {([
            { method: "Cash" as PaymentMethod, amount: SUMMARY.cash  },
            { method: "UPI"  as PaymentMethod, amount: SUMMARY.upi   },
            { method: "Card" as PaymentMethod, amount: SUMMARY.card  },
          ]).map(({ method, amount }) => {
            const ps  = PAYMENT_STYLE[method];
            const pct = (amount / SUMMARY.total) * 100;
            const Icon = ps.icon;
            return (
              <div key={method}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: ps.bg }}>
                      <Icon size={14} style={{ color: ps.color }} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{pct.toFixed(1)}%</span>
                    <span className="text-xs font-bold text-gray-900">{fmt(amount)}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: ps.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <IndianRupee size={13} className="text-gray-400" />
            <span>18 transactions today</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold" style={{ color: G }}>
            <TrendingUp size={13} />
            +12.4% vs yesterday
          </div>
        </div>
      </motion.div>
    </div>
  );
}
