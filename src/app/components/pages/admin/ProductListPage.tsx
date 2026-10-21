import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  Package, CheckCircle2, XCircle, AlertTriangle,
  Eye, Pencil, Trash2, Star, LayoutGrid, List,
} from "lucide-react";
import type { Product } from "./shared/types";
import { G, fmt, disc, prodStatusMeta, card } from "./shared/constants";
import { Modal, PageHeader, SearchBar, StatCard, DeleteConfirm } from "./shared/ui";

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Record<string, unknown>;
  return (
    typeof product.id === "number" &&
    typeof product.name === "string" &&
    typeof product.sku === "string" &&
    typeof product.cat === "string" &&
    typeof product.subcat === "string" &&
    typeof product.emoji === "string" &&
    typeof product.mrp === "number" &&
    typeof product.price === "number" &&
    typeof product.stock === "number" &&
    typeof product.featured === "boolean" &&
    ["active", "inactive", "out_of_stock", "low_stock", "draft"].includes(String(product.status)) &&
    (product.imageUrl === undefined || typeof product.imageUrl === "string") &&
    (product.taxRuleId === undefined || product.taxRuleId === null || typeof product.taxRuleId === "number") &&
    (product.taxRate === undefined || typeof product.taxRate === "number") &&
    (product.taxAmount === undefined || typeof product.taxAmount === "number") &&
    (product.priceWithTax === undefined || typeof product.priceWithTax === "number")
  );
}

