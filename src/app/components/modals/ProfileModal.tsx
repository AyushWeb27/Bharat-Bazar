import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight } from "lucide-react";
import { G } from "../data/index";
import type { Page } from "../types/index";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  setPage: (p: Page) => void;
}

export function ProfileModal({ open, onClose, dark, setDark, setPage }: ProfileModalProps) {
  const menuItems = [
    { icon:"📦", label:"My Orders",        action:() => {} },
    { icon:"❤️",  label:"Wishlist",         action:() => { setPage("wishlist"); onClose(); } },
    { icon:"🛍️", label:"My Cart",          action:() => { setPage("cart"); onClose(); } },
    { icon:"📍", label:"My Addresses",     action:() => {} },
    { icon:"💳", label:"Payment Methods",  action:() => {} },
    { icon:"🎁", label:"Rewards & Offers", action:() => {} },
    { icon:"⚙️",  label:"Account Settings", action:() => {} },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -20 }}
            transition={{ type:"spring", damping:26, stiffness:380 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] max-w-[calc(100vw-2rem)] rounded-3xl border border-border bg-card shadow-2xl overflow-hidden z-[160]"
            style={{ boxShadow:`0 24px 80px -8px rgba(0,0,0,0.35), 0 0 0 1px ${G}20` }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-foreground hover:bg-black/20 dark:hover:bg-white/20 transition-colors z-10"
            >
              <X size={14} />
            </button>

            {/* Profile header */}
            <div className="relative p-6 overflow-hidden"
              style={{ background:`linear-gradient(135deg, ${G} 0%, #00cc88 100%)` }}>
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

              <div className="relative flex items-center gap-4">
                {/* Large avatar */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl text-white shadow-lg bg-white/20 backdrop-blur-sm border border-white/30">
                    G
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-base">Guest User</p>
                  <p className="text-white/70 text-xs truncate">Sign in for better experience</p>
                  <div className="flex gap-2 mt-2.5">
                    <button className="text-[11px] font-black text-[#009966] bg-white px-3.5 py-1.5 rounded-full hover:bg-white/90 transition-opacity shadow-sm">
                      Sign In
                    </button>
                    <button className="text-[11px] font-black text-white px-3.5 py-1.5 rounded-full border border-white/40 bg-white/15 hover:bg-white/25 transition-colors">
                      Register
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-3">
              {menuItems.map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group/item text-left"
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <span className="text-sm font-semibold text-foreground flex-1">{item.label}</span>
                  <ChevronRight size={12} className="text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>

            {/* Dark mode toggle */}
            <div className="mx-3 mb-3 px-3 py-2.5 rounded-xl bg-muted flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{dark ? "🌙" : "☀️"}</span>
                <span className="text-sm font-semibold text-foreground">{dark ? "Dark Mode" : "Light Mode"}</span>
              </div>
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

            {/* Sign out */}
            <div className="border-t border-border mx-3 mb-3 pt-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                <span className="text-base">🚪</span>
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
