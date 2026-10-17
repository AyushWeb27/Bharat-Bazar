"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Search, Edit2, Trash2, Copy, X, Check, ChevronDown,
  Package, Filter,
} from "lucide-react";

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const inp =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

// ─── Data ─────────────────────────────────────────────────────────────────────

type Status = "Active" | "LowStock" | "OutStock" | "Inactive";

type Product = {
  id: number;
  name: string;
  sku: string;
  cat: string;
  mrp: number;
  price: number;
  stock: number;
  status: Status;
  sales: number;
  img: string;
};

const INIT_PRODUCTS: Product[] = [
  { id: 1,  name: "Samsung Galaxy A55",     sku: "EL-SGA55-BLK",  cat: "Smartphones",  mrp: 24999, price: 18999, stock: 12, status: "Active",   sales: 142, img: "📱" },
  { id: 2,  name: "Boat Airdopes 141",      sku: "EL-BA141-WHT",  cat: "Audio",        mrp: 3499,  price: 2499,  stock: 34, status: "Active",   sales: 98,  img: "🎧" },
  { id: 3,  name: "OnePlus Nord CE4",       sku: "EL-OP-NCE4",    cat: "Smartphones",  mrp: 34999, price: 27999, stock: 0,  status: "OutStock", sales: 76,  img: "📱" },
  { id: 4,  name: "JBL Flip 6 Speaker",    sku: "EL-JBL-F6",     cat: "Audio",        mrp: 7499,  price: 4999,  stock: 22, status: "Active",   sales: 63,  img: "🔊" },
  { id: 5,  name: "Mi Smart Band 8",        sku: "EL-MI-SB8",     cat: "Wearables",    mrp: 4999,  price: 3499,  stock: 45, status: "Active",   sales: 51,  img: "⌚" },
  { id: 6,  name: "Sony WH-1000XM5",       sku: "EL-SONY-XM5",   cat: "Audio",        mrp: 29999, price: 22999, stock: 8,  status: "LowStock", sales: 38,  img: "🎧" },
  { id: 7,  name: "HP Pavilion Laptop",    sku: "EL-HP-PAV15",   cat: "Laptops",      mrp: 64999, price: 54999, stock: 5,  status: "LowStock", sales: 27,  img: "💻" },
  { id: 8,  name: "Apple Watch Series 9",  sku: "EL-AW-S9-41",   cat: "Wearables",    mrp: 49999, price: 42999, stock: 11, status: "Active",   sales: 23,  img: "⌚" },
  { id: 9,  name: "Redmi Note 13 Pro",     sku: "EL-RN13P-BLU",  cat: "Smartphones",  mrp: 21999, price: 16999, stock: 18, status: "Active",   sales: 89,  img: "📱" },
  { id: 10, name: "Noise ColorFit Pro 4",  sku: "EL-NCP4-BLK",   cat: "Wearables",    mrp: 4999,  price: 2999,  stock: 67, status: "Active",   sales: 54,  img: "⌚" },
  { id: 11, name: "Lenovo IdeaPad Slim 5", sku: "EL-LEN-IPS5",   cat: "Laptops",      mrp: 58999, price: 48999, stock: 3,  status: "LowStock", sales: 19,  img: "💻" },
  { id: 12, name: "Realme Buds Air 5",     sku: "EL-RBA5-WHT",   cat: "Audio",        mrp: 3499,  price: 2299,  stock: 0,  status: "OutStock", sales: 71,  img: "🎧" },
  { id: 13, name: "iQOO Z9 Lite",          sku: "EL-IQ-Z9L",     cat: "Smartphones",  mrp: 14999, price: 11999, stock: 29, status: "Active",   sales: 45,  img: "📱" },
  { id: 14, name: "Zebronics Zeb-Delight", sku: "EL-ZEB-DLT",    cat: "Accessories",  mrp: 1299,  price: 899,   stock: 89, status: "Active",   sales: 112, img: "🖱️" },
  { id: 15, name: "Canon EOS 1500D",       sku: "EL-CAN-1500D",  cat: "Cameras",      mrp: 39999, price: 34999, stock: 7,  status: "LowStock", sales: 14,  img: "📷" },
];

const STATUS_META: Record<Status, { bg: string; text: string; label: string }> = {
  Active:   { bg: "#00996618", text: G,         label: "Active"        },
  LowStock: { bg: "#f59e0b18", text: "#d97706", label: "Low Stock"     },
  OutStock: { bg: "#ef444418", text: "#ef4444", label: "Out of Stock"  },
  Inactive: { bg: "#6b728018", text: "#6b7280", label: "Inactive"      },
};

const STATUS_TABS: Array<{ key: string; label: string }> = [
  { key: "All",      label: "All"          },
  { key: "Active",   label: "Active"       },
  { key: "Inactive", label: "Inactive"     },
  { key: "OutStock", label: "Out of Stock" },
  { key: "LowStock", label: "Low Stock"    },
];

