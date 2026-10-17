import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download, Upload, FileText, FileSpreadsheet,
  Search, Filter, ChevronDown, Check, X,
  TrendingUp, TrendingDown, Package, SlidersHorizontal,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const inp  = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductStatus = "Active" | "OutStock" | "LowStock";

type Product = {
  id: number;
  name: string;
  sku: string;
  cat: string;
  price: number;
  stock: number;
  status: ProductStatus;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const UPDATE_COLS = ["SKU", "MRP", "Selling Price", "Stock Qty", "Status"];

const PRODUCTS: Product[] = [
  { id:1,  name:"Samsung Galaxy A55",   sku:"EL-SGA55-BLK",  cat:"Smartphones", price:18999, stock:12, status:"Active"  },
  { id:2,  name:"Boat Airdopes 141",    sku:"EL-BA141-WHT",  cat:"Audio",        price:2499,  stock:34, status:"Active"  },
  { id:3,  name:"OnePlus Nord CE4",     sku:"EL-OP-NCE4",    cat:"Smartphones", price:27999, stock:0,  status:"OutStock"},
  { id:4,  name:"JBL Flip 6 Speaker",   sku:"EL-JBL-F6",     cat:"Audio",        price:4999,  stock:22, status:"Active"  },
  { id:5,  name:"Mi Smart Band 8",      sku:"EL-MI-SB8",     cat:"Wearables",    price:3499,  stock:45, status:"Active"  },
  { id:6,  name:"Sony WH-1000XM5",     sku:"EL-SONY-XM5",   cat:"Audio",        price:22999, stock:8,  status:"LowStock"},
  { id:7,  name:"HP Pavilion Laptop",   sku:"EL-HP-PAV15",   cat:"Laptops",      price:54999, stock:5,  status:"LowStock"},
  { id:8,  name:"Apple Watch S9",       sku:"EL-AW-S9-41",   cat:"Wearables",    price:42999, stock:11, status:"Active"  },
  { id:9,  name:"Redmi Note 13 Pro",   sku:"EL-RN13P-BLU",  cat:"Smartphones", price:16999, stock:18, status:"Active"  },
  { id:10, name:"Noise ColorFit Pro 4",sku:"EL-NCP4-BLK",   cat:"Wearables",    price:2999,  stock:67, status:"Active"  },
];

const CATS = ["All Categories", "Smartphones", "Audio", "Wearables", "Laptops"];

const STATUS_META: Record<ProductStatus | "All", { label: string; bg: string; text: string }> = {
  All:      { label: "All",          bg: "bg-gray-100",   text: "text-gray-600"   },
  Active:   { label: "Active",       bg: "bg-green-50",   text: "text-green-700"  },
  OutStock: { label: "Out of Stock", bg: "bg-red-50",     text: "text-red-600"    },
  LowStock: { label: "Low Stock",    bg: "bg-amber-50",   text: "text-amber-700"  },
};

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProductStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
}

// ─── Tab: CSV Upload ──────────────────────────────────────────────────────────

