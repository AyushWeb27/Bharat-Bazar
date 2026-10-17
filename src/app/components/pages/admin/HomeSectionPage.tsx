import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutList, ArrowUp, ArrowDown, Eye, EyeOff, GripVertical, Layers, Tag, Image as ImageIcon, BarChart2, ShoppingBag, Star, Truck, Gift, Zap } from "lucide-react";
import { Toggle, PageHeader, StatCard, SectionCard } from "./shared/ui";
import { G } from "./shared/constants";

type SectionType = "hero" | "category" | "product" | "brand" | "banner" | "info";

type HomeSection = {
  id: number;
  name: string;
  type: SectionType;
  itemCount: number;
  sort: number;
  visible: boolean;
  description: string;
};

const TYPE_META: Record<SectionType, { color: string; bg: string; Icon: React.ElementType }> = {
  hero:     { color: "#6366f1", bg: "#eef2ff", Icon: ImageIcon  },
  category: { color: "#f59e0b", bg: "#fffbeb", Icon: Tag        },
  product:  { color: "#009966", bg: "#e8fff6", Icon: ShoppingBag },
  brand:    { color: "#8b5cf6", bg: "#f5f3ff", Icon: Star       },
  banner:   { color: "#ec4899", bg: "#fdf2f8", Icon: ImageIcon  },
  info:     { color: "#0d9488", bg: "#f0fdfa", Icon: BarChart2  },
};

const INIT_SECTIONS: HomeSection[] = [
  { id: 1,  name: "Hero Banner Carousel",    type: "hero",     itemCount: 4,  sort: 1,  visible: true,  description: "Main full-width rotating hero banners" },
  { id: 2,  name: "Flash Deals",             type: "product",  itemCount: 8,  sort: 2,  visible: true,  description: "Limited-time countdown deals strip"    },
  { id: 3,  name: "Shop by Category",        type: "category", itemCount: 10, sort: 3,  visible: true,  description: "Top-level category tiles with icons"   },
  { id: 4,  name: "New Arrivals",            type: "product",  itemCount: 12, sort: 4,  visible: true,  description: "Recently added products carousel"      },
  { id: 5,  name: "Featured Brands",         type: "brand",    itemCount: 8,  sort: 5,  visible: true,  description: "Logo strip of partner brands"          },
  { id: 6,  name: "Mid-Page Banner",         type: "banner",   itemCount: 1,  sort: 6,  visible: true,  description: "Full-width single promotion banner"    },
  { id: 7,  name: "Best Sellers",            type: "product",  itemCount: 16, sort: 7,  visible: true,  description: "Top-selling products grid"             },
  { id: 8,  name: "Free Delivery Info Bar",  type: "info",     itemCount: 3,  sort: 8,  visible: true,  description: "USP highlights: free delivery, returns" },
  { id: 9,  name: "Organic & Fresh",         type: "category", itemCount: 6,  sort: 9,  visible: false, description: "Organic produce category spotlight"    },
  { id: 10, name: "Trending Searches",       type: "product",  itemCount: 20, sort: 10, visible: false, description: "Keyword chips from search trends"      },
  { id: 11, name: "Loyalty Rewards Banner",  type: "banner",   itemCount: 1,  sort: 11, visible: false, description: "Promote the BharatPlus loyalty tier"   },
  { id: 12, name: "Footer Brand Strip",      type: "brand",    itemCount: 12, sort: 12, visible: true,  description: "Secondary brand logos before footer"   },
];

const SECTION_ICONS: Record<string, React.ElementType> = {
  "Hero Banner Carousel":    Layers,
  "Flash Deals":             Zap,
  "Shop by Category":        Tag,
  "New Arrivals":            ShoppingBag,
  "Featured Brands":         Star,
  "Mid-Page Banner":         ImageIcon,
  "Best Sellers":            BarChart2,
  "Free Delivery Info Bar":  Truck,
  "Organic & Fresh":         Layers,
  "Trending Searches":       BarChart2,
  "Loyalty Rewards Banner":  Gift,
  "Footer Brand Strip":      Star,
};

