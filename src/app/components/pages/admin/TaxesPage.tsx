import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Percent, CheckCircle2, Layers, Package, Pencil, Trash2,
} from "lucide-react";
import type { TaxRule } from "./shared/types";
import { INIT_TAXES } from "./shared/data";
import { G, taxTypeMeta, inp, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, Modal, Field, Toggle, StatusPill, DeleteConfirm } from "./shared/ui";

export function TaxesPage() {
  const [taxes,    setTaxes   ] = useState<TaxRule[]>(INIT_TAXES);
  const [search,   setSearch  ] = useState("");
  const [modalOpen,setModalOpen] = useState(false);
  const [editId,   setEditId  ] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxRule | null>(null);
  const [form, setForm] = useState({ name: "", slab: 18, type: "GST" as "GST"|"IGST"|"Customs", category: "", active: true });

  const filtered = useMemo(() =>
    taxes.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
  , [taxes, search]);

  const GST_SLABS = [0, 5, 12, 18, 28];

  function openAdd() {
    setEditId(null);
    setForm({ name: "", slab: 18, type: "GST", category: "", active: true });
    setModalOpen(true);
  }
  function openEdit(t: TaxRule) {
    setEditId(t.id);
    setForm({ name: t.name, slab: t.slab, type: t.type, category: t.category, active: t.active });
    setModalOpen(true);
  }
  function handleSave() {
    if (!form.name.trim()) return;
    if (editId !== null) {
      setTaxes(prev => prev.map(t => t.id === editId ? { ...t, ...form } : t));
    } else {
      const newId = Math.max(...taxes.map(t => t.id)) + 1;
      setTaxes(prev => [...prev, { id: newId, ...form, products: 0 }]);
    }
    setModalOpen(false);
  }
  function toggleStatus(id: number) {
    setTaxes(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  }
  function handleDelete(id: number) { setTaxes(prev => prev.filter(t => t.id !== id)); }

  const totalProducts = taxes.reduce((a, t) => a + t.products, 0);
  const activeTaxes   = taxes.filter(t => t.active).length;

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Products › Taxes" title="Tax Rules" subtitle="Manage GST, IGST and customs duties"
        count={taxes.length} onAdd={openAdd} addLabel="Add Tax Rule" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Rules"     val={taxes.length}                color="#6366f1" icon={Percent}      />
        <StatCard label="Active Rules"    val={activeTaxes}                 color={G}       icon={CheckCircle2} />
        <StatCard label="Products Taxed"  val={totalProducts.toLocaleString("en-IN")} color="#f59e0b" icon={Package} />
        <StatCard label="GST Slabs"       val="5"                           color="#8b5cf6" icon={Layers}       />
      </div>

      {/* GST slab overview */}
      <div className={`${card} p-5`}>
        <p className="text-sm font-black text-gray-900 mb-1">Indian GST Structure</p>
        <p className="text-xs text-gray-400 mb-4">Standard slabs applied to product categories</p>
        <div className="grid grid-cols-5 gap-2">
          {GST_SLABS.map((slab, i) => {
            const colors = [G, "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];
            return (
              <div key={slab} className="p-3 rounded-xl border border-gray-100 text-center hover:shadow-sm transition-all cursor-pointer"
                style={{ background: `${colors[i]}08` }}>
                <p className="text-xl font-black" style={{ color: colors[i] }}>{slab}%</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">{slab === 0 ? "Exempt" : "GST"}</p>
                <p className="text-[10px] text-gray-300 mt-0.5">
                  {taxes.filter(t => t.slab === slab).reduce((a, t) => a + t.products, 0).toLocaleString("en-IN")} prods
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className={card}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search tax rules…" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["#","Tax Name","Slab","Type","Category","Products","Status","Actions"].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((t, i) => {
                const tm = taxTypeMeta[t.type];
                return (
                  <motion.tr key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="group hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-gray-800">{t.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xl font-black" style={{ color: t.slab === 0 ? G : t.slab <= 12 ? "#3b82f6" : t.slab <= 18 ? "#8b5cf6" : "#ef4444" }}>
                        {t.slab}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap" style={{ color: tm.color, background: tm.bg }}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{t.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-gray-700">{t.products.toLocaleString("en-IN")}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Toggle on={t.active} onChange={() => toggleStatus(t.id)} />
                        <StatusPill active={t.active} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(t)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(t)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">Showing {filtered.length} of {taxes.length} rules</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Tax Rule" : "Add Tax Rule"}>
        <Field label="Rule Name">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. GST 18% — Electronics" className={inp} />
        </Field>
        <Field label="Tax Type">
          <div className="flex gap-2">
            {(["GST","IGST","Customs"] as const).map(type => (
              <button key={type} onClick={() => setForm(f => ({ ...f, type }))}
                className="flex-1 py-2.5 rounded-xl border text-xs font-black transition-all"
                style={form.type === type
                  ? { background: G, color: "#fff", borderColor: G }
                  : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }}>
                {type}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Tax Slab (%)">
          <div className="grid grid-cols-5 gap-2">
            {[0,5,12,18,28].map(s => (
              <button key={s} onClick={() => setForm(f => ({ ...f, slab: s }))}
                className="py-2.5 rounded-xl border text-sm font-black transition-all"
                style={form.slab === s
                  ? { background: G, color: "#fff", borderColor: G }
                  : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }}>
                {s}%
              </button>
            ))}
          </div>
        </Field>
        <Field label="Applies to Category">
          <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            placeholder="e.g. Electronics & Apparel" className={inp} />
        </Field>
        <Field label="Status">
          <div className="flex items-center gap-3 pt-1">
            <Toggle on={form.active} onChange={() => setForm(f => ({ ...f, active: !f.active }))} />
            <span className="text-sm text-gray-600 font-medium">{form.active ? "Active" : "Inactive"}</span>
          </div>
        </Field>
        <div className="flex gap-3 pt-2">
          <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all" style={{ background: G }}>
            {editId ? "Save Changes" : "Add Rule"}
          </button>
        </div>
      </Modal>

      <DeleteConfirm
        open={!!deleteTarget} name={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  );
}

export default TaxesPage;
