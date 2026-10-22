import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowDown, ArrowUp, Calendar, Edit2, ExternalLink, Eye, ImageIcon,
  MousePointerClick, Plus, Tag, Trash2, Upload, X,
} from "lucide-react";
import { DeleteConfirm, Field, Modal, PageHeader, StatCard } from "./shared/ui";
import { G, inp } from "./shared/constants";

type BannerType = "hero" | "strip" | "popup";
type BannerStatus = "active" | "scheduled" | "paused";

type Banner = {
  id: number;
  title: string;
  badge: string;
  line1: string;
  line2: string;
  line3: string;
  offer: string;
  subtitle: string;
  cta: string;
  ctaSub: string;
  tags: string[];
  stats: Array<{ v: string; l: string }>;
  link: string;
  type: BannerType;
  status: BannerStatus;
  imageUrl: string;
  productImageUrl: string;
  gradientFrom: string;
  gradientTo: string;
  startDate: string;
  endDate: string;
  clicks: number;
  impressions: number;
  sort: number;
};

type BannerForm = Omit<Banner, "id" | "imageUrl" | "productImageUrl" | "clicks" | "impressions">;

const TYPE_META: Record<BannerType, { label: string; color: string; bg: string; desc: string }> = {
  hero: { label: "Hero", color: "#6366f1", bg: "#eef2ff", desc: "Homepage slider banner" },
  strip: { label: "Strip", color: "#0d9488", bg: "#f0fdfa", desc: "Announcement bar" },
  popup: { label: "Popup", color: "#ec4899", bg: "#fdf2f8", desc: "Promotional popup" },
};

const STATUS_META: Record<BannerStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#009966", bg: "#e8fff6" },
  scheduled: { label: "Scheduled", color: "#f59e0b", bg: "#fffbeb" },
  paused: { label: "Paused", color: "#9ca3af", bg: "#f3f4f6" },
};

const GRADIENT_PRESETS = [
  { from: "#009966", to: "#0d9488", label: "Emerald" },
  { from: "#6366f1", to: "#8b5cf6", label: "Indigo" },
  { from: "#ec4899", to: "#f97316", label: "Sunset" },
  { from: "#3b82f6", to: "#0d9488", label: "Ocean" },
  { from: "#f59e0b", to: "#ef4444", label: "Fire" },
  { from: "#1e293b", to: "#334155", label: "Midnight" },
];

const BLANK: BannerForm = {
  title: "",
  badge: "",
  line1: "",
  line2: "",
  line3: "",
  offer: "",
  subtitle: "",
  cta: "Shop Now",
  ctaSub: "",
  tags: [],
  stats: [],
  link: "/products",
  type: "hero",
  status: "active",
  gradientFrom: "#009966",
  gradientTo: "#0d9488",
  startDate: "",
  endDate: "",
  sort: 1,
};

function isBanner(value: unknown): value is Banner {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "number" && typeof item.title === "string" &&
    typeof item.badge === "string" && typeof item.line1 === "string" &&
    typeof item.line2 === "string" && typeof item.line3 === "string" &&
    typeof item.offer === "string" &&
    typeof item.subtitle === "string" && typeof item.cta === "string" &&
    typeof item.ctaSub === "string" &&
    Array.isArray(item.tags) && item.tags.every(tag => typeof tag === "string") &&
    Array.isArray(item.stats) && item.stats.every(stat =>
      Boolean(stat && typeof stat === "object" &&
        "v" in stat && typeof stat.v === "string" &&
        "l" in stat && typeof stat.l === "string")) &&
    typeof item.link === "string" && ["hero", "strip", "popup"].includes(String(item.type)) &&
    ["active", "scheduled", "paused"].includes(String(item.status)) &&
    typeof item.imageUrl === "string" && typeof item.productImageUrl === "string" &&
    typeof item.gradientFrom === "string" &&
    typeof item.gradientTo === "string" && typeof item.startDate === "string" &&
    typeof item.endDate === "string" && typeof item.clicks === "number" &&
    typeof item.impressions === "number" && typeof item.sort === "number";
}

