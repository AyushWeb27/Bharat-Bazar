import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UserCheck, ChevronDown, ChevronUp, Upload,
  Phone, MessageCircle, CheckCircle2, Clock, XCircle,
  AlertTriangle, FileText, Building2, User, Landmark, Store,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
const G   = "#009966";
const GD  = "#007a52";
const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";

const KYC_STATUS: "Pending" | "Approved" = "Pending";

// ── Types ────────────────────────────────────────────────────────────────────
type SectionKey =
  | "personal" | "business" | "bank"
  | "identity" | "business-docs" | "store";

interface ChecklistSection {
  key: SectionKey;
  title: string;
  status: "complete" | "pending" | "partial";
  icon: React.ElementType;
  items: { label: string; value?: string; done: boolean }[];
}

// ── Data ─────────────────────────────────────────────────────────────────────
const SECTIONS: ChecklistSection[] = [
  {
    key: "personal", title: "Personal Info", status: "complete",
    icon: User,
    items: [
      { label: "Full Name",   value: "Ravi Kumar",      done: true },
      { label: "Date of Birth", value: "15 Mar 1985",   done: true },
      { label: "PAN Number",  value: "ABCDE****F",      done: true },
    ],
  },
  {
    key: "business", title: "Business Details", status: "complete",
    icon: Building2,
    items: [
      { label: "Business Name", value: "Ravi Electro Hub",     done: true },
      { label: "GST Number",    value: "27ABCDE1234F1Z5",      done: true },
      { label: "MSME Number",   value: "UDYAM-MH-01-0012345",  done: true },
    ],
  },
  {
    key: "bank", title: "Bank Account", status: "complete",
    icon: Landmark,
    items: [
      { label: "Bank Name",    value: "HDFC Bank",    done: true },
      { label: "Account No.",  value: "XXXX XXXX 4521", done: true },
      { label: "IFSC Code",    value: "HDFC0001234",  done: true },
    ],
  },
  {
    key: "identity", title: "Identity Documents", status: "complete",
    icon: FileText,
    items: [
      { label: "Aadhaar Card", value: "Uploaded", done: true },
      { label: "PAN Card",     value: "Uploaded", done: true },
    ],
  },
  {
    key: "business-docs", title: "Business Documents", status: "partial",
    icon: FileText,
    items: [
      { label: "GST Certificate", value: "Uploaded",  done: true  },
      { label: "Trade License",   value: "Pending",   done: false },
    ],
  },
  {
    key: "store", title: "Store Details", status: "complete",
    icon: Store,
    items: [
      { label: "Store Name",   value: "Ravi Electro Hub",                       done: true },
      { label: "Description",  value: "Electronics & Appliances",              done: true },
      { label: "Store Logo",   value: "Uploaded",                              done: true },
    ],
  },
];

// ── Stepper ──────────────────────────────────────────────────────────────────
function KYCStepper() {
  const steps = [
    { label: "Documents Submitted", done: true,    active: false },
    { label: "Under Review",        done: false,   active: true  },
    { label: "Approved",            done: false,   active: false },
  ];

  return (
    <div className="flex items-center gap-0 mt-6">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all relative"
              style={{
                borderColor: step.done ? G : step.active ? "#f59e0b" : "#e5e7eb",
                background:  step.done ? G : step.active ? "#fef3c7" : "#f9fafb",
              }}
            >
              {step.done ? (
                <CheckCircle2 size={16} className="text-white" />
              ) : step.active ? (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Clock size={16} className="text-amber-500" />
                </motion.span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-gray-300" />
              )}
            </div>
            <span
              className="text-[10px] font-semibold whitespace-nowrap"
              style={{ color: step.done ? G : step.active ? "#f59e0b" : "#9ca3af" }}
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
      <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
        <CheckCircle2 size={13} /> Complete
      </span>
    );
  if (status === "partial")
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
        <AlertTriangle size={13} /> Partial
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
      <XCircle size={13} /> Pending
    </span>
  );
}