export function HomeSectionPage() {
  const [rows, setRows] = useState(INIT_SECTIONS);
  const [filterType, setFilterType] = useState<SectionType | "all">("all");

  const sorted   = [...rows].sort((a, b) => a.sort - b.sort);
  const filtered = filterType === "all" ? sorted : sorted.filter(r => r.type === filterType);

  const toggleVisible = (id: number) => setRows(p => p.map(r => r.id === id ? { ...r, visible: !r.visible } : r));

  const moveSort = (id: number, dir: -1 | 1) => {
    const sorted2 = [...rows].sort((a, b) => a.sort - b.sort);
    const idx     = sorted2.findIndex(r => r.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted2.length) return;
    setRows(rows.map(r => {
      if (r.id === sorted2[idx].id)     return { ...r, sort: sorted2[swapIdx].sort };
      if (r.id === sorted2[swapIdx].id) return { ...r, sort: sorted2[idx].sort };
      return r;
    }));
  };

  const visibleCount   = rows.filter(r => r.visible).length;
  const hiddenCount    = rows.filter(r => !r.visible).length;
  const typeCounts     = Object.keys(TYPE_META).reduce((acc, t) => ({ ...acc, [t]: rows.filter(r => r.type === t).length }), {} as Record<SectionType, number>);

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Promotion / Home Section" title="Home Sections"
        subtitle="Control the order and visibility of sections on the homepage" count={rows.length}>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
          <span className="flex items-center gap-1">
            <Eye size={13} style={{ color: G }}/> {visibleCount} visible
          </span>
          <span className="text-gray-300">·</span>
          <span className="flex items-center gap-1">
            <EyeOff size={13} className="text-gray-400"/> {hiddenCount} hidden
          </span>
        </div>
      </PageHeader>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Sections" val={rows.length}    color={G}         icon={LayoutList}  />
        <StatCard label="Visible"        val={visibleCount}   color="#10b981"    icon={Eye}         />
        <StatCard label="Hidden"         val={hiddenCount}    color="#9ca3af"    icon={EyeOff}      />
        <StatCard label="Section Types"  val={Object.keys(TYPE_META).length} color="#6366f1" icon={Layers}/>
      </div>

      {/* Type breakdown chips */}
      <SectionCard>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterType("all")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={filterType === "all" ? { background: G, color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }}>
            All ({rows.length})
          </button>
          {(Object.keys(TYPE_META) as SectionType[]).map(t => {
            const m = TYPE_META[t];
            return (
              <button key={t} onClick={() => setFilterType(t)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize"
                style={filterType === t ? { background: m.color, color: "#fff" } : { background: m.bg, color: m.color }}>
                {t} ({typeCounts[t] ?? 0})
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Homepage layout visualizer */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Section list — takes 3 cols */}
        <div className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">Sort Order</p>
          <AnimatePresence>
            {filtered.map((r, idx) => {
              const tm = TYPE_META[r.type];
              const TIcon = SECTION_ICONS[r.name] ?? tm.Icon;
              const allSorted = sorted;
              const globalIdx = allSorted.findIndex(s => s.id === r.id);
              return (
                <motion.div key={r.id} layout
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all group ${r.visible ? "border-gray-200 bg-white hover:shadow-sm" : "border-dashed border-gray-200 bg-gray-50/60 opacity-60"}`}>
                  {/* Sort handle + position */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0 text-gray-300">
                    <GripVertical size={14}/>
                    <span className="text-[9px] font-black">{r.sort}</span>
                  </div>

                  {/* Icon swatch */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: tm.bg }}>
                    <TIcon size={15} style={{ color: tm.color }}/>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-gray-800">{r.name}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded capitalize" style={{ color: tm.color, background: tm.bg }}>{r.type}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{r.description}</p>
                    <p className="text-[9px] text-gray-300 mt-0.5">{r.itemCount} item{r.itemCount !== 1 ? "s" : ""}</p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveSort(r.id, -1)} disabled={globalIdx === 0}
                        className="w-6 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-20">
                        <ArrowUp size={10}/>
                      </button>
                      <button onClick={() => moveSort(r.id, 1)} disabled={globalIdx === sorted.length - 1}
                        className="w-6 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-20">
                        <ArrowDown size={10}/>
                      </button>
                    </div>
                    <Toggle checked={r.visible} onChange={() => toggleVisible(r.id)}/>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Live page preview — right panel, 2 cols */}
        <div className="lg:col-span-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1 mb-2">Live Page Preview</p>
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {/* Fake browser chrome */}
            <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400"/>
                <div className="w-2 h-2 rounded-full bg-yellow-400"/>
                <div className="w-2 h-2 rounded-full bg-green-400"/>
              </div>
              <div className="flex-1 bg-white rounded px-2 py-0.5 text-[9px] text-gray-400 font-mono">bharatbazar.com</div>
            </div>
            {/* Page skeleton */}
            <div className="p-3 space-y-1.5 max-h-[520px] overflow-y-auto">
              {sorted.filter(r => r.visible).map(r => {
                const tm = TYPE_META[r.type];
                const heights: Record<SectionType, string> = {
                  hero:     "h-12",
                  category: "h-8",
                  product:  "h-10",
                  brand:    "h-6",
                  banner:   "h-7",
                  info:     "h-5",
                };
                return (
                  <motion.div key={r.id} layout
                    className="rounded-lg overflow-hidden relative flex items-center px-2.5"
                    style={{ background: `${tm.color}15`, height: undefined }}
                    data-type={r.type}>
                    <div className={`w-full rounded ${heights[r.type]} flex items-center`}>
                      <div className="flex items-center gap-1.5 w-full">
                        <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ background: `${tm.color}30` }}>
                          {(() => { const I = TYPE_META[r.type].Icon; return <I size={9} style={{ color: tm.color }}/>; })()}
                        </div>
                        <span className="text-[8px] font-bold truncate" style={{ color: tm.color }}>{r.name}</span>
                        <div className="ml-auto flex gap-0.5">
                          {Array.from({ length: Math.min(r.itemCount, 4) }).map((_, i) => (
                            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: `${tm.color}40` }}/>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {sorted.filter(r => r.visible).length === 0 && (
                <div className="py-8 text-center text-[10px] text-gray-400">No visible sections</div>
              )}
            </div>
          </div>
          <p className="text-[9px] text-gray-400 text-center mt-2">Toggle visibility to show/hide sections on the live homepage.</p>
        </div>
      </div>
    </div>
  );
}

export default HomeSectionPage;
