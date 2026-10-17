import { useState } from "react";
import { motion } from "motion/react";
import { ImageIcon, Plus, Edit2, Trash2, MousePointerClick, Eye, Calendar, ExternalLink, Tag } from "lucide-react";
import { Toggle, Modal, DeleteConfirm, Field, PageHeader, StatCard, SectionCard } from "./shared/ui";
import { G, inp } from "./shared/constants";

type BannerType = "hero" | "strip" | "popup";
type BannerStatus = "active" | "scheduled" | "paused";

type Banner = {
  id: number;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  type: BannerType;
  status: BannerStatus;
  gradientFrom: string;
  gradientTo: string;
  startDate: string;
  endDate: string;
  clicks: number;
  impressions: number;
  sort: number;
};

const TYPE_META: Record<BannerType, { label: string; color: string; bg: string; desc: string }> = {
  hero:   { label: "Hero",   color: "#6366f1", bg: "#eef2ff", desc: "Full-width homepage banner" },
  strip:  { label: "Strip",  color: "#0d9488", bg: "#f0fdfa", desc: "Thin announcement bar"       },
  popup:  { label: "Popup",  color: "#ec4899", bg: "#fdf2f8", desc: "Overlay modal banner"        },
};

const STATUS_META: Record<BannerStatus, { label: string; color: string; bg: string }> = {
  active:    { label: "Active",    color: "#009966", bg: "#e8fff6" },
  scheduled: { label: "Scheduled", color: "#f59e0b", bg: "#fffbeb" },
  paused:    { label: "Paused",    color: "#9ca3af", bg: "#f3f4f6" },
};

const GRADIENT_PRESETS: { from: string; to: string; label: string }[] = [
  { from: "#009966", to: "#0d9488", label: "Emerald"  },
  { from: "#6366f1", to: "#8b5cf6", label: "Indigo"   },
  { from: "#ec4899", to: "#f97316", label: "Sunset"   },
  { from: "#3b82f6", to: "#0d9488", label: "Ocean"    },
  { from: "#f59e0b", to: "#ef4444", label: "Fire"     },
  { from: "#1e293b", to: "#334155", label: "Midnight" },
  { from: "#8b5cf6", to: "#ec4899", label: "Twilight" },
  { from: "#10b981", to: "#3b82f6", label: "Aurora"   },
];

const INIT_BANNERS: Banner[] = [
  { id: 1, title: "Grand Diwali Sale",       subtitle: "Celebrate with up to 60% off sitewide",    cta: "Shop Now",       link: "/sale/diwali",      type: "hero",   status: "scheduled", gradientFrom: "#f59e0b", gradientTo: "#ef4444", startDate: "2026-10-01", endDate: "2026-10-30", clicks: 0,    impressions: 0,    sort: 1 },
  { id: 2, title: "Free Delivery Weekend",   subtitle: "No minimum order this Saturday & Sunday",   cta: "Order Now",      link: "/free-delivery",    type: "strip",  status: "active",    gradientFrom: "#009966", gradientTo: "#0d9488", startDate: "2026-09-06", endDate: "2026-09-07", clicks: 1420, impressions: 38000, sort: 2 },
  { id: 3, title: "Download Our App",        subtitle: "Exclusive deals — only on the app",         cta: "Get the App",    link: "/app-download",     type: "popup",  status: "active",    gradientFrom: "#3b82f6", gradientTo: "#6366f1", startDate: "2026-08-01", endDate: "2026-12-31", clicks: 880,  impressions: 14200, sort: 3 },
  { id: 4, title: "Organic Harvest Festival",subtitle: "Farm-fresh produce direct to your door",    cta: "Explore",        link: "/organic",          type: "hero",   status: "active",    gradientFrom: "#10b981", gradientTo: "#3b82f6", startDate: "2026-09-01", endDate: "2026-09-30", clicks: 2340, impressions: 61000, sort: 4 },
  { id: 5, title: "Flash: 2 Hours Only",     subtitle: "70% off electronics — ending at midnight",  cta: "Grab It",        link: "/flash",            type: "strip",  status: "paused",    gradientFrom: "#ec4899", gradientTo: "#f97316", startDate: "2026-09-04", endDate: "2026-09-05", clicks: 560,  impressions: 9800,  sort: 5 },
  { id: 6, title: "New User Welcome",        subtitle: "₹200 off your first order — use WELCOME200", cta: "Sign Up",       link: "/register",         type: "popup",  status: "active",    gradientFrom: "#8b5cf6", gradientTo: "#ec4899", startDate: "2026-01-01", endDate: "2026-12-31", clicks: 3100, impressions: 52000, sort: 6 },
];

