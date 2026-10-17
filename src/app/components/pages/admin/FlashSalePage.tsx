import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Zap, Edit2, Trash2, Eye, Package, IndianRupee, Clock, Plus } from "lucide-react";
import { Toggle, Modal, DeleteConfirm, Field, PageHeader, StatCard } from "./shared/ui";
import { G, GD, inp, card } from "./shared/constants";

type SaleStatus = "Active" | "Upcoming" | "Ended";

type FlashSale = {
  id: number;
  name: string;
  status: SaleStatus;
  discountType: "percent" | "flat";
  discountValue: number;
  startDate: string;
  endDate: string;
  products: number;
  revenue: number | null;
  bannerUrl: string;
  minOrder: number;
  active: boolean;
};

const statusMeta: Record<SaleStatus, { color: string; bg: string }> = {
  Active:   { color: G,         bg: `${G}15`                    },
  Upcoming: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)"     },
  Ended:    { color: "#6b7280", bg: "rgba(107,114,128,0.1)"     },
};

const INIT_SALES: FlashSale[] = [
  {
    id: 1,
    name: "Diwali Mega Sale",
    status: "Active",
    discountType: "percent",
    discountValue: 45,
    startDate: "2026-10-05T00:00",
    endDate: "2026-10-08T23:59",
    products: 124,
    revenue: 180000,
    bannerUrl: "",
    minOrder: 499,
    active: true,
  },
  {
    id: 2,
    name: "Weekend Electronics",
    status: "Upcoming",
    discountType: "percent",
    discountValue: 30,
    startDate: "2026-10-08T10:00",
    endDate: "2026-10-09T23:59",
    products: 56,
    revenue: null,
    bannerUrl: "",
    minOrder: 999,
    active: true,
  },
  {
    id: 3,
    name: "Navratri Fashion Drop",
    status: "Ended",
    discountType: "percent",
    discountValue: 50,
    startDate: "2026-10-01T00:00",
    endDate: "2026-10-04T23:59",
    products: 89,
    revenue: 210000,
    bannerUrl: "",
    minOrder: 299,
    active: false,
  },
];

const BLANK: Omit<FlashSale, "id"> = {
  name: "",
  status: "Upcoming",
  discountType: "percent",
  discountValue: 20,
  startDate: "",
  endDate: "",
  products: 0,
  revenue: null,
  bannerUrl: "",
  minOrder: 299,
  active: true,
};

