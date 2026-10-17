"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Wallet,
  ArrowDownToLine,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Download,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const fmt = (n: number) => "₹" + Math.abs(n).toLocaleString("en-IN");

const transactions = [
  { id: "TXN-2847", type: "Order Credit",    orderId: "BB-4847", amount: 18999,   net: +17099,  date: "Sep 4, 2026",  time: "10:24 AM" },
  { id: "TXN-2846", type: "Commission",       orderId: "BB-4847", amount: -1900,   net: -1900,   date: "Sep 4, 2026",  time: "10:24 AM" },
  { id: "TXN-2845", type: "Order Credit",    orderId: "BB-4846", amount: 2499,    net: +2249,   date: "Sep 4, 2026",  time: "10:11 AM" },
  { id: "TXN-2844", type: "Commission",       orderId: "BB-4846", amount: -250,    net: -250,    date: "Sep 4, 2026",  time: "10:11 AM" },
  { id: "TXN-2843", type: "Payout",           orderId: "PAY-036", amount: -384200, net: -384200, date: "Sep 3, 2026",  time: "2:00 PM"  },
  { id: "TXN-2842", type: "Order Credit",    orderId: "BB-4845", amount: 27999,   net: +25199,  date: "Sep 3, 2026",  time: "1:45 PM"  },
  { id: "TXN-2841", type: "Commission",       orderId: "BB-4845", amount: -2800,   net: -2800,   date: "Sep 3, 2026",  time: "1:45 PM"  },
  { id: "TXN-2840", type: "Refund Deduction", orderId: "BB-4833", amount: -2299,   net: -2299,   date: "Sep 2, 2026",  time: "11:30 AM" },
  { id: "TXN-2839", type: "Order Credit",    orderId: "BB-4844", amount: 4999,    net: +4499,   date: "Sep 2, 2026",  time: "9:22 AM"  },
  { id: "TXN-2838", type: "Commission",       orderId: "BB-4844", amount: -500,    net: -500,    date: "Sep 2, 2026",  time: "9:22 AM"  },
  { id: "TXN-2837", type: "Order Credit",    orderId: "BB-4843", amount: 42999,   net: +38699,  date: "Sep 1, 2026",  time: "8:15 PM"  },
  { id: "TXN-2836", type: "Commission",       orderId: "BB-4843", amount: -4300,   net: -4300,   date: "Sep 1, 2026",  time: "8:15 PM"  },
  { id: "TXN-2835", type: "Adjustment",       orderId: "-",       amount: 500,     net: +500,    date: "Sep 1, 2026",  time: "3:00 PM"  },
  { id: "TXN-2834", type: "Order Credit",    orderId: "BB-4842", amount: 3499,    net: +3149,   date: "Sep 1, 2026",  time: "2:44 PM"  },
  { id: "TXN-2833", type: "Commission",       orderId: "BB-4842", amount: -350,    net: -350,    date: "Sep 1, 2026",  time: "2:44 PM"  },
  { id: "TXN-2832", type: "Payout",           orderId: "PAY-035", amount: -412600, net: -412600, date: "Aug 31, 2026", time: "2:00 PM"  },
  { id: "TXN-2831", type: "Order Credit",    orderId: "BB-4841", amount: 22999,   net: +20699,  date: "Aug 31, 2026", time: "1:12 PM"  },
  { id: "TXN-2830", type: "Commission",       orderId: "BB-4841", amount: -2300,   net: -2300,   date: "Aug 31, 2026", time: "1:12 PM"  },
  { id: "TXN-2829", type: "Refund Deduction", orderId: "BB-4832", amount: -27999,  net: -27999,  date: "Aug 30, 2026", time: "10:00 AM" },
  { id: "TXN-2828", type: "Order Credit",    orderId: "BB-4840", amount: 54999,   net: +49499,  date: "Aug 30, 2026", time: "9:30 AM"  },
];

const monthlyData = [
  { month: "Jan", earnings: 8.4 },
  { month: "Feb", earnings: 12.1 },
  { month: "Mar", earnings: 9.8 },
  { month: "Apr", earnings: 15.3 },
  { month: "May", earnings: 18.7 },
  { month: "Jun", earnings: 14.2 },
  { month: "Jul", earnings: 21.4 },
  { month: "Aug", earnings: 24.6 },
  { month: "Sep", earnings: 18.4 },
];

const typeBadge: Record<string, string> = {
  "Order Credit":    "bg-green-100 text-green-700",
  "Commission":      "bg-orange-100 text-orange-700",
  "Payout":          "bg-blue-100 text-blue-700",
  "Refund Deduction":"bg-red-100 text-red-700",
  "Adjustment":      "bg-purple-100 text-purple-700",
};

const dateFilters = ["7D", "30D", "90D", "All"];

export function SellerWalletPage() {
  const [activePeriod, setActivePeriod] = useState("30D");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet &amp; Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your earnings and withdrawals</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: G }}
        >
          <ArrowDownToLine className="w-4 h-4" />
          Request Withdrawal
        </motion.button>
      </div>

      {/* Balance Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-7 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d1117 0%, #1a2f23 100%)" }}
      >
        {/* animated wallet icon */}
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10"
        >
          <Wallet className="w-40 h-40 text-white" />
        </motion.div>

        <p className="text-sm font-medium text-green-400 uppercase tracking-wider mb-1">Available Balance</p>
        <motion.p
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-bold text-white mb-3"
        >
          ₹4,21,800
        </motion.p>
        <p className="text-sm text-gray-400 mb-6">
          Total Earned: ₹1,84,20,000 &nbsp;|&nbsp; Total Withdrawn: ₹1,79,98,200
        </p>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: G }}
          >
            <ArrowDownToLine className="w-4 h-4" />
            Request Withdrawal
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/30 backdrop-blur-sm"
          >
            Transaction History
          </motion.button>
        </div>
      </motion.div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Available Balance",    value: "₹4,21,800",      icon: Wallet,          color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Pending Settlement",   value: "₹84,200",        icon: Clock,           color: "text-amber-600",  bg: "bg-amber-50"  },
          { label: "This Month",           value: "₹38,20,400",     icon: TrendingUp,      color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "Total Withdrawn",      value: "₹1,79,98,200",   icon: ArrowUpRight,    color: "text-gray-600",   bg: "bg-gray-50"   },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
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

      {/* Monthly Earnings Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${card} p-6`}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Earnings (₹ Lakhs)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={G} stopOpacity={0.3} />
                <stop offset="95%" stopColor={G} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}L`} />
            <Tooltip formatter={(v: number) => [`₹${v}L`, "Earnings"]} />
            <Area type="monotone" dataKey="earnings" stroke={G} strokeWidth={2.5} fill="url(#walletGrad)" dot={{ fill: G, r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Transaction Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`${card} p-6`}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-base font-semibold text-gray-800">Transaction History</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {dateFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActivePeriod(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activePeriod === f ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">
              <Download className="w-3.5 h-3.5" />
              Download Statement
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["TXN ID", "Type", "Order/Ref", "Amount", "Net", "Date & Time"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-xs text-gray-500">{t.id}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${typeBadge[t.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-600">{t.orderId}</td>
                  <td className="py-3 px-3 font-medium text-gray-800">{fmt(t.amount)}</td>
                  <td className={`py-3 px-3 font-semibold ${t.net > 0 ? "text-green-600" : t.net < 0 ? "text-red-500" : "text-blue-500"}`}>
                    {t.net > 0 ? "+" : ""}{fmt(t.net)}
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-500">
                    <span>{t.date}</span>
                    <span className="block text-gray-400">{t.time}</span>
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
