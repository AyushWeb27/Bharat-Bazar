import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight, Bell, ChevronLeft, ChevronRight, Zap, Truck, Package,
  RefreshCw, Shield, Headphones,
} from "lucide-react";
import { HeroSlider } from "../HeroSlider/index";
import { CardFlash } from "../cards/CardFlash";
import { CardFeature } from "../cards/CardFeature";
import { CardGrid } from "../cards/CardGrid";
import { TimeSeg } from "../ui/TimeSeg";
import { useCountdown } from "../hooks/useCountdown";
import { G, PRODUCTS } from "../data/index";
import type { Prod, Page } from "../types/index";

type StoreCategory = {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  imageUrl: string;
  count: number;
};

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

type StoreStripBanner = {
  id: number;
  title: string;
  line1: string;
  subtitle: string;
  link: string;
  imageUrl: string;
  gradientFrom: string;
  gradientTo: string;
};

function isStoreCategory(value: unknown): value is StoreCategory {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const category = value as Record<string, unknown>;
  return typeof category.id === "number" && typeof category.name === "string" &&
    typeof category.slug === "string" && typeof category.emoji === "string" &&
    typeof category.imageUrl === "string" && typeof category.count === "number";
}

function isStoreBrand(value: unknown): value is StoreBrand {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const brand = value as Record<string, unknown>;
  return typeof brand.id === "number" && typeof brand.name === "string" &&
    typeof brand.slug === "string" && typeof brand.category === "string" &&
    typeof brand.logoColor === "string" && typeof brand.logoInit === "string" &&
    typeof brand.logoUrl === "string" && typeof brand.countryFlag === "string" &&
    typeof brand.featured === "boolean";
}

function isStoreStripBanner(value: unknown): value is StoreStripBanner {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const banner = value as Record<string, unknown>;
  return typeof banner.id === "number" && typeof banner.title === "string" &&
    typeof banner.line1 === "string" && typeof banner.subtitle === "string" &&
    typeof banner.link === "string" && typeof banner.imageUrl === "string" &&
    typeof banner.gradientFrom === "string" && typeof banner.gradientTo === "string";
}

