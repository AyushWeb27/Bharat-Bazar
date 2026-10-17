import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IndianRupee, Clock, TrendingUp, BarChart2,
  Eye, Download, PauseCircle, PlayCircle,
  CheckCircle2, Circle, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { G, fmt, card, inp } from "./shared/constants";
import { PageHeader, Modal, StatCard, SearchBar } from "./shared/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type TxnStatus = "Paid" | "Pending" | "Processing" | "On Hold";

interface Transaction {
  id: string;
  seller: string;
  amount: number;
  commission: number;
  net: number;
  orders: number;
  status: TxnStatus;
  date: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRANSACTIONS: Transaction[] = [
  { id: "TXN-8821", seller: "Ravi Electro Hub",    amount: 284200, commission: 22736, net: 261464, orders: 47, status: "Paid",       date: "Sep 5, 2026" },
  { id: "TXN-8820", seller: "FashionFiesta Store", amount: 187600, commission: 22512, net: 165088, orders: 89, status: "Paid",       date: "Sep 5, 2026" },
  { id: "TXN-8819", seller: "GreenGrocer India",   amount: 94300,  commission: 5658,  net: 88642,  orders: 34, status: "Pending",    date: "Sep 4, 2026" },
  { id: "TXN-8818", seller: "BeautyBliss",         amount: 121800, commission: 18270, net: 103530, orders: 56, status: "Processing", date: "Sep 4, 2026" },
  { id: "TXN-8817", seller: "SportZone Pro",       amount: 156400, commission: 15640, net: 140760, orders: 62, status: "Paid",       date: "Sep 3, 2026" },
  { id: "TXN-8816", seller: "HomeDecor Dreams",    amount: 203700, commission: 22407, net: 181293, orders: 78, status: "Paid",       date: "Sep 3, 2026" },
  { id: "TXN-8815", seller: "PedalPower Sports",   amount: 48200,  commission: 4820,  net: 43380,  orders: 19, status: "Pending",    date: "Sep 2, 2026" },
  { id: "TXN-8814", seller: "Bookworm Paradise",   amount: 67300,  commission: 5384,  net: 61916,  orders: 41, status: "Paid",       date: "Sep 2, 2026" },
  { id: "TXN-8813", seller: "ToyLand Kingdom",     amount: 89400,  commission: 11622, net: 77778,  orders: 33, status: "On Hold",    date: "Sep 1, 2026" },
  { id: "TXN-8812", seller: "PureHarvest Organic", amount: 31200,  commission: 1872,  net: 29328,  orders: 14, status: "Processing", date: "Sep 1, 2026" },
  { id: "TXN-8811", seller: "GadgetNest",          amount: 112300, commission: 10107, net: 102193, orders: 51, status: "Paid",       date: "Aug 31, 2026" },
  { id: "TXN-8810", seller: "Ravi Electro Hub",    amount: 198700, commission: 15896, net: 182804, orders: 39, status: "Paid",       date: "Aug 31, 2026" },
  { id: "TXN-8809", seller: "FashionFiesta Store", amount: 143200, commission: 17184, net: 126016, orders: 67, status: "Paid",       date: "Aug 30, 2026" },
  { id: "TXN-8808", seller: "GreenGrocer India",   amount: 78600,  commission: 4716,  net: 73884,  orders: 28, status: "On Hold",    date: "Aug 30, 2026" },
  { id: "TXN-8807", seller: "BeautyBliss",         amount: 96800,  commission: 14520, net: 82280,  orders: 44, status: "Paid",       date: "Aug 29, 2026" },
  { id: "TXN-8806", seller: "SportZone Pro",       amount: 134500, commission: 13450, net: 121050, orders: 53, status: "Pending",    date: "Aug 29, 2026" },
  { id: "TXN-8805", seller: "HomeDecor Dreams",    amount: 167300, commission: 18403, net: 148897, orders: 64, status: "Paid",       date: "Aug 28, 2026" },
  { id: "TXN-8804", seller: "PedalPower Sports",   amount: 42100,  commission: 4210,  net: 37890,  orders: 17, status: "Paid",       date: "Aug 28, 2026" },
  { id: "TXN-8803", seller: "Bookworm Paradise",   amount: 58900,  commission: 4712,  net: 54188,  orders: 36, status: "Processing", date: "Aug 27, 2026" },
  { id: "TXN-8802", seller: "GadgetNest",          amount: 89700,  commission: 8073,  net: 81627,  orders: 43, status: "Paid",       date: "Aug 27, 2026" },
];

const TREND_DATA = [
  { month: "Feb", payouts: 21.4, commission: 2.8 },
  { month: "Mar", payouts: 28.7, commission: 3.6 },
  { month: "Apr", payouts: 19.2, commission: 2.4 },
  { month: "May", payouts: 34.6, commission: 4.3 },
  { month: "Jun", payouts: 31.8, commission: 4.0 },
  { month: "Jul", payouts: 42.3, commission: 5.3 },
  { month: "Aug", payouts: 38.9, commission: 4.9 },
  { month: "Sep", payouts: 29.4, commission: 3.7 },
];

const SELLER_SUMMARY = [
  { seller: "Ravi Electro",  payout: 48.2 },
  { seller: "FashionFiesta", payout: 38.7 },
  { seller: "HomeDecor",     payout: 32.4 },
  { seller: "BeautyBliss",   payout: 28.1 },
  { seller: "SportZone",     payout: 24.9 },
  { seller: "GreenGrocer",   payout: 19.3 },
  { seller: "GadgetNest",    payout: 17.8 },
  { seller: "ToyLand",       payout: 14.2 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<TxnStatus, { color: string; bg: string }> = {
  "Paid":       { color: G,         bg: `${G}18`                   },
  "Pending":    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)"    },
  "Processing": { color: "#3b82f6", bg: "rgba(59,130,246,0.12)"    },
  "On Hold":    { color: "#ef4444", bg: "rgba(239,68,68,0.12)"     },
};

const FILTER_TABS: ("All" | TxnStatus)[] = ["All", "Paid", "Pending", "Processing", "On Hold"];
const DATE_RANGES = ["Last 7 Days", "Last 30 Days", "Last 90 Days"];

function sellerInitials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function commissionPct(amount: number, commission: number) {
  return ((commission / amount) * 100).toFixed(1);
}

// ─── Status Pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: TxnStatus }) {
  const { color, bg } = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ color, background: bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
      {status}
    </span>
  );
}

