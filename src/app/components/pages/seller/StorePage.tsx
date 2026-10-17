import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, Globe, Instagram, Facebook, Eye, EyeOff,
  Store, Truck, RotateCcw, ShieldCheck, AlertTriangle, X,
} from "lucide-react";
import { S, card, inp } from "./shared/constants";

type StoreTab = "profile" | "policies" | "settings";

/* ─── Shared ─────────────────────────────────────────────────────────────── */
function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className={`${card} p-6`}>
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-600 mb-1.5">{children}</label>;
}

function SaveBtn({ label = "Save Changes" }: { label?: string }) {
  return (
    <button
      className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
      style={{ background: S }}
    >
      {label}
    </button>
  );
}

/* ─── Toggle ─────────────────────────────────────────────────────────────── */
function Toggle({
  label, sub, checked, onChange,
}: {
  label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ml-4"
        style={{ background: checked ? S : "#d1d5db", height: 22, width: 40 }}
        role="switch"
        aria-checked={checked}
      >
        <span
          className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: checked ? "translateX(18px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

/* ─── Confirm dialog ─────────────────────────────────────────────────────── */
function ConfirmDialog({
  open, title, body, confirmLabel, confirmColor, onConfirm, onCancel,
}: {
  open: boolean; title: string; body: string; confirmLabel: string; confirmColor: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`${card} p-6 w-full max-w-sm`}
          >
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-2">{body}</p>
            <div className="flex gap-3 mt-5">
              <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: confirmColor }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Profile tab ────────────────────────────────────────────────────────── */
function ProfileTab() {
  const [gstVisible, setGstVisible] = useState(true);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <SectionCard title="Store Branding" subtitle="Upload your store banner and logo">
        <Label>Store Banner (4:1 ratio recommended)</Label>
        <div className="w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors" style={{ aspectRatio: "4 / 1", minHeight: 96 }}>
          <Upload size={20} className="text-gray-400" />
          <p className="text-xs text-gray-400">Click to upload banner (1200×300 px)</p>
        </div>

        <div className="mt-5 flex items-start gap-5">
          <div>
            <Label>Store Logo</Label>
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
              <Upload size={16} className="text-gray-400" />
              <span className="text-[10px] text-gray-400 mt-1">Upload</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <Label>Store Name</Label>
              <input defaultValue="Ravi Electro Hub" className={inp} />
            </div>
            <div>
              <Label>Store Tagline</Label>
              <input defaultValue="India's best electronics deals" className={inp} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Details */}
      <SectionCard title="Store Details">
        <div className="space-y-4">
          <div>
            <Label>Store Description</Label>
            <textarea
              className={`${inp} resize-none`}
              rows={3}
              defaultValue="Welcome to Ravi Electro Hub — your trusted destination for genuine electronics. We offer the best deals on smartphones, laptops, audio devices and accessories with fast delivery across India."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Business Category</Label>
              <select className={inp}>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home & Living</option>
              </select>
            </div>
            <div>
              <Label>Contact Email</Label>
              <input defaultValue="ravi@electrohub.in" type="email" className={inp} />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <input defaultValue="+91 98765 43210" type="tel" className={inp} />
            </div>
            <div>
              <Label>WhatsApp Business</Label>
              <input defaultValue="+91 98765 43210" type="tel" className={inp} />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Address */}
      <SectionCard title="Store Address">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <Label>Address Line</Label>
            <input defaultValue="Shop 14, Electronics Market, MG Road" className={inp} />
          </div>
          <div>
            <Label>City</Label>
            <input defaultValue="Bengaluru" className={inp} />
          </div>
          <div>
            <Label>State</Label>
            <input defaultValue="Karnataka" className={inp} />
          </div>
          <div>
            <Label>Pincode</Label>
            <input defaultValue="560001" className={inp} />
          </div>
        </div>
      </SectionCard>

      {/* Social */}
      <SectionCard title="Social Links">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Globe size={16} className="text-gray-400 flex-shrink-0" />
            <input defaultValue="https://ravelectrohub.in" className={inp} placeholder="Website URL" />
          </div>
          <div className="flex items-center gap-3">
            <Instagram size={16} className="text-gray-400 flex-shrink-0" />
            <input defaultValue="@ravi_electro_hub" className={inp} placeholder="Instagram handle" />
          </div>
          <div className="flex items-center gap-3">
            <Facebook size={16} className="text-gray-400 flex-shrink-0" />
            <input defaultValue="RaviElectroHub" className={inp} placeholder="Facebook page name" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-800">Show GST Number on Storefront</p>
            <p className="text-xs text-gray-400">Visible to customers</p>
          </div>
          <button
            onClick={() => setGstVisible(!gstVisible)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {gstVisible ? <Eye size={13} /> : <EyeOff size={13} />}
            {gstVisible ? "Visible" : "Hidden"}
          </button>
        </div>
      </SectionCard>

      {/* URL preview */}
      <div className={`${card} px-5 py-4 flex items-center gap-3`}>
        <Store size={16} className="text-gray-400 flex-shrink-0" />
        <div>
          <p className="text-xs text-gray-400">Your store URL</p>
          <p className="text-sm font-semibold text-indigo-600">bharatbazar.com/store/ravi-electro-hub</p>
        </div>
      </div>

      <SaveBtn />
    </div>
  );
}

