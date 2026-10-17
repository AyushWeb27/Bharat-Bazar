import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, User, Store, Landmark, MapPin, Settings2,
  CheckCircle2, Circle, ShieldCheck, Users,
} from "lucide-react";
import { G, inp, card } from "./shared/constants";
import { SectionCard, Field, PageHeader, Toggle, Modal } from "./shared/ui";

/* ─── types ─────────────────────────────────────────────── */
interface SellerForm {
  // Business
  businessName: string;
  businessType: string;
  gstin: string;
  pan: string;
  businessCategory: string;
  yearEstablished: string;
  // Owner
  ownerName: string;
  mobile: string;
  email: string;
  altPhone: string;
  aadhaar: string;
  // Store
  storeName: string;
  storeDescription: string;
  websiteUrl: string;
  monthlyTurnover: string;
  productCount: string;
  // Bank
  accountHolder: string;
  accountNumber: string;
  confirmAccount: string;
  ifsc: string;
  bankName: string;
  // Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  // Settings
  commissionRate: string;
  autoApprove: boolean;
  featuredSeller: boolean;
  allowCOD: boolean;
  sendWelcomeEmail: boolean;
  sellerStatus: string;
}

const INIT: SellerForm = {
  businessName: "", businessType: "Sole Proprietorship", gstin: "", pan: "",
  businessCategory: "", yearEstablished: "",
  ownerName: "", mobile: "", email: "", altPhone: "", aadhaar: "",
  storeName: "", storeDescription: "", websiteUrl: "", monthlyTurnover: "", productCount: "",
  accountHolder: "", accountNumber: "", confirmAccount: "", ifsc: "", bankName: "",
  addressLine1: "", addressLine2: "", city: "", state: "", pincode: "",
  commissionRate: "10", autoApprove: false, featuredSeller: false,
  allowCOD: true, sendWelcomeEmail: true, sellerStatus: "Pending Verification",
};

/* ─── helpers ───────────────────────────────────────────── */
const sel = `${inp} cursor-pointer`;

function RequiredDot({ filled }: { filled: boolean }) {
  return filled
    ? <CheckCircle2 size={13} style={{ color: G }} />
    : <Circle size={13} className="text-gray-300" />;
}

