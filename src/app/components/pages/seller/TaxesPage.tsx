"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Edit2, X, Shield, Calendar, FileText, TrendingUp, IndianRupee, CheckCircle,
} from "lucide-react";

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const inp =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

// ─── Data ─────────────────────────────────────────────────────────────────────

type TaxRate = {
  id: number;
  category: string;
  hsn: string;
  gstRate: number;
  igst: number;
  cgst: number;
  sgst: number;
  products: number;
};

const INIT: TaxRate[] = [
  { id: 1, category: "Smartphones", hsn: "8517", gstRate: 18, igst: 18, cgst: 9,   sgst: 9,   products: 89 },
  { id: 2, category: "Laptops",     hsn: "8471", gstRate: 18, igst: 18, cgst: 9,   sgst: 9,   products: 27 },
  { id: 3, category: "Audio",       hsn: "8518", gstRate: 18, igst: 18, cgst: 9,   sgst: 9,   products: 42 },
  { id: 4, category: "Wearables",   hsn: "9102", gstRate: 18, igst: 18, cgst: 9,   sgst: 9,   products: 31 },
  { id: 5, category: "Cameras",     hsn: "9006", gstRate: 12, igst: 12, cgst: 6,   sgst: 6,   products: 14 },
  { id: 6, category: "Accessories", hsn: "8544", gstRate: 18, igst: 18, cgst: 9,   sgst: 9,   products: 67 },
  { id: 7, category: "Books",       hsn: "4901", gstRate: 0,  igst: 0,  cgst: 0,   sgst: 0,   products: 0  },
  { id: 8, category: "Grocery",     hsn: "2106", gstRate: 5,  igst: 5,  cgst: 2.5, sgst: 2.5, products: 0  },
];

const GST_PILL: Record<number, { bg: string; text: string }> = {
  0:  { bg: "#f3f4f6",    text: "#6b7280" },
  5:  { bg: "#d1fae5",    text: "#059669" },
  12: { bg: "#dbeafe",    text: "#2563eb" },
  18: { bg: "#fef3c7",    text: "#d97706" },
  28: { bg: "#fee2e2",    text: "#dc2626" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SellerTaxesPage() {
  const [rates, setRates] = useState<TaxRate[]>(INIT);
  const [editing, setEditing] = useState<TaxRate | null>(null);
  const [formCat,     setFormCat]     = useState("");
  const [formHsn,     setFormHsn]     = useState("");
  const [formGst,     setFormGst]     = useState("18");

  function openEdit(r: TaxRate) {
    setFormCat(r.category);
    setFormHsn(r.hsn);
    setFormGst(String(r.gstRate));
    setEditing(r);
  }

  function save() {
    if (!editing) return;
    const gstN = parseFloat(formGst);
    setRates(prev =>
      prev.map(r =>
        r.id === editing.id
          ? { ...r, category: formCat, hsn: formHsn, gstRate: gstN, igst: gstN, cgst: gstN / 2, sgst: gstN / 2 }
          : r
      )
    );
    setEditing(null);
  }

  const pill = (rate: number) => GST_PILL[rate] ?? GST_PILL[18];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Taxes &amp; GST</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage GST rates and tax configuration for your products</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ background: G + "15", color: G }}>
          <Shield size={12} /> GST Configuration
        </span>
      </div>

      {/* GSTIN Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-4 mb-6 flex flex-wrap items-center gap-4"
        style={{ background: G + "08", borderColor: G + "30" }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle size={18} style={{ color: G }} />
          <div>
            <p className="text-sm font-bold text-gray-900">GSTIN: 27AABCR1234C1Z5</p>
            <p className="text-xs text-gray-500">Verified ✓</p>
          </div>
        </div>
        <div className="w-px h-8 bg-gray-200 hidden sm:block" />
        <div>
          <p className="text-xs font-semibold text-gray-700">State</p>
          <p className="text-xs text-gray-500">Maharashtra</p>
        </div>
        <div className="w-px h-8 bg-gray-200 hidden sm:block" />
        <div>
          <p className="text-xs font-semibold text-gray-700">Registered Since</p>
          <p className="text-xs text-gray-500">Apr 2022</p>
        </div>
      </motion.div>

      {/* GST Rate Table */}
      <div className={`${card} overflow-hidden mb-6`}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">GST Rate Configuration</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 w-10">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">HSN Code</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">GST Rate</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">IGST</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">CGST</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">SGST</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500">Products</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 w-16">Edit</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.category}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">{r.hsn}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: pill(r.gstRate).bg, color: pill(r.gstRate).text }}
                    >
                      {r.gstRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.igst}%</td>
                  <td className="px-4 py-3 text-gray-700">{r.cgst}%</td>
                  <td className="px-4 py-3 text-gray-700">{r.sgst}%</td>
                  <td className="px-4 py-3 text-gray-700">{r.products}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(r)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tax Summary */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: G }} />
            <h3 className="text-sm font-bold text-gray-800">Tax Summary — This Month</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Total GST Collected", value: 342800, color: "#3b82f6" },
              { label: "Payable",             value: 171400, color: "#ef4444" },
              { label: "ITC Claim",           value: 84200,  color: G         },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>
                  {fmt(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filing Reminder */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-gray-800">GST Filing Reminder</h3>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 mb-4">
            <p className="text-sm font-semibold text-amber-800">Next filing due</p>
            <p className="text-xs text-amber-600 mt-0.5">Oct 20, 2026 — GSTR-1</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <FileText size={12} />
              <span>Monthly return</span>
            </div>
            <button
              className="px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-colors hover:bg-gray-50"
              style={{ borderColor: G, color: G }}
            >
              File Now
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className={`${card} w-full max-w-sm p-6`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Edit Tax Rate</h2>
                <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <input className={inp} value={formCat} onChange={e => setFormCat(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">HSN Code</label>
                  <input className={inp} value={formHsn} onChange={e => setFormHsn(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">GST Rate</label>
                  <select className={inp} value={formGst} onChange={e => setFormGst(e.target.value)}>
                    {["0", "5", "12", "18", "28"].map(g => <option key={g} value={g}>{g}%</option>)}
                  </select>
                </div>
                {/* Auto-calc preview */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "IGST", val: parseFloat(formGst) },
                    { label: "CGST", val: parseFloat(formGst) / 2 },
                    { label: "SGST", val: parseFloat(formGst) / 2 },
                  ].map(x => (
                    <div key={x.label} className="text-center p-2 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-0.5">{x.label}</p>
                      <p className="text-sm font-bold text-gray-800">{x.val}%</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={save}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: G }}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
