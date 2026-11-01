"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  Search,
  Sparkles,
  Store,
  X,
} from "lucide-react";

type StoreBrand = {
  id: number;
  name: string;
  slug: string;
  category: string;
  logoColor: string;
  logoInit: string;
  logoUrl: string;
  countryFlag: string;
  featured: boolean;
};

function isStoreBrand(value: unknown): value is StoreBrand {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const brand = value as Record<string, unknown>;
  return typeof brand.id === "number" &&
    typeof brand.name === "string" &&
    typeof brand.slug === "string" &&
    typeof brand.category === "string" &&
    typeof brand.logoColor === "string" &&
    typeof brand.logoInit === "string" &&
    typeof brand.logoUrl === "string" &&
    typeof brand.countryFlag === "string" &&
    typeof brand.featured === "boolean";
}

export function BrandDirectoryPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<StoreBrand[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All brands");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBrands() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/brands", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result: unknown = await response.json();
        if (
          !response.ok ||
          !result ||
          typeof result !== "object" ||
          !("success" in result) ||
          result.success !== true ||
          !("brands" in result) ||
          !Array.isArray(result.brands) ||
          !result.brands.every(isStoreBrand)
        ) {
          const message =
            result && typeof result === "object" &&
            "message" in result && typeof result.message === "string"
              ? result.message
              : "Failed to load brands.";
          throw new Error(message);
        }
        setBrands(result.brands);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load brands.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadBrands();
    return () => controller.abort();
  }, [retry]);

  const categories = useMemo(
    () => ["All brands", ...Array.from(new Set(brands.map(brand => brand.category))).sort()],
    [brands]
  );
  const filteredBrands = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return brands.filter(brand =>
      (selectedCategory === "All brands" || brand.category === selectedCategory) &&
      (!query ||
        brand.name.toLocaleLowerCase().includes(query) ||
        brand.category.toLocaleLowerCase().includes(query))
    );
  }, [brands, search, selectedCategory]);
  const featuredBrands = brands.filter(brand => brand.featured);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#102f24] px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-11">
        <div className="absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full bg-[#53d69b]/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 -z-10 h-72 w-72 rounded-full bg-[#d5f36e]/10 blur-3xl" />
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-100">
              <Sparkles size={13} />
              The names you know, all in one place
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200/80">
              Bharat Bazar brand directory
            </p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Good things have a name.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/75">
              Meet the makers and labels behind your everyday favourites. Find a brand that feels like you.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d5f36e] text-[#173c2b]">
              <Store size={20} />
            </span>
            <span>
              <span className="block text-2xl font-black leading-none">{loading ? "—" : brands.length}</span>
              <span className="mt-1 block text-[10px] font-semibold text-emerald-50/70">brands to discover</span>
            </span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-2 text-[10px] font-bold text-emerald-50/80">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            {loading ? "Curating the collection…" : `${featuredBrands.length} featured picks`}
          </span>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            Browse by name or category
          </span>
        </div>
      </section>

      {featuredBrands.length > 0 && !search && selectedCategory === "All brands" && (
        <section aria-labelledby="featured-brands-heading">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#009966]">Handpicked for you</p>
              <h2 id="featured-brands-heading" className="mt-1 text-xl font-black tracking-tight text-foreground">
                Featured brands
              </h2>
            </div>
            <span className="rounded-full bg-[#e6fff5] px-3 py-1.5 text-[10px] font-extrabold text-[#007a52]">
              {featuredBrands.length} picks
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredBrands.slice(0, 3).map((brand, index) => (
              <motion.button
                key={brand.id}
                type="button"
                onClick={() => router.push(`/search?q=${encodeURIComponent(brand.name)}`)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.985 }}
                className="group flex min-h-32 items-center gap-4 rounded-3xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009966]"
              >
                <BrandMark brand={brand} size="large" />
                <span className="min-w-0 flex-1">
                  <span className="mb-1 flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.15em] text-amber-600">
                    <Sparkles size={11} /> Featured
                  </span>
                  <span className="block truncate text-base font-black text-foreground">{brand.name}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{brand.category}</span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6fff5] text-[#007a52] transition-colors group-hover:bg-[#009966] group-hover:text-white">
                  <ArrowRight size={15} />
                </span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="all-brands-heading">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
              <span>Home</span><span aria-hidden="true">/</span><span className="text-[#009966]">Brands</span>
            </div>
            <h2 id="all-brands-heading" className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Explore all brands
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {loading ? "Finding your favourites…" : `${filteredBrands.length} ${filteredBrands.length === 1 ? "brand" : "brands"} to explore`}
            </p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search brands or categories..."
              aria-label="Search brands or categories"
              className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-10 text-xs font-semibold text-foreground outline-none transition focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear brand search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </label>
        </div>

        {categories.length > 1 && (
          <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1" aria-label="Filter brands by category">
            {categories.map(category => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-extrabold transition-colors ${
                    active
                      ? "border-[#009966] bg-[#009966] text-white"
                      : "border-border bg-card text-muted-foreground hover:border-[#009966] hover:text-[#007a52]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}

        {error ? (
          <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p className="font-bold">{error}</p>
            <button
              type="button"
              onClick={() => setRetry(value => value + 1)}
              className="mt-3 font-extrabold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-3xl border border-border bg-card p-3">
                <div className="h-28 animate-pulse rounded-2xl bg-muted" />
                <div className="mx-auto mt-3 h-3 w-2/3 animate-pulse rounded bg-muted" />
                <div className="mx-auto mt-2 h-2 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filteredBrands.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredBrands.map((brand, index) => (
              <motion.button
                key={brand.id}
                type="button"
                onClick={() => router.push(`/search?q=${encodeURIComponent(brand.name)}`)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.025, 0.2) }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009966] sm:p-4"
              >
                <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#e6fff5] transition-transform duration-300 group-hover:scale-150" />
                <span className="relative flex h-28 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-white">
                  <BrandMark brand={brand} size="small" />
                  {brand.featured && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[8px] font-extrabold uppercase tracking-wide text-amber-700">
                      <Sparkles size={9} /> Featured
                    </span>
                  )}
                </span>
                <span className="mt-3 flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-foreground" title={brand.name}>
                      {brand.countryFlag && <span className="mr-1" aria-hidden="true">{brand.countryFlag}</span>}
                      {brand.name}
                    </span>
                    <span className="mt-1 block truncate text-[10px] font-semibold text-muted-foreground">{brand.category}</span>
                  </span>
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-[#009966] group-hover:text-white">
                    <ArrowRight size={13} />
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-5 text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6fff5] text-[#009966]">
              <Search size={22} />
            </span>
            <h3 className="font-black text-foreground">{brands.length ? "No brands found" : "No brands yet"}</h3>
            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              {brands.length
                ? "Try another search or category to find the brand you’re looking for."
                : "New brands will appear here as they join Bharat Bazar."}
            </p>
            {(search || selectedCategory !== "All brands") && (
              <button
                type="button"
                onClick={() => { setSearch(""); setSelectedCategory("All brands"); }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#009966]"
              >
                Show all brands <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}
      </section>

      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-[10px] font-semibold text-muted-foreground">
        <Globe2 size={13} className="text-[#009966]" />
        Proudly bringing trusted names and local favourites together.
        <BadgeCheck size={13} className="text-[#009966]" />
      </div>
    </div>
  );
}

function BrandMark({ brand, size }: { brand: StoreBrand; size: "small" | "large" }) {
  const markSize = size === "large" ? "h-20 w-20" : "h-16 w-16";

  if (brand.logoUrl) {
    return (
      <img
        src={brand.logoUrl}
        alt={`${brand.name} logo`}
        loading="lazy"
        className={`${markSize} object-contain`}
      />
    );
  }

  return (
    <span
      className={`flex ${markSize} items-center justify-center rounded-2xl text-lg font-black text-white shadow-sm`}
      style={{ backgroundColor: brand.logoColor }}
      aria-label={`${brand.name} initials`}
    >
      {brand.logoInit || brand.name.slice(0, 2).toUpperCase()}
    </span>
  );
}
