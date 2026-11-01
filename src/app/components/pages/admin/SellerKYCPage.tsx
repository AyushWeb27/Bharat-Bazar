import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UserCheck, CheckCircle2, XCircle, Clock, FileText, AlertTriangle,
  RefreshCw, ExternalLink, ShieldCheck, Mail, Phone, MapPin, Landmark,
} from "lucide-react";
import { Modal, Field, PageHeader, StatCard } from "./shared/ui";
import { G, inp, card } from "./shared/constants";

export type KYCStatus = "Pending" | "Under Review" | "Approved" | "Rejected";

export type KYCApp = {
  id: number;
  sellerName: string;
  ownerName: string;
  email: string;
  mobile: string;
  businessName: string;
  businessCategory: string;
  city: string;
  submittedDate: string;
  gst: string;
  pan: string;
  aadhaar: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  storeLogoUrl?: string;
  storeBannerUrl?: string;
  docs: {
    aadhaar: boolean;
    aadhaarUrl?: string;
    pan: boolean;
    panUrl?: string;
    gstCert: boolean;
    gstCertUrl?: string;
    bankStatement: boolean;
    bankStatementUrl?: string;
    tradeLicense: boolean;
    tradeLicenseUrl?: string;
  };
  status: KYCStatus;
  rejectionReason?: string;
};

const statusMeta: Record<KYCStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  Pending:       { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: <Clock size={11} />         },
  "Under Review":{ color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: <FileText size={11} />      },
  Approved:      { color: G,         bg: `${G}15`,                  icon: <CheckCircle2 size={11} />  },
  Rejected:      { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: <XCircle size={11} />       },
};

const FILTER_TABS: ("All" | KYCStatus)[] = ["All", "Pending", "Under Review", "Approved", "Rejected"];
const DOC_TYPES = ["GST Certificate", "PAN Card", "Aadhaar Card", "Bank Statement / Cheque", "Trade License / MSME"];

function mapDbToKycApp(s: any): KYCApp {
  let status: KYCStatus = "Pending";
  const ks = (s.kyc_status || "").toLowerCase();
  if (ks === "approved") status = "Approved";
  else if (ks === "under review" || ks === "under_review") status = "Under Review";
  else if (ks === "rejected") status = "Rejected";
  else status = "Pending";

  const d = s.created_at ? new Date(s.created_at) : new Date();
  const submittedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return {
    id: s.id,
    sellerName: s.store_name || s.business_name || "Merchant Store",
    ownerName: s.owner_name || "Merchant Owner",
    email: s.email || "",
    mobile: s.mobile || "",
    businessName: s.business_name || s.store_name || "",
    businessCategory: s.business_category || "General",
    city: s.city || "India",
    submittedDate,
    gst: s.gstin || "N/A",
    pan: s.pan || "N/A",
    aadhaar: s.aadhaar || "N/A",
    bankName: s.bank_name || "",
    accountNumber: s.account_number || "",
    ifsc: s.ifsc || "",
    storeLogoUrl: s.store_logo_url,
    storeBannerUrl: s.store_banner_url,
    docs: {
      aadhaar: Boolean(s.aadhaar_doc_url),
      aadhaarUrl: s.aadhaar_doc_url,
      pan: Boolean(s.pan_doc_url),
      panUrl: s.pan_doc_url,
      gstCert: Boolean(s.gst_doc_url),
      gstCertUrl: s.gst_doc_url,
      bankStatement: Boolean(s.bank_doc_url),
      bankStatementUrl: s.bank_doc_url,
      tradeLicense: Boolean(s.trade_license_url),
      tradeLicenseUrl: s.trade_license_url,
    },
    status,
    rejectionReason: s.kyc_rejection_reason || "",
  };
}

