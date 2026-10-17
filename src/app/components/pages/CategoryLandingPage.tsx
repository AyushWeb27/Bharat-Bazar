import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, SlidersHorizontal, X, CheckSquare, Square } from "lucide-react";
import { CardGrid } from "../cards/CardGrid";
import { PRODUCTS, CATEGORIES, G, GD } from "../data/index";
import type { Prod, Page } from "../types/index";
import { fmt } from "../utils/format";

const CATEGORY_META: Record<string, { gradient: string; emoji: string; subcats: string[]; brands: string[] }> = {
  "Sarees & Ethnic": {
    gradient: "from-pink-900 via-rose-700 to-pink-500",
    emoji: "🥻",
    subcats: ["All", "Silk Sarees", "Chiffon", "Banarasi", "Lehenga", "Dupatta", "Salwar Suits", "Kurtis"],
    brands: ["Varanasi Weavers", "Meena Bazaar", "Kalyan Silks", "Fabindia", "Manyavar", "W for Woman"],
  },
  "Electronics": {
    gradient: "from-blue-900 via-blue-700 to-cyan-500",
    emoji: "📱",
    subcats: ["All", "Smartphones", "Laptops", "Tablets", "Accessories", "Audio", "Cameras", "Smart TV"],
    brands: ["Apple", "Samsung", "OnePlus", "Sony", "LG", "Bose"],
  },
  "Gold Jewellery": {
    gradient: "from-yellow-900 via-amber-700 to-yellow-400",
    emoji: "💍",
    subcats: ["All", "Necklaces", "Earrings", "Bangles", "Rings", "Bracelets", "Pendants", "Chains"],
    brands: ["Malabar Gold", "Tanishq", "PC Jeweller", "Kalyan Jewellers", "Joyalukkas", "PNG Jewellers"],
  },
  "Kitchen": {
    gradient: "from-teal-900 via-teal-700 to-emerald-500",
    emoji: "🍛",
    subcats: ["All", "Cookware", "Masalas", "Storage", "Appliances", "Cutlery", "Bakeware", "Juicers"],
    brands: ["MDH Masala", "Prestige", "Hawkins", "Borosil", "Pigeon", "Philips"],
  },
  "Cricket": {
    gradient: "from-green-900 via-green-700 to-lime-500",
    emoji: "🏏",
    subcats: ["All", "Bats", "Gloves", "Pads", "Helmets", "Balls", "Kits", "Jerseys"],
    brands: ["SG Sports", "MRF", "Kookaburra", "Gray-Nicolls", "Adidas", "Nike"],
  },
  "Ayurveda": {
    gradient: "from-emerald-900 via-green-700 to-lime-600",
    emoji: "🌿",
    subcats: ["All", "Supplements", "Oils", "Skin Care", "Hair Care", "Teas", "Medicines", "Immunity"],
    brands: ["Patanjali", "Himalaya", "Dabur", "Baidyanath", "Sri Sri Tattva", "Zandu"],
  },
  "Mobiles": {
    gradient: "from-indigo-900 via-indigo-700 to-violet-500",
    emoji: "📲",
    subcats: ["All", "5G Phones", "Budget", "Mid-Range", "Flagship", "Foldables", "Cases", "Chargers"],
    brands: ["Apple", "Samsung", "OnePlus", "Redmi", "Realme", "POCO"],
  },
  "Home & Décor": {
    gradient: "from-teal-900 via-cyan-700 to-teal-400",
    emoji: "🏠",
    subcats: ["All", "Furniture", "Lighting", "Bedding", "Curtains", "Wall Art", "Storage", "Plants"],
    brands: ["Godrej Interio", "Nilkamal", "Pepperfry", "Urban Ladder", "IKEA", "Flipkart SmartBuy"],
  },
};

type PriceRange = { min: number; max: number };

