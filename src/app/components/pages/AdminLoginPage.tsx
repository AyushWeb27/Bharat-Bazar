import { useState } from "react";
import { motion } from "motion/react";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight,
  IndianRupee, ShieldCheck, AlertCircle, Activity,
} from "lucide-react";
import type { Page } from "../types/index";

const G  = "#009966";
const GD = "#007a52";

const LIVE_STATS = [
  { val: "₹4.82Cr", label: "Today's Revenue", up: true,  delta: "+12.4%" },
  { val: "1,847",   label: "Active Orders",   up: true,  delta: "+8.1%"  },
  { val: "51.2L+",  label: "Total Customers", up: true,  delta: "+3.2%"  },
];

const FEATURES = [
  "Real-time order management & tracking",
  "Advanced analytics & revenue insights",
  "Inventory & product catalog control",
  "Customer data & CRM tools",
];

export function AdminLoginPage({ setPage }: { setPage: (p: Page) => void }) {
  const [email,    setEmail   ] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading ] = useState(false);
  const [error,    setError   ] = useState("");
  const [success,  setSuccess ] = useState("");

  const inp = "w-full bg-[#0c1628] border border-[#1e2d45] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all";

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your credentials to continue"); return; }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Authentication failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      setSuccess("Authentication verified! Redirecting...");
      setTimeout(() => {
        setLoading(false);
        setPage("admin");
      }, 700);
    } catch (err: any) {
      setError(err?.message || "Network error. Failed to reach authentication server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#07080f]">

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1775582336512-a8a714980243?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(2,8,20,0.97) 0%, rgba(0,25,15,0.92) 55%, rgba(2,5,30,0.95) 100%)" }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: `linear-gradient(${G}60 1px, transparent 1px), linear-gradient(90deg, ${G}60 1px, transparent 1px)`, backgroundSize: "44px 44px" }} />
        {/* Glow orbs */}
        <div className="absolute top-20 right-16 w-72 h-72 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
          style={{ background: G }} />
        <div className="absolute bottom-20 left-10 w-56 h-56 rounded-full opacity-[0.05] blur-3xl pointer-events-none"
          style={{ background: "#3b82f6" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl"
            style={{ background: `linear-gradient(135deg, ${G}, #00cc88)` }}>
            <IndianRupee size={21} className="text-white" />
          </div>
          <div>
            <p className="text-xl font-black text-white">BharatBazar</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "#6effc4" }}>
              Super Admin Portal
            </p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border"
            style={{ borderColor: `${G}40`, background: `${G}12` }}>
            <Activity size={13} style={{ color: G }} />
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold text-green-400">All systems operational</span>
          </div>

          <div>
            <h1 className="text-5xl font-black text-white leading-none tracking-tight mb-4">
              Command<br />
              <span style={{ color: "#6effc4" }}>Center.</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Complete visibility and control over India's fastest-growing ecommerce platform.
              Every order, every rupee, every customer.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2.5">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${G}20` }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: G }} />
                </div>
                <span className="text-sm text-slate-300 font-medium">{f}</span>
              </motion.div>
            ))}
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-3">
            {LIVE_STATS.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="rounded-xl p-3.5 border border-white/[0.06]"
                style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}>
                <div className="flex items-start justify-between mb-1">
                  <p className="text-lg font-black text-white">{s.val}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${G}25`, color: "#6effc4" }}>
                    {s.delta}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center gap-2.5">
          <ShieldCheck size={13} style={{ color: G }} />
          <span className="text-[10px] text-slate-600">256-bit TLS · SOC 2 Type II · ISO 27001 Compliant</span>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col bg-[#070b14]">

        {/* Mobile top bar */}
        <div className="lg:hidden px-5 py-4 border-b border-[#1a2535] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: G }}>
              <IndianRupee size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white">BharatBazar</p>
              <p className="text-[8px] font-bold text-green-400 uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-400 font-semibold">Live</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">

            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-5"
                style={{ borderColor: `${G}35`, background: `${G}10` }}>
                <ShieldCheck size={12} style={{ color: G }} />
                <span className="text-[11px] font-bold" style={{ color: G }}>Authorized Personnel Only</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-2 leading-tight">
                Welcome back,<br />Admin
              </h2>
              <p className="text-slate-500 text-sm">Enter your credentials. All access is logged.</p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wide uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@bharatbazar.com" type="email"
                    className={`${inp} pl-11`}
                    onKeyDown={e => e.key === "Enter" && (document.getElementById("apwd") as HTMLInputElement)?.focus()} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 tracking-wide uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input id="apwd" value={password} onChange={e => setPassword(e.target.value)}
                    type={showPass ? "text" : "password"} placeholder="Your admin password"
                    className={`${inp} pl-11 pr-13`}
                    onKeyDown={e => e.key === "Enter" && handleLogin()} />
                  <button onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-red-500/25 bg-red-500/10">
                  <AlertCircle size={15} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm font-semibold">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10">
                  <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
                  <p className="text-emerald-400 text-sm font-semibold">{success}</p>
                </motion.div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div className="w-4.5 h-4.5 rounded border border-[#2a3d58] bg-[#0c1628] flex items-center justify-center" style={{ width: 18, height: 18 }}>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Remember for 30 days</span>
                </label>
                <button className="text-xs font-bold hover:underline transition-colors" style={{ color: G }}>
                  Reset password
                </button>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogin} disabled={loading}
                className="w-full py-4 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2.5 mt-2"
                style={{ background: `linear-gradient(135deg, ${GD}, ${G})`, boxShadow: `0 6px 24px ${G}35` }}>
                {loading ? (
                  <motion.div animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>Access Dashboard <ArrowRight size={16} /></>
                )}
              </motion.button>
            </div>

            {/* Back to store */}
            <p className="text-center text-xs text-slate-600 mt-5">
              Not an admin?{" "}
              <button onClick={() => setPage("home")}
                className="font-bold hover:underline" style={{ color: G }}>
                Return to store
              </button>
            </p>

            {/* Security badges */}
            <div className="mt-8 pt-6 border-t border-[#1a2535]">
              <div className="grid grid-cols-3 gap-2">
                {["🔒 SSL/TLS", "📋 Audit Log", "🛡️ 2FA Ready"].map(t => (
                  <div key={t}
                    className="text-center text-[10px] text-slate-600 font-semibold bg-[#0c1628] rounded-lg py-2.5 border border-[#1a2535]">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