/* ─── component ─────────────────────────────────────────── */
export function AddSellerPage() {
  const [form, setForm] = useState<SellerForm>(INIT);
  const [showSuccess, setShowSuccess] = useState(false);

  function set<K extends keyof SellerForm>(key: K, value: SellerForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setShowSuccess(true);
  }

  function resetForm() {
    setForm(INIT);
    setShowSuccess(false);
  }

  const avatarLetter = form.businessName.trim()
    ? form.businessName.trim()[0].toUpperCase()
    : "?";

  const requiredFields: Array<{ label: string; filled: boolean }> = [
    { label: "Business Name",  filled: !!form.businessName.trim() },
    { label: "Owner Name",     filled: !!form.ownerName.trim() },
    { label: "Email Address",  filled: !!form.email.trim() },
    { label: "Store Name",     filled: !!form.storeName.trim() },
  ];

  const filledCount = requiredFields.filter(f => f.filled).length;

  const statusColors: Record<string, string> = {
    "Active":               G,
    "Pending Verification": "#f59e0b",
    "Suspended":            "#ef4444",
  };
  const statusColor = statusColors[form.sellerStatus] ?? "#6b7280";

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb="Sellers › Add Seller"
        title="Register New Seller"
        subtitle="Onboard a new vendor onto BharatBazar"
      />

      {/* two-column layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── LEFT (2/3) ───────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* 1. Business Information */}
          <SectionCard title="Business Information" icon={Building2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Business Name" hint="required">
                <input
                  value={form.businessName}
                  onChange={e => set("businessName", e.target.value)}
                  placeholder="e.g. Sharma Textiles Pvt Ltd"
                  className={inp}
                />
              </Field>
              <Field label="Business Type">
                <select value={form.businessType} onChange={e => set("businessType", e.target.value)} className={sel}>
                  {["Sole Proprietorship","Partnership","Private Limited","LLP","Public Limited"].map(t =>
                    <option key={t}>{t}</option>
                  )}
                </select>
              </Field>
              <Field label="GSTIN">
                <input
                  value={form.gstin}
                  onChange={e => set("gstin", e.target.value.toUpperCase())}
                  placeholder="22AAAAA0000A1Z5"
                  className={`${inp} font-mono`}
                />
              </Field>
              <Field label="PAN Number">
                <input
                  value={form.pan}
                  onChange={e => set("pan", e.target.value.toUpperCase())}
                  placeholder="AAAAA9999A"
                  className={`${inp} font-mono`}
                />
              </Field>
              <Field label="Business Category">
                <select value={form.businessCategory} onChange={e => set("businessCategory", e.target.value)} className={sel}>
                  <option value="">— Select category —</option>
                  {["Electronics","Fashion","Grocery","Beauty","Sports","Home & Living","Books","Toys","Other"].map(c =>
                    <option key={c}>{c}</option>
                  )}
                </select>
              </Field>
              <Field label="Year Established">
                <input
                  type="number"
                  value={form.yearEstablished}
                  onChange={e => set("yearEstablished", e.target.value)}
                  placeholder="2020"
                  className={inp}
                  min={1900}
                  max={new Date().getFullYear()}
                />
              </Field>
            </div>
          </SectionCard>

          {/* 2. Owner / Contact Details */}
          <SectionCard title="Owner / Contact Details" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Owner Full Name" hint="required">
                <input
                  value={form.ownerName}
                  onChange={e => set("ownerName", e.target.value)}
                  placeholder="e.g. Rajesh Kumar Sharma"
                  className={inp}
                />
              </Field>
              <Field label="Mobile Number">
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={e => set("mobile", e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inp}
                />
              </Field>
              <Field label="Email Address" hint="required">
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="seller@example.com"
                  className={inp}
                />
              </Field>
              <Field label="Alternate Phone" hint="optional">
                <input
                  type="tel"
                  value={form.altPhone}
                  onChange={e => set("altPhone", e.target.value)}
                  placeholder="+91 91234 56789"
                  className={inp}
                />
              </Field>
              <Field label="Aadhaar Number">
                <input
                  value={form.aadhaar}
                  onChange={e => set("aadhaar", e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  className={`${inp} font-mono tracking-wider`}
                />
              </Field>
            </div>
          </SectionCard>

          {/* 3. Store / Shop Details */}
          <SectionCard title="Store / Shop Details" icon={Store}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Store Name" hint="required">
                <input
                  value={form.storeName}
                  onChange={e => set("storeName", e.target.value)}
                  placeholder="e.g. Sharma Fashion Hub"
                  className={inp}
                />
              </Field>
              <Field label="Website URL" hint="optional">
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={e => set("websiteUrl", e.target.value)}
                  placeholder="https://yourstore.com"
                  className={inp}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Store Description">
                  <textarea
                    value={form.storeDescription}
                    onChange={e => set("storeDescription", e.target.value)}
                    placeholder="Describe what your store sells, your speciality, or your brand story…"
                    rows={3}
                    className={`${inp} resize-none`}
                  />
                </Field>
              </div>
              <Field label="Monthly Turnover">
                <select value={form.monthlyTurnover} onChange={e => set("monthlyTurnover", e.target.value)} className={sel}>
                  <option value="">— Select range —</option>
                  {["Below ₹1L","₹1L–₹5L","₹5L–₹20L","₹20L–₹50L","Above ₹50L"].map(t =>
                    <option key={t}>{t}</option>
                  )}
                </select>
              </Field>
              <Field label="No. of Products">
                <input
                  type="number"
                  value={form.productCount}
                  onChange={e => set("productCount", e.target.value)}
                  placeholder="e.g. 150"
                  className={inp}
                  min={0}
                />
              </Field>
            </div>
          </SectionCard>

          {/* 4. Bank Account Details */}
          <SectionCard title="Bank Account Details" icon={Landmark}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Account Holder Name">
                <input
                  value={form.accountHolder}
                  onChange={e => set("accountHolder", e.target.value)}
                  placeholder="As per bank records"
                  className={inp}
                />
              </Field>
              <Field label="Bank Name">
                <input
                  value={form.bankName}
                  onChange={e => set("bankName", e.target.value)}
                  placeholder="State Bank of India"
                  className={inp}
                />
              </Field>
              <Field label="Account Number">
                <input
                  value={form.accountNumber}
                  onChange={e => set("accountNumber", e.target.value)}
                  placeholder="XXXXXXXXXXXX"
                  className={`${inp} font-mono tracking-wider`}
                />
              </Field>
              <Field label="Confirm Account Number">
                <input
                  value={form.confirmAccount}
                  onChange={e => set("confirmAccount", e.target.value)}
                  placeholder="Re-enter account number"
                  className={`${inp} font-mono tracking-wider ${
                    form.confirmAccount && form.confirmAccount !== form.accountNumber
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                      : ""
                  }`}
                />
                {form.confirmAccount && form.confirmAccount !== form.accountNumber && (
                  <p className="text-[10px] text-red-500 mt-1 font-semibold">Account numbers do not match</p>
                )}
              </Field>
              <Field label="IFSC Code">
                <input
                  value={form.ifsc}
                  onChange={e => set("ifsc", e.target.value.toUpperCase())}
                  placeholder="SBIN0001234"
                  className={`${inp} font-mono`}
                />
              </Field>
            </div>
          </SectionCard>

          {/* 5. Address */}
          <SectionCard title="Address" icon={MapPin}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Address Line 1">
                  <input
                    value={form.addressLine1}
                    onChange={e => set("addressLine1", e.target.value)}
                    placeholder="Shop No., Building, Street"
                    className={inp}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Address Line 2" hint="optional">
                  <input
                    value={form.addressLine2}
                    onChange={e => set("addressLine2", e.target.value)}
                    placeholder="Area, Locality"
                    className={inp}
                  />
                </Field>
              </div>
              <Field label="City">
                <input
                  value={form.city}
                  onChange={e => set("city", e.target.value)}
                  placeholder="Mumbai"
                  className={inp}
                />
              </Field>
              <Field label="State">
                <select value={form.state} onChange={e => set("state", e.target.value)} className={sel}>
                  <option value="">— Select state —</option>
                  {["Maharashtra","Delhi","Karnataka","Tamil Nadu","Telangana","Gujarat","Rajasthan","West Bengal","Uttar Pradesh","Punjab","Kerala","Other"].map(s =>
                    <option key={s}>{s}</option>
                  )}
                </select>
              </Field>
              <Field label="Pincode">
                <input
                  value={form.pincode}
                  onChange={e => set("pincode", e.target.value)}
                  placeholder="400001"
                  className={`${inp} font-mono`}
                  maxLength={6}
                />
              </Field>
            </div>
          </SectionCard>

          {/* 6. Settings */}
          <SectionCard title="Account Settings" icon={Settings2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Commission Rate (%)">
                <input
                  type="number"
                  value={form.commissionRate}
                  onChange={e => set("commissionRate", e.target.value)}
                  placeholder="10"
                  className={inp}
                  min={0}
                  max={100}
                />
              </Field>
              <Field label="Seller Status">
                <select value={form.sellerStatus} onChange={e => set("sellerStatus", e.target.value)} className={sel}>
                  {["Active","Pending Verification","Suspended"].map(s =>
                    <option key={s}>{s}</option>
                  )}
                </select>
              </Field>
            </div>
            <div className="space-y-3 pt-1">
              {([
                { label: "Auto Approve Products", sub: "Automatically approve new product listings", key: "autoApprove" as const },
                { label: "Featured Seller",       sub: "Highlight this seller on the storefront",   key: "featuredSeller" as const },
                { label: "Allow Cash on Delivery",sub: "Enable COD payment method for this seller", key: "allowCOD" as const },
                { label: "Send Welcome Email",    sub: "Email seller with login and onboarding info",key: "sendWelcomeEmail" as const },
              ] as const).map(item => (
                <div key={item.key} className="flex items-center justify-between py-0.5">
                  <div>
                    <p className="text-xs font-bold text-gray-700">{item.label}</p>
                    <p className="text-[10px] text-gray-400">{item.sub}</p>
                  </div>
                  <Toggle checked={form[item.key] as boolean} onChange={() => set(item.key, !form[item.key] as any)} />
                </div>
              ))}
            </div>
          </SectionCard>

        </div>

        {/* ── RIGHT (1/3) ──────────────────────────────────── */}
        <div className="w-full lg:w-80 shrink-0 space-y-4 lg:sticky lg:top-4">

          {/* Review & Submit card */}
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100" style={{ background: "#fafafa" }}>
              <ShieldCheck size={14} className="text-gray-400" />
              <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Review & Submit</span>
            </div>
            <div className="p-5 space-y-5">

              {/* Avatar + name preview */}
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0 select-none shadow-sm"
                  style={{ background: form.businessName.trim() ? G : "#d1d5db" }}
                >
                  {avatarLetter}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">
                    {form.businessName.trim() || <span className="text-gray-400 font-normal italic">Business name…</span>}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                    {form.storeName.trim() || "Store name…"}
                  </p>
                  {form.sellerStatus && (
                    <span
                      className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: `${statusColor}15`, color: statusColor }}
                    >
                      {form.sellerStatus}
                    </span>
                  )}
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-2 text-[11px]">
                {[
                  { label: "Owner",    value: form.ownerName },
                  { label: "Email",    value: form.email },
                  { label: "Category", value: form.businessCategory },
                  { label: "State",    value: form.state },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between gap-2">
                    <span className="text-gray-400 font-semibold">{row.label}</span>
                    <span className="text-gray-700 font-bold truncate max-w-[140px] text-right">
                      {row.value || <span className="text-gray-300 font-normal italic">—</span>}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100" />

              {/* Required fields checklist */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
                  Required Fields ({filledCount}/{requiredFields.length})
                </p>
                <div className="space-y-2">
                  {requiredFields.map(f => (
                    <div key={f.label} className="flex items-center gap-2">
                      <RequiredDot filled={f.filled} />
                      <span className={`text-xs font-semibold ${f.filled ? "text-gray-700" : "text-gray-400"}`}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-gray-400">Completion</span>
                  <span className="text-[10px] font-black" style={{ color: G }}>
                    {Math.round((filledCount / requiredFields.length) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: G }}
                    animate={{ width: `${(filledCount / requiredFields.length) * 100}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 24 }}
                  />
                </div>
              </div>

              {/* Submit button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white transition-all shadow-sm hover:shadow-md"
                style={{ background: G }}
              >
                <Users size={15} />
                Register Seller
              </motion.button>
              <p className="text-[10px] text-center text-gray-400">
                All required fields must be filled before submitting
              </p>
            </div>
          </div>

          {/* Commission quick info */}
          <div className={`${card} p-4 flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-black"
              style={{ background: `${G}15`, color: G }}>
              %
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">{form.commissionRate || "—"}%</p>
              <p className="text-[10px] text-gray-400 font-semibold">Commission Rate</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Success Modal ─────────────────────────────────── */}
      <Modal open={showSuccess} onClose={() => setShowSuccess(false)} title="Seller Registered">
        <div className="text-center space-y-5 py-2">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
            className="flex items-center justify-center"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: `${G}15` }}>
              <CheckCircle2 size={44} style={{ color: G }} />
            </div>
          </motion.div>

          <div>
            <motion.p
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="text-base font-black text-gray-900"
            >
              {form.businessName.trim() || "Seller"} registered!
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              className="text-xs text-gray-400 mt-1.5 leading-relaxed"
            >
              Seller account created and verification email sent.
            </motion.p>
          </div>

          {/* Quick details pill row */}
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {[
              form.businessCategory && form.businessCategory,
              form.state && form.state,
              form.sellerStatus,
            ].filter(Boolean).map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                style={{ background: `${G}12`, color: G }}>
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
            className="flex gap-3 pt-1"
          >
            <button
              onClick={resetForm}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Add Another Seller
            </button>
            <button
              onClick={() => setShowSuccess(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
              style={{ background: G }}
            >
              View Seller List
            </button>
          </motion.div>
        </div>
      </Modal>
    </div>
  );
}

export default AddSellerPage;