export function CategoryLandingPage({
  category,
  onAdd,
  onWish,
  wish,
  onView,
  setPage,
}: {
  category: string;
  onAdd: (p: Prod) => void;
  onWish: (id: number) => void;
  wish: Set<number>;
  onView: (p: Prod) => void;
  setPage: (p: Page) => void;
}) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META["Electronics"];
  const [subcat, setSubcat] = useState("All");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 999999 });
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const toggleBrand = (b: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      next.has(b) ? next.delete(b) : next.add(b);
      return next;
    });
  };

  const products = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (p.cat !== category) return false;
      if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false;
      if (p.price < priceRange.min || p.price > priceRange.max) return false;
      return true;
    });
  }, [category, selectedBrands, priceRange]);

  const trending = products.slice(0, 4);

  const PRICE_PRESETS = [
    { label: "All", min: 0, max: 999999 },
    { label: "Under ₹1,000", min: 0, max: 1000 },
    { label: "₹1,000–₹10,000", min: 1000, max: 10000 },
    { label: "Above ₹10,000", min: 10000, max: 999999 },
  ];

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Price filter */}
      <div>
        <h3 className="text-sm font-black text-foreground mb-3">Price Range</h3>
        <div className="space-y-2">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setPriceRange({ min: preset.min, max: preset.max })}
              className="w-full flex items-center gap-2 text-xs font-semibold text-left px-3 py-2 rounded-xl border transition-all"
              style={
                priceRange.min === preset.min && priceRange.max === preset.max
                  ? { borderColor: G, background: "#e6fff5", color: G }
                  : { borderColor: "var(--border)", background: "var(--card)", color: "var(--muted-foreground)" }
              }
            >
              {priceRange.min === preset.min && priceRange.max === preset.max
                ? <CheckSquare size={13} style={{ color: G }} />
                : <Square size={13} className="text-muted-foreground" />
              }
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand filter */}
      <div>
        <h3 className="text-sm font-black text-foreground mb-3">Brand</h3>
        <div className="space-y-2">
          {meta.brands.map((brand) => (
            <button
              key={brand}
              onClick={() => toggleBrand(brand)}
              className="w-full flex items-center gap-2 text-xs font-semibold text-left px-3 py-2 rounded-xl border transition-all"
              style={
                selectedBrands.has(brand)
                  ? { borderColor: G, background: "#e6fff5", color: G }
                  : { borderColor: "var(--border)", background: "var(--card)", color: "var(--muted-foreground)" }
              }
            >
              {selectedBrands.has(brand)
                ? <CheckSquare size={13} style={{ color: G }} />
                : <Square size={13} className="text-muted-foreground" />
              }
              {brand}
            </button>
          ))}
        </div>
      </div>

      {selectedBrands.size > 0 && (
        <button
          onClick={() => setSelectedBrands(new Set())}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 border border-red-200 py-2 rounded-xl hover:bg-red-50 transition-colors"
        >
          <X size={12} /> Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <button onClick={() => setPage("home")} className="hover:text-foreground transition-colors font-semibold">
          Home
        </button>
        <ChevronRight size={12} />
        <span className="font-bold" style={{ color: G }}>{category}</span>
      </div>

      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-r ${meta.gradient}`}
        style={{ minHeight: 180 }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 0%, transparent 60%)" }} />
        <div className="relative z-10 p-8 flex flex-col justify-center gap-2" style={{ minHeight: 180 }}>
          <div className="text-5xl mb-1">{meta.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{category}</h1>
          <p className="text-white/80 text-sm font-semibold">10,000+ products · Free delivery available</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            {["Free Returns", "Genuine Products", "COD Available"].map((tag) => (
              <span key={tag} className="text-[10px] font-bold bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Subcategory scroll */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
        {meta.subcats.map((sc) => (
          <motion.button
            key={sc}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSubcat(sc)}
            className="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all shrink-0"
            style={
              subcat === sc
                ? { background: G, color: "#fff", borderColor: G }
                : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }
            }
          >
            {sc}
          </motion.button>
        ))}
      </div>

      {/* Mobile filter button */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <p className="text-sm font-bold text-muted-foreground">{products.length} products</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMobileFilter(true)}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border border-border bg-card"
        >
          <SlidersHorizontal size={13} /> Filter & Sort
        </motion.button>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {showMobileFilter && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)} />
            <motion.div
              className="relative w-full bg-card rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-foreground">Filters</h2>
                <button onClick={() => setShowMobileFilter(false)}>
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>
              <FilterPanel />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileFilter(false)}
                className="w-full mt-6 py-3 rounded-2xl text-white font-black text-sm"
                style={{ background: G }}
              >
                Apply Filters
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content: sidebar + grid */}
      <div className="flex gap-6">
        {/* Sidebar filter — desktop only */}
        <div className="hidden lg:block w-60 shrink-0">
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-4">
            <h2 className="font-black text-foreground mb-5">Filters</h2>
            <FilterPanel />
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {/* Trending section */}
          {trending.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🔥</span>
                <h2 className="text-base font-black text-foreground">
                  Trending in {category}
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {trending.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <CardGrid p={p} onAdd={onAdd} onWish={onWish} wished={wish.has(p.id)} onView={onView} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All products */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-foreground">All Products</h2>
            <span className="text-xs text-muted-foreground">{products.length} results</span>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-5xl">🔍</span>
              <p className="font-black text-foreground">No products match your filters</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelectedBrands(new Set()); setPriceRange({ min: 0, max: 999999 }); }}
                className="text-white px-6 py-2.5 rounded-xl text-sm font-black"
                style={{ background: G }}
              >
                Clear Filters
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CardGrid p={p} onAdd={onAdd} onWish={onWish} wished={wish.has(p.id)} onView={onView} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
