import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BellRing, Plus, Send, Clock, FileText,
  Users, Trash2, Eye, Megaphone,
} from "lucide-react";
import { Modal, DeleteConfirm, Field, PageHeader, SectionCard } from "./shared/ui";
import { G, inp } from "./shared/constants";

type NotifStatus = "sent" | "scheduled" | "draft";
type Notif = {
  id: number;
  title: string;
  message: string;
  target: string;
  sent: string;
  reads: number;
  total: number;
  status: NotifStatus;
};

const STATUS_META: Record<NotifStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  sent:      { label: "Sent",      color: G,         bg: "#e8fff6", Icon: Send     },
  scheduled: { label: "Scheduled", color: "#f59e0b", bg: "#fffbeb", Icon: Clock    },
  draft:     { label: "Draft",     color: "#9ca3af", bg: "#f9fafb", Icon: FileText },
};

const TARGETS = ["All Users","Buyers","Sellers","Premium Users","Active Users","Wishlist Users","New Users"];

const INIT_NOTIFS: Notif[] = [
  { id: 1, title: "Diwali Sale is LIVE! 🪔",          message: "Get up to 50% off on electronics and fashion. Limited time only — shop now before stock runs out!",   target: "All Users",      sent: "5 Sep 2026",  reads: 82450, total: 100000, status: "sent"      },
  { id: 2, title: "Your order has been shipped 📦",   message: "Order #BB84921 is packed and out for delivery. Expected by tomorrow. Tap to track your order live.",   target: "Buyers",         sent: "5 Sep 2026",  reads: 3241,  total: 4100,   status: "sent"      },
  { id: 3, title: "Flash Deal: 2 hours only ⚡",      message: "iPhone 15 at ₹67,999 — that's ₹12,000 off! Hurry, only 37 units left at this price.",               target: "Premium Users",  sent: "4 Sep 2026",  reads: 14200, total: 18500,  status: "sent"      },
  { id: 4, title: "Back in stock: Nike Air Max 🏃",  message: "The product you wishlisted is available again. Only 12 left — grab it before it sells out!",           target: "Wishlist Users", sent: "4 Sep 2026",  reads: 892,   total: 1240,   status: "sent"      },
  { id: 5, title: "New arrivals this week ✨",        message: "Check out 200+ new products added across Fashion, Electronics, Books and Home Decor categories.",       target: "All Users",      sent: "7 Sep 2026",  reads: 0,     total: 0,      status: "scheduled" },
  { id: 6, title: "Refer & Earn ₹200 💸",            message: "Invite friends to BharatBazar and earn ₹200 credit on their first purchase. No limit on referrals!",   target: "Active Users",   sent: "–",           reads: 0,     total: 0,      status: "draft"     },
  { id: 7, title: "Weekend sale: Extra 10% off",     message: "Use code WEEKEND10 at checkout for an extra 10% off on all orders above ₹999. Valid Sat & Sun only.",  target: "All Users",      sent: "6 Sep 2026",  reads: 0,     total: 0,      status: "scheduled" },
];

const BLANK: Omit<Notif,"id"> = { title:"", message:"", target:"All Users", sent:"–", reads:0, total:0, status:"draft" };

