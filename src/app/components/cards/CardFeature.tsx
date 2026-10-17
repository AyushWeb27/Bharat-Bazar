import { motion } from "motion/react";
import { Heart, ShoppingCart } from "lucide-react";
import { Stars } from "../ui/Stars";
import { fmt } from "../utils/format";
import { G } from "../data/index";
import type { Prod } from "../types/index";

export function CardFeature({ p, onAdd, onWish, wished, onView }: {
  p:Prod; onAdd:(p:Prod)=>void; onWish:(id:number)=>void; wished:boolean; onView:(p:Prod)=>void;
}) {
  return (
    <motion.div className="bg-card rounded-3xl border border-border overflow-hidden cursor-pointer group relative"
      whileHover={{ y:-6, boxShadow:`0 30px 70px -12px ${G}28` }}
      transition={{ type:"spring", damping:20 }}
      onClick={() => onView(p)}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio:"3/4" }}>
        <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {/* Floating badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-red-500/90 backdrop-blur text-white text-[10px] font-black px-2.5 py-1 rounded-full">-{p.off}%</span>
        </div>
        <motion.button
          className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${wished ? "bg-red-500" : "bg-white/20 backdrop-blur"}`}
          whileTap={{ scale:0.8 }}
          onClick={e => { e.stopPropagation(); onWish(p.id); }}
        >
          <Heart size={14} className={wished ? "fill-white text-white" : "text-white"} />
        </motion.button>
        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{p.brand}</p>
          <h3 className="text-white font-black text-base leading-tight mt-0.5 line-clamp-2">{p.name}</h3>
          <Stars r={p.rating} n={p.reviews} sm />
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-white font-black text-lg">{fmt(p.price)}</span>
              <span className="text-white/50 text-xs line-through ml-2">{fmt(p.mrp)}</span>
            </div>
            <motion.button whileTap={{ scale:0.9 }} onClick={e => { e.stopPropagation(); onAdd(p); }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{ background: G }}
            >
              <ShoppingCart size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
