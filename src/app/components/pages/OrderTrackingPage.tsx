import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, CheckCircle, Clock, Truck, Package, MapPin, Phone,
  ChevronRight, ArrowLeft,
} from "lucide-react";
import { G, GD } from "../data/index";
import type { Page } from "../types/index";
import { fmt } from "../utils/format";

type Step = {
  label: string;
  date: string;
  time: string;
  desc: string;
  icon: React.ReactNode;
  done: boolean;
  current: boolean;
};

const MOCK_ORDER = {
  id: "#BB2610050001",
  product: {
    emoji: "📱",
    name: "Apple iPhone 15 Pro — 256GB",
    brand: "Apple",
    qty: 1,
    price: 134900,
    img: "https://images.unsplash.com/photo-1771860886819-1c75b9c0d0cb?w=120&h=120&fit=crop&auto=format",
  },
  address: {
    name: "Arjun Sharma",
    line1: "45, MG Road, Indiranagar",
    line2: "Bengaluru — 560038, Karnataka",
    phone: "+91 98765 43210",
  },
  courier: {
    name: "Delhivery Express",
    awb: "DEL2610123456",
    phone: "+91 1800 123 456",
  },
  estimatedDelivery: "8 Oct 2026",
};

const STEPS: Step[] = [
  {
    label: "Order Placed",
    date: "5 Oct 2026",
    time: "10:32 AM",
    desc: "Your order has been placed successfully.",
    icon: <Package size={18} />,
    done: true,
    current: false,
  },
  {
    label: "Order Confirmed",
    date: "5 Oct 2026",
    time: "11:15 AM",
    desc: "Seller has confirmed and started processing your order.",
    icon: <CheckCircle size={18} />,
    done: true,
    current: false,
  },
  {
    label: "Shipped",
    date: "6 Oct 2026",
    time: "2:45 PM",
    desc: "Your package is on the way with Delhivery Express.",
    icon: <Truck size={18} />,
    done: true,
    current: false,
  },
  {
    label: "Out for Delivery",
    date: "8 Oct 2026",
    time: "8:10 AM",
    desc: "Your delivery agent is on the way. Stay available!",
    icon: <MapPin size={18} />,
    done: false,
    current: true,
  },
  {
    label: "Delivered",
    date: "",
    time: "",
    desc: "Package will be delivered at your doorstep.",
    icon: <CheckCircle size={18} />,
    done: false,
    current: false,
  },
];

