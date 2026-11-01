import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard, MessageSquare, Store, Smartphone, Users, ShieldCheck,
  FileText, Truck, MessageCircle, MapPinOff, Megaphone,
  Printer, Bot, Settings, ChevronRight, Filter,
  Check, X, Plus, Trash2, Edit2, Eye, EyeOff, Copy,
  Globe, Phone, Mail, IndianRupee, Lock, Bell,
  ToggleLeft, ToggleRight, AlertTriangle, Upload,
  Image as ImageIcon, ExternalLink, RefreshCw, CheckCircle2,
  Database, Sparkles, ChevronDown, ChevronUp,
} from "lucide-react";
import { Toggle, Field, Modal, DeleteConfirm, StatCard, SectionCard } from "./shared/ui";
import { G, inp, card } from "./shared/constants";

// ─── Side-nav definition ──────────────────────────────────────────────────────

type SettingTab = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  desc: string;
};

const SETTING_TABS: SettingTab[] = [
  { id: "payment",        label: "Payment List",            icon: CreditCard,    color: "#009966", desc: "Payment gateways, methods and transaction settings"   },
  { id: "sms",            label: "SMS Gateway",             icon: MessageSquare, color: "#3b82f6", desc: "SMS provider config, OTP and notification templates"  },
  { id: "store",          label: "Store Setting",           icon: Store,         color: "#f59e0b", desc: "Store name, address, currency, timezone and branding" },
  { id: "app",            label: "App Setting",             icon: Smartphone,    color: "#8b5cf6", desc: "Mobile app config, splash screen, force update"       },
  { id: "system-users",   label: "System User",             icon: Users,         color: "#6366f1", desc: "Admin accounts and access permissions"                },
  { id: "roles",          label: "Manage Roles",            icon: ShieldCheck,   color: "#ec4899", desc: "Role definitions, permissions and access matrix"      },
  { id: "customer-policy",label: "Customer App Policy",     icon: FileText,      color: "#0d9488", desc: "Terms, privacy policy and refund policy for customers"},
  { id: "delivery-policy",label: "Delivery App Policy",     icon: Truck,         color: "#f97316", desc: "Delivery partner terms, pay rules and conduct policy" },
  { id: "wa-feedback",    label: "WhatsApp Feedback",       icon: MessageCircle, color: "#25d366", desc: "Auto-send feedback requests via WhatsApp after delivery"},
  { id: "oos-locations",  label: "Out-of-Service Locations",icon: MapPinOff,     color: "#ef4444", desc: "Block delivery to specific pincodes or zones"         },
  { id: "wa-marketing",   label: "WhatsApp Marketing",      icon: Megaphone,     color: "#7c3aed", desc: "Broadcast promotions and campaigns via WhatsApp"      },
  { id: "thermal-print",  label: "Print Orders (Thermal)",  icon: Printer,       color: "#64748b", desc: "Thermal printer config, label format and paper size"  },
  { id: "wa-orders",      label: "Whatsapp Orders",         icon: Bot,           color: "#059669", desc: "Accept and manage orders via WhatsApp chatbot"        },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SaveBar({ onSave, onDiscard }: { onSave: () => void; onDiscard: () => void }) {
  const [saved, setSaved] = useState(false);
  const handle = () => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
      <button onClick={onDiscard} className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">Discard</button>
      <button onClick={handle} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all" style={{ background: saved ? "#10b981" : G }}>
        {saved ? <><Check size={13}/> Saved!</> : "Save Changes"}
      </button>
    </div>
  );
}

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-black text-gray-900">{title}</h3>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
  );
}

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        {hint && <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── Individual sub-pages ─────────────────────────────────────────────────────

type PaymentMethod = { id: number; name: string; provider: string; type: string; enabled: boolean; live: boolean; color: string };

function PaymentListPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: 1, name: "Razorpay",        provider: "Razorpay",   type: "Gateway",  enabled: true,  live: true,  color: "#3395FF" },
    { id: 2, name: "PhonePe",         provider: "PhonePe",    type: "UPI",      enabled: true,  live: true,  color: "#5f259f" },
    { id: 3, name: "Google Pay",      provider: "GPay",       type: "UPI",      enabled: true,  live: false, color: "#4285f4" },
    { id: 4, name: "Paytm",           provider: "Paytm",      type: "Wallet",   enabled: false, live: false, color: "#00B9F1" },
    { id: 5, name: "Cash on Delivery",provider: "Manual",     type: "Offline",  enabled: true,  live: true,  color: "#10b981" },
    { id: 6, name: "Net Banking",     provider: "Razorpay",   type: "Banking",  enabled: true,  live: true,  color: "#6366f1" },
    { id: 7, name: "Stripe",          provider: "Stripe",     type: "Card",     enabled: false, live: false, color: "#635bff" },
    { id: 8, name: "BharatPe",        provider: "BharatPe",   type: "QR/UPI",   enabled: false, live: false, color: "#FF6600" },
  ]);
  const toggle = (id: number, field: "enabled" | "live") => setMethods(p => p.map(m => m.id === id ? { ...m, [field]: !m[field as keyof PaymentMethod] } : m));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Methods" val={methods.length}                          color={G}        icon={CreditCard}/>
        <StatCard label="Active"        val={methods.filter(m => m.enabled).length}   color="#10b981"  icon={Check}     />
        <StatCard label="Live"          val={methods.filter(m => m.live).length}      color="#3b82f6"  icon={Globe}     />
        <StatCard label="Disabled"      val={methods.filter(m => !m.enabled).length}  color="#9ca3af"  icon={X}         />
      </div>

      <div className="space-y-2">
        {methods.map(m => (
          <div key={m.id} className={`${card} p-4 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-[10px] font-black"
              style={{ background: m.color }}>{m.name.slice(0,2).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{m.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-400">{m.provider}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"/>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: "#f3f4f6", color: "#6b7280" }}>{m.type}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center">
                <p className="text-[9px] font-black text-gray-400 mb-1">LIVE</p>
                <Toggle checked={m.live} onChange={() => toggle(m.id, "live")}/>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-gray-400 mb-1">ENABLED</p>
                <Toggle checked={m.enabled} onChange={() => toggle(m.id, "enabled")}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SmsGatewayPage() {
  const [provider, setProvider] = useState("Twilio");
  const [apiKey, setApiKey]     = useState("SK_live_••••••••••••4a2f");
  const [from, setFrom]         = useState("+91 9999000001");
  const [showKey, setShowKey]   = useState(false);
  const [templates, setTemplates] = useState([
    { id: 1, name: "OTP Login",       template: "Your BharatBazar OTP is {{otp}}. Valid for 10 min.",    active: true  },
    { id: 2, name: "Order Placed",    template: "Hi {{name}}, your order #{{id}} is confirmed!",          active: true  },
    { id: 3, name: "Order Shipped",   template: "Your order #{{id}} has been shipped. Track: {{link}}",   active: true  },
    { id: 4, name: "Delivery Done",   template: "Order #{{id}} delivered. Rate your experience: {{link}}",active: true  },
    { id: 5, name: "Order Cancelled", template: "Your order #{{id}} has been cancelled. Refund in 3–5 days.",active: false },
  ]);
  const toggleTpl = (id: number) => setTemplates(p => p.map(t => t.id === id ? { ...t, active: !t.active } : t));

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionTitle title="Gateway Configuration" desc="Connect your SMS provider for OTPs and notifications"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Provider">
            <select value={provider} onChange={e => setProvider(e.target.value)} className={inp}>
              {["Twilio","MSG91","AWS SNS","TextLocal","Fast2SMS","Kaleyra"].map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Sender ID / From Number">
            <input value={from} onChange={e => setFrom(e.target.value)} className={inp}/>
          </Field>
          <div className="sm:col-span-2">
            <Field label="API Key / Auth Token">
              <div className="relative">
                <input type={showKey ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} className={`${inp} pr-10`}/>
                <button onClick={() => setShowKey(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showKey ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </Field>
          </div>
        </div>
        <SaveBar onSave={() => {}} onDiscard={() => {}}/>
      </SectionCard>

      <SectionCard>
        <SectionTitle title="Message Templates" desc="Toggle or edit SMS templates sent to customers"/>
        <div className="space-y-2.5">
          {templates.map(t => (
            <div key={t.id} className="rounded-xl border border-gray-200 p-3.5 flex items-start gap-3">
              <Toggle checked={t.active} onChange={() => toggleTpl(t.id)}/>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-800">{t.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 font-mono leading-relaxed">{t.template}</p>
              </div>
              <button className="text-gray-400 hover:text-blue-500 transition-colors shrink-0 mt-0.5"><Edit2 size={13}/></button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── StoreSettingPage – Neon DB CRUD ─────────────────────────────────────────

type StoreSettingMeta = {
  key: string;
  value: string;
  type: string;
  label: string;
  section: string;
  description: string;
  updated_at: string;
};

type StoreValues = Record<string, string>;

const SECTION_ORDER = ["identity", "locale", "delivery", "features"] as const;
const SECTION_LABELS: Record<string, string> = {
  identity: "Store Identity",
  locale:   "Locale & Currency",
  delivery: "Delivery Charges",
  features: "Feature Toggles",
};
const SECTION_DESCS: Record<string, string> = {
  identity: "Name, contact info, GST and branding assets",
  locale:   "Currency, timezone and language preferences",
  delivery: "Minimum order and delivery fee thresholds",
  features: "Enable or disable key store behaviours",
};

const CURRENCY_OPTIONS  = ["INR","USD","EUR","GBP","AED"];
const TIMEZONE_OPTIONS  = ["Asia/Kolkata","Asia/Dubai","Asia/Singapore","UTC","America/New_York"];
const LANGUAGE_OPTIONS  = ["English (India)","Hindi","Tamil","Telugu","Kannada","Malayalam"];

function selectOptionsFor(key: string): string[] {
  if (key === "currency") return CURRENCY_OPTIONS;
  if (key === "timezone") return TIMEZONE_OPTIONS;
  if (key === "language") return LANGUAGE_OPTIONS;
  return [];
}

// ─── Store Logo & Favicon Side Section ────────────────────────────────────────

type StoreAssetsProps = {
  storeName: string;
  logoUrl: string;
  faviconUrl: string;
  onAssetUpdated: (type: "logo" | "favicon", url: string) => void;
  onAssetDeleted: (type: "logo" | "favicon") => void;
};

function StoreAssetsSideSection({
  storeName,
  logoUrl,
  faviconUrl,
  onAssetUpdated,
  onAssetDeleted,
}: StoreAssetsProps) {
  const [uploadingType, setUploadingType] = useState<"logo" | "favicon" | null>(null);
  const [deletingType,  setDeletingType]  = useState<"logo" | "favicon" | null>(null);
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null);
  const [successMsg,    setSuccessMsg]    = useState<string | null>(null);
  const [copiedKey,     setCopiedKey]     = useState<string | null>(null);
  const [logoTheme,     setLogoTheme]     = useState<"checker" | "light" | "dark">("checker");
  const [showManual,    setShowManual]    = useState(false);
  const [manualLogo,    setManualLogo]    = useState(logoUrl);
  const [manualFavicon, setManualFavicon] = useState(faviconUrl);
  const [savingManual,  setSavingManual]  = useState(false);

  useEffect(() => { setManualLogo(logoUrl); }, [logoUrl]);
  useEffect(() => { setManualFavicon(faviconUrl); }, [faviconUrl]);

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg(null);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const notifyError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg(null);
  };

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    const fullUrl = text.startsWith("http") ? text : `${window.location.origin}${text}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleFileUpload = async (type: "logo" | "favicon", file: File) => {
    if (!file) return;

    const maxSize = type === "favicon" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      notifyError(`${type === "favicon" ? "Favicon" : "Logo"} size must be under ${type === "favicon" ? "2MB" : "5MB"}.`);
      return;
    }

    try {
      setUploadingType(type);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append("type", type);
      formData.append("file", file);

      const res = await fetch("/api/admin/store-settings/assets", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        notifyError(data.message || `Failed to upload ${type}.`);
        return;
      }

      onAssetUpdated(type, data.url);
      notifySuccess(`${type === "logo" ? "Store Logo" : "Favicon"} uploaded to 'store-logo' bucket!`);
    } catch (e) {
      console.error(e);
      notifyError("Network error while uploading asset.");
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = async (type: "logo" | "favicon") => {
    try {
      setDeletingType(type);
      setErrorMsg(null);

      const res = await fetch(`/api/admin/store-settings/assets?type=${type}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        notifyError(data.message || `Failed to remove ${type}.`);
        return;
      }

      onAssetDeleted(type);
      notifySuccess(`${type === "logo" ? "Store Logo" : "Favicon"} removed from 'store-logo' bucket.`);
    } catch (e) {
      console.error(e);
      notifyError("Network error while deleting asset.");
    } finally {
      setDeletingType(null);
    }
  };

  const handleSaveManualUrls = async () => {
    setSavingManual(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo_url: manualLogo.trim(),
          favicon_url: manualFavicon.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onAssetUpdated("logo", manualLogo.trim());
        onAssetUpdated("favicon", manualFavicon.trim());
        notifySuccess("Custom branding URLs saved!");
      } else {
        notifyError(data.message || "Failed to update URLs.");
      }
    } catch {
      notifyError("Network error saving URLs.");
    } finally {
      setSavingManual(false);
    }
  };

  const checkerboardStyle = {
    backgroundImage: `
      linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
      linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
      linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)
    `,
    backgroundSize: "16px 16px",
    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
  };

  return (
    <div className="space-y-5">
      {/* ── HEADER CARD ── */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-emerald-50/30 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-100/70">
              <ImageIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 leading-tight">Favicon & Logo</h3>
              <p className="text-[11px] text-gray-400">Store branding assets</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bucket:</span>
            <span className="font-mono text-emerald-800 font-extrabold">store-logo</span>
          </div>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
              <span className="truncate">{successMsg}</span>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2"
            >
              <AlertTriangle size={14} className="shrink-0 text-red-500" />
              <span className="truncate">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── STORE LOGO CARD ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Store Logo</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-50 text-amber-700 border border-amber-200/60">Main</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">App header, invoices & emails</p>
          </div>
          {/* Contrast Preview Toggles */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-600">
            <button
              onClick={() => setLogoTheme("checker")}
              className={`px-1.5 py-0.5 rounded-md transition-all ${logoTheme === "checker" ? "bg-white shadow-xs text-gray-900" : "hover:text-gray-900"}`}
              title="Checkerboard (Transparency)"
            >
              Grid
            </button>
            <button
              onClick={() => setLogoTheme("light")}
              className={`px-1.5 py-0.5 rounded-md transition-all ${logoTheme === "light" ? "bg-white shadow-xs text-gray-900" : "hover:text-gray-900"}`}
              title="Light background"
            >
              Light
            </button>
            <button
              onClick={() => setLogoTheme("dark")}
              className={`px-1.5 py-0.5 rounded-md transition-all ${logoTheme === "dark" ? "bg-gray-800 text-white shadow-xs" : "hover:text-gray-900"}`}
              title="Dark background"
            >
              Dark
            </button>
          </div>
        </div>

        {/* Visual Preview Box */}
        <div
          className={`relative rounded-xl border border-gray-200 min-h-[110px] flex items-center justify-center p-3 overflow-hidden transition-colors ${
            logoTheme === "dark" ? "bg-slate-900" : logoTheme === "light" ? "bg-white" : ""
          }`}
          style={logoTheme === "checker" ? checkerboardStyle : {}}
        >
          {logoUrl ? (
            <div className="flex flex-col items-center gap-2">
              <img
                src={logoUrl}
                alt={storeName || "Store Logo"}
                className="max-h-20 max-w-full object-contain drop-shadow-xs transition-transform hover:scale-105 duration-200"
              />
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400 mb-1.5">
                <Store size={20} />
              </div>
              <p className="text-[11px] font-bold text-gray-600">{storeName || "BharatBazar"}</p>
              <p className="text-[10px] text-gray-400">No logo uploaded yet</p>
            </div>
          )}

          {/* Quick open in new tab */}
          {logoUrl && (
            <a
              href={logoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 p-1 rounded-md bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 shadow-xs transition-all"
              title="Open full image"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Actions Bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                className="hidden"
                disabled={uploadingType === "logo"}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload("logo", file);
                  e.target.value = "";
                }}
              />
              <div
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs hover:opacity-95 text-center"
                style={{ background: G }}
              >
                {uploadingType === "logo" ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Uploading to bucket...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>{logoUrl ? "Replace Logo" : "Upload Logo"}</span>
                  </>
                )}
              </div>
            </label>

            {logoUrl && (
              <>
                <button
                  type="button"
                  onClick={() => handleCopy(logoUrl, "logo")}
                  className="px-2.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-all flex items-center gap-1"
                  title="Copy logo URL"
                >
                  {copiedKey === "logo" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
                <button
                  type="button"
                  disabled={deletingType === "logo"}
                  onClick={() => handleDelete("logo")}
                  className="px-2.5 py-2 rounded-xl border border-red-100 bg-red-50/60 text-red-600 hover:bg-red-100 text-xs font-bold transition-all flex items-center gap-1"
                  title="Delete from bucket"
                >
                  {deletingType === "logo" ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-0.5">
            <span>Formats: PNG, SVG, WebP, JPG</span>
            <span>Max 5 MB · 512×512 or 240×60</span>
          </div>
        </div>
      </div>

      {/* ── STORE FAVICON CARD ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-gray-800 uppercase tracking-wider">Store Favicon</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200/60">Browser Icon</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Tab icon in Chrome, Safari & Edge</p>
          </div>
        </div>

        {/* Realistic Browser Tab Simulation */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shadow-xs">
          {/* Mock Browser Header Bar */}
          <div className="bg-gray-200/80 px-2.5 py-1.5 flex items-center gap-2 border-b border-gray-200">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            {/* Active Browser Tab */}
            <div className="flex-1 max-w-[190px] bg-white rounded-t-md px-2 py-1 flex items-center gap-1.5 shadow-2xs border-t border-x border-gray-200/80">
              {faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt="Favicon"
                  className="w-3.5 h-3.5 object-contain rounded-xs shrink-0"
                />
              ) : (
                <Globe size={13} className="text-gray-400 shrink-0" />
              )}
              <span className="text-[10px] font-bold text-gray-800 truncate">
                {storeName || "BharatBazar"}
              </span>
              <X size={10} className="text-gray-400 ml-auto shrink-0" />
            </div>
          </div>

          {/* Mini Address Bar Preview */}
          <div className="bg-white px-2.5 py-1.5 flex items-center justify-between gap-2 text-[10px] text-gray-500">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Lock size={10} className="text-emerald-600" />
              <span className="font-mono text-gray-700">bharatbazar.com</span>
            </div>

            {/* Multi-resolution chip preview */}
            <div className="flex items-center gap-1 text-[9px] text-gray-400">
              <div className="w-5 h-5 rounded border border-gray-200 bg-gray-50 flex items-center justify-center" title="16x16 px preview">
                {faviconUrl ? <img src={faviconUrl} alt="" className="w-3 h-3 object-contain" /> : <Globe size={9}/>}
              </div>
              <div className="w-6 h-6 rounded border border-gray-200 bg-gray-50 flex items-center justify-center" title="32x32 px preview">
                {faviconUrl ? <img src={faviconUrl} alt="" className="w-4 h-4 object-contain" /> : <Globe size={11}/>}
              </div>
            </div>
          </div>
        </div>

        {/* Favicon Actions Bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/webp,image/jpeg,.ico"
                className="hidden"
                disabled={uploadingType === "favicon"}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload("favicon", file);
                  e.target.value = "";
                }}
              />
              <div
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs hover:opacity-95 text-center"
                style={{ background: "#2563eb" }}
              >
                {uploadingType === "favicon" ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Uploading to bucket...</span>
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    <span>{faviconUrl ? "Replace Favicon" : "Upload Favicon"}</span>
                  </>
                )}
              </div>
            </label>

            {faviconUrl && (
              <>
                <button
                  type="button"
                  onClick={() => handleCopy(faviconUrl, "favicon")}
                  className="px-2.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-all flex items-center gap-1"
                  title="Copy favicon URL"
                >
                  {copiedKey === "favicon" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                </button>
                <button
                  type="button"
                  disabled={deletingType === "favicon"}
                  onClick={() => handleDelete("favicon")}
                  className="px-2.5 py-2 rounded-xl border border-red-100 bg-red-50/60 text-red-600 hover:bg-red-100 text-xs font-bold transition-all flex items-center gap-1"
                  title="Delete from bucket"
                >
                  {deletingType === "favicon" ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-0.5">
            <span>Formats: ICO, PNG, SVG, WebP</span>
            <span>Max 2 MB · 32×32 or 64×64</span>
          </div>
        </div>
      </div>

      {/* ── ADVANCED / MANUAL URL DRAWER ── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-xs">
        <button
          type="button"
          onClick={() => setShowManual(v => !v)}
          className="w-full flex items-center justify-between text-left text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            <span>Advanced / Manual CDN URLs</span>
          </div>
          {showManual ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showManual && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 space-y-2.5 border-t border-gray-100 mt-2.5"
          >
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Logo URL (Bucket or CDN)
              </label>
              <input
                type="text"
                value={manualLogo}
                onChange={e => setManualLogo(e.target.value)}
                placeholder="/api/store-assets/logo or https://cdn..."
                className={`${inp} text-xs font-mono`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Favicon URL (Bucket or CDN)
              </label>
              <input
                type="text"
                value={manualFavicon}
                onChange={e => setManualFavicon(e.target.value)}
                placeholder="/api/store-assets/favicon or https://..."
                className={`${inp} text-xs font-mono`}
              />
            </div>
            <button
              type="button"
              disabled={savingManual}
              onClick={handleSaveManualUrls}
              className="w-full py-1.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-1.5"
            >
              {savingManual ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
              <span>Apply Manual URLs</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* ── BUCKET STORAGE INFO FOOTER ── */}
      <div className="p-3 rounded-2xl border border-gray-100 bg-gray-50/80 text-[11px] text-gray-500 space-y-1">
        <div className="flex items-center justify-between font-bold text-gray-700">
          <div className="flex items-center gap-1.5">
            <Database size={12} className="text-emerald-600" />
            <span>S3 Bucket Details</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full font-bold">
            Live Object Storage
          </span>
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          Assets uploaded here are streamed directly to the <span className="font-mono text-gray-700 font-bold">store-logo</span> bucket and delivered with public edge caching headers.
        </p>
      </div>
    </div>
  );
}


function StoreSettingPage() {
  const [meta,        setMeta]        = useState<StoreSettingMeta[]>([]);
  const [values,      setValues]      = useState<StoreValues>({});
  const [dirtyBySection, setDirtyBySection] = useState<Record<string, StoreValues>>({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection,  setSavedSection]  = useState<string | null>(null);
  const [saveError,   setSaveError]   = useState<string | null>(null);

  // ── Fetch all settings from Neon DB ────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/store-settings");
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to load store settings.");
        return;
      }
      setMeta(data.meta as StoreSettingMeta[]);
      setValues(data.settings as StoreValues);
      setDirtyBySection({});
    } catch (e) {
      setError("Network error while loading settings.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── Handle field change (marks section as dirty) ────────────────────────────
  const handleChange = (section: string, key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setDirtyBySection(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [key]: value },
    }));
  };

  // ── Save a section (PUT) ───────────────────────────────────────────────────
  const handleSaveSection = async (section: string) => {
    const dirty = dirtyBySection[section];
    if (!dirty || Object.keys(dirty).length === 0) return;

    setSavingSection(section);
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dirty),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveError(data.message || "Save failed.");
      } else {
        // Clear dirty state for this section
        setDirtyBySection(prev => {
          const next = { ...prev };
          delete next[section];
          return next;
        });
        setSavedSection(section);
        setTimeout(() => setSavedSection(null), 2500);
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSavingSection(null);
    }
  };

  // ── Discard changes for a section ─────────────────────────────────────────
  const handleDiscard = (section: string) => {
    const sectionMeta = meta.filter(m => m.section === section);
    const restored: StoreValues = {};
    for (const m of sectionMeta) restored[m.key] = m.value; // revert to last-saved DB value
    setValues(prev => ({ ...prev, ...restored }));
    setDirtyBySection(prev => {
      const next = { ...prev };
      delete next[section];
      return next;
    });
    setSaveError(null);
  };

  // ── Reset a single key to empty (DELETE) ──────────────────────────────────
  const handleReset = async (key: string) => {
    try {
      const res = await fetch(`/api/admin/store-settings?key=${encodeURIComponent(key)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setValues(prev => ({ ...prev, [key]: "" }));
        // Also update meta to reflect the reset
        setMeta(prev => prev.map(m => m.key === key ? { ...m, value: "" } : m));
      }
    } catch (e) {
      console.error("Reset failed:", e);
    }
  };

  // ── Render a single field based on type ───────────────────────────────────
  const renderField = (m: StoreSettingMeta) => {
    const val = values[m.key] ?? m.value;
    const onChange = (v: string) => handleChange(m.section, m.key, v);

    if (m.type === "boolean") {
      return (
        <SettingRow label={m.label} hint={m.description} key={m.key}>
          <Toggle checked={val === "true"} onChange={() => onChange(val === "true" ? "false" : "true")}/>
        </SettingRow>
      );
    }

    if (m.type === "select") {
      const opts = selectOptionsFor(m.key);
      return (
        <Field label={m.label} key={m.key}>
          <select value={val} onChange={e => onChange(e.target.value)} className={inp}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        </Field>
      );
    }

    if (m.type === "textarea") {
      return (
        <div className="sm:col-span-2" key={m.key}>
          <Field label={m.label}>
            <textarea value={val} onChange={e => onChange(e.target.value)} rows={2} className={`${inp} resize-none`}/>
          </Field>
        </div>
      );
    }

    const extraClass = m.key === "gst_number" ? " font-mono" : "";
    return (
      <Field label={m.label} key={m.key}>
        <div className="relative">
          <input
            type={m.type === "number" ? "number" : "text"}
            value={val}
            onChange={e => onChange(e.target.value)}
            className={`${inp}${extraClass} pr-7`}
          />
          {val && (
            <button
              onClick={() => handleReset(m.key)}
              title="Reset to empty"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400 transition-colors"
            >
              <X size={12}/>
            </button>
          )}
        </div>
      </Field>
    );
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse">
            <div className="h-4 w-40 bg-gray-100 rounded mb-4"/>
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4].map(j => <div key={j} className="h-10 bg-gray-100 rounded-xl"/>)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
        <AlertTriangle size={28} className="text-red-400 mx-auto mb-2"/>
        <p className="text-sm font-bold text-red-600">{error}</p>
        <button
          onClick={fetchSettings}
          className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Group meta by section ──────────────────────────────────────────────────
  const bySection = (section: string) => meta.filter(m => m.section === section);

  const SectionSaveBar = ({ section }: { section: string }) => {
    const isDirty  = Object.keys(dirtyBySection[section] || {}).length > 0;
    const isSaving = savingSection === section;
    const isSaved  = savedSection  === section;
    return (
      <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100 mt-6">
        <p className="text-[11px] text-gray-400">
          {isDirty ? (
            <span className="text-amber-500 font-bold">● Unsaved changes</span>
          ) : (
            <span className="text-gray-300">All changes saved to Neon DB</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          {saveError && section === savingSection && (
            <span className="text-xs text-red-500 font-bold">{saveError}</span>
          )}
          <button
            onClick={() => handleDiscard(section)}
            disabled={!isDirty || isSaving}
            className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all"
          >
            Discard
          </button>
          <button
            onClick={() => handleSaveSection(section)}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all"
            style={{ background: isSaved ? "#10b981" : G }}
          >
            {isSaving ? (
              <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Saving...</>
            ) : isSaved ? (
              <><Check size={13}/> Saved!</>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* DB status badge & S3 Bucket status badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
          Connected to Neon Database · {meta.length} settings loaded
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-xs font-bold text-amber-800">
          <Database size={13} className="text-amber-600"/>
          Bucket: <span className="font-mono text-amber-900 font-extrabold">store-logo</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* 2-Column Responsive Layout: Left 2 Cols = Settings Cards, Right 1 Col = Favicon & Logo Side Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left 2 columns: General Store Settings */}
        <div className="xl:col-span-2 space-y-6">
          {SECTION_ORDER.map(section => {
            const fields = bySection(section);
            // In identity section, exclude logo_url and favicon_url from raw text inputs
            const displayFields = section === "identity"
              ? fields.filter(f => f.key !== "logo_url" && f.key !== "favicon_url")
              : fields;
            if (displayFields.length === 0) return null;
            const boolFields = displayFields.filter(f => f.type === "boolean");
            const otherFields = displayFields.filter(f => f.type !== "boolean");

            return (
              <SectionCard key={section}>
                <SectionTitle title={SECTION_LABELS[section]} desc={SECTION_DESCS[section]}/>

                {/* Non-boolean fields in a grid */}
                {otherFields.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {otherFields.map(renderField)}
                  </div>
                )}

                {/* Boolean toggle rows */}
                {boolFields.length > 0 && (
                  <div className={otherFields.length > 0 ? "mt-4" : ""}>
                    {boolFields.map(renderField)}
                  </div>
                )}

                <SectionSaveBar section={section}/>
              </SectionCard>
            );
          })}
        </div>

        {/* Right 1 column: Favicon & Logo Side Section */}
        <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-4">
          <StoreAssetsSideSection
            storeName={values.store_name || "BharatBazar"}
            logoUrl={values.logo_url || ""}
            faviconUrl={values.favicon_url || ""}
            onAssetUpdated={(type, url) => {
              const key = type === "logo" ? "logo_url" : "favicon_url";
              setValues(prev => ({ ...prev, [key]: url }));
              setMeta(prev => prev.map(m => m.key === key ? { ...m, value: url } : m));
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("store-settings-updated"));
                try { localStorage.setItem("bb_store_settings_updated", String(Date.now())); } catch {}
              }
            }}
            onAssetDeleted={(type) => {
              const key = type === "logo" ? "logo_url" : "favicon_url";
              setValues(prev => ({ ...prev, [key]: "" }));
              setMeta(prev => prev.map(m => m.key === key ? { ...m, value: "" } : m));
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("store-settings-updated"));
                try { localStorage.setItem("bb_store_settings_updated", String(Date.now())); } catch {}
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}


function AppSettingPage() {
  const [cfg, setCfg] = useState({
    appName: "BharatBazar", bundleId: "com.bharatbazar.app",
    version: "3.2.1", buildNo: "421",
    iosUrl: "https://apps.apple.com/in/app/bharatbazar",
    androidUrl: "https://play.google.com/store/apps/bharatbazar",
    forceUpdate: false, maintenanceApp: false,
    notifications: true, locationRequired: true, darkMode: true,
    splashBg: "#009966", splashText: "BharatBazar",
    minAndroid: "8.0", minIOS: "14.0",
  });
  const s = (k: string, v: any) => setCfg(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionTitle title="App Identity"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="App Name"><input value={cfg.appName} onChange={e => s("appName", e.target.value)} className={inp}/></Field>
          <Field label="Bundle / Package ID"><input value={cfg.bundleId} onChange={e => s("bundleId", e.target.value)} className={`${inp} font-mono text-xs`}/></Field>
          <Field label="Version"><input value={cfg.version} onChange={e => s("version", e.target.value)} className={inp}/></Field>
          <Field label="Build Number"><input value={cfg.buildNo} onChange={e => s("buildNo", e.target.value)} className={inp}/></Field>
          <Field label="iOS Store URL"><input value={cfg.iosUrl} onChange={e => s("iosUrl", e.target.value)} className={`${inp} text-xs`}/></Field>
          <Field label="Android Store URL"><input value={cfg.androidUrl} onChange={e => s("androidUrl", e.target.value)} className={`${inp} text-xs`}/></Field>
        </div>
        <SaveBar onSave={() => {}} onDiscard={() => {}}/>
      </SectionCard>

      <SectionCard>
        <SectionTitle title="App Behaviour"/>
        <SettingRow label="Force Update" hint="Prompt users to update to the latest version on launch">
          <Toggle checked={cfg.forceUpdate} onChange={() => s("forceUpdate", !cfg.forceUpdate)}/>
        </SettingRow>
        <SettingRow label="App Maintenance Mode" hint="Show app maintenance screen to all mobile users">
          <Toggle checked={cfg.maintenanceApp} onChange={() => s("maintenanceApp", !cfg.maintenanceApp)}/>
        </SettingRow>
        <SettingRow label="Push Notifications" hint="Enable order and promotional push notifications">
          <Toggle checked={cfg.notifications} onChange={() => s("notifications", !cfg.notifications)}/>
        </SettingRow>
        <SettingRow label="Require Location" hint="App requires location permission for delivery slot selection">
          <Toggle checked={cfg.locationRequired} onChange={() => s("locationRequired", !cfg.locationRequired)}/>
        </SettingRow>
        <SettingRow label="Dark Mode Support" hint="Users can toggle dark mode within the app">
          <Toggle checked={cfg.darkMode} onChange={() => s("darkMode", !cfg.darkMode)}/>
        </SettingRow>
      </SectionCard>

      <SectionCard>
        <SectionTitle title="Splash Screen & Minimum OS"/>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
          <Field label="Splash Background">
            <div className="flex items-center gap-2">
              <input type="color" value={cfg.splashBg} onChange={e => s("splashBg", e.target.value)} className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"/>
              <input value={cfg.splashBg} onChange={e => s("splashBg", e.target.value)} className={`${inp} font-mono text-xs`}/>
            </div>
          </Field>
          <Field label="Splash Text"><input value={cfg.splashText} onChange={e => s("splashText", e.target.value)} className={inp}/></Field>
          <Field label="Min Android"><input value={cfg.minAndroid} onChange={e => s("minAndroid", e.target.value)} className={inp}/></Field>
          <Field label="Min iOS"><input value={cfg.minIOS} onChange={e => s("minIOS", e.target.value)} className={inp}/></Field>
        </div>
        {/* Live preview */}
        <div className="flex justify-center mt-4">
          <div className="w-24 h-40 rounded-2xl flex flex-col items-center justify-center shadow-xl border border-gray-100"
            style={{ background: `linear-gradient(135deg, ${cfg.splashBg}, ${cfg.splashBg}bb)` }}>
            <p className="text-white font-black text-sm">{cfg.splashText}</p>
            <p className="text-white/50 text-[8px] mt-0.5">v{cfg.version}</p>
          </div>
        </div>
        <SaveBar onSave={() => {}} onDiscard={() => {}}/>
      </SectionCard>
    </div>
  );
}

type SysUser = { id: number; name: string; email: string; role: string; status: "active" | "inactive"; lastSeen: string };
function SystemUserPage() {
  const [users, setUsers] = useState<SysUser[]>([
    { id: 1, name: "Arjun Sharma",   email: "arjun@bharatbazar.com",   role: "Super Admin", status: "active",   lastSeen: "Just now"     },
    { id: 2, name: "Priya Nair",     email: "priya@bharatbazar.com",   role: "Admin",       status: "active",   lastSeen: "10 min ago"   },
    { id: 3, name: "Rahul Verma",    email: "rahul@bharatbazar.com",   role: "Manager",     status: "active",   lastSeen: "2 hrs ago"    },
    { id: 4, name: "Sneha Reddy",    email: "sneha@bharatbazar.com",   role: "Support",     status: "active",   lastSeen: "Yesterday"    },
    { id: 5, name: "Vikash Kumar",   email: "vikash@bharatbazar.com",  role: "Analyst",     status: "inactive", lastSeen: "3 days ago"   },
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ name: "", email: "", role: "Support" });
  const toggle = (id: number) => setUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
  const addUser = () => {
    if (!form.name || !form.email) return;
    setUsers(p => [...p, { id: Date.now(), ...form, status: "active", lastSeen: "Just added" } as SysUser]);
    setModal(false); setForm({ name: "", email: "", role: "Support" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{users.length} system users</p>
        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: G }}>
          <Plus size={13}/> Add User
        </button>
      </div>
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className={`${card} p-3.5 flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-white shrink-0"
              style={{ background: u.status === "active" ? G : "#9ca3af" }}>
              {u.name.split(" ").map(w => w[0]).join("").slice(0,2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{u.name}</p>
              <p className="text-[10px] text-gray-400">{u.email} · {u.role}</p>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block">{u.lastSeen}</p>
            <Toggle checked={u.status === "active"} onChange={() => toggle(u.id)}/>
          </div>
        ))}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add System User">
        <div className="space-y-3">
          <Field label="Full Name"><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Arjun Sharma" className={inp}/></Field>
          <Field label="Email"><input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="arjun@bharatbazar.com" className={inp}/></Field>
          <Field label="Role">
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className={inp}>
              {["Super Admin","Admin","Manager","Support","Analyst"].map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500">Cancel</button>
            <button onClick={addUser} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: G }}>Add User</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

type Role = { id: number; name: string; users: number; color: string; permissions: string[] };
function ManageRolesPage() {
  const ALL_PERMS = ["Dashboard","Orders","Products","Catalogue","Brands","Promotions","Delivery","Users","Settings","Reports","Analytics"];
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: "Super Admin", users: 1, color: G,        permissions: ALL_PERMS },
    { id: 2, name: "Admin",       users: 2, color: "#6366f1", permissions: ["Dashboard","Orders","Products","Catalogue","Brands","Promotions","Delivery","Users","Reports"] },
    { id: 3, name: "Manager",     users: 1, color: "#3b82f6", permissions: ["Dashboard","Orders","Products","Catalogue","Brands","Promotions","Delivery","Reports"] },
    { id: 4, name: "Support",     users: 3, color: "#0d9488", permissions: ["Dashboard","Orders","Reports"] },
    { id: 5, name: "Analyst",     users: 1, color: "#f59e0b", permissions: ["Dashboard","Analytics","Reports"] },
  ]);
  const [activeRole, setActiveRole] = useState(1);
  const role  = roles.find(r => r.id === activeRole)!;
  const toggle = (perm: string) => setRoles(p => p.map(r => r.id === activeRole
    ? { ...r, permissions: r.permissions.includes(perm) ? r.permissions.filter(p2 => p2 !== perm) : [...r.permissions, perm] }
    : r));

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {/* Role list */}
      <div className="space-y-1.5">
        {roles.map(r => (
          <button key={r.id} onClick={() => setActiveRole(r.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
            style={{ borderColor: activeRole === r.id ? r.color : "#e5e7eb", background: activeRole === r.id ? `${r.color}08` : "white" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ background: r.color }}>
              {r.name.slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black" style={{ color: activeRole === r.id ? r.color : "#374151" }}>{r.name}</p>
              <p className="text-[10px] text-gray-400">{r.users} user{r.users !== 1 ? "s" : ""}</p>
            </div>
            {activeRole === r.id && <ChevronRight size={13} style={{ color: r.color }}/>}
          </button>
        ))}
      </div>

      {/* Permissions matrix */}
      <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white" style={{ background: role.color }}>
            {role.name.slice(0,2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">{role.name}</p>
            <p className="text-[10px] text-gray-400">{role.permissions.length} / {ALL_PERMS.length} permissions</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ALL_PERMS.map(perm => {
            const has = role.permissions.includes(perm);
            return (
              <button key={perm} onClick={() => toggle(perm)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all text-left"
                style={{ borderColor: has ? role.color : "#e5e7eb", background: has ? `${role.color}08` : "transparent" }}>
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{ background: has ? role.color : "#f3f4f6" }}>
                  {has ? <Check size={11} className="text-white"/> : <X size={11} className="text-gray-400"/>}
                </div>
                <span className="text-xs font-bold" style={{ color: has ? role.color : "#9ca3af" }}>{perm}</span>
              </button>
            );
          })}
        </div>
        <SaveBar onSave={() => {}} onDiscard={() => {}}/>
      </div>
    </div>
  );
}

function PolicyPage({ title, defaultContent }: { title: string; defaultContent: string }) {
  const [content, setContent] = useState(defaultContent);
  const [lastUpdated] = useState("5 Sep 2026");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-400">Last updated: {lastUpdated}</p>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">
            <Eye size={12}/> Preview
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100 flex-wrap">
          {["Bold","Italic","H2","H3","List","Link","Divider"].map(t => (
            <button key={t} className="px-2 py-1 rounded text-[10px] font-bold text-gray-500 hover:bg-white hover:text-gray-800 transition-all">{t}</button>
          ))}
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={16}
          className="w-full p-4 text-sm text-gray-700 outline-none font-mono leading-relaxed resize-none"/>
      </div>
      <SaveBar onSave={() => {}} onDiscard={() => setContent(defaultContent)}/>
    </div>
  );
}

function WaFeedbackPage() {
  const [cfg, setCfg] = useState({
    enabled: true, delayHours: "2", template: "Hi {{name}}! How was your BharatBazar delivery?\n\nReply with:\n⭐ 1–5 stars\n💬 Leave a comment",
    autoReply: true, autoReplyMsg: "Thanks for your feedback! We'll keep improving.",
    minRating: "1", collectEmail: false,
  });
  const s = (k: string, v: any) => setCfg(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <SectionCard>
        <SettingRow label="Enable WhatsApp Feedback" hint="Send automated feedback requests after successful delivery">
          <Toggle checked={cfg.enabled} onChange={() => s("enabled", !cfg.enabled)}/>
        </SettingRow>
        <SettingRow label="Send Delay (hours after delivery)" hint="How long to wait before sending the feedback message">
          <input type="number" value={cfg.delayHours} onChange={e => s("delayHours", e.target.value)} className={`${inp} w-20 text-center`}/>
        </SettingRow>
        <SettingRow label="Auto-Reply to Feedback" hint="Automatically reply when a customer submits a rating">
          <Toggle checked={cfg.autoReply} onChange={() => s("autoReply", !cfg.autoReply)}/>
        </SettingRow>
        <SettingRow label="Collect Email in Feedback" hint="Ask customer for email during the feedback flow">
          <Toggle checked={cfg.collectEmail} onChange={() => s("collectEmail", !cfg.collectEmail)}/>
        </SettingRow>
      </SectionCard>

      <SectionCard>
        <SectionTitle title="Message Template" desc="Variables: {{name}}, {{order_id}}, {{product}}"/>
        <textarea value={cfg.template} onChange={e => s("template", e.target.value)} rows={6}
          className={`${inp} font-mono text-xs leading-relaxed resize-none w-full`}/>
        {cfg.autoReply && <>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-4 mb-2">Auto-Reply Message</p>
          <textarea value={cfg.autoReplyMsg} onChange={e => s("autoReplyMsg", e.target.value)} rows={3} className={`${inp} font-mono text-xs resize-none w-full`}/>
        </>}
        <SaveBar onSave={() => {}} onDiscard={() => {}}/>
      </SectionCard>
    </div>
  );
}

type OOSZone = { id: number; label: string; pincode: string; city: string; reason: string; active: boolean };
function OosLocationsPage() {
  const [zones, setZones] = useState<OOSZone[]>([
    { id: 1, label: "Remote Hills — HP",     pincode: "175001", city: "Mandi",       reason: "No courier coverage",           active: true  },
    { id: 2, label: "Flood Zone — Assam",    pincode: "781001", city: "Guwahati",    reason: "Seasonal accessibility issue",   active: true  },
    { id: 3, label: "Border Area — J&K",     pincode: "194101", city: "Leh",         reason: "Security restrictions",          active: true  },
    { id: 4, label: "Island — Andamans",     pincode: "744101", city: "Port Blair",  reason: "Shipping logistics unavailable", active: false },
    { id: 5, label: "Remote — Arunachal",    pincode: "790001", city: "Itanagar",    reason: "No last-mile partner",           active: true  },
  ]);
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ label: "", pincode: "", city: "", reason: "" });
  const toggle = (id: number) => setZones(p => p.map(z => z.id === id ? { ...z, active: !z.active } : z));
  const remove = (id: number) => setZones(p => p.filter(z => z.id !== id));
  const add    = () => {
    if (!form.pincode || !form.city) return;
    setZones(p => [...p, { id: Date.now(), ...form, active: true }]);
    setModal(false); setForm({ label: "", pincode: "", city: "", reason: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500"/>
          <p className="text-xs font-bold text-gray-700">{zones.filter(z => z.active).length} active blocked zones</p>
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "#ef4444" }}>
          <Plus size={13}/> Block Location
        </button>
      </div>

      <div className="space-y-2">
        {zones.map(z => (
          <div key={z.id} className={`${card} p-3.5 flex items-center gap-3 ${!z.active ? "opacity-50" : ""}`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: z.active ? "#fef2f2" : "#f3f4f6" }}>
              <MapPinOff size={15} style={{ color: z.active ? "#ef4444" : "#9ca3af" }}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800">{z.label || z.city}</p>
              <p className="text-[10px] text-gray-400">Pincode {z.pincode} · {z.city} · {z.reason}</p>
            </div>
            <Toggle checked={z.active} onChange={() => toggle(z.id)}/>
            <button onClick={() => remove(z.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <Trash2 size={13}/>
            </button>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Block Location">
        <div className="space-y-3">
          <Field label="Label / Zone Name"><input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Remote Hills — HP" className={inp}/></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pincode"><input value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} placeholder="175001" className={`${inp} font-mono`}/></Field>
            <Field label="City"><input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Mandi" className={inp}/></Field>
          </div>
          <Field label="Reason"><input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="No courier coverage" className={inp}/></Field>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500">Cancel</button>
            <button onClick={add} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500">Block Location</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function WaMarketingPage() {
  const [cfg, setCfg] = useState({ enabled: true, dailyLimit: "1000", cooldownDays: "7", sendTime: "10:00", provider: "Official BSP" });
  const [campaigns] = useState([
    { id: 1, name: "Diwali 2026 Sale",  status: "Scheduled", recipients: 48200, sent: 0,     opens: 0,    date: "1 Oct 2026"  },
    { id: 2, name: "Weekend Flash Deal",status: "Sent",       recipients: 22400, sent: 22400, opens: 8900, date: "31 Aug 2026" },
    { id: 3, name: "New Arrivals — Sep",status: "Draft",      recipients: 0,     sent: 0,     opens: 0,    date: "—"           },
  ]);
  const s = (k: string, v: any) => setCfg(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionTitle title="WhatsApp Marketing Config"/>
        <SettingRow label="Enable WhatsApp Marketing" hint="Broadcast promotional messages to opted-in customers">
          <Toggle checked={cfg.enabled} onChange={() => s("enabled", !cfg.enabled)}/>
        </SettingRow>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3">
          <Field label="Provider">
            <select value={cfg.provider} onChange={e => s("provider", e.target.value)} className={inp}>
              {["Official BSP","360dialog","Twilio","WATI","Interakt"].map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Daily Limit"><input type="number" value={cfg.dailyLimit} onChange={e => s("dailyLimit", e.target.value)} className={inp}/></Field>
          <Field label="Cooldown (days)"><input type="number" value={cfg.cooldownDays} onChange={e => s("cooldownDays", e.target.value)} className={inp}/></Field>
          <Field label="Send Time"><input type="time" value={cfg.sendTime} onChange={e => s("sendTime", e.target.value)} className={inp}/></Field>
        </div>
        <SaveBar onSave={() => {}} onDiscard={() => {}}/>
      </SectionCard>

      <SectionCard>
        <SectionTitle title="Campaigns"/>
        <div className="space-y-2">
          {campaigns.map(c => {
            const statusColors: Record<string, string> = { Sent: G, Scheduled: "#f59e0b", Draft: "#9ca3af" };
            return (
              <div key={c.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{c.name}</p>
                  <p className="text-[10px] text-gray-400">{c.date}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-[10px] text-gray-500">
                  <span><span className="font-black text-gray-800">{c.recipients.toLocaleString()}</span> recipients</span>
                  {c.sent > 0 && <span><span className="font-black text-gray-800">{c.opens.toLocaleString()}</span> opens</span>}
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded-lg" style={{ color: statusColors[c.status], background: `${statusColors[c.status]}15` }}>{c.status}</span>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

function ThermalPrintPage() {
  const [cfg, setCfg] = useState({
    printerName: "EPSON TM-T88VI", port: "USB", paperWidth: "80mm",
    copies: "1", autoPrint: true, printOnStatus: "Processed",
    showLogo: true, showBarcode: true, showGst: true, showCustomerPhone: false,
    footerNote: "Thank you for shopping at BharatBazar! Visit bharatbazar.com",
    fontSize: "small",
  });
  const s = (k: string, v: any) => setCfg(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionTitle title="Printer Configuration"/>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Printer Name"><input value={cfg.printerName} onChange={e => s("printerName", e.target.value)} className={inp}/></Field>
          <Field label="Connection Port">
            <select value={cfg.port} onChange={e => s("port", e.target.value)} className={inp}>
              {["USB","Network (TCP/IP)","Bluetooth","Serial COM"].map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Paper Width">
            <select value={cfg.paperWidth} onChange={e => s("paperWidth", e.target.value)} className={inp}>
              {["58mm","72mm","80mm","112mm"].map(w => <option key={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Copies Per Order"><input type="number" min="1" max="5" value={cfg.copies} onChange={e => s("copies", e.target.value)} className={inp}/></Field>
          <Field label="Font Size">
            <select value={cfg.fontSize} onChange={e => s("fontSize", e.target.value)} className={inp}>
              {["small","medium","large"].map(f => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Auto-print on Status">
            <select value={cfg.printOnStatus} onChange={e => s("printOnStatus", e.target.value)} className={inp}>
              {["Received","Processed","Shipped"].map(st => <option key={st}>{st}</option>)}
            </select>
          </Field>
        </div>
        <SaveBar onSave={() => {}} onDiscard={() => {}}/>
      </SectionCard>

      <SectionCard>
        <SectionTitle title="Slip Contents"/>
        <SettingRow label="Auto Print on New Order" hint="Automatically print receipt when order status changes">
          <Toggle checked={cfg.autoPrint} onChange={() => s("autoPrint", !cfg.autoPrint)}/>
        </SettingRow>
        <SettingRow label="Show Store Logo" hint="Print BharatBazar logo at the top of the receipt">
          <Toggle checked={cfg.showLogo} onChange={() => s("showLogo", !cfg.showLogo)}/>
        </SettingRow>
        <SettingRow label="Show Barcode / QR" hint="Print order barcode for scanning during packing">
          <Toggle checked={cfg.showBarcode} onChange={() => s("showBarcode", !cfg.showBarcode)}/>
        </SettingRow>
        <SettingRow label="Show GST Details" hint="Print GST number and tax breakdown on receipt">
          <Toggle checked={cfg.showGst} onChange={() => s("showGst", !cfg.showGst)}/>
        </SettingRow>
        <SettingRow label="Show Customer Phone" hint="Print customer phone number on the packing slip">
          <Toggle checked={cfg.showCustomerPhone} onChange={() => s("showCustomerPhone", !cfg.showCustomerPhone)}/>
        </SettingRow>
        <div className="pt-3">
          <Field label="Footer Note">
            <input value={cfg.footerNote} onChange={e => s("footerNote", e.target.value)} className={inp} placeholder="Thank you for shopping…"/>
          </Field>
        </div>
      </SectionCard>

      {/* Live receipt preview */}
      <SectionCard>
        <SectionTitle title="Receipt Preview"/>
        <div className="flex justify-center">
          <div className="w-56 bg-white border border-gray-200 rounded-xl p-3 font-mono text-[9px] text-gray-700 space-y-1.5 shadow-sm">
            {cfg.showLogo && <p className="text-center font-black text-[11px]" style={{ color: G }}>BharatBazar</p>}
            <p className="text-center text-gray-400 text-[8px]">bharatbazar.com</p>
            <div className="border-t border-dashed border-gray-200 pt-1.5">
              <p className="font-bold">Order #BB-29041</p>
              <p className="text-gray-400">5 Sep 2026 · 9:14 am</p>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-1.5 space-y-0.5">
              <div className="flex justify-between"><span>Basmati Rice 5kg</span><span>₹480</span></div>
              <div className="flex justify-between"><span>Coconut Oil 1L</span><span>₹220</span></div>
              <div className="flex justify-between"><span>Dosa Mix 500g</span><span>₹140</span></div>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-1.5">
              <div className="flex justify-between font-bold"><span>Total</span><span>₹840</span></div>
              {cfg.showGst && <p className="text-gray-400 text-[8px]">GST: 29ABCDE1234F1ZX</p>}
            </div>
            {cfg.showBarcode && (
              <div className="flex justify-center pt-1">
                <div className="flex gap-px">{Array.from({ length: 28 }).map((_, i) => <div key={i} className="w-px h-5 bg-gray-800" style={{ opacity: Math.random() > 0.4 ? 1 : 0.1 }}/>)}</div>
              </div>
            )}
            <p className="text-center text-gray-400 text-[8px] pt-1">{cfg.footerNote}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function WaOrdersPage() {
  const [cfg, setCfg] = useState({
    enabled: true, waNumber: "+91 9999 100 200", botName: "BharatBot",
    greetMsg: "Hi! Welcome to BharatBazar 🛍️\nReply with:\n1️⃣ Browse categories\n2️⃣ Track my order\n3️⃣ Talk to support",
    catalogEnabled: true, paymentLink: true, orderConfirm: true,
    handoffOnFail: true, handoffAgent: "Support Team",
    sessionTimeout: "30",
  });
  const s = (k: string, v: any) => setCfg(p => ({ ...p, [k]: v }));
  const [recentBotOrders] = useState([
    { id: "WO-4411", customer: "Rajesh K.", amount: 880,  status: "Confirmed", time: "9:04 am"  },
    { id: "WO-4412", customer: "Meena S.", amount: 1240, status: "Pending",   time: "10:12 am" },
    { id: "WO-4413", customer: "Arjun D.", amount: 560,  status: "Confirmed", time: "11:30 am" },
    { id: "WO-4414", customer: "Priya R.", amount: 2100, status: "Confirmed", time: "1:45 pm"  },
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Bot Orders Today"  val={recentBotOrders.length}                                    color={G}        icon={Bot}           />
        <StatCard label="Confirmed"         val={recentBotOrders.filter(o => o.status === "Confirmed").length} color="#10b981" icon={Check}         />
        <StatCard label="Bot Number"        val={cfg.waNumber}                                               color="#059669"  icon={Phone}         />
        <StatCard label="Session Timeout"   val={`${cfg.sessionTimeout}m`}                                   color="#6366f1"  icon={MessageCircle} />
      </div>

      <SectionCard>
        <SectionTitle title="WhatsApp Bot Configuration"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="WhatsApp Number"><input value={cfg.waNumber} onChange={e => s("waNumber", e.target.value)} className={inp}/></Field>
          <Field label="Bot Display Name"><input value={cfg.botName} onChange={e => s("botName", e.target.value)} className={inp}/></Field>
          <Field label="Session Timeout (min)"><input type="number" value={cfg.sessionTimeout} onChange={e => s("sessionTimeout", e.target.value)} className={inp}/></Field>
          <Field label="Handoff to Agent"><input value={cfg.handoffAgent} onChange={e => s("handoffAgent", e.target.value)} className={inp}/></Field>
        </div>
        <div className="mt-4">
          <Field label="Greeting Message">
            <textarea value={cfg.greetMsg} onChange={e => s("greetMsg", e.target.value)} rows={4} className={`${inp} font-mono text-xs resize-none w-full`}/>
          </Field>
        </div>
        <SaveBar onSave={() => {}} onDiscard={() => {}}/>
      </SectionCard>

      <SectionCard>
        <SectionTitle title="Bot Features"/>
        <SettingRow label="Enable WhatsApp Orders" hint="Accept orders through the WhatsApp chatbot">
          <Toggle checked={cfg.enabled} onChange={() => s("enabled", !cfg.enabled)}/>
        </SettingRow>
        <SettingRow label="Product Catalogue Sharing" hint="Bot can share WhatsApp catalog link in chat">
          <Toggle checked={cfg.catalogEnabled} onChange={() => s("catalogEnabled", !cfg.catalogEnabled)}/>
        </SettingRow>
        <SettingRow label="Payment Link in Chat" hint="Send Razorpay/UPI payment link directly in WhatsApp">
          <Toggle checked={cfg.paymentLink} onChange={() => s("paymentLink", !cfg.paymentLink)}/>
        </SettingRow>
        <SettingRow label="Order Confirmation Message" hint="Send order details and summary on confirmation">
          <Toggle checked={cfg.orderConfirm} onChange={() => s("orderConfirm", !cfg.orderConfirm)}/>
        </SettingRow>
        <SettingRow label="Handoff on Bot Failure" hint="Automatically route to human agent if bot is confused">
          <Toggle checked={cfg.handoffOnFail} onChange={() => s("handoffOnFail", !cfg.handoffOnFail)}/>
        </SettingRow>
      </SectionCard>

      <SectionCard>
        <SectionTitle title="Recent WhatsApp Orders" desc="Orders placed through the chatbot today"/>
        <div className="space-y-2">
          {recentBotOrders.map(o => (
            <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ background: "#059669" }}>
                <Bot size={14}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800">{o.customer}</p>
                <p className="text-[10px] text-gray-400">{o.id} · {o.time}</p>
              </div>
              <p className="text-xs font-black text-gray-900">₹{o.amount}</p>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ color: o.status === "Confirmed" ? G : "#f59e0b", background: o.status === "Confirmed" ? "#e8fff6" : "#fffbeb" }}>
                {o.status}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Page renderer ────────────────────────────────────────────────────────────

function renderSubPage(id: string) {
  switch (id) {
    case "payment":         return <PaymentListPage/>;
    case "sms":             return <SmsGatewayPage/>;
    case "store":           return <StoreSettingPage/>;
    case "app":             return <AppSettingPage/>;
    case "system-users":    return <SystemUserPage/>;
    case "roles":           return <ManageRolesPage/>;
    case "customer-policy": return <PolicyPage title="Customer App Policy" defaultContent={`# Customer App Policy\n\n## Terms of Service\nBy using BharatBazar you agree to these terms...\n\n## Privacy Policy\nWe collect only the data required to fulfil your orders...\n\n## Refund Policy\nEligible items can be returned within 7 days of delivery...\n\n## Shipping Policy\nOrders are typically delivered within 2-5 business days...`}/>;
    case "delivery-policy": return <PolicyPage title="Delivery App Policy" defaultContent={`# Delivery Partner Policy\n\n## Code of Conduct\nDelivery partners must maintain professional behaviour at all times...\n\n## Compensation Structure\nBase pay: ₹15 per delivery + ₹5/km beyond 3km radius...\n\n## Working Hours\nPartners can log on/off as per their availability...\n\n## Performance Standards\nMaintain a delivery success rate of 95% or above...`}/>;
    case "wa-feedback":     return <WaFeedbackPage/>;
    case "oos-locations":   return <OosLocationsPage/>;
    case "wa-marketing":    return <WaMarketingPage/>;
    case "thermal-print":   return <ThermalPrintPage/>;
    case "wa-orders":       return <WaOrdersPage/>;
    default:                return null;
  }
}

// ─── Main SettingsPage ────────────────────────────────────────────────────────

export function SettingsPage() {
  const [active, setActive]         = useState("store");
  const [collapsed, setCollapsed]   = useState(false);

  const tab = SETTING_TABS.find(t => t.id === active)!;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] -m-4 md:-m-5 overflow-hidden">

      {/* ── MOBILE HORIZONTAL NAV ── */}
      <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto flex shrink-0"
        style={{ scrollbarWidth: "none" }}>
        {SETTING_TABS.map(t => {
          const Icon = t.icon;
          const isActive = active === t.id;
          const short = t.label.length > 9 ? t.label.split(" ")[0] : t.label;
          return (
            <button key={t.id} onClick={() => setActive(t.id)}
              className="flex flex-col items-center gap-1 px-3 py-2.5 shrink-0 border-b-2 transition-all"
              style={{ borderBottomColor: isActive ? t.color : "transparent",
                       color: isActive ? t.color : "#6b7280" }}>
              <Icon size={15}/>
              <span className="text-[9px] font-bold whitespace-nowrap">{short}</span>
            </button>
          );
        })}
      </div>

      {/* ── LEFT SIDE NAV (desktop) ── */}
      <motion.div
        animate={{ width: collapsed ? 52 : 236 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="hidden md:flex shrink-0 flex-col border-r border-gray-200 bg-white overflow-hidden min-h-0 h-full">

        {/* Header */}
        <div className={`flex items-center border-b border-gray-100 px-3 py-3.5 shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">Settings</span>}
          <button onClick={() => setCollapsed(v => !v)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0">
            <Filter size={12}/>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
          {SETTING_TABS.map(t => {
            const Icon     = t.icon;
            const isActive = active === t.id;
            return (
              <button key={t.id} onClick={() => setActive(t.id)} title={collapsed ? t.label : undefined}
                className={`relative w-full flex items-center transition-all group ${collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5"}`}
                style={{ background: isActive ? `${t.color}12` : "transparent" }}>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full" style={{ background: t.color }}/>}

                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={isActive ? { background: `${t.color}20` } : {}}>
                  <Icon size={14} style={{ color: isActive ? t.color : "#9ca3af" }} className="transition-colors group-hover:text-gray-600"/>
                </div>

                {!collapsed && (
                  <span className="flex-1 text-left text-xs font-bold truncate transition-colors"
                    style={{ color: isActive ? t.color : "#374151" }}>
                    {t.label}
                  </span>
                )}

                {/* Tooltip */}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">{t.label}</div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"/>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="border-t border-gray-100 px-3 py-3 shrink-0">
            <p className="text-[9px] text-gray-400">{SETTING_TABS.length} settings sections</p>
          </div>
        )}
      </motion.div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">

        {/* Page header */}
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.16 }}
            className="shrink-0 flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${tab.color}15` }}>
              <tab.icon size={17} style={{ color: tab.color }}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900">{tab.label}</p>
              <p className="text-[10px] text-gray-400 truncate">{tab.desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Sub-page content */}
        <div className="flex-1 p-5 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}>
              {renderSubPage(active)}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
