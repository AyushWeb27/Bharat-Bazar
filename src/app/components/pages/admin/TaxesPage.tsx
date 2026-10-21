import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  Percent, CheckCircle2, Layers, Package, Pencil, Trash2,
} from "lucide-react";
import type { TaxRule, TaxType } from "./shared/types";
import { G, taxTypeMeta, inp, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, Modal, Field, Toggle, StatusPill, DeleteConfirm } from "./shared/ui";

export function TaxesPage() {
  const [taxes,    setTaxes   ] = useState<TaxRule[]>([]);
  const [search,   setSearch  ] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen,setModalOpen] = useState(false);
  const [editId,   setEditId  ] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxRule | null>(null);
  const [form, setForm] = useState({ name: "", slab: 18 as number | null, rateLabel: "18%", type: "GST" as TaxType, category: "*", active: true });

  useEffect(() => {
    const controller = new AbortController();
    async function loadTaxes() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/admin/taxes", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || !result.success || !Array.isArray(result.taxes)) {
          throw new Error(result.message || "Failed to load tax rules.");
        }
        setTaxes(result.taxes as TaxRule[]);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load tax rules.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadTaxes();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() =>
    taxes.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
  , [taxes, search]);

  const GST_SLABS = [0, 5, 12, 18, 28];

  function openAdd() {
    setEditId(null);
    setForm({ name: "", slab: 18, rateLabel: "18%", type: "GST", category: "*", active: true });
    setModalOpen(true);
  }
  function openEdit(t: TaxRule) {
    setEditId(t.id);
    setForm({ name: t.name, slab: t.slab, rateLabel: t.rateLabel, type: t.type, category: t.category, active: t.active });
    setModalOpen(true);
  }
  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/taxes", {
        method: editId === null ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rate: form.slab, id: editId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save tax rule.");
      }
      const savedTax = result.tax as TaxRule;
      setTaxes(previous => previous.some(tax => tax.id === savedTax.id)
        ? previous.map(tax => tax.id === savedTax.id ? savedTax : tax)
        : [...previous, savedTax]);
      setModalOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save tax rule.");
    } finally {
      setSaving(false);
    }
  }
  async function toggleStatus(id: number) {
    const tax = taxes.find(item => item.id === id);
    if (!tax) return;
    try {
      const response = await fetch("/api/admin/taxes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tax, rate: tax.slab, active: !tax.active }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to update tax rule.");
      setTaxes(previous => previous.map(item => item.id === id ? result.tax as TaxRule : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update tax rule.");
    }
  }
  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/admin/taxes?id=${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to delete tax rule.");
      setTaxes(prev => prev.filter(t => t.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete tax rule.");
    }
  }

  const totalProducts = taxes.reduce((a, t) => a + t.products, 0);
  const activeTaxes   = taxes.filter(t => t.active).length;

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Products › Taxes" title="Tax Rules" subtitle="Manage GST, IGST and customs duties"
        count={taxes.length} onAdd={openAdd} addLabel="Add Tax Rule" />
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Rules"     val={taxes.length}                color="#6366f1" icon={Percent}      />
        <StatCard label="Active Rules"    val={activeTaxes}                 color={G}       icon={CheckCircle2} />
        <StatCard label="Products Taxed"  val={totalProducts.toLocaleString("en-IN")} color="#f59e0b" icon={Package} />
        <StatCard label="GST Slabs"       val={new Set(taxes.filter(t => t.type === "GST" && t.slab !== null).map(t => t.slab)).size} color="#8b5cf6" icon={Layers} />
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
                      <span className="text-xl font-black" style={{ color: t.slab === null ? "#f59e0b" : t.slab === 0 ? G : t.slab <= 12 ? "#3b82f6" : t.slab <= 18 ? "#8b5cf6" : "#ef4444" }}>
                        {t.rateLabel || (t.slab === null ? "Not configured" : `${t.slab}%`)}
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
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                  {error ? "Tax rules could not be loaded." : "No tax rules found. Add a rule to get started."}
                </td></tr>
              )}
              {loading && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">Loading tax rules…</td></tr>
              )}
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
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as TaxType }))} className={inp}>
            {(["GST", "Central Tax", "State Tax", "Union Territory Tax", "Integrated Tax", "IGST", "Cess", "Customs"] as TaxType[]).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </Field>
        <Field label="Tax Rate (%)">
          <input type="number" min="0" max="100" step="0.01" value={form.slab ?? ""}
            onChange={e => setForm(f => ({
              ...f,
              slab: e.target.value === "" ? null : Number(e.target.value),
              rateLabel: e.target.value === "" ? "" : `${Number(e.target.value)}%`,
            }))}
            placeholder="Leave blank if variable / not configured" className={inp} />
        </Field>
        <Field label="Rate Label" hint="Used to display variable or product-specific rates">
          <input value={form.rateLabel} onChange={e => setForm(f => ({ ...f, rateLabel: e.target.value }))}
            placeholder="e.g. 0%–14%* or Product-specific" className={inp} />
        </Field>
        <Field label="Category / Tax Scope" hint="Descriptive scope; product tax jurisdiction is selected by the admin">
          <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            placeholder="Category name or *" className={inp} />
        </Field>
        <Field label="Status">
          <div className="flex items-center gap-3 pt-1">
            <Toggle on={form.active} onChange={() => setForm(f => ({ ...f, active: !f.active }))} />
            <span className="text-sm text-gray-600 font-medium">{form.active ? "Active" : "Inactive"}</span>
          </div>
        </Field>
        <div className="flex gap-3 pt-2">
          <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={() => void handleSave()} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60" style={{ background: G }}>
            {saving ? "Saving…" : editId ? "Save Changes" : "Add Rule"}
          </button>
        </div>
      </Modal>

      <DeleteConfirm
        open={!!deleteTarget} name={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && void handleDelete(deleteTarget.id)}
      />
    </div>
  );
}

export default TaxesPage;