export function OrderTrackingPage({ setPage }: { setPage: (p: Page) => void }) {
  const [inputId, setInputId] = useState("#BB2610050001");
  const [tracked, setTracked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = () => {
    if (!inputId.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTracked(true);
    }, 900);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setPage("orders" as Page)}
          className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
        </motion.button>
        <div>
          <h1 className="text-2xl font-black text-foreground">Track Order</h1>
          <p className="text-xs text-muted-foreground">Enter your order ID to get live updates</p>
        </div>
      </div>

      {/* Order ID input */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2 block">
          Order ID
        </label>
        <div className="flex gap-3">
          <input
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="#BB2610050001"
            className="flex-1 bg-muted border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground placeholder:text-muted-foreground outline-none focus:border-[#009966] transition-colors"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleTrack}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-black shrink-0"
            style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}
          >
            {loading ? (
              <motion.div
                className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
              />
            ) : (
              <Search size={15} />
            )}
            Track
          </motion.button>
        </div>
      </div>

      {/* Tracking result */}
      <AnimatePresence>
        {tracked && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Order summary card */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Order Summary</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden shrink-0 flex items-center justify-center text-3xl">
                  <img
                    src={MOCK_ORDER.product.img}
                    alt={MOCK_ORDER.product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{MOCK_ORDER.product.brand}</p>
                  <p className="text-sm font-black text-foreground line-clamp-2">{MOCK_ORDER.product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Qty: {MOCK_ORDER.product.qty}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-black text-foreground">{fmt(MOCK_ORDER.product.price)}</p>
                  <p className="text-[10px] text-muted-foreground">{MOCK_ORDER.id}</p>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Delivery Address</p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#e6fff5" }}>
                  <MapPin size={14} style={{ color: G }} />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">{MOCK_ORDER.address.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{MOCK_ORDER.address.line1}</p>
                  <p className="text-xs text-muted-foreground">{MOCK_ORDER.address.line2}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">{MOCK_ORDER.address.phone}</p>
                </div>
              </div>
            </div>

            {/* Estimated delivery highlight */}
            <motion.div
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              className="rounded-2xl p-5 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${GD}, ${G})` }}
            >
              <div>
                <p className="text-white/80 text-xs font-bold">Estimated Delivery</p>
                <p className="text-white text-xl font-black mt-0.5">Arriving by {MOCK_ORDER.estimatedDelivery}</p>
              </div>
              <Truck size={36} className="text-white/60" />
            </motion.div>

            {/* Stepper timeline */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-5">Live Tracking</p>
              <div className="relative">
                {STEPS.map((step, i) => {
                  const isLast = i === STEPS.length - 1;
                  return (
                    <div key={step.label} className="flex gap-4">
                      {/* Icon column */}
                      <div className="flex flex-col items-center shrink-0">
                        {/* Circle */}
                        <motion.div
                          initial={step.current ? { scale: 0.8 } : {}}
                          animate={step.current ? { scale: [1, 1.1, 1] } : {}}
                          transition={step.current ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" } : {}}
                          className="w-10 h-10 rounded-full flex items-center justify-center border-2 relative z-10"
                          style={
                            step.done
                              ? { background: G, borderColor: G, color: "#fff" }
                              : step.current
                              ? { background: "#fff", borderColor: G, color: G }
                              : { background: "var(--muted)", borderColor: "var(--border)", color: "var(--muted-foreground)" }
                          }
                        >
                          {step.done && !step.current ? <CheckCircle size={18} /> : step.icon}
                          {/* Pulse ring for current */}
                          {step.current && (
                            <motion.div
                              className="absolute inset-0 rounded-full border-2"
                              style={{ borderColor: G }}
                              animate={{ scale: [1, 1.5, 1.5], opacity: [0.8, 0, 0] }}
                              transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                            />
                          )}
                        </motion.div>

                        {/* Connector line */}
                        {!isLast && (
                          <div
                            className="w-0.5 flex-1 my-1"
                            style={{
                              background: step.done
                                ? G
                                : "repeating-linear-gradient(to bottom, var(--border) 0px, var(--border) 4px, transparent 4px, transparent 8px)",
                              minHeight: 32,
                            }}
                          />
                        )}
                      </div>

                      {/* Content column */}
                      <div className={`pb-6 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className="text-sm font-black"
                            style={
                              step.done || step.current
                                ? { color: step.current ? G : "var(--foreground)" }
                                : { color: "var(--muted-foreground)" }
                            }
                          >
                            {step.label}
                            {step.current && (
                              <span className="ml-2 text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: G }}>
                                CURRENT
                              </span>
                            )}
                          </p>
                          {step.date && (
                            <p className="text-[10px] text-muted-foreground shrink-0">
                              {step.date} · {step.time}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier details */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Courier Details</p>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">
                    🚚
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">{MOCK_ORDER.courier.name}</p>
                    <p className="text-xs text-muted-foreground">AWB: {MOCK_ORDER.courier.awb}</p>
                  </div>
                </div>
                <motion.a
                  href={`tel:${MOCK_ORDER.courier.phone}`}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors"
                  style={{ borderColor: G, color: G }}
                >
                  <Phone size={13} /> Call Delivery Agent
                </motion.a>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="relative bg-muted h-48 flex items-center justify-center">
                {/* Fake map grid */}
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 to-blue-50/40" />
                {/* Animated marker */}
                <motion.div
                  className="relative flex flex-col items-center"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                >
                  <div className="w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-xl"
                    style={{ background: G }}>
                    📍
                  </div>
                  <div className="w-3 h-3 rounded-full mt-0.5 opacity-30" style={{ background: G }} />
                </motion.div>
                <p className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-bold text-muted-foreground">
                  Live map tracking — delivery agent en route
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
