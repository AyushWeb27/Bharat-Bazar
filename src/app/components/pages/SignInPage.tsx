import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight,
  IndianRupee, ChevronLeft, ShieldCheck, Smartphone,
  Star, BadgeCheck, Zap, Gift, CheckCircle2, KeyRound, Database,
} from "lucide-react";
import { G, GD } from "../data/index";
import type { Page } from "../types/index";
import { useApp } from "../../context/AppContext";
import { GoogleSignInButton } from "../auth/GoogleSignInButton";
import { OtpLiveViewerModal } from "../auth/OtpLiveViewerModal";

const BENEFITS = [
  { icon: <Zap size={16} />,        text: "Lightning-fast delivery across India" },
  { icon: <BadgeCheck size={16} />, text: "100% authentic products, guaranteed" },
  { icon: <Gift size={16} />,       text: "Exclusive deals for members only" },
  { icon: <ShieldCheck size={16} />,text: "Buyer protection on every order" },
];

export function SignInPage({ setPage }: { setPage: (p: Page) => void }) {
  const { refreshUser } = useApp();
  const [mode, setMode]         = useState<"phone" | "email">("phone");
  const [step, setStep]         = useState<"input" | "otp" | "password">("input");
  const [phone, setPhone]       = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp]           = useState(["","","","","",""]);
  const [latestOtp, setLatestOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === "otp") {
      setOtpTimer(30);
      timerRef.current = setInterval(() => setOtpTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) (document.getElementById(`otp-si-${idx + 1}`) as HTMLInputElement)?.focus();
  };

  const handleOtpKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      (document.getElementById(`otp-si-${idx - 1}`) as HTMLInputElement)?.focus();
  };

  const fillOtp = (code: string) => {
    const chars = code.split("").slice(0, 6);
    while (chars.length < 6) chars.push("");
    setOtp(chars);
  };

  const sendOtpRequest = async (targetPhone: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: targetPhone, type: "phone_login" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to generate OTP.");
        setLoading(false);
        return false;
      }
      setLatestOtp(data.otp);
      setSuccessMsg(`✓ Verification code: ${data.otp}`);
      setStep("otp");
      return true;
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setError("");
    setSuccessMsg("");
    if (mode === "phone") {
      if (phone.length < 10) {
        setError("Please enter a valid 10-digit mobile number");
        return;
      }
      await sendOtpRequest(phone);
    } else {
      if (!email.includes("@") || !email.includes(".")) {
        setError("Please enter a valid email address");
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep("password");
      }, 250);
    }
  };

  const handleSignIn = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "email") {
        if (!password) {
          setError("Please enter your password.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || "Invalid email or password.");
          setLoading(false);
          return;
        }

        setSuccessMsg(`✓ Welcome back, ${data.user.name}!`);
        await refreshUser();
        setTimeout(() => {
          setPage("home");
        }, 700);
      } else {
        const otpCode = otp.join("");
        if (otpCode.length < 6) {
          setError("Please enter the complete 6-digit OTP");
          setLoading(false);
          return;
        }

        // Verify against Neon database otps table
        const res = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: phone, otp: otpCode, type: "phone_login" }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || "Mobile OTP verification failed.");
          setLoading(false);
          return;
        }

        setSuccessMsg(`✓ Verified! Welcome, ${data.user.name}.`);
        await refreshUser();
        setTimeout(() => {
          setPage("home");
        }, 700);
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err?.message || "Failed to sign in. Please check your network.");
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleUser: any) => {
    setError("");
    setSuccessMsg(`✓ Google sign in successful! Welcome, ${googleUser.name}. Email verified in database.`);
    await refreshUser();
    setTimeout(() => {
      setPage("home");
    }, 700);
  };

  const handleGoogleError = (err: string) => {
    setError(err);
  };

  const label = "block text-xs font-bold text-foreground mb-1.5 tracking-wide";
  const inp   = "w-full border border-border rounded-lg px-3.5 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">

      {/* ── LEFT BRAND PANEL ── */}
      <div
        className="hidden md:flex md:w-[42%] flex-col justify-between px-10 py-12 relative overflow-hidden"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1769634306787-7f2fff1cca7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark green overlay for readability */}
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(145deg, rgba(0,60,35,0.92) 0%, rgba(0,40,22,0.88) 50%, rgba(0,20,10,0.95) 100%)` }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
              <IndianRupee size={22} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight">Bharat<span style={{ color: "#6effc4" }}>Bazar</span></p>
              <p className="text-[10px] text-white/50 font-medium">भारत बाज़ार — India's Own Marketplace</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.15em] mb-3">Why BharatBazar?</p>
            <h2 className="text-3xl font-black text-white leading-tight mb-2">
              Shop Smarter,<br />
              <span style={{ color: "#6effc4" }}>Save Bigger.</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Millions of products, unbeatable prices, and delivered to your doorstep in record time.
            </p>
          </div>

          <div className="space-y-3">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(110,255,196,0.12)" }}>
                  <span style={{ color: "#6effc4" }}>{b.icon}</span>
                </div>
                <p className="text-white/75 text-sm font-medium">{b.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Offer card */}
          <div className="rounded-2xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Gift size={14} style={{ color: "#fbbf24" }} />
              <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider">New Member Offer</span>
            </div>
            <p className="text-white font-black text-lg">Get ₹200 Cashback</p>
            <p className="text-white/50 text-xs">on your first order above ₹499</p>
          </div>
        </div>

        {/* Bottom trust */}
        <div className="relative z-10 flex items-center gap-4">
          {["5 Cr+ Users", "4.8★ Rated", "100% Verified"].map(t => (
            <div key={t} className="flex items-center gap-1">
              <Star size={10} fill="#6effc4" className="text-transparent" />
              <span className="text-white/50 text-[10px] font-semibold">{t}</span>
            </div>
          ))}
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
            <p className="text-[9px] text-white/60">Sign in to your account</p>
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

        <div className="flex-1 flex items-center justify-center px-5 py-6 md:px-16">
          <div className="w-full max-w-sm">

            <AnimatePresence mode="wait">

              {/* ── STEP: Input ── */}
              {step === "input" && (
                <motion.div key="si-input"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-7">
                    <h1 className="text-2xl font-black text-foreground mb-1">Welcome back!</h1>
                    <p className="text-muted-foreground text-sm">Sign in with Mobile OTP, Email, or Google</p>
                  </div>

                  {/* Tab toggle */}
                  <div className="flex bg-muted rounded-xl p-1 mb-6 gap-1">
                    {(["phone", "email"] as const).map(m => (
                      <button key={m} onClick={() => { setMode(m); setError(""); setSuccessMsg(""); }}
                        className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all"
                        style={mode === m
                          ? { background: G, color: "#fff", boxShadow: `0 2px 8px ${G}55` }
                          : { color: "var(--muted-foreground)" }}>
                        {m === "phone" ? "📱 Mobile OTP" : "✉️ Email & Password"}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {mode === "phone" ? (
                      <div>
                        <label className={label}>Mobile Number</label>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1.5 border border-border rounded-lg px-3 bg-muted text-sm font-bold text-foreground shrink-0 select-none">
                            🇮🇳 +91
                          </div>
                          <input value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            placeholder="Enter 10-digit number" type="tel"
                            className={inp}
                            onKeyDown={e => e.key === "Enter" && handleContinue()} />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className={label}>Email Address</label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="you@email.com" type="email" className={`${inp} pl-10`}
                            onKeyDown={e => e.key === "Enter" && handleContinue()} />
                        </div>
                      </div>
                    )}

                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-red-500 text-xs font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {error}
                      </motion.p>
                    )}

                    {successMsg && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{successMsg}</span>
                      </motion.div>
                    )}

                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleContinue} disabled={loading}
                      className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-opacity shadow-md"
                      style={{ background: `linear-gradient(to right, ${GD}, ${G})`, boxShadow: `0 4px 16px ${G}44` }}>
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                        <>{mode === "phone" ? "Send OTP Code" : "Continue to Password"} <ArrowRight size={15} /></>
                      )}
                    </motion.button>
                  </div>

                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground font-semibold">OR SIGN IN WITH</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Official Google OAuth Sign In */}
                  <div>
                    <GoogleSignInButton
                      buttonText="Continue with Google"
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                  </div>

                  <p className="text-center text-xs text-muted-foreground mt-6">
                    New to BharatBazar?{" "}
                    <button onClick={() => setPage("register")}
                      className="font-black hover:underline" style={{ color: G }}>
                      Create an account
                    </button>
                  </p>
                </motion.div>
              )}

              {/* ── STEP: OTP ── */}
              {step === "otp" && (
                <motion.div key="si-otp"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <button onClick={() => { setStep("input"); setError(""); }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors font-semibold">
                    <ChevronLeft size={15} /> Back
                  </button>

                  {/* OTP Notification Card with Neon DB Code */}
                  {latestOtp && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mb-6 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                          <Database size={12} /> Verification Code
                        </div>
                        <p className="text-2xl font-black font-mono tracking-widest text-[#009966]">
                          {latestOtp}
                        </p>
                      </div>

                      <button
                        onClick={() => fillOtp(latestOtp)}
                        className="px-3.5 py-2 rounded-xl text-xs font-black text-white shadow-sm hover:opacity-90 transition-opacity"
                        style={{ background: G }}
                      >
                        Auto-Fill
                      </button>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${G}15` }}>
                      <Smartphone size={20} style={{ color: G }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-foreground">Verify Mobile OTP</h2>
                      <p className="text-muted-foreground text-xs">
                        Sent to <span className="font-bold text-foreground">+91 {phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* OTP boxes */}
                  <div className="flex gap-2 xs:gap-2.5 my-6 w-full max-w-xs mx-auto">
                    {otp.map((d, i) => (
                      <input key={i} id={`otp-si-${i}`} value={d} maxLength={1} type="tel"
                        onChange={e => handleOtpChange(e.target.value, i)}
                        onKeyDown={e => handleOtpKey(e, i)}
                        className="flex-1 min-w-0 text-center text-lg sm:text-xl font-black border-2 rounded-xl bg-background text-foreground outline-none transition-all h-11 sm:h-14"
                        style={{
                          borderColor: d ? G : "var(--border)",
                          boxShadow: d ? `0 0 0 3px ${G}22` : "none",
                        }}
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-red-500 text-xs font-semibold mb-4 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                      {error}
                    </motion.p>
                  )}

                  {successMsg && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>{successMsg}</span>
                    </motion.div>
                  )}

                  {/* Resend and Live Viewer Row */}
                  <div className="flex items-center justify-between text-xs mb-5">
                    <p className="text-muted-foreground">
                      {otpTimer > 0
                        ? <span>Resend in <span className="font-bold text-foreground">{otpTimer}s</span></span>
                        : <button className="font-bold hover:underline" style={{ color: G }}
                            onClick={() => sendOtpRequest(phone)}>Resend OTP</button>
                      }
                    </p>

                    <button
                      onClick={() => setShowOtpModal(true)}
                      className="font-bold flex items-center gap-1 hover:underline text-xs"
                      style={{ color: G }}
                    >
                      <KeyRound size={12} /> View OTPs
                    </button>
                  </div>

                  <motion.button whileTap={{ scale: 0.98 }} onClick={handleSignIn}
                    disabled={otp.join("").length < 6 || loading}
                    className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
                    style={{ background: `linear-gradient(to right, ${GD}, ${G})`, boxShadow: `0 4px 16px ${G}44` }}>
                    {loading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    ) : <>Verify &amp; Sign In <ArrowRight size={15} /></>}
                  </motion.button>
                </motion.div>
              )}

              {/* ── STEP: Password (email mode) ── */}
              {step === "password" && (
                <motion.div key="si-pass"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <button onClick={() => { setStep("input"); setError(""); }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-7 transition-colors font-semibold">
                    <ChevronLeft size={15} /> Back
                  </button>

                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${G}15` }}>
                    <Lock size={28} style={{ color: G }} />
                  </div>

                  <h2 className="text-2xl font-black text-foreground mb-1">Enter your password</h2>
                  <p className="text-muted-foreground text-sm mb-7">
                    Signing in as <span className="font-bold text-foreground">{email}</span>
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className={label}>Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input value={password} onChange={e => setPassword(e.target.value)}
                          type={showPass ? "text" : "password"} placeholder="Your password"
                          className={`${inp} pl-10 pr-12`}
                          autoFocus
                          onKeyDown={e => e.key === "Enter" && handleSignIn()} />
                        <button type="button" onClick={() => setShowPass(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-red-500 text-xs font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
                        {error}
                      </motion.p>
                    )}

                    {successMsg && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{successMsg}</span>
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <button type="button" onClick={() => setRemember(v => !v)}
                          className="w-10 h-5.5 rounded-full relative transition-colors"
                          style={{ background: remember ? G : "var(--muted-foreground)", height: 22, width: 40 }}>
                          <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            className="absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow"
                            style={{ width: 18, height: 18, left: remember ? 20 : 2 }} />
                        </button>
                        <span className="text-xs text-muted-foreground font-medium">Remember me</span>
                      </label>
                      <button type="button" onClick={() => setPage("forgot-password" as any)}
                        className="text-xs font-bold hover:underline" style={{ color: G }}>
                        Forgot password?
                      </button>
                    </div>

                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleSignIn}
                      disabled={!password || loading}
                      className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                      style={{ background: `linear-gradient(to right, ${GD}, ${G})`, boxShadow: `0 4px 16px ${G}44` }}>
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      ) : <>Sign In &amp; Verify <ArrowRight size={15} /></>}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom trust strip */}
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-5 flex-wrap">
              {["🔒 SSL Encrypted", "✅ 100% Safe & Secure", "🏆 5Cr+ Users"].map(t => (
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
