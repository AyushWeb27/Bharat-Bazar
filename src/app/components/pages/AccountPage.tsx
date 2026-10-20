import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Mail, Phone, MapPin, CreditCard, Bell, Shield,
  LogOut, ChevronRight, Edit3, Plus, Trash2, Check,
  Lock, Eye, EyeOff, Globe, Moon, Sun, HelpCircle,
  AlertTriangle, Camera, IndianRupee, Gift, CheckCircle,
  Calendar, Users, Loader2, Save,
} from "lucide-react";
import { G, GD } from "../data/index";
import type { Page } from "../types/index";
import { useApp } from "../../context/AppContext";

const SIDEBAR_ITEMS = [
  { id: "profile",   icon: User,          label: "Personal Info",      emoji: "👤" },
  { id: "addresses", icon: MapPin,         label: "My Addresses",       emoji: "📍" },
  { id: "payments",  icon: CreditCard,     label: "Payment Methods",    emoji: "💳" },
  { id: "orders",    icon: IndianRupee,    label: "Orders & Returns",   emoji: "📦" },
  { id: "rewards",   icon: Gift,           label: "Rewards & Offers",   emoji: "🎁" },
  { id: "notifs",    icon: Bell,           label: "Notifications",      emoji: "🔔" },
  { id: "security",  icon: Shield,         label: "Privacy & Security", emoji: "🔒" },
  { id: "prefs",     icon: Globe,          label: "Preferences",        emoji: "⚙️" },
  { id: "help",      icon: HelpCircle,     label: "Help & Support",     emoji: "🆘" },
  { id: "danger",    icon: AlertTriangle,  label: "Danger Zone",        emoji: "⚠️" },
];

const ADDRESSES = [
  { id: 1, tag: "Home",   name: "Rahul Sharma", line: "12, MG Road, Indiranagar", city: "Bengaluru", pin: "560038", phone: "9876543210", default: true  },
  { id: 2, tag: "Office", name: "Rahul Sharma", line: "45, Linking Road",         city: "Mumbai",    pin: "400050", phone: "9876543210", default: false },
];

const PAYMENTS_LIST = [
  { type: "upi",  label: "rahul@okicici",  sub: "UPI ID",      icon: "📱", color: "#6366f1" },
  { type: "card", label: "HDFC •••• 4521", sub: "Credit Card", icon: "💳", color: "#1e40af" },
  { type: "card", label: "SBI  •••• 8803", sub: "Debit Card",  icon: "💳", color: "#059669" },
];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <motion.button onClick={onChange} className="relative w-11 h-6 rounded-full transition-colors shrink-0" style={{ background: on ? G : "var(--muted-foreground)" }} whileTap={{ scale: 0.9 }}>
      <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
        style={{ left: on ? "calc(100% - 20px)" : 4 }} />
    </motion.button>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">{title}</h3>}
      {children}
    </div>
  );
}

/** Format the member-since date nicely */
function formatMemberSince(dateStr?: string) {
  if (!dateStr) return "Member";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  } catch {
    return "Member";
  }
}

