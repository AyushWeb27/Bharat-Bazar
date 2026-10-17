import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye, Download, Mail, FileText, X, Printer,
  Search, Filter, Plus,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
const G    = "#009966";
const GD   = "#007a52";
const card  = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const inp   = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white";

// ── Types ────────────────────────────────────────────────────────────────────
type InvoiceStatus = "Generated" | "Sent" | "Downloaded";

interface Invoice {
  id: string;
  orderId: string;
  customer: string;
  date: string;
  amount: number;
  gst: number;
  total: number;
  status: InvoiceStatus;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const INVOICES: Invoice[] = [
  { id: "INV-2026-0010", orderId: "ORD-8821", customer: "Priya Sharma",   date: "Oct 4, 2026",  amount: 4200,  gst: 756,   total: 4956,  status: "Downloaded" },
  { id: "INV-2026-0009", orderId: "ORD-8820", customer: "Arjun Mehta",    date: "Oct 3, 2026",  amount: 6800,  gst: 1224,  total: 8024,  status: "Sent"       },
  { id: "INV-2026-0008", orderId: "ORD-8819", customer: "Sunita Patel",   date: "Oct 3, 2026",  amount: 3500,  gst: 630,   total: 4130,  status: "Generated"  },
  { id: "INV-2026-0007", orderId: "ORD-8818", customer: "Rohit Verma",    date: "Oct 2, 2026",  amount: 9200,  gst: 1656,  total: 10856, status: "Sent"       },
  { id: "INV-2026-0006", orderId: "ORD-8817", customer: "Meera Nair",     date: "Oct 1, 2026",  amount: 5600,  gst: 1008,  total: 6608,  status: "Downloaded" },
  { id: "INV-2026-0005", orderId: "ORD-8816", customer: "Vikram Singh",   date: "Sep 30, 2026", amount: 7800,  gst: 1404,  total: 9204,  status: "Sent"       },
  { id: "INV-2026-0004", orderId: "ORD-8815", customer: "Kavita Rao",     date: "Sep 29, 2026", amount: 4100,  gst: 738,   total: 4838,  status: "Generated"  },
  { id: "INV-2026-0003", orderId: "ORD-8814", customer: "Deepak Joshi",   date: "Sep 28, 2026", amount: 11200, gst: 2016,  total: 13216, status: "Downloaded" },
  { id: "INV-2026-0002", orderId: "ORD-8813", customer: "Anjali Desai",   date: "Sep 27, 2026", amount: 8900,  gst: 1602,  total: 10502, status: "Sent"       },
  { id: "INV-2026-0001", orderId: "ORD-8812", customer: "Suresh Pillai",  date: "Sep 26, 2026", amount: 3300,  gst: 594,   total: 3894,  status: "Generated"  },
];

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

// ── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: InvoiceStatus }) {
  const map: Record<InvoiceStatus, { bg: string; color: string }> = {
    Generated:  { bg: "#3b82f618", color: "#3b82f6" },
    Sent:       { bg: `${G}18`,    color: G          },
    Downloaded: { bg: "#8b5cf618", color: "#8b5cf6" },
  };
  const s = map[status];
  return (
    <span
      className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

// ── Invoice preview modal ─────────────────────────────────────────────────────
function InvoiceModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const cgst = invoice.gst / 2;
  const sgst = invoice.gst / 2;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10"
      >
        {/* Modal header controls */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between z-10 rounded-t-2xl">
          <span className="text-sm font-bold text-gray-900">Invoice Preview — {invoice.id}</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Invoice body */}
        <div className="p-6 space-y-5 text-sm text-gray-800">

          {/* Letterhead */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: G }}
                >
                  <span className="text-white font-black text-xs">BB</span>
                </div>
                <div>
                  <p className="font-black text-gray-900 leading-tight">BharatBazar</p>
                  <p className="text-[10px] text-gray-400">marketplace.bharatbazar.in</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 font-semibold">Ravi Electro Hub</p>
              <p className="text-xs text-gray-400">GSTIN: 27ABCDE1234F1Z5</p>
              <p className="text-xs text-gray-400">Plot 12, MIDC, Andheri East, Mumbai 400093</p>
              <p className="text-xs text-gray-400">Ph: +91-98765-43210</p>
            </div>
            <div className="text-right shrink-0">
              <p
                className="text-lg font-black"
                style={{ color: G }}
              >
                TAX INVOICE
              </p>
              <p className="text-xs text-gray-500 mt-1">Invoice No: <strong className="text-gray-900">{invoice.id}</strong></p>
              <p className="text-xs text-gray-500">Order ID: <strong className="text-gray-900">{invoice.orderId}</strong></p>
              <p className="text-xs text-gray-500">Date: <strong className="text-gray-900">{invoice.date}</strong></p>
              <p className="text-xs text-gray-500">Due: <strong className="text-gray-900">Immediate</strong></p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200" />

