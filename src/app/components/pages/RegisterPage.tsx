import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  IndianRupee, ChevronLeft, CheckCircle, CheckCircle2,
  Smartphone, Gift, ShieldCheck, Truck, BadgePercent,
  KeyRound, Database,
} from "lucide-react";
import { G, GD } from "../data/index";
import type { Page } from "../types/index";
import { useApp } from "../../context/AppContext";
import { GoogleSignInButton } from "../auth/GoogleSignInButton";
import { OtpLiveViewerModal } from "../auth/OtpLiveViewerModal";

const STEPS = [
  { label: "Personal Info",   short: "Info"   },
  { label: "Verify Mobile",   short: "Verify" },
  { label: "Set Password",    short: "Done"   },
];

const PERKS = [
  { icon: <Gift size={15} />,         text: "₹200 cashback on first order" },
  { icon: <Truck size={15} />,        text: "Free delivery on orders ₹499+" },
  { icon: <BadgePercent size={15} />, text: "Members-only exclusive deals" },
  { icon: <ShieldCheck size={15} />,  text: "30-day hassle-free returns" },
];

export function RegisterPage({ setPage }: { setPage: (p: Page) => void }) {
  const { refreshUser } = useApp();
  const [step,        setStep]        = useState(0);
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [otp,         setOtp]         = useState(["","","","","",""]);
  const [latestOtp,   setLatestOtp]   = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [gender,      setGender]      = useState("");
  const [dob,         setDob]         = useState("");
  const [agreed,      setAgreed]      = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [successMsg,  setSuccessMsg]  = useState("");

  const label = "block text-xs font-bold text-foreground mb-1.5 tracking-wide";
  const inp   = "w-full border border-border rounded-lg px-3.5 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all";

  const validate0 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.includes("@") || !email.includes(".")) e.email = "Enter a valid email address";
    if (phone.length < 10) e.phone = "Enter a valid 10-digit number";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validate2 = () => {
    const e: Record<string, string> = {};
    if (password.length < 6) e.password = "Minimum 6 characters required";
    if (password !== confirm) e.confirm = "Passwords do not match";
    if (!agreed) e.agreed = "Please accept terms to continue";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) (document.getElementById(`rotp-${idx + 1}`) as HTMLInputElement)?.focus();
  };

  const fillOtp = (code: string) => {
    const chars = code.split("").slice(0, 6);
    while (chars.length < 6) chars.push("");
    setOtp(chars);
  };

  const sendRegistrationOtp = async (targetPhone: string) => {
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: targetPhone, type: "registration" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors({ form: data.message || "Failed to generate registration OTP." });
        setLoading(false);
        return false;
      }
      setLatestOtp(data.otp);
      setSuccessMsg(`✓ Registration code: ${data.otp}`);
      setStep(1);
      return true;
    } catch (err: any) {
      setErrors({ form: err?.message || "Failed to send OTP." });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    setErrors({});
    setSuccessMsg("");

    // Step 0 -> Step 1 (Trigger Neon DB registration OTP)
    if (step === 0) {
      if (!validate0()) return;
      await sendRegistrationOtp(phone);
      return;
    }

    // Step 1 -> Step 2 (Verify OTP in Neon DB otps table)
    if (step === 1) {
      const otpCode = otp.join("");
      if (otpCode.length < 6) {
        setErrors({ form: "Please enter the complete 6-digit OTP code." });
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: phone, otp: otpCode, type: "registration" }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrors({ form: data.message || "Invalid or expired OTP. Please enter the correct code." });
          setLoading(false);
          return;
        }

        setSuccessMsg("✓ Mobile verified! Now set your password.");
        setLoading(false);
        setStep(2);
      } catch (err: any) {
        setErrors({ form: err?.message || "Failed to verify OTP." });
        setLoading(false);
      }
      return;
    }

    // Step 2 -> Complete registration
    if (step === 2) {
      if (!validate2()) return;
      setLoading(true);

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password,
            gender: gender || null,
            date_of_birth: dob || null,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrors({ form: data.message || "Registration failed. Please try again." });
          setLoading(false);
          return;
        }

        setSuccessMsg("✓ Registration successful! Welcome to BharatBazar.");
        await refreshUser();
        setTimeout(() => {
          setPage("home");
        }, 700);
      } catch (err: any) {
        console.error("Registration error:", err);
        setErrors({ form: err?.message || "Network error. Please try again." });
        setLoading(false);
      }
    }
  };

  const handleGoogleSuccess = async (googleUser: any) => {
    setErrors({});
    setSuccessMsg(`✓ Welcome, ${googleUser.name}! Account registered & verified via Google.`);
    await refreshUser();
    setTimeout(() => {
      setPage("home");
    }, 700);
  };

  const handleGoogleError = (err: string) => {
    setErrors({ form: err });
  };

  const strength =
    password.length === 0 ? 0 :
    password.length < 6   ? 1 :
    password.length < 10  ? 2 :
    /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4 : 3;
  const strengthMeta = [
    { label: "", color: "" },
    { label: "Weak",   color: "#ef4444" },
    { label: "Fair",   color: "#f59e0b" },
    { label: "Good",   color: "#3b82f6" },
    { label: "Strong", color: G },
  ][strength];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">

      {/* ── LEFT BRAND PANEL ── */}
      <div
        className="hidden md:flex md:w-[42%] flex-col justify-between px-10 py-12 relative overflow-hidden"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1780504863787-2b42d4f260d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark green overlay */}
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(145deg, rgba(0,60,35,0.90) 0%, rgba(0,40,22,0.86) 50%, rgba(0,20,10,0.93) 100%)` }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
              <IndianRupee size={22} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight">Bharat<span style={{ color: "#6effc4" }}>Bazar</span></p>
              <p className="text-[10px] text-white/50 font-medium">भारत बाज़ार</p>
            </div>
          </div>
        </div>

        {/* Center */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.15em] mb-3">Join the Family</p>
            <h2 className="text-3xl font-black text-white leading-tight mb-2">
              Create Your<br />
              <span style={{ color: "#6effc4" }}>Free Account</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Join over 5 crore Indians who trust BharatBazar for their daily needs.
            </p>
          </div>

          <div className="space-y-3">
            {PERKS.map((p, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(110,255,196,0.12)" }}>
                  <span style={{ color: "#6effc4" }}>{p.icon}</span>
                </div>
                <p className="text-white/75 text-sm font-medium">{p.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Progress visual */}
          <div className="rounded-2xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-3">Registration Progress</p>
            <div className="flex gap-2">
              {STEPS.map((s, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1.5">
                  <div className="h-1.5 rounded-full transition-all"
                    style={{ background: i <= step ? "#6effc4" : "rgba(255,255,255,0.15)" }} />
                  <span className="text-[9px] font-bold"
                    style={{ color: i <= step ? "#6effc4" : "rgba(255,255,255,0.35)" }}>
                    {s.short}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-white/50 text-xs">🔒 256-Bit SSL Encrypted &amp; Secure Account</p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile top bar */}
        <div className="md:hidden px-5 py-4 border-b border-border flex items-center gap-3"
          style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15">
            <IndianRupee size={18} className="text-white" />
          </div>
          <div>
            <p className="text-base font-black text-white">Bharat<span style={{ color: "#b3ffe0" }}>Bazar</span></p>
            <p className="text-[9px] text-white/60">Create your account</p>
          </div>
        </div>

        {/* Recent OTPs Banner Trigger */}
        <div className="px-5 pt-4 md:px-16 flex justify-end">
          <button
            onClick={() => setShowOtpModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-[#009966]/30 bg-[#009966]/10 text-[#009966] hover:bg-[#009966]/20 transition-colors shadow-sm"
          >
            <Database size={13} />
            <span>View Recent OTPs</span>
          </button>
        </div>

        <div className="flex-1 flex items-start md:items-center justify-center px-5 py-6 md:px-16">
          <div className="w-full max-w-sm">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                      animate={{ scale: i === step ? 1.1 : 1 }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all"
                      style={{
                        background: i < step ? G : i === step ? G : "transparent",
                        borderColor: i <= step ? G : "var(--border)",
                        color: i <= step ? "#fff" : "var(--muted-foreground)",
                      }}>
                      {i < step ? <CheckCircle size={14} /> : i + 1}
                    </motion.div>
                    <span className="text-[9px] font-bold whitespace-nowrap hidden sm:block"
                      style={{ color: i <= step ? G : "var(--muted-foreground)" }}>
                      {s.short}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mb-4 rounded-full transition-all"
                      style={{ background: i < step ? G : "var(--border)" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Form Error or Success Banner */}
            {errors.form && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
                {errors.form}
              </motion.div>
            )}

            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">

              {/* ── STEP 0: Personal Info ── */}
              {step === 0 && (
                <motion.div key="r0"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-black text-foreground mb-1">Create account 🎉</h2>
                    <p className="text-muted-foreground text-sm">Fill in your details or register with Google</p>
                  </div>

                  {/* Google 1-Click Register */}
                  <div className="pb-2">
                    <GoogleSignInButton
                      buttonText="Quick Register with Google"
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground font-semibold">OR REGISTER MANUALLY</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  </div>

                  <div>
                    <label className={label}>Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input value={name} onChange={e => setName(e.target.value)}
                        placeholder="Rahul Sharma" className={`${inp} pl-10`} />
                    </div>
                    {errors.name && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.name}</p>}
                  </div>

                  <div>
                    <label className={label}>Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="rahul@email.com" type="email" className={`${inp} pl-10`} />
                    </div>
                    {errors.email && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.email}</p>}
                  </div>

                  <div>
                    <label className={label}>Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 border border-border rounded-lg px-3 bg-muted text-sm font-bold text-foreground shrink-0 select-none">
                        🇮🇳 +91
                      </div>
                      <input value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit number" type="tel" className={inp} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className={label}>Gender <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <div className="flex gap-2">
                      {["Male", "Female", "Other"].map(g => (
                        <button key={g} type="button" onClick={() => setGender(gender === g ? "" : g)}
                          className="flex-1 py-2 rounded-lg border text-xs font-bold transition-all"
                          style={{
                            background: gender === g ? G : "transparent",
                            borderColor: gender === g ? G : "var(--border)",
                            color: gender === g ? "#fff" : "var(--muted-foreground)",
                          }}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={label}>Date of Birth <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <input value={dob} onChange={e => setDob(e.target.value)} type="date" className={inp} />
                  </div>
                </motion.div>
              )}

              {/* ── STEP 1: OTP ── */}
              {step === 1 && (
                <motion.div key="r1"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: `${G}15` }}>
                      <Smartphone size={26} style={{ color: G }} />
                    </div>
                    <h2 className="text-2xl font-black text-foreground mb-1">Verify your mobile</h2>
                    <p className="text-muted-foreground text-sm">
                      OTP for <span className="font-bold text-foreground">+91 {phone}</span>
                    </p>
                  </div>

                  {/* OTP Notification Card with Neon DB Code */}
                  {latestOtp && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                          <Database size={12} /> Registration Code
                        </div>
                        <p className="text-2xl font-black font-mono tracking-widest text-[#009966]">
                          {latestOtp}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => fillOtp(latestOtp)}
                        className="px-3.5 py-2 rounded-xl text-xs font-black text-white shadow-sm hover:opacity-90 transition-opacity"
                        style={{ background: G }}
                      >
                        Auto-Fill
                      </button>
                    </motion.div>
                  )}

                  <div className="flex gap-2 xs:gap-2.5 justify-center w-full max-w-xs mx-auto">
                    {otp.map((d, i) => (
                      <input key={i} id={`rotp-${i}`} value={d} maxLength={1} type="tel"
                        onChange={e => handleOtpChange(e.target.value, i)}
                        onKeyDown={e => {
                          if (e.key === "Backspace" && !d && i > 0)
                            (document.getElementById(`rotp-${i - 1}`) as HTMLInputElement)?.focus();
                        }}
                        className="flex-1 min-w-0 text-center text-lg sm:text-xl font-black border-2 rounded-xl bg-background text-foreground outline-none transition-all h-11 sm:h-14"
                        style={{
                          borderColor: d ? G : "var(--border)",
                          boxShadow: d ? `0 0 0 3px ${G}22` : "none",
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs px-1">
                    <p className="text-muted-foreground">
                      Didn't receive?{" "}
                      <button
                        type="button"
                        onClick={() => sendRegistrationOtp(phone)}
                        className="font-bold hover:underline"
                        style={{ color: G }}
                      >
                        Resend OTP
                      </button>
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowOtpModal(true)}
                      className="font-bold flex items-center gap-1 hover:underline text-xs"
                      style={{ color: G }}
                    >
                      <KeyRound size={12} /> View OTPs
                    </button>
                  </div>

                  {/* Info card */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border"
                    style={{ background: `${G}0a`, borderColor: `${G}25` }}>
                    <ShieldCheck size={16} style={{ color: G }} className="shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      OTP is securely validated against your registration request before proceeding.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Password ── */}
              {step === 2 && (
                <motion.div key="r2"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-foreground mb-1">Set your password 🔒</h2>
                    <p className="text-muted-foreground text-sm">Create a secure password for <span className="font-bold text-foreground">{email}</span></p>
                  </div>

                  {/* Password */}
                  <div>
                    <label className={label}>Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input value={password} onChange={e => setPassword(e.target.value)}
                        type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                        className={`${inp} pl-10 pr-12`} />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {password && (
                      <div className="mt-2.5 space-y-1">
                        <div className="flex gap-1">
                          {[1,2,3,4].map(i => (
                            <motion.div key={i}
                              animate={{ background: i <= strength ? strengthMeta.color : "var(--border)" }}
                              transition={{ duration: 0.3 }}
                              className="flex-1 h-1 rounded-full" />
                          ))}
                        </div>
                        <p className="text-[11px] font-bold" style={{ color: strengthMeta.color }}>
                          {strengthMeta.label}
                        </p>
                      </div>
                    )}
                    {errors.password && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.password}</p>}
                  </div>

                  {/* Confirm */}
                  <div>
                    <label className={label}>Confirm Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input value={confirm} onChange={e => setConfirm(e.target.value)}
                        type={showConfirm ? "text" : "password"} placeholder="Re-enter password"
                        className={`${inp} pl-10 pr-12`} />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirm && password !== confirm && (
                      <p className="text-red-500 text-[11px] mt-1 font-semibold">Passwords do not match</p>
                    )}
                    {confirm && password === confirm && confirm.length > 0 && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-[11px] mt-1 font-semibold flex items-center gap-1" style={{ color: G }}>
                        <CheckCircle size={11} /> Passwords match
                      </motion.p>
                    )}
                    {errors.confirm && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.confirm}</p>}
                  </div>

                  {/* Cashback banner */}
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border"
                    style={{ background: `${G}0a`, borderColor: `${G}30` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${G}20` }}>
                      <Gift size={16} style={{ color: G }} />
                    </div>
                    <div>
                      <p className="text-sm font-black" style={{ color: G }}>₹200 Cashback Unlocked!</p>
                      <p className="text-[11px] text-muted-foreground">Automatically verified &amp; credited on your registration</p>
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <button type="button" onClick={() => setAgreed(v => !v)}
                      className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                      style={{
                        background: agreed ? G : "transparent",
                        borderColor: agreed ? G : "var(--border)",
                      }}>
                      {agreed && <CheckCircle size={11} className="text-white" />}
                    </button>
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I agree to BharatBazar's{" "}
                      <a href="#" className="font-bold hover:underline" style={{ color: G }}>Terms of Service</a>
                      {" "}and{" "}
                      <a href="#" className="font-bold hover:underline" style={{ color: G }}>Privacy Policy</a>
                    </span>
                  </label>
                  {errors.agreed && <p className="text-red-500 text-[11px] font-semibold">{errors.agreed}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA row */}
            <div className="flex gap-3 mt-7">
              {step > 0 && (
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { setErrors({}); setStep(s => s - 1); }}
                  className="w-12 h-12 rounded-xl border border-border bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors shrink-0">
                  <ChevronLeft size={18} />
                </motion.button>
              )}
              <motion.button whileTap={{ scale: 0.97 }} onClick={nextStep} disabled={loading}
                className="flex-1 py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 shadow-md"
                style={{ background: `linear-gradient(to right, ${GD}, ${G})`, boxShadow: `0 4px 16px ${G}44` }}>
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : step === 0 ? (
                  <>Send OTP Code <ArrowRight size={15} /></>
                ) : step === 1 ? (
                  <>Verify OTP &amp; Continue <ArrowRight size={15} /></>
                ) : (
                  <>Create Account &amp; Verify 🎉</>
                )}
              </motion.button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-5">
              Already have an account?{" "}
              <button onClick={() => setPage("signin")}
                className="font-black hover:underline" style={{ color: G }}>
                Sign In
              </button>
            </p>

            {/* Bottom trust */}
            <div className="mt-6 pt-5 border-t border-border flex items-center justify-center gap-5 flex-wrap">
              {["🔒 SSL Secured", "✅ 100% Safe & Verified", "🏆 Trusted by 5Cr+"].map(t => (
                <span key={t} className="text-[10px] text-muted-foreground font-semibold">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Neon DB OTP Modal */}
      <OtpLiveViewerModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSelectOtp={fillOtp}
      />
    </div>
  );
}
