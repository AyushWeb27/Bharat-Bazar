import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Plus, Edit2, Trash2, ChevronDown, Eye, TrendingUp } from "lucide-react";
import { Toggle, Modal, DeleteConfirm, Field, PageHeader, SearchBar, SectionCard } from "./shared/ui";
import { G, inp } from "./shared/constants";

type FAQ = {
  id: number;
  question: string;
  answer: string;
  category: string;
  published: boolean;
  views: number;
};

const CATEGORIES = ["Orders","Returns","Delivery","Payments","Account","Products","Seller"];

const CAT_META: Record<string, { color: string; bg: string }> = {
  Orders:   { color: "#3b82f6", bg: "#eff6ff"  },
  Returns:  { color: "#f59e0b", bg: "#fffbeb"  },
  Delivery: { color: "#10b981", bg: "#ecfdf5"  },
  Payments: { color: "#8b5cf6", bg: "#f5f3ff"  },
  Account:  { color: "#6366f1", bg: "#eef2ff"  },
  Products: { color: "#009966", bg: "#e8fff6"  },
  Seller:   { color: "#ec4899", bg: "#fdf2f8"  },
};

const INIT_FAQS: FAQ[] = [
  { id: 1,  question: "How do I track my order?",               answer: "Go to My Orders in your account and click on the order number. You will see a live tracking map with the estimated delivery time and courier details.",                                               category: "Orders",   published: true,  views: 12450 },
  { id: 2,  question: "What is the return policy?",              answer: "We offer a 7-day no-questions-asked return policy on most products. Items must be unused, unwashed and in original packaging with tags intact. Initiate a return from My Orders.",                  category: "Returns",  published: true,  views: 9870  },
  { id: 3,  question: "How long does delivery take?",            answer: "Standard delivery takes 3–5 business days. Express delivery (1–2 days) is available in Mumbai, Delhi, Bengaluru, Hyderabad and Pune. Delivery estimates are shown on product pages.",               category: "Delivery", published: true,  views: 8320  },
  { id: 4,  question: "Can I cancel my order?",                  answer: "Orders can be cancelled within 24 hours of placing them, provided they haven't been shipped. Go to My Orders, select the order, and tap Cancel Order. A full refund is issued within 3–5 days.",    category: "Orders",   published: true,  views: 7640  },
  { id: 5,  question: "How do I apply a coupon code?",           answer: "Add items to your cart and proceed to checkout. On the payment page you will find an 'Apply Coupon' field. Enter your code and click Apply to see the discount reflected in your total.",           category: "Payments", published: true,  views: 6210  },
  { id: 6,  question: "Is Cash on Delivery (COD) available?",   answer: "COD is available for orders up to ₹10,000 in most PIN codes across India. COD availability is automatically shown at checkout based on your delivery address.",                                     category: "Payments", published: true,  views: 5890  },
  { id: 7,  question: "How do I change my delivery address?",    answer: "You can change your delivery address before the order is shipped. Go to My Orders, tap the order, and select Change Address. Once the order is dispatched, the address cannot be modified.",        category: "Delivery", published: true,  views: 4230  },
  { id: 8,  question: "What payment methods are accepted?",      answer: "We accept UPI (GPay, PhonePe, Paytm, BHIM), credit and debit cards (Visa, Mastercard, RuPay), Net Banking, wallets (Paytm, Amazon Pay), EMI options, and Cash on Delivery.",                     category: "Payments", published: true,  views: 3980  },
  { id: 9,  question: "How do I create a seller account?",       answer: "Visit our Sell on BharatBazar page, click Register as Seller and fill in your business details including GSTIN, bank account and KYC documents. Approval typically takes 24–48 hours.",             category: "Seller",   published: true,  views: 2140  },
  { id: 10, question: "Are my payments secure on BharatBazar?",  answer: "Yes. All transactions are processed through RazorPay with 256-bit SSL encryption. We are PCI-DSS Level 1 certified. We never store your card details on our servers.",                             category: "Payments", published: false, views: 0     },
];

const BLANK: Omit<FAQ,"id"> = { question:"", answer:"", category:"Orders", published:true, views:0 };

