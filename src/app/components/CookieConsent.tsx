import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Cookie, Settings, CheckCircle } from "lucide-react";
import { G, GD } from "./data/index";

const STORAGE_KEY = "bb_cookie_consent";

type ConsentState = "accepted" | "declined" | null;

type Preferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalisation: boolean;
};

const DEFAULT_PREFS: Preferences = {
  essential: true,
  analytics: false,
  marketing: false,
  personalisation: false,
};

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [showManage, setShowManage] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setConsent(saved as ConsentState);
    }
    setMounted(true);
  }, []);

  function acceptAll() {
    const all: Preferences = { essential: true, analytics: true, marketing: true, personalisation: true };
    setPrefs(all);
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setShowManage(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setConsent("declined");
    setShowManage(false);
  }

  function savePrefs() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setShowManage(false);
  }

  function togglePref(key: keyof Preferences) {
    if (key === "essential") return;
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  }

  if (!mounted || consent !== null) return null;

  return (
    <AnimatePresence>
      <>
        {/* Main banner */}
        {!showManage && (
          <motion.div
            key="banner"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[200] p-3 sm:p-4"
          >
            <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${G}18` }}>
                  <Cookie size={18} style={{ color: G }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground mb-0.5">We use cookies 🍪</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We use cookies to improve your experience on BharatBazar. By continuing, you agree to our{" "}
                    <span className="font-semibold" style={{ color: G }}>Cookie Policy</span>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  onClick={decline}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground border border-border hover:border-foreground transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => setShowManage(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-foreground border border-border hover:border-[#009966] transition-colors"
                >
                  <Settings size={12} /> Manage
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={acceptAll}
                  className="px-5 py-2 rounded-xl text-white font-black text-xs flex items-center gap-1.5"
                  style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}
                >
                  <CheckCircle size={12} /> Accept All
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Manage Preferences Modal */}
        {showManage && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowManage(false); }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 200 }}
              className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Cookie size={18} style={{ color: G }} />
                  <h2 className="font-black text-foreground text-base">Cookie Preferences</h2>
                </div>
                <button
                  onClick={() => setShowManage(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {(
                  [
                    { key: "essential" as const, label: "Essential", desc: "Required for core Platform functionality. Cannot be disabled.", locked: true },
                    { key: "analytics" as const, label: "Analytics", desc: "Help us understand how you use BharatBazar to improve our services.", locked: false },
                    { key: "marketing" as const, label: "Marketing", desc: "Enable personalised ads and offers on BharatBazar and partner sites.", locked: false },
                    { key: "personalisation" as const, label: "Personalisation", desc: "Remember your preferences, language, region, and recently viewed items.", locked: false },
                  ]
                ).map(({ key, label, desc, locked }) => (
                  <div key={key} className="flex items-start gap-3 p-3 bg-muted rounded-2xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-black text-foreground">{label}</p>
                        {locked && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded text-white" style={{ background: G }}>Required</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <button
                      onClick={() => togglePref(key)}
                      disabled={locked}
                      className={`shrink-0 w-11 h-6 rounded-full transition-all relative ${prefs[key] ? "" : "bg-muted-foreground/30"} ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      style={prefs[key] ? { background: G } : {}}
                    >
                      <motion.div
                        animate={{ x: prefs[key] ? 20 : 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={decline}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-muted-foreground border border-border hover:border-foreground transition-colors"
                >
                  Decline All
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={savePrefs}
                  className="flex-1 py-2.5 rounded-xl text-white font-black text-xs"
                  style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}
                >
                  Save Preferences
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </>
    </AnimatePresence>
  );
}
