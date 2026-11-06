import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight, Bell, ChevronLeft, ChevronRight, Zap, Truck, Package,
  RefreshCw, Shield, Headphones, Clock3, Gift, ShoppingBag, Sparkles,
} from "lucide-react";
import { HeroSlider } from "../HeroSlider/index";
import { CardFlash } from "../cards/CardFlash";
import { CardFeature } from "../cards/CardFeature";
import { CardGrid } from "../cards/CardGrid";
import { TimeSeg } from "../ui/TimeSeg";
import { G, PRODUCTS } from "../data/index";
import { fmt } from "../utils/format";
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

type StoreFlashSale = {
  id: number;
  name: string;
  endDate: string;
  products: Prod[];
};

type StoreDailyDeal = {
  dealId: number;
  featured: boolean;
  product: Prod;
};

function isFlashSaleProduct(value: unknown): value is Prod {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const product = value as Record<string, unknown>;
  return typeof product.id === "number" && typeof product.name === "string" &&
    typeof product.brand === "string" && typeof product.price === "number" &&
    typeof product.mrp === "number" && typeof product.off === "number" &&
    typeof product.img === "string" && typeof product.inStock === "boolean" &&
    typeof product.rating === "number" && typeof product.reviews === "number" &&
    typeof product.cat === "string" && typeof product.cod === "boolean" &&
    typeof product.emi === "boolean" && typeof product.freeShip === "boolean" &&
    typeof product.tag === "string" && typeof product.tagClr === "string" &&
    typeof product.img2 === "string" && typeof product.desc === "string" &&
    Array.isArray(product.sizes) && Boolean(product.spec && typeof product.spec === "object");
}

function isStoreFlashSale(value: unknown): value is StoreFlashSale {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const sale = value as Record<string, unknown>;
  return typeof sale.id === "number" && typeof sale.name === "string" &&
    typeof sale.endDate === "string" && !Number.isNaN(Date.parse(sale.endDate)) &&
    Array.isArray(sale.products) && sale.products.every(isFlashSaleProduct);
}

function isStoreDailyDeal(value: unknown): value is StoreDailyDeal {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const deal = value as Record<string, unknown>;
  return typeof deal.dealId === "number" && typeof deal.featured === "boolean" &&
    isFlashSaleProduct(deal.product);
}

function FlashSaleCountdown({ endDate }: { endDate: string }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const remaining = Math.max(0, new Date(endDate).getTime() - now);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  return (
    <div className="flex items-center gap-0.5">
      <TimeSeg v={String(hours).padStart(2, "0")} u="hrs" />
      <span className="mb-5 text-lg font-black text-white">:</span>
      <TimeSeg v={String(minutes).padStart(2, "0")} u="min" />
      <span className="mb-5 text-lg font-black text-white">:</span>
      <TimeSeg v={String(seconds).padStart(2, "0")} u="sec" />
    </div>
  );
}

