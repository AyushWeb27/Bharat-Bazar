import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download, Upload, FileSpreadsheet, CheckCircle2,
  AlertTriangle, XCircle, ChevronRight, X, FileText,
  RefreshCw, Package,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const inp  = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImportRecord = {
  id: string;
  file: string;
  products: number;
  success: number;
  failed: number;
  date: string;
  status: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const TEMPLATE_COLUMNS = [
  "Product Name", "Category", "SubCategory", "Brand", "SKU",
  "MRP", "Selling Price", "Stock Qty", "Description", "Weight",
  "HSN Code", "GST %",
];

const SAMPLE_ROWS = [
  {
    name: "Samsung Galaxy A55", cat: "Smartphones", sub: "Android", brand: "Samsung",
    sku: "EL-SGA55-BLK", mrp: "24999", price: "18999", stock: "12",
    desc: "6.6-inch AMOLED display", weight: "213g", hsn: "85171200", gst: "18",
  },
  {
    name: "Boat Airdopes 141", cat: "Audio", sub: "TWS", brand: "Boat",
    sku: "EL-BA141-WHT", mrp: "2999", price: "2499", stock: "34",
    desc: "True wireless stereo earbuds", weight: "45g", hsn: "85183000", gst: "18",
  },
];

const HISTORY: ImportRecord[] = [
  { id: "IMP-045", file: "electronics_sep_2026.csv", products: 248, success: 245, failed: 3,  date: "Sep 4, 2026",  status: "Completed" },
  { id: "IMP-044", file: "phones_bulk_aug.xlsx",      products: 89,  success: 89,  failed: 0,  date: "Aug 28, 2026", status: "Completed" },
  { id: "IMP-043", file: "audio_products.csv",        products: 42,  success: 40,  failed: 2,  date: "Aug 15, 2026", status: "Completed" },
  { id: "IMP-042", file: "wearables_aug.csv",         products: 31,  success: 31,  failed: 0,  date: "Aug 2, 2026",  status: "Completed" },
  { id: "IMP-041", file: "laptops_jul.xlsx",          products: 18,  success: 17,  failed: 1,  date: "Jul 20, 2026", status: "Completed" },
];

const STEPS = ["Download Template", "Upload File", "Review & Import"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={{
                background: i <= current ? G : "#e5e7eb",
                scale: i === current ? 1.1 : 1,
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm"
            >
              {i < current ? <CheckCircle2 size={16} /> : i + 1}
            </motion.div>
            <span className={`text-xs font-medium whitespace-nowrap ${i <= current ? "text-[#009966]" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-0.5 mx-2 mb-4 rounded-full overflow-hidden bg-gray-200">
              <motion.div
                animate={{ width: i < current ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full"
                style={{ background: G }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SellerBulkImportPage() {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { setFileName(f.name); setFileSize((f.size / 1024).toFixed(1) + " KB"); }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setFileName(f.name); setFileSize((f.size / 1024).toFixed(1) + " KB"); }
  }

  function handleStartImport() {
    setImporting(true);
    setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8;
      if (p >= 100) { p = 100; clearInterval(iv); setImportDone(true); setImporting(false); }
      setProgress(Math.min(p, 100));
    }, 180);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Import Products</h1>
          <p className="text-sm text-gray-500 mt-1">Upload multiple products at once using CSV or Excel</p>
        </motion.div>

        {/* Step Wizard */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`${card} p-6`}>
          <StepIndicator current={step} />

          {/* ── Step 0: Download Template ── */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-semibold text-gray-900 mb-1">Download Template</h2>
                <p className="text-sm text-gray-500 mb-4">Download our CSV template with all required fields</p>

                {/* Column chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {TEMPLATE_COLUMNS.map(col => (
                    <span key={col} className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 font-medium">
                      {col}
                    </span>
                  ))}
                </div>

                {/* Download buttons */}
                <div className="flex gap-3 mb-6">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#009966] text-[#009966] text-sm font-semibold hover:bg-green-50 transition-colors">
                    <Download size={16} /> Download CSV Template
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
                    <FileSpreadsheet size={16} /> Download Excel Template
                  </button>
                </div>

                {/* Sample preview */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sample Preview</p>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {["Product Name","Category","SubCategory","Brand","SKU","MRP","Selling Price","Stock Qty"].map(h => (
                            <th key={h} className="text-left px-3 py-2 text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_ROWS.map((r, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-0">
                            <td className="px-3 py-2 text-gray-800">{r.name}</td>
                            <td className="px-3 py-2 text-gray-600">{r.cat}</td>
                            <td className="px-3 py-2 text-gray-600">{r.sub}</td>
                            <td className="px-3 py-2 text-gray-600">{r.brand}</td>
                            <td className="px-3 py-2 font-mono text-gray-600">{r.sku}</td>
                            <td className="px-3 py-2 text-gray-600">₹{r.mrp}</td>
                            <td className="px-3 py-2 text-gray-600">₹{r.price}</td>
                            <td className="px-3 py-2 text-gray-600">{r.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 bg-[#009966] text-white text-sm font-semibold rounded-xl hover:bg-[#007a52] transition-colors">
                    Next: Upload File <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 1: Upload File ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-semibold text-gray-900 mb-1">Upload File</h2>
                <p className="text-sm text-gray-500 mb-4">Upload your completed CSV or Excel file</p>

                {/* Drop zone */}
                <label
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="block border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-[#009966] hover:bg-green-50/30 transition-all group"
                >
                  <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
                  {fileName ? (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-2">
                      <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                        <FileText size={28} className="text-[#009966]" />
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{fileName}</p>
                      <p className="text-xs text-gray-500">{fileSize}</p>
                      <button
                        onClick={e => { e.preventDefault(); setFileName(null); setFileSize(null); }}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-1"
                      >
                        <X size={12} /> Remove
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-100 transition-colors">
                        <Upload size={32} className="text-gray-400 group-hover:text-[#009966] transition-colors" />
                      </div>
                      <p className="font-semibold text-gray-700">Drop your CSV or Excel file here</p>
                      <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                        <span>Accepted: .csv, .xlsx, .xls</span>
                        <span>•</span>
                        <span>Max 10 MB</span>
                        <span>•</span>
                        <span>Max 1000 products</span>
                      </div>
                    </>
                  )}
                </label>

                {/* Validate button */}
                {fileName && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setStep(2)}
                    className="w-full mt-4 py-3 bg-[#009966] text-white font-semibold text-sm rounded-xl hover:bg-[#007a52] transition-colors"
                  >
                    Validate File
                  </motion.button>
                )}

                <div className="flex justify-between mt-4">
                  <button onClick={() => setStep(0)} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">← Back</button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Review & Import ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="font-semibold text-gray-900 mb-1">Review & Import</h2>
                <p className="text-sm text-gray-500">Review the validation results before importing</p>

                {/* Validation Results */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800 font-medium">248 products ready to import</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-amber-800">3 rows have missing SKU — will be auto-generated</span>
                  </div>
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-1">
                      <XCircle size={18} className="text-red-600 flex-shrink-0" />
                      <span className="text-sm text-red-800 font-medium">2 rows have invalid GST % (must be 0/5/12/18/28)</span>
                    </div>
                    <div className="ml-7 flex gap-2 mt-1">
                      <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">Row 47</span>
                      <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">Row 183</span>
                    </div>
                  </div>
                </div>

                {/* Preview table */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">File Preview (first 5 rows)</p>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {["#","Product Name","SKU","Category","MRP","Price","Stock","GST %"].map(h => (
                            <th key={h} className="text-left px-3 py-2 text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_ROWS.concat(SAMPLE_ROWS.slice(0,3) as typeof SAMPLE_ROWS).slice(0,5).map((r, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-0">
                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2 text-gray-800">{r.name}</td>
                            <td className="px-3 py-2 font-mono text-gray-600">{r.sku}</td>
                            <td className="px-3 py-2 text-gray-600">{r.cat}</td>
                            <td className="px-3 py-2 text-gray-600">₹{r.mrp}</td>
                            <td className="px-3 py-2 text-gray-600">₹{r.price}</td>
                            <td className="px-3 py-2 text-gray-600">{r.stock}</td>
                            <td className="px-3 py-2 text-gray-600">{r.gst}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className={`${card} p-4`}>
                  <div className="flex gap-6">
                    <div className="text-center"><p className="text-xl font-bold text-gray-900">248</p><p className="text-xs text-gray-500">To Import</p></div>
                    <div className="text-center"><p className="text-xl font-bold text-green-600">248</p><p className="text-xs text-gray-500">Ready</p></div>
                    <div className="text-center"><p className="text-xl font-bold text-gray-400">0</p><p className="text-xs text-gray-500">Duplicates</p></div>
                    <div className="text-center"><p className="text-xl font-bold text-red-500">0</p><p className="text-xs text-gray-500">Errors</p></div>
                  </div>
                </div>

                {/* Import progress */}
                {importing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">Importing {Math.round(progress * 248 / 100)}/248 products...</span>
                      <span className="text-gray-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 60 }}
                        className="h-full rounded-full"
                        style={{ background: G }}
                      />
                    </div>
                  </motion.div>
                )}

                {importDone && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 size={20} className="text-green-600" />
                    <span className="text-sm text-green-800 font-semibold">Import complete! 248 products added successfully.</span>
                  </motion.div>
                )}

                {!importing && !importDone && (
                  <button onClick={handleStartImport} className="w-full py-3 bg-[#009966] text-white font-semibold text-sm rounded-xl hover:bg-[#007a52] transition-colors">
                    Start Import
                  </button>
                )}

                <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">← Back</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Import History */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className={card}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Import History</h2>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Import ID","File","Products","Success","Failed","Date","Status","Log"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {row.file.endsWith(".xlsx") ? <FileSpreadsheet size={14} className="text-green-600" /> : <FileText size={14} className="text-blue-500" />}
                        <span className="text-gray-800 text-xs">{row.file}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{row.products}</td>
                    <td className="px-4 py-3">
                      <span className="text-green-600 font-semibold">{row.success}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={row.failed > 0 ? "text-red-500 font-semibold" : "text-gray-400"}>{row.failed}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 font-medium">{row.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-1 text-xs text-[#009966] hover:underline">
                        <Download size={12} /> Log
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
