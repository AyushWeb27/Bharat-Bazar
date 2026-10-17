import { useState } from "react";
import { motion } from "motion/react";
import { Ticket, Plus, Edit2, Trash2, Copy, CheckCircle2, Percent, IndianRupee } from "lucide-react";
import { Toggle, Modal, DeleteConfirm, Field, PageHeader, SearchBar, StatCard, SectionCard } from "./shared/ui";
import { G, inp } from "./shared/constants";

type Coupon = {
  id: number;
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrder: number;
  maxDisc: number;
  expiry: string;
  used: number;
  limit: number;
  active: boolean;
};

const INIT_COUPONS: Coupon[] = [
  { id: 1, code: "WELCOME50",  type: "flat",    value: 50,  minOrder: 299,  maxDisc: 50,  expiry: "31 Dec 2026", used: 1247, limit: 5000,  active: true  },
  { id: 2, code: "SAVE20",     type: "percent", value: 20,  minOrder: 499,  maxDisc: 200, expiry: "31 Oct 2026", used: 3842, limit: 10000, active: true  },
  { id: 3, code: "FLAT100",    type: "flat",    value: 100, minOrder: 999,  maxDisc: 100, expiry: "15 Sep 2026", used: 892,  limit: 2000,  active: true  },
  { id: 4, code: "NEWUSER",    type: "percent", value: 15,  minOrder: 199,  maxDisc: 150, expiry: "31 Dec 2026", used: 2341, limit: 0,     active: true  },
  { id: 5, code: "DIWALI30",   type: "percent", value: 30,  minOrder: 799,  maxDisc: 500, expiry: "01 Nov 2026", used: 0,    limit: 3000,  active: false },
  { id: 6, code: "BB200",      type: "flat",    value: 200, minOrder: 1499, maxDisc: 200, expiry: "30 Sep 2026", used: 341,  limit: 1000,  active: true  },
  { id: 7, code: "FREESHIP",   type: "flat",    value: 49,  minOrder: 149,  maxDisc: 49,  expiry: "31 Dec 2026", used: 5621, limit: 0,     active: true  },
  { id: 8, code: "FESTIVE40",  type: "percent", value: 40,  minOrder: 999,  maxDisc: 800, expiry: "15 Oct 2026", used: 0,    limit: 2500,  active: false },
  { id: 9, code: "REFER10",    type: "percent", value: 10,  minOrder: 99,   maxDisc: 100, expiry: "31 Dec 2026", used: 7834, limit: 0,     active: true  },
];

const BLANK: Omit<Coupon,"id"> = { code:"", type:"flat", value:50, minOrder:299, maxDisc:100, expiry:"", used:0, limit:1000, active:true };

