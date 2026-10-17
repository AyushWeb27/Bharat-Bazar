import { Star } from "lucide-react";

export function Stars({ r, n, sm }: { r: number; n?: number; sm?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={sm ? 9 : 11}
            className={i <= Math.round(r) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"} />
        ))}
      </div>
      {n !== undefined && <span className={`text-muted-foreground ${sm ? "text-[9px]" : "text-[10px]"}`}>({n.toLocaleString("en-IN")})</span>}
    </div>
  );
}
