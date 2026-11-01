"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  Check,
  ChevronRight,
  Layers3,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CardGrid } from "../cards/CardGrid";
import { G } from "../data/index";
import type { Prod, Page } from "../types/index";

type Subcategory = {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  imageUrl: string;
  count: number;
};

type StoreCategory = {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  imageUrl: string;
  count: number;
  groupId: number;
  groupName: string;
  groupColor: string;
  subcategories: Subcategory[];
};

type PricePreset = {
  label: string;
  min: number;
  max: number;
};

const PRICE_PRESETS: PricePreset[] = [
  { label: "Any price", min: 0, max: 999999 },
  { label: "Under ₹1,000", min: 0, max: 1000 },
  { label: "₹1,000 – ₹10,000", min: 1000, max: 10000 },
  { label: "Above ₹10,000", min: 10000, max: 999999 },
];

function isSubcategory(value: unknown): value is Subcategory {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const subcategory = value as Record<string, unknown>;
  return typeof subcategory.id === "number" &&
    typeof subcategory.name === "string" &&
    typeof subcategory.slug === "string" &&
    typeof subcategory.emoji === "string" &&
    typeof subcategory.imageUrl === "string" &&
    typeof subcategory.count === "number";
}

function isStoreCategory(value: unknown): value is StoreCategory {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const category = value as Record<string, unknown>;
  return typeof category.id === "number" &&
    typeof category.name === "string" &&
    typeof category.slug === "string" &&
    typeof category.emoji === "string" &&
    typeof category.imageUrl === "string" &&
    typeof category.count === "number" &&
    typeof category.groupId === "number" &&
    typeof category.groupName === "string" &&
    typeof category.groupColor === "string" &&
    Array.isArray(category.subcategories) &&
    category.subcategories.every(isSubcategory);
}

function isStoreProduct(value: unknown): value is Prod {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const product = value as Record<string, unknown>;
  return typeof product.id === "number" &&
    typeof product.name === "string" &&
    typeof product.brand === "string" &&
    typeof product.cat === "string" &&
    typeof product.subcategory === "string" &&
    typeof product.price === "number" &&
    typeof product.mrp === "number" &&
    typeof product.rating === "number" &&
    typeof product.reviews === "number" &&
    typeof product.off === "number" &&
    typeof product.cod === "boolean" &&
    typeof product.emi === "boolean" &&
    typeof product.freeShip === "boolean" &&
    typeof product.inStock === "boolean" &&
    typeof product.tag === "string" &&
    typeof product.tagClr === "string" &&
    typeof product.img === "string" &&
    typeof product.img2 === "string" &&
    typeof product.desc === "string" &&
    Array.isArray(product.sizes) &&
    product.sizes.every(size => typeof size === "string") &&
    Boolean(product.spec && typeof product.spec === "object" && !Array.isArray(product.spec));
}

