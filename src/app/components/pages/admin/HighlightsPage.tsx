import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Plus, Edit2, Trash2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { Toggle, Modal, DeleteConfirm, Field, PageHeader, StatCard, SectionCard } from "./shared/ui";
import { G, inp } from "./shared/constants";

type Highlight = {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  sort: number;
  active: boolean;
};

const PALETTE = [
  "#ef4444","#f97316","#f59e0b","#10b981","#009966",
  "#3b82f6","#6366f1","#8b5cf6","#ec4899","#0d9488",
];

const INIT_HIGHLIGHTS: Highlight[] = [
  { id: 1,  emoji: "🔥", title: "Flash Sale",       subtitle: "Up to 70% off",       color: "#ef4444", sort: 1, active: true  },
  { id: 2,  emoji: "✨", title: "New Arrivals",      subtitle: "Just landed",          color: "#6366f1", sort: 2, active: true  },
  { id: 3,  emoji: "🚚", title: "Free Delivery",    subtitle: "On orders ₹499+",      color: "#009966", sort: 3, active: true  },
  { id: 4,  emoji: "⚡", title: "Today's Deals",    subtitle: "Expires tonight",      color: "#f59e0b", sort: 4, active: true  },
  { id: 5,  emoji: "🏷️", title: "Clearance",       subtitle: "Last few pieces",      color: "#ec4899", sort: 5, active: true  },
  { id: 6,  emoji: "👑", title: "Premium Picks",    subtitle: "Top-rated brands",     color: "#8b5cf6", sort: 6, active: true  },
  { id: 7,  emoji: "🎁", title: "Gift Cards",       subtitle: "For every occasion",   color: "#0d9488", sort: 7, active: false },
  { id: 8,  emoji: "📱", title: "App-Only Deals",  subtitle: "Download the app",     color: "#3b82f6", sort: 8, active: false },
  { id: 9,  emoji: "🌾", title: "Organic Food",     subtitle: "Farm to your door",    color: "#10b981", sort: 9, active: true  },
  { id: 10, emoji: "💻", title: "Electronics",      subtitle: "Gadgets & more",       color: "#64748b", sort: 10, active: true },
];

const BLANK: Omit<Highlight,"id"|"sort"> = { emoji:"🎯", title:"", subtitle:"", color:"#009966", active:true };

