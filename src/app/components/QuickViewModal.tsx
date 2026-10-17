import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, Minus, Plus, ShoppingCart, ExternalLink } from "lucide-react";
import { G, GD, SWATCHES } from "./data/index";
import { fmt } from "./utils/format";
import type { Prod } from "./types/index";

export function QuickViewModal({
  product,
  onClose,
  onAdd,
  onView,
}: {
  product: Prod | null;
  onClose: () => void;
  onAdd: (p: Prod) => void;
  onView: (p: Prod) => void;
}) {
  const [qty, setQty] = useState(1);
  const [selSize, setSelSize] = useState<string | null>(null);
  const [selSwatch, setSelSwatch] = useState(0);

  const p = product;
  const swatches = p ? (SWATCHES[p.id] ?? ["#111"]) : [];

  function handleAdd() {
    if (p) {
      onAdd(p);
      onClose();
    }
  }

  function handleView() {
    if (p) {
      onView(p);
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {p && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            key="card"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
            className="bg-card rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Left: Image */}
              <div
                className="relative aspect-[4/5] sm:aspect-auto flex items-center justify-center p-8"
                style={{ background: `${p.tagClr}18` }}
              >
                {/* Discount badge */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">-{p.off}% OFF</span>
                  <span
                    className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-white"
                    style={{ background: p.tagClr }}
                  >
                    {p.tag}
                  </span>
                </div>

                <motion.img
                  key={p.id}
                  src={p.img}
                  alt={p.name}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full object-cover rounded-2xl"
                  style={{ maxHeight: "360px" }}
                />
              </div>

              {/* Right: Info */}
              <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-9 h-9 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
                >
                  <X size={16} />
                </button>

                {/* Brand + Name */}
                <div>
                  <span
                    className="text-[9px] font-black px-2 py-0.5 rounded-full text-white mr-2"
                    style={{ background: G }}
                  >
                    {p.brand}
                  </span>
                  <h2 className="text-base font-black text-foreground mt-2 leading-snug">{p.name}</h2>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star
                        key={n}
                        size={12}
                        className={n <= Math.round(p.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-foreground">{p.rating}</span>
                  <span className="text-xs text-muted-foreground">({p.reviews.toLocaleString("en-IN")} reviews)</span>
                </div>

                {/* Price */}
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-2xl font-black text-foreground">{fmt(p.price)}</span>
                    <span className="text-sm text-muted-foreground line-through">{fmt(p.mrp)}</span>
                    <span className="text-sm font-black text-red-500">{p.off}% OFF</span>
                  </div>
                  <p className="text-xs font-bold mt-1" style={{ color: G }}>
                    You save {fmt(p.mrp - p.price)}
                  </p>
                </div>

                {/* Color chips */}
                <div>
                  <p className="text-[10px] font-black text-foreground uppercase tracking-wider mb-2">Colour</p>
                  <div className="flex gap-2 flex-wrap">
                    {swatches.map((c, i) => (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setSelSwatch(i)}
                        className="w-7 h-7 rounded-full border-4 transition-all"
                        style={{
                          background: c,
                          borderColor: selSwatch === i ? G : "transparent",
                          boxShadow: selSwatch === i ? `0 0 0 2px ${G}` : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Size chips */}
                {p.sizes.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-foreground uppercase tracking-wider mb-2">
                      {p.cat === "Electronics" || p.cat === "Mobiles" ? "Storage" : "Size"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.sizes.map(s => (
                        <motion.button
                          key={s}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setSelSize(s)}
                          className="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all"
                          style={
                            selSize === s
                              ? { background: G, color: "white", borderColor: "transparent" }
                              : { borderColor: "var(--border)", color: "var(--foreground)" }
                          }
                        >
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors text-foreground"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-9 text-center font-black text-sm text-foreground">{qty}</span>
                    <button
                      onClick={() => setQty(q => q + 1)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors text-foreground"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">Only 8 left</span>
                </div>

                {/* CTAs */}
                <div className="flex gap-2 mt-auto">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleAdd}
                    className="flex-1 py-3 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-1.5"
                    style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleView}
                    className="flex-1 py-3 rounded-2xl font-black text-xs border border-border text-foreground hover:border-[#009966] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={14} /> View Full Details
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
