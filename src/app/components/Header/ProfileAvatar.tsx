import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, CheckCircle, LogOut } from "lucide-react";
import { G } from "../data/index";
import type { Page } from "../types/index";
import { useApp } from "../../context/AppContext";

export function ProfileAvatar({ dark, setDark, setPage, wish }: {
  dark: boolean; setDark: (v: boolean) => void;
  setPage: (p: Page) => void; wish: Set<number>;
}) {
  const { user, logoutUser } = useApp();
  const [open, setOpen] = useState(false);
  const [hov,  setHov]  = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allMenuItems = [
    { icon:"📦", label:"My Orders",        action:() => setPage("orders"),   requiresAuth: true  },
    { icon:"❤️",  label:"Wishlist",         action:() => setPage("wishlist"), badge: wish.size || undefined, requiresAuth: false },
    { icon:"🛍️", label:"My Cart",          action:() => setPage("cart"),     badge: undefined,              requiresAuth: false },
    { icon:"📍", label:"My Addresses",     action:() => setPage("account"),  requiresAuth: true  },
    { icon:"💳", label:"Payment Methods",  action:() => setPage("account"),  requiresAuth: true  },
    { icon:"🎁", label:"Rewards & Offers", action:() => setPage("account"),  requiresAuth: true  },
    { icon:"⚙️",  label:"Account Settings", action:() => setPage("account"), requiresAuth: true  },
  ];

  // Only show auth-required items when logged in
  const menuItems = allMenuItems.filter(item => !item.requiresAuth || !!user);

  const displayName = user ? user.name : "Guest";
  const firstName = user ? user.name.split(" ")[0] : "Guest";
  const initial = user ? user.name.charAt(0).toUpperCase() : "G";

  return (
    <div ref={ref} className="relative hidden md:block">
      {/* ── TRIGGER BUTTON ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        whileTap={{ scale: 0.93 }}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-2xl hover:bg-muted transition-colors group"
      >
        {/* Avatar ring + circle */}
        <div className="relative">
          {/* Animated ring */}
          <motion.div
            animate={{ rotate: hov || open ? 360 : 0, scale: hov || open ? 1.15 : 1 }}
            transition={{ rotate:{ duration: 3, repeat: hov || open ? Infinity : 0, ease:"linear" }, scale:{ duration:0.2 } }}
            className="absolute -inset-[3px] rounded-full"
            style={{
              background: open
                ? `conic-gradient(from 0deg, ${G}, #00cc88, #fbbf24, ${G})`
                : hov
                ? `conic-gradient(from 0deg, ${G}, #00e676, ${G})`
                : "transparent",
              padding: 2,
            }}
          />
          {/* Avatar circle */}
          <div
            className="relative w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white z-10 overflow-hidden shadow"
            style={{
              background: `linear-gradient(135deg, ${G} 0%, #00cc88 50%, #00e5a0 100%)`,
              boxShadow: open ? `0 0 0 2px ${G}` : "none",
            }}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <>
                {/* Shine sweep */}
                <motion.div
                  animate={{ x: hov ? ["-100%","120%"] : "-100%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0 skew-x-[-20deg] bg-white/30 w-1/2"
                />
                <span className="relative z-10 select-none">{initial}</span>
              </>
            )}
          </div>
          {/* Online dot */}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card z-20"
            style={{ background: user ? "#10b981" : G }}
          />
        </div>

        {/* Name + chevron */}
        <div className="text-left leading-none hidden lg:block max-w-[105px]">
          <p className="text-[10px] text-muted-foreground font-medium">Hello,</p>
          <p className="text-xs font-black text-foreground truncate">{firstName}</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={12} className="text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* ── DROPDOWN PANEL ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type:"spring", damping:26, stiffness:380 }}
            className="absolute right-0 top-[calc(100%+10px)] w-80 rounded-3xl border border-border bg-card shadow-2xl overflow-hidden z-50"
            style={{ boxShadow:`0 20px 60px -8px rgba(0,0,0,0.25), 0 0 0 1px ${G}18` }}
          >
            {/* Profile header */}
            <div className="relative p-5 overflow-hidden"
              style={{ background:`linear-gradient(135deg, ${G}22 0%, #00cc8812 100%)` }}>
              {/* BG decorative circle */}
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10"
                style={{ background: G }} />
              <div className="relative flex items-start gap-3">
                {/* Large avatar */}
                <div className="relative shrink-0 mt-0.5">
                  <div className="w-13 h-13 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg overflow-hidden"
                    style={{ width: 52, height: 52, background:`linear-gradient(135deg, ${G}, #00cc88)` }}>
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card"
                    style={{ background: user ? "#10b981" : G }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-foreground text-sm truncate">{displayName}</p>
                  <p className="text-muted-foreground text-[11px] truncate mt-0.5">
                    {user ? user.email : "Sign in for a personalized experience"}
                  </p>

                  {user ? (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                        <CheckCircle size={10} /> Email Verified
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-muted border border-border">
                        {user.auth_provider === "google" ? "Google Account" : "Verified Customer"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2.5">
                      <button onClick={() => { setPage("signin"); setOpen(false); }} className="text-[11px] font-black text-white px-3.5 py-1.5 rounded-full hover:opacity-90 transition-opacity shadow-sm"
                        style={{ background: G }}>Sign In</button>
                      <button onClick={() => { setPage("register"); setOpen(false); }} className="text-[11px] font-black px-3.5 py-1.5 rounded-full border border-border text-foreground hover:border-[#009966] transition-colors">
                        Register
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-2">
              {menuItems.map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => { item.action(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group/item text-left"
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <span className="text-sm font-semibold text-foreground flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded-full"
                      style={{ background: G }}>{item.badge}</span>
                  ) : (
                    <ChevronRight size={12} className="text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Dark mode toggle row */}
            <div className="mx-2 mb-2 px-3 py-2.5 rounded-xl bg-muted flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{dark ? "🌙" : "☀️"}</span>
                <span className="text-sm font-semibold text-foreground">{dark ? "Dark Mode" : "Light Mode"}</span>
              </div>
              {/* Pill toggle switch */}
              <motion.button
                onClick={() => setDark(!dark)}
                className="relative w-11 h-6 rounded-full transition-colors duration-300 flex items-center"
                style={{ background: dark ? G : "#d1d5db" }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  layout
                  transition={{ type:"spring", stiffness:500, damping:35 }}
                  className="absolute w-4 h-4 bg-white rounded-full shadow-md"
                  style={{ left: dark ? "calc(100% - 20px)" : 4 }}
                />
              </motion.button>
            </div>

            {/* Footer */}
            <div className="border-t border-border mx-2 mb-2 mt-1 pt-2">
              {user ? (
                <button
                  onClick={async () => {
                    await logoutUser();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors font-semibold text-sm"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => { setPage("signin"); setOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold hover:underline"
                  style={{ color: G }}
                >
                  Sign In to an Existing Account →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
