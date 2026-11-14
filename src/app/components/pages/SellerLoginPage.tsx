"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Eye, EyeOff, Mail, Lock, Store, CheckCircle2, ShoppingBag, AlertCircle, Loader2, ArrowRight,
} from "lucide-react";

declare global {
  interface Window {
    google?: any;
    __googleGsiLoaded?: boolean;
  }
}

const S = "#009966";

const FEATURES = [
  "2Cr+ active shoppers across India",
  "Zero setup cost — list products in minutes",
  "Real-time analytics and sales insights",
  "Weekly payouts directly to your bank",
];

const STATS = [
  { val: "1.4L+",     label: "Sellers"       },
  { val: "₹2,800Cr+", label: "GMV"           },
  { val: "4.8★",      label: "Rating"        },
];

export function SellerLoginPage({
  setPage,
  onLoginSuccess,
}: {
  setPage: (p: any) => void;
  onLoginSuccess?: () => void;
}) {
  const [email,          setEmail         ] = useState("");
  const [password,       setPassword      ] = useState("");
  const [showPassword,   setShowPassword  ] = useState(false);
  const [loading,        setLoading       ] = useState(false);
  const [googleLoading,  setGoogleLoading ] = useState(false);
  const [errorMessage,   setErrorMessage  ] = useState("");
  const [googleNotFound, setGoogleNotFound] = useState<{ email: string; name: string } | null>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "470811948482-mca375qbpj3pkjjmso3ranuahjqssfpt.apps.googleusercontent.com";

  // Load Google Identity Services script
  useEffect(() => {
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (res: any) => {
              if (res?.credential) {
                authenticateWithGoogle({ credential: res.credential });
              }
            },
            auto_select: false,
          });
        } catch (e) {
          console.warn("GSI ID init error:", e);
        }
      }
    };

    if (typeof window !== "undefined") {
      if (!document.getElementById("google-gsi-script")) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          window.__googleGsiLoaded = true;
          initGsi();
        };
        document.body.appendChild(script);
      } else {
        initGsi();
      }
    }
  }, [clientId]);

  const inp =
    "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all";

  // Standard Email/Password Login
  const handleSubmit = async () => {
    setLoading(true);
    setGoogleNotFound(null);
    if (!email.trim() || !password) {
      setErrorMessage("Please enter your registered email and password.");
      setLoading(false);
      return;
    }
    setErrorMessage("");
    try {
      const res = await fetch("/api/seller/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to sign in. Please verify your credentials.");
        setLoading(false);
        return;
      }
      setLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        setPage("seller");
        if (typeof window !== "undefined" && window.location.pathname === "/seller") {
          window.location.reload();
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Google Authentication Handler
  const authenticateWithGoogle = async (payload: { credential?: string; access_token?: string }) => {
    setGoogleLoading(true);
    setErrorMessage("");
    setGoogleNotFound(null);

    try {
      const res = await fetch("/api/seller/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.notRegistered) {
          // Seller email is not registered in database
          setGoogleNotFound({
            email: data.email || "",
            name: data.name || "",
          });
          setErrorMessage(
            data.message ||
              `No merchant account found for "${data.email}". Please register your store first.`
          );
        } else {
          setErrorMessage(data.message || "Google authentication failed. Please try again.");
        }
        setGoogleLoading(false);
        return;
      }

      // Successful Google Sign-In with registered seller email
      setGoogleLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        setPage("seller");
        if (typeof window !== "undefined" && window.location.pathname === "/seller") {
          window.location.reload();
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during Google authentication.");
      setGoogleLoading(false);
    }
  };

  // Trigger Google Login
  const handleGoogleClick = () => {
    if (loading || googleLoading) return;
    setErrorMessage("");
    setGoogleNotFound(null);

    // 1. Preferred modern popup flow using OAuth2 Token Client
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile openid",
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              if (tokenResponse.error !== "access_denied") {
                setErrorMessage("Google Sign-In was cancelled or failed.");
              }
              setGoogleLoading(false);
              return;
            }
            if (tokenResponse.access_token) {
              await authenticateWithGoogle({ access_token: tokenResponse.access_token });
            }
          },
        });
        setGoogleLoading(true);
        client.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (err) {
        console.warn("OAuth2 token client init failed, trying ID prompt:", err);
      }
    }

    // 2. Fallback to Google ID One-Tap prompt
    if (window.google?.accounts?.id) {
      setGoogleLoading(true);
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
          setErrorMessage("Google Sign-In prompt was dismissed. Please check your browser popup settings.");
        }
      });
      return;
    }

    setErrorMessage("Google Identity Services are loading. Please try again in a few seconds.");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">

      {/* ── LEFT COLUMN — Form ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white"
      >
        <div className="w-full max-w-sm mx-auto">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg shrink-0"
              style={{ background: S }}
            >
              <ShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">BharatBazar</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: S }}>
                Seller Portal
              </p>
            </div>
          </div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="mb-7"
          >
            <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">
              Welcome back, Seller
            </h1>
            <p className="text-sm text-gray-500">Manage your store, orders &amp; earnings</p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.35 }}
            className="space-y-4"
          >
            {/* Google Not Registered Banner */}
            {googleNotFound && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Merchant Account Not Found</p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      <strong>{googleNotFound.email}</strong> is not registered as a seller in our database.
                      Register your merchant store below to gain access.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.setItem(
                        "seller_google_prefill",
                        JSON.stringify({
                          email: googleNotFound.email,
                          name: googleNotFound.name,
                        })
                      );
                    } catch {}
                    setPage("seller-register");
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[#009966] text-white font-bold text-xs hover:bg-[#007a52] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Register Store with {googleNotFound.email}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}

            {errorMessage && !googleNotFound && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seller@example.com"
                  className={`${inp} pl-10`}
                  onKeyDown={e => e.key === "Enter" && (document.getElementById("spwd") as HTMLInputElement)?.focus()}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="spwd"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={`${inp} pl-10 pr-11`}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button className="text-xs font-bold hover:underline" style={{ color: S }}>
                Forgot Password?
              </button>
            </div>

            {/* Sign In button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={loading || googleLoading}
              className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-75"
              style={{ background: loading ? "#007a52" : S, boxShadow: `0 6px 20px ${S}40` }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                "Sign In"
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google Sign In */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleClick}
              disabled={loading || googleLoading}
              className="w-full py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {googleLoading ? (
                <Loader2 size={16} className="animate-spin text-[#009966]" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>{googleLoading ? "Connecting to Google..." : "Sign in with Google"}</span>
            </motion.button>

            {/* Register link */}
            <p className="text-center text-sm text-gray-500">
              New seller?{" "}
              <button type="button" onClick={() => setPage("seller-register")} className="font-bold hover:underline" style={{ color: S }}>
                Register →
              </button>
            </p>
          </motion.div>

          {/* Footer — Admin login */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-center text-xs text-gray-400 mt-8"
          >
            BharatBazar admin?{" "}
            <button
              onClick={() => setPage("admin-login")}
              className="font-bold hover:underline text-gray-600"
            >
              Admin login →
            </button>
          </motion.p>
        </div>
      </motion.div>

      {/* ── RIGHT COLUMN — Dark green promo ── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[50%] xl:w-[52%] relative overflow-hidden flex-col justify-center px-12 xl:px-16 py-12"
        style={{ background: "linear-gradient(145deg, #0d1117 0%, #0d2318 60%, #1a2f23 100%)" }}
      >
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle, #009966 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full opacity-[0.12] blur-3xl pointer-events-none"
          style={{ background: "#009966" }} />
        <div className="absolute bottom-10 left-0 w-64 h-64 rounded-full opacity-[0.08] blur-3xl pointer-events-none"
          style={{ background: "#00cc88" }} />

        <div className="relative z-10 max-w-md">
          {/* Large icon with glow ring */}
          <div className="mb-8">
            <div className="relative w-20 h-20 mb-6">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full opacity-30 blur-md" style={{ background: S }} />
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,153,102,0.15)", border: "2px solid rgba(0,153,102,0.35)" }}>
                <Store size={36} style={{ color: S }} />
              </div>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-3">
              Grow Your Business<br />
              <span style={{ color: "#4ade80" }}>with BharatBazar</span>
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              India's fastest-growing marketplace for independent sellers.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-3 mb-10">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(0,153,102,0.2)" }}>
                  <CheckCircle2 size={12} style={{ color: S }} />
                </div>
                <span className="text-sm font-medium leading-snug" style={{ color: "rgba(255,255,255,0.75)" }}>{f}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="rounded-2xl p-3.5 text-center"
                style={{
                  background: "rgba(0,153,102,0.08)",
                  border: "1px solid rgba(0,153,102,0.2)",
                }}
              >
                <p className="text-lg font-black text-white leading-none mb-0.5">{s.val}</p>
                <p className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
