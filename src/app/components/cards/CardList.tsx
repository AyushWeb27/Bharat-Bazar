import { motion } from "motion/react";
import { Heart, Package, Truck } from "lucide-react";
import { Stars } from "../ui/Stars";
import { fmt } from "../utils/format";
import { G } from "../data/index";
import type { Prod } from "../types/index";

export function CardList({ p, onAdd, onWish, wished, onView }: {
  p: Prod; onAdd:(p:Prod)=>void; onWish:(id:number)=>void; wished:boolean; onView:(p:Prod)=>void;
}) {
  return (
    <motion.article
      className="bg-card rounded-2xl border border-border overflow-hidden flex gap-0 group cursor-pointer"
      whileHover={{ x: 5, boxShadow: `0 8px 32px -4px ${G}18` }}
      transition={{ type:"spring", damping:28 }}
      onClick={() => onView(p)}
    >
      {/* Left image */}
      <div className="w-44 md:w-56 shrink-0 relative overflow-hidden bg-muted">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 to-stone-100 text-emerald-800">
          <Package size={28} strokeWidth={1.5} />
          <span className="px-3 text-center text-[9px] font-bold">Product image coming soon</span>
        </div>
        {p.img && (
          <img
            src={p.img}
            alt={p.name}
            onError={event => { event.currentTarget.style.display = "none"; }}
            className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ minHeight:180 }}
          />
        )}
        <div className="absolute top-2.5 left-2.5">
          {p.off > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">-{p.off}%</span>}
        </div>
        {/* Green left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: G }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.brand || "Bharat Bazar"}</p>
              {p.cat && <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold text-muted-foreground">{p.cat}</span>}
              {p.tag && <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: p.tagClr }}>{p.tag}</span>}
            </div>
            <h3 className="text-base font-black text-foreground leading-snug mt-0.5 line-clamp-1">{p.name}</h3>
          </div>
          <button onClick={e => { e.stopPropagation(); onWish(p.id); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${wished ? "bg-red-500 border-red-500" : "border-border text-muted-foreground hover:border-red-300"}`}
          >
            <Heart size={13} className={wished ? "fill-white text-white" : ""} />
          </button>
        </div>

        <Stars r={p.rating} n={p.reviews} />
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{p.desc}</p>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-xl font-black text-foreground">{fmt(p.price)}</span>
          {p.mrp > p.price && <span className="text-sm text-muted-foreground line-through">{fmt(p.mrp)}</span>}
          {p.off > 0 && <span className="text-xs font-black text-red-500">{p.off}% off</span>}
        </div>
        {p.mrp > p.price && <p className="text-xs font-bold" style={{ color: G }}>You save {fmt(p.mrp - p.price)}</p>}

        <div className="flex items-center gap-3 flex-wrap">
          {p.freeShip && <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: G }}><Truck size={10}/> Free Delivery</span>}
          {p.cod      && <span className="text-[10px] font-bold text-muted-foreground">✓ COD</span>}
          {p.emi      && <span className="text-[10px] font-bold text-blue-500">✓ No Cost EMI</span>}
        </div>

        <div className="flex gap-2 mt-1" onClick={e => e.stopPropagation()}>
          <motion.button whileTap={{ scale:0.95 }} onClick={() => onAdd(p)}
            className="flex-1 md:flex-none text-white px-6 py-2.5 rounded-xl text-xs font-black hover:opacity-90 transition-opacity"
            style={{ background: G }}
          >
            🛒 Add to Cart
          </motion.button>
          <motion.button whileTap={{ scale:0.95 }} onClick={() => onView(p)}
            className="flex-1 md:flex-none border border-border text-foreground px-6 py-2.5 rounded-xl text-xs font-black hover:border-[#009966] transition-colors"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
