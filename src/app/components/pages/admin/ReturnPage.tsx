import { useState } from "react";
import { motion } from "motion/react";
import { RotateCcw, CheckCircle2, XCircle, IndianRupee, Clock, Eye, X, Package } from "lucide-react";
import { Modal, PageHeader, StatCard, SectionCard, SearchBar } from "./shared/ui";
import { G, fmt, inp } from "./shared/constants";

type ReturnStatus = "Requested" | "Approved" | "Rejected" | "Refunded" | "Replaced";

type ReturnItem = {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  qty: number;
  amount: number;
  reason: string;
  status: ReturnStatus;
  requestedOn: string;
  resolvedOn: string | null;
  refundMode: "original" | "wallet" | "replacement";
  image: string;
};

const STATUS_META: Record<ReturnStatus, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  Requested: { color: "#f59e0b", bg: "#fffbeb", icon: Clock,        label: "Requested"  },
  Approved:  { color: "#3b82f6", bg: "#eff6ff", icon: CheckCircle2, label: "Approved"   },
  Rejected:  { color: "#ef4444", bg: "#fef2f2", icon: XCircle,      label: "Rejected"   },
  Refunded:  { color: "#009966", bg: "#e8fff6", icon: IndianRupee,  label: "Refunded"   },
  Replaced:  { color: "#8b5cf6", bg: "#f5f3ff", icon: Package,      label: "Replaced"   },
};

const REASONS = [
  "Damaged / defective product",
  "Wrong item delivered",
  "Product not as described",
  "Size / quantity mismatch",
  "Better price available",
  "Changed my mind",
  "Late delivery",
];

const EMOJI_AVATARS = ["🧑","👩","👨","🧔","👩‍🦱","👨‍🦰","🧑‍🦳","👴","👵"];
const emojiFor = (name: string) => EMOJI_AVATARS[name.charCodeAt(0) % EMOJI_AVATARS.length];

const INIT_RETURNS: ReturnItem[] = [
  { id: "RET-1041", orderId: "BB-28990", customer: "Ankit Sharma",   product: "Mixer Grinder 750W",        qty: 1, amount: 2499, reason: "Damaged / defective product",    status: "Requested",  requestedOn: "5 Sep 2026", resolvedOn: null,          refundMode: "original"    },
  { id: "RET-1040", orderId: "BB-28876", customer: "Deepa Pillai",   product: "Samsung Galaxy Tab S8",     qty: 1, amount: 12499,reason: "Wrong item delivered",            status: "Approved",   requestedOn: "4 Sep 2026", resolvedOn: null,          refundMode: "original"    },
  { id: "RET-1039", orderId: "BB-28741", customer: "Ravi Shankar",   product: "Kurti Set",                 qty: 2, amount: 890,  reason: "Size / quantity mismatch",        status: "Refunded",   requestedOn: "3 Sep 2026", resolvedOn: "4 Sep 2026",  refundMode: "wallet"      },
  { id: "RET-1038", orderId: "BB-28512", customer: "Priya Singh",    product: "Prestige Cooker 5L",        qty: 1, amount: 4999, reason: "Product not as described",        status: "Rejected",   requestedOn: "2 Sep 2026", resolvedOn: "3 Sep 2026",  refundMode: "original"    },
  { id: "RET-1037", orderId: "BB-28300", customer: "Kavya Menon",    product: "OnePlus Earbuds Pro",       qty: 1, amount: 2499, reason: "Damaged / defective product",    status: "Replaced",   requestedOn: "1 Sep 2026", resolvedOn: "3 Sep 2026",  refundMode: "replacement" },
  { id: "RET-1036", orderId: "BB-28100", customer: "Vikash Gupta",   product: "Rajasthani Bedsheet",       qty: 1, amount: 699,  reason: "Product not as described",        status: "Refunded",   requestedOn: "30 Aug 2026",resolvedOn: "1 Sep 2026",  refundMode: "original"    },
  { id: "RET-1035", orderId: "BB-27980", customer: "Sneha Reddy",    product: "Basmati Rice 5kg",          qty: 3, amount: 960,  reason: "Wrong item delivered",            status: "Requested",  requestedOn: "5 Sep 2026", resolvedOn: null,          refundMode: "original"    },
  { id: "RET-1034", orderId: "BB-27850", customer: "Sunil Krishnan", product: "Assam Tea 500g",            qty: 2, amount: 340,  reason: "Changed my mind",                 status: "Rejected",   requestedOn: "29 Aug 2026",resolvedOn: "30 Aug 2026", refundMode: "original"    },
  { id: "RET-1033", orderId: "BB-27700", customer: "Meera Iyer",     product: "Knife Set",                 qty: 1, amount: 580,  reason: "Damaged / defective product",    status: "Approved",   requestedOn: "4 Sep 2026", resolvedOn: null,          refundMode: "replacement" },
  { id: "RET-1032", orderId: "BB-27500", customer: "Arjun Mehta",    product: "Honey 500g",                qty: 4, amount: 720,  reason: "Product not as described",        status: "Refunded",   requestedOn: "28 Aug 2026",resolvedOn: "30 Aug 2026", refundMode: "wallet"      },
];

