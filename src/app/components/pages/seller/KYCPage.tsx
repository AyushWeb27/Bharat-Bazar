import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UserCheck, ChevronDown, ChevronUp, Upload,
  Phone, MessageCircle, CheckCircle2, Clock, XCircle,
  AlertTriangle, FileText, Building2, User, Landmark, Store,
  RefreshCw, ExternalLink, ShieldCheck,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
const G   = "#009966";
const GD  = "#007a52";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";

type SectionKey =
  | "personal" | "business" | "bank"
  | "identity" | "business-docs" | "store";

interface SellerKycData {
  id: number;
  owner_name: string;
  email: string;
  mobile: string;
  business_name: string;
  business_type: string;
  business_category: string;
  gstin: string;
  pan: string;
  aadhaar: string;
  year_established: string;
  monthly_turnover: string;
  store_name: string;
  store_slug: string;
  store_description: string;
  store_logo_url?: string;
  store_banner_url?: string;
  bank_name: string;
  account_number: string;
  ifsc: string;
  account_holder: string;
  account_type: string;
  gst_doc_url?: string;
  pan_doc_url?: string;
  aadhaar_doc_url?: string;
  bank_doc_url?: string;
  trade_license_url?: string;
  status: string;
  kyc_status: string;
  kyc_rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}