const CATEGORIES = ["All", "Smartphones", "Laptops", "Audio", "Wearables", "Cameras", "Accessories"];

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ product, onSave, onClose }: {
  product: Product;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [name,   setName]   = useState(product.name);
  const [mrp,    setMrp]    = useState(String(product.mrp));
  const [price,  setPrice]  = useState(String(product.price));
  const [stock,  setStock]  = useState(String(product.stock));
  const [status, setStatus] = useState<Status>(product.status);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className={`${card} w-full max-w-md p-6`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name</label>
            <input className={inp} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">MRP (₹)</label>
              <input className={inp} type="number" value={mrp} onChange={e => setMrp(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Selling Price (₹)</label>
              <input className={inp} type="number" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Stock Quantity</label>
            <input className={inp} type="number" value={stock} onChange={e => setStock(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select className={inp} value={status} onChange={e => setStatus(e.target.value as Status)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="LowStock">Low Stock</option>
              <option value="OutStock">Out of Stock</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...product, name, mrp: parseFloat(mrp) || product.mrp, price: parseFloat(price) || product.price, stock: parseInt(stock) || 0, status })}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: G }}
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SellerProductListPage() {
  const [products, setProducts]     = useState<Product[]>(INIT_PRODUCTS);
  const [search, setSearch]         = useState("");
  const [catFilter, setCatFilter]   = useState("All");
  const [statusTab, setStatusTab]   = useState("All");
  const [selected, setSelected]     = useState<Set<number>>(new Set());
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId]     = useState<number | null>(null);

  // Filter
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "All" || p.cat === catFilter;
      const matchStatus = statusTab === "All" || p.status === statusTab;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, catFilter, statusTab]);

  function toggleSelect(id: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(p => p.id)));
    }
  }

  function bulkSetStatus(status: Status) {
    setProducts(prev =>
      prev.map(p => selected.has(p.id) ? { ...p, status } : p)
    );
    setSelected(new Set());
  }

  function bulkDelete() {
    setProducts(prev => prev.filter(p => !selected.has(p.id)));
    setSelected(new Set());
  }

  function handleEdit(p: Product) { setEditProduct(p); }

  function handleSaveEdit(updated: Product) {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditProduct(null);
  }

  function handleDuplicate(p: Product) {
    const dup: Product = { ...p, id: Date.now(), name: p.name + " (Copy)", sku: p.sku + "-CP", stock: 0, sales: 0 };
    setProducts(prev => [...prev, dup]);
  }

  function handleDelete(id: number) {
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
  }

  const discount = (mrp: number, price: number) =>
    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const allSelected = filtered.length > 0 && selected.size === filtered.length;
  const someSelected = selected.size > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Product List</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
            {products.length} products
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
          style={{ background: G }}
        >
          <Plus size={16} /> Add Product
        </motion.button>
      </div>

      {/* Filters */}
      <div className={`${card} p-4 mb-4`}>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className={inp + " pl-8"}
              placeholder="Search by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Category filter */}
          <div className="relative">
            <select
              className={inp + " pr-8 appearance-none min-w-36"}
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        {/* Status tabs */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusTab === tab.key
                  ? "text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={statusTab === tab.key ? { background: G } : {}}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">
                ({tab.key === "All" ? products.length : products.filter(p => p.status === tab.key).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {someSelected && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 mb-3 p-3 rounded-xl border border-dashed"
            style={{ borderColor: G + "60", background: G + "06" }}
          >
            <span className="text-xs font-semibold" style={{ color: G }}>
              {selected.size} selected
            </span>
            <div className="flex gap-2 ml-2">
              <button
                onClick={() => bulkSetStatus("Active")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Activate Selected
              </button>
              <button
                onClick={() => bulkSetStatus("Inactive")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Deactivate Selected
              </button>
              <button
                onClick={bulkDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              >
                Delete Selected
              </button>
            </div>
            <button
              onClick={() => setSelected(new Set())}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-gray-300 accent-[#009966]"
                  />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 w-10">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 w-36">Stock</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 w-28">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 w-20">Sales</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const disc = discount(p.mrp, p.price);
                const isLow = p.stock > 0 && p.stock <= 10;
                const maxStock = 100;
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b border-gray-50 hover:bg-gray-50/70 transition-colors ${selected.has(p.id) ? "bg-green-50/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded border-gray-300 accent-[#009966]"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl flex-shrink-0">{p.img}</span>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-tight">{p.name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">{p.cat}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-gray-900">{fmt(p.price)}</span>
                        {p.mrp > p.price && (
                          <>
                            <span className="text-xs text-gray-400 line-through ml-1.5">{fmt(p.mrp)}</span>
                            <span className="ml-1.5 text-xs font-semibold px-1 py-0.5 rounded"
                              style={{ background: G + "18", color: G }}>
                              -{disc}%
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`font-semibold ${p.stock === 0 ? "text-red-500" : isLow ? "text-amber-500" : "text-gray-700"}`}>
                            {p.stock === 0 ? "Out" : p.stock}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min((p.stock / maxStock) * 100, 100)}%`,
                              background: p.stock === 0 ? "#ef4444" : isLow ? "#f59e0b" : G,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: STATUS_META[p.status].bg, color: STATUS_META[p.status].text }}
                      >
                        {STATUS_META[p.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{p.sales}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(p)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400">
              <Package size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editProduct && (
          <EditModal
            product={editProduct}
            onSave={handleSaveEdit}
            onClose={() => setEditProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className={`${card} w-full max-w-sm p-6 text-center`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Delete Product?</h3>
              <p className="text-sm text-gray-500 mb-5">
                "{products.find(p => p.id === deleteId)?.name}" will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
