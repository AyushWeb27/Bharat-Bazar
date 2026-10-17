import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, X, TrendingUp } from "lucide-react";
import { CardGrid } from "../cards/CardGrid";
import { PRODUCTS, CATEGORIES, G } from "../data/index";
import type { Prod } from "../types/index";

type SortKey = "best" | "price-asc" | "price-desc" | "rating" | "newest";
type PriceRange = "all" | "under500" | "500-2000" | "2000-10000" | "above10000";
type RatingFilter = "all" | "4plus" | "3plus";

export function SearchResultsPage({
  query,
  onAdd,
  onWish,
  wish,
  onView,
}: {
  query: string;
  onAdd: (p: Prod) => void;
  onWish: (id: number) => void;
  wish: Set<number>;
  onView: (p: Prod) => void;
}) {
  const [sort, setSort] = useState<SortKey>("best");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const categoryNames = ["All", ...CATEGORIES.map((c) => c.name)];

  const results = useMemo(() => {
    let prods = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.cat.toLowerCase().includes(query.toLowerCase()) ||
        p.desc.toLowerCase().includes(query.toLowerCase())
    );

    if (activeCategory !== "All") {
      prods = prods.filter((p) => p.cat === activeCategory);
    }

    if (priceRange === "under500") prods = prods.filter((p) => p.price < 500);
    else if (priceRange === "500-2000") prods = prods.filter((p) => p.price >= 500 && p.price <= 2000);
    else if (priceRange === "2000-10000") prods = prods.filter((p) => p.price > 2000 && p.price <= 10000);
    else if (priceRange === "above10000") prods = prods.filter((p) => p.price > 10000);

    if (ratingFilter === "4plus") prods = prods.filter((p) => p.rating >= 4);
    else if (ratingFilter === "3plus") prods = prods.filter((p) => p.rating >= 3);

    if (sort === "price-asc") prods = [...prods].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") prods = [...prods].sort((a, b) => b.price - a.price);
    else if (sort === "rating") prods = [...prods].sort((a, b) => b.rating - a.rating);
    else if (sort === "newest") prods = [...prods].sort((a, b) => b.id - a.id);

    return prods;
  }, [query, sort, activeCategory, priceRange, ratingFilter]);

  const SORTS: { key: SortKey; label: string }[] = [
    { key: "best", label: "Best Match" },
    { key: "price-asc", label: "Price: Low → High" },
    { key: "price-desc", label: "Price: High → Low" },
    { key: "rating", label: "Rating" },
    { key: "newest", label: "Newest" },
  ];

  const PRICE_FILTERS: { key: PriceRange; label: string }[] = [
    { key: "under500", label: "Under ₹500" },
    { key: "500-2000", label: "₹500–₹2,000" },
    { key: "2000-10000", label: "₹2,000–₹10,000" },
    { key: "above10000", label: "Above ₹10,000" },
  ];

  const SUGGESTIONS = ["iPhone 15", "Apple", "Smartphone", "Electronics", "Samsung"];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-black text-foreground">
            Results for{" "}
            <span style={{ color: G }}>'{query}'</span>
          </h1>
          <span
            className="text-xs font-black px-2.5 py-1 rounded-full text-white"
            style={{ background: G }}
          >
            {results.length} products
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border border-border bg-card hover:border-[#009966] transition-colors md:hidden"
        >
          <SlidersHorizontal size={13} /> Filters
        </motion.button>
      </div>

      {/* Sort bar */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
        {SORTS.map((s) => (
          <motion.button
            key={s.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSort(s.key)}
            className="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all shrink-0"
            style={
              sort === s.key
                ? { background: G, color: "#fff", borderColor: G }
                : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }
            }
          >
            {s.label}
          </motion.button>
        ))}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
        {categoryNames.map((c) => (
          <motion.button
            key={c}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(c)}
            className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all shrink-0"
            style={
              activeCategory === c
                ? { background: G, color: "#fff", borderColor: G }
                : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }
            }
          >
            {c}
          </motion.button>
        ))}
      </div>

      {/* Price range + rating filters */}
      <AnimatePresence>
        {(showFilters || true) && (
          <motion.div
            className="flex flex-wrap gap-2 mb-4"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {PRICE_FILTERS.map((pf) => (
              <motion.button
                key={pf.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPriceRange(priceRange === pf.key ? "all" : pf.key)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                style={
                  priceRange === pf.key
                    ? { background: "#fff7ed", color: "#f97316", borderColor: "#f97316" }
                    : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }
                }
              >
                {pf.label}
              </motion.button>
            ))}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setRatingFilter(ratingFilter === "4plus" ? "all" : "4plus")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
              style={
                ratingFilter === "4plus"
                  ? { background: "#fefce8", color: "#ca8a04", borderColor: "#ca8a04" }
                  : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }
              }
            >
              ⭐ 4★ & above
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setRatingFilter(ratingFilter === "3plus" ? "all" : "3plus")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
              style={
                ratingFilter === "3plus"
                  ? { background: "#fefce8", color: "#ca8a04", borderColor: "#ca8a04" }
                  : { background: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" }
              }
            >
              ⭐ 3★ & above
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestion chips */}
      {results.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp size={12} /> Related:
          </span>
          {SUGGESTIONS.map((s) => (
            <span
              key={s}
              className="text-xs font-semibold px-3 py-1 rounded-full border border-border bg-muted/50 text-muted-foreground cursor-pointer hover:border-[#009966] hover:text-foreground transition-colors"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Results grid or empty state */}
      <AnimatePresence mode="wait">
        {results.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <span className="text-6xl">😔</span>
            <p className="text-xl font-black text-foreground">
              No products found for '{query}'
            </p>
            <p className="text-sm text-muted-foreground">Check spelling or try broader keywords</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCategory("All");
                setPriceRange("all");
                setRatingFilter("all");
              }}
              className="flex items-center gap-2 text-white px-6 py-2.5 rounded-xl text-sm font-black mt-2"
              style={{ background: G }}
            >
              <X size={14} /> Clear Filters
            </motion.button>
            <div className="flex gap-2 flex-wrap justify-center mt-2">
              {SUGGESTIONS.map((s) => (
                <span
                  key={s}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-card cursor-pointer hover:border-[#009966] transition-colors"
                >
                  Try: {s}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {results.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <CardGrid
                    p={p}
                    onAdd={onAdd}
                    onWish={onWish}
                    wished={wish.has(p.id)}
                    onView={onView}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
