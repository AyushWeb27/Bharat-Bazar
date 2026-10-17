import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Copy, Check, ArrowLeft, Share2, Gift, Users, ChevronRight,
  Clock, CheckCircle,
} from "lucide-react";
import { G, GD } from "../data/index";
import type { Page } from "../types/index";

const REFERRAL_CODE = "BHARATXX1234";
const REFERRAL_LINK = `https://bharatbazar.in/join?ref=${REFERRAL_CODE}`;

const REFERRED_FRIENDS = [
  { name: "Priya Sharma", avatar: "👩", date: "25 Sep 2026", status: "Rewarded", earned: 200 },
  { name: "Rahul Verma", avatar: "👨", date: "10 Oct 2026", status: "Pending", earned: 0 },
  { name: "Meena Patel", avatar: "👩‍🦱", date: "1 Oct 2026", status: "Rewarded", earned: 200 },
];

const STEPS = [
  { num: "1", icon: <Share2 size={20} />, title: "Share Your Link", desc: "Send your unique referral link to friends & family", color: G },
  { num: "2", icon: <Users size={20} />, title: "Friend Registers & Orders", desc: "They sign up and place their first order of ₹200+", color: "#3b82f6" },
  { num: "3", icon: <Gift size={20} />, title: "Both Get ₹200 Cashback!", desc: "Cashback credited to both wallets within 24 hours", color: "#f59e0b" },
];

export function ReferPage({ setPage }: { setPage: (p: Page) => void }) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(REFERRAL_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const totalEarned = REFERRED_FRIENDS.filter((f) => f.status === "Rewarded").reduce((a, f) => a + f.earned, 0);
  const totalReferred = REFERRED_FRIENDS.length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setPage("home" as any)}
          className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
        </motion.button>
        <div>
          <h1 className="text-2xl font-black text-foreground">Refer & Earn</h1>
          <p className="text-xs text-muted-foreground">Share the love, earn together</p>
        </div>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden mb-6"
        style={{ background: `linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
        <div className="relative p-7 text-center">
          <div className="text-5xl mb-3">🎁</div>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Earn ₹200 for every<br />friend you refer!
          </h2>
          <p className="text-white/75 mt-2 text-sm">
            Your friend gets ₹200 too — everyone wins!
          </p>
          <div className="flex justify-center gap-4 mt-5">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-center">
              <p className="text-xl font-black text-white">{totalReferred}</p>
              <p className="text-white/70 text-[10px] font-bold">Friends Referred</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-center">
              <p className="text-xl font-black text-white">₹{totalEarned}</p>
              <p className="text-white/70 text-[10px] font-bold">Total Earned</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* How it works */}
      <div className="mb-6">
        <h2 className="text-base font-black text-foreground mb-4">How It Works</h2>
        <div className="space-y-0">
          {STEPS.map((step, i) => {
            const isLast = i === STEPS.length - 1;
            return (
              <div key={step.num} className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: step.color + "20", color: step.color }}>
                    {step.icon}
                  </div>
                  {!isLast && <div className="w-0.5 h-6 bg-border my-1" />}
                </div>
                <div className={`${isLast ? "pb-0" : "pb-4"} flex-1 pt-2`}>
                  <p className="text-sm font-black text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral code */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-5">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Your Referral Code</p>
        <div className="flex items-center gap-3">
          <div
            className="flex-1 flex items-center justify-center rounded-2xl border-2 border-dashed py-4 px-5 text-2xl font-black tracking-[0.25em]"
            style={{ borderColor: G, color: G, background: "#e6fff5" }}
          >
            {REFERRAL_CODE}
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleCopyCode}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${GD}, ${G})` }}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check size={18} />
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Copy size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
        <AnimatePresence>
          {copied && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-bold text-center mt-2"
              style={{ color: G }}
            >
              Code copied to clipboard!
            </motion.p>
          )}
        </AnimatePresence>

        {/* Copy link */}
        <div className="mt-4 flex items-center gap-2 bg-muted rounded-xl px-4 py-3">
          <p className="text-xs text-muted-foreground truncate flex-1 font-mono">{REFERRAL_LINK}</p>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopyLink}
            className="text-[10px] font-black shrink-0 px-3 py-1.5 rounded-lg text-white"
            style={{ background: G }}
          >
            {linkCopied ? "Copied!" : "Copy"}
          </motion.button>
        </div>
      </div>

      {/* Share via */}
      <div className="mb-5">
        <h2 className="text-sm font-black text-foreground mb-3">Share Via</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: "WhatsApp", emoji: "💬", color: "#25d366", href: `https://wa.me/?text=Join+BharatBazar+and+get+₹200+off!+Use+my+code:+${REFERRAL_CODE}+${encodeURIComponent(REFERRAL_LINK)}` },
            { name: "Instagram", emoji: "📸", color: "#e1306c", href: `https://instagram.com` },
            { name: "Email", emoji: "📧", color: "#3b82f6", href: `mailto:?subject=Join+BharatBazar+%26+Get+₹200+Off!&body=Hi!+Use+my+referral+code+${REFERRAL_CODE}+on+BharatBazar.+We+both+get+₹200+cashback!+${REFERRAL_LINK}` },
            { name: "SMS", emoji: "💬", color: "#6366f1", href: `sms:?body=Join+BharatBazar+and+get+₹200+off!+Use+code:+${REFERRAL_CODE}+or+click:+${REFERRAL_LINK}` },
          ].map((s) => (
            <motion.a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -3 }}
              className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl py-4 px-2 cursor-pointer transition-colors hover:border-[#009966]"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: s.color + "15" }}
              >
                {s.emoji}
              </div>
              <p className="text-[10px] font-bold text-muted-foreground">{s.name}</p>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Referred friends */}
      <div className="mb-5">
        <h2 className="text-sm font-black text-foreground mb-3">
          Your Referrals · {totalReferred} friends
        </h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {REFERRED_FRIENDS.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-border last:border-0">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl shrink-0">
                {f.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground">{f.name}</p>
                <p className="text-[10px] text-muted-foreground">{f.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {f.status === "Rewarded" ? (
                  <>
                    <span className="text-xs font-black" style={{ color: G }}>+₹{f.earned}</span>
                    <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "#e6fff5", color: G }}>
                      <CheckCircle size={10} /> Rewarded
                    </span>
                  </>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                    <Clock size={10} /> Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms card */}
      <div className="bg-muted/40 border border-border rounded-2xl p-5 mb-6">
        <h3 className="text-xs font-black text-foreground mb-3 flex items-center gap-1.5">
          📋 Terms & Conditions
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>• Cashback is credited after the referee places a qualifying order of ₹200 or more.</li>
          <li>• Both referrer and referee must have verified accounts.</li>
          <li>• Maximum 10 referral rewards per account per month.</li>
          <li>• Cashback is credited to BharatBazar wallet within 24 hours of qualifying order.</li>
          <li>• BharatBazar reserves the right to reverse rewards in case of fraud or returns.</li>
          <li>• Self-referrals and duplicate accounts will result in account suspension.</li>
        </ul>
      </div>
    </div>
  );
}
