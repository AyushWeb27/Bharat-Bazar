import { useState } from "react";
import { motion } from "motion/react";
import {
  TrendingUp, Calendar, Clock, DollarSign,
  Download, Building2, CheckCircle2, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { S, fmt, card, inp } from "./shared/constants";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type EarningsTab = "earnings" | "payouts" | "transactions";
type TxnType = "Order Credit" | "Commission Debit" | "Refund Debit" | "Adjustment";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const monthlyData = [
  { month: "Jan", amount: 1420000 },
  { month: "Feb", amount: 1680000 },
  { month: "Mar", amount: 1950000 },
  { month: "Apr", amount: 1380000 },
  { month: "May", amount: 2140000 },
  { month: "Jun", amount: 2380000 },
  { month: "Jul", amount: 2760000 },
  { month: "Aug", amount: 3120000 },
  { month: "Sep", amount: 3820400 },
];

const payouts = [
  { id: "PAY-037", amount: 421800,  date: "Sep 10, 2026", status: "Upcoming",  orders: 47, period: "Sep 1-7"      },
  { id: "PAY-036", amount: 384200,  date: "Sep 6, 2026",  status: "Processed", orders: 43, period: "Aug 25-31"    },
  { id: "PAY-035", amount: 412600,  date: "Sep 3, 2026",  status: "Processed", orders: 51, period: "Aug 18-24"    },
  { id: "PAY-034", amount: 298700,  date: "Aug 30, 2026", status: "Processed", orders: 34, period: "Aug 11-17"    },
  { id: "PAY-033", amount: 467300,  date: "Aug 27, 2026", status: "Processed", orders: 58, period: "Aug 4-10"     },
  { id: "PAY-032", amount: 341200,  date: "Aug 23, 2026", status: "Processed", orders: 42, period: "Jul 28-Aug 3" },
  { id: "PAY-031", amount: 389500,  date: "Aug 20, 2026", status: "Processed", orders: 48, period: "Jul 21-27"    },
  { id: "PAY-030", amount: 312800,  date: "Aug 16, 2026", status: "Processed", orders: 39, period: "Jul 14-20"    },
  { id: "PAY-029", amount: 428100,  date: "Aug 13, 2026", status: "Processed", orders: 53, period: "Jul 7-13"     },
  { id: "PAY-028", amount: 287600,  date: "Aug 9, 2026",  status: "Processed", orders: 36, period: "Jun 30-Jul 6" },
  { id: "PAY-027", amount: 354900,  date: "Aug 6, 2026",  status: "Processed", orders: 44, period: "Jun 23-29"    },
  { id: "PAY-026", amount: 398400,  date: "Aug 2, 2026",  status: "Processed", orders: 49, period: "Jun 16-22"    },
  { id: "PAY-025", amount: 276300,  date: "Jul 30, 2026", status: "Processed", orders: 33, period: "Jun 9-15"     },
  { id: "PAY-024", amount: 431700,  date: "Jul 26, 2026", status: "Processed", orders: 54, period: "Jun 2-8"      },
  { id: "PAY-023", amount: 308200,  date: "Jul 23, 2026", status: "Processed", orders: 38, period: "May 26-Jun 1" },
];

const transactions: { id: string; type: TxnType; orderId: string; amount: number; net: number; date: string }[] = [
  { id: "TXN-3001", type: "Order Credit",    orderId: "ORD-8821", amount:  4200, net:  3780, date: "Sep 4, 2026"  },
  { id: "TXN-3002", type: "Commission Debit",orderId: "ORD-8821", amount:  -420, net:  3780, date: "Sep 4, 2026"  },
  { id: "TXN-3003", type: "Order Credit",    orderId: "ORD-8820", amount:  6800, net:  6120, date: "Sep 3, 2026"  },
  { id: "TXN-3004", type: "Commission Debit",orderId: "ORD-8820", amount:  -680, net:  6120, date: "Sep 3, 2026"  },
  { id: "TXN-3005", type: "Refund Debit",    orderId: "ORD-8814", amount: -2100, net: -2100, date: "Sep 3, 2026"  },
  { id: "TXN-3006", type: "Order Credit",    orderId: "ORD-8819", amount:  3500, net:  3150, date: "Sep 2, 2026"  },
  { id: "TXN-3007", type: "Commission Debit",orderId: "ORD-8819", amount:  -350, net:  3150, date: "Sep 2, 2026"  },
  { id: "TXN-3008", type: "Adjustment",      orderId: "ORD-8810", amount:   200, net:   200, date: "Sep 2, 2026"  },
  { id: "TXN-3009", type: "Order Credit",    orderId: "ORD-8818", amount:  9200, net:  8280, date: "Sep 1, 2026"  },
  { id: "TXN-3010", type: "Commission Debit",orderId: "ORD-8818", amount:  -920, net:  8280, date: "Sep 1, 2026"  },
  { id: "TXN-3011", type: "Order Credit",    orderId: "ORD-8817", amount:  5600, net:  5040, date: "Aug 31, 2026" },
  { id: "TXN-3012", type: "Commission Debit",orderId: "ORD-8817", amount:  -560, net:  5040, date: "Aug 31, 2026" },
  { id: "TXN-3013", type: "Refund Debit",    orderId: "ORD-8802", amount: -3400, net: -3400, date: "Aug 30, 2026" },
  { id: "TXN-3014", type: "Order Credit",    orderId: "ORD-8816", amount:  7800, net:  7020, date: "Aug 30, 2026" },
  { id: "TXN-3015", type: "Commission Debit",orderId: "ORD-8816", amount:  -780, net:  7020, date: "Aug 30, 2026" },
  { id: "TXN-3016", type: "Order Credit",    orderId: "ORD-8815", amount:  4100, net:  3690, date: "Aug 29, 2026" },
  { id: "TXN-3017", type: "Commission Debit",orderId: "ORD-8815", amount:  -410, net:  3690, date: "Aug 29, 2026" },
  { id: "TXN-3018", type: "Adjustment",      orderId: "ORD-8805", amount:  -150, net:  -150, date: "Aug 28, 2026" },
  { id: "TXN-3019", type: "Order Credit",    orderId: "ORD-8813", amount:  8900, net:  8010, date: "Aug 28, 2026" },
  { id: "TXN-3020", type: "Commission Debit",orderId: "ORD-8813", amount:  -890, net:  8010, date: "Aug 28, 2026" },
];

const txnTypeStyle: Record<TxnType, { color: string; bg: string }> = {
  "Order Credit":    { color: "#009966", bg: "rgba(0,153,102,0.10)"  },
  "Commission Debit":{ color: "#ef4444", bg: "rgba(239,68,68,0.10)"  },
  "Refund Debit":    { color: "#ef4444", bg: "rgba(239,68,68,0.10)"  },
  "Adjustment":      { color: "#3b82f6", bg: "rgba(59,130,246,0.10)" },
};

/* ─── Shared helpers ─────────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, color = "#6b7280",
  icon: Icon,
}: {
  label: string; value: string; sub?: string; color?: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${card} p-5 flex items-start gap-4`}
    >
      <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: color + "18" }}>
        <Icon size={20} color={color} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className={`${card} p-5`}>
      {title && <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>}
      {children}
    </div>
  );
}

/* ─── Earnings tab ───────────────────────────────────────────────────────── */
function EarningsTabContent() {
  const gross      = 18420000;
  const commission = gross * 0.10;
  const net        = gross - commission;
  const tds        = gross * 0.01;
  const settlement = net - tds;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earnings"      value={fmt(18420000)} sub="All time"            color={S}        icon={TrendingUp}  />
        <StatCard label="This Month"           value={fmt(3820400)}  sub="Sep 2026"            color="#3b82f6"  icon={Calendar}    />
        <StatCard label="Pending Settlement"   value={fmt(421800)}   sub="Next payout Sep 10" color="#f59e0b"  icon={Clock}       />
        <StatCard label="Platform Commission"  value={fmt(1842000)}  sub="10% of gross"       color="#8b5cf6"  icon={DollarSign}  />
      </div>

      <SectionCard title="Monthly Earnings">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={S} stopOpacity={0.28} />
                <stop offset="95%" stopColor={S} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v: number) => "₹" + (v / 100000).toFixed(0) + "L"}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false} tickLine={false} width={52}
            />
            <Tooltip
              formatter={(v: number) => [fmt(v), "Earnings"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13 }}
            />
            <Area type="monotone" dataKey="amount" stroke={S} strokeWidth={2.5} fill="url(#earningsGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Earnings Breakdown">
          <div className="space-y-2.5">
            {[
              { label: "Gross Revenue",             value: gross,      neg: false, bold: false, highlight: false },
              { label: "Platform Commission (10%)", value: commission, neg: true,  bold: false, highlight: false },
              { label: "Net Earnings",              value: net,        neg: false, bold: true,  highlight: false },
              { label: "TDS (1%)",                  value: tds,        neg: true,  bold: false, highlight: false },
              { label: "Final Settlement",          value: settlement, neg: false, bold: true,  highlight: true  },
            ].map((r) => (
              <div
                key={r.label}
                className={`flex items-center justify-between py-2.5 px-3 rounded-xl ${r.highlight ? "bg-indigo-50" : "bg-gray-50"}`}
              >
                <span className={`text-sm ${r.bold ? "font-semibold text-gray-900" : "text-gray-600"}`}>{r.label}</span>
                <span className={`text-sm font-semibold ${r.neg ? "text-red-500" : r.highlight ? "text-indigo-700" : "text-gray-900"}`}>
                  {r.neg ? "-" : ""}{fmt(r.value)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Commission Rate">
            <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-800 font-medium flex items-center gap-2 flex-wrap">
              <ArrowUpRight size={16} className="text-indigo-500 flex-shrink-0" />
              <span>Your commission rate: <strong>8%</strong></span>
              <span className="text-indigo-500 font-normal">| Next tier at ₹2Cr GMV: <strong>7%</strong></span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Current GMV</span><span>₹1.84Cr / ₹2Cr</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "92%", background: S }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">92% to next commission tier</p>
            </div>
          </SectionCard>

          <SectionCard title="Payout Schedule">
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3">
              <Calendar size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Payouts processed every Wednesday and Saturday</p>
                <p className="text-xs text-amber-600 mt-0.5">Next payout: <strong>Sep 10, 2026</strong> — {fmt(421800)}</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/* ─── Payouts tab ────────────────────────────────────────────────────────── */
function PayoutsTabContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Paid Out"  value={fmt(17998200)} sub="All time"         color="#009966"  icon={CheckCircle2} />
        <StatCard label="Next Payout"     value={fmt(421800)}   sub="on Sep 10, 2026"  color={S}        icon={Calendar}     />
        <StatCard label="Avg Payout"      value={fmt(48200)}    sub="Per cycle"        color="#3b82f6"  icon={TrendingUp}   />
        <StatCard label="Total Payouts"   value="37"            sub="Completed"        color="#8b5cf6"  icon={DollarSign}   />
      </div>

      <SectionCard>
        <div className="flex items-center gap-3">
          <Building2 size={20} className="text-gray-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">ICICI Bank  •  ••••4521</p>
            <p className="text-xs text-gray-400">Primary payout account</p>
          </div>
          <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
            Verified ✓
          </span>
        </div>
      </SectionCard>

      <SectionCard title="Payout History">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                {["Payout ID", "Period", "Orders", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} className="pb-2.5 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2.5 pr-4 font-mono text-xs text-gray-600">{p.id}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{p.period}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{p.orders}</td>
                  <td className="py-2.5 pr-4 font-semibold text-gray-900">{fmt(p.amount)}</td>
                  <td className="py-2.5 pr-4 text-gray-500">{p.date}</td>
                  <td className="py-2.5">
                    <span
                      className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={
                        p.status === "Upcoming"
                          ? { color: S, background: S + "18" }
                          : { color: "#009966", background: "rgba(0,153,102,0.12)" }
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ─── Transactions tab ───────────────────────────────────────────────────── */
function TransactionsTabContent() {
  const [search, setSearch] = useState("");
  const [range, setRange]   = useState<"7D" | "30D" | "90D">("30D");

  const filtered = transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.orderId.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className={`${inp} max-w-xs`}
          placeholder="Search by TXN ID, Order ID or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {(["7D", "30D", "90D"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={range === r ? { background: S, color: "#fff" } : { color: "#6b7280" }}
            >
              {r}
            </button>
          ))}
        </div>
        <button className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Download size={14} />
          Download Statement
        </button>
      </div>

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                {["TXN ID", "Type", "Order ID", "Amount", "Net", "Date"].map((h) => (
                  <th key={h} className="pb-2.5 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const style    = txnTypeStyle[t.type];
                const isCredit = t.amount > 0;
                return (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">{t.id}</td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: style.color, background: style.bg }}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-600 font-mono text-xs">{t.orderId}</td>
                    <td className={`py-2.5 pr-4 font-semibold ${isCredit ? "text-green-600" : "text-red-500"}`}>
                      {isCredit ? "+" : ""}{fmt(t.amount)}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700 font-medium">{fmt(Math.abs(t.net))}</td>
                    <td className="py-2.5 text-gray-400 text-xs whitespace-nowrap">{t.date}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">No transactions found</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export function SellerEarningsPage({ tab }: { tab: EarningsTab }) {
  const [activeTab, setActiveTab] = useState<EarningsTab>(tab);

  const tabs: { key: EarningsTab; label: string }[] = [
    { key: "earnings",     label: "Earnings"     },
    { key: "payouts",      label: "Payouts"      },
    { key: "transactions", label: "Transactions" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Earnings, payouts and transaction history</p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl border border-gray-200 bg-white w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === t.key
                  ? { background: S, color: "#fff", boxShadow: "0 1px 4px rgba(99,102,241,0.3)" }
                  : { color: "#6b7280" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "earnings"     && <EarningsTabContent />}
          {activeTab === "payouts"      && <PayoutsTabContent />}
          {activeTab === "transactions" && <TransactionsTabContent />}
        </motion.div>
      </div>
    </div>
  );
}