          {/* Bill to */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-3 bg-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
              <p className="text-xs font-bold text-gray-900">{invoice.customer}</p>
              <p className="text-xs text-gray-500">123, Shivaji Nagar, Pune 411005</p>
              <p className="text-xs text-gray-500">Maharashtra, India</p>
              <p className="text-xs text-gray-500">Ph: +91-98001-12345</p>
            </div>
            <div className="rounded-xl p-3 bg-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Shipping To</p>
              <p className="text-xs font-bold text-gray-900">{invoice.customer}</p>
              <p className="text-xs text-gray-500">123, Shivaji Nagar, Pune 411005</p>
              <p className="text-xs text-gray-500">Maharashtra, India</p>
              <p className="text-xs text-gray-500">PIN: 411005</p>
            </div>
          </div>

          {/* Invoice items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[480px]">
              <thead>
                <tr style={{ background: `${G}12` }}>
                  {["Item Description", "HSN", "Qty", "Rate", "Taxable Amt", "GST 18%", "Total"].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-bold text-gray-700 first:rounded-tl-lg last:rounded-tr-lg"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-gray-900">iPhone 15 Pro Max 256GB</p>
                    <p className="text-gray-400 text-[10px]">Natural Titanium — Apple India</p>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">8517</td>
                  <td className="px-3 py-2.5 text-gray-600">1</td>
                  <td className="px-3 py-2.5 text-gray-700">{fmt(invoice.amount)}</td>
                  <td className="px-3 py-2.5 text-gray-700">{fmt(invoice.amount)}</td>
                  <td className="px-3 py-2.5 text-gray-700">{fmt(invoice.gst)}</td>
                  <td className="px-3 py-2.5 font-semibold text-gray-900">{fmt(invoice.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5">
              {[
                { label: "Subtotal",   value: fmt(invoice.amount), bold: false },
                { label: "CGST 9%",    value: fmt(cgst),           bold: false },
                { label: "SGST 9%",    value: fmt(sgst),           bold: false },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-xs text-gray-600">
                  <span>{r.label}</span><span className={r.bold ? "font-bold text-gray-900" : ""}>{r.value}</span>
                </div>
              ))}
              <div
                className="flex justify-between text-sm font-black rounded-xl px-3 py-2"
                style={{ background: `${G}12`, color: GD }}
              >
                <span>Grand Total</span>
                <span>{fmt(invoice.total)}</span>
              </div>
              <p className="text-[10px] text-gray-400 text-right">
                Amount in words: {invoice.total >= 10000 ? "Rupees " + invoice.total.toLocaleString("en-IN") + " Only" : "—"}
              </p>
            </div>
          </div>

          {/* Payment terms + signature */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed border-gray-200">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Payment Terms</p>
              <p className="text-xs text-gray-600">Payment collected at time of order via BharatBazar platform.</p>
              <p className="text-xs text-gray-400 mt-0.5">UPI / Net Banking / Card</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Authorised Signatory</p>
              <div
                className="h-12 rounded-xl border border-dashed border-gray-200 flex items-center justify-center"
              >
                <span className="text-xs text-gray-300">Digital Signature</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Ravi Electro Hub</p>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center border-t border-gray-100 pt-3">
            This is a computer-generated invoice and does not require a physical signature. — BharatBazar Seller Services
          </p>
        </div>

        {/* Modal footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3 flex gap-2 rounded-b-2xl">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: G }}
          >
            <Download size={14} /> Download PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            <Printer size={14} /> Print
          </button>
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function InvoicePage() {
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<"All" | InvoiceStatus>("All");
  const [fromDate, setFromDate]           = useState("");
  const [toDate, setToDate]               = useState("");
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const statuses = ["All", "Generated", "Sent", "Downloaded"] as const;

  const filtered = INVOICES.filter((inv) => {
    const matchSearch =
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.orderId.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText size={22} style={{ color: G }} /> Invoices
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Generate, view and send GST invoices to customers
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 transition-opacity hover:opacity-90"
            style={{ background: G }}
          >
            <Plus size={14} /> Generate Invoice
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none bg-white w-52 focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all"
              placeholder="Invoice # or Order ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Date from */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none bg-white focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none bg-white focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1 p-1 rounded-xl border border-gray-200 bg-white">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={
                  statusFilter === s
                    ? { background: G, color: "#fff" }
                    : { color: "#6b7280" }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50/60">
                  {["Invoice #", "Order ID", "Customer", "Date", "Amount", "GST", "Total", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{inv.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{inv.orderId}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{inv.customer}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{inv.date}</td>
                    <td className="px-4 py-3 text-gray-700">{fmt(inv.amount)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmt(inv.gst)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{fmt(inv.total)}</td>
                    <td className="px-4 py-3"><StatusChip status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                          title="View"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Download PDF"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Send to Customer"
                        >
                          <Mail size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-10 text-center text-gray-400 text-sm">
                No invoices match your filters
              </div>
            )}
          </div>
        </div>

        {/* Invoice preview modal */}
        <AnimatePresence>
          {previewInvoice && (
            <InvoiceModal
              invoice={previewInvoice}
              onClose={() => setPreviewInvoice(null)}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
