import { useState } from "react";
import { motion } from "motion/react";
import { ShoppingCart, X, Tag } from "lucide-react";
import { Stars } from "../ui/Stars";
import { fmt } from "../utils/format";
import { G, GD, PRODUCTS } from "../data/index";
import type { Prod, Page } from "../types/index";

export function CartPage({ cart, setCart, onView, setPage }: {
  cart:number[]; setCart:(c:number[])=>void; onView:(p:Prod)=>void; setPage?:(p:Page)=>void;
}) {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  const items = PRODUCTS.filter(p => cart.includes(p.id));
  const subtotalBeforeDiscount = items.reduce((s,p) => s+p.price, 0);
  const total = Math.max(0, subtotalBeforeDiscount - discount);
  const savings = items.reduce((s,p) => s+(p.mrp-p.price), 0);
  const remove = (id:number) => setCart(cart.filter(c => c !== id));

  const handleApplyCoupon = () => {
    setCouponMsg("");
    if (coupon.trim().toUpperCase() === "SAVE500") {
      setDiscount(500); setCouponApplied("SAVE500"); setCouponMsg("₹500 OFF applied! 🎉");
    } else if (coupon.trim().toUpperCase() === "WELCOME200") {
      setDiscount(200); setCouponApplied("WELCOME200"); setCouponMsg("₹200 OFF applied! 🎉");
    } else {
      setDiscount(0); setCouponApplied(""); setCouponMsg("Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0); setCouponApplied(""); setCoupon(""); setCouponMsg("");
  };

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <ShoppingCart size={64} strokeWidth={1} className="text-muted-foreground"/>
      <h2 className="text-xl font-black text-foreground">Your Cart is Empty</h2>
      <p className="text-muted-foreground text-sm">Add items you love to your cart</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Items */}
      <div className="lg:col-span-2 space-y-3">
        <h2 className="text-xl font-black text-foreground mb-4">🛒 My Cart ({items.length} items)</h2>
        {items.map((p, i) => (
          <motion.div key={i} layout initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-40 }}
            className="bg-card rounded-2xl border border-border flex gap-4 p-4 group">
            {/* Green accent left */}
            <div className="w-1 rounded-full shrink-0" style={{ background:G }}/>
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0 cursor-pointer" onClick={() => onView(p)}>
              <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{p.brand}</p>
              <h3 className="text-sm font-black text-foreground leading-snug line-clamp-2">{p.name}</h3>
              <Stars r={p.rating} n={p.reviews} sm/>
              <div className="flex items-baseline gap-2">
                <span className="font-black text-foreground">{fmt(p.price)}</span>
                <span className="text-xs text-muted-foreground line-through">{fmt(p.mrp)}</span>
                <span className="text-[10px] font-black text-red-500">{p.off}% off</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {p.freeShip && <span className="text-[10px] font-bold" style={{ color:G }}>✓ Free Delivery</span>}
                {p.cod && <span className="text-[10px] font-bold text-muted-foreground">✓ COD</span>}
              </div>
            </div>
            <button onClick={() => remove(p.id)} className="shrink-0 w-8 h-8 rounded-xl bg-muted hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 flex items-center justify-center text-muted-foreground transition-colors self-start">
              <X size={14}/>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="space-y-4">
        <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 space-y-4">
          <h3 className="font-black text-foreground">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Items ({items.length})</span><span className="font-semibold text-foreground">{fmt(items.reduce((s,p)=>s+p.mrp,0))}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="font-bold text-red-500">-{fmt(savings)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-bold" style={{ color:G }}>FREE 🎉</span></div>
            {discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Tag size={11} style={{ color:G }}/>
                  Coupon <span className="font-black" style={{ color:G }}>{couponApplied}</span>
                  <button onClick={handleRemoveCoupon} className="ml-1 w-4 h-4 rounded-full bg-muted hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 flex items-center justify-center text-muted-foreground transition-colors">
                    <X size={10}/>
                  </button>
                </span>
                <span className="font-bold" style={{ color:G }}>-{fmt(discount)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-black text-foreground">Total (incl. GST)</span>
              <span className="font-black text-lg text-foreground">{fmt(total)}</span>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="rounded-xl border border-dashed border-border p-3 space-y-2">
            <p className="text-xs font-black text-foreground flex items-center gap-1.5"><Tag size={12} style={{ color:G }}/> Apply Coupon</p>
            {couponApplied ? (
              <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                <span className="text-xs font-black" style={{ color:G }}>✓ {couponApplied} applied</span>
                <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <X size={14}/>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={e => setCoupon(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-border rounded-lg px-3 py-2 text-xs text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all font-bold"
                />
                <motion.button whileTap={{ scale:0.97 }} onClick={handleApplyCoupon}
                  className="px-3 py-2 rounded-lg text-xs font-black text-white shrink-0"
                  style={{ background:`linear-gradient(to right,${GD},${G})` }}>
                  Apply
                </motion.button>
              </div>
            )}
            {couponMsg && (
              <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
                className={`text-[11px] font-bold ${couponMsg.includes("OFF") ? "" : "text-red-500"}`}
                style={couponMsg.includes("OFF") ? { color:G } : {}}>
                {couponMsg}
              </motion.p>
            )}
            {!couponApplied && <p className="text-[10px] text-muted-foreground">Try: SAVE500 or WELCOME200</p>}
          </div>

          <p className="text-xs font-bold" style={{ color:G }}>You save {fmt(savings + discount)} on this order! 🎉</p>
          <div className="flex flex-wrap gap-1.5">
            {["📱 UPI","💳 Cards","🏦 NetBanking","📦 COD"].map(m => <span key={m} className="text-[9px] font-bold border border-border rounded-lg px-2 py-0.5 text-muted-foreground">{m}</span>)}
          </div>
          <motion.button whileTap={{ scale:0.97 }}
            onClick={() => setPage?.("checkout")}
            className="w-full text-white py-3.5 rounded-2xl font-black text-sm hover:opacity-90 transition-opacity"
            style={{ background:`linear-gradient(to right,${GD},${G})` }}>
            Proceed to Checkout →
          </motion.button>
        </div>
        {/* EMI note */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-black text-foreground mb-1">💳 No Cost EMI Available</p>
          <p className="text-[10px] text-muted-foreground">Starting from {fmt(Math.round(total/12))}/month with HDFC, ICICI, SBI and more.</p>
        </div>
      </div>
    </div>
  );
}