export function HighlightsPage() {
  const [rows, setRows]       = useState(INIT_HIGHLIGHTS);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<Highlight | null>(null);
  const [delId, setDelId]     = useState<number | null>(null);
  const [form, setForm]       = useState(BLANK);
  const [view, setView]       = useState<"grid"|"list">("grid");

  const sorted = [...rows].sort((a, b) => a.sort - b.sort);

  const openAdd = () => { setForm(BLANK); setEditing(null); setModal(true); };
  const openEdit = (r: Highlight) => {
    setForm({ emoji:r.emoji, title:r.title, subtitle:r.subtitle, color:r.color, active:r.active });
    setEditing(r); setModal(true);
  };
  const save = () => {
    if (!form.title.trim()) return;
    if (editing) {
      setRows(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r));
    } else {
      const maxSort = Math.max(0, ...rows.map(r => r.sort));
      setRows(p => [...p, { id: Date.now(), ...form, sort: maxSort + 1 }]);
    }
    setModal(false);
  };
  const confirmDelete = (id: number) => { setRows(p => p.filter(r => r.id !== id)); setDelId(null); };
  const toggleActive  = (id: number) => setRows(p => p.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const moveSort = (id: number, dir: -1 | 1) => {
    const sorted2 = [...rows].sort((a, b) => a.sort - b.sort);
    const idx = sorted2.findIndex(r => r.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted2.length) return;
    const newRows = rows.map(r => {
      if (r.id === sorted2[idx].id)    return { ...r, sort: sorted2[swapIdx].sort };
      if (r.id === sorted2[swapIdx].id) return { ...r, sort: sorted2[idx].sort };
      return r;
    });
    setRows(newRows);
  };
  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Promotion / Highlights" title="Highlights"
        subtitle="Quick-action tiles shown at the top of the homepage" count={rows.length}>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
            {(["grid","list"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize"
                style={view === v ? { background: G, color: "#fff" } : { color: "#6b7280" }}>{v}</button>
            ))}
          </div>
          <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
            <Plus size={15}/> Add Highlight
          </button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total"      val={rows.length}                       color={G}         icon={Sparkles} />
        <StatCard label="Active"     val={rows.filter(r=>r.active).length}   color="#10b981"   icon={Sparkles} />
        <StatCard label="Inactive"   val={rows.filter(r=>!r.active).length}  color="#9ca3af"   icon={Sparkles} />
        <StatCard label="Sorted by"  val="Manual"                            color="#6366f1"   icon={GripVertical} />
      </div>

      {/* Grid / List view */}
      {view === "grid" ? (
        /* ── GRID PREVIEW ── */
        <SectionCard>
          <p className="text-xs font-bold text-gray-500 mb-4">Homepage preview — drag-order using arrows</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {sorted.map((r, idx) => (
              <motion.div key={r.id} layout initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: r.active ? 1 : 0.45, scale: 1 }}
                className={`relative rounded-2xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all ${!r.active ? "grayscale" : ""}`}
                style={{ background: `linear-gradient(135deg, ${r.color}ee, ${r.color}99)` }}>

                {/* Shine */}
                <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
                  style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 100%)" }}/>

                <div className="relative p-4 pb-3 flex flex-col items-center text-center">
                  <span className="text-3xl mb-2 leading-none">{r.emoji}</span>
                  <p className="text-sm font-black text-white leading-tight">{r.title}</p>
                  <p className="text-[10px] text-white/70 mt-0.5">{r.subtitle}</p>
                  <div className="text-[9px] font-black px-1.5 py-0.5 rounded-md mt-2 bg-black/20 text-white/80">
                    #{r.sort}
                  </div>
                </div>

                {/* Hover controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button onClick={() => moveSort(r.id, -1)} disabled={idx === 0}
                    className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all disabled:opacity-30">
                    <ArrowUp size={12}/>
                  </button>
                  <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all">
                    <Edit2 size={12}/>
                  </button>
                  <button onClick={() => moveSort(r.id, 1)} disabled={idx === sorted.length - 1}
                    className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all disabled:opacity-30">
                    <ArrowDown size={12}/>
                  </button>
                </div>

                {/* Active toggle */}
                <div className="absolute top-2 right-2">
                  <Toggle checked={r.active} onChange={() => toggleActive(r.id)}/>
                </div>
              </motion.div>
            ))}

            {/* Add new tile */}
            <motion.button onClick={openAdd} whileTap={{ scale: 0.96 }}
              className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-all min-h-[120px]">
              <Plus size={20}/>
              <span className="text-xs font-bold">Add New</span>
            </motion.button>
          </div>
        </SectionCard>
      ) : (
        /* ── LIST VIEW ── */
        <SectionCard>
          <div className="space-y-2">
            {sorted.map((r, idx) => (
              <motion.div key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 hover:bg-gray-50/70 transition-colors group">
                {/* Drag handle + number */}
                <div className="flex items-center gap-1 shrink-0 text-gray-300">
                  <GripVertical size={14}/>
                  <span className="text-[10px] font-black w-4 text-center">{r.sort}</span>
                </div>

                {/* Emoji swatch */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: `${r.color}20` }}>
                  {r.emoji}
                </div>

                {/* Title + subtitle */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{r.title}</p>
                  <p className="text-[10px] text-gray-400">{r.subtitle}</p>
                </div>

                {/* Color dot */}
                <div className="w-4 h-4 rounded-full shrink-0 border-2 border-white shadow-sm" style={{ background: r.color }}/>

                {/* Status */}
                <Toggle checked={r.active} onChange={() => toggleActive(r.id)}/>

                {/* Sort + actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveSort(r.id, -1)} disabled={idx === 0}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-30">
                    <ArrowUp size={12}/>
                  </button>
                  <button onClick={() => moveSort(r.id, 1)} disabled={idx === sorted.length - 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-30">
                    <ArrowDown size={12}/>
                  </button>
                  <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                    <Edit2 size={12}/>
                  </button>
                  <button onClick={() => setDelId(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 size={12}/>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Highlight" : "Add Highlight"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Emoji">
              <input value={form.emoji} onChange={e => set("emoji", e.target.value)} maxLength={2}
                placeholder="🔥" className={`${inp} text-2xl text-center`}/>
            </Field>
            <Field label="Background Color">
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={e => set("color", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"/>
                <input value={form.color} onChange={e => set("color", e.target.value)}
                  className={`${inp} flex-1 font-mono text-xs`}/>
              </div>
            </Field>
            <div className="col-span-2">
              <Field label="Title"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Flash Sale" className={inp}/></Field>
            </div>
            <div className="col-span-2">
              <Field label="Subtitle"><input value={form.subtitle} onChange={e => set("subtitle", e.target.value)} placeholder="e.g. Up to 70% off" className={inp}/></Field>
            </div>
          </div>

          {/* Quick palette */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Quick Colors</p>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map(c => (
                <button key={c} onClick={() => set("color", c)}
                  className="w-7 h-7 rounded-lg border-2 transition-all"
                  style={{ background: c, borderColor: form.color === c ? "#111" : "transparent" }}/>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="flex justify-center py-2">
            <div className="w-28 rounded-2xl overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${form.color}ee, ${form.color}99)` }}>
              <div className="p-4 flex flex-col items-center text-center">
                <span className="text-3xl mb-2">{form.emoji}</span>
                <p className="text-xs font-black text-white leading-tight">{form.title || "Title"}</p>
                <p className="text-[9px] text-white/70 mt-0.5">{form.subtitle || "Subtitle"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Toggle checked={form.active} onChange={() => set("active", !form.active)}/>
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
                {editing ? "Save Changes" : "Add Highlight"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <DeleteConfirm open={delId !== null} onClose={() => setDelId(null)} onConfirm={() => confirmDelete(delId!)}
        title="Delete Highlight" message={`Remove "${rows.find(r => r.id === delId)?.title}" from the homepage?`}/>
    </div>
  );
}

export default HighlightsPage;
