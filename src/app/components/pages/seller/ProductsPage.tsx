import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Edit2, Trash2, Package, Upload,
  Eye, EyeOff, Star, TrendingUp, AlertTriangle,
  ChevronDown, X, Check, RotateCcw, Boxes, FileText,
  Truck, Tag, Image, Globe,
} from "lucide-react";
import { S, fmt, card, inp } from "./shared/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductStatus = "Active" | "Inactive" | "OutStock" | "LowStock";

type Product = {
  id: number;
  name: string;
  sku: string;
  cat: string;
  mrp: number;
  price: number;
  stock: number;
  status: ProductStatus;
  rating: number;
  sales: number;
  img: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  { id: 1,  name: "Samsung Galaxy A55",     sku: "EL-SGA55-BLK", cat: "Electronics", mrp: 24999, price: 18999, stock: 12, status: "Active",   rating: 4.8, sales: 142, img: "📱" },
  { id: 2,  name: "Boat Airdopes 141",      sku: "EL-BA141-WHT", cat: "Electronics", mrp: 3499,  price: 2499,  stock: 34, status: "Active",   rating: 4.6, sales: 98,  img: "🎧" },
  { id: 3,  name: "OnePlus Nord CE4",       sku: "EL-OP-NCE4",   cat: "Electronics", mrp: 34999, price: 27999, stock: 0,  status: "OutStock",  rating: 4.5, sales: 76,  img: "📱" },
  { id: 4,  name: "JBL Flip 6 Speaker",     sku: "EL-JBL-F6",    cat: "Electronics", mrp: 7499,  price: 4999,  stock: 22, status: "Active",   rating: 4.7, sales: 63,  img: "🔊" },
  { id: 5,  name: "Mi Smart Band 8",        sku: "EL-MI-SB8",    cat: "Electronics", mrp: 4999,  price: 3499,  stock: 45, status: "Active",   rating: 4.3, sales: 51,  img: "⌚" },
  { id: 6,  name: "Sony WH-1000XM5",       sku: "EL-SONY-XM5",  cat: "Electronics", mrp: 29999, price: 22999, stock: 8,  status: "LowStock", rating: 4.9, sales: 38,  img: "🎧" },
  { id: 7,  name: "HP Pavilion Laptop",     sku: "EL-HP-PAV15",  cat: "Electronics", mrp: 64999, price: 54999, stock: 5,  status: "LowStock", rating: 4.4, sales: 27,  img: "💻" },
  { id: 8,  name: "Apple Watch Series 9",  sku: "EL-AW-S9-41",  cat: "Electronics", mrp: 49999, price: 42999, stock: 11, status: "Active",   rating: 4.8, sales: 23,  img: "⌚" },
  { id: 9,  name: "Redmi Note 13 Pro",     sku: "EL-RN13P-BLU", cat: "Electronics", mrp: 21999, price: 16999, stock: 18, status: "Active",   rating: 4.5, sales: 89,  img: "📱" },
  { id: 10, name: "Noise ColorFit Pro 4",  sku: "EL-NCP4-BLK",  cat: "Electronics", mrp: 4999,  price: 2999,  stock: 67, status: "Active",   rating: 4.2, sales: 54,  img: "⌚" },
  { id: 11, name: "Lenovo IdeaPad Slim 5", sku: "EL-LEN-IPS5",  cat: "Electronics", mrp: 58999, price: 48999, stock: 3,  status: "LowStock", rating: 4.3, sales: 19,  img: "💻" },
  { id: 12, name: "Realme Buds Air 5",     sku: "EL-RBA5-WHT",  cat: "Electronics", mrp: 3499,  price: 2299,  stock: 0,  status: "OutStock",  rating: 4.1, sales: 71,  img: "🎧" },
  { id: 13, name: "iQOO Z9 Lite",         sku: "EL-IQ-Z9L",    cat: "Electronics", mrp: 14999, price: 11999, stock: 29, status: "Active",   rating: 4.4, sales: 45,  img: "📱" },
  { id: 14, name: "Zebronics Zeb-Delight", sku: "EL-ZEB-DLT",   cat: "Electronics", mrp: 1299,  price: 899,   stock: 89, status: "Active",   rating: 3.9, sales: 112, img: "🖱️" },
  { id: 15, name: "Canon EOS 1500D",       sku: "EL-CAN-1500D", cat: "Electronics", mrp: 39999, price: 34999, stock: 7,  status: "LowStock", rating: 4.6, sales: 14,  img: "📷" },
];

// ─── Status meta ──────────────────────────────────────────────────────────────

