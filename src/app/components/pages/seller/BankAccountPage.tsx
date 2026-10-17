import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard, Edit2, Trash2, Plus, CheckCircle2,
  Calendar, Download, AlertCircle, Banknote, Landmark,
  ToggleLeft, ToggleRight,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
const G    = "#009966";
const GD   = "#007a52";
const card  = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const inp   = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white";

// ── Types ────────────────────────────────────────────────────────────────────
interface Payout {
  date: string;
  amount: number;
  status: "Paid" | "Processing" | "Failed";
  utr: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const PAYOUTS: Payout[] = [
  { date: "Oct 3, 2026",  amount: 12450, status: "Processing", utr: "—"            },
  { date: "Sep 29, 2026", amount: 18320, status: "Paid",       utr: "UTR326481900" },
  { date: "Sep 25, 2026", amount: 9870,  status: "Paid",       utr: "UTR326183741" },
  { date: "Sep 22, 2026", amount: 22100, status: "Paid",       utr: "UTR325892100" },
  { date: "Sep 18, 2026", amount: 7650,  status: "Paid",       utr: "UTR325601833" },
  { date: "Sep 15, 2026", amount: 15430, status: "Paid",       utr: "UTR325311209" },
  { date: "Sep 11, 2026", amount: 3200,  status: "Failed",     utr: "—"            },
  { date: "Sep 8, 2026",  amount: 19800, status: "Paid",       utr: "UTR325002018" },
];

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

// ── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: Payout["status"] }) {
  const map = {
    Paid:       { bg: `${G}18`,         color: G          },
    Processing: { bg: "#3b82f618",      color: "#3b82f6"  },
    Failed:     { bg: "#ef444418",      color: "#ef4444"  },
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

// ── Add bank form ─────────────────────────────────────────────────────────────
function AddBankForm({ onClose }: { onClose: () => void }) {
  const [ifsc, setIfsc]     = useState("");
  const [bankName, setBankName] = useState("");
  const [primary, setPrimary]   = useState(false);
  const [acType, setAcType]     = useState<"Savings" | "Current">("Savings");

  const verifyIfsc = () => {
    if (ifsc.length >= 4) setBankName("HDFC Bank — Andheri West, Mumbai");
    else setBankName("");
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="border-t border-gray-100 p-5 space-y-4">
        <h4 className="text-sm font-bold text-gray-900">Add New Bank Account</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Account Holder Name</label>
            <input className={inp} placeholder="e.g. Ravi Kumar" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Account Number</label>
            <input className={inp} type="password" placeholder="Enter account number" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Account Number</label>
            <input className={inp} placeholder="Re-enter account number" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">IFSC Code</label>
            <div className="flex gap-2">
              <input
                className={inp}
                placeholder="e.g. HDFC0001234"
                value={ifsc}
                onChange={(e) => { setIfsc(e.target.value.toUpperCase()); setBankName(""); }}
              />
              <button
                onClick={verifyIfsc}
                className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: G }}
              >
                Verify
              </button>
            </div>
            {bankName && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 size={11} /> {bankName}
              </p>
            )}
          </div>
        </div>

        {/* Account type */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Account Type</label>
          <div className="flex gap-2">
            {(["Savings", "Current"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setAcType(t)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all"
                style={
                  acType === t
                    ? { background: G, color: "#fff", borderColor: G }
                    : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Set as primary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-800">Set as Primary Account</p>
            <p className="text-xs text-gray-400">Payouts will go to this account</p>
          </div>
          <button onClick={() => setPrimary(!primary)}>
            {primary
              ? <ToggleRight size={28} style={{ color: G }} />
              : <ToggleLeft size={28} className="text-gray-300" />}
          </button>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: G }}
          >
            Save Bank Account
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function BankAccountPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUpi, setEditingUpi]   = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Banknote size={22} style={{ color: G }} /> Bank Account &amp; Payouts
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your payout accounts and withdrawal settings
          </p>
        </div>

        {/* Balance + Withdraw */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)` }}
        >
          <div className="flex-1">
            <p className="text-xs font-semibold text-green-200">Available Balance</p>
            <p className="text-3xl font-black text-white mt-1">₹12,450</p>
            <p className="text-xs text-green-200 mt-1">Minimum withdrawal: ₹500</p>
          </div>
          <button
            className="shrink-0 px-6 py-3 rounded-xl text-sm font-black bg-white transition-opacity hover:opacity-90"
            style={{ color: GD }}
          >
            Withdraw Now
          </button>
        </motion.div>

        {/* Linked bank account */}
        <div className={card}>
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Linked Bank Account</h3>
          </div>
          <div className="p-5 flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${G}15` }}
            >
              <Landmark size={20} style={{ color: G }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Ravi Kumar</p>
              <p className="text-xs text-gray-500 mt-0.5">HDFC Bank</p>
              <p className="text-sm text-gray-700 font-medium mt-1">XXXX XXXX 4521</p>
              <p className="text-xs text-gray-400">IFSC: HDFC0001234</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: `${G}18`, color: G }}
                >
                  <CheckCircle2 size={11} /> Verified
                </span>
                <span
                  className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: `${G}12`, color: G }}
                >
                  Primary
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <Edit2 size={14} />
              </button>
              <button className="w-9 h-9 rounded-xl flex items-center justify-center border border-red-100 text-red-400 hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Add bank toggle */}
          <div className="px-5 pb-5">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all"
              style={
                showAddForm
                  ? { borderColor: G, color: G, background: `${G}0a` }
                  : { borderColor: "#e5e7eb", color: "#374151", background: "#fff" }
              }
            >
              <Plus size={14} /> Add New Bank Account
            </button>
          </div>

          <AnimatePresence>
            {showAddForm && <AddBankForm onClose={() => setShowAddForm(false)} />}
          </AnimatePresence>
        </div>

        {/* UPI */}
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">UPI ID</h3>
            <button
              onClick={() => setEditingUpi(!editingUpi)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={12} /> Edit
            </button>
          </div>
          <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-gray-50 border border-gray-100">
            <CreditCard size={16} style={{ color: G }} />
            {editingUpi ? (
              <input
                defaultValue="ravielectro@upi"
                className="flex-1 bg-transparent text-sm font-medium text-gray-800 outline-none"
                onBlur={() => setEditingUpi(false)}
                autoFocus
              />
            ) : (
              <span className="text-sm font-semibold text-gray-800">ravielectro@upi</span>
            )}
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${G}18`, color: G }}
            >
              Linked ✓
            </span>
          </div>
        </div>

        {/* Payout schedule */}
        <div className={`${card} p-5`}>
          <div className="flex items-start gap-3 rounded-xl px-4 py-3.5"
            style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
          >
            <Calendar size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Payouts every Monday and Thursday
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Next payout: <strong>Oct 7, 2026</strong> — ₹12,450 pending
              </p>
            </div>
          </div>
        </div>

        {/* Transaction history */}
        <div className={card}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Payout History</h3>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              <Download size={13} /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  {["Date", "Amount", "Status", "UTR Number"].map((h) => (
                    <th key={h} className="px-5 py-2.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAYOUTS.map((p, i) => (
                  <motion.tr
                    key={p.utr + i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-2.5 text-gray-500 text-xs whitespace-nowrap">{p.date}</td>
                    <td className="px-5 py-2.5 font-semibold text-gray-900">{fmt(p.amount)}</td>
                    <td className="px-5 py-2.5"><StatusChip status={p.status} /></td>
                    <td className="px-5 py-2.5 font-mono text-xs text-gray-500">{p.utr}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
