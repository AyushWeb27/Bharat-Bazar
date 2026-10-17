import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, ChevronLeft, Eye, EyeOff, IndianRupee, KeyRound,
  Lock, Mail, Smartphone, Star,
} from "lucide-react";
import { G, GD } from "../data/index";
import type { Page } from "../types/index";

const inp = "w-full border border-border rounded-lg px-3.5 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all";
const label = "block text-xs font-bold text-foreground mb-1.5 tracking-wide";

const CONFETTI_COLORS = ["#009966", "#fbbf24", "#f87171", "#60a5fa", "#a78bfa", "#34d399", "#fb923c", "#e879f9", "#38bdf8", "#f472b6", "#4ade80", "#facc15"];

export function ForgotPasswordPage({ setPage }: { setPage: (p: Page) => void }) {
  const [step, setStep] = useState<"input" | "otp" | "success">("input");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (step === "otp") {
      setOtpTimer(30);
      timerRef.current = setInterval(() => setOtpTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const isEmail = identifier.includes("@");

  const handleSendOtp = () => {
    setError("");
    if (!isEmail && identifier.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid mobile number or email"); return;
    }
    if (isEmail && !identifier.includes(".")) {
      setError("Please enter a valid email address"); return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); }, 900);
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) (document.getElementById(`otp-fp-${idx + 1}`) as HTMLInputElement)?.focus();
  };

  const handleOtpKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      (document.getElementById(`otp-fp-${idx - 1}`) as HTMLInputElement)?.focus();
  };

  const handleReset = () => {
    setError("");
    if (otp.join("").length < 6) { setError("Please enter the complete 6-digit OTP"); return; }
    if (newPass.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPass !== confirmPass) { setError("Passwords do not match"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowConfetti(true);
      setStep("success");
      setTimeout(() => setPage("signin" as any), 2500);
    }, 1200);
  };

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
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(145deg, rgba(0,60,35,0.92) 0%, rgba(0,40,22,0.88) 50%, rgba(0,20,10,0.95) 100%)` }} />

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

        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(110,255,196,0.12)" }}>
            <KeyRound size={32} style={{ color: "#6effc4" }} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Forgot your<br /><span style={{ color: "#6effc4" }}>password?</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              No worries! Enter your registered mobile or email and we'll send you a verification code to reset it.
            </p>
          </div>
          <div className="rounded-2xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Your account is safe</p>
            <p className="text-white/80 text-sm">We use OTP verification to make sure only you can reset your password.</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          {["🔒 SSL Secured", "✅ 100% Safe", "🏆 5Cr+ Users"].map(t => (
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
            <p className="text-[9px] text-white/60">Reset your password</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-10 md:px-16 relative overflow-hidden">
          {/* Success confetti */}
          {showConfetti && CONFETTI_COLORS.map((color, i) => {
            const angle = (i / CONFETTI_COLORS.length) * 360;
            const rad = (angle * Math.PI) / 180;
            const dist = 100 + (i % 3) * 40;
            return (
              <motion.div key={i}
                className="absolute rounded-full pointer-events-none"
                style={{ width: 8 + (i % 4) * 4, height: 8 + (i % 4) * 4, background: color, left: "50%", top: "50%" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist, opacity: [0, 1, 1, 0], scale: [0, 1.3, 1, 0] }}
                transition={{ duration: 1.2, delay: i * 0.04, ease: "easeOut" }}
              />
            );
          })}

          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">

              {/* ── STEP: Enter identifier ── */}
              {step === "input" && (
                <motion.div key="fp-input"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <button onClick={() => setPage("signin" as any)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-7 transition-colors font-semibold">
                    <ChevronLeft size={15} /> Back to Sign In
                  </button>

                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${G}15` }}>
                    <KeyRound size={28} style={{ color: G }} />
                  </div>

                  <h1 className="text-2xl font-black text-foreground mb-1">Reset Password</h1>
                  <p className="text-muted-foreground text-sm mb-7">
                    Enter your registered mobile number or email address
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className={label}>Mobile Number or Email</label>
                      <div className="relative">
                        {isEmail
                          ? <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          : <Smartphone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        }
                        <input
                          value={identifier}
                          onChange={e => setIdentifier(e.target.value)}
                          placeholder="Enter mobile or email"
                          className={`${inp} pl-10`}
                          onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-red-500 text-xs font-semibold flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                        {error}
                      </motion.p>
                    )}

                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleSendOtp} disabled={loading || !identifier}
                      className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                      style={{ background: `linear-gradient(to right, ${GD}, ${G})`, boxShadow: `0 4px 16px ${G}44` }}>
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      ) : <>Send OTP <ArrowRight size={15} /></>}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP: OTP + New Password ── */}
              {step === "otp" && (
                <motion.div key="fp-otp"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <button onClick={() => { setStep("input"); setError(""); }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-7 transition-colors font-semibold">
                    <ChevronLeft size={15} /> Back
                  </button>

                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${G}15` }}>
                    <Smartphone size={28} style={{ color: G }} />
                  </div>

                  <h2 className="text-2xl font-black text-foreground mb-1">Verify &amp; Reset</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    OTP sent to <span className="font-bold text-foreground">{identifier}</span>
                  </p>

                  {/* OTP boxes */}
                  <div className="flex gap-2 mb-4 max-w-xs mx-auto">
                    {otp.map((d, i) => (
                      <input key={i} id={`otp-fp-${i}`} value={d} maxLength={1} type="tel"
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

                  <p className="text-xs text-muted-foreground mb-5 text-center">
                    {otpTimer > 0
                      ? <span>Resend OTP in <span className="font-bold text-foreground">{otpTimer}s</span></span>
                      : <button className="font-bold hover:underline" style={{ color: G }}
                          onClick={() => setOtpTimer(30)}>Resend OTP</button>
                    }
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className={label}>New Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input value={newPass} onChange={e => setNewPass(e.target.value)}
                          type={showNew ? "text" : "password"} placeholder="Min. 6 characters"
                          className={`${inp} pl-10 pr-12`} />
                        <button onClick={() => setShowNew(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={label}>Confirm Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                          type={showConfirm ? "text" : "password"} placeholder="Re-enter password"
                          className={`${inp} pl-10 pr-12`}
                          onKeyDown={e => e.key === "Enter" && handleReset()} />
                        <button onClick={() => setShowConfirm(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-red-500 text-xs font-semibold flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                        {error}
                      </motion.p>
                    )}

                    <motion.button whileTap={{ scale: 0.98 }} onClick={handleReset} disabled={loading}
                      className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: `linear-gradient(to right, ${GD}, ${G})`, boxShadow: `0 4px 16px ${G}44` }}>
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      ) : <>Reset Password <ArrowRight size={15} /></>}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP: Success ── */}
              {step === "success" && (
                <motion.div key="fp-success"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="text-center"
                >
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl"
                    style={{ background: `linear-gradient(135deg, ${GD}, ${G})` }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18 }}
                  >
                    <motion.svg width="36" height="36" viewBox="0 0 36 36" fill="none"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
                      <motion.path d="M8 18L15 25L28 11" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
                    </motion.svg>
                  </motion.div>

                  <h2 className="text-2xl font-black text-foreground mb-2">Password Reset! 🎉</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Your password has been successfully updated. Redirecting you to sign in…
                  </p>

                  <motion.div
                    className="h-1 rounded-full overflow-hidden mb-6"
                    style={{ background: "var(--muted)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: G }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5, ease: "linear" }}
                    />
                  </motion.div>

                  <button onClick={() => setPage("signin" as any)}
                    className="text-sm font-bold hover:underline" style={{ color: G }}>
                    Go to Sign In →
                  </button>
                </motion.div>
              )}

            </AnimatePresence>

            {step !== "success" && (
              <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-5 flex-wrap">
                {["🔒 SSL Secured", "✅ 100% Safe", "🏆 5Cr+ Users"].map(t => (
                  <span key={t} className="text-[10px] text-muted-foreground font-semibold">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