const STATUS_META: Record<ProductStatus, { label: string; color: string; bg: string }> = {
  Active:   { label: "Active",       color: "#009966", bg: "rgba(0,153,102,0.12)"   },
  Inactive: { label: "Inactive",     color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
  OutStock: { label: "Out of Stock", color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  LowStock: { label: "Low Stock",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

const FILTER_TABS = ["All", "Active", "Inactive", "Out of Stock", "Low Stock"] as const;

function filterProducts(products: Product[], filter: string, q: string) {
  return products.filter(p => {
    const fOk =
      filter === "All"          ? true :
      filter === "Active"       ? p.status === "Active" :
      filter === "Inactive"     ? p.status === "Inactive" :
      filter === "Out of Stock" ? p.status === "OutStock" :
      filter === "Low Stock"    ? p.status === "LowStock" : true;
    const qOk = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase());
    return fOk && qOk;
  });
}

const disc = (mrp: number, price: number) => mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ product, onSave, onClose }: {
  product: Product;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...product });
  const f = (k: keyof Product, v: string | number) => setForm(p => ({ ...p, [k]: v }));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
          <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Editing</p>
              <h3 className="text-sm font-black text-gray-900">{product.name}</h3>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
              <X size={15} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Product Name</label>
              <input value={form.name} onChange={e => f("name", e.target.value)} className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">SKU</label>
                <input value={form.sku} onChange={e => f("sku", e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Category</label>
                <input value={form.cat} onChange={e => f("cat", e.target.value)} className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">MRP (₹)</label>
                <input type="number" value={form.mrp} onChange={e => f("mrp", +e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Selling Price (₹)</label>
                <input type="number" value={form.price} onChange={e => f("price", +e.target.value)} className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Stock</label>
                <input type="number" value={form.stock} onChange={e => f("stock", +e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Status</label>
                <select value={form.status} onChange={e => f("status", e.target.value as ProductStatus)} className={inp}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="LowStock">Low Stock</option>
                  <option value="OutStock">Out of Stock</option>
                </select>
              </div>
            </div>
            {disc(form.mrp, form.price) > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100">
                <Tag size={12} className="text-green-600" />
                <span className="text-xs font-bold text-green-700">{disc(form.mrp, form.price)}% discount applied</span>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={() => { onSave(form); onClose(); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
              style={{ background: S }}>
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirmDialog({ name, onConfirm, onClose }: {
  name: string; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Delete "{name}"?</p>
            <p className="text-xs text-gray-400 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-red-500 hover:bg-red-600 transition-all">Delete</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Stock progress bar ───────────────────────────────────────────────────────

function StockBar({ stock }: { stock: number }) {
  const pct   = Math.min((stock / 100) * 100, 100);
  const color = stock === 0 ? "#ef4444" : stock <= 10 ? "#f59e0b" : "#009966";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold tabular-nums w-6 text-right" style={{ color }}>{stock}</span>
    </div>
  );
}

// ─── TAB: LIST ─────────────────────────────────────────────────────────────────

function ProductListTab() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [filter, setFilter]     = useState<string>("All");
  const [q, setQ]               = useState("");
  const [editing, setEditing]   = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const displayed = filterProducts(products, filter, q);

  const saveProduct   = (p: Product) => setProducts(prev => prev.map(x => x.id === p.id ? p : x));
  const deleteProduct = (id: number) => setProducts(prev => prev.filter(x => x.id !== id));
  const toggleActive  = (id: number) =>
    setProducts(prev => prev.map(x => x.id === id
      ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" }
      : x));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-black text-gray-900">My Products</h2>
          <span className="text-[10px] font-black px-2 py-1 rounded-lg" style={{ background: `${S}15`, color: S }}>
            {products.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-56 bg-white border border-gray-200 rounded-xl pl-8 pr-8 py-2 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all" />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X size={12} />
              </button>
            )}
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white transition-all hover:opacity-90"
            style={{ background: S }}>
            <Plus size={13} /> Add Product
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {FILTER_TABS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={filter === f
              ? { background: S, color: "#fff" }
              : { background: "#f3f4f6", color: "#6b7280" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                {["#", "Product", "Category", "Price", "Stock", "Status", "Rating", "Sales", "Actions"].map(h => (
                  <th key={h} className="text-left text-[9px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayed.map((p, i) => {
                const sm = STATUS_META[p.status];
                const d  = disc(p.mrp, p.price);
                return (
                  <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="group hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold text-gray-300">{i + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shrink-0">
                          {p.img}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 whitespace-nowrap">{p.name}</p>
                          <p className="text-[9px] font-mono text-gray-400">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{p.cat}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-xs font-black text-gray-900">{fmt(p.price)}</p>
                        <div className="flex items-center gap-1">
                          <p className="text-[9px] text-gray-400 line-through">{fmt(p.mrp)}</p>
                          {d > 0 && (
                            <span className="text-[8px] font-black px-1 py-0.5 rounded" style={{ background: "rgba(0,153,102,0.1)", color: "#009966" }}>
                              -{d}%
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[110px]">
                      <StockBar stock={p.stock} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap"
                        style={{ color: sm.color, background: sm.bg }}>
                        {sm.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={10} fill="#f59e0b" stroke="none" />
                        <span className="text-xs font-bold text-gray-700">{p.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={10} className="text-gray-400" />
                        <span className="text-xs text-gray-600">{p.sales}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditing(p)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#6366f1] hover:bg-[#6366f1]/10 transition-all"
                          title="Edit">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => toggleActive(p.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#009966] hover:bg-green-50 transition-all"
                          title={p.status === "Active" ? "Deactivate" : "Activate"}>
                          {p.status === "Active" ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                        <button onClick={() => setDeleting(p)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {displayed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Package size={28} className="text-gray-200" />
              <p className="text-sm font-bold text-gray-400">No products found</p>
              {q && <button onClick={() => setQ("")} className="text-xs font-bold" style={{ color: S }}>Clear search</button>}
            </div>
          )}
        </div>
      </div>

      {editing  && <EditModal product={editing}  onSave={saveProduct} onClose={() => setEditing(null)}  />}
      {deleting && <DeleteConfirmDialog name={deleting.name} onConfirm={() => deleteProduct(deleting.id)} onClose={() => setDeleting(null)} />}
    </div>
  );
}

// ─── TAB: ADD ─────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200"
      style={{ background: on ? S : "#d1d5db" }}>
      <span className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200"
        style={{ transform: on ? "translateX(16px)" : "translateX(0)" }} />
    </button>
  );
}

function AddProductTab() {
  const [form, setForm] = useState({
    name: "", category: "", brand: "", sku: "", description: "",
    mrp: "", price: "", gst: "18", stock: "", minOrder: "1", maxOrder: "10", warehouse: "",
    weight: "", length: "", width: "", height: "",
    freeShipping: true, cod: true,
    metaTitle: "", metaDesc: "", tags: "",
  });

  const set = (k: keyof typeof form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));
  const d   = form.mrp && form.price && +form.mrp > +form.price ? Math.round((1 - +form.price / +form.mrp) * 100) : 0;

  const required = [
    { label: "Product Name",  done: form.name.trim().length > 2    },
    { label: "Category",      done: form.category !== ""            },
    { label: "MRP",           done: form.mrp !== "" && +form.mrp > 0 },
    { label: "Selling Price", done: form.price !== "" && +form.price > 0 },
    { label: "Stock Qty",     done: form.stock !== "" && +form.stock >= 0 },
  ];
  const allReady = required.every(r => r.done);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* ── LEFT ── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Basic Info */}
        <section className={`${card} overflow-hidden`}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
            <Package size={14} className="text-gray-400" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Basic Info</span>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Product Name <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Samsung Galaxy A55" className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Category <span className="text-red-400">*</span></label>
                <select value={form.category} onChange={e => set("category", e.target.value)} className={inp}>
                  <option value="">Select category</option>
                  {["Electronics","Fashion","Beauty","Sports","Home & Living","Grocery","Books","Toys"].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Brand</label>
                <input value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="e.g. Samsung" className={inp} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">SKU</label>
              <input value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="e.g. EL-SGA55-BLK" className={inp} />
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                rows={3} placeholder="Describe your product…" className={`${inp} resize-none`} />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className={`${card} overflow-hidden`}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
            <Tag size={14} className="text-gray-400" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Pricing</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">MRP (₹) <span className="text-red-400">*</span></label>
                <input type="number" value={form.mrp} onChange={e => set("mrp", e.target.value)} placeholder="24999" className={inp} />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Selling Price (₹) <span className="text-red-400">*</span></label>
                <input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="18999" className={inp} />
              </div>
            </div>
            {d > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100">
                <Check size={12} className="text-green-600" />
                <span className="text-xs font-bold text-green-700">
                  {d}% discount — buyers save {form.mrp && form.price ? fmt(+form.mrp - +form.price) : "₹0"}
                </span>
              </div>
            )}
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">GST %</label>
              <select value={form.gst} onChange={e => set("gst", e.target.value)} className={inp}>
                {["0","5","12","18","28"].map(g => <option key={g} value={g}>{g}%</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Inventory */}
        <section className={`${card} overflow-hidden`}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
            <Boxes size={14} className="text-gray-400" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Inventory</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Stock Qty <span className="text-red-400">*</span></label>
                <input type="number" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="0" className={inp} />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Min Order</label>
                <input type="number" value={form.minOrder} onChange={e => set("minOrder", e.target.value)} placeholder="1" className={inp} />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Max Order</label>
                <input type="number" value={form.maxOrder} onChange={e => set("maxOrder", e.target.value)} placeholder="10" className={inp} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Warehouse Location</label>
              <input value={form.warehouse} onChange={e => set("warehouse", e.target.value)} placeholder="e.g. Mumbai WH-1, Rack B4" className={inp} />
            </div>
          </div>
        </section>

        {/* Shipping */}
        <section className={`${card} overflow-hidden`}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
            <Truck size={14} className="text-gray-400" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Shipping</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                  <span className="flex items-center gap-1"><Weight size={10} /> Weight (kg)</span>
                </label>
                <input type="number" value={form.weight} onChange={e => set("weight", e.target.value)} placeholder="0.5" className={inp} />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Dimensions (cm)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["length","width","height"] as const).map(dim => (
                    <div key={dim} className="relative">
                      <input type="number" value={form[dim]} onChange={e => set(dim, e.target.value)}
                        placeholder="0"
                        className={inp + " !py-2 !px-2 text-center"} />
                      <span className="absolute bottom-0.5 right-1 text-[8px] text-gray-300 capitalize">{dim[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <Toggle on={form.freeShipping} onChange={() => set("freeShipping", !form.freeShipping)} />
                <span className="text-xs font-bold text-gray-700">Free Shipping</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Toggle on={form.cod} onChange={() => set("cod", !form.cod)} />
                <span className="text-xs font-bold text-gray-700">COD Available</span>
              </label>
            </div>
          </div>
        </section>

        {/* Images */}
        <section className={`${card} overflow-hidden`}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
            <Image size={14} className="text-gray-400" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Images</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-4 gap-3">
              {[0,1,2,3].map(i => (
                <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#6366f1] hover:bg-[#6366f1]/5 transition-all group">
                  <Upload size={16} className="text-gray-300 group-hover:text-[#6366f1] transition-colors" />
                  <span className="text-[9px] font-bold text-gray-400 group-hover:text-[#6366f1] transition-colors text-center leading-tight px-1">
                    {i === 0 ? "Main Image" : "Add Image"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO */}
        <section className={`${card} overflow-hidden`}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
            <Globe size={14} className="text-gray-400" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">SEO</span>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Meta Title</label>
              <input value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)} placeholder="SEO friendly title…" className={inp} />
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Meta Description</label>
              <textarea value={form.metaDesc} onChange={e => set("metaDesc", e.target.value)}
                rows={2} placeholder="Brief description for search engines…" className={`${inp} resize-none`} />
            </div>
            <div>
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="e.g. smartphone, android, samsung" className={inp} />
            </div>
          </div>
        </section>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="space-y-4 lg:sticky lg:top-5 h-fit">

        {/* Live Preview */}
        <div className={`${card} p-4 space-y-3`}>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Live Preview</p>
          <div className="rounded-xl border border-gray-100 p-3 space-y-2">
            <div className="w-full aspect-video rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
              {form.name ? <span className="text-4xl">🛍️</span> : <Package size={24} className="text-gray-200" />}
            </div>
            <p className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[2rem]">
              {form.name || <span className="text-gray-300 font-normal">Product name will appear here</span>}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black" style={{ color: S }}>
                {form.price ? fmt(+form.price) : "₹—"}
              </span>
              {d > 0 && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: `${S}15`, color: S }}>
                  {d}% OFF
                </span>
              )}
            </div>
            {form.mrp && form.price && +form.mrp > +form.price && (
              <p className="text-[10px] text-gray-400 line-through">{fmt(+form.mrp)}</p>
            )}
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={10} fill={n <= 4 ? "#f59e0b" : "#e5e7eb"} stroke="none" />
              ))}
              <span className="text-[9px] text-gray-400 ml-1">(0 reviews)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: form.stock && +form.stock > 0 ? "#009966" : "#d1d5db" }} />
              <span className="text-[9px] font-bold" style={{ color: form.stock && +form.stock > 0 ? "#009966" : "#9ca3af" }}>
                {form.stock && +form.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>

        {/* Required fields checklist */}
        <div className={`${card} p-4 space-y-3`}>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Required Fields</p>
          <div className="space-y-2">
            {required.map(r => (
              <div key={r.label} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={{ background: r.done ? "rgba(0,153,102,0.12)" : "#f3f4f6" }}>
                  {r.done
                    ? <Check size={9} style={{ color: "#009966" }} />
                    : <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                </div>
                <span className="text-xs font-medium transition-colors" style={{ color: r.done ? "#374151" : "#9ca3af" }}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          <button className="w-full py-2.5 rounded-xl border-2 text-sm font-black transition-all hover:bg-gray-50"
            style={{ borderColor: S, color: S }}>
            Save as Draft
          </button>
          <button disabled={!allReady}
            className="w-full py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: S }}>
            Publish Product
          </button>
        </div>

        {/* Publishing note */}
        <div className="px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
            Products go live after admin approval (usually within 2–4 hours)
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: INVENTORY ───────────────────────────────────────────────────────────

function InventoryTab() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [csv, setCsv]           = useState("");

  const adjust = (id: number, delta: number) =>
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));

  const inStock  = products.filter(p => p.stock > 10).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outStock = products.filter(p => p.stock === 0).length;

  const statCards = [
    { label: "In Stock",     val: inStock,  color: "#009966", Icon: Check         },
    { label: "Low Stock",    val: lowStock, color: "#f59e0b", Icon: AlertTriangle  },
    { label: "Out of Stock", val: outStock, color: "#ef4444", Icon: X              },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-black text-gray-900">Inventory Management</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map(s => (
          <div key={s.label} className={`${card} p-4 flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
              <s.Icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{s.val}</p>
              <p className="text-[10px] text-gray-400 font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory table */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                {["Product","SKU","Current Stock","Min Stock","Status","Stock Level","Quick Update","Action"].map(h => (
                  <th key={h} className="text-left text-[9px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => {
                const sm    = STATUS_META[p.status];
                const color = p.stock === 0 ? "#ef4444" : p.stock <= 10 ? "#f59e0b" : "#009966";
                const pct   = Math.min((p.stock / 100) * 100, 100);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{p.img}</span>
                        <p className="text-xs font-bold text-gray-800 max-w-[130px] truncate">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-mono text-gray-400">{p.sku}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-black" style={{ color }}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">10</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap"
                        style={{ color: sm.color, background: sm.bg }}>
                        {sm.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[100px]">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => adjust(p.id, -1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-200 font-bold text-sm leading-none">
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-700 tabular-nums">{p.stock}</span>
                        <button onClick={() => adjust(p.id, 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all border border-gray-200 font-bold text-sm leading-none">
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[#6366f1] hover:text-[#6366f1] transition-all whitespace-nowrap">
                        <RotateCcw size={9} /> Reorder
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Stock Update */}
      <div className={`${card} p-5 space-y-4`}>
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-gray-400" />
          <p className="text-xs font-black text-gray-600 uppercase tracking-wider">Bulk Stock Update</p>
        </div>
        <p className="text-[11px] text-gray-400">
          Paste CSV data or upload a file. Format:{" "}
          <code className="text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded font-mono text-[10px]">SKU,quantity</code>
        </p>
        <textarea
          value={csv} onChange={e => setCsv(e.target.value)}
          rows={4}
          placeholder={"EL-SGA55-BLK,50\nEL-BA141-WHT,100\nEL-JBL-F6,25"}
          className={`${inp} resize-none font-mono text-xs`}
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Upload size={12} /> Upload CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <ChevronDown size={12} /> Download Template
          </button>
          {csv && (
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white transition-all hover:opacity-90"
              style={{ background: S }}>
              <Check size={12} /> Apply Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SellerProductsPage({ tab }: { tab: "list" | "add" | "inventory" }) {
  const [activeTab, setActiveTab] = useState<"list" | "add" | "inventory">(tab);

  const TABS: { id: "list" | "add" | "inventory"; label: string }[] = [
    { id: "list",      label: "My Products" },
    { id: "add",       label: "Add Product" },
    { id: "inventory", label: "Inventory"   },
  ];

  return (
    <div className="space-y-5">
      {/* Tab strip */}
      <div className="flex items-center gap-0 border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="relative px-4 py-2.5 text-xs font-bold transition-colors"
            style={{ color: activeTab === t.id ? S : "#6b7280" }}>
            {t.label}
            {activeTab === t.id && (
              <motion.div layoutId="seller-product-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: S }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}>
          {activeTab === "list"      && <ProductListTab />}
          {activeTab === "add"       && <AddProductTab />}
          {activeTab === "inventory" && <InventoryTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default SellerProductsPage;
