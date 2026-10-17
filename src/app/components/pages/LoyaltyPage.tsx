import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy, Star, Gift, Truck, Users, ChevronDown, ChevronRight,
  ArrowLeft, Zap, ShoppingBag, MessageSquare,
} from "lucide-react";
import { G, GD } from "../data/index";
import type { Page } from "../types/index";

const TIERS = [
  { name: "Bronze", min: 0, max: 499, color: "#cd7f32", emoji: "🥉" },
  { name: "Silver", min: 500, max: 1999, color: "#9ca3af", emoji: "🥈" },
  { name: "Gold", min: 2000, max: 4999, color: "#f59e0b", emoji: "🥇" },
  { name: "Platinum", min: 5000, max: Infinity, color: "#6366f1", emoji: "💎" },
];

const USER_POINTS = 1250;
const CURRENT_TIER = TIERS[1]; // Silver
const NEXT_TIER = TIERS[2]; // Gold
const POINTS_TO_NEXT = NEXT_TIER.min - USER_POINTS; // 750

const ACTIVITY = [
  { date: "4 Oct 2026", desc: "Purchase — Samsung Galaxy S24", points: +90, type: "earn" },
  { date: "2 Oct 2026", desc: "Product Review — Saree", points: +50, type: "earn" },
  { date: "28 Sep 2026", desc: "Redeemed — ₹100 Off Coupon", points: -1000, type: "redeem" },
  { date: "25 Sep 2026", desc: "Referral Reward — Priya Sharma", points: +200, type: "earn" },
  { date: "20 Sep 2026", desc: "Purchase — Spice Box", points: +35, type: "earn" },
  { date: "15 Sep 2026", desc: "Purchase — Ayurvedic Kit", points: +100, type: "earn" },
  { date: "10 Sep 2026", desc: "Welcome Bonus", points: +500, type: "earn" },
  { date: "10 Sep 2026", desc: "Redeemed — Free Delivery Month", points: -500, type: "redeem" },
];

const REWARDS = [
  { id: 1, title: "₹100 Off Coupon", pts: 1000, emoji: "🎟️", desc: "Valid on orders above ₹500", color: "#f97316" },
  { id: 2, title: "Free Delivery Month", pts: 500, emoji: "🚚", desc: "30 days of free delivery", color: G },
  { id: 3, title: "₹500 Off Coupon", pts: 5000, emoji: "💰", desc: "Valid on orders above ₹1,000", color: "#8b5cf6" },
];

const EARN_WAYS = [
  { icon: <ShoppingBag size={22} />, title: "Shop & Earn", desc: "1 BB Point for every ₹10 spent", rate: "1 pt / ₹10", color: G },
  { icon: <MessageSquare size={22} />, title: "Write a Review", desc: "Rate & review purchased products", rate: "+50 pts", color: "#3b82f6" },
  { icon: <Users size={22} />, title: "Refer a Friend", desc: "When they place their first order", rate: "+200 pts", color: "#f59e0b" },
];