/* ─── Policies tab ───────────────────────────────────────────────────────── */
const POLICIES = [
  {
    title: "Return Policy",
    icon: RotateCcw,
    default:
      "We accept returns within 7 days of delivery for all electronics. Items must be in original packaging with all accessories and bills included. Damaged or used items will not be accepted. To initiate a return, contact our support within the return window.",
  },
  {
    title: "Shipping Policy",
    icon: Truck,
    default:
      "We ship all orders within 24 hours of confirmation. Free shipping on orders above ₹999. Standard delivery: 3-5 business days. Express delivery available for select pincodes. We currently ship across all major cities and towns in India.",
  },
  {
    title: "Cancellation Policy",
    icon: X,
    default:
      "Orders can be cancelled within 2 hours of placing. Once dispatched, cancellation is not possible. For prepaid orders, refunds will be processed within 5-7 business days to the original payment method.",
  },
  {
    title: "Warranty Policy",
    icon: ShieldCheck,
    default:
      "All electronics come with manufacturer warranty as specified on the product page. We provide genuine products with valid warranty cards. For warranty claims, please retain the purchase invoice. Contact us for assisted warranty support.",
  },
];

function PoliciesTab() {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(POLICIES.map((p) => [p.title, p.default])),
  );

  return (
    <div className="space-y-5">
      {POLICIES.map((p) => (
        <SectionCard key={p.title} title={p.title}>
          <textarea
            className={`${inp} resize-none`}
            rows={5}
            value={values[p.title]}
            onChange={(e) => setValues((prev) => ({ ...prev, [p.title]: e.target.value }))}
          />
          <SaveBtn label="Save Policy" />
        </SectionCard>
      ))}
    </div>
  );
}

/* ─── Settings tab ───────────────────────────────────────────────────────── */
type TogglesState = Record<string, boolean>;

