import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Boxes, AlertTriangle, XCircle, Package, Plus, Minus,
  RotateCcw, Bell, Mail, MessageSquare, X, ChevronDown,
  Edit2, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const inp  = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white";
const fmt  = (n: number) => "₹" + n.toLocaleString("en-IN");

// ─── Types ────────────────────────────────────────────────────────────────────

type StockStatus = "Active" | "OutStock" | "LowStock";

type StockItem = {
  id: number;
  name: string;
  sku: string;
  cat: string;
  stock: number;
  minStock: number;
  maxStock: number;
  sold: number;
  incoming: number;
  status: StockStatus;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const STOCK: StockItem[] = [
  { id:1,  name:"Samsung Galaxy A55",    sku:"EL-SGA55-BLK",  cat:"Smartphones", stock:12, minStock:10,  maxStock:100, sold:142, incoming:50,  status:"LowStock" },
  { id:2,  name:"Boat Airdopes 141",     sku:"EL-BA141-WHT",  cat:"Audio",       stock:34, minStock:20,  maxStock:200, sold:98,  incoming:0,   status:"Active"   },
  { id:3,  name:"OnePlus Nord CE4",      sku:"EL-OP-NCE4",    cat:"Smartphones", stock:0,  minStock:10,  maxStock:50,  sold:76,  incoming:25,  status:"OutStock" },
  { id:4,  name:"JBL Flip 6 Speaker",    sku:"EL-JBL-F6",     cat:"Audio",       stock:22, minStock:15,  maxStock:80,  sold:63,  incoming:0,   status:"Active"   },
  { id:5,  name:"Mi Smart Band 8",       sku:"EL-MI-SB8",     cat:"Wearables",   stock:45, minStock:20,  maxStock:150, sold:51,  incoming:0,   status:"Active"   },
  { id:6,  name:"Sony WH-1000XM5",      sku:"EL-SONY-XM5",   cat:"Audio",       stock:8,  minStock:10,  maxStock:40,  sold:38,  incoming:20,  status:"LowStock" },
  { id:7,  name:"HP Pavilion Laptop",    sku:"EL-HP-PAV15",   cat:"Laptops",     stock:5,  minStock:8,   maxStock:30,  sold:27,  incoming:10,  status:"LowStock" },
  { id:8,  name:"Apple Watch Series 9",  sku:"EL-AW-S9-41",   cat:"Wearables",   stock:11, minStock:10,  maxStock:50,  sold:23,  incoming:0,   status:"Active"   },
  { id:9,  name:"Redmi Note 13 Pro",    sku:"EL-RN13P-BLU",  cat:"Smartphones", stock:18, minStock:15,  maxStock:80,  sold:89,  incoming:0,   status:"Active"   },
  { id:10, name:"Noise ColorFit Pro 4", sku:"EL-NCP4-BLK",   cat:"Wearables",   stock:67, minStock:20,  maxStock:200, sold:54,  incoming:0,   status:"Active"   },
  { id:11, name:"Lenovo IdeaPad Slim 5",sku:"EL-LEN-IPS5",   cat:"Laptops",     stock:3,  minStock:5,   maxStock:20,  sold:19,  incoming:15,  status:"LowStock" },
  { id:12, name:"Realme Buds Air 5",    sku:"EL-RBA5-WHT",   cat:"Audio",       stock:0,  minStock:20,  maxStock:100, sold:71,  incoming:50,  status:"OutStock" },
  { id:13, name:"iQOO Z9 Lite",         sku:"EL-IQ-Z9L",     cat:"Smartphones", stock:29, minStock:20,  maxStock:80,  sold:45,  incoming:0,   status:"Active"   },
  { id:14, name:"Zebronics Mouse",       sku:"EL-ZEB-DLT",    cat:"Accessories", stock:89, minStock:30,  maxStock:300, sold:112, incoming:0,   status:"Active"   },
  { id:15, name:"Canon EOS 1500D",       sku:"EL-CAN-1500D",  cat:"Cameras",     stock:7,  minStock:5,   maxStock:25,  sold:14,  incoming:0,   status:"LowStock" },
];

const CHART_DATA = [
  { d:"Mon", in:0,  out:18 },
  { d:"Tue", in:25, out:23 },
  { d:"Wed", in:0,  out:31 },
  { d:"Thu", in:50, out:27 },
  { d:"Fri", in:0,  out:42 },
  { d:"Sat", in:20, out:38 },
  { d:"Sun", in:0,  out:24 },
];

// ─── Reorder Modal ────────────────────────────────────────────────────────────

function ReorderModal({ item, onClose }: { item: StockItem; onClose: () => void }) {
  const [qty, setQty] = useState("50");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState<"Normal" | "Urgent">("Normal");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        onClick={e => e.stopPropagation()}
        className={`${card} w-full max-w-md p-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Place Reorder</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
        </div>
        <p className="text-sm text-gray-600 mb-4 font-medium">{item.name}</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Quantity</label>
            <input value={qty} onChange={e => setQty(e.target.value)} className={inp} type="number" min="1" placeholder="Enter quantity" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Supplier Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} className={`${inp} resize-none`} rows={2} placeholder="Optional note for supplier..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Priority</label>
            <div className="flex gap-2">
              {(["Normal","Urgent"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${priority === p ? (p === "Urgent" ? "bg-red-50 border-red-400 text-red-700" : "bg-green-50 border-[#009966] text-[#009966]") : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full py-3 bg-[#009966] text-white font-semibold text-sm rounded-xl hover:bg-[#007a52] transition-colors mt-2">
            Place Reorder
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = ["All", "In Stock", "Low Stock", "Out of Stock"];

export function SellerStockManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState(0);
  const [reorderItem, setReorderItem] = useState<StockItem | null>(null);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [alertDays, setAlertDays] = useState("7");

  const inStock  = STOCK.filter(s => s.status === "Active").length;
  const lowStock = STOCK.filter(s => s.status === "LowStock").length;
  const outStock = STOCK.filter(s => s.status === "OutStock").length;
  const totalSku = STOCK.length;

  const tabFiltered = STOCK.filter(s => {
    if (activeTab === 0) return true;
    if (activeTab === 1) return s.status === "Active";
    if (activeTab === 2) return s.status === "LowStock";
    if (activeTab === 3) return s.status === "OutStock";
    return true;
  });

  function stockPillClass(stock: number, minStock: number) {
    if (stock === 0) return "bg-red-50 text-red-600 border border-red-200";
    if (stock <= minStock) return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-green-50 text-green-700 border border-green-200";
  }

  function stockBarColor(stock: number, maxStock: number, minStock: number) {
    const pct = stock / maxStock;
    if (stock === 0) return "#ef4444";
    if (stock <= minStock) return "#f59e0b";
    return G;
  }

  function handleEditStart(item: StockItem) {
    setEditingId(item.id);
    setEditQty(item.stock);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor and manage your product inventory</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#009966] text-white text-sm font-semibold rounded-xl hover:bg-[#007a52] transition-colors shadow-sm">
            <Plus size={16} /> Update Stock
          </button>
        </motion.div>

        {/* 4 Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label:"In Stock",      value:inStock,  icon:<Boxes size={20} className="text-green-600" />,   bg:"bg-green-50",  val:"text-green-600" },
            { label:"Low Stock",     value:lowStock, icon:<AlertTriangle size={20} className="text-amber-500" />, bg:"bg-amber-50", val:"text-amber-600" },
            { label:"Out of Stock",  value:outStock, icon:<XCircle size={20} className="text-red-500" />,     bg:"bg-red-50",    val:"text-red-500"   },
            { label:"Total SKUs",    value:totalSku, icon:<Package size={20} className="text-blue-500" />,    bg:"bg-blue-50",   val:"text-blue-600"  },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06 }} className={`${card} p-5`}>
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
              <p className={`text-2xl font-bold ${s.val}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs + Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className={card}>
          {/* Tab bar */}
          <div className="px-5 pt-4 border-b border-gray-100 flex gap-1 overflow-x-auto">
            {TABS.map((tab, i) => {
              const count = i === 2 ? lowStock : i === 3 ? outStock : null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-xl whitespace-nowrap transition-colors ${activeTab === i ? "text-[#009966] bg-green-50/60" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {tab}
                  {count !== null && (
                    <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${activeTab === i ? "bg-[#009966] text-white" : "bg-gray-200 text-gray-600"}`}>{count}</span>
                  )}
                  {activeTab === i && <motion.div layoutId="stock-tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#009966]" />}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Product","Category","Current Stock","Min","Max","Sold","Incoming","Level","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {tabFiltered.map((item, i) => {
                    const isEditing = editingId === item.id;
                    const pct = Math.min((item.stock / item.maxStock) * 100, 100);
                    return (
                      <motion.tr
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors"
                      >
                        {/* Product */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 leading-tight">{item.name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{item.sku}</p>
                        </td>
                        {/* Category */}
                        <td className="px-4 py-3 text-gray-600 text-xs">{item.cat}</td>
                        {/* Current Stock */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditQty(q => Math.max(0, q - 1))} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <Minus size={12} />
                              </button>
                              <input
                                value={editQty}
                                onChange={e => setEditQty(Number(e.target.value))}
                                className="w-14 text-center border border-gray-200 rounded-lg px-1 py-1 text-sm font-semibold text-gray-900 outline-none focus:border-[#009966]"
                                type="number" min="0"
                              />
                              <button onClick={() => setEditQty(q => q + 1)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <Plus size={12} />
                              </button>
                              <button onClick={() => setEditingId(null)} className="ml-1 px-2.5 py-1 bg-[#009966] text-white text-xs font-semibold rounded-lg hover:bg-[#007a52] transition-colors">
                                Save
                              </button>
                            </div>
                          ) : (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stockPillClass(item.stock, item.minStock)}`}>
                              {item.stock}
                            </span>
                          )}
                        </td>
                        {/* Min */}
                        <td className="px-4 py-3 text-gray-500 text-sm">{item.minStock}</td>
                        {/* Max */}
                        <td className="px-4 py-3 text-gray-500 text-sm">{item.maxStock}</td>
                        {/* Sold */}
                        <td className="px-4 py-3 text-gray-700 font-medium">{item.sold}</td>
                        {/* Incoming */}
                        <td className="px-4 py-3">
                          {item.incoming > 0 ? (
                            <span className="text-xs text-blue-600 font-semibold bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                              +{item.incoming}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        {/* Level bar */}
                        <td className="px-4 py-3 min-w-28">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: stockBarColor(item.stock, item.maxStock, item.minStock),
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{Math.round(pct)}%</p>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditStart(item)}
                              className="flex items-center gap-1 text-xs text-[#009966] hover:bg-green-50 px-2 py-1 rounded-lg transition-colors font-medium"
                            >
                              <Edit2 size={12} /> Update
                            </button>
                            <button
                              onClick={() => setReorderItem(item)}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors font-medium"
                            >
                              <RotateCcw size={12} /> Reorder
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Stock Movement Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Stock Movement</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days — units in vs units out</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: G }} /> Stock In</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-amber-400" /> Stock Out</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CHART_DATA} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="d" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar dataKey="in"  name="Stock In"  fill={G}         radius={[4,4,0,0]} />
              <Bar dataKey="out" name="Stock Out" fill="#f59e0b"   radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Stock Alert Settings */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-[#009966]" />
            <h2 className="font-semibold text-gray-900">Stock Alert Settings</h2>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Alert me when stock falls below minimum threshold</p>
              <p className="text-xs text-gray-400 mt-0.5">Automatically notified when any product hits low stock</p>
            </div>
            <button
              onClick={() => setAlertEnabled(a => !a)}
              className={`relative w-12 h-6 rounded-full transition-colors ${alertEnabled ? "bg-[#009966]" : "bg-gray-200"}`}
            >
              <motion.div
                animate={{ x: alertEnabled ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          {/* Notification channels */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Notify via</p>
            <div className="flex gap-3 flex-wrap">
              {[
                { key: "email",     label: "Email",     icon: <Mail size={15} />,            val: notifEmail,    set: setNotifEmail    },
                { key: "sms",       label: "SMS",        icon: <MessageSquare size={15} />,   val: notifSms,      set: setNotifSms      },
                { key: "whatsapp",  label: "WhatsApp",   icon: <TrendingUp size={15} />,      val: notifWhatsapp, set: setNotifWhatsapp },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => opt.set(v => !v)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${opt.val ? "border-[#009966] bg-green-50 text-[#009966]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {opt.icon} {opt.label}
                  {opt.val && <span className="w-4 h-4 bg-[#009966] rounded-full flex items-center justify-center ml-1"><svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg></span>}
                </button>
              ))}
            </div>
          </div>

          {/* Alert threshold */}
          <div className="pt-3 flex items-center gap-4">
            <p className="text-sm text-gray-700 font-medium">Low stock alert minimum days:</p>
            <div className="flex items-center gap-2">
              <input
                value={alertDays}
                onChange={e => setAlertDays(e.target.value)}
                className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all text-center font-semibold"
                type="number" min="1"
              />
              <span className="text-sm text-gray-500">days</span>
            </div>
            <button className="px-4 py-2 bg-[#009966] text-white text-sm font-semibold rounded-xl hover:bg-[#007a52] transition-colors">
              Save Settings
            </button>
          </div>
        </motion.div>

      </div>

      {/* Reorder Modal */}
      <AnimatePresence>
        {reorderItem && <ReorderModal item={reorderItem} onClose={() => setReorderItem(null)} />}
      </AnimatePresence>
    </div>
  );
}
