import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, BookOpen, PlayCircle, Code2, GitBranch,
  ChevronDown, Mail, Phone, MessageCircle, Plus, Ticket,
} from "lucide-react";
import { G, inp, card } from "./shared/constants";
import { PageHeader, Modal, Field } from "./shared/ui";

/* ─── Data ─────────────────────────────────────────────── */
const TICKETS = [
  { id: "TKT-001", subject: "Payment gateway not working",  cat: "Technical",       priority: "High",   status: "Open",        created: "2h ago"  },
  { id: "TKT-002", subject: "Invoice generation issue",     cat: "Technical",       priority: "Medium", status: "In Progress", created: "5h ago"  },
  { id: "TKT-003", subject: "Refund not processed",         cat: "Billing",         priority: "High",   status: "Open",        created: "1d ago"  },
  { id: "TKT-004", subject: "Bulk import feature request",  cat: "Feature Request", priority: "Low",    status: "Closed",      created: "2d ago"  },
  { id: "TKT-005", subject: "SMS notification delay",       cat: "Technical",       priority: "Medium", status: "In Progress", created: "2d ago"  },
  { id: "TKT-006", subject: "Export report format",         cat: "Feature Request", priority: "Low",    status: "Open",        created: "3d ago"  },
  { id: "TKT-007", subject: "User permission bug",          cat: "Technical",       priority: "High",   status: "Open",        created: "3d ago"  },
  { id: "TKT-008", subject: "Monthly billing query",        cat: "Billing",         priority: "Medium", status: "Closed",      created: "4d ago"  },
  { id: "TKT-009", subject: "Delivery zone overlap",        cat: "Technical",       priority: "Low",    status: "Closed",      created: "5d ago"  },
  { id: "TKT-010", subject: "Dark mode toggle request",     cat: "Feature Request", priority: "Low",    status: "Open",        created: "6d ago"  },
  { id: "TKT-011", subject: "Analytics export error",       cat: "Technical",       priority: "Medium", status: "In Progress", created: "1w ago"  },
  { id: "TKT-012", subject: "Coupon code validation",       cat: "Technical",       priority: "High",   status: "Closed",      created: "1w ago"  },
];

const FAQS = [
  {
    q: "How do I add a new product with variants?",
    a: "Navigate to Products → Add New Product. Fill in the basic details, then use the Variants section to add size, color, or other attributes. Each variant can have its own price, stock, and SKU.",
  },
  {
    q: "How do I process a refund for a returned order?",
    a: "Go to Orders → Return section. Find the return request, click Approve, then select Refund. The amount will be credited back to the customer's original payment method within 5-7 business days.",
  },
  {
    q: "Can I bulk upload products via CSV?",
    a: "Yes! Go to Products → All Products and click the Import button. Download the CSV template, fill in your product data, and upload. The system validates each row and shows errors before committing.",
  },
  {
    q: "How do I set up delivery zones?",
    a: "Navigate to Delivery → Manage Location. Click Add Zone, draw the zone on the map or enter pincodes manually. Set the delivery charge and free delivery threshold for each zone.",
  },
  {
    q: "How do I create a discount coupon?",
    a: "Go to Operations → Coupons → Add Coupon. Choose flat or percentage discount, set the minimum order value, usage limit per user, and expiry date. You can also restrict it to specific categories or products.",
  },
  {
    q: "What does the AI Insight Report show?",
    a: "The AI Insight Report analyzes your sales data and generates actionable recommendations including demand forecasting, customer segment analysis, revenue trends, and product performance predictions.",
  },
  {
    q: "How do I manage admin user roles?",
    a: "Go to Settings → Manage Roles. Create custom roles with specific permissions (view, edit, delete) for each module. Then assign roles to admin users in Settings → System Users.",
  },
  {
    q: "How do I send a push notification to customers?",
    a: "Go to Miscellaneous → Notification → Add Notification. Write your message, choose the target audience (all customers, specific segment, or by location), schedule or send immediately.",
  },
];

const QUICK_LINKS = [
  { label: "Documentation",   desc: "Complete API and feature docs",  Icon: BookOpen,  color: "#3b82f6" },
  { label: "Video Tutorials", desc: "Step-by-step video guides",       Icon: PlayCircle, color: "#8b5cf6" },
  { label: "API Reference",   desc: "REST API endpoints and SDKs",     Icon: Code2,     color: "#f59e0b" },
  { label: "Release Notes",   desc: "Latest updates and changelogs",   Icon: GitBranch, color: G         },
];

/* ─── Status / Priority helpers ─────────────────────────── */
const statusColor: Record<string, string> = {
  "Open":        "#ef4444",
  "In Progress": "#f59e0b",
  "Closed":      G,
};
const priorityColor: Record<string, string> = {
  High:   "#ef4444",
  Medium: "#f59e0b",
  Low:    "#6b7280",
};

