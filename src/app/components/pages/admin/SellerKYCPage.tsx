import React, { useState } from "react";
import { motion } from "motion/react";
import { UserCheck, CheckCircle2, XCircle, Clock, FileText, AlertTriangle } from "lucide-react";
import { Modal, Field, PageHeader, StatCard } from "./shared/ui";
import { G, inp, card } from "./shared/constants";

type KYCStatus = "Pending" | "Under Review" | "Approved" | "Rejected";

type KYCApp = {
  id: number;
  sellerName: string;
  businessName: string;
  submittedDate: string;
  gst: string;
  pan: string;
  docs: {
    aadhaar: boolean;
    pan: boolean;
    gstCert: boolean;
    bankStatement: boolean;
  };
  status: KYCStatus;
};

const statusMeta: Record<KYCStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  Pending:       { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: <Clock size={10} />         },
  "Under Review":{ color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: <FileText size={10} />      },
  Approved:      { color: G,         bg: `${G}15`,                  icon: <CheckCircle2 size={10} />  },
  Rejected:      { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: <XCircle size={10} />       },
};

const FILTER_TABS: ("All" | KYCStatus)[] = ["All", "Pending", "Under Review", "Approved", "Rejected"];

const APPS: KYCApp[] = [
  { id: 1, sellerName: "Rajesh Traders",    businessName: "Rajesh Garments Pvt Ltd",   submittedDate: "Oct 5, 2026", gst: "29ABCDE****Z1", pan: "ABCDE****F", docs: { aadhaar: true,  pan: true,  gstCert: true,  bankStatement: true  }, status: "Pending"       },
  { id: 2, sellerName: "Meena Electronics", businessName: "Meena Tech Solutions",      submittedDate: "Oct 4, 2026", gst: "07XYZAB****K2", pan: "XYZAB****G", docs: { aadhaar: true,  pan: true,  gstCert: true,  bankStatement: false }, status: "Under Review"  },
  { id: 3, sellerName: "Suresh Foods Co.",  businessName: "Suresh Agro Exports",       submittedDate: "Oct 3, 2026", gst: "27PQRST****M4", pan: "PQRST****H", docs: { aadhaar: true,  pan: true,  gstCert: false, bankStatement: false }, status: "Pending"       },
  { id: 4, sellerName: "Priya Fashion Hub", businessName: "Priya Designs LLP",         submittedDate: "Sep 30, 2026",gst: "06MNOPQ****N5", pan: "MNOPQ****J", docs: { aadhaar: true,  pan: true,  gstCert: true,  bankStatement: true  }, status: "Approved"      },
  { id: 5, sellerName: "Vikram Auto Parts", businessName: "Vikram Motors India",        submittedDate: "Sep 28, 2026",gst: "09FGHIJ****P3", pan: "FGHIJ****K", docs: { aadhaar: false, pan: true,  gstCert: false, bankStatement: false }, status: "Rejected"      },
  { id: 6, sellerName: "Deepa Home Decor",  businessName: "Deepa Creations Pvt Ltd",   submittedDate: "Sep 27, 2026",gst: "33KLMNO****Q7", pan: "KLMNO****L", docs: { aadhaar: true,  pan: true,  gstCert: true,  bankStatement: true  }, status: "Under Review"  },
];

const DOC_TYPES = ["GST Certificate", "Bank Statement", "Address Proof", "Trade License", "MSME Certificate"];

function DocRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      {ok
        ? <span className="flex items-center gap-1 text-xs font-bold text-green-600"><CheckCircle2 size={14} /> Submitted</span>
        : <span className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle size={14} /> Missing</span>
      }
    </div>
  );
}

