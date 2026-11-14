"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  Layers,
  Package,
  FolderTree,
  Boxes,
  ChevronDown,
  X,
  SlidersHorizontal,
  Sparkles,
  ArrowUpRight,
  ImageOff,
} from "lucide-react";

/* ─────────────────────────── Types ─────────────────────────── */
type Subcategory = {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  count: number;
};

type Category = {
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

type Group = {
  id: number;
  name: string;
  color: string;
  iconSvg: string;
};

type SortKey = "name" | "count" | "subcats";

/* ─────────────────────── Skeleton ───────────────────────────── */
function SkeletonGrid() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse"
        >
          <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-2/3 bg-gray-100 rounded-full" />
            <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
            <div className="h-2 w-full bg-gray-100 rounded-full mt-3" />
          </div>
        </div>
      ))}
    </>
  );
}

function SkeletonList() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 animate-pulse"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-gray-100 rounded-full" />
            <div className="h-3 w-1/4 bg-gray-100 rounded-full" />
          </div>
          <div className="w-16 h-6 rounded-full bg-gray-100" />
        </div>
      ))}
    </>
  );
}

/* ─────────────────── Category Image ────────────────────────── */
function CatImage({
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
  size?: "sm" | "md" | "lg";
}) {
  const [imgErr, setImgErr] = useState(false);
  const dim =
    size === "sm"
      ? "w-14 h-14"
      : size === "lg"
      ? "w-24 h-24"
      : "w-16 h-16";

  if (imageUrl && !imgErr) {
    return (
      <div
        className={`${dim} rounded-2xl overflow-hidden flex-shrink-0`}
        style={{ outline: `2px solid ${color}30` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgErr(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${dim} rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl`}
      style={{ background: color + "15", border: `1.5px solid ${color}25` }}
    >
      {emoji || <ImageOff size={20} className="text-gray-300" />}
    </div>
  );
}

/* ─────────────────── Stats Card ─────────────────────────────── */
function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-shadow"
    >
      {/* bg glow */}
      <div
        className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: color }}
      />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: color + "18", color }}
      >
        {icon}
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    </motion.div>
  );
}

/* ─────────────────── Grid Card ──────────────────────────────── */
function GridCard({
  cat,
  index,
  maxCount,
}: {
  cat: Category;
  index: number;
  maxCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const color = cat.groupColor || "#009966";
  const pct = maxCount > 0 ? Math.min((cat.count / maxCount) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: Math.min(index * 0.035, 0.7), type: "spring", stiffness: 180 }}
      className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* ── Image hero ── */}
      <div
        className="relative h-36 overflow-hidden flex-shrink-0"
        style={{
          background: cat.imageUrl && !imgErr
            ? undefined
            : `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
        }}
      >
        {cat.imageUrl && !imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cat.imageUrl}
            alt={cat.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-60 select-none">{cat.emoji}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Group badge — top left */}
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={{ background: color + "dd", color: "#fff" }}
          >
            {cat.groupName}
          </span>
        </div>

        {/* Product count pill — top right */}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 flex items-center gap-1">
            <Package size={9} />
            {cat.count}
          </span>
        </div>

        {/* Bottom emoji (if has image) */}
        {cat.imageUrl && !imgErr && (
          <div className="absolute bottom-3 left-3 text-2xl">{cat.emoji}</div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
            {cat.name}
          </h3>
          <ArrowUpRight
            size={14}
            className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-0.5 transition-colors"
          />
        </div>
        <p className="font-mono text-[10px] text-gray-400 mb-3">/{cat.slug}</p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 font-medium">
              Products
            </span>
            <span
              className="text-[10px] font-bold"
              style={{ color }}
            >
              {cat.count}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                delay: Math.min(index * 0.035, 0.7) + 0.3,
                duration: 0.8,
                ease: "easeOut",
              }}
            />
          </div>
        </div>

        {/* Subcategories */}
        {cat.subcategories.length > 0 && (
          <div className="mt-auto">
            <button
              onClick={() => setExpanded((p) => !p)}
              className="flex items-center justify-between w-full text-xs text-gray-500 hover:text-gray-800 transition-colors pt-2 border-t border-gray-50"
            >
              <span className="flex items-center gap-1.5">
                <FolderTree size={11} />
                {cat.subcategories.length} sub-categories
              </span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {cat.subcategories.slice(0, 8).map((sub) => (
                      <span
                        key={sub.id}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-gray-100 bg-gray-50 text-gray-600 flex items-center gap-1"
                      >
                        {sub.emoji} {sub.name}
                        {sub.count > 0 && (
                          <span className="text-gray-400">({sub.count})</span>
                        )}
                      </span>
                    ))}
                    {cat.subcategories.length > 8 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        +{cat.subcategories.length - 8} more
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────── List Row ───────────────────────────────── */
function ListRow({
  cat,
  index,
  maxCount,
}: {
  cat: Category;
  index: number;
  maxCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = cat.groupColor || "#009966";
  const pct = maxCount > 0 ? Math.min((cat.count / maxCount) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), type: "spring", stiffness: 200 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="flex items-center gap-4 px-4 py-3.5">
        {/* Left color bar */}
        <div
          className="w-1 h-12 rounded-full flex-shrink-0"
          style={{ background: color }}
        />

        {/* Image / Emoji */}
        <CatImage
          imageUrl={cat.imageUrl}
          emoji={cat.emoji}
          color={color}
          name={cat.name}
          size="sm"
        />

        {/* Name + slug */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{cat.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="font-mono text-[10px] text-gray-400 truncate">
              /{cat.slug}
            </p>
            <span
              className="hidden sm:inline text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
              style={{ background: color + "18", color }}
            >
              {cat.groupName}
            </span>
          </div>
        </div>

        {/* Progress bar — desktop only */}
        <div className="hidden lg:block w-32">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: Math.min(index * 0.03, 0.5) + 0.2, duration: 0.6 }}
            />
          </div>
        </div>

        {/* Count */}
        <div className="text-right flex-shrink-0 w-14">
          <p className="text-sm font-black" style={{ color }}>
            {cat.count}
          </p>
          <p className="text-[10px] text-gray-400">products</p>
        </div>

        {/* Subcats button */}
        {cat.subcategories.length > 0 ? (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0 px-2 py-1 rounded-lg hover:bg-gray-50"
          >
            <FolderTree size={12} />
            <span className="hidden sm:inline">{cat.subcategories.length}</span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Subcategory strip */}
      <AnimatePresence>
        {expanded && cat.subcategories.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="border-t border-gray-50 px-5 py-3 flex flex-wrap gap-2"
              style={{ background: color + "06" }}
            >
              {cat.subcategories.map((sub) => (
                <span
                  key={sub.id}
                  className="text-xs px-2.5 py-1 rounded-full border text-gray-600 flex items-center gap-1 bg-white"
                  style={{ borderColor: color + "30" }}
                >
                  {sub.emoji} {sub.name}
                  {sub.count > 0 && (
                    <span className="text-gray-400 ml-0.5">({sub.count})</span>
                  )}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════ Main Page ═══════════════════════════════ */
export function SellerCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* filters */
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [onlyWithProducts, setOnlyWithProducts] = useState(false);
  const [onlyWithSubs, setOnlyWithSubs] = useState(false);

  /* ui */
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  /* ── Fetch ───────────────────────────────────────── */
  async function fetchCategories() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories ?? []);
        setGroups(data.groups ?? []);
      } else {
        setError(data.message || "Failed to load categories.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  /* Close filter panel on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Stats ───────────────────────────────────────── */
  const totalProducts = categories.reduce((a, c) => a + c.count, 0);
  const totalSubcats = categories.reduce((a, c) => a + c.subcategories.length, 0);

  /* ── Filter + Sort ───────────────────────────────── */
  const filtered = categories
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.groupName.toLowerCase().includes(q) ||
        c.subcategories.some((s) => s.name.toLowerCase().includes(q));
      const matchGroup = filterGroup === "All" || c.groupName === filterGroup;
      const matchProducts = !onlyWithProducts || c.count > 0;
      const matchSubs = !onlyWithSubs || c.subcategories.length > 0;
      return matchSearch && matchGroup && matchProducts && matchSubs;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "count") cmp = a.count - b.count;
      else cmp = a.subcategories.length - b.subcategories.length;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const maxCount = Math.max(...categories.map((c) => c.count), 1);

  const activeFilterCount =
    (filterGroup !== "All" ? 1 : 0) +
    (onlyWithProducts ? 1 : 0) +
    (onlyWithSubs ? 1 : 0);

  function clearFilters() {
    setFilterGroup("All");
    setOnlyWithProducts(false);
    setOnlyWithSubs(false);
    setSearch("");
  }

  /* ── Render ──────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 sm:p-6">

      {/* ══ HERO HEADER ══ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[#009966] via-[#00b377] to-[#00cc88] rounded-3xl p-6 sm:p-8 mb-6 overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="absolute top-4 right-24 w-16 h-16 bg-white/10 rounded-full" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-white/70 text-xs font-semibold tracking-wide uppercase">
                Marketplace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Category Explorer
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {loading
                ? "Loading categories…"
                : `${categories.length} categories across ${groups.length} groups`}
            </p>
          </div>

          <button
            onClick={fetchCategories}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 disabled:opacity-60 backdrop-blur-sm text-white text-sm font-semibold rounded-xl border border-white/20 transition-all self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* ══ STAT CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          icon={<Layers size={18} />}
          label="Total Categories"
          value={loading ? "—" : categories.length}
          color="#3b82f6"
          delay={0}
        />
        <StatCard
          icon={<Boxes size={18} />}
          label="Category Groups"
          value={loading ? "—" : groups.length}
          color="#009966"
          delay={0.07}
        />
        <StatCard
          icon={<FolderTree size={18} />}
          label="Sub-categories"
          value={loading ? "—" : totalSubcats}
          color="#f59e0b"
          delay={0.14}
        />
        <StatCard
          icon={<Package size={18} />}
          label="Products Mapped"
          value={loading ? "—" : totalProducts}
          color="#8b5cf6"
          delay={0.21}
        />
      </div>

      {/* ══ TOOLBAR ══ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        {/* Row 1: Search + Filter button + View toggle */}
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/15 focus:bg-white transition-all"
              placeholder="Search categories, slugs, groups…"
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

          {/* Filter toggle */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((p) => !p)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all"
              style={
                filterOpen || activeFilterCount > 0
                  ? {
                      background: "#009966",
                      color: "#fff",
                      borderColor: "#009966",
                    }
                  : {
                      background: "#fff",
                      color: "#6b7280",
                      borderColor: "#e5e7eb",
                    }
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
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-gray-200 shadow-xl z-20 p-4"
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
                          { key: "name", label: "Name" },
                          { key: "count", label: "Products" },
                          { key: "subcats", label: "Sub-cats" },
                        ] as { key: SortKey; label: string }[]
                      ).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => {
                            if (sortKey === key) {
                              setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                            } else {
                              setSortKey(key);
                              setSortDir("asc");
                            }
                          }}
                          className="px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                          style={
                            sortKey === key
                              ? {
                                  background: "#009966",
                                  color: "#fff",
                                  borderColor: "#009966",
                                }
                              : {
                                  background: "#f9fafb",
                                  color: "#6b7280",
                                  borderColor: "#e5e7eb",
                                }
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

                  {/* Toggles */}
                  <div className="space-y-2.5 mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Quick filters
                    </p>
                    {[
                      {
                        label: "Has products",
                        value: onlyWithProducts,
                        set: setOnlyWithProducts,
                      },
                      {
                        label: "Has sub-categories",
                        value: onlyWithSubs,
                        set: setOnlyWithSubs,
                      },
                    ].map(({ label, value, set }) => (
                      <label
                        key={label}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div
                          onClick={() => set((p) => !p)}
                          className="w-9 h-5 rounded-full transition-colors relative flex-shrink-0 cursor-pointer"
                          style={{
                            background: value ? "#009966" : "#e5e7eb",
                          }}
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

                  {/* Group */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Group
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
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
                      {groups.map((g) => (
                        <button
                          key={g.id}
                          onClick={() =>
                            setFilterGroup(filterGroup === g.name ? "All" : g.name)
                          }
                          className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
                          style={
                            filterGroup === g.name
                              ? { background: g.color, color: "#fff", borderColor: g.color }
                              : { background: "#f9fafb", color: "#6b7280", borderColor: "#e5e7eb" }
                          }
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <button
              onClick={() => setViewMode("grid")}
              className="px-3 py-2.5 transition-colors"
              style={
                viewMode === "grid"
                  ? { background: "#009966", color: "#fff" }
                  : { color: "#9ca3af" }
              }
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="px-3 py-2.5 transition-colors"
              style={
                viewMode === "list"
                  ? { background: "#009966", color: "#fff" }
                  : { color: "#9ca3af" }
              }
              title="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>


      </div>

      {/* ══ ACTIVE FILTER CHIPS ══ */}
      {(search || activeFilterCount > 0) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-wrap items-center gap-2 mb-4"
        >
          <span className="text-xs text-gray-500 font-medium">Active:</span>
          {search && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium">
              Search: &ldquo;{search}&rdquo;
              <button onClick={() => setSearch("")}>
                <X size={11} />
              </button>
            </span>
          )}
          {filterGroup !== "All" && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-medium">
              {filterGroup}
              <button onClick={() => setFilterGroup("All")}>
                <X size={11} />
              </button>
            </span>
          )}
          {onlyWithProducts && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-medium">
              Has products
              <button onClick={() => setOnlyWithProducts(false)}>
                <X size={11} />
              </button>
            </span>
          )}
          {onlyWithSubs && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">
              Has sub-cats
              <button onClick={() => setOnlyWithSubs(false)}>
                <X size={11} />
              </button>
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

      {/* ══ RESULT COUNT ══ */}
      {!loading && !error && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-bold text-gray-800">{filtered.length}</span>{" "}
            of{" "}
            <span className="font-bold text-gray-800">{categories.length}</span>{" "}
            categories
          </p>
          <p className="text-xs text-gray-400">
            Sorted by{" "}
            <span className="font-semibold text-gray-600">
              {sortKey === "name"
                ? "Name"
                : sortKey === "count"
                ? "Products"
                : "Sub-categories"}{" "}
              {sortDir === "asc" ? "↑" : "↓"}
            </span>
          </p>
        </div>
      )}

      {/* ══ ERROR ══ */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6"
        >
          <Package size={18} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={fetchCategories}
            className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* ══ LOADING ══ */}
      {loading && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {viewMode === "grid" ? <SkeletonGrid /> : <SkeletonList />}
        </div>
      )}

      {/* ══ EMPTY ══ */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-gray-300" />
          </div>
          <p className="text-base font-bold text-gray-700">No categories found</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
            Try a different search term or clear your filters
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-5 py-2 rounded-xl bg-[#009966] text-white text-sm font-semibold hover:bg-[#00885a] transition-colors"
          >
            Clear filters
          </button>
        </motion.div>
      )}

      {/* ══ GRID VIEW ══ */}
      {!loading && !error && filtered.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((cat, i) => (
            <GridCard key={cat.id} cat={cat} index={i} maxCount={maxCount} />
          ))}
        </div>
      )}

      {/* ══ LIST VIEW ══ */}
      {!loading && !error && filtered.length > 0 && viewMode === "list" && (
        <div className="flex flex-col gap-2.5">
          {filtered.map((cat, i) => (
            <ListRow key={cat.id} cat={cat} index={i} maxCount={maxCount} />
          ))}
        </div>
      )}

      {/* ══ FOOTER ══ */}
      {!loading && !error && categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-gray-400 pb-2"
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} ·{" "}
          {categories.length} total categories · {groups.length} groups
        </motion.div>
      )}
    </div>
  );
}