export function FAQPage() {
  const [rows, setRows]         = useState(INIT_FAQS);
  const [q, setQ]               = useState("");
  const [catF, setCatF]         = useState("All");
  const [pubF, setPubF]         = useState("All");
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState<FAQ | null>(null);
  const [delId, setDelId]       = useState<number | null>(null);
  const [form, setForm]         = useState(BLANK);
  const [openId, setOpenId]     = useState<number | null>(null);

  const filtered = rows.filter(r => {
    const qOk = !q || r.question.toLowerCase().includes(q.toLowerCase()) || r.answer.toLowerCase().includes(q.toLowerCase());
    const cOk = catF === "All" || r.category === catF;
    const pOk = pubF === "All" || (pubF === "Published" ? r.published : !r.published);
    return qOk && cOk && pOk;
  });

  const openAdd = () => { setForm(BLANK); setEditing(null); setModal(true); };
  const openEdit = (r: FAQ) => {
    setForm({ question:r.question, answer:r.answer, category:r.category, published:r.published, views:r.views });
    setEditing(r); setModal(true);
  };
  const save = () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    if (editing) {
      setRows(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r));
    } else {
      setRows(p => [...p, { id: Date.now(), ...form }]);
    }
    setModal(false);
  };
  const confirmDelete = (id: number) => { setRows(p => p.filter(r => r.id !== id)); setDelId(null); };
  const togglePub     = (id: number) => setRows(p => p.map(r => r.id === id ? { ...r, published: !r.published } : r));
  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const totalViews = rows.filter(r => r.published).reduce((s, r) => s + r.views, 0);

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Miscellaneous / FAQ" title="FAQ"
        subtitle="Frequently asked questions — manage, publish and organise" count={rows.length}>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
          <Plus size={15}/> Add FAQ
        </button>
      </PageHeader>

      {/* Category overview chips */}
      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map(cat => {
          const count = cat === "All" ? rows.length : rows.filter(r => r.category === cat).length;
          const meta  = cat === "All" ? { color: "#374151", bg: "#f3f4f6" } : CAT_META[cat] ?? { color: "#374151", bg: "#f3f4f6" };
          return (
            <button key={cat} onClick={() => setCatF(cat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all"
              style={catF === cat
                ? { color: meta.color, background: meta.bg, borderColor: meta.color }
                : { color: "#6b7280", background: "white", borderColor: "#e5e7eb" }}>
              {cat} <span className="text-[9px] font-black opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total FAQs",   val: rows.length,                               color: G,         Icon: BookOpen },
          { label: "Published",    val: rows.filter(r => r.published).length,      color: "#10b981", Icon: Eye      },
          { label: "Drafts",       val: rows.filter(r => !r.published).length,     color: "#f59e0b", Icon: BookOpen },
          { label: "Total Views",  val: totalViews.toLocaleString("en-IN"),        color: "#6366f1", Icon: TrendingUp},
        ].map((s, i) => {
          const Icon = s.Icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
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
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <SearchBar value={q} onChange={setQ} placeholder="Search questions or answers…" />
          <select value={pubF} onChange={e => setPubF(e.target.value)} className={`${inp} w-auto`}>
            {["All","Published","Draft"].map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="ml-auto self-center text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-2">
          {filtered.map((r, idx) => {
            const cm = CAT_META[r.category] ?? { color: "#374151", bg: "#f3f4f6" };
            const isOpen = openId === r.id;
            return (
              <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                className={`rounded-2xl border transition-all overflow-hidden ${isOpen ? "border-gray-300 shadow-sm" : "border-gray-200"}`}>
                {/* Question row */}
                <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/70 transition-colors group/q"
                  onClick={() => setOpenId(isOpen ? null : r.id)}>
                  {/* Number */}
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 border border-gray-100 bg-gray-50 text-gray-400">
                    {idx + 1}
                  </div>

                  {/* Question text */}
                  <p className="flex-1 text-sm font-bold text-gray-800 text-left leading-snug">{r.question}</p>

                  {/* Meta: category + views */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className="text-[9px] font-black px-2 py-1 rounded-lg hidden sm:inline"
                      style={{ color: cm.color, background: cm.bg }}>{r.category}</span>
                    {r.published && r.views > 0 && (
                      <span className="text-[9px] text-gray-400 hidden md:inline">{r.views.toLocaleString("en-IN")} views</span>
                    )}
                    <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${r.published ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                      {r.published ? "Live" : "Draft"}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}/>
                  </div>
                </button>

                {/* Answer panel */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }} className="overflow-hidden">
                      <div className="px-4 pb-4">
                        <div className="pl-10">
                          <p className="text-sm text-gray-600 leading-relaxed border-l-2 pl-4"
                            style={{ borderColor: cm.color }}>
                            {r.answer}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-4 flex-wrap">
                            <button onClick={() => openEdit(r)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all">
                              <Edit2 size={11}/> Edit
                            </button>
                            <button onClick={() => togglePub(r.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                              style={r.published
                                ? { color: "#f59e0b", background: "#fffbeb" }
                                : { color: G, background: `${G}15` }}>
                              {r.published ? "Unpublish" : "Publish"}
                            </button>
                            <button onClick={() => setDelId(r.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all">
                              <Trash2 size={11}/> Delete
                            </button>
                            <div className="ml-auto flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-400">{r.category}</span>
                              {r.views > 0 && <span className="text-[10px] text-gray-400">· {r.views.toLocaleString("en-IN")} views</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-14 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${G}15` }}>
                <BookOpen size={20} style={{ color: G }}/>
              </div>
              <p className="text-sm font-bold text-gray-400">No FAQs match your search</p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit FAQ" : "Add FAQ"}>
        <div className="space-y-3">
          <Field label="Question">
            <input value={form.question} onChange={e => set("question", e.target.value)}
              placeholder="e.g. How do I track my order?" className={inp}/>
          </Field>
          <Field label="Answer">
            <textarea value={form.answer} onChange={e => set("answer", e.target.value)} rows={5}
              placeholder="Write a clear, helpful answer…"
              className={`${inp} resize-none`}/>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select value={form.category} onChange={e => set("category", e.target.value)} className={inp}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.published ? "published" : "draft"} onChange={e => set("published", e.target.value === "published")} className={inp}>
                <option value="published">Published (Live)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </Field>
          </div>

          {/* Category preview */}
          {form.category && (() => { const cm = CAT_META[form.category]; return cm ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: cm.bg }}>
              <div className="w-2 h-2 rounded-full" style={{ background: cm.color }}/>
              <span className="text-xs font-bold" style={{ color: cm.color }}>{form.category}</span>
              <span className="text-xs text-gray-400">category selected</span>
            </div>
          ) : null; })()}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={save} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all" style={{ background: G }}>
              {editing ? "Save Changes" : "Add FAQ"}
            </button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm
        open={delId !== null} onClose={() => setDelId(null)} onConfirm={() => confirmDelete(delId!)}
        title="Delete FAQ" message={`Delete this FAQ question? It will be removed from the help centre.`}
      />
    </div>
  );
}

export default FAQPage;
