import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Megaphone, Users, MousePointerClick, IndianRupee,
  Edit2, Plus, Calendar,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Modal, Field, PageHeader, StatCard } from "./shared/ui";
import { G, fmt, card, inp } from "./shared/constants";

/* ─── types ───────────────────────────────────────────────────────────────── */

type CampaignStatus = "Active" | "Scheduled" | "Ended" | "Draft";
type CampaignType   = "Email" | "Push" | "SMS";

type Campaign = {
  id: number;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  reach: number;
  conv: number;
  revenue: number;
  start: string;
  end: string;
  progress: number;
  color: string;
};

/* ─── static data ─────────────────────────────────────────────────────────── */

const INIT_CAMPAIGNS: Campaign[] = [
  { id: 1, name: "Diwali Mega Sale",    type: "Email", status: "Active",    reach: 45200, conv: 1240, revenue: 892400,  start: "Oct 15",  end: "Nov 5",   progress: 68,  color: G           },
  { id: 2, name: "New User Welcome",    type: "Push",  status: "Active",    reach: 12800, conv: 980,  revenue: 234600,  start: "Ongoing", end: "Ongoing", progress: 100, color: "#3b82f6"   },
  { id: 3, name: "Cart Abandonment",    type: "SMS",   status: "Active",    reach: 8400,  conv: 420,  revenue: 186300,  start: "Ongoing", end: "Ongoing", progress: 100, color: "#8b5cf6"   },
  { id: 4, name: "Navratri Special",    type: "Email", status: "Scheduled", reach: 0,     conv: 0,    revenue: 0,       start: "Oct 2",   end: "Oct 10",  progress: 0,   color: "#f59e0b"   },
  { id: 5, name: "Flash Sale Friday",   type: "Push",  status: "Scheduled", reach: 0,     conv: 0,    revenue: 0,       start: "Oct 4",   end: "Oct 4",   progress: 0,   color: "#ec4899"   },
  { id: 6, name: "Loyalty Rewards Q3",  type: "Email", status: "Ended",     reach: 28600, conv: 600,  revenue: 528000,  start: "Jul 1",   end: "Sep 30",  progress: 100, color: "#6366f1"   },
  { id: 7, name: "Monsoon Clearance",   type: "SMS",   status: "Ended",     reach: 19200, conv: 340,  revenue: 213400,  start: "Jun 15",  end: "Aug 15",  progress: 100, color: "#0d9488"   },
  { id: 8, name: "Referral Program",    type: "Push",  status: "Draft",     reach: 0,     conv: 0,    revenue: 0,       start: "TBD",     end: "TBD",     progress: 0,   color: "#64748b"   },
];

/* 30-day performance data */
const PERF_DATA = Array.from({ length: 30 }, (_, i) => {
  const seed = (i * 37 + 13) % 100;
  return {
    day: `${i + 1}`,
    reach:       2000 + Math.round(seed * 60 + ((i % 7) * 200)),
    conversions: 50   + Math.round(seed * 1.5 + ((i % 5) * 8)),
  };
});

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const STATUS_META: Record<CampaignStatus, { color: string; bg: string }> = {
  Active:    { color: G,         bg: `${G}15`                  },
  Scheduled: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  Ended:     { color: "#6b7280", bg: "rgba(107,114,128,0.1)"  },
  Draft:     { color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
};

const TYPE_META: Record<CampaignType, { color: string; bg: string }> = {
  Email: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)"  },
  Push:  { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)"  },
  SMS:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
};

const BLANK_FORM = {
  name: "", type: "Email" as CampaignType, audience: "All Customers",
  message: "", startDate: "", endDate: "", goal: "",
};

/* ─── component ───────────────────────────────────────────────────────────── */