export function SellerKYCPage() {
  const [filter, setFilter]         = useState<"All" | KYCStatus>("All");
  const [reviewing, setReviewing]   = useState<KYCApp | null>(null);
  const [decision, setDecision]     = useState<"approve" | "reject" | null>(null);
  const [reason, setReason]         = useState("");
  const [docRequest, setDocRequest] = useState<Record<string, boolean>>({});
  const [apps, setApps]             = useState(APPS);

  const filtered = filter === "All" ? apps : apps.filter(a => a.status === filter);

  const pending   = apps.filter(a => a.status === "Pending").length;
  const approved  = apps.filter(a => a.status === "Approved").length;
  const rejected  = apps.filter(a => a.status === "Rejected").length;

  const submitDecision = () => {
    if (!reviewing) return;
    const newStatus: KYCStatus = decision === "approve" ? "Approved" : "Rejected";
    setApps(p => p.map(a => a.id === reviewing.id ? { ...a, status: newStatus } : a));
    setReviewing(null);
    setDecision(null);
    setReason("");
  };

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Manage Seller / KYC" title="Seller KYC Verification"
        subtitle="Review and approve seller verification documents" count={apps.length} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Pending Review" val={pending}  color="#f59e0b" icon={Clock}       />
        <StatCard label="Approved"       val={approved} color={G}       icon={UserCheck}   />
        <StatCard label="Rejected"       val={rejected} color="#ef4444" icon={AlertTriangle} />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
        {FILTER_TABS.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
            style={filter === t ? { background: G, color: "#fff" } : { color: "#6b7280" }}>
            {t}
          </button>
        ))}
      </div>

      {/* KYC cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map(a => {
          const meta = statusMeta[a.status];
          const docsOk   = Object.values(a.docs).filter(Boolean).length;
          const docsTotal = Object.values(a.docs).length;
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`${card} p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="text-sm font-black text-gray-900">{a.sellerName}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ color: meta.color, background: meta.bg }}>
                      {meta.icon} {a.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{a.businessName}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Submitted: {a.submittedDate}</p>
                </div>
              </div>

              {/* Masked identifiers */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">GST</p>
                  <p className="text-xs font-mono font-bold text-gray-700">{a.gst}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">PAN</p>
                  <p className="text-xs font-mono font-bold text-gray-700">{a.pan}</p>
                </div>
              </div>

              {/* Document checklist */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {[
                  { label: "Aadhaar",       ok: a.docs.aadhaar       },
                  { label: "PAN",           ok: a.docs.pan           },
                  { label: "GST Cert",      ok: a.docs.gstCert       },
                  { label: "Bank Stmt",     ok: a.docs.bankStatement  },
                ].map(d => (
                  <span key={d.label} className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                    style={d.ok
                      ? { background: `${G}10`, color: G }
                      : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                    {d.ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {d.label}
                  </span>
                ))}
                <span className="ml-auto text-[10px] text-gray-400">{docsOk}/{docsTotal} docs</span>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button onClick={() => { setReviewing(a); setDecision(null); setReason(""); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
                  style={{ background: G }}>
                  <FileText size={12} /> Review
                </button>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-gray-400">No applications match this filter</div>
        )}
      </div>

      {/* Review Modal */}
      <Modal open={reviewing !== null} onClose={() => { setReviewing(null); setDecision(null); }} title={`Review: ${reviewing?.sellerName ?? ""}`} wide>
        {reviewing && (
          <div className="space-y-4">
            {/* Document list */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Submitted Documents</p>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <DocRow label="Aadhaar Card"    ok={reviewing.docs.aadhaar}      />
                <DocRow label="PAN Card"        ok={reviewing.docs.pan}          />
                <DocRow label="GST Certificate" ok={reviewing.docs.gstCert}      />
                <DocRow label="Bank Statement"  ok={reviewing.docs.bankStatement} />
              </div>
            </div>

            {/* Decision buttons */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Decision</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDecision("approve")}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all border-2"
                  style={decision === "approve"
                    ? { background: G, color: "#fff", borderColor: G }
                    : { background: `${G}08`, color: G, borderColor: `${G}30` }}>
                  <CheckCircle2 size={16} /> Approve
                </button>
                <button onClick={() => setDecision("reject")}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all border-2"
                  style={decision === "reject"
                    ? { background: "#ef4444", color: "#fff", borderColor: "#ef4444" }
                    : { background: "rgba(239,68,68,0.06)", color: "#ef4444", borderColor: "rgba(239,68,68,0.25)" }}>
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>

            {/* Rejection reason */}
            {decision === "reject" && (
              <div>
                <Field label="Rejection Reason" required>
                  <textarea value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Explain why this application is being rejected…"
                    rows={3} className={`${inp} resize-none`} />
                </Field>
              </div>
            )}

            {/* Request more documents */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Request More Documents</p>
              <div className="flex flex-wrap gap-2">
                {DOC_TYPES.map(dt => (
                  <button key={dt} onClick={() => setDocRequest(p => ({ ...p, [dt]: !p[dt] }))}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                    style={docRequest[dt]
                      ? { background: `${G}15`, color: G, borderColor: `${G}40` }
                      : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }}>
                    {docRequest[dt] ? "✓ " : ""}{dt}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button onClick={() => { setReviewing(null); setDecision(null); }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <div className="flex items-center gap-2">
                {Object.values(docRequest).some(Boolean) && (
                  <button className="px-4 py-2 rounded-xl text-sm font-bold border transition-all"
                    style={{ color: "#3b82f6", borderColor: "#3b82f6", background: "rgba(59,130,246,0.06)" }}>
                    Request Docs
                  </button>
                )}
                {decision && (
                  <button onClick={submitDecision}
                    className="px-5 py-2 rounded-xl text-sm font-black text-white transition-all"
                    style={{ background: decision === "approve" ? G : "#ef4444" }}>
                    {decision === "approve" ? "Approve KYC" : "Reject KYC"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SellerKYCPage;