export function HomePage({ onAdd, onWish, wish, onView, setPage }: {
  onAdd:(p:Prod)=>void; onWish:(id:number)=>void; wish:Set<number>; onView:(p:Prod)=>void; setPage:(p:Page)=>void;
}) {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryRailPaused, setCategoryRailPaused] = useState(false);
  const [brands, setBrands] = useState<StoreBrand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandsError, setBrandsError] = useState("");
  const [brandRailPaused, setBrandRailPaused] = useState(false);
  const [stripBanners, setStripBanners] = useState<StoreStripBanner[]>([]);
  const [stripRailPaused, setStripRailPaused] = useState(false);
  const categoriesRailRef = useRef<HTMLDivElement>(null);
  const brandsRailRef = useRef<HTMLDivElement>(null);
  const stripRailRef = useRef<HTMLDivElement>(null);
  const stripDragRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number; dragged: boolean } | null>(null);
  const cd = useCountdown(5*3600+47*60+18);
  const featured3 = PRODUCTS.slice(0, 3);
  const flashDeals = [PRODUCTS[0], PRODUCTS[4], PRODUCTS[7], PRODUCTS[8], PRODUCTS[9], PRODUCTS[10]];

  useEffect(() => {
    const controller = new AbortController();
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", { cache: "no-store", signal: controller.signal });
        const result: unknown = await response.json();
        if (!response.ok || !result || typeof result !== "object" || !("success" in result) ||
            result.success !== true || !("categories" in result) || !Array.isArray(result.categories) ||
            !result.categories.every(isStoreCategory)) {
          const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
            ? result.message : "Failed to load categories.";
          throw new Error(message);
        }
        setCategories(result.categories);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load storefront categories:", error);
          setCategoriesError(error instanceof Error ? error.message : "Failed to load categories.");
        }
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      }
    }
    void loadCategories();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadBrands() {
      try {
        const response = await fetch("/api/brands", { cache: "no-store", signal: controller.signal });
        const result: unknown = await response.json();
        if (!response.ok || !result || typeof result !== "object" || !("success" in result) ||
            result.success !== true || !("brands" in result) || !Array.isArray(result.brands) ||
            !result.brands.every(isStoreBrand)) {
          const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
            ? result.message : "Failed to load brands.";
          throw new Error(message);
        }
        setBrands(result.brands);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load storefront brands:", error);
          setBrandsError(error instanceof Error ? error.message : "Failed to load brands.");
        }
      } finally {
        if (!controller.signal.aborted) setBrandsLoading(false);
      }
    }
    void loadBrands();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadStripBanners() {
      try {
        const response = await fetch("/api/banners?type=strip", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result: unknown = await response.json();
        if (!response.ok || !result || typeof result !== "object" || !("success" in result) ||
            result.success !== true || !("banners" in result) || !Array.isArray(result.banners) ||
            !result.banners.every(isStoreStripBanner)) {
          const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
            ? result.message : "Failed to load promotional banners.";
          throw new Error(message);
        }
        setStripBanners(result.banners);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load storefront strip banners:", error);
        }
      }
    }
    void loadStripBanners();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const rail = categoriesRailRef.current;
    if (!rail || categoriesLoading || categoriesError || categories.length < 2 || categoryRailPaused) return;

    const interval = window.setInterval(() => {
      const currentRail = categoriesRailRef.current;
      if (!currentRail) return;
      const maxScroll = currentRail.scrollWidth - currentRail.clientWidth;
      if (maxScroll <= 0) return;
      if (currentRail.scrollLeft >= maxScroll - 2) {
        currentRail.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      const firstCard = currentRail.firstElementChild;
      const cardWidth = firstCard instanceof HTMLElement ? firstCard.offsetWidth : 0;
      const gap = Number.parseFloat(getComputedStyle(currentRail).columnGap) || 0;
      currentRail.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
    }, 3500);

    return () => window.clearInterval(interval);
  }, [categories.length, categoriesError, categoriesLoading, categoryRailPaused]);

  useEffect(() => {
    const rail = stripRailRef.current;
    if (!rail || stripBanners.length < 2 || stripRailPaused) return;

    const interval = window.setInterval(() => {
      const currentRail = stripRailRef.current;
      if (!currentRail) return;
      const maxScroll = currentRail.scrollWidth - currentRail.clientWidth;
      if (maxScroll <= 0) return;
      if (currentRail.scrollLeft >= maxScroll - 2) {
        currentRail.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      const firstCard = currentRail.firstElementChild;
      const cardWidth = firstCard instanceof HTMLElement ? firstCard.offsetWidth : 0;
      const gap = Number.parseFloat(getComputedStyle(currentRail).columnGap) || 0;
      currentRail.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
    }, 3500);

    return () => window.clearInterval(interval);
  }, [stripBanners.length, stripRailPaused]);

  useEffect(() => {
    const rail = brandsRailRef.current;
    if (!rail || brands.length < 2 || brandRailPaused) return;

    const interval = window.setInterval(() => {
      const currentRail = brandsRailRef.current;
      if (!currentRail) return;
      const maxScroll = currentRail.scrollWidth - currentRail.clientWidth;
      if (maxScroll <= 0) return;
      if (currentRail.scrollLeft >= maxScroll - 2) {
        currentRail.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }
      const firstCard = currentRail.firstElementChild;
      const cardWidth = firstCard instanceof HTMLElement ? firstCard.offsetWidth : 0;
      const gap = Number.parseFloat(getComputedStyle(currentRail).columnGap) || 0;
      currentRail.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
    }, 3500);

    return () => window.clearInterval(interval);
  }, [brands.length, brandRailPaused]);

  const slideCategories = (direction: -1 | 1) => {
    const rail = categoriesRailRef.current;
    if (rail) rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  const slideBrands = (direction: -1 | 1) => {
    const rail = brandsRailRef.current;
    if (rail) rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  const handleStripWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const rail = stripRailRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (delta === 0) return;
    event.preventDefault();
    rail.scrollLeft += delta;
  };

  return (
    <div className="space-y-8">
      {/* ── HERO ── */}
      <HeroSlider onShop={() => setPage("products")} />

      {/* ── CATEGORIES ── */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-foreground md:text-xl">🛍️ Shop by Category</h2>
            <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">Explore our popular categories</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => setPage("products")} className="flex items-center gap-1 text-xs font-bold hover:underline" style={{ color:G }}>
              View All <ArrowRight size={11}/>
            </button>
            {!categoriesLoading && !categoriesError && categories.length > 4 && (
              <div className="ml-1 flex items-center gap-1">
                <button type="button" aria-label="Scroll categories left" onClick={() => slideCategories(-1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-[#009966] hover:text-[#009966]">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" aria-label="Scroll categories right" onClick={() => slideCategories(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-[#009966] hover:text-[#009966]">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
        {categoriesLoading ? (
          <div className="flex gap-3 overflow-hidden" aria-label="Loading categories">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-36 w-28 shrink-0 animate-pulse rounded-2xl bg-muted sm:h-40 sm:w-32" />
            ))}
          </div>
        ) : categoriesError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {categoriesError}
          </p>
        ) : categories.length ? (
          <div ref={categoriesRailRef}
            onMouseEnter={() => setCategoryRailPaused(true)}
            onMouseLeave={() => setCategoryRailPaused(false)}
            onFocusCapture={() => setCategoryRailPaused(true)}
            onBlurCapture={event => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setCategoryRailPaused(false);
              }
            }}
            onTouchStart={() => setCategoryRailPaused(true)}
            onTouchEnd={() => setCategoryRailPaused(false)}
            className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2"
            aria-label="Browse categories">
            {categories.map(cat => (
              <motion.button key={cat.id} whileHover={{ y:-4 }} whileTap={{ scale:0.97 }}
                onClick={() => setPage("products")}
                className="group flex w-28 shrink-0 snap-start flex-col items-center overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:border-[#009966] hover:shadow-md sm:w-32 md:w-36">
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-muted">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl transition-transform duration-300 group-hover:scale-110" aria-hidden="true">{cat.emoji}</span>
                  )}
                </div>
                <div className="w-full px-2.5 py-2 text-center">
                  <p className="truncate text-[10px] font-black leading-tight text-foreground sm:text-xs" title={cat.name}>{cat.name}</p>
                  <p className="mt-1 text-[9px] text-muted-foreground">{cat.count.toLocaleString("en-IN")} products</p>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
            No active categories are available.
          </p>
        )}
      </section>

      {/* ── SHOP BY BRAND ── */}
      {(brandsLoading || brandsError || brands.length > 0) && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-foreground md:text-xl">🛍️ Shop by Brand</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">Discover trusted brands across the store</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => setPage("products")} className="flex items-center gap-1 text-xs font-bold hover:underline" style={{ color: G }}>
                View Products <ArrowRight size={11} />
              </button>
              {!brandsLoading && !brandsError && brands.length > 4 && (
                <div className="ml-1 flex items-center gap-1">
                  <button type="button" aria-label="Scroll brands left"
                    onClick={() => slideBrands(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-[#009966] hover:text-[#009966]">
                    <ChevronLeft size={16} />
                  </button>
                  <button type="button" aria-label="Scroll brands right"
                    onClick={() => slideBrands(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-[#009966] hover:text-[#009966]">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          {brandsLoading ? (
            <div className="flex gap-3 overflow-hidden" aria-label="Loading brands">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-36 w-36 shrink-0 animate-pulse rounded-2xl bg-muted sm:w-40" />
              ))}
            </div>
          ) : brandsError ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {brandsError}
            </p>
          ) : brands.length ? (
            <div ref={brandsRailRef}
              onMouseEnter={() => setBrandRailPaused(true)}
              onMouseLeave={() => setBrandRailPaused(false)}
              onFocusCapture={() => setBrandRailPaused(true)}
              onBlurCapture={event => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setBrandRailPaused(false);
                }
              }}
              onTouchStart={() => setBrandRailPaused(true)}
              onTouchEnd={() => setBrandRailPaused(false)}
              onTouchCancel={() => setBrandRailPaused(false)}
              className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2"
              aria-label="Browse brands">
              {brands.map(brand => (
                <motion.button key={brand.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setPage("products")}
                  className="group flex w-36 shrink-0 snap-start flex-col items-center rounded-2xl border border-border bg-card p-3 text-center shadow-sm transition-all hover:border-[#009966] hover:shadow-md sm:w-40">
                  <div className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-white p-3">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={`${brand.name} logo`} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-black text-white"
                        style={{ backgroundColor: brand.logoColor }}>
                        {brand.logoInit || brand.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    {brand.featured && (
                      <span className="absolute right-1 top-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-2 w-full truncate text-xs font-black text-foreground" title={brand.name}>
                    {brand.countryFlag && <span className="mr-1" aria-hidden="true">{brand.countryFlag}</span>}
                    {brand.name}
                  </p>
                  <p className="mt-0.5 w-full truncate text-[10px] text-muted-foreground">{brand.category}</p>
                </motion.button>
              ))}
            </div>
          ) : null}
        </section>
      )}

      {/* ── FLASH SALE ── */}
      <section className="rounded-2xl overflow-hidden" style={{ background:"linear-gradient(135deg,#000 0%,#111 40%,#001f14 100%)" }}>
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><Zap size={18} className="text-yellow-400 fill-yellow-400"/><span className="text-white font-black text-xl">⚡ Flash Sale</span></div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
                <div className="flex items-center gap-0.5"><TimeSeg v={cd.h} u="hrs"/><span className="text-white font-black text-lg mb-5">:</span><TimeSeg v={cd.m} u="min"/><span className="text-white font-black text-lg mb-5">:</span><TimeSeg v={cd.s} u="sec"/></div>
              </div>
            </div>
            <button onClick={() => setPage("products")} className="text-xs font-black flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color:G }}>View All <ArrowRight size={11}/></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {flashDeals.map(p => <CardFlash key={p.id} p={p} onAdd={onAdd} onView={onView}/>)}
          </div>
        </div>
      </section>

      {/* ── FEATURED (CardFeature) ── */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-lg md:text-xl font-black text-foreground">🌟 Featured This Week</h2>
          <button onClick={() => setPage("products")} className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color:G }}>See All <ArrowRight size={11}/></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featured3.map(p => <CardFeature key={p.id} p={p} onAdd={onAdd} onWish={onWish} wished={wish.has(p.id)} onView={onView}/>)}
        </div>
      </section>

      {/* ── DATABASE PROMOTION BANNERS ── */}
      {stripBanners.length > 0 && (
        <div ref={stripRailRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onMouseEnter={() => setStripRailPaused(true)}
          onMouseLeave={() => setStripRailPaused(false)}
          onTouchStart={() => setStripRailPaused(true)}
          onTouchEnd={() => setStripRailPaused(false)}
          onTouchCancel={() => setStripRailPaused(false)}
          onWheel={handleStripWheel}
          onPointerDown={event => {
            if (event.pointerType !== "mouse" || event.button !== 0) return;
            stripDragRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              startScrollLeft: event.currentTarget.scrollLeft,
              dragged: false,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={event => {
            const drag = stripDragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            const distance = event.clientX - drag.startX;
            if (Math.abs(distance) > 5) {
              drag.dragged = true;
              event.currentTarget.scrollLeft = drag.startScrollLeft - distance;
            }
          }}
          onPointerUp={event => {
            if (stripDragRef.current?.pointerId !== event.pointerId) return;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            window.setTimeout(() => {
              stripDragRef.current = null;
            }, 0);
          }}
          onPointerCancel={() => {
            stripDragRef.current = null;
          }}
          onClickCapture={event => {
            if (!stripDragRef.current?.dragged) return;
            event.preventDefault();
            event.stopPropagation();
            stripDragRef.current = null;
          }}
          onFocusCapture={() => setStripRailPaused(true)}
          onBlurCapture={() => setStripRailPaused(false)}
          style={{ cursor: "grab", touchAction: "pan-x" }}
          aria-label="Promotional banners">
          {stripBanners.map(banner => (
            <motion.button key={banner.id} whileHover={{ scale:1.02, y:-3 }} whileTap={{ scale:0.98 }}
              onClick={() => banner.link
                ? window.location.assign(banner.link)
                : setPage("products")}
              className="relative h-32 w-[min(84vw,22rem)] shrink-0 snap-start overflow-hidden rounded-2xl text-left shadow-lg sm:w-[22rem]"
              style={{ background: `linear-gradient(135deg, ${banner.gradientFrom}, ${banner.gradientTo})` }}>
              {banner.imageUrl && (
                <img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <p className="text-base font-black text-white drop-shadow-lg">{banner.line1 || banner.title}</p>
                <p className="text-xs text-white/85">{banner.subtitle}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* ── NEW ARRIVALS GRID ── */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-lg md:text-xl font-black text-foreground">🆕 New Arrivals</h2>
          <button onClick={() => setPage("products")} className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color:G }}>View All <ArrowRight size={11}/></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PRODUCTS.slice(4, 8).map(p => <CardGrid key={p.id} p={p} onAdd={onAdd} onWish={onWish} wished={wish.has(p.id)} onView={onView}/>)}
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="bg-card border border-border rounded-2xl px-4 py-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon:Truck,      label:"Free Delivery",  sub:"Orders ≥ ₹499",     color:"#009966" },
          { icon:Package,    label:"COD Available",  sub:"Pay on delivery",    color:"#f59e0b" },
          { icon:RefreshCw,  label:"Easy Returns",   sub:"10-day window",      color:"#0ea5e9" },
          { icon:Shield,     label:"100% Authentic", sub:"Genuine products",   color:"#8b5cf6" },
          { icon:Headphones, label:"24×7 Support",   sub:"Hindi & English",    color:"#ec4899" },
        ].map(({ icon:Icon, label, sub, color }) => (
          <motion.div key={label} whileHover={{ y:-2 }} className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: color+"18" }}>
              <Icon size={16} style={{ color }}/>
            </div>
            <div>
              <p className="text-xs font-black text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── NEWSLETTER ── */}
      <section className="rounded-2xl overflow-hidden relative" style={{ background:"linear-gradient(135deg,#003d28 0%,#009966 60%,#00cc88 100%)" }}>
        <div className="relative p-8 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3"><Bell size={22} className="text-white"/></div>
          <h2 className="text-2xl font-black text-white">Get Exclusive Offers First!</h2>
          <p className="text-white/70 text-sm mt-1 mb-5">Join 5 Crore+ shoppers. Get ₹200 cashback on first order.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="tel" placeholder="📱 Enter Mobile Number" className="flex-1 bg-white/15 border border-white/30 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/60 transition-colors"/>
            <button className="bg-white font-black px-6 py-3 rounded-xl text-sm shrink-0 hover:bg-white/90 transition-colors" style={{ color:G }}>Subscribe 🎉</button>
          </div>
        </div>
      </section>
    </div>
  );
}
