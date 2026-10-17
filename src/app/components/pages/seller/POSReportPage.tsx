"use client";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Download,
  CreditCard,
  Smartphone,
  Banknote,
  ShoppingBag,
  Receipt,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const G = "#009966";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

const paymentData = [
  { name: "Cash",  value: 48 },
  { name: "UPI",   value: 34 },
  { name: "Card",  value: 18 },
];
const PIE_COLORS = [G, "#3b82f6", "#8b5cf6"];

const dailyPOS = [
  { d: "Mon", cash: 4200, upi: 3800, card: 2200 },
  { d: "Tue", cash: 5100, upi: 4400, card: 3100 },
  { d: "Wed", cash: 3800, upi: 2900, card: 1800 },
  { d: "Thu", cash: 6200, upi: 5100, card: 3400 },
  { d: "Fri", cash: 7800, upi: 6200, card: 4100 },
  { d: "Sat", cash: 9400, upi: 7800, card: 5200 },
  { d: "Sun", cash: 5600, upi: 4300, card: 2900 },
];

const posTransactions = [
  { id: "POS-2847", customer: "Walk-in Customer",  items: 2, amount: 3498,  payment: "Cash", cashier: "Rahul K.", time: "Sep 4, 10:42 AM" },
  { id: "POS-2846", customer: "Amit Sharma",       items: 1, amount: 18999, payment: "UPI",  cashier: "Rahul K.", time: "Sep 4, 10:15 AM" },
  { id: "POS-2845", customer: "Walk-in Customer",  items: 3, amount: 7497,  payment: "Cash", cashier: "Priya S.", time: "Sep 4, 9:58 AM"  },
  { id: "POS-2844", customer: "Meena Patel",       items: 1, amount: 2999,  payment: "Card", cashier: "Priya S.", time: "Sep 4, 9:34 AM"  },
  { id: "POS-2843", customer: "Suresh K.",         items: 2, amount: 5998,  payment: "UPI",  cashier: "Rahul K.", time: "Sep 3, 4:22 PM"  },
  { id: "POS-2842", customer: "Walk-in Customer",  items: 1, amount: 1299,  payment: "Cash", cashier: "Priya S.", time: "Sep 3, 3:11 PM"  },
  { id: "POS-2841", customer: "Vinay B.",          items: 4, amount: 12996, payment: "Card", cashier: "Rahul K.", time: "Sep 3, 2:47 PM"  },
  { id: "POS-2840", customer: "Sona G.",           items: 1, amount: 54999, payment: "UPI",  cashier: "Priya S.", time: "Sep 3, 1:30 PM"  },
  { id: "POS-2839", customer: "Walk-in Customer",  items: 2, amount: 4998,  payment: "Cash", cashier: "Rahul K.", time: "Sep 3, 11:04 AM" },
  { id: "POS-2838", customer: "Nandini R.",        items: 1, amount: 22999, payment: "Card", cashier: "Priya S.", time: "Sep 3, 10:18 AM" },
];

const topPOSProducts = [
  { product: "Samsung A55",     units: 18, revenue: 341982, payment: "UPI"  },
  { product: "HP Laptop 14",    units: 7,  revenue: 384993, payment: "Card" },
  { product: "JBL Speaker",     units: 24, revenue: 119976, payment: "Cash" },
  { product: "Noise ColorFit",  units: 31, revenue: 108469, payment: "UPI"  },
  { product: "Zebronics Mouse", units: 42, revenue: 104958, payment: "Cash" },
];

const periods = ["Today", "7D", "30D", "90D"];

const paymentIcon: Record<string, React.ReactNode> = {
  Cash: <Banknote className="w-3.5 h-3.5 text-green-600" />,
  UPI:  <Smartphone className="w-3.5 h-3.5 text-blue-600" />,
  Card: <CreditCard className="w-3.5 h-3.5 text-purple-600" />,
};

export function SellerPOSReportPage() {
  const [period, setPeriod] = useState("7D");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">POS Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">Point-of-sale analytics &amp; transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  period === p ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: G }}
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "POS Revenue",   value: "₹2,42,800", icon: ShoppingBag,  color: "text-green-600", bg: "bg-green-50"  },
          { label: "POS Orders",    value: "234",        icon: Receipt,      color: "text-blue-600",  bg: "bg-blue-50"   },
          { label: "Avg POS Value", value: "₹2,378",     icon: CreditCard,   color: "text-purple-600",bg: "bg-purple-50" },
          { label: "Cash Ratio",    value: "48%",        icon: Banknote,     color: "text-amber-600", bg: "bg-amber-50"  },
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Payment Method Pie */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`${card} p-6`}
        >
          <h2 className="text-base font-semibold text-gray-800 mb-3">Payment Methods</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {paymentData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {paymentData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-gray-600">{d.name}</span>
                </span>
                <span className="font-semibold text-gray-800">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stacked Daily BarChart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className={`${card} p-6 lg:col-span-2`}
        >
          <h2 className="text-base font-semibold text-gray-800 mb-3">Daily POS Sales (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyPOS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="d" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number, name: string) => [fmt(v), name.charAt(0).toUpperCase() + name.slice(1)]} />
              <Legend />
              <Bar dataKey="cash" name="Cash" stackId="a" fill={G}         radius={[0, 0, 0, 0]} />
              <Bar dataKey="upi"  name="UPI"  stackId="a" fill="#3b82f6"   radius={[0, 0, 0, 0]} />
              <Bar dataKey="card" name="Card" stackId="a" fill="#8b5cf6"   radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* POS Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className={`${card} p-6`}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-4">POS Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["POS ID", "Customer", "Items", "Amount", "Payment", "Cashier", "Time", "Receipt"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posTransactions.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-xs text-gray-500">{t.id}</td>
                  <td className="py-3 px-3 text-gray-700">{t.customer}</td>
                  <td className="py-3 px-3 text-gray-600">{t.items}</td>
                  <td className="py-3 px-3 font-semibold text-gray-800">{fmt(t.amount)}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium">
                      {paymentIcon[t.payment]}
                      {t.payment}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-600">{t.cashier}</td>
                  <td className="py-3 px-3 text-xs text-gray-400 whitespace-nowrap">{t.time}</td>
                  <td className="py-3 px-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Receipt className="w-3 h-3" />
                      View
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Top POS Products */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className={`${card} p-6`}
      >
        <h2 className="text-base font-semibold text-gray-800 mb-4">Top POS Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Product", "Units Sold", "Revenue", "Top Payment Method"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topPOSProducts.map((p, i) => (
                <tr key={p.product} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-3 font-medium text-gray-800">{p.product}</td>
                  <td className="py-3 px-3 text-gray-700">{p.units}</td>
                  <td className="py-3 px-3 font-medium text-gray-700">{fmt(p.revenue)}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                      {paymentIcon[p.payment]}
                      {p.payment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
