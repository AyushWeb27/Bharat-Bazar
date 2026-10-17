import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BrainCircuit, TrendingUp, TrendingDown, IndianRupee,
  ShoppingCart, Users, Package, Star, Lightbulb,
  RefreshCw, Download, AlertTriangle, CheckCircle2, Sparkles,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PageHeader, StatCard, SectionCard } from "./shared/ui";
import { G } from "./shared/constants";

const REVENUE_7D = [
  { day: "Mon", revenue: 48.2, orders: 320 },
  { day: "Tue", revenue: 52.7, orders: 344 },
  { day: "Wed", revenue: 61.4, orders: 390 },
  { day: "Thu", revenue: 55.1, orders: 362 },
  { day: "Fri", revenue: 78.9, orders: 480 },
  { day: "Sat", revenue: 91.3, orders: 562 },
  { day: "Sun", revenue: 84.6, orders: 521 },
];

const CAT_PERFORMANCE = [
  { name: "Groceries",    revenue: 142, orders: 1840, growth: 18.4 },
  { name: "Electronics",  revenue: 98,  orders: 420,  growth: 12.1 },
  { name: "Fashion",      revenue: 76,  orders: 890,  growth: -4.2 },
  { name: "Home & Kitch", revenue: 61,  orders: 540,  growth: 22.7 },
  { name: "Health",       revenue: 44,  orders: 680,  growth: 31.2 },
  { name: "Beauty",       revenue: 38,  orders: 420,  growth: 9.8  },
];

const DEMAND_FORECAST = [
  { week: "Wk1",  actual: 84.6, forecast: 88.2 },
  { week: "Wk2",  actual: 91.3, forecast: 94.7 },
  { week: "Wk3",  actual: null, forecast: 102.4 },
  { week: "Wk4",  actual: null, forecast: 108.9 },
];

const CUSTOMER_SEGMENTS = [
  { name: "New",      value: 28, color: "#6366f1" },
  { name: "Returning",value: 45, color: G         },
  { name: "VIP",      value: 15, color: "#f59e0b" },
  { name: "At-risk",  value: 12, color: "#ef4444" },
];

type Insight = {
  type: "positive" | "warning" | "tip" | "prediction";
  title: string;
  body: string;
  metric?: string;
  icon: React.ElementType;
};

const AI_INSIGHTS: Insight[] = [
  { type: "positive",   title: "Weekend Revenue Surge",       icon: TrendingUp,    metric: "+18.4%",  body: "Saturday and Sunday orders are up 18.4% week-over-week. Maintain promotional intensity across those days for maximum impact." },
  { type: "positive",   title: "Health Category Breakout",    icon: Star,          metric: "+31.2%",  body: "Health & Wellness is your fastest-growing category this month. Stocking up on immunity boosters, supplements and yoga accessories is recommended." },
  { type: "warning",    title: "Fashion Category Declining",  icon: TrendingDown,  metric: "-4.2%",   body: "Fashion revenue is down 4.2% over 7 days. Consider refreshing product imagery, offering a flash sale on slow-moving SKUs, or enabling curated outfit bundles." },
  { type: "tip",        title: "Loyalty Conversion Window",   icon: Lightbulb,     metric: "12%",     body: "12% of your customers are classified as 'at-risk' (no purchase in 30+ days). A personalised Win-Back coupon campaign historically converts ~22% back." },
  { type: "prediction", title: "Demand Forecast: Wk3",       icon: BrainCircuit,  metric: "₹102.4L", body: "Based on trend patterns and seasonal indices, Week 3 revenue is forecast at ₹102.4 Lakhs — a potential 12% increase if current growth holds." },
  { type: "positive",   title: "Home & Kitchen Momentum",     icon: CheckCircle2,  metric: "+22.7%",  body: "Home & Kitchen is experiencing strong growth likely driven by the festive restocking cycle. Prioritise stock replenishment for cookware and storage items." },
  { type: "tip",        title: "Cart Abandonment is High",    icon: AlertTriangle, metric: "68%",     body: "Estimated cart abandonment rate is 68%. Enabling an automated cart-recovery email sequence within 1 hour of abandonment can recover 15–20% of lost revenue." },
  { type: "warning",    title: "Evening Peak Underserved",    icon: ShoppingCart,  metric: "6–8 pm",  body: "Sales data shows a consistent spike between 6–8 pm but delivery SLA breaches are highest in this window. Consider optimising delivery boy schedules." },
];

const TYPE_META = {
  positive:   { color: G,        bg: "#e8fff6", label: "Positive"  },
  warning:    { color: "#f59e0b",bg: "#fffbeb", label: "Warning"   },
  tip:        { color: "#6366f1",bg: "#eef2ff", label: "Tip"       },
  prediction: { color: "#8b5cf6",bg: "#f5f3ff", label: "Forecast"  },
};

const THINKING_STEPS = [
  "Analysing order trends across 7 days…",
  "Scanning category performance data…",
  "Modelling customer segmentation…",
  "Running demand forecast algorithm…",
  "Generating actionable recommendations…",
  "Compiling AI insight report…",
];

