import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight,
  IndianRupee, ChevronLeft, ShieldCheck, Smartphone,
  Star, BadgeCheck, Zap, Gift,
} from "lucide-react";
import { G, GD } from "../data/index";
import type { Page } from "../types/index";

const BENEFITS = [
  { icon: <Zap size={16} />,        text: "Lightning-fast delivery across India" },
  { icon: <BadgeCheck size={16} />, text: "100% authentic products, guaranteed" },
  { icon: <Gift size={16} />,       text: "Exclusive deals for members only" },
  { icon: <ShieldCheck size={16} />,text: "Buyer protection on every order" },
];

export function SignInPage({ setPage }: { setPage: (p: Page) => void }) {
  const [mode, setMode]         = useState<"phone" | "email">("phone");
  const [step, setStep]         = useState<"input" | "otp" | "password">("input");
  const [phone, setPhone]       = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp]           = useState(["","","","","",""]);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
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

  const handleContinue = () => {
    setError("");
    if (mode === "phone" && phone.length < 10) { setError("Please enter a valid 10-digit mobile number"); return; }
    if (mode === "email" && !email.includes("@")) { setError("Please enter a valid email address"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(mode === "phone" ? "otp" : "password"); }, 900);
  };

  const handleSignIn = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setPage("home"); }, 1200);
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
          {["5 Cr+ Users", "4.8★ Rated", "Govt. Verified"].map(t => (
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

        <div className="flex-1 flex items-center justify-center px-5 py-10 md:px-16">
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
                    <p className="text-muted-foreground text-sm">Sign in to your BharatBazar account</p>
                  </div>

                  {/* Tab toggle */}
                  <div className="flex bg-muted rounded-xl p-1 mb-6 gap-1">
                    {(["phone", "email"] as const).map(m => (
                      <button key={m} onClick={() => { setMode(m); setError(""); }}
                        className="flex-1 py-2.5 rounded-lg text-xs font-bold transition-all"
                        style={mode === m
                          ? { background: G, color: "#fff", boxShadow: `0 2px 8px ${G}55` }
                          : { color: "var(--muted-foreground)" }}>
                        {m === "phone" ? "📱  Mobile OTP" : "✉️  Email"}
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
                        <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                        {error}
                      </motion.p>
                    )}

                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleContinue} disabled={loading}
                      className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-opacity"
                      style={{ background: `linear-gradient(to right, ${GD}, ${G})`, boxShadow: `0 4px 16px ${G}44` }}>
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                        <>{mode === "phone" ? "Request OTP" : "Continue"} <ArrowRight size={15} /></>
                      )}
                    </motion.button>
                  </div>

                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[11px] text-muted-foreground font-semibold">OR</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card text-sm font-bold text-foreground hover:border-[#009966]/40 transition-all">
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </motion.button>
                    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-sm font-bold text-white hover:bg-zinc-800 transition-all">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      Apple
                    </motion.button>
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
                  <button onClick={() => setStep("input")}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-7 transition-colors font-semibold">
                    <ChevronLeft size={15} /> Back
                  </button>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `${G}15` }}>
                    <Smartphone size={28} style={{ color: G }} />
                  </div>

                  <h2 className="text-2xl font-black text-foreground mb-1">Verify your mobile</h2>
                  <p className="text-muted-foreground text-sm mb-7">
                    OTP sent to <span className="font-bold text-foreground">+91 {phone}</span>
                  </p>

                  {/* OTP boxes */}
                  <div className="flex gap-2 xs:gap-2.5 mb-5 w-full max-w-xs mx-auto">
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

                  {/* Timer */}
                  <p className="text-xs text-muted-foreground mb-5">
                    {otpTimer > 0
                      ? <span>Resend OTP in <span className="font-bold text-foreground">{otpTimer}s</span></span>
                      : <button className="font-bold hover:underline" style={{ color: G }}
                          onClick={() => setOtpTimer(30)}>Resend OTP</button>
                    }
                  </p>

                  <motion.button whileTap={{ scale: 0.98 }} onClick={handleSignIn}
                    disabled={otp.join("").length < 6 || loading}
                    className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
                  <button onClick={() => setStep("input")}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-7 transition-colors font-semibold">
                    <ChevronLeft size={15} /> Back
                  </button>

                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${G}15` }}>
                    <Lock size={28} style={{ color: G }} />
                  </div>

                  <h2 className="text-2xl font-black text-foreground mb-1">Enter password</h2>
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
                          onKeyDown={e => e.key === "Enter" && handleSignIn()} />
                        <button onClick={() => setShowPass(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <button onClick={() => setRemember(v => !v)}
                          className="w-10 h-5.5 rounded-full relative transition-colors"
                          style={{ background: remember ? G : "var(--muted-foreground)", height: 22, width: 40 }}>
                          <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            className="absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow"
                            style={{ width: 18, height: 18, left: remember ? 20 : 2 }} />
                        </button>
                        <span className="text-xs text-muted-foreground font-medium">Remember me</span>
                      </label>
                      <button onClick={() => setPage("forgot-password" as any)}
                        className="text-xs font-bold hover:underline" style={{ color: G }}>
                        Forgot password?
                      </button>
                    </div>

                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleSignIn}
                      disabled={!password || loading}
                      className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: `linear-gradient(to right, ${GD}, ${G})`, boxShadow: `0 4px 16px ${G}44` }}>
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      ) : <>Sign In <ArrowRight size={15} /></>}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom trust strip */}
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-5 flex-wrap">
              {["🔒 SSL Secured", "✅ 100% Safe", "🏆 5Cr+ Users"].map(t => (
                <span key={t} className="text-[10px] text-muted-foreground font-semibold">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