function CsvUploadTab() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setFileName(f.name); setFileSize((f.size / 1024).toFixed(1) + " KB"); setValidated(false); }
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { setFileName(f.name); setFileSize((f.size / 1024).toFixed(1) + " KB"); setValidated(false); }
  }

  return (
    <div className="space-y-4">
      {/* Download update template */}
      <div className={`${card} p-5`}>
        <h3 className="font-semibold text-gray-900 mb-1">Download Update Template</h3>
        <p className="text-sm text-gray-500 mb-3">Template contains only updatable fields</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {UPDATE_COLS.map(col => (
            <span key={col} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 font-medium">{col}</span>
          ))}
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#009966] text-[#009966] text-sm font-semibold hover:bg-green-50 transition-colors">
            <Download size={15} /> Download CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
            <FileSpreadsheet size={15} /> Download Excel
          </button>
        </div>
      </div>

      {/* Upload zone */}
      <div className={`${card} p-5`}>
        <h3 className="font-semibold text-gray-900 mb-3">Upload Update File</h3>
        <label
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="block border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-[#009966] hover:bg-green-50/20 transition-all group"
        >
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
          {fileName ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <FileText size={24} className="text-[#009966]" />
              </div>
              <p className="font-semibold text-gray-900 text-sm">{fileName}</p>
              <p className="text-xs text-gray-500">{fileSize}</p>
              <button onClick={e => { e.preventDefault(); setFileName(null); setFileSize(null); setValidated(false); }} className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                <X size={12} /> Remove
              </button>
            </motion.div>
          ) : (
            <>
              <Upload size={32} className="text-gray-400 group-hover:text-[#009966] mx-auto mb-3 transition-colors" />
              <p className="font-semibold text-gray-700">Drop your update file here</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 mt-3">Accepted: .csv, .xlsx, .xls • Max 10 MB</p>
            </>
          )}
        </label>

        {fileName && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
            <button onClick={() => setValidated(true)} className="w-full py-3 bg-[#009966] text-white font-semibold text-sm rounded-xl hover:bg-[#007a52] transition-colors">
              Validate & Preview
            </button>
            {validated && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
                  <Check size={16} className="text-green-600" /> 156 products matched by SKU
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <FileText size={16} className="text-amber-600" /> 4 SKUs not found — will be skipped
                </div>
                <button className="w-full py-3 bg-[#009966] text-white font-semibold text-sm rounded-xl hover:bg-[#007a52] transition-colors">
                  Apply Updates
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Manual Selection ────────────────────────────────────────────────────

function ManualSelectionTab() {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [changeType, setChangeType] = useState<"increase" | "decrease">("increase");
  const [changeMode, setChangeMode] = useState<"pct" | "flat">("pct");
  const [priceVal, setPriceVal] = useState("");
  const [stockAdd, setStockAdd] = useState("");
  const [bulkStatus, setBulkStatus] = useState("Active");

  const filtered = PRODUCTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All Categories" || p.cat === catFilter;
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  function toggleAll() {
    setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.id));
  }
  function toggleOne(id: number) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  return (
    <div className="space-y-4">
      {/* Search + filter row */}
      <div className={`${card} p-4`}>
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className={`${inp} pl-9`} placeholder="Search by name or SKU..." />
          </div>
          <div className="relative">
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className={`${inp} pr-8 appearance-none cursor-pointer`}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={`${inp} pr-8 appearance-none cursor-pointer`}>
              {["All","Active","LowStock","OutStock"].map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Product table */}
      <div className={`${card} overflow-hidden`}>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">{filtered.length} products</span>
          {selected.length > 0 && (
            <span className="text-xs text-[#009966] font-semibold">{selected.length} selected</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 accent-[#009966] cursor-pointer"
                  />
                </th>
                {["Product","SKU","Category","Price","Stock","Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => toggleOne(p.id)}
                  className={`border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${selected.includes(p.id) ? "bg-green-50/60" : "hover:bg-gray-50/50"}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={() => toggleOne(p.id)}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 accent-[#009966] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{p.cat}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{fmt(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stock === 0 ? "text-red-500" : p.stock < 10 ? "text-amber-600" : "text-gray-700"}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky action bar when items selected */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="sticky bottom-4 z-20"
          >
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-900">{selected.length} product{selected.length > 1 ? "s" : ""} selected</span>
                <button onClick={() => setSelected([])} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bulk Price Change */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bulk Price Change</p>
                  <div className="flex gap-2">
                    <button onClick={() => setChangeType("increase")} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${changeType === "increase" ? "bg-green-50 border-green-300 text-green-700" : "border-gray-200 text-gray-600"}`}>
                      <TrendingUp size={12} /> Increase
                    </button>
                    <button onClick={() => setChangeType("decrease")} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${changeType === "decrease" ? "bg-red-50 border-red-300 text-red-600" : "border-gray-200 text-gray-600"}`}>
                      <TrendingDown size={12} /> Decrease
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input value={priceVal} onChange={e => setPriceVal(e.target.value)} className={`${inp} pr-12`} placeholder="0" />
                      <button onClick={() => setChangeMode(m => m === "pct" ? "flat" : "pct")} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md font-bold transition-colors">
                        {changeMode === "pct" ? "%" : "₹"}
                      </button>
                    </div>
                    <button className="px-3 py-2 bg-[#009966] text-white text-xs font-semibold rounded-xl hover:bg-[#007a52] transition-colors whitespace-nowrap">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Bulk Stock Add */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bulk Stock Add</p>
                  <div className="flex gap-2">
                    <input value={stockAdd} onChange={e => setStockAdd(e.target.value)} className={`${inp} flex-1`} placeholder="Qty to add" type="number" min="0" />
                    <button className="px-3 py-2 bg-[#009966] text-white text-xs font-semibold rounded-xl hover:bg-[#007a52] transition-colors whitespace-nowrap">
                      Add
                    </button>
                  </div>
                </div>

                {/* Bulk Status */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bulk Status</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className={`${inp} appearance-none pr-8`}>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>OutOfStock</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <button className="px-3 py-2 bg-[#009966] text-white text-xs font-semibold rounded-xl hover:bg-[#007a52] transition-colors whitespace-nowrap">
                      Set
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab: Filter & Update ─────────────────────────────────────────────────────

function FilterUpdateTab() {
  const [cat, setCat] = useState("All Categories");
  const [status, setStatus] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(60000);
  const [applied, setApplied] = useState(false);

  const matched = PRODUCTS.filter(p => {
    const matchCat = cat === "All Categories" || p.cat === cat;
    const matchStatus = status === "All" || p.status === status;
    const matchPrice = p.price >= minPrice && p.price <= maxPrice;
    return matchCat && matchStatus && matchPrice;
  });

  return (
    <div className="space-y-4">
      <div className={`${card} p-5`}>
        <h3 className="font-semibold text-gray-900 mb-4">Filter Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
            <div className="relative">
              <select value={cat} onChange={e => setCat(e.target.value)} className={`${inp} appearance-none pr-8`}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
            <div className="relative">
              <select value={status} onChange={e => setStatus(e.target.value)} className={`${inp} appearance-none pr-8`}>
                {["All","Active","LowStock","OutStock"].map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Price Range: {fmt(minPrice)} – {fmt(maxPrice)}
            </label>
            <input
              type="range" min={0} max={60000} step={500}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#009966]"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl">
            <Package size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-green-800">{matched.length} products matched</span>
          </div>
          <button className="px-4 py-2.5 bg-[#009966] text-white text-sm font-semibold rounded-xl hover:bg-[#007a52] transition-colors">
            Apply Bulk Changes to {matched.length} Products
          </button>
        </div>
      </div>

      {/* Matched products list */}
      {matched.length > 0 && (
        <div className={`${card} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Matched Products</p>
            <span className="text-xs text-gray-400">{matched.length} results</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Product","SKU","Category","Price","Stock","Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matched.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3 text-gray-600">{p.cat}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{fmt(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.stock === 0 ? "text-red-500" : p.stock < 10 ? "text-amber-600" : "text-gray-700"}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = ["CSV Upload", "Manual Selection", "Filter & Update"];

export function SellerBulkUpdatePage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Update</h1>
          <p className="text-sm text-gray-500 mt-1">Update prices, stock or status for multiple products at once</p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`${card} p-1.5`}>
          <div className="flex gap-1">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`relative flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeTab === i ? "text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                {activeTab === i && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-xl" style={{ background: G }} />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 0 && <CsvUploadTab />}
            {activeTab === 1 && <ManualSelectionTab />}
            {activeTab === 2 && <FilterUpdateTab />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
