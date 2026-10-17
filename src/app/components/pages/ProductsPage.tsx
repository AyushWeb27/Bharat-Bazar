import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, Grid, List, X } from "lucide-react";
import { CardGrid } from "../cards/CardGrid";
import { CardList } from "../cards/CardList";
import { fmt } from "../utils/format";
import { G, PRODUCTS, CATEGORIES } from "../data/index";
import type { Prod } from "../types/index";

export function ProductsPage({ onAdd, onWish, wish, onView }: {
  onAdd:(p:Prod)=>void; onWish:(id:number)=>void; wish:Set<number>; onView:(p:Prod)=>void;
}) {
  const [view, setView] = useState<"grid"|"list">("grid");
  const [sort, setSort] = useState("popular");
  const [selCat, setSelCat] = useState("All");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyCod, setOnlyCod] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const items = PRODUCTS
    .filter(p => selCat === "All" || p.cat === selCat)
    .filter(p => p.price <= maxPrice)
    .filter(p => !onlyFree || p.freeShip)
    .filter(p => !onlyCod || p.cod)
    .sort((a,b) => sort === "price-asc" ? a.price-b.price : sort === "price-desc" ? b.price-a.price : sort === "rating" ? b.rating-a.rating : b.reviews-a.reviews);

  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <p className="text-xs font-black text-foreground uppercase tracking-widest mb-2.5">Category</p>
        <div className="space-y-1">
          {["All", ...CATEGORIES.map(c=>c.name)].map(cat => (
            <button key={cat} onClick={() => setSelCat(cat)}
              className={`w-full text-left text-xs px-3 py-2 rounded-xl font-semibold transition-colors ${selCat===cat ? "text-white" : "text-foreground hover:bg-muted"}`}
              style={selCat===cat ? { background:G } : {}}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      {/* Price */}
      <div>
        <p className="text-xs font-black text-foreground uppercase tracking-widest mb-2">Max Price: {fmt(maxPrice)}</p>
        <input type="range" min={500} max={200000} step={500} value={maxPrice} onChange={e=>setMaxPrice(+e.target.value)}
          className="w-full accent-[#009966]"/>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>₹500</span><span>₹2,00,000</span></div>
      </div>
      {/* Toggles */}
      <div className="space-y-2">
        <p className="text-xs font-black text-foreground uppercase tracking-widest mb-2">Filters</p>
        {[["Free Delivery", onlyFree, setOnlyFree],["COD Available", onlyCod, setOnlyCod]].map(([label,val,set]) => (
          <label key={label as string} className="flex items-center gap-2.5 cursor-pointer group">
            <div onClick={() => (set as (v:boolean)=>void)(!(val as boolean))}
              className={`w-10 h-5 rounded-full transition-colors relative ${val ? "":"bg-muted"}`}
              style={val ? { background:G } : {}}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${val?"translate-x-5":"translate-x-0.5"}`}/>
            </div>
            <span className="text-xs font-semibold text-foreground">{label as string}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex gap-6">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:block w-52 shrink-0">
        <div className="bg-card border border-border rounded-2xl p-4 sticky top-24">
          <FilterPanel />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={() => setFilterOpen(true)} className="md:hidden flex items-center gap-1.5 border border-border text-foreground px-3 py-2 rounded-xl text-xs font-bold hover:border-[#009966] transition-colors">
              <SlidersHorizontal size={13}/> Filters
            </button>
            <p className="text-sm text-muted-foreground font-medium"><span className="font-black text-foreground">{items.length}</span> products found</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <select value={sort} onChange={e=>setSort(e.target.value)}
              className="text-xs font-bold bg-card border border-border rounded-xl px-3 py-2 outline-none text-foreground">
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
            <button onClick={()=>setView("grid")} className={`p-2 rounded-xl transition-colors ${view==="grid"?"text-white":"bg-muted text-muted-foreground"}`} style={view==="grid"?{background:G}:{}}><Grid size={14}/></button>
            <button onClick={()=>setView("list")} className={`p-2 rounded-xl transition-colors ${view==="list"?"text-white":"bg-muted text-muted-foreground"}`} style={view==="list"?{background:G}:{}}><List size={14}/></button>
          </div>
        </div>

        {/* Grid / List */}
        <motion.div layout className={view==="grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
          <AnimatePresence mode="popLayout">
            {items.map(p => (
              <motion.div key={p.id} layout initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.92 }} transition={{ duration:0.2 }}>
                {view==="grid"
                  ? <CardGrid p={p} onAdd={onAdd} onWish={onWish} wished={wish.has(p.id)} onView={onView}/>
                  : <CardList p={p} onAdd={onAdd} onWish={onWish} wished={wish.has(p.id)} onView={onView}/>}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 bg-black/50 z-[90]" onClick={()=>setFilterOpen(false)}/>
            <motion.div initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }} transition={{ type:"spring", damping:28, stiffness:280 }}
              className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-[100] p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-foreground">Filters</h3>
                <button onClick={()=>setFilterOpen(false)}><X size={18} className="text-muted-foreground"/></button>
              </div>
              <FilterPanel />
              <button onClick={()=>setFilterOpen(false)} className="w-full text-white py-3 rounded-xl font-black mt-4" style={{ background:G }}>Apply Filters</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
