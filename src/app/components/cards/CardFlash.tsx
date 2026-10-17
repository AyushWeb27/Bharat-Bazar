import { useState } from "react";
import { motion } from "motion/react";
import { Stars } from "../ui/Stars";
import { fmt } from "../utils/format";
import { G } from "../data/index";
import type { Prod } from "../types/index";

export function CardFlash({ p, onAdd, onView }: { p:Prod; onAdd:(p:Prod)=>void; onView:(p:Prod)=>void }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      className="bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer group border border-white/5 flex flex-col"
      whileHover={{ y:-5, scale:1.03 }} whileTap={{ scale:0.97 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => onView(p)}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio:"1/1" }}>
        <motion.img src={p.img} alt={p.name} className="w-full h-full object-cover"
          animate={{ scale: hov ? 1.08 : 1 }} transition={{ duration:0.4 }} />
        {/* diagonal ribbon */}
        <div className="absolute top-4 -left-5 w-24 text-center rotate-[-40deg] bg-red-500 text-white text-[9px] font-black py-0.5 shadow-lg">
          -{p.off}% OFF
        </div>
        <motion.div className="absolute bottom-0 left-0 right-0"
          initial={{ y:40, opacity:0 }} animate={{ y: hov ? 0 : 40, opacity: hov ? 1 : 0 }}
          onClick={e => { e.stopPropagation(); onAdd(p); }}
        >
          <button className="w-full py-2 text-white text-[10px] font-black" style={{ background: G }}>
            + Add to Cart
          </button>
        </motion.div>
      </div>
      <div className="p-3 flex-1">
        <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">{p.brand}</p>
        <p className="text-white text-xs font-bold line-clamp-2 leading-snug mt-0.5">{p.name}</p>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="font-black text-sm" style={{ color: G }}>{fmt(p.price)}</span>
          <span className="text-zinc-600 text-[10px] line-through">{fmt(p.mrp)}</span>
        </div>
        <Stars r={p.rating} n={p.reviews} sm />
      </div>
    </motion.div>
  );
}
