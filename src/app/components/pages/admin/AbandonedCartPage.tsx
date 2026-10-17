import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Mail, Phone, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { PageHeader, StatCard, SectionCard } from "./shared/ui";
import { G, card } from "./shared/constants";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

type CartStatus = "Not Contacted" | "Email Sent" | "Recovered";

type AbandonedCart = {
  id: number;
  name: string;
  email: string;
  items: number;
  value: number;
  abandonedAt: string;
  lastSeen: string;
  status: CartStatus;
  products: string[];
};

const statusMeta: Record<CartStatus, { color: string; bg: string }> = {
  "Not Contacted": { color: "#6b7280", bg: "rgba(107,114,128,0.1)"     },
  "Email Sent":    { color: "#3b82f6", bg: "rgba(59,130,246,0.12)"     },
  "Recovered":     { color: G,         bg: `${G}15`                    },
};

const CARTS: AbandonedCart[] = [
  { id: 1, name: "Priya Sharma",    email: "priya.s@gmail.com",   items: 3, value: 4299,  abandonedAt: "Today, 10:32 AM",  lastSeen: "10:45 AM",  status: "Not Contacted", products: ["Puma Sneakers", "Nike Socks x2", "Water Bottle"] },
  { id: 2, name: "Rahul Mehta",     email: "rahul.m@yahoo.com",   items: 1, value: 89999, abandonedAt: "Today, 09:14 AM",  lastSeen: "09:20 AM",  status: "Email Sent",    products: ['Samsung 55" TV'] },
  { id: 3, name: "Anjali Singh",    email: "anjali@hotmail.com",  items: 5, value: 1840,  abandonedAt: "Today, 08:55 AM",  lastSeen: "Yesterday", status: "Not Contacted", products: ["Face Serum", "Sunscreen SPF50", "Moisturizer", "Toner", "Eye Cream"] },
  { id: 4, name: "Vikram Patel",    email: "vpatel@outlook.com",  items: 2, value: 12499, abandonedAt: "Yesterday, 7 PM",  lastSeen: "Yesterday", status: "Recovered",     products: ["boAt Airdopes 141", "Phone Stand"] },
  { id: 5, name: "Meena Iyer",      email: "meena.i@gmail.com",   items: 4, value: 3210,  abandonedAt: "Yesterday, 5 PM",  lastSeen: "2 days ago",status: "Email Sent",    products: ["Basmati Rice 5kg", "Dal 2kg", "Ghee 1L", "Mustard Oil"] },
  { id: 6, name: "Suresh Kumar",    email: "suresh.k@rediff.com", items: 2, value: 67800, abandonedAt: "2 days ago, 2 PM", lastSeen: "2 days ago",status: "Not Contacted", products: ["iPhone 15 256GB", "AirPods Pro"] },
  { id: 7, name: "Deepa Nair",      email: "deepa.n@gmail.com",   items: 1, value: 1299,  abandonedAt: "2 days ago, 11AM", lastSeen: "3 days ago",status: "Not Contacted", products: ["Yoga Mat 6mm"] },
  { id: 8, name: "Arjun Reddy",     email: "arjun.r@gmail.com",   items: 3, value: 5640,  abandonedAt: "3 days ago, 6 PM", lastSeen: "3 days ago",status: "Recovered",     products: ["Running Shoes", "Protein Powder 1kg", "Gym Gloves"] },
];

const CHART_DATA = [
  { day: "Mon", abandoned: 42, recovered: 8  },
  { day: "Tue", abandoned: 58, recovered: 11 },
  { day: "Wed", abandoned: 34, recovered: 7  },
  { day: "Thu", abandoned: 67, recovered: 14 },
  { day: "Fri", abandoned: 81, recovered: 18 },
  { day: "Sat", abandoned: 52, recovered: 9  },
  { day: "Sun", abandoned: 45, recovered: 8  },
];

const RANGE_TABS = ["Today", "7 Days", "30 Days"] as const;
type RangeTab = typeof RANGE_TABS[number];

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs shadow-xl">
      <p className="font-bold text-gray-600 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-bold" style={{ color: p.fill }}>
          {p.value} <span className="text-gray-400 font-normal">{p.name}</span>
        </p>
      ))}
    </div>
  );
};