function Countdown({ endDate }: { endDate: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return <span>{remaining}</span>;
}

export function FlashSalePage() {
  const [rows, setRows]     = useState(INIT_SALES);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState<FlashSale | null>(null);
  const [delId, setDelId]   = useState<number | null>(null);
  const [form, setForm]     = useState<Omit<FlashSale, "id">>(BLANK);
  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const openAdd  = () => { setForm(BLANK); setEditing(null); setModal(true); };
  const openEdit = (r: FlashSale) => {
    const { id: _id, ...rest } = r;
    setForm(rest); setEditing(r); setModal(true);
  };
  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setRows(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r));
    } else {
      setRows(p => [...p, { id: Date.now(), ...form }]);
    }
    setModal(false);
  };

  const activeSales   = rows.filter(r => r.status === "Active").length;
  const upcomingSales = rows.filter(r => r.status === "Upcoming").length;
  const totalRevenue  = rows.reduce((s, r) => s + (r.revenue ?? 0), 0);
  const avgDiscount   = Math.round(rows.reduce((s, r) => s + r.discountValue, 0) / rows.length);

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Operations / Flash Sales" title="Flash Sales"
        subtitle="Manage time-limited sale campaigns" count={rows.length}
        onAdd={openAdd} addLabel="Create Flash Sale" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Active Sales"               val={activeSales}                             color={G}         icon={Zap}         />
        <StatCard label="Upcoming"                   val={upcomingSales}                           color="#3b82f6"   icon={Clock}       />
        <StatCard label="Revenue from Flash Sales"   val={`₹${(totalRevenue / 100000).toFixed(1)}L`} color="#8b5cf6" icon={IndianRupee} />
        <StatCard label="Avg Discount"               val={`${avgDiscount}%`}                       color="#f59e0b"   icon={Zap}         />
      </div>

      {/* Sale cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {rows.map(r => {
          const meta = statusMeta[r.status];
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`${card} p-5 group hover:shadow-md transition-all`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-black text-gray-900">{r.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ color: meta.color, background: meta.bg }}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {r.discountType === "percent" ? `${r.discountValue}% off` : `₹${r.discountValue} off`}
                    &nbsp;·&nbsp; Min order ₹{r.minOrder.toLocaleString("en-IN")}
                  </p>
                </div>
                <Toggle checked={r.active} onChange={() => setRows(p => p.map(x => x.id === r.id ? { ...x, active: !x.active } : x))} />
              </div>

              {/* Discount badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${GD}15`, color: GD }}>
                  <span className="text-base font-black">{r.discountValue}{r.discountType === "percent" ? "%" : "₹"}</span>
                </div>
                <div className="space-y-1">
                  {r.status === "Active" && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={11} className="text-red-500" />
                      <span className="font-bold text-red-500">Ends in: </span>
                      <Countdown endDate={r.endDate} />
                    </p>
                  )}
                  {r.status === "Upcoming" && (
                    <p className="text-xs text-gray-500">
                      Starts: <span className="font-bold text-gray-700">
                        {new Date(r.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </p>
                  )}
                  {r.status === "Ended" && (
                    <p className="text-xs text-gray-500">
                      Ended: <span className="font-bold text-gray-700">
                        {new Date(r.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1"><Package size={10} /> {r.products} products</span>
                    {r.revenue != null && (
                      <span className="flex items-center gap-1 font-bold" style={{ color: G }}>
                        <IndianRupee size={10} /> ₹{(r.revenue / 100000).toFixed(1)}L revenue
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <div className="flex-1" />
                <button onClick={() => openEdit(r)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all">
                  <Edit2 size={11} /> Edit
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">
                  <Eye size={11} /> View
                </button>
                <button onClick={() => setDelId(r.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all">
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Flash Sale" : "Create Flash Sale"} wide>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Sale Name" required>
              <input value={form.name} onChange={e => set("name", e.target.value)}
                placeholder="e.g. Diwali Mega Sale" className={inp} />
            </Field>
          </div>
          <Field label="Start Date & Time" required>
            <input type="datetime-local" value={form.startDate} onChange={e => set("startDate", e.target.value)} className={inp} />
          </Field>
          <Field label="End Date & Time" required>
            <input type="datetime-local" value={form.endDate} onChange={e => set("endDate", e.target.value)} className={inp} />
          </Field>
          <Field label="Discount Type">
            <select value={form.discountType} onChange={e => set("discountType", e.target.value as "percent" | "flat")} className={inp}>
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
          </Field>
          <Field label={form.discountType === "percent" ? "Discount %" : "Flat Discount (₹)"}>
            <input type="number" value={form.discountValue} onChange={e => set("discountValue", +e.target.value)} min={1} className={inp} />
          </Field>
          <Field label="Min Order Amount (₹)">
            <input type="number" value={form.minOrder} onChange={e => set("minOrder", +e.target.value)} min={0} className={inp} />
          </Field>
          <Field label="No. of Products">
            <input type="number" value={form.products} onChange={e => set("products", +e.target.value)} min={0} className={inp} />
          </Field>
          <div className="col-span-2">
            <Field label="Select Products (multi-select chips)">
              <div className="border border-gray-200 rounded-xl p-3 flex flex-wrap gap-2 min-h-[44px]">
                {["iPhone 15 Pro", "Samsung S24", "Kurti Set", "Running Shoes", "Air Fryer"].map(p => (
                  <span key={p} className="px-2 py-1 rounded-lg text-xs font-semibold border"
                    style={{ background: `${G}10`, color: GD, borderColor: `${G}30` }}>
                    {p} ×
                  </span>
                ))}
                <span className="text-xs text-gray-400 self-center">+ Add product</span>
              </div>
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Banner Image URL">
              <input value={form.bannerUrl} onChange={e => set("bannerUrl", e.target.value)}
                placeholder="https://..." className={inp} />
            </Field>
          </div>
          <div className="col-span-2 flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Toggle checked={form.active} onChange={() => set("active", !form.active)} />
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all" style={{ background: G }}>
                {editing ? "Save Changes" : "Create Sale"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <DeleteConfirm
        open={delId !== null} onClose={() => setDelId(null)}
        onConfirm={() => { setRows(p => p.filter(r => r.id !== delId)); setDelId(null); }}
        title="Delete Flash Sale"
        message={`Remove "${rows.find(r => r.id === delId)?.name}"? This cannot be undone.`}
      />
    </div>
  );
}

export default FlashSalePage;