function DocRow({ label, ok, url }: { label: string; ok: boolean; url?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2">
        <FileText size={14} className={ok ? "text-[#009966]" : "text-gray-300"} />
        <span className="text-xs font-semibold text-gray-800">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {ok ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-green-600">
            <CheckCircle2 size={13} /> Uploaded
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-500">
            <XCircle size={13} /> Missing
          </span>
        )}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black text-[#009966] bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <span>View / Verify</span>
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}

export function SellerKYCPage() {
  const [filter, setFilter]         = useState<"All" | KYCStatus>("All");
  const [reviewing, setReviewing]   = useState<KYCApp | null>(null);
  const [decision, setDecision]     = useState<"approve" | "reject" | null>(null);
  const [reason, setReason]         = useState("");
  const [docRequest, setDocRequest] = useState<Record<string, boolean>>({});
  const [apps, setApps]             = useState<KYCApp[]>([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchKycApps = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sellers");
      const data = await res.json();
      if (data.success && Array.isArray(data.sellers)) {
        setApps(data.sellers.map(mapDbToKycApp));
      }
    } catch (e) {
      console.error("Failed to load KYC applications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycApps();
  }, []);

  const filtered = filter === "All" ? apps : apps.filter(a => a.status === filter);

  const pending     = apps.filter(a => a.status === "Pending").length;
  const underReview = apps.filter(a => a.status === "Under Review").length;
  const approved    = apps.filter(a => a.status === "Approved").length;
  const rejected    = apps.filter(a => a.status === "Rejected").length;

  const submitDecision = async () => {
    if (!reviewing) return;
    setSubmitting(true);
    try {
      const action = decision === "approve" ? "approve" : "reject";
      const res = await fetch(`/api/admin/sellers/${reviewing.id}/kyc`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        const newStatus: KYCStatus = decision === "approve" ? "Approved" : "Rejected";
        setApps(p => p.map(a => a.id === reviewing.id ? { ...a, status: newStatus, rejectionReason: reason } : a));
        setReviewing(null);
        setDecision(null);
        setReason("");
      } else {
        alert(data.message || "Failed to update KYC status");
      }
    } catch (e) {
      console.error("Error submitting KYC decision:", e);
      alert("Network error while submitting KYC decision");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestDocs = async () => {
    if (!reviewing) return;
    const requested = Object.entries(docRequest)
      .filter(([_, sel]) => sel)
      .map(([name]) => name);

    if (requested.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/sellers/${reviewing.id}/kyc`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_docs", requestedDocs: requested }),
      });
      const data = await res.json();
      if (data.success) {
        setApps(p => p.map(a => a.id === reviewing.id ? {
          ...a,
          status: "Under Review",
          rejectionReason: `Action required: Please re-upload: ${requested.join(", ")}`,
        } : a));
        setReviewing(null);
        setDocRequest({});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center justify-between">
        <PageHeader
          breadcrumb="Manage Seller / KYC"
          title="Seller KYC Verification"
          subtitle="Review official verification documents submitted by merchants in Neon DB"
          count={apps.length}
        />
        <button
          onClick={fetchKycApps}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-[#009966]" : "text-gray-400"} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Pending Review" val={pending}     color="#f59e0b" icon={Clock}          />
        <StatCard label="Under Review"   val={underReview} color="#3b82f6" icon={FileText}       />
        <StatCard label="Approved & Active" val={approved} color={G}       icon={ShieldCheck}    />
        <StatCard label="Rejected"       val={rejected}    color="#ef4444" icon={AlertTriangle}  />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
        {FILTER_TABS.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
            style={
              filter === t
                ? { background: G, color: "#fff", boxShadow: "0 1px 4px rgba(0,153,102,0.3)" }
                : { color: "#6b7280" }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* KYC cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <RefreshCw size={32} className="text-[#009966] animate-spin mb-3" />
          <p className="text-sm font-bold text-gray-700">Loading KYC submissions from Neon Database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${card} py-16 text-center text-gray-400 space-y-2`}>
          <UserCheck size={36} className="mx-auto text-gray-300" />
          <p className="text-sm font-bold text-gray-600">No applications match this filter</p>
          <p className="text-xs text-gray-400">Merchant registrations awaiting verification will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map(a => {
              const meta = statusMeta[a.status] || statusMeta.Pending;
              const docVals = [a.docs.aadhaar, a.docs.pan, a.docs.gstCert, a.docs.bankStatement, a.docs.tradeLicense];
              const docsOk   = docVals.filter(Boolean).length;
              const docsTotal = docVals.length;

              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`${card} p-5 hover:shadow-md transition-shadow relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      {a.storeLogoUrl ? (
                        <img src={a.storeLogoUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100 shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#009966] flex items-center justify-center font-black text-sm shrink-0">
                          {a.sellerName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h3 className="text-sm font-black text-gray-900">{a.sellerName}</h3>
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black"
                            style={{ color: meta.color, background: meta.bg }}
                          >
                            {meta.icon} {a.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Owner: <span className="font-semibold text-gray-700">{a.ownerName}</span> ({a.businessName})
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Submitted: {a.submittedDate} • {a.city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Masked / Tax identifiers */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">GSTIN</p>
                      <p className="text-xs font-mono font-bold text-gray-800 truncate">{a.gst}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">PAN</p>
                      <p className="text-xs font-mono font-bold text-gray-800 truncate">{a.pan}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Aadhaar</p>
                      <p className="text-xs font-mono font-bold text-gray-800 truncate">{a.aadhaar}</p>
                    </div>
                  </div>

                  {/* Document checklist badge bar */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    {[
                      { label: "Aadhaar",       ok: a.docs.aadhaar       },
                      { label: "PAN",           ok: a.docs.pan           },
                      { label: "GST Cert",      ok: a.docs.gstCert       },
                      { label: "Bank Proof",    ok: a.docs.bankStatement  },
                      { label: "Trade License", ok: a.docs.tradeLicense  },
                    ].map(d => (
                      <span
                        key={d.label}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                        style={
                          d.ok
                            ? { background: `${G}12`, color: G }
                            : { background: "rgba(239,68,68,0.08)", color: "#ef4444" }
                        }
                      >
                        {d.ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {d.label}
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] font-bold text-gray-400">{docsOk}/{docsTotal} proofs</span>
                  </div>

                  {/* Rejection / Note message if any */}
                  {a.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 mb-3 text-[11px] text-amber-900 flex items-start gap-2">
                      <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>{a.rejectionReason}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium">
                      Category: <span className="font-bold text-gray-600">{a.businessCategory}</span>
                    </span>
                    <button
                      onClick={() => { setReviewing(a); setDecision(null); setReason(""); setDocRequest({}); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white transition-all shadow-md hover:opacity-95"
                      style={{ background: G }}
                    >
                      <FileText size={12} />
                      Review &amp; Verify
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        open={reviewing !== null}
        onClose={() => { setReviewing(null); setDecision(null); }}
        title={`KYC Review — ${reviewing?.sellerName ?? ""}`}
        wide
      >
        {reviewing && (
          <div className="space-y-4">
            {/* Merchant Identity strip */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900">{reviewing.ownerName}</p>
                <p className="text-[11px] text-gray-500">{reviewing.email} • {reviewing.mobile}</p>
              </div>
              <div className="text-right">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black"
                  style={{
                    color: (statusMeta[reviewing.status] || statusMeta.Pending).color,
                    background: (statusMeta[reviewing.status] || statusMeta.Pending).bg,
                  }}
                >
                  Current: {reviewing.status}
                </span>
              </div>
            </div>

            {/* Document list with links */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                Submitted Documents from Bucket (seller-file)
              </p>
              <div className="rounded-xl border border-gray-100 overflow-hidden bg-white">
                <DocRow label="Aadhaar Card"    ok={reviewing.docs.aadhaar}       url={reviewing.docs.aadhaarUrl}       />
                <DocRow label="PAN Card"        ok={reviewing.docs.pan}           url={reviewing.docs.panUrl}           />
                <DocRow label="GST Certificate" ok={reviewing.docs.gstCert}       url={reviewing.docs.gstCertUrl}       />
                <DocRow label="Bank Statement"  ok={reviewing.docs.bankStatement}  url={reviewing.docs.bankStatementUrl}  />
                <DocRow label="Trade License"   ok={reviewing.docs.tradeLicense}  url={reviewing.docs.tradeLicenseUrl}  />
              </div>
            </div>

            {/* Bank details check */}
            {reviewing.bankName && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Landmark size={12} className="text-gray-500" /> Bank Account for RBI Escrow Payouts
                </p>
                <div className="grid grid-cols-3 gap-2 mt-1.5 text-gray-700">
                  <div><span className="text-gray-400 block text-[10px]">Bank:</span> <span className="font-bold">{reviewing.bankName}</span></div>
                  <div><span className="text-gray-400 block text-[10px]">Account No:</span> <span className="font-mono font-bold">{reviewing.accountNumber}</span></div>
                  <div><span className="text-gray-400 block text-[10px]">IFSC:</span> <span className="font-mono font-bold">{reviewing.ifsc}</span></div>
                </div>
              </div>
            )}

            {/* Decision buttons */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Verification Decision</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDecision("approve")}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all border-2"
                  style={
                    decision === "approve"
                      ? { background: G, color: "#fff", borderColor: G }
                      : { background: `${G}08`, color: G, borderColor: `${G}30` }
                  }
                >
                  <CheckCircle2 size={16} /> Approve &amp; Activate Seller
                </button>
                <button
                  onClick={() => setDecision("reject")}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all border-2"
                  style={
                    decision === "reject"
                      ? { background: "#ef4444", color: "#fff", borderColor: "#ef4444" }
                      : { background: "rgba(239,68,68,0.06)", color: "#ef4444", borderColor: "rgba(239,68,68,0.25)" }
                  }
                >
                  <XCircle size={16} /> Reject Application
                </button>
              </div>
            </div>

            {/* Rejection reason input */}
            {decision === "reject" && (
              <div>
                <Field label="Rejection Reason" required>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Explain clearly to the seller why this application is being rejected (e.g. illegible PAN image, blurred GSTIN certificate)…"
                    rows={3}
                    className={`${inp} resize-none`}
                  />
                </Field>
              </div>
            )}

            {/* Request more documents */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                Request Re-upload of Documents
              </p>
              <p className="text-[11px] text-gray-500 mb-2">Select missing or rejected items to prompt the merchant:</p>
              <div className="flex flex-wrap gap-2">
                {DOC_TYPES.map(dt => (
                  <button
                    key={dt}
                    onClick={() => setDocRequest(p => ({ ...p, [dt]: !p[dt] }))}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                    style={
                      docRequest[dt]
                        ? { background: `${G}15`, color: G, borderColor: `${G}40` }
                        : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }
                    }
                  >
                    {docRequest[dt] ? "✓ " : ""}{dt}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                onClick={() => { setReviewing(null); setDecision(null); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                {Object.values(docRequest).some(Boolean) && (
                  <button
                    onClick={handleRequestDocs}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
                    style={{ color: "#3b82f6", borderColor: "#3b82f6", background: "rgba(59,130,246,0.08)" }}
                  >
                    Request Selected Docs
                  </button>
                )}
                {decision && (
                  <button
                    onClick={submitDecision}
                    disabled={submitting || (decision === "reject" && !reason.trim())}
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-white transition-all shadow-md disabled:opacity-50"
                    style={{ background: decision === "approve" ? G : "#ef4444" }}
                  >
                    {submitting ? "Saving to Neon DB..." : decision === "approve" ? "Confirm KYC Approval" : "Confirm KYC Rejection"}
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
