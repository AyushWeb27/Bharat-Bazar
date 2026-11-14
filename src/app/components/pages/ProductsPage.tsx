"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDownWideNarrow,
  Check,
  ChevronDown,
  Grid2X2,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { CardGrid } from "../cards/CardGrid";
import { CardList } from "../cards/CardList";
import { G } from "../data/index";
import type { Prod } from "../types/index";

type StoreCategory = {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  count: number;
  subcategories: Array<{ id: number; name: string; emoji: string; count: number }>;
};

function isProduct(value: unknown): value is Prod {
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

function isCategory(value: unknown): value is StoreCategory {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const category = value as Record<string, unknown>;
  return typeof category.id === "number" &&
    typeof category.name === "string" &&
    typeof category.slug === "string" &&
    typeof category.emoji === "string" &&
    typeof category.count === "number" &&
    Array.isArray(category.subcategories) &&
    category.subcategories.every(item =>
      item && typeof item === "object" &&
      typeof (item as Record<string, unknown>).id === "number" &&
      typeof (item as Record<string, unknown>).name === "string" &&
      typeof (item as Record<string, unknown>).emoji === "string" &&
      typeof (item as Record<string, unknown>).count === "number"
    );
}

function responseMessage(value: unknown, fallback: string) {
  return value && typeof value === "object" &&
    "message" in value && typeof value.message === "string"
    ? value.message
    : fallback;
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function ProductsPage({ onAdd, onWish, wish, onView }: {
  onAdd: (p: Prod) => void;
  onWish: (id: number) => void;
  wish: Set<number>;
  onView: (p: Prod) => void;
}) {
  const [products, setProducts] = useState<Prod[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("popular");
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");
  const [search, setSearch] = useState("");
  const [brandFilters, setBrandFilters] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(9999999);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [offersOnly, setOffersOnly] = useState(false);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [codOnly, setCodOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      setLoading(true);
      setError("");
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetch("/api/products", { cache: "no-store", signal: controller.signal }),
          fetch("/api/categories", { cache: "no-store", signal: controller.signal }),
        ]);
        const [productResult, categoryResult]: [unknown, unknown] = await Promise.all([
          productResponse.json(),
          categoryResponse.json(),
        ]);

        if (
          !productResponse.ok ||
          !productResult ||
          typeof productResult !== "object" ||
          !("success" in productResult) ||
          productResult.success !== true ||
          !("products" in productResult) ||
          !Array.isArray(productResult.products) ||
          !productResult.products.every(isProduct)
        ) {
          throw new Error(responseMessage(productResult, "Could not load products."));
        }
        if (
          !categoryResponse.ok ||
          !categoryResult ||
          typeof categoryResult !== "object" ||
          !("success" in categoryResult) ||
          categoryResult.success !== true ||
          !("categories" in categoryResult) ||
          !Array.isArray(categoryResult.categories) ||
          !categoryResult.categories.every(isCategory)
        ) {
          throw new Error(responseMessage(categoryResult, "Could not load product categories."));
        }

        setProducts(productResult.products);
        setCategories(categoryResult.categories);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Could not load the product catalog.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadCatalog();
    return () => controller.abort();
  }, [retry]);

  useEffect(() => {
    setSubcategory("All");
  }, [category]);

  const activeCategory = categories.find(item => item.name === category);
  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach(product => {
      if (product.brand.trim()) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);
  const catalogMax = Math.max(1000, products.reduce((highest, product) => Math.max(highest, product.price), 0));

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const filtered = products.filter(product => {
      if (category !== "All" && product.cat.toLocaleLowerCase() !== category.toLocaleLowerCase()) return false;
      if (subcategory !== "All" && product.subcategory?.toLocaleLowerCase() !== subcategory.toLocaleLowerCase()) return false;
      if (brandFilters.length && !brandFilters.includes(product.brand)) return false;
      if (product.price < minPrice || product.price > maxPrice) return false;
      if (inStockOnly && !product.inStock) return false;
      if (offersOnly && product.off <= 0) return false;
      if (freeDeliveryOnly && !product.freeShip) return false;
      if (codOnly && !product.cod) return false;
      if (normalizedSearch && !`${product.name} ${product.brand} ${product.cat} ${product.subcategory}`.toLocaleLowerCase().includes(normalizedSearch)) return false;
      return true;
    });

    return filtered.sort((left, right) => {
      if (sort === "price-asc") return left.price - right.price;
      if (sort === "price-desc") return right.price - left.price;
      if (sort === "rating") return right.rating - left.rating || right.reviews - left.reviews;
      if (sort === "discount") return right.off - left.off;
      return right.reviews - left.reviews || right.off - left.off;
    });
  }, [brandFilters, category, codOnly, freeDeliveryOnly, inStockOnly, maxPrice, minPrice, offersOnly, products, search, sort, subcategory]);

  const activeFilterCount =
    Number(category !== "All") +
    Number(subcategory !== "All") +
    Number(brandFilters.length > 0) +
    Number(minPrice > 0 || maxPrice < 9999999) +
    Number(inStockOnly) +
    Number(offersOnly) +
    Number(freeDeliveryOnly) +
    Number(codOnly);

  const clearFilters = () => {
    setCategory("All");
    setSubcategory("All");
    setBrandFilters([]);
    setMinPrice(0);
    setMaxPrice(9999999);
    setInStockOnly(false);
    setOffersOnly(false);
    setFreeDeliveryOnly(false);
    setCodOnly(false);
    setSearch("");
  };

  const toggleBrand = (brand: string) => {
    setBrandFilters(current =>
      current.includes(brand) ? current.filter(item => item !== brand) : [...current, brand]
    );
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-foreground">Shop by aisle</h2>
            <p className="mt-1 text-[10px] text-muted-foreground">Browse the whole market</p>
          </div>
          <Sparkles size={15} style={{ color: G }} />
        </div>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setCategory("All")}
            aria-pressed={category === "All"}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-extrabold transition-colors ${category === "All" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            <span>✳ All products</span>
            <span className="text-[10px] opacity-70">{products.length}</span>
          </button>
          {categories.filter(item => item.count > 0).map(item => (
            <button
              type="button"
              key={item.id}
              onClick={() => setCategory(item.name)}
              aria-pressed={category === item.name}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${category === item.name ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span aria-hidden="true">{item.emoji}</span>
                <span className="truncate">{item.name}</span>
              </span>
              <span className="text-[10px] opacity-70">{item.count}</span>
            </button>
          ))}
        </div>
        {activeCategory?.subcategories.some(item => item.count > 0) && (
          <div className="mt-3 border-l border-border pl-3">
            <label htmlFor="subcategory-filter" className="mb-1.5 block text-[10px] font-bold text-muted-foreground">Subcategory</label>
            <div className="relative">
              <select
                id="subcategory-filter"
                value={subcategory}
                onChange={event => setSubcategory(event.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-card px-3 py-2.5 pr-8 text-xs font-semibold text-foreground outline-none focus:border-emerald-600"
              >
                <option value="All">All {activeCategory.name}</option>
                {activeCategory.subcategories.filter(item => item.count > 0).map(item => (
                  <option key={item.id} value={item.name}>{item.name} ({item.count})</option>
                ))}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        )}
      </section>

      <div className="h-px bg-border" />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-foreground">Price range</h2>
            <p className="mt-1 text-[10px] text-muted-foreground">{formatPrice(minPrice)} – {formatPrice(Math.min(maxPrice, catalogMax))}</p>
          </div>
          <span className="font-bold" style={{ color: G }}>₹</span>
        </div>
        <div className="space-y-4">
          <label className="block text-[10px] font-semibold text-muted-foreground">
            Minimum price
            <input
              type="range"
              min={0}
              max={catalogMax}
              step={Math.max(1, Math.round(catalogMax / 200))}
              value={Math.min(minPrice, catalogMax)}
              onChange={event => setMinPrice(Math.min(Number(event.target.value), maxPrice))}
              className="mt-2 w-full accent-[#009966]"
            />
          </label>
          <label className="block text-[10px] font-semibold text-muted-foreground">
            Maximum price
            <input
              type="range"
              min={0}
              max={catalogMax}
              step={Math.max(1, Math.round(catalogMax / 200))}
              value={Math.min(maxPrice, catalogMax)}
              onChange={event => setMaxPrice(Math.max(Number(event.target.value), minPrice))}
              className="mt-2 w-full accent-[#009966]"
            />
          </label>
        </div>
      </section>

      {brands.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-foreground">Popular brands</h2>
              {brandFilters.length > 0 && (
                <button type="button" onClick={() => setBrandFilters([])} className="text-[10px] font-bold text-emerald-700 hover:underline dark:text-emerald-400">Clear</button>
              )}
            </div>
            <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
              {brands.map(([brand, count]) => (
                <label key={brand} className="flex cursor-pointer items-center justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={brandFilters.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-3.5 w-3.5 rounded accent-[#009966]"
                    />
                    <span className="truncate text-foreground">{brand}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">{count}</span>
                </label>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="h-px bg-border" />

      <section>
        <h2 className="mb-3 text-[11px] font-black uppercase tracking-[0.16em] text-foreground">Refine your find</h2>
        <div className="space-y-3">
          {[
            ["In stock", inStockOnly, setInStockOnly],
            ["On sale", offersOnly, setOffersOnly],
            ["Free delivery", freeDeliveryOnly, setFreeDeliveryOnly],
            ["Cash on delivery", codOnly, setCodOnly],
          ].map(([label, checked, setter]) => (
            <label key={label as string} className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={checked as boolean}
                onChange={() => (setter as (value: boolean) => void)(!(checked as boolean))}
                className="h-3.5 w-3.5 rounded accent-[#009966]"
              />
              {label as string}
            </label>
          ))}
        </div>
      </section>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-extrabold text-muted-foreground transition-colors hover:border-rose-300 hover:text-rose-600"
        >
          <RotateCcw size={13} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#06291d] px-5 py-5 text-white sm:px-8 sm:py-6">
        <div className="absolute -right-14 -top-24 -z-10 h-72 w-72 rounded-full border-[36px] border-emerald-400/10" />
        <div className="absolute -bottom-36 right-28 -z-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-200">
            <Sparkles size={12} /> Bharat Bazar • The everyday marketplace
          </p>
          <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">
            Good finds. Better prices.
          </h1>
          <p className="mt-1.5 max-w-lg text-xs leading-5 text-emerald-50/75 sm:text-sm">
            Browse the full collection, discover local favorites, and find exactly what you need.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold">{products.length.toLocaleString("en-IN")} products</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold">{categories.filter(item => item.count > 0).length} live aisles</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold">Easy returns • Secure checkout</span>
          </div>
        </div>
      </section>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search products, brands, or categories..."
          aria-label="Search products"
          className="w-full rounded-2xl border border-border bg-card py-2.5 pl-11 pr-11 text-sm text-foreground shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
        />
        {search && (
          <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={15} />
          </button>
        )}
      </div>

      {categories.some(item => item.count > 0) && (
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory("All")}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-extrabold transition-colors ${category === "All" ? "border-[#009966] bg-[#009966] text-white" : "border-border bg-card text-muted-foreground hover:border-emerald-600 hover:text-foreground"}`}
          >
            All departments
          </button>
          {categories.filter(item => item.count > 0).map(item => (
            <button
              type="button"
              key={item.id}
              onClick={() => setCategory(item.name)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-extrabold transition-colors ${category === item.name ? "border-[#009966] bg-[#009966] text-white" : "border-border bg-card text-muted-foreground hover:border-emerald-600 hover:text-foreground"}`}
            >
              <span className="mr-1.5">{item.emoji}</span>{item.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-start gap-5 sm:gap-6">
        <aside className="hidden w-64 shrink-0 self-start lg:block">
          <div className="sticky top-5 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-black text-foreground">Filters</h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Tune the selection</p>
              </div>
              <SlidersHorizontal size={16} style={{ color: G }} />
            </div>
            <FilterPanel />
          </div>
        </aside>

        <section className="min-w-0 flex-1 self-start">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-extrabold text-foreground transition hover:border-emerald-600 lg:hidden"
            >
              <SlidersHorizontal size={14} /> Filters
              {activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#009966] px-1 text-[10px] text-white">{activeFilterCount}</span>}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-foreground">
                {category === "All" ? "Everyday finds" : category}
                <span className="ml-2 text-xs font-medium text-muted-foreground">{visibleProducts.length.toLocaleString("en-IN")} items</span>
              </p>
              {search && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">Matching “{search}”</p>}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="product-sort" className="hidden items-center gap-1.5 text-xs font-bold text-muted-foreground sm:flex">
                <ArrowDownWideNarrow size={14} /> Sort
              </label>
              <select
                id="product-sort"
                value={sort}
                onChange={event => setSort(event.target.value)}
                className="max-w-[160px] rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-emerald-600"
              >
                <option value="popular">Most popular</option>
                <option value="rating">Top rated</option>
                <option value="discount">Biggest discount</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
              <div className="hidden items-center rounded-xl border border-border bg-card p-1 sm:flex">
                <button type="button" onClick={() => setView("grid")} aria-label="Grid view" aria-pressed={view === "grid"} className={`rounded-lg p-1.5 ${view === "grid" ? "bg-[#009966] text-white" : "text-muted-foreground hover:text-foreground"}`}>
                  <Grid2X2 size={15} />
                </button>
                <button type="button" onClick={() => setView("list")} aria-label="List view" aria-pressed={view === "list"} className={`rounded-lg p-1.5 ${view === "list" ? "bg-[#009966] text-white" : "text-muted-foreground hover:text-foreground"}`}>
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {category !== "All" && <button type="button" onClick={() => setCategory("All")} className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">{category}<X size={11} /></button>}
              {brandFilters.map(brand => <button key={brand} type="button" onClick={() => toggleBrand(brand)} className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">{brand}<X size={11} /></button>)}
              {(inStockOnly || offersOnly || freeDeliveryOnly || codOnly) && <span className="rounded-full bg-muted px-3 py-1.5 text-[10px] font-bold text-muted-foreground">{[inStockOnly && "In stock", offersOnly && "On sale", freeDeliveryOnly && "Free delivery", codOnly && "COD"].filter(Boolean).join(" · ")}</span>}
              <button type="button" onClick={clearFilters} className="text-[10px] font-extrabold text-muted-foreground underline underline-offset-2 hover:text-foreground">Clear all</button>
            </div>
          )}

          {error ? (
            <div role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
              <h2 className="font-black text-foreground">The market didn’t load</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
              <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-5 rounded-xl bg-[#009966] px-5 py-2.5 text-xs font-extrabold text-white">Try again</button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="animate-pulse overflow-hidden rounded-3xl border border-border bg-card">
                  <div className="aspect-[4/5] bg-muted" />
                  <div className="space-y-2 p-4">
                    <div className="h-2 w-1/3 rounded bg-muted" />
                    <div className="h-3 w-4/5 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Search size={22} /></div>
              <h2 className="mt-4 text-lg font-black text-foreground">No products match those filters</h2>
              <p className="mt-2 text-sm text-muted-foreground">Try another search or clear a few filters to see more of the market.</p>
              <button type="button" onClick={clearFilters} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#009966] px-5 py-2.5 text-xs font-extrabold text-white">
                <RotateCcw size={13} /> Show all products
              </button>
            </div>
          ) : (
            <motion.div layout className={view === "grid" ? "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-4"}>
              <AnimatePresence mode="popLayout">
                {visibleProducts.map(product => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                  >
                    {view === "grid"
                      ? <CardGrid p={product} onAdd={onAdd} onWish={onWish} wished={wish.has(product.id)} onView={onView} />
                      : <CardList p={product} onAdd={onAdd} onWish={onWish} wished={wish.has(product.id)} onView={onView} />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close filters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/50"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-x-0 bottom-0 z-[100] max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 pb-8 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-foreground">Filters</h2>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{visibleProducts.length} matching products</p>
                </div>
                <button type="button" onClick={() => setFilterOpen(false)} aria-label="Close filters" className="rounded-full bg-muted p-2 text-muted-foreground">
                  <X size={16} />
                </button>
              </div>
              <FilterPanel />
              <button type="button" onClick={() => setFilterOpen(false)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#009966] py-3 text-sm font-black text-white">
                <Check size={15} /> Show {visibleProducts.length} products
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
