import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, PlayCircle, FileText, Users,
  Phone, Mail, MessageCircle, ChevronDown, ChevronUp,
  Plus, X, Paperclip, Clock,
} from "lucide-react";
import { S, card, inp } from "./shared/constants";

/* ─── Data ───────────────────────────────────────────────────────────────── */
interface Ticket {
  id: string; subject: string; cat: string; priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Closed"; date: string;
}

const TICKETS: Ticket[] = [
  { id: "STK-142", subject: "Product listing not showing in search",  cat: "Technical", priority: "High",   status: "Open",        date: "Sep 4, 2026"  },
  { id: "STK-141", subject: "Payout not received for Aug 30",         cat: "Billing",   priority: "High",   status: "In Progress", date: "Sep 3, 2026"  },
  { id: "STK-140", subject: "How to set up bulk discount",            cat: "Query",     priority: "Low",    status: "Closed",      date: "Sep 2, 2026"  },
  { id: "STK-139", subject: "Product return reason mismatch",         cat: "Order",     priority: "Medium", status: "Open",        date: "Sep 1, 2026"  },
  { id: "STK-138", subject: "Store banner upload failing",            cat: "Technical", priority: "Medium", status: "In Progress", date: "Aug 31, 2026" },
  { id: "STK-137", subject: "Commission rate review request",         cat: "Billing",   priority: "Low",    status: "Closed",      date: "Aug 30, 2026" },
  { id: "STK-136", subject: "Customer complaint - wrong product",     cat: "Order",     priority: "High",   status: "Closed",      date: "Aug 28, 2026" },
  { id: "STK-135", subject: "WhatsApp notification not working",      cat: "Technical", priority: "Low",    status: "Closed",      date: "Aug 25, 2026" },
  { id: "STK-134", subject: "GST invoice format query",               cat: "Query",     priority: "Low",    status: "Closed",      date: "Aug 22, 2026" },
  { id: "STK-133", subject: "Store verified badge missing",           cat: "Technical", priority: "Medium", status: "Closed",      date: "Aug 20, 2026" },
];

const FAQS = [
  {
    q: "How do I list my first product?",
    a: "Go to Products → Add New Product. Fill in the product name, description, price, stock quantity and upload at least 3 images. Choose the correct category and subcategory. Submit for review — it will be approved within 4 business hours.",
  },
  {
    q: "When do I receive payouts?",
    a: "Payouts are processed every Wednesday and Saturday for orders delivered up to 7 days prior. Funds are credited to your registered bank account within 1-2 business days after processing.",
  },
  {
    q: "How is my commission calculated?",
    a: "Commission is calculated as a percentage of the final selling price (including taxes). Your current rate is 8%. It decreases as your GMV grows — 7% after ₹2Cr, 6% after ₹5Cr. You can track your current tier in the Earnings section.",
  },
  {
    q: "What happens when a customer returns a product?",
    a: "When a return is approved, the refund is deducted from your next payout. You'll receive the returned item within 5-7 days. If the return is due to a platform error, no deduction is made. Check the Returns tab under Orders for full details.",
  },
  {
    q: "How do I get the 'Verified Seller' badge?",
    a: "Complete your GST registration, upload a valid business PAN card, maintain an order fulfilment rate above 95%, and have 20+ delivered orders with a rating above 4.0. Our team reviews eligibility every month.",
  },
  {
    q: "Can I offer my own discounts and coupons?",
    a: "Yes! Go to Marketing → Coupons → Create Coupon. You can set percentage or flat discounts, minimum order values, usage limits and validity. You can also participate in platform-wide sale events from the Promotions section.",
  },
];

/* ─── Status / Priority styles ────────────────────────────────────────────── */
const statusStyle: Record<string, { color: string; bg: string }> = {
  "Open":        { color: S,        bg: S + "18"                       },
  "In Progress": { color: "#3b82f6", bg: "rgba(59,130,246,0.12)"       },
  "Closed":      { color: "#6b7280", bg: "rgba(107,114,128,0.10)"      },
};
const priorityStyle: Record<string, { color: string }> = {
  Low:    { color: "#6b7280" },
  Medium: { color: "#f59e0b" },
  High:   { color: "#ef4444" },
};