export function CouponPage() {
  const [rows, setRows]         = useState(INIT_COUPONS);
  const [q, setQ]               = useState("");
  const [typeF, setTypeF]       = useState("All");
  const [statusF, setStatusF]   = useState("All");
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState<Coupon | null>(null);
  const [delId, setDelId]       = useState<number | null>(null);
  const [form, setForm]         = useState(BLANK);
  const [copied, setCopied]     = useState<number | null>(null);

  const filtered = rows.filter(r => {
    const qOk = !q || r.code.toLowerCase().includes(q.toLowerCase());
    const tOk = typeF === "All" || r.type === typeF.toLowerCase();
    const sOk = statusF === "All" || (statusF === "Active" ? r.active : !r.active);
    return qOk && tOk && sOk;
  });

  const openAdd = () => { setForm(BLANK); setEditing(null); setModal(true); };
  const openEdit = (r: Coupon) => {
    setForm({ code:r.code, type:r.type, value:r.value, minOrder:r.minOrder, maxDisc:r.maxDisc, expiry:r.expiry, used:r.used, limit:r.limit, active:r.active });
    setEditing(r); setModal(true);
  };
  const save = () => {
    if (!form.code.trim()) return;
    if (editing) {
      setRows(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r));
    } else {
      setRows(p => [...p, { id: Date.now(), ...form }]);
    }
    setModal(false);
  };
  const confirmDelete = (id: number) => { setRows(p => p.filter(r => r.id !== id)); setDelId(null); };
  const toggleActive  = (id: number) => setRows(p => p.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const copyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };
  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const totalUsed  = rows.reduce((s, r) => s + r.used, 0);
  const activeCount = rows.filter(r => r.active).length;

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Delivery / Coupons" title="Coupons"
        subtitle="Manage discount codes, flat and percent offers" count={rows.length}>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
          <Plus size={15}/> Add Coupon
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Coupons"  val={rows.length}                                   color={G}         icon={Ticket}      />
        <StatCard label="Active"         val={activeCount}                                    color="#10b981"   icon={Ticket}      />
        <StatCard label="Total Used"     val={totalUsed.toLocaleString("en-IN")}             color="#6366f1"   icon={Ticket}      />
        <StatCard label="Unlimited"      val={rows.filter(r => r.limit === 0).length}        color="#f59e0b"   icon={Percent}     />
      </div>

      <SectionCard>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <SearchBar value={q} onChange={setQ} placeholder="Search coupon code…" />
          <select value={typeF} onChange={e => setTypeF(e.target.value)} className={`${inp} w-auto`}>
            {["All","Flat","Percent"].map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={statusF} onChange={e => setStatusF(e.target.value)} className={`${inp} w-auto`}>
            {["All","Active","Inactive"].map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="ml-auto self-center text-xs text-gray-400">{filtered.length} coupon{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(r => {
            const isFlat = r.type === "flat";
            const usagePct = r.limit > 0 ? Math.min((r.used / r.limit) * 100, 100) : null;
            const accentColor = isFlat ? "#6366f1" : "#d97706";
            const accentBg    = isFlat ? "#eef2ff"  : "#fffbeb";
            const accentBorder = isFlat ? "#c7d2fe" : "#fde68a";
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-200 bg-white p-4 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
                {/* Top colour strip */}
                <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl" style={{ background: accentColor }}/>

                {/* Dashed divider simulation */}
                <div className="absolute left-0 right-0 top-1/2 h-px pointer-events-none"
                  style={{ background: "repeating-linear-gradient(90deg,transparent,transparent 6px,#e5e7eb 6px,#e5e7eb 12px)" }}/>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1.5 rounded-xl font-mono font-black text-sm tracking-widest border"
                      style={{ color: accentColor, borderColor: accentBorder, background: accentBg }}>
                      {r.code}
                    </span>
                    <button onClick={() => copyCode(r.id, r.code)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                      title="Copy code">
                      {copied === r.id
                        ? <CheckCircle2 size={11} className="text-green-500"/>
                        : <Copy size={11}/>
                      }
                    </button>
                  </div>
                  <Toggle checked={r.active} onChange={() => toggleActive(r.id)}/>
                </div>

                {/* Discount headline */}
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-3xl font-black leading-none" style={{ color: accentColor }}>
                    {isFlat ? `₹${r.value}` : `${r.value}%`}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 leading-tight">{isFlat ? "flat off" : "off"}</span>
                    {!isFlat && <span className="text-[10px] text-gray-400">max ₹{r.maxDisc}</span>}
                  </div>
                </div>

                {/* Meta */}
                <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
                  Min order ₹{r.minOrder.toLocaleString("en-IN")} &nbsp;·&nbsp; Exp: {r.expiry}
                </p>

                {/* Usage */}
                {usagePct !== null ? (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-gray-400">Usage</span>
                      <span className="text-[10px] font-black text-gray-600">
                        {r.used.toLocaleString("en-IN")} / {r.limit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${usagePct}%`, background: usagePct > 90 ? "#ef4444" : accentColor }}/>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[10px] text-gray-400">{r.used.toLocaleString("en-IN")} used</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-green-50 text-green-600">Unlimited</span>
                  </div>
                )}

                {/* Type badge */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg"
                    style={{ color: accentColor, background: accentBg }}>
                    {isFlat ? "Flat Discount" : "% Discount"}
                  </span>
                  <div className="flex-1"/>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                      <Edit2 size={12}/>
                    </button>
                    <button onClick={() => setDelId(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-gray-400">No coupons match your filters</div>
          )}
        </div>
      </SectionCard>

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Coupon" : "Add Coupon"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Coupon Code">
                <input value={form.code} onChange={e => set("code", e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE20" className={`${inp} uppercase font-mono tracking-widest`}/>
              </Field>
            </div>
            <Field label="Discount Type">
              <select value={form.type} onChange={e => set("type", e.target.value as "flat"|"percent")} className={inp}>
                <option value="flat">Flat (₹ fixed)</option>
                <option value="percent">Percent (%)</option>
              </select>
            </Field>
            <Field label={form.type === "flat" ? "Discount Amount (₹)" : "Discount (%)"}>
              <input type="number" value={form.value} onChange={e => set("value", +e.target.value)} min={1} className={inp}/>
            </Field>
            <Field label="Min Order Amount (₹)">
              <input type="number" value={form.minOrder} onChange={e => set("minOrder", +e.target.value)} min={0} className={inp}/>
            </Field>
            <Field label="Max Discount Cap (₹)">
              <input type="number" value={form.maxDisc} onChange={e => set("maxDisc", +e.target.value)} min={0} className={inp}/>
            </Field>
            <Field label="Expiry Date">
              <input type="text" value={form.expiry} onChange={e => set("expiry", e.target.value)} placeholder="31 Dec 2026" className={inp}/>
            </Field>
            <Field label="Usage Limit (0 = unlimited)">
              <input type="number" value={form.limit} onChange={e => set("limit", +e.target.value)} min={0} className={inp}/>
            </Field>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Toggle checked={form.active} onChange={() => set("active", !form.active)}/>
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={save} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all" style={{ background: G }}>
                {editing ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <DeleteConfirm
        open={delId !== null} onClose={() => setDelId(null)} onConfirm={() => confirmDelete(delId!)}
        title="Delete Coupon" message={`Remove coupon code "${rows.find(r => r.id === delId)?.code}"? This cannot be undone.`}
      />
    </div>
  );
}

export default CouponPage;
