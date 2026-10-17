import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Eye, ShoppingCart, Truck, Package, IndianRupee } from "lucide-react";
import { Stars } from "../ui/Stars";
import { fmt } from "../utils/format";
import { G, GD, SWATCHES } from "../data/index";
import type { Prod } from "../types/index";

export function CardGrid({ p, onAdd, onWish, wished, onView }: {
  p: Prod; onAdd: (p:Prod)=>void; onWish: (id:number)=>void; wished:boolean; onView: (p:Prod)=>void;
}) {
  const [hov, setHov] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [swatch, setSwatch] = useState(0);
  const swatches = SWATCHES[p.id] ?? ["#111"];

  return (
    <motion.article
      className="bg-card rounded-3xl border border-border overflow-hidden flex flex-col group relative cursor-pointer"
      whileHover={{ y: -7, boxShadow: `0 24px 60px -8px ${G}22` }}
      transition={{ type:"spring", damping:22, stiffness:300 }}
      onMouseEnter={() => { setHov(true); setImgIdx(1); }}
      onMouseLeave={() => { setHov(false); setImgIdx(0); }}
      onClick={() => onView(p)}
    >
      {/* ── IMAGE ZONE ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio:"4/5" }}>
        <div className="absolute inset-0 bg-muted" />
        <motion.img
          src={imgIdx === 0 ? p.img : p.img2}
          alt={p.name}
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ scale: hov ? 1.07 : 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* ── TOP BADGES ── */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
            -{p.off}% OFF
          </span>
          {p.tag && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white shadow-sm" style={{ background: p.tagClr }}>
              {p.tag}
            </span>
          )}
        </div>

        {/* ── WISHLIST ── */}
        <motion.button
          className={`absolute top-3 right-3 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-colors ${wished ? "bg-red-500" : "bg-white/90 dark:bg-zinc-900/90"}`}
          whileTap={{ scale: 0.78 }}
          onClick={e => { e.stopPropagation(); onWish(p.id); }}
        >
          <Heart size={13} className={wished ? "fill-white text-white" : "text-zinc-400"} />
        </motion.button>

        {/* ── QUICK VIEW ── */}
        <motion.button
          className="absolute top-3 right-14 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-md flex items-center justify-center text-zinc-500"
          initial={{ opacity:0, x:10 }} animate={{ opacity: hov ? 1 : 0, x: hov ? 0 : 10 }}
          transition={{ duration:0.2 }}
          onClick={e => { e.stopPropagation(); onView(p); }}
        >
          <Eye size={13} />
        </motion.button>

        {/* ── SWATCH DOTS (bottom of image) ── */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          {swatches.map((c, i) => (
            <button key={i}
              onClick={e => { e.stopPropagation(); setSwatch(i); }}
              className={`w-4 h-4 rounded-full border-2 transition-transform ${swatch === i ? "scale-125 border-white" : "border-transparent hover:scale-110"}`}
              style={{ background: c }}
            />
          ))}
        </div>

        {/* ── ADD TO CART (slides up) ── */}
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: hov ? 0 : 40, opacity: hov ? 1 : 0 }}
          transition={{ type:"spring", damping:25, stiffness:300 }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onAdd(p)}
            className="w-full py-3 flex items-center justify-center gap-2 text-white text-xs font-black tracking-widest uppercase"
            style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}
          >
            <ShoppingCart size={13} /> Add to Cart
          </button>
        </motion.div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{p.brand}</p>
            <h3 className="text-sm font-bold text-foreground leading-snug mt-0.5 line-clamp-2">{p.name}</h3>
          </div>
        </div>

        <Stars r={p.rating} n={p.reviews} sm />

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-black text-foreground">{fmt(p.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{fmt(p.mrp)}</span>
          <span className="text-[10px] font-black text-red-500">{p.off}% off</span>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-2 mt-0.5">
          {p.freeShip && <span className="text-[9px] font-bold flex items-center gap-0.5" style={{ color: G }}><Truck size={8}/> Free</span>}
          {p.cod      && <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-0.5"><Package size={8}/> COD</span>}
          {p.emi      && <span className="text-[9px] font-bold text-blue-500 flex items-center gap-0.5"><IndianRupee size={8}/> EMI</span>}
          {!p.inStock && <span className="text-[9px] font-bold text-red-400 ml-auto">Out of Stock</span>}
        </div>
      </div>

      {/* Green accent bar */}
      <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 ease-out" style={{ background: G }} />
    </motion.article>
  );
}