export function MarketingPage() {
  const [campaigns, setCampaigns] = useState(INIT_CAMPAIGNS);
  const [modal, setModal]         = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [form, setForm]           = useState(BLANK_FORM);

  const openNew = () => {
    setForm(BLANK_FORM);
    setEditTarget(null);
    setModal(true);
  };

  const openEdit = (c: Campaign) => {
    setForm({ name: c.name, type: c.type, audience: "All Customers", message: "", startDate: "", endDate: "", goal: "" });
    setEditTarget(c);
    setModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editTarget) {
      setCampaigns(prev => prev.map(c =>
        c.id === editTarget.id ? { ...c, name: form.name, type: form.type } : c
      ));
    } else {
      const newCampaign: Campaign = {
        id: Date.now(),
        name: form.name,
        type: form.type,
        status: "Draft",
        reach: 0, conv: 0, revenue: 0,
        start: form.startDate || "TBD",
        end:   form.endDate   || "TBD",
        progress: 0,
        color: "#64748b",
      };
      setCampaigns(prev => [newCampaign, ...prev]);
    }
    setModal(false);
  };

  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <PageHeader
        breadcrumb="Operations / Marketing"
        title="Marketing"
        subtitle="Campaigns, reach and engagement management"
        onAdd={openNew}
        addLabel="+ New Campaign"
      />

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <StatCard label="Active Campaigns"   val="7"                       color={G}         icon={Megaphone}          />
        <StatCard label="Total Reach"        val="1,24,800"                color="#3b82f6"   icon={Users}              />
        <div className={`${card} p-4 flex items-center gap-3`}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
            <MousePointerClick size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-lg font-black text-gray-900">3,240</p>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-green-100 text-green-600">+8.4%</span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold">Conversions</p>
          </div>
        </div>
        <StatCard label="Revenue Generated"  val={fmt(1842300)}            color="#f59e0b"   icon={IndianRupee}        />
      </motion.div>

      {/* Campaign cards grid */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <div className={`${card} overflow-hidden`}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Megaphone size={14} className="text-gray-400" />
              <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Campaigns</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-500">
                {campaigns.length}
              </span>
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white transition-all hover:opacity-90"
              style={{ background: G }}
            >
              <Plus size={12} /> New Campaign
            </button>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {campaigns.map((c, i) => {
                const sm = STATUS_META[c.status];
                const tm = TYPE_META[c.type];
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative rounded-xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* left color accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: c.color }} />

                    <div className="pl-5 pr-4 py-4 space-y-3">
                      {/* name + badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5">
                          <p className="text-sm font-black text-gray-900 leading-tight">{c.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-black"
                              style={{ background: tm.bg, color: tm.color }}
                            >
                              {c.type}
                            </span>
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                              style={{ background: sm.bg, color: sm.color }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.color }} />
                              {c.status}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => openEdit(c)}
                          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>

                      {/* metrics row */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Reach",       val: c.reach > 0   ? c.reach.toLocaleString("en-IN")   : "—" },
                          { label: "Conversions", val: c.conv > 0    ? c.conv.toLocaleString("en-IN")    : "—" },
                          { label: "Revenue",     val: c.revenue > 0 ? fmt(c.revenue)                   : "—" },
                        ].map(m => (
                          <div key={m.label} className="bg-gray-50 rounded-lg px-2.5 py-2">
                            <p className="text-[10px] text-gray-400 font-semibold">{m.label}</p>
                            <p className="text-xs font-black text-gray-800 mt-0.5">{m.val}</p>
                          </div>
                        ))}
                      </div>

                      {/* dates */}
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <Calendar size={10} />
                        <span>{c.start === c.end ? c.start : `${c.start} → ${c.end}`}</span>
                      </div>

                      {/* progress bar */}
                      {c.status !== "Draft" && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-400 font-semibold">Goal Progress</span>
                            <span className="font-black" style={{ color: c.color }}>{c.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${c.progress}%` }}
                              transition={{ duration: 0.8, delay: i * 0.05 }}
                              className="h-full rounded-full"
                              style={{ background: c.color }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Performance chart */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
        className={card}
      >
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
          <MousePointerClick size={14} className="text-gray-400" />
          <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Campaign Performance — Last 30 Days</span>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={PERF_DATA} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradReach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                yAxisId="reach"
                orientation="left"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="conv"
                orientation="right"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
                cursor={{ stroke: "#e5e7eb" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => v === "reach" ? "Reach" : "Conversions"} />
              <Area
                yAxisId="reach"
                type="monotone"
                dataKey="reach"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradReach)"
                dot={false}
                activeDot={{ r: 4, fill: "#3b82f6" }}
              />
              <Area
                yAxisId="conv"
                type="monotone"
                dataKey="conversions"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#gradConv)"
                dot={false}
                activeDot={{ r: 4, fill: "#8b5cf6" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* New / Edit Campaign Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editTarget ? "Edit Campaign" : "New Campaign"}
        wide
      >
        <div className="space-y-4">
          <Field label="Campaign Name">
            <input
              className={inp}
              placeholder="e.g. Diwali Mega Sale"
              value={form.name}
              onChange={e => f("name", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Campaign Type">
              <select
                className={inp}
                value={form.type}
                onChange={e => f("type", e.target.value as CampaignType)}
              >
                <option value="Email">Email</option>
                <option value="Push">Push Notification</option>
                <option value="SMS">SMS</option>
              </select>
            </Field>

            <Field label="Target Audience">
              <select
                className={inp}
                value={form.audience}
                onChange={e => f("audience", e.target.value)}
              >
                <option>All Customers</option>
                <option>Active Users</option>
                <option>VIP Members</option>
                <option>Inactive Users</option>
              </select>
            </Field>
          </div>

          <Field label="Subject / Message">
            <textarea
              className={`${inp} resize-none`}
              rows={3}
              placeholder="Write your campaign message…"
              value={form.message}
              onChange={e => f("message", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date">
              <input
                type="date"
                className={inp}
                value={form.startDate}
                onChange={e => f("startDate", e.target.value)}
              />
            </Field>
            <Field label="End Date">
              <input
                type="date"
                className={inp}
                value={form.endDate}
                onChange={e => f("endDate", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Goal" hint="Target conversions">
            <input
              type="number"
              className={inp}
              placeholder="e.g. 1000"
              value={form.goal}
              onChange={e => f("goal", e.target.value)}
            />
          </Field>

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.99]"
            style={{ background: G }}
          >
            {editTarget ? "Save Changes" : "Launch Campaign"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
