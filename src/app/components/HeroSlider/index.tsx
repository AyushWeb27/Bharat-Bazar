import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from "lucide-react";
import { SLIDER_DATA } from "../data/index";

const DURATION = 5000;

export function HeroSlider({ onShop }: { onShop: () => void }) {
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);           // 1 = forward, -1 = back
  const [paused, setPaused] = useState(false);
  const [prog, setProg] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(performance.now());
  const pausedAt = useRef<number>(0);

  const goTo = useCallback((idx: number, d: number) => {
    setDir(d);
    setCur(idx);
    setProg(0);
    startRef.current = performance.now();
  }, []);

  const prev = () => goTo((cur - 1 + SLIDER_DATA.length) % SLIDER_DATA.length, -1);
  const next = () => goTo((cur + 1) % SLIDER_DATA.length, 1);

  useEffect(() => {
    if (paused) {
      pausedAt.current = performance.now();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    if (pausedAt.current) {
      startRef.current += performance.now() - pausedAt.current;
      pausedAt.current = 0;
    }
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const p = Math.min((elapsed / DURATION) * 100, 100);
      setProg(p);
      if (p >= 100) {
        setCur(c => (c + 1) % SLIDER_DATA.length);
        setDir(1);
        startRef.current = performance.now();
        setProg(0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [paused, cur]);

  const s = SLIDER_DATA[cur];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "4%" : "-4%", opacity: 0 }),
    center: { x: "0%", opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-3%" : "3%", opacity: 0 }),
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl select-none"
      style={{ height: "clamp(280px, 56vw, 580px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background image layer ───────────────────────────────── */}
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={`bg-${s.id}`}
          custom={dir}
          variants={{
            enter: (d) => ({ scale: 1.04, opacity: 0, x: d > 0 ? "2%" : "-2%" }),
            center: { scale: 1, opacity: 1, x: "0%" },
            exit: { scale: 0.98, opacity: 0, x: "0%" },
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img
            src={s.bgImg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark gradient — left heavy on desktop, full bottom on mobile */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(105deg, ${s.bg}f8 0%, ${s.bg}e0 38%, ${s.bg}80 62%, transparent 100%)`,
            }}
          />
          {/* Bottom fade */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${s.bg}cc 0%, ${s.bg}44 30%, transparent 60%)`,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Slide number watermark ───────────────────────────────── */}
      <div className="absolute top-4 right-5 sm:top-6 sm:right-8 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={`num-${s.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 0.06, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="font-black text-white leading-none block"
            style={{ fontSize: "clamp(80px, 14vw, 160px)", letterSpacing: "-0.04em" }}
          >
            {s.num}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-10 flex items-center justify-between gap-6">

            {/* LEFT: Text block */}
            <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">

              {/* Badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`badge-${s.id}`}
                  initial={{ opacity: 0, y: -14, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                >
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-full border"
                    style={{
                      background: `${s.accent}20`,
                      color: s.accentLight,
                      borderColor: `${s.accent}40`,
                    }}
                  >
                    {s.badge}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Headline */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`head-${s.id}`}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="leading-none font-black text-white"
                  style={{
                    fontSize: "clamp(28px, 6.5vw, 80px)",
                    letterSpacing: "-0.025em",
                    textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {s.line1}{" "}
                  <span style={{ color: s.accentLight }}>{s.line2}</span>{" "}
                  {s.line3}
                </motion.div>
              </AnimatePresence>

              {/* Offer + subtitle */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`offer-${s.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.18 }}
                  className="space-y-0.5"
                >
                  <p
                    className="font-black text-sm sm:text-base md:text-xl"
                    style={{ color: s.textOffer }}
                  >
                    {s.offer}
                  </p>
                  <p className="text-white/50 text-[10px] sm:text-xs hidden sm:block">
                    {s.sub}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Tags — desktop only */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`tags-${s.id}`}
                  className="hidden md:flex flex-wrap gap-2 pt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.26 }}
                >
                  {s.tags.map((tag, ti) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.26 + ti * 0.06, type: "spring", stiffness: 280 }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full border text-white/70"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        borderColor: "rgba(255,255,255,0.12)",
                      }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Stats — desktop */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`stats-${s.id}`}
                  className="hidden lg:flex items-center gap-5 pt-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.32 }}
                >
                  {s.stats.map((st, si) => (
                    <div key={si} className="border-l border-white/15 pl-5 first:border-0 first:pl-0">
                      <p className="font-black text-base leading-tight" style={{ color: s.accentLight }}>{st.v}</p>
                      <p className="text-white/35 text-[9px] uppercase tracking-widest">{st.l}</p>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* CTA */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`cta-${s.id}`}
                  className="flex items-center gap-2.5 pt-1"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={onShop}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 font-black rounded-xl text-xs sm:text-sm shadow-lg transition-shadow"
                    style={{
                      background: `linear-gradient(135deg, ${s.accent}, ${s.accentLight})`,
                      color: "#000",
                      padding: "clamp(8px,1.5vw,12px) clamp(16px,3vw,28px)",
                      boxShadow: `0 8px 24px ${s.accent}44`,
                    }}
                  >
                    {s.cta} <ArrowRight size={14} />
                  </motion.button>
                  <span className="text-white/35 text-[10px] hidden sm:inline font-medium">
                    {s.ctaSub}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT: Product image — desktop only */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`prod-${s.id}`}
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.96 }}
                transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="hidden md:block relative shrink-0"
              >
                {/* Glow */}
                <div
                  className="absolute inset-0 blur-[60px] opacity-30 pointer-events-none rounded-full"
                  style={{ background: s.accent, transform: "scale(0.75) translateY(-10%)" }}
                />
                {/* Product frame */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    width: "clamp(180px, 18vw, 300px)",
                    aspectRatio: "3/4",
                    borderRadius: "30% 60% 50% 42% / 42% 38% 58% 48%",
                    border: `1.5px solid ${s.accent}35`,
                    boxShadow: `0 0 60px ${s.accent}18, 0 24px 48px rgba(0,0,0,0.5)`,
                  }}
                >
                  <img
                    src={s.prodImg}
                    alt={s.line2}
                    className="w-full h-full object-cover scale-105"
                    style={{ filter: "brightness(0.92) saturate(1.1)" }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, ${s.bg}99 0%, transparent 55%)`,
                    }}
                  />
                </div>

                {/* Floating offer pill */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                  className="absolute -top-3 -right-2 px-3 py-1.5 rounded-2xl text-[10px] sm:text-xs font-black shadow-xl"
                  style={{ background: s.accentLight, color: "#000" }}
                >
                  {s.offer}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Bottom controls ───────────────────────────────────── */}
        <div className="relative px-5 sm:px-8 md:px-10 pb-4 sm:pb-5 pt-3">
          {/* Global progress line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/8">
            <motion.div
              className="h-full rounded-r-full"
              style={{ width: `${prog}%`, background: s.accent }}
              transition={{ duration: 0.04 }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Slide dot indicators */}
            <div className="flex items-center gap-3">
              {SLIDER_DATA.map((sl, i) => (
                <button
                  key={sl.id}
                  onClick={() => goTo(i, i > cur ? 1 : -1)}
                  className="relative flex items-center"
                  aria-label={`Go to slide ${i + 1}`}
                >
                  {/* Track */}
                  <div
                    className="rounded-full transition-all duration-300 overflow-hidden"
                    style={{
                      width: i === cur ? "clamp(32px,6vw,48px)" : 6,
                      height: 6,
                      background: i === cur ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {/* Fill */}
                    {i === cur && (
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${prog}%`, background: sl.accent }}
                      />
                    )}
                  </div>
                </button>
              ))}

              {/* Slide counter */}
              <div className="hidden sm:flex items-center gap-1 text-white/35 text-[10px] font-bold tabular-nums ml-1">
                <span style={{ color: s.accentLight }}>{String(cur + 1).padStart(2, "0")}</span>
                <span>/</span>
                <span>{String(SLIDER_DATA.length).padStart(2, "0")}</span>
              </div>
            </div>

            {/* Arrow + Pause controls */}
            <div className="flex items-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={prev}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white border transition-colors"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderColor: "rgba(255,255,255,0.12)",
                }}
              >
                <ChevronLeft size={14} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setPaused(p => !p)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white border transition-colors"
                style={{
                  background: paused ? `${s.accent}25` : "rgba(255,255,255,0.07)",
                  borderColor: paused ? `${s.accent}55` : "rgba(255,255,255,0.12)",
                }}
              >
                {paused
                  ? <Play size={12} className="translate-x-px" />
                  : <Pause size={12} />
                }
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={next}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white border transition-colors"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderColor: "rgba(255,255,255,0.12)",
                }}
              >
                <ChevronRight size={14} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Vertical dot nav — large desktop only ────────────────── */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col items-center gap-2">
        {SLIDER_DATA.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i, i > cur ? 1 : -1)}
            whileHover={{ scale: 1.4 }}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === cur ? 7 : 5,
              height: i === cur ? 24 : 5,
              background: i === cur ? s.accent : "rgba(255,255,255,0.22)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