export function ProductListPage({ onEdit }: { onEdit: (id: number) => void }) {
  const [products,  setProducts ] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search,    setSearch   ] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterSts, setFilterSts] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selected,  setSelected ] = useState<number[]>([]);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      setLoading(true);
      setLoadError("");
      try {
        const response = await fetch("/api/admin/products", { signal: controller.signal });
        const result: unknown = await response.json();
        if (!response.ok || !result || typeof result !== "object" || !("success" in result) || result.success !== true || !("products" in result) || !Array.isArray(result.products) || !result.products.every(isProduct)) {
          const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
            ? result.message
            : "Could not load products.";
          throw new Error(message);
        }
        setProducts(result.products);
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : "Could not load products.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadProducts();
    return () => controller.abort();
  }, []);

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
    const filteredIds = new Set(filtered.map(p => p.id));
    setSelected(current => allSelected
      ? current.filter(id => !filteredIds.has(id))
      : Array.from(new Set([...current, ...Array.from(filteredIds)])));
  }

  async function deleteProducts(ids: number[]) {
    if (!ids.length) return;
    setDeleting(true);
    setActionError("");
    try {
      const deletedIds = new Set<number>();
      const cleanupWarnings: string[] = [];
      for (let offset = 0; offset < ids.length; offset += 100) {
        const response = await fetch("/api/admin/products", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: ids.slice(offset, offset + 100) }),
        });
        const result = await response.json();
        if (!response.ok || !result.success || !Array.isArray(result.deletedIds)) {
          throw new Error(result.message || "Could not delete the selected product(s).");
        }
        result.deletedIds.forEach((id: number) => deletedIds.add(id));
        if (Array.isArray(result.cleanupWarnings)) cleanupWarnings.push(...result.cleanupWarnings);
        setProducts(previous => previous.filter(product => !deletedIds.has(product.id)));
      }
      setSelected(previous => previous.filter(id => !deletedIds.has(id)));
      setDeleteTarget(null);
      setBulkDeleteOpen(false);
      if (cleanupWarnings.length) {
        setActionError(`Product records were deleted, but some product media could not be removed: ${Array.from(new Set(cleanupWarnings)).join(" ")}`);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not delete the selected product(s).");
    } finally {
      setDeleting(false);
    }
  }

  const cats = ["All", ...Array.from(new Set(products.map(p => p.cat)))];
  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Products › All Products" title="All Products" subtitle="Manage your product catalogue" count={products.length} />

      {loadError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{loadError}</span>
          <button type="button" onClick={() => window.location.reload()} className="shrink-0 font-bold underline">
            Retry
          </button>
        </div>
      )}
      {actionError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p>
      )}

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
              {[["all","All"],["active","Active"],["inactive","Inactive"],["draft","Draft"],["out_of_stock","OOS"],["low_stock","Low"]].map(([val, lab]) => (
                <button key={val} onClick={() => setFilterSts(val)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
                  style={filterSts === val ? { background: G, color: "#fff" } : { color: "#6b7280" }}>
                  {lab}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded accent-[#009966] cursor-pointer" />
                Select all
              </label>
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1" role="group" aria-label="Product view">
                {([
                  { mode: "grid", label: "Grid view", Icon: LayoutGrid },
                  { mode: "list", label: "List view", Icon: List },
                ] as const).map(({ mode, label, Icon }) => (
                  <button key={mode} type="button" aria-label={label} aria-pressed={viewMode === mode}
                    onClick={() => setViewMode(mode)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === mode ? "bg-white text-[#009966] shadow-sm" : "text-gray-400 hover:text-gray-700"}`}>
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          {selected.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
              <span className="text-xs font-bold text-gray-700">{selected.length} selected</span>
              <button onClick={() => { setActionError(""); setBulkDeleteOpen(true); }}
                className="text-xs font-bold text-red-500 hover:text-red-700 ml-auto">
                Delete Selected
              </button>
              <button onClick={() => setSelected([])} className="text-xs font-semibold text-gray-400 hover:text-gray-700">Clear</button>
            </motion.div>
          )}
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {filtered.map(p => {
              const sm = prodStatusMeta[p.status];
              const d = disc(p.mrp, p.price);
              const isSel = selected.includes(p.id);
              return (
                <motion.article key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`rounded-xl border p-4 transition-colors ${isSel ? "border-[#009966]/40 bg-[#009966]/5" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" aria-label={`Select ${p.name}`} checked={isSel} onChange={() => toggleSelect(p.id)}
                      className="mt-1 w-3.5 h-3.5 rounded accent-[#009966] cursor-pointer" />
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0">{p.emoji}</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-gray-800 line-clamp-2">{p.name}</p>
                        <span className="inline-flex px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap"
                          style={{ color: sm.color, background: sm.bg }}>
                          {sm.label}
                        </span>
                      </div>
                      {p.featured && (
                        <span className="mt-1 inline-flex items-center gap-0.5 text-[9px] font-bold" style={{ color: "#f59e0b" }}>
                          <Star size={8} /> Featured
                        </span>
                      )}
                      <p className="mt-1 text-[10px] font-mono text-gray-400">{p.sku}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-[10px] text-gray-400">Category</p>
                      <p className="mt-0.5 text-xs font-semibold text-gray-700">{p.cat || "—"}{p.subcat ? ` / ${p.subcat}` : ""}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Stock</p>
                      <p className={`mt-0.5 text-xs font-bold ${p.stock === 0 ? "text-red-500" : p.stock < 10 ? "text-amber-500" : "text-gray-700"}`}>
                        {p.stock === 0 ? "Out of stock" : p.stock}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Price</p>
                      <p className="mt-0.5 text-xs font-black text-gray-900">{fmt(p.price)}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-gray-400 line-through">{fmt(p.mrp)}</span>
                        {d > 0 && <span className="text-[9px] font-black px-1 py-0.5 rounded" style={{ background: `${G}15`, color: G }}>{d}% off</span>}
                      </div>
                    </div>
                    {(p.taxRate ?? 0) > 0 && (
                      <div>
                        <p className="text-[10px] text-gray-400">Price incl. tax</p>
                        <p className="mt-0.5 text-xs font-semibold text-gray-700">{fmt(p.priceWithTax ?? p.price)}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-1 border-t border-gray-100 pt-2">
                    <button type="button" aria-label={`View ${p.name}`} title="View product" onClick={() => setViewingProduct(p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                      <Eye size={14} />
                    </button>
                    <button type="button" aria-label={`Edit ${p.name}`} title="Edit product" onClick={() => onEdit(p.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all">
                      <Pencil size={14} />
                    </button>
                    <button type="button" aria-label={`Delete ${p.name}`} title="Delete product" onClick={() => { setActionError(""); setDeleteTarget(p); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.article>
              );
            })}
            {filtered.length === 0 && (
              <p className="sm:col-span-2 xl:col-span-3 px-4 py-10 text-center text-sm text-gray-400">
                {loading ? "Loading products from Neon…" : loadError ? "Products could not be loaded." : products.length === 0 ? "No products have been added yet." : "No products match your filters"}
              </p>
            )}
          </div>
        ) : (
        /* Table */
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
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shrink-0">{p.emoji}</div>
                        )}
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
                    <td className="px-3 py-3">
                      <p className="text-xs font-semibold text-gray-700">{p.cat || "—"}</p>
                      {p.subcat && <p className="mt-0.5 text-[10px] text-gray-400">{p.subcat}</p>}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <p className="text-xs font-black text-gray-900">
                        {fmt(p.price)}
                      </p>
                      {(p.taxRate ?? 0) > 0 && (
                        <p className="mt-0.5 text-[10px] text-gray-400">
                          Incl. {fmt(p.taxAmount ?? 0)} tax ({p.taxRate ?? 0}%): {fmt(p.priceWithTax ?? p.price)}
                        </p>
                      )}
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
                      <div className="flex items-center gap-1">
                        <button type="button" aria-label={`View ${p.name}`} title="View product" onClick={() => setViewingProduct(p)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                          <Eye size={13} />
                        </button>
                        <button type="button" aria-label={`Edit ${p.name}`} title="Edit product" onClick={() => onEdit(p.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all">
                          <Pencil size={13} />
                        </button>
                        <button type="button" aria-label={`Delete ${p.name}`} title="Delete product" onClick={() => { setActionError(""); setDeleteTarget(p); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                  {loading ? "Loading products from Neon…" : loadError ? "Products could not be loaded." : products.length === 0 ? "No products have been added yet." : "No products match your filters"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        )}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px] text-gray-400">Showing {filtered.length} of {products.length}</p>
        </div>
      </div>

      <DeleteConfirm
        open={!!deleteTarget} name={deleteTarget?.name ?? ""}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget && !deleting) void deleteProducts([deleteTarget.id]); }}
      />
      <DeleteConfirm
        open={bulkDeleteOpen}
        title="Delete Selected Products"
        message={`Delete ${selected.length} selected product${selected.length === 1 ? "" : "s"}?`}
        onClose={() => !deleting && setBulkDeleteOpen(false)}
        onConfirm={() => { if (!deleting) void deleteProducts(selected); }}
      />

      <Modal open={!!viewingProduct} onClose={() => setViewingProduct(null)} title="Product Details">
        {viewingProduct && (
          <div className="space-y-4">
            {viewingProduct.imageUrl && <img src={viewingProduct.imageUrl} alt={viewingProduct.name} className="h-48 w-full rounded-xl bg-gray-50 object-contain" />}
            <div>
              <h2 className="text-lg font-black text-gray-900">{viewingProduct.name}</h2>
              <p className="mt-1 text-xs text-gray-500">SKU: {viewingProduct.sku || "—"}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-gray-400">Category</dt><dd className="font-semibold text-gray-800">{viewingProduct.cat || "—"}{viewingProduct.subcat ? ` / ${viewingProduct.subcat}` : ""}</dd></div>
              <div><dt className="text-xs text-gray-400">Price</dt><dd className="font-semibold text-gray-800">{fmt(viewingProduct.price)}</dd></div>
              <div><dt className="text-xs text-gray-400">MRP</dt><dd className="font-semibold text-gray-800">{fmt(viewingProduct.mrp)}</dd></div>
              <div><dt className="text-xs text-gray-400">Stock</dt><dd className="font-semibold text-gray-800">{viewingProduct.stock}</dd></div>
              <div><dt className="text-xs text-gray-400">Status</dt><dd className="font-semibold text-gray-800">{prodStatusMeta[viewingProduct.status].label}</dd></div>
              <div><dt className="text-xs text-gray-400">Featured</dt><dd className="font-semibold text-gray-800">{viewingProduct.featured ? "Yes" : "No"}</dd></div>
              {viewingProduct.taxRuleId !== null && viewingProduct.taxRuleId !== undefined && (
                <div><dt className="text-xs text-gray-400">Tax-inclusive price</dt><dd className="font-semibold text-gray-800">{fmt(viewingProduct.priceWithTax ?? viewingProduct.price)}</dd></div>
              )}
            </dl>
          </div>
        )}
      </Modal>

    </div>
  );
}

export default ProductListPage;