// ─── Transaction Detail Modal ─────────────────────────────────────────────────

function DetailModal({
  txn,
  open,
  onClose,
}: {
  txn: Transaction | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!txn) return null;

  const pct = commissionPct(txn.amount, txn.commission);
  const { color } = STATUS_META[txn.status];

  const timelineSteps = [
    { label: "Created",   done: true  },
    { label: "Processed", done: txn.status !== "Pending"    },
    { label: "Settled",   done: txn.status === "Paid"       },
  ];

  const canProcess  = txn.status === "Pending" || txn.status === "Processing";
  const canHold     = txn.status === "Paid"    || txn.status === "Processing";

  return (
    <Modal open={open} onClose={onClose} title={`Transaction — ${txn.id}`} wide>
      <div className="space-y-5">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{txn.date}</span>
          <StatusPill status={txn.status} />
        </div>

        {/* Seller card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
            style={{ background: G }}
          >
            {sellerInitials(txn.seller)}
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">{txn.seller}</p>
            <p className="text-[11px] text-gray-400">{txn.orders} orders in this batch</p>
          </div>
        </div>

        {/* Financial breakdown */}
        <div className={`${card} divide-y divide-gray-100`}>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-gray-500">Gross Amount</span>
            <span className="text-sm font-bold text-gray-900">{fmt(txn.amount)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-gray-500">
              Platform Commission
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-500 font-semibold">
                {pct}%
              </span>
            </span>
            <span className="text-sm font-bold text-red-500">−{fmt(txn.commission)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-b-2xl">
            <span className="text-xs font-black text-gray-700 uppercase tracking-wide">Net Payout</span>
            <span className="text-base font-black" style={{ color: G }}>{fmt(txn.net)}</span>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3">Timeline</p>
          <div className="flex items-center gap-0">
            {timelineSteps.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all"
                    style={{
                      borderColor: step.done ? G : "#e5e7eb",
                      background:  step.done ? `${G}15` : "white",
                    }}
                  >
                    {step.done
                      ? <CheckCircle2 size={13} style={{ color: G }} />
                      : <Circle size={13} className="text-gray-300" />
                    }
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 whitespace-nowrap">{step.label}</span>
                </div>
                {i < timelineSteps.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mb-4 mx-1 transition-all"
                    style={{ background: timelineSteps[i + 1].done ? G : "#e5e7eb" }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {canProcess && (
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
              style={{ background: G }}
            >
              <PlayCircle size={14} /> Process Payout
            </button>
          )}
          {canHold && (
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
              style={{ background: "#f59e0b" }}
            >
              <PauseCircle size={14} /> Put On Hold
            </button>
          )}
          <button
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Download size={14} /> Download Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-black text-gray-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-1.5 mb-0.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-500 capitalize">{p.dataKey}:</span>
          <span className="font-bold text-gray-800">₹{p.value}L</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SellerTransactionPage() {
  const [search,      setSearch]      = useState("");
  const [filterTab,   setFilterTab]   = useState<"All" | TxnStatus>("All");
  const [dateRange,   setDateRange]   = useState("Last 7 Days");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [modalOpen,   setModalOpen]   = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return TRANSACTIONS.filter(t => {
      const matchSearch = !q || t.id.toLowerCase().includes(q) || t.seller.toLowerCase().includes(q);
      const matchTab    = filterTab === "All" || t.status === filterTab;
      return matchSearch && matchTab;
    });
  }, [search, filterTab]);

  function openDetail(txn: Transaction) {
    setSelectedTxn(txn);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6 pb-10">

      {/* 1. Header */}
      <PageHeader
        breadcrumb="Manage Seller / Transactions"
        title="Seller Transactions"
        subtitle="Track payouts, settlements and commissions"
      />

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard label="Total Payouts"      val={fmt(28491200)} color={G}         icon={IndianRupee} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard label="Pending Settlement" val={fmt(1842300)}  color="#f59e0b"   icon={Clock}       />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard label="Commission Earned"  val={fmt(2467800)}  color="#3b82f6"   icon={TrendingUp}  />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard label="This Month"         val={fmt(3820400)}  color="#8b5cf6"   icon={BarChart2}   />
        </motion.div>
      </div>

      {/* 3. Payout Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`${card} p-5`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-black text-gray-900">Payout Trend</p>
            <p className="text-[11px] text-gray-400">Last 8 months · values in Lakhs (₹L)</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full inline-block" style={{ background: G }} />
              Payouts
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full inline-block bg-blue-500" />
              Commission
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={TREND_DATA} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPayout" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={G}         stopOpacity={0.25} />
                <stop offset="95%" stopColor={G}         stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gradComm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6"  stopOpacity={0.2}  />
                <stop offset="95%" stopColor="#3b82f6"  stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}L`} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="payouts"
              stroke={G}
              strokeWidth={2}
              fill="url(#gradPayout)"
              dot={false}
              activeDot={{ r: 4, fill: G }}
            />
            <Area
              type="monotone"
              dataKey="commission"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradComm)"
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 4. Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center gap-3"
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search seller name or transaction ID…"
        />

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={
                filterTab === tab
                  ? { background: "white", color: G, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                  : { color: "#6b7280" }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Date range pills */}
        <div className="flex items-center gap-1">
          {DATE_RANGES.map(r => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
              style={
                dateRange === r
                  ? { borderColor: G, color: G, background: `${G}10` }
                  : { borderColor: "#e5e7eb", color: "#6b7280", background: "white" }
              }
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 5. Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className={`${card} overflow-hidden`}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Transactions</span>
          <span className="text-[11px] text-gray-400">{filtered.length} of {TRANSACTIONS.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[860px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["Txn ID", "Seller", "Amount", "Commission", "Net Payout", "Orders", "Status", "Date", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((txn, i) => {
                  const pct = commissionPct(txn.amount, txn.commission);
                  const { color } = STATUS_META[txn.status];
                  return (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors group"
                    >
                      <td className="px-4 py-3 text-xs font-black text-gray-700 whitespace-nowrap">
                        {txn.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                            style={{ background: G }}
                          >
                            {sellerInitials(txn.seller)}
                          </div>
                          <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">{txn.seller}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-800 whitespace-nowrap">
                        {fmt(txn.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-800">{fmt(txn.commission)}</span>
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-[9px] text-gray-500 font-semibold">
                          {pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-black whitespace-nowrap" style={{ color: G }}>
                        {fmt(txn.net)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 text-center">
                        {txn.orders}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={txn.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {txn.date}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(txn)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:border-[#009966] hover:text-[#009966] hover:bg-[#009966]/5 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Eye size={11} /> View
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 6. Per-Seller Summary BarChart */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`${card} p-5`}
      >
        <div className="mb-4">
          <p className="text-sm font-black text-gray-900">Top Sellers by Payout</p>
          <p className="text-[11px] text-gray-400">This month · values in Lakhs (₹L)</p>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={SELLER_SUMMARY} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="seller"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `₹${v}L`}
              label={{
                value: "₹L",
                angle: -90,
                position: "insideLeft",
                offset: 12,
                style: { fontSize: 10, fill: "#9ca3af" },
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
                    <p className="font-black text-gray-700 mb-1">{label}</p>
                    <p style={{ color: G }} className="font-bold">₹{payload[0].value}L</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="payout" fill={G} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Transaction Detail Modal */}
      <DetailModal
        txn={selectedTxn}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
