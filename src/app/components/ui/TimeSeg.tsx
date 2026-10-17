import { motion } from "motion/react";

export function TimeSeg({ v, u }: { v: string; u: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <motion.span key={v} initial={{ rotateX:-80, opacity:0 }} animate={{ rotateX:0, opacity:1 }} transition={{ duration:0.2 }}
        className="bg-black/30 text-white font-black text-sm md:text-base px-2.5 py-1 rounded-lg tabular-nums min-w-[36px] text-center">{v}</motion.span>
      <span className="text-[8px] text-white/60 uppercase tracking-widest">{u}</span>
    </div>
  );
}