export function AIInsightReportPage() {
  const [loading, setLoading]     = useState(true);
  const [stepIdx, setStepIdx]     = useState(0);
  const [filterType, setFilterType] = useState<"all" | Insight["type"]>("all");
  const [expanded, setExpanded]   = useState<number | null>(null);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setStepIdx(i => {
        if (i >= THINKING_STEPS.length - 1) { clearInterval(interval); setTimeout(() => setLoading(false), 600); return i; }
        return i + 1;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  const refresh = () => { setLoading(true); setStepIdx(0); };

  const filteredInsights = filterType === "all" ? AI_INSIGHTS : AI_INSIGHTS.filter(i => i.type === filterType);

  const totalRevenue = REVENUE_7D.reduce((s, d) => s + d.revenue, 0);
  const totalOrders  = REVENUE_7D.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Orders / AI Insight Report" title="AI Insight Report"
        subtitle="Machine-learning powered analytics and actionable business recommendations">
        <button onClick={refresh}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>
          Regenerate
        </button>
      </PageHeader>

      {/* AI Thinking Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl border border-gray-200 bg-white p-8 flex flex-col items-center gap-4">
            {/* Animated brain */}
            <div className="relative">
              <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.6, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${G}20` }}>
                <BrainCircuit size={32} style={{ color: G }}/>
              </motion.div>
              {[0,1,2].map(i => (
                <motion.div key={i} className="absolute w-2 h-2 rounded-full" style={{ background: G, top: "50%", left: "50%" }}
                  animate={{ x: [0, (i-1)*28], y: [0, -24], opacity: [0, 1, 0], scale: [0.5, 1, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.4 }}/>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm font-black text-gray-800 mb-1">AI is analysing your data</p>
              <AnimatePresence mode="wait">
                <motion.p key={stepIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="text-xs text-gray-400">{THINKING_STEPS[stepIdx]}</motion.p>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: G }}
                animate={{ width: `${((stepIdx + 1) / THINKING_STEPS.length) * 100}%` }}
                transition={{ duration: 0.4 }}/>
            </div>
            <p className="text-[10px] text-gray-400">{stepIdx + 1} / {THINKING_STEPS.length} steps</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content — visible after loading */}
      {!loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="7-Day Revenue"   val={`₹${totalRevenue.toFixed(0)}L`} color={G}         icon={IndianRupee} />
            <StatCard label="Total Orders"    val={totalOrders.toLocaleString()}    color="#3b82f6"   icon={ShoppingCart} />
            <StatCard label="Avg Order Value" val={`₹${((totalRevenue*100000)/totalOrders).toFixed(0)}`} color="#8b5cf6" icon={Package}/>
            <StatCard label="AI Insights"     val={AI_INSIGHTS.length}             color="#ec4899"   icon={Sparkles}    />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Revenue trend */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-black text-gray-900">Revenue Trend</p>
                  <p className="text-xs text-gray-400 mt-0.5">Last 7 days · ₹ Lakhs</p>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-xl" style={{ background: `${G}15`, color: G }}>
                  <TrendingUp size={11}/> AI confirmed uptrend
                </span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={REVENUE_7D} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ai-rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={G} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={G} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                  <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 11 }}/>
                  <Area type="monotone" dataKey="revenue" stroke={G} strokeWidth={2.5} fill="url(#ai-rev)" dot={false} activeDot={{ r: 4, fill: G }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Customer segments */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-sm font-black text-gray-900 mb-0.5">Customer Segments</p>
              <p className="text-xs text-gray-400 mb-3">AI-classified</p>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={CUSTOMER_SEGMENTS} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {CUSTOMER_SEGMENTS.map((seg, i) => <Cell key={`cell-${i}`} fill={seg.color}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-1">
                {CUSTOMER_SEGMENTS.map((seg, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }}/><span className="text-[11px] text-gray-500">{seg.name}</span></div>
                    <span className="text-[11px] font-black text-gray-800">{seg.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category performance + forecast */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-sm font-black text-gray-900 mb-0.5">Category Performance</p>
              <p className="text-xs text-gray-400 mb-3">Revenue (₹L) · 7 days</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={CAT_PERFORMANCE} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false}/>
                  <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 8 }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} width={72}/>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }}/>
                  <Bar dataKey="revenue" fill={G} radius={[0, 6, 6, 0]} opacity={0.85}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-black text-gray-900">Demand Forecast</p>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "#8b5cf620", color: "#8b5cf6" }}>AI</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Actual vs projected weekly revenue</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={DEMAND_FORECAST} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ai-forecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="ai-actual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={G} stopOpacity={0.18}/>
                      <stop offset="95%" stopColor={G} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                  <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }}/>
                  <Area type="monotone" dataKey="actual"   stroke={G}         strokeWidth={2.5} fill="url(#ai-actual)"   dot={{ r: 4, fill: G,         strokeWidth: 0 }} connectNulls={false}/>
                  <Area type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2}   fill="url(#ai-forecast)" dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }} strokeDasharray="5 3"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} style={{ color: G }}/>
                <p className="text-sm font-black text-gray-900">AI Recommendations</p>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: G }}>{AI_INSIGHTS.length}</span>
              </div>
              <div className="flex gap-1.5">
                {(["all","positive","warning","tip","prediction"] as const).map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all"
                    style={filterType === t ? { background: G, color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }}>
                    {t === "all" ? "All" : TYPE_META[t].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filteredInsights.map((insight, i) => {
                const m   = TYPE_META[insight.type];
                const Icon = insight.icon;
                const open = expanded === i;
                return (
                  <motion.div key={i} layout
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => setExpanded(open ? null : i)}>
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: m.bg }}>
                        <Icon size={16} style={{ color: m.color }}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-black text-gray-900">{insight.title}</p>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md capitalize" style={{ color: m.color, background: m.bg }}>{m.label}</span>
                        </div>
                        {!open && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{insight.body}</p>}
                      </div>
                      {insight.metric && (
                        <span className="text-sm font-black shrink-0" style={{ color: m.color }}>{insight.metric}</span>
                      )}
                    </div>
                    <AnimatePresence>
                      {open && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                          className="overflow-hidden">
                          <div className="px-4 pb-4 pt-0">
                            <div className="pl-12">
                              <p className="text-xs text-gray-600 leading-relaxed">{insight.body}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Export */}
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
              <Download size={14}/> Export Full Report
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default AIInsightReportPage;