export function ReturnPage() {
  const [items, setItems]   = useState(INIT_RETURNS);
  const [q, setQ]           = useState("");
  const [statusF, setStatusF] = useState<ReturnStatus | "All">("All");
  const [detail, setDetail] = useState<ReturnItem | null>(null);

  const ALL_STATUSES: ReturnStatus[] = ["Requested","Approved","Rejected","Refunded","Replaced"];

  const filtered = items.filter(r => {
    const qOk = !q || r.id.toLowerCase().includes(q.toLowerCase()) || r.customer.toLowerCase().includes(q.toLowerCase()) || r.product.toLowerCase().includes(q.toLowerCase());
    const sOk  = statusF === "All" || r.status === statusF;
    return qOk && sOk;
  });

  const counts   = ALL_STATUSES.reduce((acc, s) => ({ ...acc, [s]: items.filter(r => r.status === s).length }), {} as Record<ReturnStatus, number>);
  const refunded = items.filter(r => r.status === "Refunded").reduce((s, r) => s + r.amount, 0);
  const pending  = items.filter(r => r.status === "Requested" || r.status === "Approved").length;

  const updateStatus = (id: string, status: ReturnStatus) => {
    setItems(p => p.map(r => r.id === id ? { ...r, status, resolvedOn: ["Refunded","Rejected","Replaced"].includes(status) ? "5 Sep 2026" : r.resolvedOn } : r));
    if (detail?.id === id) setDetail(p => p ? { ...p, status } : p);
  };

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Orders / Return" title="Return Requests"
        subtitle="Manage product returns, refunds and replacements" count={items.length}/>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Returns"   val={items.length}                  color={G}        icon={RotateCcw}    />
        <StatCard label="Pending Action"  val={pending}                       color="#f59e0b"  icon={Clock}        />
        <StatCard label="Refunded"        val={`₹${(refunded/1000).toFixed(1)}k`} color="#009966" icon={IndianRupee}/>
        <StatCard label="Resolved"        val={items.filter(r => r.resolvedOn).length} color="#8b5cf6" icon={CheckCircle2}/>
      </div>

      {/* Reason breakdown */}
      <SectionCard>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Return Reasons</p>
        <div className="space-y-2">
          {REASONS.slice(0, 5).map(reason => {
            const cnt = items.filter(r => r.reason === reason).length;
            const pct = Math.round((cnt / items.length) * 100);
            return (
              <div key={reason} className="flex items-center gap-3">
                <p className="text-xs text-gray-600 w-48 shrink-0 truncate">{reason}</p>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: G }}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}/>
                </div>
                <span className="text-[10px] font-black text-gray-500 w-6 text-right">{cnt}</span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["All", ...ALL_STATUSES] as const).map(s => {
          const cnt = s === "All" ? items.length : counts[s];
          const m   = s !== "All" ? STATUS_META[s] : null;
          return (
            <button key={s} onClick={() => setStatusF(s)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              style={statusF === s
                ? { background: m ? m.color : G, color: "#fff" }
                : { background: m ? m.bg : "#f3f4f6", color: m ? m.color : "#6b7280" }}>
              {s} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Return cards grid */}
      <div className="flex items-center gap-2 mb-1">
        <SearchBar value={q} onChange={setQ} placeholder="Search by return ID, customer or product…"/>
        <span className="text-xs text-gray-400 whitespace-nowrap">{filtered.length} return{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(r => {
          const sm = STATUS_META[r.status];
          const SI = sm.icon;
          return (
            <motion.div key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-all group">
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-gray-50 border border-gray-100 shrink-0">
                    {emojiFor(r.customer)}
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">{r.customer}</p>
                    <p className="text-[10px] text-gray-400">{r.id} · Order {r.orderId}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg shrink-0" style={{ color: sm.color, background: sm.bg }}>
                  <SI size={10}/> {sm.label}
                </span>
              </div>

              {/* Product info */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <Package size={14} className="text-gray-400"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{r.product}</p>
                  <p className="text-[10px] text-gray-400">Qty: {r.qty} · {fmt(r.amount)}</p>
                </div>
              </div>

              {/* Reason */}
              <p className="text-[10px] text-gray-500 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sm.color }}/>
                {r.reason}
              </p>

              {/* Dates + refund mode */}
              <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
                <span>Requested: {r.requestedOn}</span>
                {r.resolvedOn && <span>· Resolved: {r.resolvedOn}</span>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {r.status === "Requested" && (
                  <>
                    <button onClick={() => updateStatus(r.id, "Approved")}
                      className="flex-1 py-2 rounded-xl text-[11px] font-black text-white transition-all" style={{ background: G }}>
                      Approve
                    </button>
                    <button onClick={() => updateStatus(r.id, "Rejected")}
                      className="flex-1 py-2 rounded-xl text-[11px] font-black text-white bg-red-500 transition-all">
                      Reject
                    </button>
                  </>
                )}
                {r.status === "Approved" && (
                  <>
                    <button onClick={() => updateStatus(r.id, "Refunded")}
                      className="flex-1 py-2 rounded-xl text-[11px] font-black text-white transition-all" style={{ background: G }}>
                      Mark Refunded
                    </button>
                    <button onClick={() => updateStatus(r.id, "Replaced")}
                      className="flex-1 py-2 rounded-xl text-[11px] font-black border border-purple-200 text-purple-600 hover:bg-purple-50 transition-all">
                      Mark Replaced
                    </button>
                  </>
                )}
                {["Rejected","Refunded","Replaced"].includes(r.status) && (
                  <span className="flex-1 text-center text-[10px] text-gray-400">Resolved</span>
                )}
                <button onClick={() => setDetail(r)} className="w-8 h-8 rounded-xl flex items-center justify-center border border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-all">
                  <Eye size={13}/>
                </button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-2 py-16 flex flex-col items-center justify-center gap-2 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
            <RotateCcw size={28}/>
            <p className="text-sm font-bold">No return requests match your filters</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal open={detail !== null} onClose={() => setDetail(null)} title={`Return Details · ${detail?.id}`}>
        {detail && (
          <div className="space-y-4">
            {/* Status + update */}
            <div className="flex items-center gap-3">
              {(() => { const sm = STATUS_META[detail.status]; const SI = sm.icon; return (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl" style={{ color: sm.color, background: sm.bg }}>
                  <SI size={12}/> {sm.label}
                </span>
              ); })()}
              <select value={detail.status} onChange={e => updateStatus(detail.id, e.target.value as ReturnStatus)} className={`${inp} flex-1`}>
                {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Customer</p>
                <p className="font-bold text-gray-800">{detail.customer}</p>
                <p className="text-gray-400">{detail.orderId}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Refund</p>
                <p className="font-black text-gray-800" style={{ color: G }}>{fmt(detail.amount)}</p>
                <p className="text-gray-400 capitalize">{detail.refundMode === "original" ? "To original method" : detail.refundMode === "wallet" ? "To wallet" : "Replacement"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Product</p>
              <p className="text-sm font-bold text-gray-800">{detail.product}</p>
              <p className="text-xs text-gray-400 mt-0.5">Qty: {detail.qty}</p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Return Reason</p>
              <p className="text-sm text-gray-700">{detail.reason}</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {detail.status === "Requested" && <>
                <button onClick={() => { updateStatus(detail.id, "Approved"); setDetail(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white" style={{ background: G }}>Approve Return</button>
                <button onClick={() => { updateStatus(detail.id, "Rejected"); setDetail(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-red-500">Reject</button>
              </>}
              {detail.status === "Approved" && <>
                <button onClick={() => { updateStatus(detail.id, "Refunded"); setDetail(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white" style={{ background: G }}>Mark Refunded</button>
                <button onClick={() => { updateStatus(detail.id, "Replaced"); setDetail(null); }} className="flex-1 py-2.5 rounded-xl text-sm font-black border border-purple-200 text-purple-600">Mark Replaced</button>
              </>}
              {["Rejected","Refunded","Replaced"].includes(detail.status) && (
                <button onClick={() => setDetail(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600">Close</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ReturnPage;
