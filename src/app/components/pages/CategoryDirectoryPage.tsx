"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight,
  ChevronRight,
  Layers3,
  Search,
  Sparkles,
  X,
} from "lucide-react";

type CategoryGroup = {
  id: number;
  name: string;
  color: string;
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
};

function isCategoryGroup(value: unknown): value is CategoryGroup {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const group = value as Record<string, unknown>;
  return typeof group.id === "number" &&
    typeof group.name === "string" &&
    typeof group.color === "string";
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
    typeof category.groupColor === "string";
}

export function CategoryDirectoryPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/categories", {
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
          !("groups" in result) ||
          !Array.isArray(result.groups) ||
          !result.groups.every(isCategoryGroup) ||
          !("categories" in result) ||
          !Array.isArray(result.categories) ||
          !result.categories.every(isStoreCategory)
        ) {
          const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
            ? result.message
            : "Failed to load categories.";
          throw new Error(message);
        }
        setGroups(result.groups);
        setCategories(result.categories);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load categories.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadCategories();
    return () => controller.abort();
  }, [retry]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return categories.filter(category =>
      (selectedGroup === null || category.groupId === selectedGroup) &&
      (!query || category.name.toLocaleLowerCase().includes(query) ||
        category.groupName.toLocaleLowerCase().includes(query))
    );
  }, [categories, search, selectedGroup]);

  const selectedGroupName = groups.find(group => group.id === selectedGroup)?.name;
  const totalProducts = filteredCategories.reduce((total, category) => total + category.count, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#102f24] px-5 py-7 text-white sm:px-8 sm:py-9 lg:px-10">
        <div className="absolute -right-12 -top-24 -z-10 h-72 w-72 rounded-full bg-[#53d69b]/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 -z-10 h-64 w-64 rounded-full bg-[#d5f36e]/10 blur-3xl" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-100">
              <Sparkles size={13} />
              Made for your everyday
            </div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200/80">Bharat Bazar collections</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Find your kind of wonderful.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/75">
              From everyday essentials to something special, explore every corner of the bazaar.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d5f36e] text-[#173c2b]">
              <Layers3 size={19} />
            </div>
            <div>
              <p className="text-xl font-black leading-none">{loading ? "—" : categories.length}</p>
              <p className="mt-1 text-[10px] font-semibold text-emerald-50/70">ways to explore</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <aside className="shrink-0 lg:sticky lg:top-24 lg:self-start lg:w-64">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between px-2">
              <div>
                <h2 className="text-sm font-black text-foreground">Shop collections</h2>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Browse by group</p>
              </div>
              <Layers3 size={16} className="text-[#009966]" />
            </div>
            <nav aria-label="Category groups" className="scrollbar-hide flex gap-2 overflow-x-auto pb-1 lg:max-h-[calc(100vh-16rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1">
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                aria-pressed={selectedGroup === null}
                className={`flex shrink-0 items-center justify-between gap-4 rounded-2xl px-3.5 py-3 text-left text-xs font-extrabold transition-colors lg:w-full ${
                  selectedGroup === null
                    ? "bg-[#e6fff5] text-[#007a52]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2.5"><span className="text-base">✳</span> All categories</span>
                <span className="text-[10px] opacity-70">{categories.length}</span>
              </button>
              {groups.map(group => {
                const groupCount = categories.filter(category => category.groupId === group.id).length;
                const active = selectedGroup === group.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setSelectedGroup(group.id)}
                    aria-pressed={active}
                    className={`flex shrink-0 items-center justify-between gap-4 rounded-2xl px-3.5 py-3 text-left text-xs font-bold transition-colors lg:w-full ${
                      active
                        ? "bg-[#e6fff5] text-[#007a52]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                      {group.name}
                    </span>
                    <span className="text-[10px] opacity-70">{groupCount}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-4 hidden rounded-2xl bg-[#f3faf5] p-3.5 lg:block">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#007a52]">A little something for everyone</p>
              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">Thoughtfully grouped so your next great find is never far away.</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <span>Home</span><ChevronRight size={12} /><span className="text-[#009966]">Categories</span>
                {selectedGroupName && <><ChevronRight size={12} /><span className="text-foreground">{selectedGroupName}</span></>}
              </div>
              <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {selectedGroupName || "Explore all categories"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {loading ? "Finding the right aisle for you..." : `${filteredCategories.length} categories · ${totalProducts.toLocaleString("en-IN")} products`}
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                type="search"
                placeholder="Search categories..."
                aria-label="Search categories"
                className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-10 text-xs font-semibold text-foreground outline-none transition focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/10"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {error ? (
            <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              <p className="font-bold">{error}</p>
              <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-3 font-extrabold underline underline-offset-4">Try again</button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="animate-pulse overflow-hidden rounded-3xl border border-border bg-card">
                  <div className="aspect-[1.2] bg-muted" />
                  <div className="space-y-2 p-4"><div className="h-3 w-2/3 rounded bg-muted" /><div className="h-2 w-1/3 rounded bg-muted" /></div>
                </div>
              ))}
            </div>
          ) : filteredCategories.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filteredCategories.map((category, index) => (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => router.push(`/category/${encodeURIComponent(category.name)}`)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.035, 0.25) }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group overflow-hidden rounded-3xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009966]"
                >
                  <div className="relative aspect-[1.2] overflow-hidden bg-[#f2f5f0]">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                        {category.emoji}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-extrabold text-[#173c2b] shadow-sm backdrop-blur">
                      {category.count.toLocaleString("en-IN")} items
                    </span>
                    <span className="absolute bottom-3 left-3 text-2xl drop-shadow">{category.emoji}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3.5 py-3.5 sm:px-4">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-foreground sm:text-sm">{category.name}</p>
                      <p className="mt-1 truncate text-[9px] font-semibold" style={{ color: category.groupColor }}>{category.groupName}</p>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f8f2] text-[#007a52] transition-colors group-hover:bg-[#009966] group-hover:text-white">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-5 text-center">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6fff5] text-[#009966]"><Search size={22} /></span>
              <h3 className="font-black text-foreground">No categories found</h3>
              <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Try a different search or choose another collection from the sidebar.</p>
              {(search || selectedGroup !== null) && (
                <button type="button" onClick={() => { setSearch(""); setSelectedGroup(null); }} className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#009966]">
                  Show all categories <ArrowRight size={13} />
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