const BLANK: Omit<Banner,"id"|"clicks"|"impressions"|"sort"> = {
  title: "", subtitle: "", cta: "Shop Now", link: "",
  type: "hero", status: "active",
  gradientFrom: "#009966", gradientTo: "#0d9488",
  startDate: "", endDate: "",
};

const ctr = (b: Banner) => b.impressions > 0 ? ((b.clicks / b.impressions) * 100).toFixed(1) : "0.0";
const fmt  = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

export function BannerPage() {
  const [rows, setRows]       = useState(INIT_BANNERS);
  const [typeF, setTypeF]     = useState<BannerType | "all">("all");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [delId, setDelId]     = useState<number | null>(null);
  const [form, setForm]       = useState(BLANK);

  const filtered = typeF === "all" ? rows : rows.filter(r => r.type === typeF);

  const openAdd = () => { setForm(BLANK); setEditing(null); setModal(true); };
  const openEdit = (r: Banner) => {
    setForm({ title:r.title, subtitle:r.subtitle, cta:r.cta, link:r.link, type:r.type, status:r.status, gradientFrom:r.gradientFrom, gradientTo:r.gradientTo, startDate:r.startDate, endDate:r.endDate });
    setEditing(r); setModal(true);
  };
  const save = () => {
    if (!form.title.trim()) return;
    if (editing) {
      setRows(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r));
    } else {
      setRows(p => [...p, { id: Date.now(), ...form, clicks: 0, impressions: 0, sort: p.length + 1 }]);
    }
    setModal(false);
  };
  const confirmDelete = (id: number) => { setRows(p => p.filter(r => r.id !== id)); setDelId(null); };
  const toggleStatus  = (id: number) => setRows(p => p.map(r => r.id === id ? { ...r, status: r.status === "active" ? "paused" : "active" } : r));
  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const totalClicks      = rows.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
  const activeBanners    = rows.filter(r => r.status === "active").length;

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Promotion / Banners" title="Banners"
        subtitle="Manage hero banners, announcement strips, and popup overlays" count={rows.length}>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
          <Plus size={15}/> New Banner
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Banners"   val={rows.length}          color={G}         icon={ImageIcon}         />
        <StatCard label="Live Now"        val={activeBanners}        color="#10b981"    icon={Eye}               />
        <StatCard label="Total Clicks"    val={fmt(totalClicks)}     color="#6366f1"    icon={MousePointerClick} />
        <StatCard label="Impressions"     val={fmt(totalImpressions)}color="#0d9488"    icon={Eye}               />
      </div>

      {/* Type filter tabs */}
      <div className="flex items-center gap-2">
        {(["all", "hero", "strip", "popup"] as const).map(t => (
          <button key={t} onClick={() => setTypeF(t)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all"
            style={typeF === t ? { background: G, color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }}>
            {t === "all" ? `All (${rows.length})` : `${TYPE_META[t].label} (${rows.filter(r => r.type === t).length})`}
          </button>
        ))}
      </div>

      {/* Banner cards */}
      <div className="space-y-3">
        {filtered.map(r => {
          const tm = TYPE_META[r.type];
          const sm = STATUS_META[r.status];
          const ctrVal = ctr(r);
          return (
            <motion.div key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden group hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row">
                {/* Visual preview */}
                <div className="sm:w-52 sm:h-auto h-24 flex-shrink-0 flex flex-col justify-end p-3 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${r.gradientFrom}, ${r.gradientTo})` }}>
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.35) 100%)" }}/>
                  <div className="relative">
                    <p className="text-xs font-black text-white leading-tight">{r.title}</p>
                    <p className="text-[9px] text-white/70 mt-0.5 line-clamp-1">{r.subtitle}</p>
                    <div className="mt-1.5 inline-block px-2 py-0.5 bg-white/20 rounded text-[9px] font-bold text-white">{r.cta}</div>
                  </div>
                  {/* Type badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-black/30 text-white">{r.type}</div>
                </div>

                {/* Info */}
                <div className="flex-1 p-4 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-black text-gray-900">{r.title}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ color: tm.color, background: tm.bg }}>{tm.label}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ color: sm.color, background: sm.bg }}>{sm.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1">{r.subtitle}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Toggle checked={r.status === "active"} onChange={() => toggleStatus(r.id)}/>
                      <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                        <Edit2 size={13}/>
                      </button>
                      <button onClick={() => setDelId(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <MousePointerClick size={11} style={{ color: G }}/>
                      <span className="font-bold text-gray-800">{fmt(r.clicks)}</span> clicks
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Eye size={11} className="text-gray-400"/>
                      <span className="font-bold text-gray-800">{fmt(r.impressions)}</span> impressions
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Tag size={11} className="text-gray-400"/>
                      <span className="font-bold text-gray-800">{ctrVal}%</span> CTR
                    </div>
                    {r.link && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <ExternalLink size={10}/>
                        <span className="truncate max-w-[120px]">{r.link}</span>
                      </div>
                    )}
                  </div>

                  {/* CTR bar */}
                  {r.impressions > 0 && (
                    <div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: G }}
                          initial={{ width: 0 }} animate={{ width: `${Math.min(parseFloat(ctrVal) * 5, 100)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}/>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  {(r.startDate || r.endDate) && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                      <Calendar size={10}/>
                      {r.startDate && <span>{r.startDate}</span>}
                      {r.startDate && r.endDate && <span>→</span>}
                      {r.endDate   && <span>{r.endDate}</span>}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon size={28}/>
            <p className="text-sm font-bold">No banners found</p>
            <button onClick={openAdd} className="text-xs font-bold mt-1" style={{ color: G }}>+ Add Banner</button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Banner" : "Add Banner"}>
        <div className="space-y-3">
          {/* Preview strip */}
          <div className="rounded-xl overflow-hidden h-16 flex items-end p-3 relative"
            style={{ background: `linear-gradient(135deg, ${form.gradientFrom}, ${form.gradientTo})` }}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.4) 100%)" }}/>
            <div className="relative">
              <p className="text-xs font-black text-white">{form.title || "Banner Title"}</p>
              <p className="text-[9px] text-white/70">{form.subtitle || "Subtitle"}</p>
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/20 rounded text-[9px] font-bold text-white">{form.cta}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Title"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Grand Diwali Sale" className={inp}/></Field>
            </div>
            <div className="col-span-2">
              <Field label="Subtitle"><input value={form.subtitle} onChange={e => set("subtitle", e.target.value)} placeholder="e.g. Up to 60% off sitewide" className={inp}/></Field>
            </div>
            <Field label="CTA Text"><input value={form.cta} onChange={e => set("cta", e.target.value)} placeholder="Shop Now" className={inp}/></Field>
            <Field label="Link URL"><input value={form.link} onChange={e => set("link", e.target.value)} placeholder="/sale" className={inp}/></Field>
            <Field label="Type">
              <select value={form.type} onChange={e => set("type", e.target.value as BannerType)} className={inp}>
                {(["hero","strip","popup"] as BannerType[]).map(t => <option key={t} value={t}>{TYPE_META[t].label} — {TYPE_META[t].desc}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value as BannerStatus)} className={inp}>
                {(["active","scheduled","paused"] as BannerStatus[]).map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </Field>
            <Field label="Start Date"><input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} className={inp}/></Field>
            <Field label="End Date"><input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} className={inp}/></Field>
          </div>

          {/* Gradient presets */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Gradient Presets</p>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_PRESETS.map(p => (
                <button key={p.label} onClick={() => { set("gradientFrom", p.from); set("gradientTo", p.to); }}
                  title={p.label}
                  className="w-12 h-7 rounded-lg border-2 transition-all text-[8px] font-bold text-white/80 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                    borderColor: form.gradientFrom === p.from && form.gradientTo === p.to ? "#111" : "transparent",
                  }}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* Custom gradient pickers */}
          <div className="flex gap-3">
            <Field label="From Color">
              <div className="flex items-center gap-2">
                <input type="color" value={form.gradientFrom} onChange={e => set("gradientFrom", e.target.value)} className="w-9 h-9 rounded-xl border border-gray-200 cursor-pointer p-0.5"/>
                <input value={form.gradientFrom} onChange={e => set("gradientFrom", e.target.value)} className={`${inp} flex-1 font-mono text-xs`}/>
              </div>
            </Field>
            <Field label="To Color">
              <div className="flex items-center gap-2">
                <input type="color" value={form.gradientTo} onChange={e => set("gradientTo", e.target.value)} className="w-9 h-9 rounded-xl border border-gray-200 cursor-pointer p-0.5"/>
                <input value={form.gradientTo} onChange={e => set("gradientTo", e.target.value)} className={`${inp} flex-1 font-mono text-xs`}/>
              </div>
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={save} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
              {editing ? "Save Changes" : "Create Banner"}
            </button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm open={delId !== null} onClose={() => setDelId(null)} onConfirm={() => confirmDelete(delId!)}
        title="Delete Banner" message={`Delete "${rows.find(r => r.id === delId)?.title}"? Clicks and impression data will also be removed.`}/>
    </div>
  );
}

export default BannerPage;