/* ─── Quick help card ────────────────────────────────────────────────────── */
function HelpCard({
  label, icon: Icon, color,
}: { label: string; icon: React.ComponentType<{ size?: number; color?: string }>; color: string }) {
  return (
    <button className={`${card} p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow w-full`}>
      <div className="rounded-xl p-3" style={{ background: color + "18" }}>
        <Icon size={22} color={color} />
      </div>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
    </button>
  );
}

/* ─── New ticket modal ────────────────────────────────────────────────────── */
function NewTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    subject: "", category: "Technical", priority: "Medium", description: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }}
            onClick={(e) => e.stopPropagation()}
            className={`${card} w-full max-w-lg p-6`}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">New Support Ticket</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject</label>
                <input
                  className={inp}
                  placeholder="Briefly describe your issue"
                  value={form.subject}
                  onChange={(e) => set("subject", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
                  <select className={inp} value={form.category} onChange={(e) => set("category", e.target.value)}>
                    {["Technical", "Billing", "Order", "Query", "Feature Request"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Priority</label>
                  <select className={inp} value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                    {["Low", "Medium", "High"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea
                  className={`${inp} resize-none`}
                  rows={4}
                  placeholder="Describe the issue in detail. Include order IDs or relevant information."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>

              <button className="flex items-center gap-2 text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors w-full justify-center">
                <Paperclip size={13} />
                Attach Screenshot (optional)
              </button>

              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: S }}
                  onClick={onClose}
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── FAQ item ───────────────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span className="text-sm font-medium text-gray-800 pr-4">{q}</span>
        {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-gray-600 pb-4 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export function SellerSupportPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
            <p className="text-sm text-gray-500 mt-0.5">Get help, track tickets and browse seller resources</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 hover:opacity-90 transition-opacity"
            style={{ background: S }}
          >
            <Plus size={15} />
            New Ticket
          </button>
        </div>

        {/* Quick help */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <HelpCard label="Seller Guide"      icon={BookOpen}    color={S}         />
          <HelpCard label="Video Tutorials"   icon={PlayCircle}  color="#3b82f6"   />
          <HelpCard label="Policy Center"     icon={FileText}    color="#f59e0b"   />
          <HelpCard label="Seller Community"  icon={Users}       color="#10b981"   />
        </div>

        {/* Tickets table */}
        <div className={`${card} p-5`}>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">My Tickets</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[580px]">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  {["Ticket ID", "Subject", "Category", "Priority", "Status", "Date"].map((h) => (
                    <th key={h} className="pb-2.5 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TICKETS.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-500">{t.id}</td>
                    <td className="py-2.5 pr-4 text-gray-700 max-w-[220px]">
                      <span className="block truncate">{t.subject}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-500 text-xs">{t.cat}</td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs font-semibold" style={{ color: priorityStyle[t.priority].color }}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ color: statusStyle[t.status].color, background: statusStyle[t.status].bg }}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-400 text-xs whitespace-nowrap">{t.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className={`${card} p-6`}>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Frequently Asked Questions</h3>
          <p className="text-xs text-gray-400 mb-4">Seller-specific help articles</p>
          {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>

        {/* Contact card */}
        <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
          <h3 className="font-semibold text-white mb-4">Contact Seller Support</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="flex items-start gap-3">
              <Phone size={16} className="mt-0.5 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Phone (Toll Free)</p>
                <p className="text-sm font-semibold text-white">+91-1800-XXX-XXXX</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={16} className="mt-0.5 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-semibold text-white">seller-support@bharatbazar.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="mt-0.5 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Response Time</p>
                <p className="text-sm font-semibold text-white">Usually within 2 hours for High priority</p>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors">
            <MessageCircle size={15} />
            Start Live Chat
          </button>
        </div>
      </div>

      <NewTicketModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