// ── Upload Area ───────────────────────────────────────────────────────────────
function UploadArea({ label }: { label?: string }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); }}
      className="rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 py-8 px-4"
      style={{
        borderColor: dragging ? G : "#d1d5db",
        background:  dragging ? `${G}08` : "#fafafa",
      }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${G}18` }}>
        <Upload size={22} style={{ color: G }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700">
          {label || "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Max file size: 5 MB</p>
      </div>
      <div className="flex gap-2">
        {["PDF", "JPG", "PNG"].map((t) => (
          <span key={t} className="text-[10px] font-black px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 bg-white">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function KYCPage() {
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  const toggle = (key: SectionKey) =>
    setOpenSection((prev) => (prev === key ? null : key));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck size={22} style={{ color: G }} /> KYC &amp; Verification
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track your seller verification status and submitted documents
          </p>
        </div>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 p-5"
          style={{
            borderColor: KYC_STATUS === "Pending" ? "#f59e0b" : G,
            background:  KYC_STATUS === "Pending" ? "#fffbeb" : "#f0fdf4",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: KYC_STATUS === "Pending" ? "#fef3c7" : `${G}20` }}
            >
              {KYC_STATUS === "Pending"
                ? <Clock size={22} className="text-amber-500" />
                : <CheckCircle2 size={22} style={{ color: G }} />}
            </div>
            <div>
              <h2
                className="text-base font-bold"
                style={{ color: KYC_STATUS === "Pending" ? "#92400e" : GD }}
              >
                {KYC_STATUS === "Pending"
                  ? "KYC Under Review"
                  : "KYC Verified"}
              </h2>
              <p
                className="text-sm mt-0.5"
                style={{ color: KYC_STATUS === "Pending" ? "#b45309" : "#166534" }}
              >
                {KYC_STATUS === "Pending"
                  ? "Your KYC is under review. This usually takes 1–2 business days."
                  : "Your account is fully verified. You can sell on BharatBazar."}
              </p>
              {KYC_STATUS === "Pending" && (
                <p className="text-xs text-amber-500 mt-1 font-medium">Submitted: Oct 3, 2026</p>
              )}
            </div>
          </div>

          {/* Stepper */}
          <KYCStepper />
        </motion.div>

        {/* Checklist */}
        <div className={`${card} overflow-hidden`}>
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">KYC Checklist</h3>
            <p className="text-xs text-gray-400 mt-0.5">5 of 6 sections complete</p>
          </div>

          <div className="divide-y divide-gray-100">
            {SECTIONS.map((section, idx) => {
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
                      <p className="text-sm font-semibold text-gray-800">{section.title}</p>
                    </div>
                    <StatusBadge status={section.status} />
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
                          {section.items.map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between py-2 px-3 rounded-xl bg-white border border-gray-100"
                            >
                              <div className="flex items-center gap-2">
                                {item.done
                                  ? <CheckCircle2 size={14} style={{ color: G }} />
                                  : <XCircle size={14} className="text-red-400" />}
                                <span className="text-xs text-gray-600">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.value && (
                                  <span className="text-xs font-medium text-gray-700">{item.value}</span>
                                )}
                                {!item.done && (
                                  <button
                                    className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                                    style={{ background: G }}
                                  >
                                    Upload Now
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

        {/* Document Upload Area */}
        <div className={`${card} p-5`}>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Upload Missing Documents</h3>
          <p className="text-xs text-gray-400 mb-4">
            Upload your Trade License to complete KYC verification
          </p>
          <UploadArea label="Drag & drop or click to upload Trade License" />
        </div>

        {/* Support card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: `${G}0d`, border: `1.5px solid ${G}30` }}
        >
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: GD }}>
              Questions about KYC?
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Our seller support team is available Mon–Sat, 9 AM to 6 PM
            </p>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <button
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: G }}
            >
              <MessageCircle size={13} /> Chat with Us
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