function StatusBadge({ status }: { status: string }) {
  const color = statusColor[status] ?? "#6b7280";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: `${color}18`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = priorityColor[priority] ?? "#6b7280";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: `${color}15`, color }}
    >
      {priority}
    </span>
  );
}

/* ─── New Ticket Modal ───────────────────────────────────── */
function NewTicketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [subject, setSubject]     = useState("");
  const [category, setCategory]   = useState("Technical");
  const [priority, setPriority]   = useState("Medium");
  const [description, setDesc]    = useState("");

  function handleSubmit() {
    setSubject(""); setCategory("Technical"); setPriority("Medium"); setDesc("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New Support Ticket">
      <Field label="Subject">
        <input
          className={inp}
          placeholder="Briefly describe your issue"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
      </Field>
      <Field label="Category">
        <select className={inp} value={category} onChange={e => setCategory(e.target.value)}>
          {["Technical", "Billing", "Feature Request", "Other"].map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Priority">
        <select className={inp} value={priority} onChange={e => setPriority(e.target.value)}>
          {["Low", "Medium", "High"].map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </Field>
      <Field label="Description">
        <textarea
          className={`${inp} h-28 resize-none`}
          placeholder="Provide detailed information about the issue…"
          value={description}
          onChange={e => setDesc(e.target.value)}
        />
      </Field>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all"
          style={{ background: G }}
        >
          Submit Ticket
        </button>
      </div>
    </Modal>
  );
}

/* ─── FAQ Item ───────────────────────────────────────────── */
function FaqItem({ item, index, open, onToggle }: {
  item: { q: string; a: string };
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-all"
      >
        <span className="text-sm font-bold text-gray-800 pr-4">{item.q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-gray-400"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export function HelpPage() {
  const [search, setSearch]       = useState("");
  const [ticketModal, setTicketModal] = useState(false);
  const [openFaq, setOpenFaq]     = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="Help"
        title="Help Center"
        subtitle="Documentation, guides and support"
      />

      {/* Search */}
      <motion.div
        className={`${card} p-4`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documentation, guides, FAQs…"
            className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white"
          />
        </div>
      </motion.div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {QUICK_LINKS.map((link, i) => (
          <motion.div
            key={link.label}
            className={`${card} p-5 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${link.color}15`, color: link.color }}
            >
              <link.Icon size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">{link.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{link.desc}</p>
            </div>
            <button
              className="mt-auto text-xs font-bold transition-colors"
              style={{ color: link.color }}
            >
              Open →
            </button>
          </motion.div>
        ))}
      </div>

      {/* Support Tickets */}
      <motion.div
        className={card}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ background: "#fafafa" }}>
          <div className="flex items-center gap-2">
            <Ticket size={14} className="text-gray-400" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Recent Support Tickets</span>
          </div>
          <button
            onClick={() => setTicketModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all hover:shadow-md"
            style={{ background: G }}
          >
            <Plus size={13} /> New Ticket
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {["Ticket ID", "Subject", "Category", "Priority", "Status", "Created"].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TICKETS.map((t, i) => (
                <motion.tr
                  key={t.id}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.38 + i * 0.03 }}
                >
                  <td className="px-4 py-3 font-bold text-gray-500 whitespace-nowrap">{t.id}</td>
                  <td className="px-4 py-3 text-gray-800 font-semibold max-w-[200px] truncate">{t.subject}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{t.cat}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{t.created}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* FAQ Accordion */}
      <motion.div
        className={card}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="px-5 py-4 border-b border-gray-100" style={{ background: "#fafafa" }}>
          <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Frequently Asked Questions</span>
        </div>
        <div className="p-5 space-y-2">
          {FAQS.map((faq, i) => (
            <FaqItem
              key={i}
              item={faq}
              index={i}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ background: "#111" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div>
          <p className="text-base font-black text-white">Need more help?</p>
          <p className="text-xs text-gray-400 mt-1">Our support team is available Mon–Sat, 9 AM – 7 PM IST</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a
              href="mailto:support@bharatbazar.in"
              className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <Mail size={14} style={{ color: G }} />
              support@bharatbazar.in
            </a>
            <a
              href="tel:+911800123456"
              className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <Phone size={14} style={{ color: G }} />
              1800-123-4567 (Toll Free)
            </a>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white shrink-0 transition-all hover:opacity-90"
          style={{ background: G }}
        >
          <MessageCircle size={15} />
          Open Chat
        </button>
      </motion.div>

      {/* New Ticket Modal */}
      <NewTicketModal open={ticketModal} onClose={() => setTicketModal(false)} />
    </div>
  );
}
