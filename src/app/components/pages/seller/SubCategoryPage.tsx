"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  Package,
  FolderTree,
  Boxes,
  ChevronDown,
  X,
  SlidersHorizontal,
  Sparkles,
  ArrowUpRight,
  ImageOff,
  Hash,
  Layers,
  TrendingUp,
} from "lucide-react";

/* ══════════════════════════ Types ══════════════════════════ */
type SubCategory = {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  imageUrl: string;
  count: number;
  parentId: number;
  parentName: string;
  parentSlug: string;
  parentEmoji: string;
  parentImageUrl: string;
  groupId: number;
  groupName: string;
  groupColor: string;
};

type SortKey = "name" | "count" | "parent";
type ViewMode = "grid" | "list" | "grouped";

/* ══════════════════════ Image Component ════════════════════ */
function SubCatImage({
  imageUrl,
  emoji,
  color,
  name,
  size = "md",
}: {
  imageUrl: string;
  emoji: string;
  color: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const [err, setErr] = useState(false);
  const cls =
    size === "xs"
      ? "w-9 h-9 text-lg"
      : size === "sm"
      ? "w-12 h-12 text-2xl"
      : size === "md"
      ? "w-16 h-16 text-3xl"
      : "w-20 h-20 text-4xl";

  if (imageUrl && !err) {
    return (
      <div
        className={`${cls} rounded-2xl overflow-hidden flex-shrink-0`}
        style={{ outline: `2px solid ${color}25` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setErr(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${cls} rounded-2xl flex items-center justify-center flex-shrink-0`}
      style={{ background: color + "15", border: `1.5px solid ${color}25` }}
    >
      {emoji || <ImageOff size={16} className="text-gray-300" />}
    </div>
  );
}

/* ══════════════════════ Skeleton Cards ═════════════════════ */
function SkeletonGrid() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse"
        >
          <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-2/3 bg-gray-100 rounded-full" />
            <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
            <div className="flex gap-1.5 mt-2">
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
              <div className="h-5 w-12 bg-gray-100 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function SkeletonList() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 animate-pulse"
        >
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-gray-100 rounded-full" />
            <div className="h-3 w-1/4 bg-gray-100 rounded-full" />
          </div>
          <div className="w-20 h-6 rounded-full bg-gray-100" />
          <div className="w-10 h-6 rounded-full bg-gray-100" />
        </div>
      ))}
    </>
  );
}

/* ═══════════════════════ Grid Card ═════════════════════════ */
function GridCard({
  sub,
  index,
  maxCount,
}: {
  sub: SubCategory;
  index: number;
  maxCount: number;
}) {
  const [imgErr, setImgErr] = useState(false);
  const color = sub.groupColor || "#009966";
  const pct = maxCount > 0 ? Math.min((sub.count / maxCount) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: Math.min(index * 0.03, 0.8),
        type: "spring",
        stiffness: 180,
      }}
      className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* ── Image hero ── */}
      <div
        className="relative h-32 overflow-hidden flex-shrink-0"
        style={{
          background:
            sub.imageUrl && !imgErr
              ? undefined
              : `linear-gradient(135deg, ${color}18 0%, ${color}06 100%)`,
        }}
      >
        {sub.imageUrl && !imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sub.imageUrl}
            alt={sub.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-50 select-none">{sub.emoji}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        {/* Group badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm truncate max-w-[100px] inline-block"
            style={{ background: color + "dd", color: "#fff" }}
          >
            {sub.groupName}
          </span>
        </div>

        {/* Product count */}
        <div className="absolute top-2.5 right-2.5">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 flex items-center gap-0.5">
            <Package size={8} />
            {sub.count}
          </span>
        </div>

        {/* Emoji badge if has image */}
        {sub.imageUrl && !imgErr && (
          <span className="absolute bottom-2 left-3 text-xl">{sub.emoji}</span>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
            {sub.name}
          </h3>
          <ArrowUpRight
            size={13}
            className="text-gray-200 group-hover:text-gray-400 flex-shrink-0 transition-colors mt-0.5"
          />
        </div>

        <p className="font-mono text-[10px] text-gray-400 mb-3">/{sub.slug}</p>

        {/* Parent category chip */}
        <div
          className="inline-flex items-center gap-1.5 self-start px-2 py-1 rounded-xl text-[10px] font-semibold mb-3"
          style={{ background: color + "12", color, border: `1px solid ${color}25` }}
        >
          <span>{sub.parentEmoji}</span>
          <span className="truncate max-w-[90px]">{sub.parentName}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-auto">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-gray-400">Products</span>
            <span className="text-[10px] font-bold" style={{ color }}>
              {sub.count}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${color}80, ${color})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                delay: Math.min(index * 0.03, 0.8) + 0.3,
                duration: 0.7,
                ease: "easeOut",
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════ List Row ══════════════════════════ */
function ListRow({
  sub,
  index,
  maxCount,
}: {
  sub: SubCategory;
  index: number;
  maxCount: number;
}) {
  const color = sub.groupColor || "#009966";
  const pct = maxCount > 0 ? Math.min((sub.count / maxCount) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: Math.min(index * 0.025, 0.5),
        type: "spring",
        stiffness: 200,
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
    >
      <div className="flex items-center gap-3 sm:gap-4 px-4 py-3">
        {/* Left color accent */}
        <div
          className="w-0.5 h-11 rounded-full flex-shrink-0"
          style={{ background: color }}
        />

        {/* Sub-cat image */}
        <SubCatImage
          imageUrl={sub.imageUrl}
          emoji={sub.emoji}
          color={color}
          name={sub.name}
          size="sm"
        />

        {/* Name + slug */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{sub.name}</p>
          <p className="font-mono text-[10px] text-gray-400 truncate">
            /{sub.slug}
          </p>
        </div>

        {/* Parent badge — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: color + "12", color }}
          >
            {sub.parentEmoji} {sub.parentName}
          </span>
        </div>

        {/* Progress bar — desktop only */}
        <div className="hidden lg:block w-24 flex-shrink-0">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                delay: Math.min(index * 0.025, 0.5) + 0.2,
                duration: 0.6,
              }}
            />
          </div>
        </div>

        {/* Count */}
        <div className="text-right flex-shrink-0 w-12">
          <p className="text-sm font-black" style={{ color }}>
            {sub.count}
          </p>
          <p className="text-[9px] text-gray-400">products</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════ Grouped View ═════════════════════════ */
function GroupedSection({
  parentName,
  parentEmoji,
  parentImageUrl,
  color,
  items,
  groupIndex,
  maxCount,
}: {
  parentName: string;
  parentEmoji: string;
  parentImageUrl: string;
  color: string;
  items: SubCategory[];
  groupIndex: number;
  maxCount: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [parentImgErr, setParentImgErr] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: groupIndex * 0.07 }}
      className="mb-6"
    >
      {/* Section header */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center gap-3 mb-3 group"
      >
        {/* Parent image / emoji */}
        <div
          className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 text-xl"
          style={
            parentImageUrl && !parentImgErr
              ? undefined
              : { background: color + "18", border: `1.5px solid ${color}30` }
          }
        >
          {parentImageUrl && !parentImgErr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={parentImageUrl}
              alt={parentName}
              className="w-full h-full object-cover"
              onError={() => setParentImgErr(true)}
            />
          ) : (
            parentEmoji
          )}
        </div>

        <div className="flex-1 text-left">
          <h2 className="text-sm font-black text-gray-800">{parentName}</h2>
          <p className="text-xs text-gray-400">{items.length} sub-categories</p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: color + "18", color }}
          >
            {items.reduce((a, s) => a + s.count, 0)} products
          </span>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform duration-200 ${
              collapsed ? "-rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {/* Divider */}
      <div className="h-px mb-3" style={{ background: color + "30" }} />

      {/* Grid */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map((sub, i) => (
                <GridCard key={sub.id} sub={sub} index={i} maxCount={maxCount} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════ Main Page ═════════════════════════ */
export function SellerSubCategoryPage() {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* filters */
  const [search, setSearch] = useState("");
  const [filterParent, setFilterParent] = useState("All");
  const [filterGroup, setFilterGroup] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [onlyWithProducts, setOnlyWithProducts] = useState(false);
  const [onlyWithImages, setOnlyWithImages] = useState(false);

  /* ui */
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  /* ── Fetch ─────────────────────────────────── */
  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seller/subcategories", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setSubcategories(data.subcategories ?? []);
      } else {
        setError(data.message || "Failed to load sub-categories.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  /* Close on outside click */
  useEffect(() => {
    function h(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setFilterOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Derived data ─────────────────────────── */
  const totalProducts = subcategories.reduce((a, s) => a + s.count, 0);
  const withImages = subcategories.filter((s) => !!s.imageUrl).length;

  const parentNames = useMemo(
    () => Array.from(new Set(subcategories.map((s) => s.parentName))).sort(),
    [subcategories]
  );
  const groupNames = useMemo(
    () => Array.from(new Set(subcategories.map((s) => s.groupName))).sort(),
    [subcategories]
  );

  /* ── Filter + Sort ──────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return subcategories
      .filter((s) => {
        const matchSearch =
          !search ||
          s.name.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q) ||
          s.parentName.toLowerCase().includes(q) ||
          s.groupName.toLowerCase().includes(q);
        const matchParent =
          filterParent === "All" || s.parentName === filterParent;
        const matchGroup =
          filterGroup === "All" || s.groupName === filterGroup;
        const matchProducts = !onlyWithProducts || s.count > 0;
        const matchImages = !onlyWithImages || !!s.imageUrl;
        return (
          matchSearch &&
          matchParent &&
          matchGroup &&
          matchProducts &&
          matchImages
        );
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === "name") cmp = a.name.localeCompare(b.name);
        else if (sortKey === "count") cmp = a.count - b.count;
        else cmp = a.parentName.localeCompare(b.parentName);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [
    subcategories,
    search,
    filterParent,
    filterGroup,
    sortKey,
    sortDir,
    onlyWithProducts,
    onlyWithImages,
  ]);

  /* grouped data for grouped view */
  const grouped = useMemo(() => {
    const map = new Map<string, SubCategory[]>();
    for (const s of filtered) {
      const arr = map.get(s.parentName) ?? [];
      arr.push(s);
      map.set(s.parentName, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const maxCount = Math.max(...subcategories.map((s) => s.count), 1);

  const activeFilterCount =
    (filterParent !== "All" ? 1 : 0) +
    (filterGroup !== "All" ? 1 : 0) +
    (onlyWithProducts ? 1 : 0) +
    (onlyWithImages ? 1 : 0);

  function clearFilters() {
    setFilterParent("All");
    setFilterGroup("All");
    setOnlyWithProducts(false);
    setOnlyWithImages(false);
    setSearch("");
  }

  /* ══════════════════════ Render ══════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 sm:p-6">

      {/* ── HERO HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[#009966] via-[#00b377] to-[#00cc88] rounded-3xl p-6 sm:p-8 mb-6 overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-1/4 w-36 h-36 bg-white/5 rounded-full blur-xl" />
        <div className="absolute top-6 right-32 w-12 h-12 bg-white/10 rounded-full" />
        <div className="absolute bottom-4 right-10 w-6 h-6 bg-white/15 rounded-full" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <FolderTree size={15} className="text-white" />
              </div>
              <span className="text-white/70 text-xs font-semibold tracking-wide uppercase">
                Sub-category Explorer
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Sub-Categories
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {loading
                ? "Loading sub-categories…"
                : `${subcategories.length} sub-categories across ${parentNames.length} parent categories`}
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 disabled:opacity-60 backdrop-blur-sm text-white text-sm font-semibold rounded-xl border border-white/20 transition-all self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          {
            icon: <FolderTree size={18} />,
            label: "Total Sub-categories",
            value: loading ? "—" : subcategories.length,
            color: "#009966",
          },
          {
            icon: <Boxes size={18} />,
            label: "Parent Categories",
            value: loading ? "—" : parentNames.length,
            color: "#0077cc",
          },
          {
            icon: <Package size={18} />,
            label: "Products Mapped",
            value: loading ? "—" : totalProducts,
            color: "#f59e0b",
          },
          {
            icon: <Sparkles size={18} />,
            label: "With Images",
            value: loading ? "—" : withImages,
            color: "#00aa77",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 200 }}
            className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div
              className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
              style={{ background: s.color }}
            />
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: s.color + "18", color: s.color }}
            >
              {s.icon}
            </div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── TOOLBAR ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/15 focus:bg-white transition-all"
              placeholder="Search sub-categories, parent categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((p) => !p)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all"
              style={
                filterOpen || activeFilterCount > 0
                  ? { background: "#009966", color: "#fff", borderColor: "#009966" }
                  : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
              }
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#009966] text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-30 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-900">Filters</p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-[#009966] font-semibold hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Sort */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Sort by
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { key: "name" as SortKey, label: "Name" },
                          { key: "count" as SortKey, label: "Products" },
                          { key: "parent" as SortKey, label: "Parent" },
                        ]
                      ).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => {
                            if (sortKey === key)
                              setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                            else { setSortKey(key); setSortDir("asc"); }
                          }}
                          className="px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                          style={
                            sortKey === key
                              ? { background: "#009966", color: "#fff", borderColor: "#009966" }
                              : { background: "#f9fafb", color: "#6b7280", borderColor: "#e5e7eb" }
                          }
                        >
                          {label}
                          {sortKey === key && (
                            <span className="ml-1">
                              {sortDir === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick toggles */}
                  <div className="space-y-2.5 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Quick filters
                    </p>
                    {[
                      { label: "Has products", value: onlyWithProducts, set: setOnlyWithProducts },
                      { label: "Has images",   value: onlyWithImages,   set: setOnlyWithImages },
                    ].map(({ label, value, set }) => (
                      <label key={label} className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => set((p) => !p)}
                          className="w-9 h-5 rounded-full transition-colors relative flex-shrink-0"
                          style={{ background: value ? "#009966" : "#e5e7eb" }}
                        >
                          <div
                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                            style={{ left: value ? "calc(100% - 18px)" : "2px" }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Parent category filter */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Parent category
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      <button
                        onClick={() => setFilterParent("All")}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                        style={
                          filterParent === "All"
                            ? { background: "#009966", color: "#fff", borderColor: "#009966" }
                            : { background: "#f9fafb", color: "#6b7280", borderColor: "#e5e7eb" }
                        }
                      >
                        All
                      </button>
                      {parentNames.map((p) => (
                        <button
                          key={p}
                          onClick={() =>
                            setFilterParent(filterParent === p ? "All" : p)
                          }
                          className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                          style={
                            filterParent === p
                              ? { background: "#009966", color: "#fff", borderColor: "#009966" }
                              : { background: "#f9fafb", color: "#6b7280", borderColor: "#e5e7eb" }
                          }
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group filter */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Group
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setFilterGroup("All")}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                        style={
                          filterGroup === "All"
                            ? { background: "#009966", color: "#fff", borderColor: "#009966" }
                            : { background: "#f9fafb", color: "#6b7280", borderColor: "#e5e7eb" }
                        }
                      >
                        All
                      </button>
                      {groupNames.map((g) => (
                        <button
                          key={g}
                          onClick={() =>
                            setFilterGroup(filterGroup === g ? "All" : g)
                          }
                          className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                          style={
                            filterGroup === g
                              ? { background: "#009966", color: "#fff", borderColor: "#009966" }
                              : { background: "#f9fafb", color: "#6b7280", borderColor: "#e5e7eb" }
                          }
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View toggle — grid / list / grouped */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            {(
              [
                { mode: "grid" as ViewMode,    icon: <LayoutGrid size={15} />,  title: "Grid" },
                { mode: "list" as ViewMode,    icon: <List size={15} />,        title: "List" },
                { mode: "grouped" as ViewMode, icon: <Layers size={15} />,      title: "Grouped" },
              ]
            ).map(({ mode, icon, title }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={title}
                className="px-3 py-2.5 transition-colors"
                style={
                  viewMode === mode
                    ? { background: "#009966", color: "#fff" }
                    : { color: "#9ca3af" }
                }
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── ACTIVE FILTER CHIPS ── */}
      {(search || activeFilterCount > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap items-center gap-2 mb-4"
        >
          <span className="text-xs text-gray-500 font-medium">Active:</span>
          {search && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium">
              &ldquo;{search}&rdquo;
              <button onClick={() => setSearch("")}><X size={11} /></button>
            </span>
          )}
          {filterParent !== "All" && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium">
              Parent: {filterParent}
              <button onClick={() => setFilterParent("All")}><X size={11} /></button>
            </span>
          )}
          {filterGroup !== "All" && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium">
              {filterGroup}
              <button onClick={() => setFilterGroup("All")}><X size={11} /></button>
            </span>
          )}
          {onlyWithProducts && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">
              Has products
              <button onClick={() => setOnlyWithProducts(false)}><X size={11} /></button>
            </span>
          )}
          {onlyWithImages && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 font-medium">
              Has images
              <button onClick={() => setOnlyWithImages(false)}><X size={11} /></button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </motion.div>
      )}

      {/* ── RESULT BAR ── */}
      {!loading && !error && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-bold text-gray-800">{filtered.length}</span>{" "}
            of{" "}
            <span className="font-bold text-gray-800">
              {subcategories.length}
            </span>{" "}
            sub-categories
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <TrendingUp size={12} />
            <span>
              Sorted by{" "}
              <span className="font-semibold text-gray-600">
                {sortKey === "name" ? "Name" : sortKey === "count" ? "Products" : "Parent"}{" "}
                {sortDir === "asc" ? "↑" : "↓"}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6"
        >
          <Package size={18} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={fetchData}
            className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div
          className={
            viewMode !== "list"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {viewMode !== "list" ? <SkeletonGrid /> : <SkeletonList />}
        </div>
      )}

      {/* ── EMPTY ── */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderTree size={28} className="text-gray-300" />
          </div>
          <p className="text-base font-bold text-gray-700">
            No sub-categories found
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Try different filters or clear your search
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-5 py-2 rounded-xl bg-[#009966] text-white text-sm font-semibold hover:bg-[#00885a] transition-colors"
          >
            Clear filters
          </button>
        </motion.div>
      )}

      {/* ── GRID VIEW ── */}
      {!loading && !error && filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((sub, i) => (
            <GridCard key={sub.id} sub={sub} index={i} maxCount={maxCount} />
          ))}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {!loading && !error && filtered.length > 0 && viewMode === "list" && (
        <div className="flex flex-col gap-2.5">
          {/* Table header */}
          <div className="hidden lg:grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <div className="w-12">Image</div>
            <div>Name</div>
            <div>Parent</div>
            <div className="w-28">Progress</div>
            <div className="w-14 text-right">Products</div>
          </div>
          {filtered.map((sub, i) => (
            <ListRow key={sub.id} sub={sub} index={i} maxCount={maxCount} />
          ))}
        </div>
      )}

      {/* ── GROUPED VIEW ── */}
      {!loading && !error && filtered.length > 0 && viewMode === "grouped" && (
        <div>
          {grouped.map(([parentName, items], gi) => {
            const first = items[0];
            return (
              <GroupedSection
                key={parentName}
                parentName={parentName}
                parentEmoji={first?.parentEmoji ?? "📦"}
                parentImageUrl={first?.parentImageUrl ?? ""}
                color={first?.groupColor ?? "#009966"}
                items={items}
                groupIndex={gi}
                maxCount={maxCount}
              />
            );
          })}
        </div>
      )}

      {/* ── FOOTER ── */}
      {!loading && !error && subcategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-400 pb-2"
        >
          <span className="flex items-center gap-1.5">
            <Hash size={11} />
            {filtered.length} results
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="flex items-center gap-1.5">
            <FolderTree size={11} />
            {subcategories.length} total sub-categories
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="flex items-center gap-1.5">
            <Boxes size={11} />
            {parentNames.length} parent categories
          </span>
        </motion.div>
      )}
    </div>
  );
}
