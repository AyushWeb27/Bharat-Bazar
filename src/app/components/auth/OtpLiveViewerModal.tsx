"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, RefreshCw, KeyRound, Check, Copy, Clock, ShieldCheck, Database } from "lucide-react";
import { G } from "../data/index";

interface OtpRecord {
  id: number;
  identifier: string;
  type: string;
  otp_code: string;
  expires_at: string;
  verified: boolean;
  attempts: number;
  created_at: string;
  status: "active" | "verified" | "expired";
}

interface OtpLiveViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOtp?: (code: string) => void;
}

export function OtpLiveViewerModal({ isOpen, onClose, onSelectOtp }: OtpLiveViewerModalProps) {
  const [otps, setOtps] = useState<OtpRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const fetchOtps = async () => {
    setLoading(true);
    try {
      const url = filterType === "all" ? "/api/auth/otp/list" : `/api/auth/otp/list?type=${filterType}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setOtps(data.otps || []);
      }
    } catch (e) {
      console.error("Failed to fetch OTPs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOtps();
    }
  }, [isOpen, filterType]);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-xl max-h-[85vh] bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${G}15 0%, #00cc880a 100%)` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                style={{ background: G }}>
                <KeyRound size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-foreground">Verification OTPs</h3>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Database size={10} /> Active Records
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All active verification codes generated for sign in &amp; registration
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchOtps}
                disabled={loading}
                title="Refresh OTP records"
                className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <RefreshCw size={15} className={loading ? "animate-spin text-[#009966]" : ""} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Type Filter Tabs */}
          <div className="px-5 py-3 border-b border-border flex items-center gap-1.5 overflow-x-auto scrollbar-hide bg-muted/40">
            {[
              { id: "all", label: "All Types" },
              { id: "phone_login", label: "Phone Login" },
              { id: "registration", label: "Registration" },
              { id: "email_login", label: "Email Login" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all"
                style={
                  filterType === tab.id
                    ? { background: G, color: "#fff", boxShadow: `0 2px 8px ${G}44` }
                    : { color: "var(--muted-foreground)" }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List of OTPs */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-border/40">
            {loading && otps.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                <RefreshCw size={24} className="animate-spin text-[#009966]" />
                <span>Fetching OTP records...</span>
              </div>
            ) : otps.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <p className="font-semibold">No OTP records found for this filter.</p>
                <p className="text-xs mt-1">Request an OTP in Sign In or Register to see it appear here in real-time!</p>
              </div>
            ) : (
              otps.map((o) => (
                <div key={o.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {/* OTP Code Badge */}
                      <span className="font-mono text-base font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-[#009966] border border-emerald-500/25 tracking-widest">
                        {o.otp_code}
                      </span>

                      {/* Type Badge */}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                        {o.type.replace("_", " ")}
                      </span>

                      {/* Status */}
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                        style={
                          o.status === "active"
                            ? { background: "#10b98120", color: "#10b981" }
                            : o.status === "verified"
                            ? { background: "#3b82f620", color: "#3b82f6" }
                            : { background: "#9ca3af20", color: "#9ca3af" }
                        }
                      >
                        {o.status === "active" ? "● Active" : o.status === "verified" ? "✓ Verified" : "Expired"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{o.identifier}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock size={11} /> {new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onSelectOtp && o.status === "active" && (
                      <button
                        onClick={() => {
                          onSelectOtp(o.otp_code);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-black text-white hover:opacity-90 transition-opacity"
                        style={{ background: G }}
                      >
                        Use OTP
                      </button>
                    )}
                    <button
                      onClick={() => copyToClipboard(o.otp_code, o.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-muted/60 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                    >
                      {copiedId === o.id ? (
                        <>
                          <Check size={12} className="text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={14} className="text-[#009966]" />
              Secure Database Verification
            </span>
            <span className="text-[11px] font-bold">Total: {otps.length} records</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