export function AbandonedCartPage() {
  const [rangeTab, setRangeTab] = useState<RangeTab>("7 Days");
  const [expanded, setExpanded] = useState<number | null>(null);

  const notContacted = CARTS.filter(c => c.status === "Not Contacted").length;
  const recovered    = CARTS.filter(c => c.status === "Recovered").length;
  const totalRevenue = CARTS.filter(c => c.status === "Recovered").reduce((s, c) => s + c.value, 0);
  const avgValue     = Math.round(CARTS.reduce((s, c) => s + c.value, 0) / CARTS.length);

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Operations / Abandoned Carts" title="Abandoned Carts"
        subtitle="Track and recover abandoned shopping carts" count={CARTS.length} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Abandoned"  val={342}                                         color="#ef4444" icon={ShoppingCart} />
        <StatCard label="Recovery Rate"    val={`${Math.round((recovered / CARTS.length) * 100)}%`} color={G}  icon={TrendingUp}   />
        <StatCard label="Recovered Revenue" val={`₹${(totalRevenue / 1000).toFixed(1)}K`}  color="#8b5cf6" icon={ShoppingCart} />
        <StatCard label="Avg Cart Value"   val={`₹${avgValue.toLocaleString("en-IN")}`}     color="#f59e0b" icon={ShoppingCart} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main cart table */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filter tabs + bulk action */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              {RANGE_TABS.map(t => (
                <button key={t} onClick={() => setRangeTab(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={rangeTab === t ? { background: G, color: "#fff" } : { color: "#6b7280" }}>
                  {t}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: "#3b82f6" }}>
              <Mail size={13} /> Send Email to {notContacted} Uncontacted
            </button>
          </div>

          {/* Table */}
          <div className={card}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Customer", "Items", "Value", "Abandoned At", "Last Seen", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider py-3 px-4 last:pr-4 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {CARTS.map(c => {
                    const meta = statusMeta[c.status];
                    const isExpanded = expanded === c.id;
                    return (
                      <React.Fragment key={c.id}>
                        <tr className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="text-xs font-bold text-gray-800">{c.name}</p>
                            <p className="text-[10px] text-gray-400">{c.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <button onClick={() => setExpanded(isExpanded ? null : c.id)}
                              className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors">
                              {c.items} {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-xs font-black text-gray-900">
                            ₹{c.value.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-gray-500 whitespace-nowrap">{c.abandonedAt}</td>
                          <td className="py-3 px-4 text-[11px] text-gray-500 whitespace-nowrap">{c.lastSeen}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                              style={{ color: meta.color, background: meta.bg }}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button title="Send reminder email"
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 transition-all">
                                <Mail size={12} />
                              </button>
                              <button title="Send SMS"
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-green-500 bg-green-50 hover:bg-green-100 transition-all">
                                <Phone size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} className="px-4 pb-3">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden">
                                  <div className="pt-2 flex flex-wrap gap-2">
                                    {c.products.map(p => (
                                      <span key={p} className="px-2.5 py-1 rounded-lg text-xs font-semibold border"
                                        style={{ background: `${G}08`, color: G, borderColor: `${G}25` }}>
                                        {p}
                                      </span>
                                    ))}
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: email template + chart */}
        <div className="space-y-5">
          {/* Recovery email preview */}
          <SectionCard title="Recovery Email Template">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs space-y-2">
              <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Subject</p>
              <p className="font-semibold text-gray-700">Hey {"{{customer_name}}"}, you forgot something! 🛒</p>
              <div className="border-t border-gray-200 pt-2 space-y-1.5 text-gray-600 leading-relaxed">
                <p>Hi <TemplateVar>{"{{customer_name}}"}</TemplateVar>,</p>
                <p>You left <TemplateVar>{"{{item_count}}"}</TemplateVar> item(s) worth <TemplateVar>{"{{cart_value}}"}</TemplateVar> in your BharatBazar cart.</p>
                <p>Your cart is saved and waiting for you. Complete your purchase today!</p>
                <p className="font-bold" style={{ color: G }}>→ Use code <TemplateVar>{"{{coupon_code}}"}</TemplateVar> for 10% off</p>
                <p className="text-gray-400 text-[10px] pt-1">Valid for <TemplateVar>{"{{expiry_hours}}"}</TemplateVar> hours only.</p>
              </div>
            </div>
          </SectionCard>

          {/* 7-day bar chart */}
          <SectionCard title="7-Day Cart Trend">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={2}>
                <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="abandoned" fill="#ef444470" radius={[4, 4, 0, 0]} name="abandoned" />
                <Bar dataKey="recovered" fill={G} radius={[4, 4, 0, 0]} name="recovered" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 justify-center mt-1">
              <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className="w-3 h-2 rounded-sm inline-block bg-red-400/40" /> Abandoned
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className="w-3 h-2 rounded-sm inline-block" style={{ background: G }} /> Recovered
              </span>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function TemplateVar({ children }: { children: string }) {
  return (
    <span className="font-mono font-bold px-1 rounded" style={{ color: G, background: `${G}12` }}>
      {children}
    </span>
  );
}

export default AbandonedCartPage;
