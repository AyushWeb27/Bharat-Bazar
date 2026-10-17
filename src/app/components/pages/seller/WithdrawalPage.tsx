"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowDownToLine,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  Plus,
} from "lucide-react";

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400";

const withdrawals = [
  { id: "WD-037", amount: 421800,  date: "Sep 4, 2026",   status: "Pending",   bank: "ICICI ••••4521", ref: "WD20260904001", note: "Weekly settlement" },
  { id: "WD-036", amount: 384200,  date: "Sep 3, 2026",   status: "Processed", bank: "ICICI ••••4521", ref: "WD20260903001", note: "" },
  { id: "WD-035", amount: 412600,  date: "Aug 31, 2026",  status: "Processed", bank: "ICICI ••••4521", ref: "WD20260831001", note: "" },
  { id: "WD-034", amount: 298700,  date: "Aug 28, 2026",  status: "Processed", bank: "ICICI ••••4521", ref: "WD20260828001", note: "" },
  { id: "WD-033", amount: 467300,  date: "Aug 24, 2026",  status: "Processed", bank: "ICICI ••••4521", ref: "WD20260824001", note: "" },
  { id: "WD-032", amount: 341200,  date: "Aug 21, 2026",  status: "Processed", bank: "ICICI ••••4521", ref: "WD20260821001", note: "" },
  { id: "WD-031", amount: 389500,  date: "Aug 17, 2026",  status: "Processed", bank: "ICICI ••••4521", ref: "WD20260817001", note: "" },
  { id: "WD-030", amount: 312800,  date: "Aug 14, 2026",  status: "Processed", bank: "ICICI ••••4521", ref: "WD20260814001", note: "" },
  { id: "WD-029", amount: 428100,  date: "Aug 10, 2026",  status: "Processed", bank: "ICICI ••••4521", ref: "WD20260810001", note: "" },
  { id: "WD-028", amount: 287600,  date: "Aug 7, 2026",   status: "Processed", bank: "ICICI ••••4521", ref: "WD20260807001", note: "" },
  { id: "WD-027", amount: 354900,  date: "Aug 3, 2026",   status: "Processed", bank: "ICICI ••••4521", ref: "WD20260803001", note: "" },
  { id: "WD-026", amount: 398400,  date: "Jul 31, 2026",  status: "Processed", bank: "ICICI ••••4521", ref: "WD20260731001", note: "" },
  { id: "WD-025", amount: 276300,  date: "Jul 27, 2026",  status: "Processed", bank: "ICICI ••••4521", ref: "WD20260727001", note: "" },
  { id: "WD-024", amount: 431700,  date: "Jul 24, 2026",  status: "Rejected",  bank: "ICICI ••••4521", ref: "WD20260724001", note: "Insufficient balance" },
  { id: "WD-023", amount: 308200,  date: "Jul 20, 2026",  status: "Processed", bank: "ICICI ••••4521", ref: "WD20260720001", note: "" },
];

const statusStyle: Record<string, string> = {
  Pending:   "bg-amber-100 text-amber-700",
  Processed: "bg-green-100 text-green-700",
  Rejected:  "bg-red-100 text-red-700",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "Processed") return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (status === "Pending")   return <Clock className="w-3.5 h-3.5" />;
  return <XCircle className="w-3.5 h-3.5" />;
};

export function SellerWithdrawalPage() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(true);

  const available = 421800;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your payout requests</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: G }}
        >
          <Plus className="w-4 h-4" />
          New Request
        </motion.button>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Available to Withdraw", value: fmt(available),       color: "text-green-600", bg: "bg-green-50",  icon: ArrowDownToLine },
          { label: "Pending Approval",      value: "₹84,200",             color: "text-amber-600", bg: "bg-amber-50",  icon: Clock            },
          { label: "Total Withdrawn",       value: "₹1,79,98,200",        color: "text-gray-700",  bg: "bg-gray-50",   icon: Building2        },
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
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* New Withdrawal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`${card} p-6`}
          >
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5" style={{ color: G }} />
              New Withdrawal Request
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Amount */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className={`${inp} pl-8 text-lg font-semibold`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAmount(String(available))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold rounded-lg text-white"
                    style={{ backgroundColor: G }}
                  >
                    Withdraw All
                  </motion.button>
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Max available: {fmt(available)}
                </p>
              </div>

              {/* Bank Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Account</label>
                <div className={`${inp} flex items-center gap-3 cursor-default bg-gray-50`}>
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="flex-1 text-gray-700">ICICI Bank ••••4521</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note / Reference <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Weekly settlement"
                  className={inp}
                />
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm"
                style={{ backgroundColor: G }}
              >
                Request Withdrawal
              </motion.button>
              <p className="text-xs text-center text-gray-400 mt-2 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Withdrawals processed within 1-2 business days
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdrawal History Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`${card} p-6`}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-4">Withdrawal History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["WD ID", "Amount", "Bank", "Reference", "Date", "Status", "Note", "Action"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w, i) => (
                <motion.tr
                  key={w.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-xs text-gray-500">{w.id}</td>
                  <td className="py-3 px-3 font-semibold text-gray-800">{fmt(w.amount)}</td>
                  <td className="py-3 px-3 text-xs text-gray-600">{w.bank}</td>
                  <td className="py-3 px-3 font-mono text-xs text-gray-400">{w.ref}</td>
                  <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">{w.date}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${statusStyle[w.status]}`}>
                      <StatusIcon status={w.status} />
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-400 max-w-[120px] truncate">{w.note || "—"}</td>
                  <td className="py-3 px-3">
                    {w.status === "Pending" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                      >
                        Cancel
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