function matchesSubcategory(product: Prod, subcategory: string) {
  return product.subcategory?.trim().toLocaleLowerCase() === subcategory.trim().toLocaleLowerCase();
}

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
  const router = useRouter();
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [storeProducts, setStoreProducts] = useState<Prod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [subcategory, setSubcategory] = useState("All");
  const [priceRange, setPriceRange] = useState<PricePreset>(PRICE_PRESETS[0]);
  const [sort, setSort] = useState("popular");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategoryData() {
      setLoading(true);
      setError("");
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch("/api/categories", { cache: "no-store", signal: controller.signal }),
          fetch(`/api/products?category=${encodeURIComponent(category)}`, {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);
        const [result, productResult]: [unknown, unknown] = await Promise.all([
          categoryResponse.json(),
          productResponse.json(),
        ]);
        if (
          !categoryResponse.ok ||
          !result ||
          typeof result !== "object" ||
          !("success" in result) ||
          result.success !== true ||
          !("categories" in result) ||
          !Array.isArray(result.categories) ||
          !result.categories.every(isStoreCategory)
        ) {
          const message =
            result && typeof result === "object" &&
            "message" in result && typeof result.message === "string"
              ? result.message
              : "Failed to load category details.";
          throw new Error(message);
        }
        setCategories(result.categories);
        if (
          !productResponse.ok ||
          !productResult ||
          typeof productResult !== "object" ||
          !("success" in productResult) ||
          productResult.success !== true ||
          !("products" in productResult) ||
          !Array.isArray(productResult.products) ||
          !productResult.products.every(isStoreProduct)
        ) {
          const message =
            productResult && typeof productResult === "object" &&
            "message" in productResult && typeof productResult.message === "string"
              ? productResult.message
              : "Failed to load category products.";
          throw new Error(message);
        }
        setStoreProducts(productResult.products);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load category details.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadCategoryData();
    return () => controller.abort();
  }, [category, retry]);

  useEffect(() => {
    setSubcategory("All");
    setPriceRange(PRICE_PRESETS[0]);
    setSort("popular");
  }, [category]);

  const currentCategory = categories.find(item =>
    item.name.toLocaleLowerCase() === category.toLocaleLowerCase() ||
    item.slug.toLocaleLowerCase() === category.toLocaleLowerCase()
  );
  const subcategories = currentCategory?.subcategories ?? [];
  const products = useMemo(() => {
    const matchingProducts = storeProducts.filter(product => {
      if (subcategory !== "All" && !matchesSubcategory(product, subcategory)) return false;
      return product.price >= priceRange.min && product.price <= priceRange.max;
    });

    return matchingProducts.sort((left, right) => {
      if (sort === "price-asc") return left.price - right.price;
      if (sort === "price-desc") return right.price - left.price;
      if (sort === "rating") return right.rating - left.rating;
      return right.reviews - left.reviews;
    });
  }, [priceRange, sort, storeProducts, subcategory]);

  const clearFilters = () => {
    setSubcategory("All");
    setPriceRange(PRICE_PRESETS[0]);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.14em] text-foreground">Shop this aisle</h2>
            <p className="mt-1 text-[10px] text-muted-foreground">Choose a subcategory</p>
          </div>
          <Layers3 size={15} className="text-[#009966]" />
        </div>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setSubcategory("All")}
            aria-pressed={subcategory === "All"}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-extrabold transition-colors ${
              subcategory === "All" ? "bg-[#e6fff5] text-[#007a52]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2"><span>✳</span> All {currentCategory?.name ?? category}</span>
            {subcategory === "All" && <Check size={14} />}
          </button>
          {subcategories.map(item => {
            const active = subcategory === item.name;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSubcategory(item.name)}
                aria-pressed={active}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                  active ? "bg-[#e6fff5] text-[#007a52]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="text-sm" aria-hidden="true">{item.emoji}</span>
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[9px] opacity-70">
                  {item.count > 0 && item.count}
                  {active && <Check size={13} />}
                </span>
              </button>
            );
          })}
          {!loading && !error && !subcategories.length && (
            <p className="rounded-xl bg-muted/60 px-3 py-3 text-[10px] leading-4 text-muted-foreground">
              No active subcategories are available for this category yet.
            </p>
          )}
        </div>
      </section>

      <div className="h-px bg-border" />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.14em] text-foreground">Price range</h2>
            <p className="mt-1 text-[10px] text-muted-foreground">Find a fit for your budget</p>
          </div>
          <span className="text-[#009966]">₹</span>
        </div>
        <div className="space-y-1.5">
          {PRICE_PRESETS.map(preset => {
            const active = priceRange.label === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setPriceRange(preset)}
                aria-pressed={active}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-[11px] font-bold transition-colors ${
                  active
                    ? "border-[#009966]/30 bg-[#e6fff5] text-[#007a52]"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted"
                }`}
              >
                {preset.label}
                <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${active ? "border-[#009966] bg-[#009966] text-white" : "border-border"}`}>
                  {active && <Check size={10} />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {(subcategory !== "All" || priceRange.label !== "Any price") && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2.5 text-xs font-extrabold text-red-500 transition-colors hover:bg-red-50"
        >
          <X size={13} /> Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground">
        <button type="button" onClick={() => setPage("home")} className="transition-colors hover:text-foreground">Home</button>
        <ChevronRight size={12} />
        <button type="button" onClick={() => router.push("/category")} className="transition-colors hover:text-foreground">Categories</button>
        <ChevronRight size={12} />
        <span className="font-extrabold text-[#009966]">{currentCategory?.name ?? category}</span>
      </div>

      <motion.header
        key={category}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative isolate overflow-hidden rounded-[2rem] bg-[#102f24] text-white shadow-lg"
      >
        {currentCategory?.imageUrl && (
          <img
            src={currentCategory.imageUrl}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102f24] via-[#174835]/95 to-[#1d6448]/75" />
        <div className="absolute -right-12 -top-24 -z-10 h-72 w-72 rounded-full bg-[#78e4ad]/20 blur-3xl" />
        <div className="grid gap-6 px-5 py-7 sm:px-8 sm:py-9 md:grid-cols-[1fr_auto] md:items-end lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-emerald-100">
              <Sparkles size={12} />
              {currentCategory?.groupName || "Made for your everyday"}
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-3xl backdrop-blur">
                {currentCategory?.emoji || "🛍️"}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/70">Now exploring</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                  {currentCategory?.name ?? category}
                </h1>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-xs leading-5 text-emerald-50/75 sm:text-sm">
              Find a new favourite, compare the details, and discover something made just for you.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d5f36e] text-[#173c2b]">
              <Layers3 size={18} />
            </span>
            <span>
              <span className="block text-xl font-black leading-none">{loading ? "—" : subcategories.length}</span>
              <span className="mt-1 block text-[9px] font-semibold text-emerald-50/70">ways to explore</span>
            </span>
          </div>
        </div>
      </motion.header>

      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-bold">{error}</p>
          <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-2 text-xs font-extrabold underline">
            Try again
          </button>
        </div>
      ) : !loading && !currentCategory ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This category is not currently available. Browse all categories to see what’s in store.
          <button type="button" onClick={() => router.push("/category")} className="ml-1 font-extrabold underline">Browse categories</button>
        </div>
      ) : (
        <>
          <div className="flex gap-5 lg:items-start">
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-24 rounded-3xl border border-border bg-card p-4 shadow-sm">
                <FilterPanel />
              </div>
            </aside>

            <section className="min-w-0 flex-1">
              {subcategories.length > 0 && (
                <div className="mb-5">
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#009966]">Pick your path</p>
                      <h2 className="mt-1 text-base font-black text-foreground">Popular aisles</h2>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">{subcategories.length} subcategories</span>
                  </div>
                  <div className="scrollbar-hide flex snap-x gap-2.5 overflow-x-auto pb-2">
                    {subcategories.map(item => {
                      const active = subcategory === item.name;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSubcategory(active ? "All" : item.name)}
                          aria-pressed={active}
                          className={`group flex min-w-32 snap-start items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                            active
                              ? "border-[#009966] bg-[#e6fff5]"
                              : "border-border bg-card hover:border-[#009966]/50"
                          }`}
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${active ? "bg-white" : "bg-muted"}`}>
                            {item.emoji}
                          </span>
                          <span className="min-w-0">
                            <span className={`block max-w-32 truncate text-[10px] font-extrabold ${active ? "text-[#007a52]" : "text-foreground"}`}>{item.name}</span>
                            <span className="mt-0.5 block text-[9px] text-muted-foreground">{item.count} items</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3.5 py-3 sm:px-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6fff5] text-[#009966] lg:hidden">
                    <Layers3 size={16} />
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-foreground">
                      {subcategory === "All" ? currentCategory?.name : subcategory}
                    </h2>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {loading ? "Finding products..." : `${products.length} ${products.length === 1 ? "product" : "products"} to explore`}
                    </p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[10px] font-extrabold text-foreground lg:hidden"
                  >
                    <SlidersHorizontal size={13} /> Filters
                  </button>
                  <label className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-2 text-[10px] font-bold text-muted-foreground">
                    <ArrowDownWideNarrow size={13} />
                    <span className="sr-only">Sort products</span>
                    <select value={sort} onChange={event => setSort(event.target.value)} className="max-w-32 bg-transparent text-foreground outline-none">
                      <option value="popular">Popular</option>
                      <option value="rating">Top rated</option>
                      <option value="price-asc">Price: low to high</option>
                      <option value="price-desc">Price: high to low</option>
                    </select>
                  </label>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={index} className="overflow-hidden rounded-3xl border border-border bg-card p-3">
                      <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
                      <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  <AnimatePresence mode="popLayout">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ delay: Math.min(index * 0.025, 0.18) }}
                      >
                        <CardGrid
                          p={product}
                          onAdd={onAdd}
                          onWish={onWish}
                          wished={wish.has(product.id)}
                          onView={onView}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-5 text-center">
                  <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6fff5] text-2xl">
                    {subcategory === "All" ? currentCategory?.emoji ?? "🛍️" : subcategories.find(item => item.name === subcategory)?.emoji ?? "🔎"}
                  </span>
                  <h3 className="font-black text-foreground">
                    {subcategory === "All" ? "A new collection is on its way" : `Nothing in ${subcategory} just yet`}
                  </h3>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                    {subcategory === "All"
                      ? "There are no products in this category yet. Check back soon for fresh finds."
                      : "Try another aisle or clear the filters to see all products in this category."}
                  </p>
                  {(subcategory !== "All" || priceRange.label !== "Any price") && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#009966] px-4 py-2 text-xs font-extrabold text-white"
                    >
                      Clear filters <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>

          <AnimatePresence>
            {showMobileFilters && (
              <>
                <motion.button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setShowMobileFilters(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[90] bg-black/50"
                />
                <motion.section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="mobile-filters-title"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 280 }}
                  className="fixed inset-x-0 bottom-0 z-[100] max-h-[85vh] overflow-y-auto rounded-t-[2rem] border-t border-border bg-card p-5 shadow-2xl"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#009966]">Make it yours</p>
                      <h2 id="mobile-filters-title" className="mt-1 text-lg font-black text-foreground">Filters</h2>
                    </div>
                    <button type="button" onClick={() => setShowMobileFilters(false)} aria-label="Close filters" className="rounded-full bg-muted p-2 text-muted-foreground">
                      <X size={17} />
                    </button>
                  </div>
                  <FilterPanel />
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#009966] py-3 text-sm font-black text-white"
                  >
                    Show {products.length} products <ArrowRight size={15} />
                  </button>
                </motion.section>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