export function LoyaltyPage({ setPage }: { setPage: (p: Page) => void }) {
  const [termsOpen, setTermsOpen] = useState(false);
  const [redeemed, setRedeemed] = useState<number | null>(null);

  const tierProgress = ((USER_POINTS - CURRENT_TIER.min) / (NEXT_TIER.min - CURRENT_TIER.min)) * 100;

  return (
    <div className="max-w-3xl mx-auto">
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
          <h1 className="text-2xl font-black text-foreground">BharatBazar Rewards</h1>
          <p className="text-xs text-muted-foreground">Earn points, unlock perks</p>
        </div>
      </div>

      {/* Hero balance card */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden mb-5"
        style={{ background: `linear-gradient(135deg, ${GD} 0%, ${G} 60%, #00cc88 100%)` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)" }} />
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{CURRENT_TIER.emoji}</span>
                <span className="text-white/80 text-sm font-black">{CURRENT_TIER.name} Member</span>
              </div>
              <p className="text-4xl font-black text-white mt-2">{USER_POINTS.toLocaleString()} <span className="text-2xl">pts</span></p>
              <p className="text-white/70 text-sm mt-1">= ₹{(USER_POINTS / 10).toLocaleString()} value</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Trophy size={28} className="text-white" />
            </div>
          </div>

          {/* Progress to next tier */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-white/80 text-xs font-bold">Progress to {NEXT_TIER.name} {NEXT_TIER.emoji}</p>
              <p className="text-white text-xs font-black">{POINTS_TO_NEXT} pts more</p>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${tierProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tier ladder */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-5">
        <h2 className="text-sm font-black text-foreground mb-4">Membership Tiers</h2>
        <div className="flex items-center gap-0">
          {TIERS.map((tier, i) => {
            const active = tier.name === CURRENT_TIER.name;
            const done = TIERS.indexOf(tier) < TIERS.indexOf(CURRENT_TIER);
            const isLast = i === TIERS.length - 1;
            return (
              <div key={tier.name} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 transition-all"
                    style={{
                      background: active ? tier.color : done ? "#e6fff5" : "var(--muted)",
                      borderColor: active || done ? tier.color : "var(--border)",
                    }}>
                    {tier.emoji}
                  </div>
                  <p className="text-[9px] font-black text-center"
                    style={{ color: active ? tier.color : done ? G : "var(--muted-foreground)" }}>
                    {tier.name}
                  </p>
                  <p className="text-[8px] text-muted-foreground text-center">
                    {tier.min === 0 ? "0–499" : tier.max === Infinity ? `${tier.min}+` : `${tier.min}–${tier.max}`}
                  </p>
                </div>
                {!isLast && (
                  <div className="flex-1 h-0.5 mb-5"
                    style={{ background: done || active ? tier.color : "var(--border)" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ways to earn */}
      <div className="mb-5">
        <h2 className="text-base font-black text-foreground mb-3">3 Ways to Earn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EARN_WAYS.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: w.color + "20", color: w.color }}>
                {w.icon}
              </div>
              <div>
                <p className="text-sm font-black text-foreground">{w.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{w.desc}</p>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full self-start" style={{ background: w.color + "15", color: w.color }}>
                {w.rate}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Redeem section */}
      <div className="mb-5">
        <h2 className="text-base font-black text-foreground mb-3">Redeem Points</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {REWARDS.map((r, i) => {
            const canRedeem = USER_POINTS >= r.pts;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3"
              >
                <div className="text-3xl">{r.emoji}</div>
                <div>
                  <p className="text-sm font-black text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-black" style={{ color: r.color }}>{r.pts.toLocaleString()} pts</span>
                  <AnimatePresence mode="wait">
                    {redeemed === r.id ? (
                      <motion.span
                        key="done"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-[10px] font-black text-white px-3 py-1.5 rounded-xl"
                        style={{ background: G }}
                      >
                        Redeemed!
                      </motion.span>
                    ) : (
                      <motion.button
                        key="btn"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => canRedeem && setRedeemed(r.id)}
                        className="text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all"
                        style={canRedeem
                          ? { borderColor: r.color, color: r.color, background: r.color + "10" }
                          : { borderColor: "var(--border)", color: "var(--muted-foreground)", cursor: "not-allowed" }
                        }
                      >
                        {canRedeem ? "Redeem" : "Insufficient"}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent activity table */}
      <div className="mb-5">
        <h2 className="text-base font-black text-foreground mb-3">Recent Activity</h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {ACTIVITY.map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: row.type === "earn" ? "#e6fff5" : "#fef2f2" }}
                >
                  {row.type === "earn"
                    ? <Zap size={14} style={{ color: G }} />
                    : <Gift size={14} className="text-red-400" />
                  }
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{row.desc}</p>
                  <p className="text-[10px] text-muted-foreground">{row.date}</p>
                </div>
              </div>
              <span
                className="text-sm font-black shrink-0"
                style={{ color: row.type === "earn" ? G : "#ef4444" }}
              >
                {row.type === "earn" ? "+" : ""}{row.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Terms collapsible */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
        <button
          onClick={() => setTermsOpen(!termsOpen)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-black text-foreground"
        >
          <span>Terms & Conditions</span>
          <motion.div animate={{ rotate: termsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} className="text-muted-foreground" />
          </motion.div>
        </button>
        <AnimatePresence>
          {termsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 text-xs text-muted-foreground space-y-2 border-t border-border pt-4">
                <p>• BB Points are earned on eligible purchases only. Gift cards and service fees are excluded.</p>
                <p>• Points expire 12 months after the last transaction date.</p>
                <p>• Referral points are credited once the referee places their first qualifying order of ₹200 or more.</p>
                <p>• BharatBazar reserves the right to modify or discontinue the rewards program at any time.</p>
                <p>• Points have no cash value and cannot be transferred to another account.</p>
                <p>• Redeemed coupons are valid for 30 days from the date of redemption.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