const ctr = (banner: Banner) => banner.impressions > 0
  ? ((banner.clicks / banner.impressions) * 100).toFixed(1)
  : "0.0";
const fmt = (count: number) => count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
const parseTags = (value: string) => value.split(",").map(tag => tag.trim()).filter(Boolean);

export function BannerPage() {
  const [rows, setRows] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState<BannerType | "all">("all");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerForm>(BLANK);
  const [tagsInput, setTagsInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [removeProductImage, setRemoveProductImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [productImagePreview, setProductImagePreview] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const previewBackground = (() => {
    const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(form.gradientFrom);
    if (!match) return "#001208";
    const channels = match.slice(1).map(value => Math.round(parseInt(value, 16) * 0.12));
    return `#${channels.map(value => value.toString(16).padStart(2, "0")).join("")}`;
  })();
  const previewTags = parseTags(tagsInput);

  useEffect(() => {
    const controller = new AbortController();
    async function loadBanners() {
      setLoading(true);
      setLoadError("");
      try {
        const response = await fetch("/api/admin/banners", { cache: "no-store", signal: controller.signal });
        const result: unknown = await response.json();
        if (!response.ok || !result || typeof result !== "object" || !("success" in result) ||
            result.success !== true || !("banners" in result) || !Array.isArray(result.banners) ||
            !result.banners.every(isBanner)) {
          const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
            ? result.message : "Failed to load banners.";
          throw new Error(message);
        }
        setRows(result.banners);
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Failed to load banners.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadBanners();
    return () => controller.abort();
  }, []);

  const orderedRows = [...rows].sort((a, b) => a.sort - b.sort || a.id - b.id);
  const filtered = typeFilter === "all" ? orderedRows : orderedRows.filter(row => row.type === typeFilter);

  const openAdd = () => {
    setForm({ ...BLANK, sort: rows.length + 1 });
    setTagsInput("");
    setEditing(null);
    setImageFile(null);
    setImagePreview("");
    setProductImageFile(null);
    setRemoveProductImage(false);
    setProductImagePreview("");
    setActionError("");
    setModal(true);
  };

  const openEdit = (banner: Banner) => {
    setForm({
      title: banner.title,
      badge: banner.badge,
      line1: banner.line1,
      line2: banner.line2,
      line3: banner.line3,
      offer: banner.offer,
      subtitle: banner.subtitle,
      cta: banner.cta,
      ctaSub: banner.ctaSub,
      tags: banner.tags,
      stats: banner.stats,
      link: banner.link,
      type: banner.type,
      status: banner.status,
      gradientFrom: banner.gradientFrom,
      gradientTo: banner.gradientTo,
      startDate: banner.startDate,
      endDate: banner.endDate,
      sort: banner.sort,
    });
    setTagsInput(banner.tags.join(", "));
    setEditing(banner);
    setImageFile(null);
    setImagePreview(banner.imageUrl);
    setProductImageFile(null);
    setRemoveProductImage(false);
    setProductImagePreview(banner.productImageUrl);
    setActionError("");
    setModal(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.line1.trim()) {
      setActionError("Enter a campaign name and the first headline line.");
      return;
    }
    if (!editing && form.type === "hero" && !imageFile) {
      setActionError("Choose a banner image.");
      return;
    }
    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      setActionError("End date must be on or after the start date.");
      return;
    }
    const tags = parseTags(tagsInput);
    if (tags.length > 8 || tags.some(tag => tag.length > 40)) {
      setActionError("Use no more than 8 tags, with each tag 40 characters or fewer.");
      return;
    }

    setSaving(true);
    setActionError("");
    try {
      const body = new FormData();
      body.append("banner", JSON.stringify({ ...form, tags, ...(editing ? { id: editing.id } : {}) }));
      if (imageFile) body.append("image", imageFile);
      if (productImageFile) body.append("productImage", productImageFile);
      if (removeProductImage) body.append("removeProductImage", "true");
      const response = await fetch("/api/admin/banners", {
        method: editing ? "PUT" : "POST",
        body,
      });
      const result: unknown = await response.json();
      const record = result && typeof result === "object" ? result as Record<string, unknown> : {};
      if (!response.ok || record.success !== true || !isBanner(record.banner)) {
        throw new Error(typeof record.message === "string" ? record.message : "Could not save banner.");
      }
      setRows(current => editing
        ? current.map(row => row.id === editing.id ? record.banner as Banner : row).sort((a, b) => a.sort - b.sort)
        : [...current, record.banner as Banner].sort((a, b) => a.sort - b.sort));
      setModal(false);
      setImageFile(null);
      setImagePreview("");
      setProductImageFile(null);
      setRemoveProductImage(false);
      setProductImagePreview("");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not save banner.");
    } finally {
      setSaving(false);
    }
  };

  const updateBanner = async (banner: Banner, updates: Partial<BannerForm>) => {
    setActionError("");
    const body = new FormData();
    body.append("banner", JSON.stringify({
      title: banner.title,
      badge: banner.badge,
      line1: banner.line1,
      line2: banner.line2,
      line3: banner.line3,
      offer: banner.offer,
      subtitle: banner.subtitle,
      cta: banner.cta,
      ctaSub: banner.ctaSub,
      tags: banner.tags,
      stats: banner.stats,
      link: banner.link,
      type: banner.type,
      status: banner.status,
      gradientFrom: banner.gradientFrom,
      gradientTo: banner.gradientTo,
      startDate: banner.startDate || "",
      endDate: banner.endDate || "",
      sort: banner.sort,
      ...updates,
      id: banner.id,
    }));
    try {
      const response = await fetch("/api/admin/banners", { method: "PUT", body });
      const result: unknown = await response.json();
      const record = result && typeof result === "object" ? result as Record<string, unknown> : {};
      if (!response.ok || record.success !== true || !isBanner(record.banner)) {
        throw new Error(typeof record.message === "string" ? record.message : "Could not update banner.");
      }
      setRows(current => current.map(row => row.id === banner.id ? record.banner as Banner : row)
        .sort((a, b) => a.sort - b.sort));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not update banner.");
    }
  };

  const moveBanner = async (banner: Banner, direction: -1 | 1) => {
    const ordered = [...rows].sort((a, b) => a.sort - b.sort || a.id - b.id);
    const currentIndex = ordered.findIndex(row => row.id === banner.id);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;
    [ordered[currentIndex], ordered[targetIndex]] = [ordered[targetIndex], ordered[currentIndex]];
    setActionError("");
    try {
      const response = await fetch("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ordered.map(row => row.id) }),
      });
      const result: unknown = await response.json();
      const record = result && typeof result === "object" ? result as Record<string, unknown> : {};
      if (!response.ok || record.success !== true || !Array.isArray(record.banners) ||
          !record.banners.every(isBanner)) {
        throw new Error(typeof record.message === "string" ? record.message : "Could not reorder banners.");
      }
      setRows(record.banners);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not reorder banners.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionError("");
    try {
      const response = await fetch(`/api/admin/banners?id=${deleteTarget.id}`, { method: "DELETE" });
      const result: unknown = await response.json();
      const record = result && typeof result === "object" ? result as Record<string, unknown> : {};
      if (!response.ok || record.success !== true) {
        throw new Error(typeof record.message === "string" ? record.message : "Could not delete banner.");
      }
      setRows(current => current.filter(row => row.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not delete banner.");
    }
  };

  const set = <K extends keyof BannerForm>(key: K, value: BannerForm[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const activeBanners = rows.filter(row => row.status === "active").length;

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Promotion / Banners" title="Store Banners"
        subtitle="Create image banners for the storefront slider and manage promotions" count={rows.length}>
        <button type="button" onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
          <Plus size={15} /> New Banner
        </button>
      </PageHeader>

      {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>}
      {actionError && !modal && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Banners" val={rows.length} color={G} icon={ImageIcon} />
        <StatCard label="Active" val={activeBanners} color="#10b981" icon={Eye} />
        <StatCard label="Total Clicks" val={fmt(totalClicks)} color="#6366f1" icon={MousePointerClick} />
        <StatCard label="Impressions" val={fmt(totalImpressions)} color="#0d9488" icon={Eye} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "hero", "strip", "popup"] as const).map(type => (
          <button key={type} type="button" onClick={() => setTypeFilter(type)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all"
            style={typeFilter === type ? { background: G, color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }}>
            {type === "all" ? `All (${rows.length})` : `${TYPE_META[type].label} (${rows.filter(row => row.type === type).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Loading banners…</p>
      ) : filtered.length ? (
        <div className="space-y-3">
          {filtered.map(banner => {
            const typeMeta = TYPE_META[banner.type];
            const statusMeta = STATUS_META[banner.status];
            const orderedIndex = orderedRows.findIndex(row => row.id === banner.id);
            return (
              <motion.article key={banner.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-36 shrink-0 overflow-hidden bg-gray-100 sm:h-auto sm:min-h-[150px] sm:w-64"
                    style={{ background: `linear-gradient(135deg, ${banner.gradientFrom}, ${banner.gradientTo})` }}>
                    {banner.imageUrl && <img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="mb-1 text-[8px] font-bold text-white/80">{banner.badge}</p>
                      <p className="text-sm font-black leading-tight">{banner.line1} {banner.line2} {banner.line3}</p>
                      <p className="mt-0.5 line-clamp-1 text-[10px] font-bold text-white/90">{banner.offer}</p>
                    </div>
                    <span className="absolute left-3 top-3 rounded bg-black/40 px-2 py-0.5 text-[9px] font-black uppercase text-white">{banner.type}</span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-black text-gray-900">{banner.title}</h2>
                          <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ color: typeMeta.color, background: typeMeta.bg }}>{typeMeta.label}</span>
                          <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ color: statusMeta.color, background: statusMeta.bg }}>{statusMeta.label}</span>
                        </div>
                        <p className="line-clamp-1 text-xs text-gray-500">{banner.subtitle || "No subtitle"}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button type="button" aria-label={`Move ${banner.title} up`} disabled={orderedIndex === 0}
                          onClick={() => void moveBanner(banner, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowUp size={14} /></button>
                        <button type="button" aria-label={`Move ${banner.title} down`} disabled={orderedIndex === rows.length - 1}
                          onClick={() => void moveBanner(banner, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowDown size={14} /></button>
                        <button type="button" aria-label={`${banner.status === "active" ? "Pause" : "Activate"} ${banner.title}`}
                          onClick={() => void updateBanner(banner, { status: banner.status === "active" ? "paused" : "active" })}
                          className={`rounded-lg px-2 py-1.5 text-[10px] font-bold ${banner.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                          {banner.status === "active" ? "Pause" : "Activate"}
                        </button>
                        <button type="button" aria-label={`Edit ${banner.title}`} onClick={() => openEdit(banner)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500"><Edit2 size={14} /></button>
                        <button type="button" aria-label={`Delete ${banner.title}`} onClick={() => setDeleteTarget(banner)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-500">
                      <span className="inline-flex items-center gap-1"><MousePointerClick size={11} className="text-emerald-600" /><b className="text-gray-800">{fmt(banner.clicks)}</b> clicks</span>
                      <span className="inline-flex items-center gap-1"><Eye size={11} /><b className="text-gray-800">{fmt(banner.impressions)}</b> impressions</span>
                      <span className="inline-flex items-center gap-1"><Tag size={11} /><b className="text-gray-800">{ctr(banner)}%</b> CTR</span>
                      {banner.link && <span className="inline-flex max-w-48 items-center gap-1 truncate text-gray-400"><ExternalLink size={10} />{banner.link}</span>}
                      {(banner.startDate || banner.endDate) && <span className="inline-flex items-center gap-1 text-gray-400"><Calendar size={10} />{banner.startDate || "Anytime"} – {banner.endDate || "No end date"}</span>}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 py-16 text-gray-400">
          <ImageIcon size={28} />
          <p className="text-sm font-bold">No banners found</p>
          <button type="button" onClick={openAdd} className="mt-1 text-xs font-bold" style={{ color: G }}>+ Add Banner</button>
        </div>
      )}

      <Modal open={modal} onClose={() => !saving && setModal(false)} title={editing ? "Edit Banner" : "Create Store Banner"} wide>
        <div className="space-y-4">
          {actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{actionError}</p>}
          <Field label="Placement">
            <select value={form.type} onChange={event => set("type", event.target.value as BannerType)} className={inp}>
              {(["hero", "strip", "popup"] as const).map(type => <option key={type} value={type}>{TYPE_META[type].label} — {TYPE_META[type].desc}</option>)}
            </select>
          </Field>
          {form.type === "strip" && (
            <div className="space-y-4">
              <div className="relative h-32 overflow-hidden rounded-xl sm:h-36"
                style={{ background: `linear-gradient(135deg, ${form.gradientFrom}, ${form.gradientTo})` }}>
                {imagePreview && <img src={imagePreview} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay" />}
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <p className="text-base font-black text-white drop-shadow-lg">{form.line1 || form.title || "Promotion title"}</p>
                  <p className="text-xs text-white/85">{form.subtitle || "Promotion details"}</p>
                </div>
                <span className="absolute right-3 top-3 rounded-full bg-black/30 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white/80">Store strip preview</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Campaign Name (admin only)" required>
                    <input value={form.title} maxLength={120} onChange={event => set("title", event.target.value)}
                      placeholder="e.g. Diwali promotion" className={inp} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Strip Heading" required>
                    <input value={form.line1} maxLength={80} onChange={event => set("line1", event.target.value)}
                      placeholder="e.g. 🪔 Diwali Bonanza" className={inp} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Strip Description">
                    <input value={form.subtitle} maxLength={240} onChange={event => set("subtitle", event.target.value)}
                      placeholder="e.g. Up to 70% off everything" className={inp} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Card Link">
                    <input value={form.link} maxLength={500} onChange={event => set("link", event.target.value)}
                      placeholder="/products" className={inp} />
                  </Field>
                </div>
                <Field label="Status">
                  <select value={form.status} onChange={event => set("status", event.target.value as BannerStatus)} className={inp}>
                    {(["active", "scheduled", "paused"] as const).map(status => <option key={status} value={status}>{STATUS_META[status].label}</option>)}
                  </select>
                </Field>
                <Field label="Display Order">
                  <input type="number" min={1} max={10000} value={form.sort} onChange={event => set("sort", Number(event.target.value))} className={inp} />
                </Field>
                <Field label="Start Date">
                  <input type="date" value={form.startDate} onChange={event => set("startDate", event.target.value)} className={inp} />
                </Field>
                <Field label="End Date">
                  <input type="date" value={form.endDate} onChange={event => set("endDate", event.target.value)} className={inp} />
                </Field>
              </div>
            </div>
          )}
          {form.type !== "strip" && (
            <>
          <div className="relative h-60 overflow-hidden rounded-xl sm:h-64"
            style={{ background: previewBackground }}>
            {imagePreview && <img src={imagePreview} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <div className="absolute inset-0" style={{
              background: `linear-gradient(105deg, ${previewBackground}f8 0%, ${previewBackground}e0 38%, ${previewBackground}80 62%, transparent 100%), linear-gradient(to top, ${previewBackground}cc 0%, ${previewBackground}44 30%, transparent 60%)`,
            }} />
            <div className="relative z-10 flex h-full items-center justify-between gap-3 px-5 py-4 text-white sm:px-8">
              <div className="min-w-0 flex-1 space-y-2">
                <span className="inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[9px] font-black sm:text-[10px]"
                  style={{ background: `${form.gradientFrom}20`, borderColor: `${form.gradientFrom}40`, color: form.gradientTo }}>
                  {form.badge || "Your campaign badge"}
                </span>
                <p className="max-w-[80%] text-2xl font-black leading-[0.95] tracking-tight drop-shadow sm:text-4xl">
                  {form.line1 || "Headline"}
                  {form.line2 && <> <span style={{ color: form.gradientTo }}>{form.line2}</span></>}
                  {form.line3 && <> {form.line3}</>}
                </p>
                <div className="space-y-0.5">
                  <p className="text-xs font-black sm:text-base" style={{ color: "#fbbf24" }}>{form.offer || "Offer or promotion"}</p>
                  <p className="line-clamp-1 text-[9px] text-white/70 sm:text-xs">{form.subtitle || "Supporting message for shoppers"}</p>
                </div>
                {previewTags.length > 0 && (
                  <div className="hidden flex-wrap gap-1.5 pt-0.5 md:flex">
                    {previewTags.map((tag, index) => <span key={`${tag}-${index}`} className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[8px] font-bold text-white/80">{tag}</span>)}
                  </div>
                )}
                {form.stats.some(stat => stat.v.trim() && stat.l.trim()) && (
                  <div className="hidden items-center gap-5 pt-1 lg:flex">
                    {form.stats.filter(stat => stat.v.trim() && stat.l.trim()).map(stat => (
                      <div key={`${stat.v}-${stat.l}`} className="border-l border-white/15 pl-4 first:border-0 first:pl-0">
                        <p className="text-xs font-black leading-tight" style={{ color: form.gradientTo }}>{stat.v}</p>
                        <p className="text-[8px] uppercase tracking-widest text-white/45">{stat.l}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="rounded-lg px-3 py-1.5 text-[9px] font-black text-gray-900 shadow sm:text-[10px]"
                    style={{ background: `linear-gradient(135deg, ${form.gradientFrom}, ${form.gradientTo})` }}>
                    {form.cta || "Shop Now"} <span aria-hidden="true">→</span>
                  </span>
                  {form.ctaSub && <span className="hidden text-[9px] font-medium text-white/55 sm:inline">{form.ctaSub}</span>}
                </div>
              </div>
              {productImagePreview && (
                <div className="relative hidden w-[30%] shrink-0 md:block">
                  <div className="relative w-full overflow-hidden"
                    style={{
                      aspectRatio: "3 / 4",
                      borderRadius: "30% 60% 50% 42% / 42% 38% 58% 48%",
                      border: `1.5px solid ${form.gradientFrom}35`,
                      boxShadow: `0 0 35px ${form.gradientFrom}18, 0 16px 32px rgba(0,0,0,0.5)`,
                    }}>
                    <div className="absolute inset-0 scale-75 rounded-full blur-2xl opacity-30" style={{ background: form.gradientFrom }} />
                    <img src={productImagePreview} alt="" className="relative h-full w-full scale-105 object-cover" style={{ filter: "brightness(0.92) saturate(1.1)" }} />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${previewBackground}99 0%, transparent 55%)` }} />
                  </div>
                  <span className="absolute -right-2 -top-2 rounded-2xl px-3 py-1.5 text-[9px] font-black shadow-xl sm:text-[10px]"
                    style={{ background: form.gradientTo, color: "#000" }}>
                    {form.offer || "Your offer"}
                  </span>
                </div>
              )}
            </div>
            <span className="absolute right-3 top-3 rounded-full bg-black/30 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white/80">Store hero preview</span>
          </div>

          <Field label="Foreground Product Image" hint="Optional · JPEG, PNG, WebP, GIF, BMP, TIFF, or AVIF">
            <input ref={productImageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/avif,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff,.avif"
              className="hidden" onChange={event => {
                const file = event.target.files?.[0];
                if (file) {
                  setProductImageFile(file);
                  setRemoveProductImage(false);
                  setProductImagePreview(URL.createObjectURL(file));
                }
                event.target.value = "";
              }} />
            <button type="button" onClick={() => productImageInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-xs font-bold text-gray-600 hover:border-[#009966] hover:text-[#009966]">
              <Upload size={14} /> {productImageFile ? productImageFile.name : productImagePreview ? "Replace product image" : "Choose product image"}
            </button>
            {productImageFile && <button type="button" onClick={() => {
              setProductImageFile(null);
              setRemoveProductImage(false);
              setProductImagePreview(editing?.productImageUrl ?? "");
            }} className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-red-500"><X size={12} /> Cancel image change</button>}
            {editing?.productImageUrl && !productImageFile && (
              <button type="button" onClick={() => {
                setRemoveProductImage(current => !current);
                setProductImagePreview(removeProductImage ? editing.productImageUrl : "");
              }} className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-red-500">
                <X size={12} /> {removeProductImage ? "Keep current product image" : "Remove product image"}
              </button>
            )}
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Campaign Name (admin only)" required><input value={form.title} maxLength={120} onChange={event => set("title", event.target.value)} placeholder="e.g. Diwali electronics sale" className={inp} /></Field></div>
            <div className="sm:col-span-2"><Field label="Slider Badge"><input value={form.badge} maxLength={80} onChange={event => set("badge", event.target.value)} placeholder="e.g. ✨ Festival Special" className={inp} /></Field></div>
            <Field label="Headline — first line" required><input value={form.line1} maxLength={80} onChange={event => set("line1", event.target.value)} placeholder="e.g. Grand" className={inp} /></Field>
            <Field label="Headline — accent line"><input value={form.line2} maxLength={80} onChange={event => set("line2", event.target.value)} placeholder="e.g. Diwali" className={inp} /></Field>
            <Field label="Headline — last line"><input value={form.line3} maxLength={80} onChange={event => set("line3", event.target.value)} placeholder="e.g. Sale" className={inp} /></Field>
            <Field label="Offer headline"><input value={form.offer} maxLength={160} onChange={event => set("offer", event.target.value)} placeholder="e.g. Up to 80% OFF" className={inp} /></Field>
            <div className="sm:col-span-2"><Field label="Supporting Text"><input value={form.subtitle} maxLength={240} onChange={event => set("subtitle", event.target.value)} placeholder="e.g. Electronics · Fashion · Home" className={inp} /></Field></div>
            <div className="sm:col-span-2"><Field label="Highlight Tags" hint="Separate tags with commas · up to 8"><input value={tagsInput} maxLength={360} onChange={event => setTagsInput(event.target.value)} placeholder="e.g. 🎁 Gift Sets, ✨ Festival, 🔥 Hot Deals" className={inp} /></Field></div>
            <div className="sm:col-span-2">
              <Field label="Slider Stats" hint="Optional · up to 3 value and label pairs">
                <div className="space-y-2">
                  {[0, 1, 2].map(index => {
                    const stat = form.stats[index] ?? { v: "", l: "" };
                    return (
                      <div key={index} className="grid grid-cols-2 gap-2">
                        <input value={stat.v} maxLength={20} onChange={event => {
                          const stats = Array.from({ length: index + 1 }, (_, i) => form.stats[i] ?? { v: "", l: "" });
                          stats[index] = { ...stat, v: event.target.value };
                          set("stats", stats);
                        }} placeholder={["80%", "2 Day", "₹0"][index]} className={inp} aria-label={`Slider stat ${index + 1} value`} />
                        <input value={stat.l} maxLength={32} onChange={event => {
                          const stats = Array.from({ length: index + 1 }, (_, i) => form.stats[i] ?? { v: "", l: "" });
                          stats[index] = { ...stat, l: event.target.value };
                          set("stats", stats);
                        }} placeholder={["Max Discount", "Delivery", "Cost EMI"][index]} className={inp} aria-label={`Slider stat ${index + 1} label`} />
                      </div>
                    );
                  })}
                </div>
              </Field>
            </div>
            <Field label="Button Text"><input value={form.cta} maxLength={40} onChange={event => set("cta", event.target.value)} placeholder="Shop Now" className={inp} /></Field>
            <Field label="Button Supporting Text"><input value={form.ctaSub} maxLength={100} onChange={event => set("ctaSub", event.target.value)} placeholder="e.g. 10,000+ offers live" className={inp} /></Field>
            <div className="sm:col-span-2"><Field label="Button Link"><input value={form.link} maxLength={500} onChange={event => set("link", event.target.value)} placeholder="/products" className={inp} /></Field></div>
            <Field label="Status"><select value={form.status} onChange={event => set("status", event.target.value as BannerStatus)} className={inp}>
              {(["active", "scheduled", "paused"] as const).map(status => <option key={status} value={status}>{STATUS_META[status].label}</option>)}
            </select></Field>
            <Field label="Start Date"><input type="date" value={form.startDate} onChange={event => set("startDate", event.target.value)} className={inp} /></Field>
            <Field label="End Date"><input type="date" value={form.endDate} onChange={event => set("endDate", event.target.value)} className={inp} /></Field>
            <Field label="Display Order"><input type="number" min={1} max={10000} value={form.sort} onChange={event => set("sort", Number(event.target.value))} className={inp} /></Field>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-gray-400">Image Overlay Gradient</p>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_PRESETS.map(preset => <button key={preset.label} type="button" onClick={() => {
                set("gradientFrom", preset.from);
                set("gradientTo", preset.to);
              }} title={preset.label} className="h-8 w-12 rounded-lg border-2 text-[8px] font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`, borderColor: form.gradientFrom === preset.from ? "#111" : "transparent" }}>{preset.label}</button>)}
            </div>
          </div>
            </>
          )}
          <Field label={form.type === "strip" ? "Strip Banner Image" : "Background Image"}
            required={!editing && form.type === "hero"}
            hint="Optional for strips · stored in banners bucket · max 5 MB">
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/avif,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff,.avif"
              className="hidden" onChange={event => {
                const file = event.target.files?.[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
                event.target.value = "";
              }} />
            <button type="button" onClick={() => imageInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-xs font-bold text-gray-600 hover:border-[#009966] hover:text-[#009966]">
              <Upload size={14} /> {imageFile ? imageFile.name : imagePreview ? "Replace banner image" : "Choose banner image"}
            </button>
            {imageFile && <button type="button" onClick={() => {
              setImageFile(null);
              setImagePreview(editing?.imageUrl ?? "");
            }} className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-red-500"><X size={12} /> Cancel image change</button>}
          </Field>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-[10px] font-semibold text-gray-500">From <input type="color" value={form.gradientFrom} onChange={event => set("gradientFrom", event.target.value)} className="h-8 w-9 cursor-pointer rounded border border-gray-200 p-0.5" /></label>
              <label className="flex items-center gap-2 text-[10px] font-semibold text-gray-500">To <input type="color" value={form.gradientTo} onChange={event => set("gradientTo", event.target.value)} className="h-8 w-9 cursor-pointer rounded border border-gray-200 p-0.5" /></label>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={saving} onClick={() => setModal(false)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
              <button type="button" disabled={saving} onClick={() => void save()} className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60" style={{ background: G }}>{saving ? "Saving…" : editing ? "Save Changes" : "Create Banner"}</button>
            </div>
          </div>
        </div>
      </Modal>

      <DeleteConfirm open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()} title="Delete Banner"
        message={`Delete "${deleteTarget?.title ?? ""}"? This action cannot be undone.`} />
    </div>
  );
}

export default BannerPage;