const SETTINGS_SECTIONS = [
  {
    title: "Order Settings",
    toggles: [
      { id: "autoAccept",    label: "Auto-accept orders",       sub: "Automatically confirm new orders" },
      { id: "cod",           label: "Cash on Delivery (COD)",   sub: "Enable COD payment option" },
      { id: "intlShipping",  label: "International Shipping",   sub: "Ship to international addresses" },
      { id: "orderEmailNot", label: "Order notification email", sub: "Get email for every new order"   },
    ],
  },
  {
    title: "Display Settings",
    toggles: [
      { id: "showStock",    label: "Show stock count",      sub: "Show remaining inventory to customers" },
      { id: "showSold",     label: "Show sold count",       sub: "Display how many units were sold"      },
      { id: "featuredProd", label: "Featured products",     sub: "Highlight top products on store page"  },
      { id: "showReviews",  label: "Customer reviews visible", sub: "Show reviews on product pages"     },
    ],
  },
  {
    title: "Notification Settings",
    toggles: [
      { id: "emailNewOrder",   label: "Email — New order",        sub: "" },
      { id: "emailLowStock",   label: "Email — Low stock alert",  sub: "" },
      { id: "emailPayout",     label: "Email — Payout received",  sub: "" },
      { id: "smsNewOrder",     label: "SMS — New order",          sub: "" },
      { id: "smsLowStock",     label: "SMS — Low stock alert",    sub: "" },
      { id: "waNewOrder",      label: "WhatsApp — New order",     sub: "" },
      { id: "waReview",        label: "WhatsApp — New review",    sub: "" },
    ],
  },
  {
    title: "Account Settings",
    toggles: [
      { id: "twoFactor",    label: "Two-factor authentication", sub: "Require OTP on every login" },
      { id: "loginAlert",   label: "Login notification",        sub: "Email alert on new login"   },
    ],
  },
];

function SettingsTab() {
  const defaults: TogglesState = {
    autoAccept: true, cod: true, intlShipping: false, orderEmailNot: true,
    showStock: true, showSold: false, featuredProd: true, showReviews: true,
    emailNewOrder: true, emailLowStock: true, emailPayout: true,
    smsNewOrder: false, smsLowStock: false,
    waNewOrder: true, waReview: false,
    twoFactor: false, loginAlert: true,
  };
  const [toggles, setToggles] = useState<TogglesState>(defaults);
  const [dialog, setDialog] = useState<"deactivate" | "delete" | null>(null);

  const set = (id: string, v: boolean) => setToggles((prev) => ({ ...prev, [id]: v }));

  return (
    <div className="space-y-5">
      {SETTINGS_SECTIONS.map((sec) => (
        <SectionCard key={sec.title} title={sec.title}>
          {sec.toggles.map((t) => (
            <Toggle key={t.id} label={t.label} sub={t.sub || undefined} checked={toggles[t.id] ?? false} onChange={(v) => set(t.id, v)} />
          ))}
        </SectionCard>
      ))}

      {/* Danger zone */}
      <div className={`${card} p-6 border-red-100`}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-red-500" />
          <h3 className="text-sm font-semibold text-red-600">Danger Zone</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setDialog("deactivate")}
            className="px-4 py-2.5 rounded-xl border border-red-300 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Deactivate Store
          </button>
          <button
            onClick={() => setDialog("delete")}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={dialog === "deactivate"}
        title="Deactivate Store?"
        body="Your store will be hidden from customers. Existing orders will still be processed. You can reactivate at any time."
        confirmLabel="Deactivate"
        confirmColor="#f59e0b"
        onConfirm={() => setDialog(null)}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        title="Delete Account?"
        body="This action is permanent and cannot be undone. All your store data, product listings, and history will be deleted."
        confirmLabel="Delete Permanently"
        confirmColor="#ef4444"
        onConfirm={() => setDialog(null)}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export function SellerStorePage({ tab }: { tab: StoreTab }) {
  const [activeTab, setActiveTab] = useState<StoreTab>(tab);

  const tabs: { key: StoreTab; label: string }[] = [
    { key: "profile",  label: "Store Profile" },
    { key: "policies", label: "Policies"      },
    { key: "settings", label: "Settings"      },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your store profile, policies and settings</p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl border border-gray-200 bg-white w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                activeTab === t.key
                  ? { background: S, color: "#fff", boxShadow: "0 1px 4px rgba(99,102,241,0.3)" }
                  : { color: "#6b7280" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "profile"  && <ProfileTab />}
          {activeTab === "policies" && <PoliciesTab />}
          {activeTab === "settings" && <SettingsTab />}
        </motion.div>
      </div>
    </div>
  );
}
