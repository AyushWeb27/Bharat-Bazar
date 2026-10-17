"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

type ReturnStatus = "Pending" | "Approved" | "Rejected";

interface ReturnRow {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  amount: number;
  reason: string;
  status: ReturnStatus;
  date: string;
  daysLeft: number | null;
}

const returns: ReturnRow[] = [
  { id: "RET-008", orderId: "BB-4833", customer: "Pooja Mehta",  product: "Realme Buds Air 5", amount: 2299,  reason: "Defective product",    status: "Pending",  date: "Sep 4, 2026",  daysLeft: 5    },
  { id: "RET-007", orderId: "BB-4832", customer: "Rajesh Rao",   product: "OnePlus Nord CE4",  amount: 27999, reason: "Wrong item received",  status: "Approved", date: "Sep 3, 2026",  daysLeft: null },
  { id: "RET-006", orderId: "BB-4821", customer: "Sunita V.",    product: "HP Laptop",          amount: 54999, reason: "Not as described",     status: "Pending",  date: "Sep 2, 2026",  daysLeft: 3    },
  { id: "RET-005", orderId: "BB-4818", customer: "Arun G.",      product: "Samsung A55",        amount: 18999, reason: "Changed mind",         status: "Rejected", date: "Sep 1, 2026",  daysLeft: null },
  { id: "RET-004", orderId: "BB-4812", customer: "Deepak G.",    product: "JBL Speaker",        amount: 4999,  reason: "Defective product",    status: "Pending",  date: "Aug 31, 2026", daysLeft: 2    },
  { id: "RET-003", orderId: "BB-4808", customer: "Rekha P.",     product: "Mi Band 8",          amount: 3499,  reason: "Size/fit issue",       status: "Approved", date: "Aug 30, 2026", daysLeft: null },
  { id: "RET-002", orderId: "BB-4801", customer: "Kiran S.",     product: "Sony WH1000",        amount: 22999, reason: "Defective product",    status: "Approved", date: "Aug 29, 2026", daysLeft: null },
  { id: "RET-001", orderId: "BB-4795", customer: "Neha J.",      product: "OnePlus Nord",       amount: 27999, reason: "Not as described",     status: "Rejected", date: "Aug 28, 2026", daysLeft: null },
];

const reasonStats = [
  { reason: "Defective product", count: 12 },
  { reason: "Not as described",  count: 8  },
  { reason: "Wrong item",        count: 5  },
  { reason: "Changed mind",      count: 4  },
  { reason: "Size/fit issue",    count: 3  },
];

const statusStyle: Record<ReturnStatus, string> = {
  Pending:  "bg-amber-100 text-amber-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const StatusIcon = ({ s }: { s: ReturnStatus }) => {
  if (s === "Approved") return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (s === "Rejected") return <XCircle className="w-3.5 h-3.5" />;
  return <Clock className="w-3.5 h-3.5" />;
};

interface ConfirmModal {
  row: ReturnRow;
  action: "Approve" | "Reject";
}

export function SellerReturnPage() {
  const [modal, setModal] = useState<ConfirmModal | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [tooltip, setTooltip] = useState<string | null>(null);

  const pendingCount  = returns.filter((r) => r.status === "Pending").length;
  const approvedCount = returns.filter((r) => r.status === "Approved").length;
  const rejectedCount = returns.filter((r) => r.status === "Rejected").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Returns &amp; Refunds</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage customer return requests and refunds</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Returns",  value: String(returns.length), icon: RotateCcw,     color: "text-gray-600",   bg: "bg-gray-50"   },
          { label: "Pending Review", value: String(pendingCount),   icon: Clock,         color: "text-red-500",    bg: "bg-red-50"    },
          { label: "Approved",       value: String(approvedCount),  icon: CheckCircle2,  color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Rejected",       value: String(rejectedCount),  icon: XCircle,       color: "text-gray-500",   bg: "bg-gray-50"   },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`${card} p-5`}
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Return Policy Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
          <Shield className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800 mb-0.5">Return Policy</p>
          <p className="text-sm text-green-700">
            7-day return window &nbsp;|&nbsp; Products must be in original packaging &nbsp;|&nbsp; Refund processed within 5-7 business days
          </p>
        </div>
      </motion.div>

      {/* Returns Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${card} p-6`}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-4">Return Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Return ID", "Order ID", "Customer", "Product", "Amount", "Reason", "Status", "Date", "Days Left", "Actions"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {returns.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-xs text-gray-500">{r.id}</td>
                  <td className="py-3 px-3 text-xs font-mono text-blue-600">{r.orderId}</td>
                  <td className="py-3 px-3 text-gray-700">{r.customer}</td>
                  <td className="py-3 px-3 text-gray-700 max-w-[140px] truncate">{r.product}</td>
                  <td className="py-3 px-3 font-semibold text-gray-800">{fmt(r.amount)}</td>
                  <td className="py-3 px-3 max-w-[130px] relative">
                    <span
                      className="block truncate text-xs text-gray-600 cursor-help"
                      onMouseEnter={() => setTooltip(r.id)}
                      onMouseLeave={() => setTooltip(null)}
                      title={r.reason}
                    >
                      {r.reason}
                    </span>
                    <AnimatePresence>
                      {tooltip === r.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute bottom-full left-0 mb-1 z-10 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg"
                        >
                          {r.reason}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${statusStyle[r.status]}`}>
                      <StatusIcon s={r.status} />
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">{r.date}</td>
                  <td className="py-3 px-3">
                    {r.daysLeft !== null ? (
                      <span className={`text-xs font-semibold ${r.daysLeft <= 2 ? "text-red-500" : "text-amber-600"}`}>
                        {r.daysLeft}d left
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {r.status === "Pending" && (
                      <div className="flex items-center gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setModal({ row: r, action: "Approve" })}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-green-300 text-green-600 hover:bg-green-50"
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setModal({ row: r, action: "Reject" })}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                        >
                          Reject
                        </motion.button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Return Reason Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`${card} p-6`}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-4">Return Reason Analysis</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={reasonStats} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="reason" type="category" tick={{ fontSize: 11 }} width={130} />
            <Tooltip formatter={(v: number) => [v + " returns", "Count"]} />
            <Bar dataKey="count" fill={G} radius={[0, 6, 6, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  {modal.action === "Approve"
                    ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                    : <AlertTriangle className="w-5 h-5 text-red-500" />}
                  {modal.action} Return {modal.row.id}
                </h3>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium text-gray-800">{modal.row.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Product</span>
                  <span className="font-medium text-gray-800">{modal.row.product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold" style={{ color: G }}>{fmt(modal.row.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reason</span>
                  <span className="font-medium text-gray-800">{modal.row.reason}</span>
                </div>
              </div>

              {modal.action === "Reject" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rejection Reason</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain the reason for rejection..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setModal(null); setRejectReason(""); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: modal.action === "Approve" ? G : "#ef4444" }}
                >
                  Confirm {modal.action}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
