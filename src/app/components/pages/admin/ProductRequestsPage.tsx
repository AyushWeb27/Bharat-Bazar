import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  ClipboardList, Clock, CheckCircle2, XCircle,
  Eye, Check, Ban,
} from "lucide-react";
import type { ProdRequest } from "./shared/types";
import { INIT_REQUESTS } from "./shared/data";
import { G, fmt, reqStatusMeta, inp, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, Modal, Field } from "./shared/ui";

export function ProductRequestsPage() {
  const [requests, setRequests ] = useState<ProdRequest[]>(INIT_REQUESTS);
  const [tab,      setTab      ] = useState<"all"|"pending"|"approved"|"rejected">("all");
  const [search,   setSearch   ] = useState("");
  const [viewItem, setViewItem ] = useState<ProdRequest | null>(null);
  const [note,     setNote     ] = useState("");

  const filtered = useMemo(() => requests.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || r.product.toLowerCase().includes(q) || r.vendor.toLowerCase().includes(q);
    const matchT = tab === "all" || r.status === tab;
    return matchQ && matchT;
  }), [requests, search, tab]);

  function approve(id: number) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
  }
  function reject(id: number) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
  }
  function handleDecision(id: number, decision: "approved"|"rejected") {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: decision, note } : r));
    setViewItem(null);
    setNote("");
  }

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Products › Product Requests" title="Product Requests" subtitle="Review and approve vendor product submissions" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Requests" val={counts.all}      color="#6366f1" icon={ClipboardList} />
        <StatCard label="Pending Review" val={counts.pending}  color="#f59e0b" icon={Clock}         />
        <StatCard label="Approved"       val={counts.approved} color={G}       icon={CheckCircle2}  />
        <StatCard label="Rejected"       val={counts.rejected} color="#ef4444" icon={XCircle}       />
      </div>

      <div className={card}>
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search products or vendors…" />
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
            {(["all","pending","approved","rejected"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all"
                style={tab === t ? { background: G, color: "#fff" } : { color: "#6b7280" }}>
                {t}
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${tab === t ? "bg-white/25 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {counts[t]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["#","Product","Vendor","Category","Price","Date","Status","Actions"].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r, i) => {
                const sm = reqStatusMeta[r.status];
                return (
                  <motion.tr key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="group hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-gray-800 max-w-[180px] truncate">{r.product}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black text-white shrink-0" style={{ background: G }}>
                          {r.vendorInit}
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap hidden sm:block">{r.vendor}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 whitespace-nowrap">{r.cat}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-gray-900 whitespace-nowrap">{fmt(r.price)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{r.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap"
                        style={{ color: sm.color, background: sm.bg }}>
                        {sm.icon} {sm.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setViewItem(r); setNote(r.note); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all" title="View details">
                          <Eye size={13} />
                        </button>
                        {r.status === "pending" && (
                          <>
                            <button onClick={() => approve(r.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-green-50 transition-all" title="Approve"
                              style={{ color: G }}>
                              <Check size={13} />
                            </button>
                            <button onClick={() => reject(r.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all" title="Reject">
                              <Ban size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">Showing {filtered.length} of {requests.length} requests</p>
        </div>
      </div>

      {/* View / Decide Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Product Request Details" wide>
        {viewItem && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  ["Product",  viewItem.product ],
                  ["Vendor",   viewItem.vendor  ],
                  ["Category", viewItem.cat     ],
                  ["Price",    fmt(viewItem.price)],
                  ["Submitted",viewItem.date    ],
                  ["Status",   viewItem.status  ],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-gray-400 font-semibold mb-0.5">{k}</p>
                    <p className="font-bold text-gray-800 capitalize">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <Field label="Note / Reason">
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Optional note to vendor (reason for rejection, clarification, etc.)"
                rows={3} className={`${inp} resize-none`} />
            </Field>
            {viewItem.status === "pending" && (
              <div className="flex gap-3">
                <button onClick={() => handleDecision(viewItem.id, "rejected")}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2 transition-all">
                  <Ban size={14} /> Reject
                </button>
                <button onClick={() => handleDecision(viewItem.id, "approved")}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: G }}>
                  <Check size={14} /> Approve
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ProductRequestsPage;
