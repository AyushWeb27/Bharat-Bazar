import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Package, CheckCircle2, XCircle, AlertTriangle,
  Eye, Pencil, Trash2, Star,
} from "lucide-react";
import type { Product } from "./shared/types";
import { INIT_PRODUCTS } from "./shared/data";
import { G, fmt, disc, prodStatusMeta, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, DeleteConfirm } from "./shared/ui";

export function ProductListPage() {
  const [products,  setProducts ] = useState<Product[]>(INIT_PRODUCTS);
  const [search,    setSearch   ] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterSts, setFilterSts] = useState("all");
  const [selected,  setSelected ] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchC = filterCat === "All" || p.cat === filterCat;
    const matchS = filterSts === "all" || p.status === filterSts;
    return matchQ && matchC && matchS;
  }), [products, search, filterCat, filterSts]);

  const allSelected = filtered.length > 0 && filtered.every(p => selected.includes(p.id));

  function toggleSelect(id: number) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }
  function toggleAll() {
    setAllSelected(allSelected ? [] : filtered.map(p => p.id));
  }
  function setAllSelected(ids: number[]) { setSelected(ids); }

  function handleDelete(id: number) { setProducts(prev => prev.filter(p => p.id !== id)); }

  const cats = ["All", ...Array.from(new Set(products.map(p => p.cat)))];
  const statuses = ["all","active","inactive","out_of_stock","low_stock"];

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Products › All Products" title="All Products" subtitle="Manage your product catalogue" count={products.length} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Products"   val={products.length}                               color="#6366f1" icon={Package}    />
        <StatCard label="Active"           val={products.filter(p=>p.status==="active").length} color={G}       icon={CheckCircle2}/>
        <StatCard label="Out of Stock"     val={products.filter(p=>p.status==="out_of_stock").length} color="#ef4444" icon={XCircle}  />
        <StatCard label="Low Stock"        val={products.filter(p=>p.status==="low_stock").length}    color="#f59e0b" icon={AlertTriangle}/>
      </div>

      <div className={card}>
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name or SKU…" />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 outline-none focus:border-[#009966] bg-white font-semibold">
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
              {[["all","All"],["active","Active"],["inactive","Inactive"],["out_of_stock","OOS"],["low_stock","Low"]].map(([val, lab]) => (
                <button key={val} onClick={() => setFilterSts(val)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
                  style={filterSts === val ? { background: G, color: "#fff" } : { color: "#6b7280" }}>
                  {lab}
                </button>
              ))}
            </div>
          </div>
          {selected.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
              <span className="text-xs font-bold text-gray-700">{selected.length} selected</span>
              <button className="text-xs font-bold text-red-500 hover:text-red-700 ml-auto">Delete Selected</button>
              <button onClick={() => setSelected([])} className="text-xs font-semibold text-gray-400 hover:text-gray-700">Clear</button>
            </motion.div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded accent-[#009966] cursor-pointer" />
                </th>
                {["Product","SKU","Category","Price","Stock","Status","Actions"].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-3 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => {
                const sm   = prodStatusMeta[p.status];
                const d    = disc(p.mrp, p.price);
                const isSel = selected.includes(p.id);
                return (
                  <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`group hover:bg-gray-50/60 transition-colors ${isSel ? "bg-[#009966]/5" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={isSel} onChange={() => toggleSelect(p.id)}
                        className="w-3.5 h-3.5 rounded accent-[#009966] cursor-pointer" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shrink-0">{p.emoji}</div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate max-w-[180px]">{p.name}</p>
                          {p.featured && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold" style={{ color: "#f59e0b" }}>
                              <Star size={8} /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg whitespace-nowrap">{p.sku}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <p className="text-xs font-black text-gray-900">{fmt(p.price)}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-gray-400 line-through">{fmt(p.mrp)}</span>
                        {d > 0 && <span className="text-[9px] font-black px-1 py-0.5 rounded" style={{ background: `${G}15`, color: G }}>{d}%</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-bold ${p.stock === 0 ? "text-red-500" : p.stock < 10 ? "text-amber-500" : "text-gray-700"}`}>
                        {p.stock === 0 ? "—" : p.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap"
                        style={{ color: sm.color, background: sm.bg }}>
                        {sm.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all">
                          <Eye size={13} />
                        </button>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-amber-500 hover:bg-amber-50 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(p)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No products match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px] text-gray-400">Showing {filtered.length} of {products.length}</p>
          <div className="flex items-center gap-1">
            {[1,2,3,"…",284].map((n, i) => (
              <button key={i} className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all border ${n === 1 ? "text-white border-transparent" : "text-gray-400 border-gray-200 bg-white hover:border-gray-300"}`}
                style={n === 1 ? { background: G } : {}}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <DeleteConfirm
        open={!!deleteTarget} name={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />
    </div>
  );
}

export default ProductListPage;