function DealOfDayCountdown() {
  const [remaining, setRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }).formatToParts(new Date());
      const values = Object.fromEntries(parts.map(part => [part.type, Number(part.value)]));
      const secondsLeft = Math.max(
        0,
        86_400 - (values.hour * 3600 + values.minute * 60 + values.second)
      );
      setRemaining({
        hours: Math.floor(secondsLeft / 3600),
        minutes: Math.floor((secondsLeft % 3600) / 60),
        seconds: secondsLeft % 60,
      });
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5" aria-label="Deal ends in">
      {[
        { value: remaining.hours, label: "HRS" },
        { value: remaining.minutes, label: "MIN" },
        { value: remaining.seconds, label: "SEC" },
      ].map(({ value, label }, index) => (
        <div key={label} className="flex items-center gap-1.5">
          {index > 0 && <span className="mb-4 text-lg font-black text-white/50">:</span>}
          <div className="min-w-[48px] rounded-xl border border-white/10 bg-white/10 px-2 py-1.5 text-center backdrop-blur">
            <p className="font-mono text-lg font-black leading-none text-white tabular-nums">
              {String(value).padStart(2, "0")}
            </p>
            <p className="mt-1 text-[8px] font-bold tracking-widest text-white/55">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

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
  const router = useRouter();
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
  const [flashSale, setFlashSale] = useState<StoreFlashSale | null>(null);
  const [flashSaleLoading, setFlashSaleLoading] = useState(true);
  const [flashSaleError, setFlashSaleError] = useState("");
  const [dailyDeals, setDailyDeals] = useState<StoreDailyDeal[]>([]);
  const [dailyDealsLoading, setDailyDealsLoading] = useState(true);
  const [dailyDealsError, setDailyDealsError] = useState("");
  const categoriesRailRef = useRef<HTMLDivElement>(null);
  const brandsRailRef = useRef<HTMLDivElement>(null);
  const stripRailRef = useRef<HTMLDivElement>(null);
  const stripDragRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number; dragged: boolean } | null>(null);
  const featured3 = PRODUCTS.slice(0, 3);
  const featuredDailyDeal = dailyDeals.find(deal => deal.featured) || dailyDeals[0];
  const dealOfDay = featuredDailyDeal?.product;
  const dealDiscount = dealOfDay?.off || 0;
  const otherDailyDeals = dailyDeals.filter(deal => deal !== featuredDailyDeal);

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
    async function loadDailyDeals() {
      try {
        const response = await fetch("/api/deal-of-day", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result: unknown = await response.json();
        if (!response.ok || !result || typeof result !== "object" ||
            !("success" in result) || result.success !== true ||
            !("deals" in result) || !Array.isArray(result.deals) ||
            !result.deals.every(isStoreDailyDeal)) {
          const message = result && typeof result === "object" && "message" in result &&
            typeof result.message === "string" ? result.message : "Failed to load today's deals.";
          throw new Error(message);
        }
        setDailyDeals(result.deals);
        setDailyDealsError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load storefront Deal of the Day:", error);
          setDailyDealsError(error instanceof Error ? error.message : "Failed to load today's deals.");
        }
      } finally {
        if (!controller.signal.aborted) setDailyDealsLoading(false);
      }
    }
    void loadDailyDeals();
    const refreshInterval = window.setInterval(() => void loadDailyDeals(), 60_000);
    return () => {
      controller.abort();
      window.clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadFlashSale() {
      try {
        const response = await fetch("/api/flash-sales", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result: unknown = await response.json();
        if (!response.ok || !result || typeof result !== "object" ||
            !("success" in result) || result.success !== true ||
            !("sale" in result) ||
            (result.sale !== null && !isStoreFlashSale(result.sale))) {
          const message = result && typeof result === "object" && "message" in result &&
            typeof result.message === "string" ? result.message : "Failed to load flash sale.";
          throw new Error(message);
        }
        setFlashSale(result.sale as StoreFlashSale | null);
        setFlashSaleError("");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load storefront flash sale:", error);
          setFlashSaleError(error instanceof Error ? error.message : "Failed to load flash sale.");
        }
      } finally {
        if (!controller.signal.aborted) setFlashSaleLoading(false);
      }
    }
    void loadFlashSale();
    const refreshInterval = window.setInterval(() => void loadFlashSale(), 60_000);
    return () => {
      controller.abort();
      window.clearInterval(refreshInterval);
    };
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
            <button onClick={() => setPage("category")} className="flex items-center gap-1 text-xs font-bold hover:underline" style={{ color:G }}>
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
                onClick={() => router.push(`/category/${encodeURIComponent(cat.name)}`)}
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
              <button onClick={() => setPage("brands")} className="flex items-center gap-1 text-xs font-bold hover:underline" style={{ color: G }}>
                View All Brands <ArrowRight size={11} />
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
      {flashSaleLoading ? (
        <section aria-label="Loading flash sale" className="h-48 animate-pulse rounded-2xl bg-zinc-900" />
      ) : flashSaleError ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {flashSaleError}
        </p>
      ) : flashSale && flashSale.products.length > 0 ? (
        <section className="overflow-hidden rounded-2xl"
          style={{ background: "linear-gradient(135deg,#000 0%,#111 40%,#001f14 100%)" }}>
          <div className="p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Zap size={18} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-black text-white">⚡ {flashSale.name}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <FlashSaleCountdown endDate={flashSale.endDate} />
                </div>
              </div>
              <button onClick={() => setPage("products")}
                className="flex items-center gap-1 text-xs font-black transition-opacity hover:opacity-80"
                style={{ color: G }}>
                View All <ArrowRight size={11} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {flashSale.products.map(product => (
                <CardFlash key={product.id} p={product} onAdd={onAdd} onView={onView} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── DEAL OF THE DAY ── */}
      {dailyDealsLoading ? (
        <section aria-label="Loading Deal of the Day" className="h-80 animate-pulse rounded-2xl bg-emerald-950" />
      ) : dailyDealsError ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dailyDealsError}
        </p>
      ) : dealOfDay ? (
      <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-emerald-900/10 bg-[#071b14] shadow-xl">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_25%,rgba(0,230,118,0.22),transparent_38%),radial-gradient(ellipse_at_90%_85%,rgba(250,204,21,0.13),transparent_34%)]" />
        <div className="grid min-h-[390px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden px-6 py-8 sm:px-10 lg:min-h-[430px]">
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/10 sm:h-80 sm:w-80" />
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-2xl sm:h-64 sm:w-64" />
            <motion.button
              type="button"
              aria-label={`View Deal of the Day: ${dealOfDay.name}`}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              onClick={() => onView(dealOfDay)}
              className="relative z-10 h-64 w-full max-w-[390px] cursor-pointer bg-transparent text-left sm:h-80 lg:h-[350px]"
            >
              <img
                src={dealOfDay.img}
                alt={dealOfDay.name}
                className="h-full w-full object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.5)]"
              />
              <span className="absolute left-2 top-4 inline-flex rotate-[-8deg] items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-lg shadow-rose-950/30">
                <Gift size={14} /> Deal of the Day
              </span>
              {dealDiscount > 0 && (
                <span className="absolute bottom-2 right-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center shadow-lg backdrop-blur-md">
                  <span className="block text-2xl font-black leading-none text-amber-300">{dealDiscount}%</span>
                  <span className="mt-1 block text-[9px] font-black uppercase tracking-widest text-white/75">off today</span>
                </span>
              )}
            </motion.button>
          </div>

          <div className="flex flex-col justify-center px-6 pb-8 sm:px-10 lg:px-8 lg:py-12 xl:px-12">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
                <Sparkles size={13} className="text-amber-300" /> Today&apos;s handpicked deal
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/55">
                <Clock3 size={13} className="text-amber-300" /> Ends in
                <DealOfDayCountdown />
              </div>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300/70">{dealOfDay.brand}</p>
            <h2 className="mt-2 max-w-xl text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
              {dealOfDay.name}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">
              A standout pick at a special price for today. Don&apos;t miss your chance to bring it home for less.
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
              <span className="text-3xl font-black tracking-tight text-emerald-300 sm:text-4xl">{fmt(dealOfDay.price)}</span>
              <span className="pb-1 text-base font-semibold text-white/40 line-through">{fmt(dealOfDay.mrp)}</span>
              {dealDiscount > 0 && (
                <span className="mb-1 rounded-lg bg-amber-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-950">
                  Save {fmt(dealOfDay.mrp - dealOfDay.price)}
                </span>
              )}
            </div>

            <div className="mt-6 max-w-md">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold">
                <span className="inline-flex items-center gap-1.5 text-white/60">
                  <ShoppingBag size={12} /> Availability
                </span>
                <span className="text-amber-200">
                  {dealOfDay.inStock ? `${dealOfDay.stock ?? 0} in stock` : "Out of stock"}
                </span>
              </div>
              <p className="text-xs text-white/50">Special price available until midnight (India time).</p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!dealOfDay.inStock}
                onClick={() => onAdd(dealOfDay)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-black text-emerald-950 shadow-lg shadow-emerald-950/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag size={16} /> {dealOfDay.inStock ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                type="button"
                onClick={() => onView(dealOfDay)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white"
              >
                Explore Deal <ArrowRight size={15} />
              </button>
            </div>
            <p className="mt-4 text-[10px] font-medium text-white/40">Offer valid for today (India time).</p>
          </div>
        </div>
        <div className="border-t border-white/10 bg-black/20 px-5 py-6 sm:px-8 lg:px-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-300/70">More picks for today</p>
              <h3 className="mt-1 text-lg font-black text-white sm:text-xl">Today&apos;s extra deals</h3>
            </div>
            <span className="text-[10px] font-semibold text-white/45">Handpicked offers · Valid today</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {otherDailyDeals.map(({ dealId, product }, index) => {
              const discount = product.off;
              return (
                <motion.article
                  key={dealId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => onView(product)}
                  className="group flex min-w-0 cursor-pointer items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-3 transition-colors hover:border-emerald-300/30 hover:bg-white/[0.075]"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white/[0.06] sm:h-28 sm:w-28">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {discount > 0 && (
                      <span className="absolute left-1.5 top-1.5 rounded-md bg-rose-500 px-1.5 py-1 text-[9px] font-black text-white">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-300/70">
                      {product.brand}
                    </p>
                    <h4 className="mt-1 line-clamp-2 text-sm font-extrabold leading-snug text-white">
                      {product.name}
                    </h4>
                    <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                      <span className="text-base font-black text-emerald-300">{fmt(product.price)}</span>
                      {product.mrp > product.price && (
                        <span className="text-[10px] font-semibold text-white/40 line-through">{fmt(product.mrp)}</span>
                      )}
                    </div>
                    <button type="button" disabled={!product.inStock}
                      onClick={event => { event.stopPropagation(); onAdd(product); }}
                      className="mt-2 rounded-lg bg-emerald-400 px-2.5 py-1.5 text-[10px] font-black text-emerald-950 disabled:opacity-50">
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                  <span aria-hidden="true" className="mr-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-emerald-200 transition-all group-hover:border-emerald-300/30 group-hover:bg-emerald-300/10 sm:flex">
                    <ArrowRight size={14} />
                  </span>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
      ) : null}

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
