import { useEffect } from "react";
import { motion } from "motion/react";
import { Check, Package, RotateCcw, FileText, Share2, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { G, GD } from "../data/index";
import type { Page } from "../types/index";
import { fmt } from "../utils/format";

const ORDER_ITEMS = [
  { name: "iPhone 15 Pro Max 256GB", qty: 1, price: 134900, img: "https://images.unsplash.com/photo-1696446702183-cbd96c1abb3a?w=80&h=80&fit=crop" },
  { name: "Kanjivaram Silk Saree", qty: 2, price: 1499, img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=80&h=80&fit=crop" },
  { name: "Atomic Habits (Paperback)", qty: 1, price: 299, img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&h=80&fit=crop" },
];

const CONFETTI_COLORS = ["#009966", "#fbbf24", "#f87171", "#60a5fa", "#a78bfa", "#34d399", "#fb923c", "#e879f9", "#38bdf8", "#f472b6", "#4ade80", "#facc15"];

export function OrderConfirmationPage({ setPage }: { setPage: (p: Page) => void }) {
  const total = ORDER_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);

  useEffect(() => {
    // no auto-navigate; user controls this
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 relative overflow-hidden">
      {/* Confetti dots */}
      {CONFETTI_COLORS.map((color, i) => {
        const angle = (i / CONFETTI_COLORS.length) * 360;
        const rad = (angle * Math.PI) / 180;
        const dist = 120 + (i % 3) * 40;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 10 + (i % 4) * 4,
              height: 10 + (i % 4) * 4,
              background: color,
              left: "50%",
              top: "15%",
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.5],
            }}
            transition={{
              duration: 1.4,
              delay: i * 0.04,
              ease: "easeOut",
            }}
          />
        );
      })}

      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        {/* Success header */}
        <div className="px-6 pt-10 pb-6 flex flex-col items-center text-center"
          style={{ background: `linear-gradient(160deg, ${G}08 0%, transparent 60%)` }}>
          {/* Animated checkmark */}
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${GD}, ${G})` }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.2 }}
            >
              <Check size={36} strokeWidth={3} className="text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-2xl sm:text-3xl font-black text-foreground mb-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Order Confirmed! 🎉
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-sm mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Thank you! Your order has been placed successfully.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Order ID</p>
              <p className="text-sm font-black text-foreground">#BB2610050001</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Est. Delivery</p>
              <p className="text-sm font-black text-foreground">8 Oct – 10 Oct 2026</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Paid</p>
              <p className="text-sm font-black" style={{ color: G }}>{fmt(total)}</p>
            </div>
          </motion.div>
        </div>

        {/* Delivery progress bar */}
        <motion.div
          className="mx-6 mb-6 rounded-2xl p-4 border border-border"
          style={{ background: `${G}06` }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-foreground">Delivery Status</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${G}15`, color: G }}>Order Placed</span>
          </div>
          <div className="flex items-center gap-0">
            {["Order Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"].map((s, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-all"
                  style={{ background: i === 0 ? G : "var(--border)" }}
                />
                {i < 4 && (
                  <div className="flex-1 h-0.5" style={{ background: "var(--border)" }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {["Placed", "Packed", "Shipped", "On Way", "Done"].map((s, i) => (
              <span key={i} className="text-[9px] font-bold" style={{ color: i === 0 ? G : "var(--muted-foreground)" }}>{s}</span>
            ))}
          </div>
        </motion.div>

        {/* Items */}
        <motion.div
          className="px-6 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-sm font-black text-foreground mb-3">Items Ordered</h3>
          <div className="space-y-3">
            {ORDER_ITEMS.map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                <img src={item.img} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                </div>
                <span className="text-sm font-black text-foreground shrink-0">{fmt(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-white"
            style={{ background: `linear-gradient(to right,${GD},${G})`, boxShadow: `0 4px 14px ${G}44` }}>
            <Truck size={15} /> Track Order
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}
            onClick={() => setPage("home")}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black border-2 border-border text-foreground hover:border-[#009966] transition-all">
            <RotateCcw size={15} /> Continue Shopping
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} whileHover={{ y: -2 }}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black border-2 border-border text-foreground hover:border-[#009966] transition-all">
            <FileText size={15} /> Download Invoice
          </motion.button>
        </motion.div>

        {/* Share */}
        <motion.div
          className="px-6 pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border text-xs font-bold text-muted-foreground hover:border-[#009966] hover:text-[#009966] transition-all">
            <Share2 size={13} /> Share Order with Friends
          </button>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          className="border-t border-border px-6 py-4 flex items-center justify-center gap-6 flex-wrap"
          style={{ background: `${G}04` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[
            { icon: <Truck size={13} />, text: "Free Delivery" },
            { icon: <RefreshCw size={13} />, text: "Easy Returns" },
            { icon: <ShieldCheck size={13} />, text: "Genuine Products" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5" style={{ color: G }}>
              {icon}
              <span className="text-[11px] font-bold">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
