import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { G } from "../data/index";
import type { Page } from "../types/index";

export function ProfileAvatar({ dark, setDark, setPage, wish }: {
  dark: boolean; setDark: (v: boolean) => void;
  setPage: (p: Page) => void; wish: Set<number>;
}) {
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

  const menuItems = [
    { icon:"📦", label:"My Orders",        action:() => setPage("orders") },
    { icon:"❤️",  label:"Wishlist",         action:() => setPage("wishlist"), badge: wish.size || undefined },
    { icon:"🛍️", label:"My Cart",          action:() => setPage("cart"), badge: undefined },
    { icon:"📍", label:"My Addresses",     action:() => setPage("account") },
    { icon:"💳", label:"Payment Methods",  action:() => setPage("account") },
    { icon:"🎁", label:"Rewards & Offers", action:() => setPage("account") },
    { icon:"⚙️",  label:"Account Settings", action:() => setPage("account") },
  ];

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
            className="relative w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white z-10 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${G} 0%, #00cc88 50%, #00e5a0 100%)`,
              boxShadow: open ? `0 0 0 2px ${G}` : "none",
            }}
          >
            {/* Shine sweep */}
            <motion.div
              animate={{ x: hov ? ["-100%","120%"] : "-100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 skew-x-[-20deg] bg-white/30 w-1/2"
            />
            <span className="relative z-10 select-none">G</span>
          </div>
          {/* Online dot */}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card z-20"
            style={{ background: G }}
          />
        </div>

        {/* Name + chevron */}
        <div className="text-left leading-none hidden lg:block">
          <p className="text-[10px] text-muted-foreground font-medium">Hello,</p>
          <p className="text-xs font-black text-foreground">Guest</p>
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
            className="absolute right-0 top-[calc(100%+10px)] w-72 rounded-3xl border border-border bg-card shadow-2xl overflow-hidden z-50"
            style={{ boxShadow:`0 20px 60px -8px rgba(0,0,0,0.25), 0 0 0 1px ${G}18` }}
          >
            {/* Profile header */}
            <div className="relative p-5 overflow-hidden"
              style={{ background:`linear-gradient(135deg, ${G}22 0%, #00cc8812 100%)` }}>
              {/* BG decorative circle */}
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-10"
                style={{ background: G }} />
              <div className="relative flex items-center gap-3">
                {/* Large avatar */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg"
                    style={{ background:`linear-gradient(135deg, ${G}, #00cc88)` }}>
                    G
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card"
                    style={{ background: G }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-foreground text-sm">Guest User</p>
                  <p className="text-muted-foreground text-[11px] truncate">Sign in for better experience</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { setPage("signin"); setOpen(false); }} className="text-[10px] font-black text-white px-3 py-1 rounded-full hover:opacity-90 transition-opacity"
                      style={{ background: G }}>Sign In</button>
                    <button onClick={() => { setPage("register"); setOpen(false); }} className="text-[10px] font-black px-3 py-1 rounded-full border border-border text-foreground hover:border-[#009966] transition-colors">
                      Register
                    </button>
                  </div>
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
                  transition={{ delay: i * 0.04 }}
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
              <button onClick={() => { setPage("signin"); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                <span className="text-base">🚪</span>
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
