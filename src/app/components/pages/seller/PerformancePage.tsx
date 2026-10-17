import { useState } from "react";
import { motion } from "motion/react";
import {
  TrendingUp, Star, Package, Clock, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, BarChart2, Zap,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Constants ────────────────────────────────────────────────────────────────
const G   = "#009966";
const GD  = "#007a52";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";

// ── Data ─────────────────────────────────────────────────────────────────────
const TREND_DATA = [
  { month: "May", score: 81 },
  { month: "Jun", score: 83 },
  { month: "Jul", score: 79 },
  { month: "Aug", score: 85 },
  { month: "Sep", score: 86 },
  { month: "Oct", score: 87 },
];

const SUB_SCORES = [
  { label: "Order Fulfilment Rate", value: 96, color: G,        threshold: 90 },
  { label: "Cancellation Rate",     value: 2.1, color: G,       threshold: 5,   reverse: true, suffix: "%" },
  { label: "Return Rate",           value: 4.8, color: "#f59e0b", threshold: 3,  reverse: true, suffix: "%" },
  { label: "Response Time (24h)",   value: 94, color: G,        threshold: 85,  suffix: "%" },
];

const METRIC_CARDS = [
  { label: "On-time Dispatch",  value: "94%",    icon: Package, color: G          },
  { label: "Avg Rating",        value: "4.6 ★",  icon: Star,    color: "#f59e0b"  },
  { label: "Negative Reviews",  value: "3%",     icon: AlertTriangle, color: "#ef4444" },
  { label: "Active Listings",   value: "87",     icon: BarChart2, color: "#3b82f6" },
];

const TIPS = [
  {
    title: "Reduce Return Rate",
    detail: "Your return rate is 4.8%, above the 3% threshold. Improve product descriptions and packaging quality to reduce returns.",
    icon: AlertTriangle,
    color: "#f59e0b",
  },
  {
    title: "Reply to Reviews Faster",
    detail: "Responding to negative reviews within 24 hours improves your seller score. You have 3 unanswered reviews.",
    icon: Star,
    color: "#ef4444",
  },
  {
    title: "Keep Dispatch Time Under 24 Hrs",
    detail: "94% on-time dispatch is great! Maintaining this above 95% will boost you to Platinum tier.",
    icon: Zap,
    color: G,
  },
  {
    title: "Add More Product Images",
    detail: "Listings with 5+ images have 40% fewer returns. 23 of your products have fewer than 3 images.",
    icon: CheckCircle2,
    color: "#3b82f6",
  },
];

// ── Circular Progress Ring ────────────────────────────────────────────────────
function CircularScore({ score }: { score: number }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg width="160" height="160" className="rotate-[-90deg]">
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="12"
          />
          <motion.circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={G}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-900">{score}</span>
          <span className="text-xs font-semibold text-gray-400">/100</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-bold" style={{ color: G }}>Good Performance</p>
    </div>
  );
}

// ── Mini progress bar ─────────────────────────────────────────────────────────
function MiniBar({
  label, value, color, threshold, reverse, suffix,
}: {
  label: string; value: number; color: string;
  threshold?: number; reverse?: boolean; suffix?: string;
}) {
  const pct = Math.min(value, 100);
  const isOk = reverse ? value <= (threshold ?? 100) : value >= (threshold ?? 0);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold" style={{ color: isOk ? G : "#f59e0b" }}>
          {value}{suffix ?? "%"}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: isOk ? G : "#f59e0b" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Tips accordion ────────────────────────────────────────────────────────────
function TipsAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Improvement Tips</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {TIPS.map((tip, i) => {
          const Icon = tip.icon;
          const isOpen = open === i;
          return (
            <div key={tip.title}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: tip.color + "18" }}
                >
                  <Icon size={15} style={{ color: tip.color }} />
                </div>
                <span className="flex-1 text-sm font-semibold text-gray-800">{tip.title}</span>
                {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </button>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-xs text-gray-500 leading-relaxed">{tip.detail}</p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Risk meter ────────────────────────────────────────────────────────────────
function RiskMeter() {
  // Low = ~15% on the meter
  const risk = 15;
  const riskLabel = "Low";

  return (
    <div className={`${card} p-5`}>
      <h3 className="text-sm font-bold text-gray-900 mb-4">Penalty / Suspension Risk</h3>
      <div className="relative h-4 rounded-full overflow-hidden mb-3"
        style={{ background: "linear-gradient(to right, #bbf7d0, #fef9c3, #fecaca)" }}
      >
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md bg-white"
          style={{ left: `calc(${risk}% - 10px)` }}
          initial={{ left: 0 }}
          animate={{ left: `calc(${risk}% - 10px)` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 font-medium mb-3">
        <span>Low</span><span>Medium</span><span>High</span>
      </div>
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
        style={{ background: `${G}18`, color: G }}
      >
        <span className="w-2 h-2 rounded-full" style={{ background: G }} />
        Risk Level: {riskLabel}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        You are in the safe zone. Keep fulfilment and cancellation rates in check.
      </p>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function PerformancePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={22} style={{ color: G }} /> Performance
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor your seller health score and key metrics
          </p>
        </div>

        {/* Score + sub-scores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${card} p-6 flex flex-col items-center justify-center`}
          >
            <CircularScore score={87} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${card} p-5 space-y-4 lg:col-span-2`}
          >
            <h3 className="text-sm font-bold text-gray-900">Score Breakdown</h3>
            {SUB_SCORES.map((s) => (
              <MiniBar
                key={s.label}
                label={s.label}
                value={s.value}
                color={s.color}
                threshold={s.threshold}
                reverse={s.reverse}
                suffix={s.suffix}
              />
            ))}
          </motion.div>
        </div>

        {/* Tier badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: "linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)", border: "1.5px solid #fde68a" }}
        >
          <div className="text-4xl">🥇</div>
          <div className="flex-1">
            <h3 className="text-base font-black text-amber-900">Gold Seller</h3>
            <p className="text-xs text-amber-700 mt-0.5">You have achieved Gold tier status. Great work!</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                "Priority listing placement",
                "Dedicated seller support",
                "Lower commission: 8%",
                "Early access to sales events",
              ].map((b) => (
                <span key={b} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-amber-600 font-medium">Next tier</p>
            <p className="text-sm font-black text-amber-900">Platinum 💎</p>
            <p className="text-[10px] text-amber-600">Score ≥ 92</p>
          </div>
        </motion.div>

        {/* Key metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {METRIC_CARDS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`${card} p-4 flex items-start gap-3`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: m.color + "18" }}
                >
                  <Icon size={16} style={{ color: m.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5 leading-tight">{m.label}</p>
                  <p className="text-lg font-black text-gray-900">{m.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trend chart */}
        <div className={`${card} p-5`}>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Performance Score — Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={TREND_DATA} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                domain={[70, 100]}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false} tickLine={false} width={32}
              />
              <Tooltip
                formatter={(v: number) => [v + "/100", "Score"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13 }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={G}
                strokeWidth={2.5}
                dot={{ fill: G, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: GD }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tips + risk meter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TipsAccordion />
          <RiskMeter />
        </div>

      </div>
    </div>
  );
}
