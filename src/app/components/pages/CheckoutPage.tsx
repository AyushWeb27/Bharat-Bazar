import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check, ChevronRight, MapPin, Plus, CreditCard, Smartphone, Building2,
  Package, X, Tag, ChevronDown,
} from "lucide-react";
import { G, GD } from "../data/index";
import type { Page } from "../types/index";
import { fmt } from "../utils/format";

const inp = "w-full border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all";
const label = "block text-xs font-bold text-foreground mb-1.5 tracking-wide";

const SAVED_ADDRESSES = [
  { id: 1, tag: "Home", name: "Rahul Sharma", line1: "123 MG Road", line2: "Near Gandhi Chowk", city: "Mumbai", state: "Maharashtra", pin: "400001", phone: "9876543210" },
  { id: 2, tag: "Office", name: "Rahul Sharma", line1: "45 Connaught Place", line2: "Block C", city: "New Delhi", state: "Delhi", pin: "110001", phone: "9876543210" },
];

const MOCK_ITEMS = [
  { name: "iPhone 15 Pro Max 256GB", qty: 1, price: 134900, img: "https://images.unsplash.com/photo-1696446702183-cbd96c1abb3a?w=80&h=80&fit=crop" },
  { name: "Kanjivaram Silk Saree", qty: 2, price: 1499, img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=80&h=80&fit=crop" },
  { name: "Atomic Habits (Paperback)", qty: 1, price: 299, img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&h=80&fit=crop" },
];

const BANKS = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Bank", "Punjab National Bank"];

const STEPS = ["Delivery Address", "Payment", "Order Placed"];

export function CheckoutPage({ setPage }: { setPage: (p: Page) => void }) {
  const [step, setStep] = useState(0);
  const [selectedAddr, setSelectedAddr] = useState(1);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: "", phone: "", pin: "", line1: "", line2: "", city: "", state: "", type: "Home" });
  const [payMethod, setPayMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ num: "", expiry: "", cvv: "", name: "" });
  const [bank, setBank] = useState(BANKS[0]);
  const [placingOrder, setPlacingOrder] = useState(false);

  const subtotal = MOCK_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.18);
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + gst + shipping;

  const handlePlaceOrder = () => {
    setPlacingOrder(true);
    setTimeout(() => {
      setPlacingOrder(false);
      setStep(2);
      setTimeout(() => setPage("order-confirmation" as any), 800);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 border-2"
                  style={
                    i < step
                      ? { background: G, borderColor: G, color: "#fff" }
                      : i === step
                      ? { background: G, borderColor: G, color: "#fff", boxShadow: `0 0 0 4px ${G}22` }
                      : { background: "var(--muted)", borderColor: "var(--border)", color: "var(--muted-foreground)" }
                  }
                >
                  {i < step ? <Check size={16} strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className="text-[10px] font-bold hidden sm:block whitespace-nowrap"
                  style={{ color: i <= step ? G : "var(--muted-foreground)" }}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="w-16 sm:w-24 h-0.5 mx-1 transition-all duration-500 mb-4"
                  style={{ background: i < step ? G : "var(--border)" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 0: Delivery Address ── */}
        {step === 0 && (
          <motion.div key="step-addr"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <MapPin size={18} style={{ color: G }} /> Select Delivery Address
              </h2>

              {SAVED_ADDRESSES.map(addr => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddr(addr.id)}
                  className="w-full text-left rounded-2xl border-2 p-4 transition-all duration-200"
                  style={
                    selectedAddr === addr.id
                      ? { borderColor: G, background: `${G}08` }
                      : { borderColor: "var(--border)", background: "var(--card)" }
                  }
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all"
                      style={
                        selectedAddr === addr.id
                          ? { borderColor: G, background: G }
                          : { borderColor: "var(--border)" }
                      }
                    >
                      {selectedAddr === addr.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md" style={{ background: `${G}15`, color: G }}>{addr.tag}</span>
                        <span className="text-sm font-bold text-foreground">{addr.name}</span>
                        <span className="text-xs text-muted-foreground">{addr.phone}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{addr.line1}, {addr.line2}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} — {addr.pin}</p>
                    </div>
                  </div>
                </button>
              ))}

              {/* Add New Address */}
              <div className="rounded-2xl border-2 border-dashed border-border overflow-hidden">
                <button
                  onClick={() => setShowNewAddr(v => !v)}
                  className="w-full flex items-center justify-between p-4 text-sm font-bold transition-colors hover:bg-muted/50"
                  style={{ color: G }}
                >
                  <span className="flex items-center gap-2"><Plus size={16} /> Add New Address</span>
                  <motion.div animate={{ rotate: showNewAddr ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {showNewAddr && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className={label}>Full Name</label><input value={newAddr.name} onChange={e => setNewAddr(a => ({ ...a, name: e.target.value }))} placeholder="Enter full name" className={inp} /></div>
                        <div><label className={label}>Phone Number</label><input value={newAddr.phone} onChange={e => setNewAddr(a => ({ ...a, phone: e.target.value }))} placeholder="10-digit mobile" className={inp} /></div>
                        <div><label className={label}>Pincode</label><input value={newAddr.pin} onChange={e => setNewAddr(a => ({ ...a, pin: e.target.value }))} placeholder="6-digit pincode" className={inp} /></div>
                        <div><label className={label}>Address Type</label>
                          <div className="flex gap-2">
                            {["Home", "Work", "Other"].map(t => (
                              <button key={t} onClick={() => setNewAddr(a => ({ ...a, type: t }))}
                                className="flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all"
                                style={newAddr.type === t ? { borderColor: G, color: G, background: `${G}10` } : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="sm:col-span-2"><label className={label}>Address Line 1</label><input value={newAddr.line1} onChange={e => setNewAddr(a => ({ ...a, line1: e.target.value }))} placeholder="House/Flat no., Street, Area" className={inp} /></div>
                        <div className="sm:col-span-2"><label className={label}>Address Line 2</label><input value={newAddr.line2} onChange={e => setNewAddr(a => ({ ...a, line2: e.target.value }))} placeholder="Landmark (optional)" className={inp} /></div>
                        <div><label className={label}>City</label><input value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))} placeholder="City" className={inp} /></div>
                        <div><label className={label}>State</label><input value={newAddr.state} onChange={e => setNewAddr(a => ({ ...a, state: e.target.value }))} placeholder="State" className={inp} /></div>
                        <div className="sm:col-span-2">
                          <button className="w-full py-3 rounded-xl text-sm font-black text-white" style={{ background: `linear-gradient(to right,${GD},${G})` }}>
                            Save Address
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div>
              <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 space-y-4">
                <h3 className="font-black text-foreground text-sm">Order Summary</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  {MOCK_ITEMS.map((item, i) => (
                    <div key={i} className="flex justify-between gap-2">
                      <span className="line-clamp-1 flex-1">{item.name} × {item.qty}</span>
                      <span className="font-bold text-foreground shrink-0">{fmt(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 space-y-1">
                    <div className="flex justify-between"><span>Subtotal</span><span className="font-bold text-foreground">{fmt(subtotal)}</span></div>
                    <div className="flex justify-between"><span>GST (18%)</span><span className="font-bold text-foreground">{fmt(gst)}</span></div>
                    <div className="flex justify-between"><span>Delivery</span><span className="font-bold" style={{ color: G }}>{shipping === 0 ? "FREE" : fmt(shipping)}</span></div>
                    <div className="flex justify-between border-t border-border pt-1.5">
                      <span className="font-black text-foreground">Total</span>
                      <span className="font-black text-foreground">{fmt(total)}</span>
                    </div>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                  className="w-full py-3 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(to right,${GD},${G})` }}>
                  Continue to Payment <ChevronRight size={15} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 1: Payment ── */}
        {step === 1 && (
          <motion.div key="step-pay"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <CreditCard size={18} style={{ color: G }} /> Choose Payment Method
              </h2>

              {/* UPI */}
              <PayCard
                active={payMethod === "upi"}
                onClick={() => setPayMethod("upi")}
                icon={<Smartphone size={20} style={{ color: G }} />}
                title="UPI"
                subtitle="PhonePe / Google Pay / Paytm"
                badge="Instant"
              >
                {payMethod === "upi" && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <label className={label}>UPI ID</label>
                    <input value={upiId} onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi" className={inp} />
                    <div className="flex gap-2 mt-2">
                      {["phonepe", "gpay", "paytm"].map(app => (
                        <button key={app} className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:border-[#009966] hover:text-[#009966] transition-all capitalize">
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </PayCard>

              {/* Card */}
              <PayCard
                active={payMethod === "card"}
                onClick={() => setPayMethod("card")}
                icon={<CreditCard size={20} style={{ color: G }} />}
                title="Credit / Debit Card"
                subtitle="Visa, Mastercard, RuPay"
                badge="Secure"
              >
                {payMethod === "card" && (
                  <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className={label}>Card Number</label>
                      <input value={card.num} onChange={e => setCard(c => ({ ...c, num: e.target.value.replace(/\D/g, "").slice(0, 16) }))}
                        placeholder="1234 5678 9012 3456" className={inp} />
                    </div>
                    <div>
                      <label className={label}>Expiry</label>
                      <input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
                        placeholder="MM / YY" className={inp} />
                    </div>
                    <div>
                      <label className={label}>CVV</label>
                      <input value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                        placeholder="•••" type="password" className={inp} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={label}>Name on Card</label>
                      <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                        placeholder="As printed on card" className={inp} />
                    </div>
                  </div>
                )}
              </PayCard>

              {/* Net Banking */}
              <PayCard
                active={payMethod === "netbanking"}
                onClick={() => setPayMethod("netbanking")}
                icon={<Building2 size={20} style={{ color: G }} />}
                title="Net Banking"
                subtitle="All major banks supported"
              >
                {payMethod === "netbanking" && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <label className={label}>Select Bank</label>
                    <select value={bank} onChange={e => setBank(e.target.value)} className={inp}>
                      {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                )}
              </PayCard>

              {/* COD */}
              <PayCard
                active={payMethod === "cod"}
                onClick={() => setPayMethod("cod")}
                icon={<Package size={20} style={{ color: G }} />}
                title="Cash on Delivery"
                subtitle="Pay when your order arrives"
                badge="No extra charge"
              />
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <div className="bg-card rounded-2xl border border-border p-5 sticky top-24 space-y-4">
                <h3 className="font-black text-foreground text-sm flex items-center gap-1.5">
                  <Tag size={14} style={{ color: G }} /> Order Summary
                </h3>
                <div className="space-y-3">
                  {MOCK_ITEMS.map((item, i) => (
                    <div key={i} className="flex gap-2.5">
                      <img src={item.img} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Qty: {item.qty} · {fmt(item.price * item.qty)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="font-semibold text-foreground">{fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>GST (18%)</span><span className="font-semibold text-foreground">{fmt(gst)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span className="font-bold" style={{ color: G }}>{shipping === 0 ? "FREE 🎉" : fmt(shipping)}</span></div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="font-black text-foreground">Grand Total</span>
                    <span className="font-black text-lg text-foreground">{fmt(total)}</span>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="w-full py-3.5 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-80"
                  style={{ background: `linear-gradient(to right,${GD},${G})`, boxShadow: `0 4px 16px ${G}44` }}>
                  {placingOrder ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  ) : <>Place Order <ChevronRight size={15} /></>}
                </motion.button>
                <button onClick={() => setStep(0)} className="w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to Address
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Placing ── */}
        {step === 2 && (
          <motion.div key="step-done"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-14 h-14 border-4 border-t-transparent rounded-full"
              style={{ borderColor: `${G}33`, borderTopColor: G }}
            />
            <p className="text-lg font-black text-foreground">Confirming your order…</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

function PayCard({
  active, onClick, icon, title, subtitle, badge, children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border-2 p-4 transition-all duration-200 cursor-pointer"
      style={active ? { borderColor: G, background: `${G}08` } : { borderColor: "var(--border)", background: "var(--card)" }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
          style={active ? { borderColor: G, background: G } : { borderColor: "var(--border)" }}
        >
          {active && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${G}12` }}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-foreground">{title}</span>
            {badge && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                style={{ background: `${G}15`, color: G }}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <AnimatePresence>
        {children && active && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