// ── Stepper ──────────────────────────────────────────────────────────────────
function KYCStepper({ status }: { status: string }) {
  const s = status.toLowerCase();
  const isApproved = s === "approved";
  const isUnderReview = s === "under review" || s === "under_review";
  const isRejected = s === "rejected";

  const steps = [
    {
      label: isRejected ? "Action Required" : "Documents Submitted",
      done: isApproved || isUnderReview,
      active: isRejected || (!isApproved && !isUnderReview),
      error: isRejected,
    },
    {
      label: "Admin Review",
      done: isApproved,
      active: isUnderReview,
      error: false,
    },
    {
      label: isApproved ? "Verified & Live" : "Approval & Live",
      done: isApproved,
      active: false,
      error: false,
    },
  ];

  return (
    <div className="flex items-center gap-0 mt-6">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all relative"
              style={{
                borderColor: step.done ? G : step.error ? "#ef4444" : step.active ? "#3b82f6" : "#e5e7eb",
                background:  step.done ? G : step.error ? "#fee2e2" : step.active ? "#eff6ff" : "#f9fafb",
              }}
            >
              {step.done ? (
                <CheckCircle2 size={16} className="text-white" />
              ) : step.error ? (
                <XCircle size={16} className="text-red-500" />
              ) : step.active ? (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Clock size={16} className="text-blue-500" />
                </motion.span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-gray-300" />
              )}
            </div>
            <span
              className="text-[10px] font-bold whitespace-nowrap"
              style={{
                color: step.done ? G : step.error ? "#ef4444" : step.active ? "#2563eb" : "#9ca3af",
              }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="flex-1 h-0.5 mx-2 mb-5 rounded-full"
              style={{ background: step.done ? G : "#e5e7eb" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: "complete" | "pending" | "partial" }) {
  if (status === "complete")
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-green-600">
        <CheckCircle2 size={13} /> Complete
      </span>
    );
  if (status === "partial")
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
        <AlertTriangle size={13} /> Review Needed
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-red-500">
      <XCircle size={13} /> Incomplete
    </span>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function KYCPage() {
  const [openSection, setOpenSection] = useState<SectionKey | null>("identity");
  const [kycData, setKycData] = useState<SellerKycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadKey, setCurrentUploadKey] = useState<string>("gst");

  const fetchKyc = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seller/kyc");
      const data = await res.json();
      if (data.success && data.seller) {
        setKycData(data.seller);
      }
    } catch (e) {
      console.error("Failed to load seller KYC:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, []);

  const toggle = (key: SectionKey) =>
    setOpenSection((prev) => (prev === key ? null : key));

  const handleTriggerUpload = (key: string) => {
    setCurrentUploadKey(key);
    setUploadError(null);
    setUploadSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(currentUploadKey);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // 1. Upload to seller-file bucket via /api/seller/upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", currentUploadKey);

      const uploadRes = await fetch("/api/seller/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok || !uploadResult.success) {
        setUploadError(uploadResult.message || "Failed to upload document to bucket.");
        setUploadingDoc(null);
        return;
      }

      const uploadedUrl = uploadResult.url;

      // 2. Map to corresponding database column
      const docColMap: Record<string, string> = {
        gst: "gst_doc_url",
        pan: "pan_doc_url",
        aadhaar: "aadhaar_doc_url",
        bank: "bank_doc_url",
        trade: "trade_license_url",
      };

      const fieldName = docColMap[currentUploadKey] || "gst_doc_url";

      // 3. Update seller KYC in Neon DB
      const patchRes = await fetch("/api/seller/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldName]: uploadedUrl }),
      });

      const patchResult = await patchRes.json();
      if (patchResult.success) {
        setUploadSuccess(`Document uploaded successfully! Verification changed to Under Review.`);
        await fetchKyc();
      } else {
        setUploadError(patchResult.message || "Failed to save document in database.");
      }
    } catch (err: any) {
      setUploadError(err?.message || "An unexpected error occurred during upload.");
    } finally {
      setUploadingDoc(null);
    }
  };

  const currentStatus = (kycData?.kyc_status || "Pending").toLowerCase();
  const isApproved = currentStatus === "approved";
  const isUnderReview = currentStatus === "under review" || currentStatus === "under_review";
  const isRejected = currentStatus === "rejected";

  // Build checklist dynamically
  const sections = [
    {
      key: "personal" as SectionKey,
      title: "Personal Information",
      icon: User,
      status: (kycData?.owner_name && kycData?.mobile && kycData?.pan) ? "complete" : "partial",
      items: [
        { label: "Owner Full Name", value: kycData?.owner_name || "—", done: Boolean(kycData?.owner_name) },
        { label: "Registered Mobile", value: kycData?.mobile || "—", done: Boolean(kycData?.mobile) },
        { label: "Email Address", value: kycData?.email || "—", done: Boolean(kycData?.email) },
        { label: "Permanent Account No. (PAN)", value: kycData?.pan || "—", done: Boolean(kycData?.pan) },
        { label: "Aadhaar Card No.", value: kycData?.aadhaar || "—", done: Boolean(kycData?.aadhaar) },
      ],
    },
    {
      key: "business" as SectionKey,
      title: "Business & Tax Information",
      icon: Building2,
      status: (kycData?.business_name && kycData?.gstin) ? "complete" : "partial",
      items: [
        { label: "Registered Business Name", value: kycData?.business_name || kycData?.store_name || "—", done: Boolean(kycData?.business_name) },
        { label: "Business Constitution", value: kycData?.business_type || "Sole Proprietorship", done: true },
        { label: "Primary Category", value: kycData?.business_category || "General", done: true },
        { label: "Goods & Services Tax (GSTIN)", value: kycData?.gstin || "—", done: Boolean(kycData?.gstin) },
        { label: "Monthly Turnover", value: kycData?.monthly_turnover || "—", done: Boolean(kycData?.monthly_turnover) },
      ],
    },
    {
      key: "bank" as SectionKey,
      title: "Bank Settlement Details (Escrow)",
      icon: Landmark,
      status: (kycData?.bank_name && kycData?.account_number && kycData?.ifsc) ? "complete" : "partial",
      items: [
        { label: "Bank Name", value: kycData?.bank_name || "—", done: Boolean(kycData?.bank_name) },
        { label: "Account Holder Name", value: kycData?.account_holder || kycData?.owner_name || "—", done: Boolean(kycData?.account_holder || kycData?.owner_name) },
        { label: "Account Number", value: kycData?.account_number ? `XXXX-XXXX-${kycData.account_number.slice(-4)}` : "—", done: Boolean(kycData?.account_number) },
        { label: "IFSC Code", value: kycData?.ifsc || "—", done: Boolean(kycData?.ifsc) },
        { label: "Account Type", value: kycData?.account_type || "Current Account", done: true },
      ],
    },
    {
      key: "identity" as SectionKey,
      title: "Identity Documents (Bucket)",
      icon: FileText,
      status: (kycData?.aadhaar_doc_url && kycData?.pan_doc_url) ? "complete" : "partial",
      items: [
        {
          label: "Aadhaar Card Copy",
          value: kycData?.aadhaar_doc_url ? "Uploaded to bucket" : "Not uploaded",
          done: Boolean(kycData?.aadhaar_doc_url),
          url: kycData?.aadhaar_doc_url,
          uploadKey: "aadhaar",
        },
        {
          label: "PAN Card Copy",
          value: kycData?.pan_doc_url ? "Uploaded to bucket" : "Not uploaded",
          done: Boolean(kycData?.pan_doc_url),
          url: kycData?.pan_doc_url,
          uploadKey: "pan",
        },
      ],
    },
    {
      key: "business-docs" as SectionKey,
      title: "Business & Banking Documents (Bucket)",
      icon: FileText,
      status: (kycData?.gst_doc_url && kycData?.bank_doc_url) ? "complete" : "partial",
      items: [
        {
          label: "GST Registration Certificate",
          value: kycData?.gst_doc_url ? "Uploaded to bucket" : "Not uploaded",
          done: Boolean(kycData?.gst_doc_url),
          url: kycData?.gst_doc_url,
          uploadKey: "gst",
        },
        {
          label: "Cancelled Cheque / Bank Passbook",
          value: kycData?.bank_doc_url ? "Uploaded to bucket" : "Not uploaded",
          done: Boolean(kycData?.bank_doc_url),
          url: kycData?.bank_doc_url,
          uploadKey: "bank",
        },
        {
          label: "Trade License / MSME Certificate",
          value: kycData?.trade_license_url ? "Uploaded to bucket" : "Optional / Pending",
          done: Boolean(kycData?.trade_license_url),
          url: kycData?.trade_license_url,
          uploadKey: "trade",
        },
      ],
    },
    {
      key: "store" as SectionKey,
      title: "Storefront Media & Branding",
      icon: Store,
      status: (kycData?.store_logo_url && kycData?.store_banner_url) ? "complete" : "partial",
      items: [
        { label: "Store Name", value: kycData?.store_name || "—", done: Boolean(kycData?.store_name) },
        { label: "Store Logo", value: kycData?.store_logo_url ? "Uploaded" : "Pending", done: Boolean(kycData?.store_logo_url), url: kycData?.store_logo_url },
        { label: "Store Banner", value: kycData?.store_banner_url ? "Uploaded" : "Pending", done: Boolean(kycData?.store_banner_url), url: kycData?.store_banner_url },
      ],
    },
  ];

  const totalSections = sections.length;
  const completedSections = sections.filter(s => s.status === "complete").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Hidden file input for uploading */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
      />

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <UserCheck size={24} style={{ color: G }} /> KYC Verification &amp; Compliance
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Secure merchant identity and compliance verified by BharatBazar Admin
            </p>
          </div>
          <button
            onClick={fetchKyc}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[#009966]" : "text-gray-400"} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Alerts for upload feedback */}
        {uploadSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#009966] flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 p-5"
          style={{
            borderColor: isApproved ? G : isRejected ? "#ef4444" : isUnderReview ? "#3b82f6" : "#f59e0b",
            background:  isApproved ? "#f0fdf4" : isRejected ? "#fef2f2" : isUnderReview ? "#eff6ff" : "#fffbeb",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{
                background: isApproved ? `${G}20` : isRejected ? "#fee2e2" : isUnderReview ? "#dbeafe" : "#fef3c7",
              }}
            >
              {isApproved ? (
                <ShieldCheck size={26} style={{ color: G }} />
              ) : isRejected ? (
                <XCircle size={26} className="text-red-500" />
              ) : isUnderReview ? (
                <Clock size={26} className="text-blue-500 animate-pulse" />
              ) : (
                <Clock size={26} className="text-amber-500" />
              )}
            </div>
            <div className="flex-1">
              <h2
                className="text-base font-black"
                style={{
                  color: isApproved ? GD : isRejected ? "#991b1b" : isUnderReview ? "#1e40af" : "#92400e",
                }}
              >
                {isApproved
                  ? "KYC Verified & Store Active"
                  : isRejected
                  ? "KYC Verification Rejected by Admin"
                  : isUnderReview
                  ? "KYC Under Admin Review"
                  : "KYC Verification In Progress"}
              </h2>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{
                  color: isApproved ? "#166534" : isRejected ? "#b91c1c" : isUnderReview ? "#1d4ed8" : "#b45309",
                }}
              >
                {isApproved
                  ? "Your merchant account and KYC documents have been officially approved by BharatBazar Administration. Your products are active and live for shoppers across India."
                  : isRejected
                  ? `Rejection Reason: ${kycData?.kyc_rejection_reason || "Documents submitted do not meet verification criteria. Please re-upload clear copies below."}`
                  : isUnderReview
                  ? "Your submitted documents have been dispatched to the Admin Manage Seller desk. Review typically completes within 12–24 business hours."
                  : "Your store registration has been recorded in Neon Database. Please ensure all documents below are uploaded for admin approval."}
              </p>
              {kycData?.created_at && (
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                  Account Created: {new Date(kycData.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Stepper */}
          <KYCStepper status={kycData?.kyc_status || "Pending"} />
        </motion.div>

        {/* Checklist */}
        <div className={`${card} overflow-hidden`}>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900">KYC Verification Checklist</h3>
              <p className="text-xs text-gray-400 mt-0.5">{completedSections} of {totalSections} sections complete</p>
            </div>
            <span
              className="text-xs font-black px-2.5 py-1 rounded-full"
              style={{ background: isApproved ? `${G}18` : "#fef3c7", color: isApproved ? G : "#d97706" }}
            >
              Status: {kycData?.kyc_status || "Pending"}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {sections.map((section) => {
              const Icon = section.icon;
              const isOpen = openSection === section.key;

              return (
                <div key={section.key}>
                  <button
                    onClick={() => toggle(section.key)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background:
                          section.status === "complete" ? `${G}15`
                          : section.status === "partial" ? "#fef3c7"
                          : "#fee2e2",
                      }}
                    >
                      <Icon
                        size={15}
                        style={{
                          color:
                            section.status === "complete" ? G
                            : section.status === "partial" ? "#f59e0b"
                            : "#ef4444",
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{section.title}</p>
                    </div>
                    <StatusBadge status={section.status as any} />
                    <span className="ml-2 text-gray-400">
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-1 space-y-2 bg-gray-50/60">
                          {section.items.map((item: any) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between py-2 px-3 rounded-xl bg-white border border-gray-100"
                            >
                              <div className="flex items-center gap-2">
                                {item.done
                                  ? <CheckCircle2 size={14} style={{ color: G }} />
                                  : <XCircle size={14} className="text-red-400" />}
                                <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.value && (
                                  <span className="text-xs font-mono font-bold text-gray-800">{item.value}</span>
                                )}
                                {item.url && (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 rounded text-[#009966] hover:bg-emerald-50 transition-colors"
                                    title="View submitted document"
                                  >
                                    <ExternalLink size={13} />
                                  </a>
                                )}
                                {item.uploadKey && !isApproved && (
                                  <button
                                    onClick={() => handleTriggerUpload(item.uploadKey)}
                                    disabled={uploadingDoc === item.uploadKey}
                                    className="text-[11px] font-black px-2.5 py-1 rounded-lg text-white transition-all shadow-sm"
                                    style={{ background: G }}
                                  >
                                    {uploadingDoc === item.uploadKey ? "Uploading..." : item.done ? "Re-upload" : "Upload"}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Upload Box if not approved */}
        {!isApproved && (
          <div className={`${card} p-5`}>
            <h3 className="text-sm font-black text-gray-900 mb-1">Upload / Update KYC Document</h3>
            <p className="text-xs text-gray-400 mb-4">
              Upload clear PDF or JPG scans to the "seller-file" bucket for admin review
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "GST Certificate", key: "gst" },
                { label: "PAN Card", key: "pan" },
                { label: "Aadhaar Card", key: "aadhaar" },
                { label: "Bank Proof", key: "bank" },
              ].map(btn => (
                <button
                  key={btn.key}
                  onClick={() => handleTriggerUpload(btn.key)}
                  disabled={uploadingDoc !== null}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 hover:border-[#009966] hover:bg-emerald-50 text-xs font-bold text-gray-700 transition-all"
                >
                  <Upload size={13} className="text-[#009966]" />
                  <span>{uploadingDoc === btn.key ? "Uploading..." : btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Support card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: `${G}0d`, border: `1.5px solid ${G}30` }}
        >
          <div className="flex-1">
            <p className="text-sm font-black" style={{ color: GD }}>
              Questions regarding Seller KYC Verification?
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Admin Manage Seller compliance desk is available Monday through Saturday.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white shadow-sm"
              style={{ background: G }}
            >
              <MessageCircle size={13} /> Chat with Admin
            </button>
            <a
              href="tel:18001234567"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Phone size={13} /> 1800-123-4567
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default KYCPage;