export function NotificationPage() {
  const [rows, setRows]       = useState(INIT_NOTIFS);
  const [tab, setTab]         = useState<NotifStatus | "all">("all");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<Notif | null>(null);
  const [delId, setDelId]     = useState<number | null>(null);
  const [form, setForm]       = useState(BLANK);
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = tab === "all" ? rows : rows.filter(r => r.status === tab);

  const openAdd  = () => { setForm(BLANK); setEditing(null); setModal(true); };
  const openEdit = (r: Notif) => {
    setForm({ title:r.title, message:r.message, target:r.target, sent:r.sent, reads:r.reads, total:r.total, status:r.status });
    setEditing(r); setModal(true);
  };
  const save = () => {
    if (!form.title.trim() || !form.message.trim()) return;
    if (editing) {
      setRows(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r));
    } else {
      setRows(p => [...p, { id: Date.now(), ...form }]);
    }
    setModal(false);
  };
  const confirmDelete = (id: number) => { setRows(p => p.filter(r => r.id !== id)); setDelId(null); };
  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const sentRows  = rows.filter(r => r.status === "sent");
  const totalSent = sentRows.reduce((s, r) => s + r.total, 0);
  const totalRead = sentRows.reduce((s, r) => s + r.reads, 0);
  const overallReadRate = totalSent > 0 ? ((totalRead / totalSent) * 100).toFixed(1) : "0";

  const TABS: { key: NotifStatus | "all"; label: string; count: number }[] = [
    { key: "all",       label: "All",       count: rows.length },
    { key: "sent",      label: "Sent",      count: rows.filter(r=>r.status==="sent").length      },
    { key: "scheduled", label: "Scheduled", count: rows.filter(r=>r.status==="scheduled").length },
    { key: "draft",     label: "Draft",     count: rows.filter(r=>r.status==="draft").length     },
  ];

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Miscellaneous / Notification" title="Notifications"
        subtitle="Push notifications — send, schedule and track read rates" count={rows.length}>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
          <Plus size={15}/> New Notification
        </button>
      </PageHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sent",    val: rows.filter(r=>r.status==="sent").length.toString(),      color: G,         Icon: Send     },
          { label: "Avg Read Rate", val: `${overallReadRate}%`,                                    color: "#6366f1", Icon: Eye      },
          { label: "Scheduled",     val: rows.filter(r=>r.status==="scheduled").length.toString(), color: "#f59e0b", Icon: Clock    },
          { label: "Drafts",        val: rows.filter(r=>r.status==="draft").length.toString(),     color: "#9ca3af", Icon: FileText },
        ].map((s, i) => {
          const Icon = s.Icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}15` }}>
                <Icon size={15} style={{ color: s.color }}/>
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 leading-none">{s.val}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <SectionCard>
        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-gray-100 -mx-5 md:-mx-6 px-5 md:px-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap"
              style={tab === t.key
                ? { borderBottomColor: G, color: G }
                : { borderBottomColor: "transparent", color: "#9ca3af" }}>
              {t.label}
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black"
                style={tab === t.key ? { background: `${G}15`, color: G } : { background: "#f3f4f6", color: "#9ca3af" }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notification Cards */}
        <div className="space-y-3">
          {filtered.map(r => {
            const sm = STATUS_META[r.status];
            const readPct = r.total > 0 ? (r.reads / r.total) * 100 : 0;
            const isOpen = expanded === r.id;
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-all group">
                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${sm.color}15` }}>
                      <BellRing size={16} style={{ color: sm.color }}/>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 leading-tight">{r.title}</p>
                          <p className={`text-xs text-gray-500 mt-1 leading-relaxed ${isOpen ? "" : "line-clamp-1"}`}>
                            {r.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                            style={{ color: sm.color, background: sm.bg }}>
                            <sm.Icon size={9}/> {sm.label}
                          </span>
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Users size={9}/> {r.target}
                        </span>
                        {r.status === "sent" && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Clock size={9}/> {r.sent}
                          </span>
                        )}
                        {r.status === "scheduled" && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                            <Clock size={9}/> Scheduled: {r.sent}
                          </span>
                        )}
                      </div>

                      {/* Read rate bar (sent only) */}
                      {r.status === "sent" && r.total > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                              <Eye size={9}/> Read rate
                            </span>
                            <span className="text-[10px] font-black" style={{ color: readPct >= 70 ? G : readPct >= 40 ? "#f59e0b" : "#ef4444" }}>
                              {readPct.toFixed(1)}% &nbsp;·&nbsp; {r.reads.toLocaleString("en-IN")} / {r.total.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <motion.div className="h-full rounded-full"
                              initial={{ width: 0 }} animate={{ width: `${readPct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              style={{ background: readPct >= 70 ? G : readPct >= 40 ? "#f59e0b" : "#ef4444" }}/>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions footer */}
                <div className="flex items-center gap-1 px-4 py-2.5 bg-gray-50 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setExpanded(isOpen ? null : r.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 hover:text-gray-700 hover:bg-white transition-all">
                    <Eye size={10}/> {isOpen ? "Collapse" : "Preview"}
                  </button>
                  <button onClick={() => openEdit(r)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-blue-500 hover:bg-blue-50 transition-all">
                    Edit
                  </button>
                  {r.status === "draft" && (
                    <button onClick={() => setRows(p => p.map(n => n.id === r.id ? { ...n, status: "scheduled" as NotifStatus } : n))}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all"
                      style={{ background: G }}>
                      <Send size={9}/> Schedule
                    </button>
                  )}
                  <button onClick={() => setDelId(r.id)}
                    className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-50 transition-all">
                    <Trash2 size={10}/> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-14 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${G}15` }}>
                <BellRing size={20} style={{ color: G }}/>
              </div>
              <p className="text-sm font-bold text-gray-400">No notifications in this category</p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Create / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Notification" : "New Notification"}>
        <div className="space-y-3">
          <Field label="Title">
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. Flash Sale starts now! ⚡" className={inp}/>
          </Field>
          <Field label="Message">
            <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={3}
              placeholder="Write the notification body text here…"
              className={`${inp} resize-none`}/>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Target Audience">
              <select value={form.target} onChange={e => set("target", e.target.value)} className={inp}>
                {TARGETS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value as NotifStatus)} className={inp}>
                <option value="draft">Save as Draft</option>
                <option value="scheduled">Schedule</option>
                <option value="sent">Send Now</option>
              </select>
            </Field>
          </div>
          {form.status === "scheduled" && (
            <Field label="Schedule Date">
              <input type="text" value={form.sent} onChange={e => set("sent", e.target.value)}
                placeholder="e.g. 7 Sep 2026, 10:00 am" className={inp}/>
            </Field>
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all" style={{ background: G }}>
              <Send size={13}/>
              {form.status === "sent" ? "Send Now" : form.status === "scheduled" ? "Schedule" : "Save Draft"}
            </button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm
        open={delId !== null} onClose={() => setDelId(null)} onConfirm={() => confirmDelete(delId!)}
        title="Delete Notification" message={`Delete "${rows.find(r => r.id === delId)?.title}"? This cannot be undone.`}
      />
    </div>
  );
}

export default NotificationPage;
