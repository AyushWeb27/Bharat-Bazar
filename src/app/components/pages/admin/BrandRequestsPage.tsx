import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  ClipboardList, Clock, CheckCircle2, XCircle,
  Eye, Check, Ban, Globe,
} from "lucide-react";
import type { BrandRequest } from "./shared/types";
import { INIT_BRAND_REQUESTS } from "./shared/data";
import { G, reqStatusMeta, getBrandCatColor, inp, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, Modal, Field } from "./shared/ui";

export function BrandRequestsPage() {
  const [requests, setRequests ] = useState<BrandRequest[]>(INIT_BRAND_REQUESTS);
  const [tab,      setTab      ] = useState<"all"|"pending"|"approved"|"rejected">("all");
  const [search,   setSearch   ] = useState("");
  const [viewItem, setViewItem ] = useState<BrandRequest | null>(null);
  const [note,     setNote     ] = useState("");

  const filtered = useMemo(() => requests.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || r.brandName.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q);
    const matchT = tab === "all" || r.status === tab;
    return matchQ && matchT;
  }), [requests, search, tab]);

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r=>r.status==="pending").length,
    approved: requests.filter(r=>r.status==="approved").length,
    rejected: requests.filter(r=>r.status==="rejected").length,
  };

  function quickDecide(id: number, status: "approved"|"rejected") {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }
  function handleDecision(id: number, decision: "approved"|"rejected") {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: decision, note } : r));
    setViewItem(null);
    setNote("");
  }

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Brands › Brand Requests" title="Brand Requests" subtitle="Review brand registration applications from sellers" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Requests" val={counts.all}      color="#6366f1" icon={ClipboardList}/>
        <StatCard label="Pending Review" val={counts.pending}  color="#f59e0b" icon={Clock}        />
        <StatCard label="Approved"       val={counts.approved} color={G}       icon={CheckCircle2} />
        <StatCard label="Rejected"       val={counts.rejected} color="#ef4444" icon={XCircle}      />
      </div>

      <div className={card}>
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search brand or owner…" />
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
            {(["all","pending","approved","rejected"] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all"
                style={tab===t?{background:G,color:"#fff"}:{color:"#6b7280"}}>
                {t}
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${tab===t?"bg-white/25 text-white":"bg-gray-200 text-gray-500"}`}>{counts[t]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-gray-100">
              {["#","Brand","Owner / Company","Category","Website","Country","Date","Status","Actions"].map(h=>(
                <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r,i)=>{
                const sm = reqStatusMeta[r.status];
                return(
                  <motion.tr key={r.id} layout initial={{opacity:0}} animate={{opacity:1}} className="group hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">{i+1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{background:G}}>{r.ownerInit}</div>
                        <span className="text-xs font-bold text-gray-800 whitespace-nowrap">{r.brandName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-500 whitespace-nowrap">{r.owner}</span></td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{background:`${getBrandCatColor(r.category)}15`,color:getBrandCatColor(r.category)}}>
                        {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline whitespace-nowrap" href={`https://${r.website}`} target="_blank" rel="noreferrer">
                        <Globe size={10}/> {r.website}
                      </a>
                    </td>
                    <td className="px-4 py-3"><span className="text-[11px] text-gray-400 whitespace-nowrap">{r.country}</span></td>
                    <td className="px-4 py-3"><span className="text-[10px] text-gray-400 whitespace-nowrap">{r.date}</span></td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap" style={{color:sm.color,background:sm.bg}}>
                        {sm.icon} {sm.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={()=>{setViewItem(r);setNote(r.note);}} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all" title="View"><Eye size={13}/></button>
                        {r.status==="pending" && <>
                          <button onClick={()=>quickDecide(r.id,"approved")} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-50 transition-all" style={{color:G}} title="Approve"><Check size={13}/></button>
                          <button onClick={()=>quickDecide(r.id,"rejected")} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all" title="Reject"><Ban size={13}/></button>
                        </>}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length===0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">No brand requests found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">Showing {filtered.length} of {requests.length} requests</p>
        </div>
      </div>

      {/* View / Decision Modal */}
      <Modal open={!!viewItem} onClose={()=>setViewItem(null)} title="Brand Request Details" wide>
        {viewItem && (
          <div className="space-y-4">
            {/* Brand preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100" style={{background:`${G}08`}}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-md" style={{background:G}}>{viewItem.ownerInit}</div>
              <div>
                <p className="text-base font-black text-gray-900">{viewItem.brandName}</p>
                <p className="text-xs text-gray-500">{viewItem.owner}</p>
                <a href={`https://${viewItem.website}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline mt-0.5">
                  <Globe size={10}/> {viewItem.website}
                </a>
              </div>
            </div>
            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 text-xs">
              {[
                ["Category",  viewItem.category],
                ["Country",   viewItem.country ],
                ["Submitted", viewItem.date    ],
                ["Status",    viewItem.status  ],
              ].map(([k,v])=>(
                <div key={k}><p className="text-gray-400 font-semibold mb-0.5">{k}</p><p className="font-bold text-gray-800 capitalize">{v}</p></div>
              ))}
            </div>
            {viewItem.note && (
              <div className="p-3 rounded-xl border border-gray-200 bg-amber-50 text-xs text-amber-700 font-medium">
                <span className="font-black">Note: </span>{viewItem.note}
              </div>
            )}
            <Field label="Add Note / Reason">
              <textarea value={note} onChange={e=>setNote(e.target.value)}
                placeholder="Optional note to applicant…" rows={3} className={`${inp} resize-none`}/>
            </Field>
            {viewItem.status==="pending" && (
              <div className="flex gap-3">
                <button onClick={()=>handleDecision(viewItem.id,"rejected")} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2 transition-all"><Ban size={14}/> Reject</button>
                <button onClick={()=>handleDecision(viewItem.id,"approved")} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all" style={{background:G}}><Check size={14}/> Approve</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default BrandRequestsPage;