export function AccountPage({ setPage, dark, setDark }: {
  setPage: (p: Page) => void; dark: boolean; setDark: (v: boolean) => void;
}) {
  const { user, refreshUser, logoutUser } = useApp();

  const [activeTab,    setActiveTab]    = useState("profile");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  // ── Profile form state (synced from DB user) ──
  const [name,         setName]         = useState("");
  const [tempName,     setTempName]     = useState("");
  const [editName,     setEditName]     = useState(false);
  const [phone,        setPhone]        = useState("");
  const [gender,       setGender]       = useState("");
  const [dob,          setDob]          = useState("");
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState<{ ok: boolean; text: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageMessage, setImageMessage] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Security
  const [showPass,     setShowPass]     = useState(false);
  const [notifs,       setNotifs]       = useState({ orders: true, offers: true, news: false, sms: true, whatsapp: true, email: false });
  const [lang,         setLang]         = useState("English");

  // Sync form with DB user whenever user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setTempName(user.name || "");
      setPhone(user.phone || "");
      setGender(user.gender || "");
      setDob(user.date_of_birth || "");
    }
  }, [user]);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  const inputBase = "w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all";

  // ── Save profile to DB ──
  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      if (selectedImage) {
        const imageForm = new FormData();
        imageForm.set("image", selectedImage);
        const imageResponse = await fetch("/api/auth/profile/image", {
          method: "POST",
          body: imageForm,
        });
        const imageData = await imageResponse.json();
        if (!imageResponse.ok || !imageData.success) {
          setSaveMsg({ ok: false, text: imageData.message || "Failed to save profile image." });
          return;
        }
      }

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          gender: gender || null,
          date_of_birth: dob || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveMsg({ ok: false, text: data.message || "Failed to save changes." });
      } else {
        setSelectedImage(null);
        setImageMessage(selectedImage ? "Profile image saved." : "");
        setSaveMsg({ ok: true, text: "Profile saved successfully!" });
        await refreshUser(); // re-sync context from DB
        setTimeout(() => setSaveMsg(null), 3000);
      }
    } catch {
      setSaveMsg({ ok: false, text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSelectedImage(null);
      setImageMessage("Use a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSelectedImage(null);
      setImageMessage("Image must be 5 MB or smaller.");
      return;
    }

    setSelectedImage(file);
    setImageMessage("Image selected. Click Save Changes to upload it.");
  };

  const renderContent = () => {
    switch (activeTab) {

      case "profile": return (
        <div className="space-y-6">
          {/* Avatar + header */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${G}, #00cc88)` }}>
                {imagePreview || user?.avatar_url ? (
                  <img src={imagePreview || user?.avatar_url} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  name.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center shadow-md text-white"
                type="button"
                aria-label="Change profile image"
                title="Change profile image"
                disabled={saving}
                onClick={() => imageInputRef.current?.click()}
                style={{ background: G, opacity: saving ? 0.7 : 1 }}>
                <Camera size={13} />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </div>
            <div>
              <p className="text-lg font-black text-foreground">{name || "—"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Member since {formatMemberSince(user?.created_at)}
              </p>
              <p className={`text-xs mt-1 ${imageMessage.includes("selected") || imageMessage.includes("saved") ? "text-emerald-600 dark:text-emerald-400" : imageMessage ? "text-red-500" : "text-muted-foreground"}`} aria-live="polite">
                {imageMessage || "JPEG, PNG, or WebP (max 5 MB)"}
              </p>
              <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold w-fit" style={{ background: `${G}18`, color: G }}>
                🏆 Gold Member · 2,450 pts
              </div>
            </div>
          </div>

          <Section title="Basic Info">
            {/* Name */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Full Name</label>
              {editName ? (
                <div className="flex gap-2">
                  <input value={tempName} onChange={e => setTempName(e.target.value)} className={inputBase} autoFocus />
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setName(tempName); setEditName(false); }}
                    className="px-4 py-2 rounded-xl text-white font-bold text-sm shrink-0" style={{ background: G }}>
                    <Check size={16} />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-muted border border-border rounded-xl px-4 py-3">
                  <span className="text-sm text-foreground">{name || "—"}</span>
                  <button onClick={() => { setTempName(name); setEditName(true); }} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Email — read only */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Email Address</label>
              <div className="flex items-center bg-muted border border-border rounded-xl px-4 py-3 gap-3">
                <Mail size={14} className="text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground flex-1">{user?.email || "—"}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${G}18`, color: G }}>Verified</span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Mobile Number</label>
              <div className="flex items-center bg-muted border border-border rounded-xl px-4 py-3 gap-3">
                <Phone size={14} className="text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground flex-1 select-none">🇮🇳 +91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none"
                />
              </div>
            </div>

            {/* Gender & DOB row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1.5 block">
                  <Users size={11} /> Gender
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className={inputBase}
                >
                  <option value="">Select gender</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1.5 flex items-center gap-1.5 block">
                  <Calendar size={11} /> Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={inputBase}
                />
              </div>
            </div>
          </Section>

          {/* Save message */}
          <AnimatePresence>
            {saveMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${saveMsg.ok ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}
              >
                {saveMsg.ok ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                {saveMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full py-3 rounded-2xl text-white text-sm font-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving…" : "Save Changes"}
          </motion.button>
        </div>
      );

      case "addresses": return (
        <div className="space-y-4">
          <Section title="Saved Addresses">
            {ADDRESSES.map(addr => (
              <motion.div key={addr.id} whileHover={{ y: -2, boxShadow: `0 8px 20px -4px ${G}18` }}
                className="bg-muted/50 border border-border rounded-2xl p-4 relative">
                {addr.default && (
                  <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: G }}>Default</span>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm" style={{ background: `${G}18` }}>
                    {addr.tag === "Home" ? "🏠" : "🏢"}
                  </div>
                  <div className="flex-1 min-w-0 pr-12">
                    <p className="text-xs font-black text-foreground">{addr.tag}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{addr.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{addr.line}, {addr.city} — {addr.pin}</p>
                    <p className="text-xs text-muted-foreground">📞 +91 {addr.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg border border-border hover:border-[#009966] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    <Edit3 size={11} /> Edit
                  </button>
                  {!addr.default && (
                    <button className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1">
                      <Trash2 size={11} /> Remove
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-bold transition-colors hover:border-[#009966] text-muted-foreground hover:text-foreground"
              style={{ borderColor: "var(--border)" }}>
              <Plus size={16} /> Add New Address
            </motion.button>
          </Section>
        </div>
      );

      case "payments": return (
        <div className="space-y-4">
          <Section title="Saved Payment Methods">
            {PAYMENTS_LIST.map((p, i) => (
              <motion.div key={i} whileHover={{ y: -2 }}
                className="flex items-center gap-4 bg-muted/50 border border-border rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: p.color + "18" }}>
                  {p.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-foreground">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.sub}</p>
                </div>
                <button className="text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-bold text-muted-foreground hover:text-foreground hover:border-[#009966] transition-all">
              <Plus size={16} /> Add Payment Method
            </motion.button>
          </Section>
          <div className="bg-muted/40 rounded-2xl border border-border p-4 flex items-center gap-3">
            <Shield size={18} style={{ color: G }} />
            <p className="text-xs text-muted-foreground">Your payment information is encrypted with 256-bit SSL. We never store card details.</p>
          </div>
        </div>
      );

      case "notifs": return (
        <div className="space-y-5">
          <Section title="Order Notifications">
            {[
              { key: "orders",    label: "Order Updates",     sub: "Track your order status in real-time" },
              { key: "sms",       label: "SMS Alerts",        sub: "Delivery & order alerts via SMS" },
              { key: "whatsapp",  label: "WhatsApp Updates",  sub: "Order info on WhatsApp" },
            ].map(({ key, label, sub }) => (
              <div key={key} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-muted/40 border border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{sub}</p>
                </div>
                <Toggle on={(notifs as any)[key]} onChange={() => setNotifs(n => ({ ...n, [key]: !(n as any)[key] }))} />
              </div>
            ))}
          </Section>
          <Section title="Marketing">
            {[
              { key: "offers", label: "Deals & Offers",    sub: "Flash sales, coupons and discounts" },
              { key: "news",   label: "Newsletter",        sub: "Weekly curated product picks" },
              { key: "email",  label: "Email Marketing",  sub: "Promotional emails from BharatBazar" },
            ].map(({ key, label, sub }) => (
              <div key={key} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-muted/40 border border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{sub}</p>
                </div>
                <Toggle on={(notifs as any)[key]} onChange={() => setNotifs(n => ({ ...n, [key]: !(n as any)[key] }))} />
              </div>
            ))}
          </Section>
        </div>
      );

      case "security": return (
        <div className="space-y-5">
          <Section title="Password">
            <div className="space-y-3">
              {["Current Password", "New Password", "Confirm New Password"].map((lbl, i) => (
                <div key={i} className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type={showPass ? "text" : "password"} placeholder={lbl} className={`${inputBase} pl-11 pr-12`} />
                  {i > 0 && (
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              ))}
              <motion.button whileTap={{ scale: 0.96 }}
                className="w-full py-3 rounded-2xl text-white text-sm font-black" style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}>
                Update Password
              </motion.button>
            </div>
          </Section>
          <Section title="Two-Factor Authentication">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
              <div>
                <p className="text-sm font-black text-foreground">SMS Authentication</p>
                <p className="text-xs text-muted-foreground">Verify with OTP on +91 {(user?.phone || "").slice(0, 5)}•••{(user?.phone || "").slice(-2)}</p>
              </div>
              <Toggle on={true} onChange={() => {}} />
            </div>
          </Section>
          <Section title="Active Sessions">
            {[
              { device: "Chrome on Web", loc: "India", time: "Now", current: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <div>
                  <p className="text-xs font-bold text-foreground">{s.device} {s.current && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-black" style={{ background: `${G}18`, color: G }}>Current</span>}</p>
                  <p className="text-[10px] text-muted-foreground">{s.loc} · {s.time}</p>
                </div>
                {!s.current && <button className="text-xs text-red-500 font-bold hover:underline">Revoke</button>}
              </div>
            ))}
          </Section>
        </div>
      );

      case "prefs": return (
        <div className="space-y-5">
          <Section title="Appearance">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
              <div className="flex items-center gap-3">
                {dark ? <Moon size={18} style={{ color: G }} /> : <Sun size={18} style={{ color: "#f59e0b" }} />}
                <div>
                  <p className="text-sm font-black text-foreground">{dark ? "Dark Mode" : "Light Mode"}</p>
                  <p className="text-xs text-muted-foreground">{dark ? "Dark theme active" : "Light theme active"}</p>
                </div>
              </div>
              <Toggle on={dark} onChange={() => setDark(!dark)} />
            </div>
          </Section>
          <Section title="Language">
            <div className="grid grid-cols-2 gap-2">
              {["English", "हिंदी", "தமிழ்", "বাংলা", "తెలుగు", "मराठी"].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className="py-2.5 rounded-xl border text-sm font-bold transition-all"
                  style={{
                    background:   lang === l ? G : "var(--muted)",
                    borderColor:  lang === l ? G : "var(--border)",
                    color:        lang === l ? "#fff" : "var(--foreground)",
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </Section>
          <Section title="Currency">
            <select className={inputBase}>
              <option>₹ Indian Rupee (INR)</option>
              <option>$ US Dollar (USD)</option>
            </select>
          </Section>
        </div>
      );

      case "rewards": return (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${G}, #00cc88)` }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-black text-lg">🏆 Gold Member</p>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Renews Jan 2026</span>
            </div>
            <p className="text-4xl font-black mb-1">2,450 <span className="text-lg font-bold opacity-80">BB Points</span></p>
            <p className="text-white/70 text-xs">≈ ₹245 cashback value</p>
            <div className="mt-4 bg-white/10 rounded-xl p-3">
              <p className="text-xs font-bold mb-1">Progress to Platinum</p>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: "61%" }} />
              </div>
              <p className="text-[10px] mt-1 opacity-70">1,550 more points to Platinum</p>
            </div>
          </div>
          <Section title="Your Coupons">
            {[
              { code: "SAVE200", desc: "₹200 off on orders above ₹999", exp: "31 Jul 2025", used: false },
              { code: "FLAT15",  desc: "15% off on Electronics",         exp: "15 Aug 2025", used: false },
              { code: "FIRST50", desc: "₹50 off on first app order",     exp: "Expired",     used: true  },
            ].map(c => (
              <div key={c.code} className={`p-4 rounded-2xl border-2 border-dashed ${c.used ? "opacity-50" : ""}`}
                style={{ borderColor: c.used ? "var(--border)" : `${G}50`, background: c.used ? "var(--muted)" : `${G}06` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm" style={{ color: c.used ? "var(--muted-foreground)" : G }}>{c.code}</span>
                  <span className="text-[9px] font-bold text-muted-foreground">Exp: {c.exp}</span>
                </div>
                <p className="text-xs text-foreground">{c.desc}</p>
              </div>
            ))}
          </Section>
        </div>
      );

      case "help": return (
        <div className="space-y-4">
          {[
            { q: "How do I track my order?",          a: "Go to My Orders → click on the order → Track Order button" },
            { q: "How do I return a product?",         a: "Orders → Select order → Request Return within 10 days of delivery" },
            { q: "When will my refund be processed?",  a: "Refunds are processed within 5–7 business days after we receive the return" },
            { q: "How do I cancel an order?",          a: "Go to My Orders → click the order → Cancel Order (available before shipment)" },
          ].map((faq, i) => (
            <details key={i} className="group bg-muted/40 border border-border rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-bold text-foreground list-none">
                {faq.q}
                <ChevronRight size={14} className="text-muted-foreground group-open:rotate-90 transition-transform" />
              </summary>
              <p className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
            </details>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: "💬", label: "Live Chat",    sub: "Available 9AM–9PM" },
              { icon: "📞", label: "Call Support", sub: "1800-123-4567 (Toll Free)" },
              { icon: "📧", label: "Email Us",     sub: "support@bharatbazar.in" },
              { icon: "📱", label: "WhatsApp",     sub: "+91 98765 43210" },
            ].map(c => (
              <motion.button key={c.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-1 p-4 rounded-2xl border border-border bg-card hover:border-[#009966] transition-all text-center">
                <span className="text-2xl">{c.icon}</span>
                <p className="text-xs font-black text-foreground">{c.label}</p>
                <p className="text-[9px] text-muted-foreground">{c.sub}</p>
              </motion.button>
            ))}
          </div>
        </div>
      );

      case "danger": return (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20">
            <p className="text-red-600 font-black text-sm mb-1">⚠️ Danger Zone</p>
            <p className="text-red-500 text-xs">Actions here are irreversible. Please proceed with caution.</p>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:border-red-300 transition-colors group">
              <div className="text-left">
                <p className="text-sm font-black text-foreground group-hover:text-red-500 transition-colors">Deactivate Account</p>
                <p className="text-xs text-muted-foreground">Temporarily disable your account</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
              <div className="text-left">
                <p className="text-sm font-black text-red-600">Permanently Delete Account</p>
                <p className="text-xs text-red-400">All data, orders & rewards will be erased</p>
              </div>
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        </div>
      );

      default: return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🚧</p>
          <p className="font-bold text-foreground">Coming Soon</p>
          <p className="text-sm">This section is under construction</p>
        </div>
      );
    }
  };

  const activeItem = SIDEBAR_ITEMS.find(s => s.id === activeTab);
  const initial    = (name || user?.name || "?").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">

      {/* ── Sidebar ── */}
      <aside className="md:w-64 shrink-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3 mb-3 cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{activeItem?.emoji}</span>
            <span className="text-sm font-black text-foreground">{activeItem?.label}</span>
          </div>
          <motion.div animate={{ rotate: sidebarOpen ? 180 : 0 }}>
            <ChevronRight size={16} className="text-muted-foreground rotate-90" />
          </motion.div>
        </div>

        {/* Sidebar nav */}
        <div className={`hidden md:block bg-card border border-border rounded-2xl overflow-hidden ${sidebarOpen ? "!block" : ""}`}>

          {/* ── User mini profile header — fetched from DB via context ── */}
          <div className="p-4 border-b border-border" style={{ background: `linear-gradient(to right, ${G}12, transparent)` }}>
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white shrink-0 overflow-hidden shadow"
                style={{ background: `linear-gradient(135deg, ${G}, #00cc88)` }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-lg">{initial}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-foreground truncate">{name || "—"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email || "—"}</p>
                {/* Extra info row */}
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {gender && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${G}15`, color: G }}>
                      {gender}
                    </span>
                  )}
                  {dob && (
                    <span className="text-[9px] font-bold text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">
                      🎂 {new Date(dob).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  {user?.auth_provider === "google" && (
                    <span className="text-[9px] font-bold text-blue-500 px-1.5 py-0.5 rounded-full bg-blue-500/10">Google</span>
                  )}
                </div>
              </div>
            </div>
            {/* Member-since badge */}
            <div className="mt-3 flex items-center gap-1.5">
              <CheckCircle size={10} style={{ color: G }} />
              <span className="text-[10px] text-muted-foreground font-medium">
                Member since {formatMemberSince(user?.created_at)}
              </span>
            </div>
          </div>

          <nav className="p-2">
            {SIDEBAR_ITEMS.map(item => (
              <motion.button key={item.id} whileHover={{ x: 3 }}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-all mb-0.5
                  ${activeTab === item.id ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                style={activeTab === item.id ? { background: G } : {}}>
                <span className="text-base w-5 text-center">{item.emoji}</span>
                <span className="flex-1">{item.label}</span>
                {activeTab !== item.id && <ChevronRight size={12} className="opacity-40" />}
              </motion.button>
            ))}

            {/* Sign Out */}
            <div className="border-t border-border mt-2 pt-2">
              <motion.button whileHover={{ x: 3 }}
                onClick={async () => { await logoutUser(); setPage("home"); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut size={15} /> Sign Out
              </motion.button>
            </div>
          </nav>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border rounded-2xl p-5 md:p-6"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${G}18` }}>
                {activeItem?.emoji}
              </div>
              <div>
                <h2 className="text-lg font-black text-foreground">{activeItem?.label}</h2>
                <p className="text-xs text-muted-foreground">Manage your {activeItem?.label.toLowerCase()}</p>
              </div>
            </div>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
