import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Gift, GripVertical, Bell, Home, Search, Plus } from "lucide-react";
import { Toggle, Modal, Field, PageHeader, StatCard, SectionCard } from "./shared/ui";
import { G, inp, card } from "./shared/constants";

type Deal = {
  id: number;
  product: string;
  dealPrice: number;
  originalPrice: number;
  dealDate: string;
  maxUnits: number;
  soldUnits: number;
  showOnHomepage: boolean;
  pushNotification: boolean;
  active: boolean;
};

const CURRENT_DEAL: Deal = {
  id: 0,
  product: "iPhone 15 Pro Max",
  dealPrice: 134900,
  originalPrice: 159900,
  dealDate: "2026-10-05",
  maxUnits: 50,
  soldUnits: 38,
  showOnHomepage: true,
  pushNotification: true,
  active: true,
};

const UPCOMING_DEALS = [
  { date: "Oct 06", product: "Samsung Galaxy S24 Ultra", price: 124999, discount: 10 },
  { date: "Oct 07", product: "Sony WH-1000XM5 Headphones", price: 24999, discount: 20 },
  { date: "Oct 08", product: 'LG 55" OLED Smart TV', price: 89999, discount: 15 },
  { date: "Oct 09", product: "Apple Watch Series 9", price: 44999, discount: 12 },
  { date: "Oct 10", product: "Dyson V15 Detect Vacuum", price: 49999, discount: 18 },
  { date: "Oct 11", product: "Bose QuietComfort 45", price: 19999, discount: 22 },
  { date: "Oct 12", product: "Instant Pot Duo 7-in-1", price: 8499, discount: 25 },
];

const HISTORY: Array<{ date: string; product: string; units: number; revenue: number }> = [
  { date: "Oct 04", product: "MacBook Air M3",         units: 18, revenue: 179820 },
  { date: "Oct 03", product: "OnePlus 12 5G",          units: 42, revenue: 125958 },
  { date: "Oct 02", product: "Puma Running Shoes",     units: 78, revenue: 156078 },
  { date: "Oct 01", product: "Philips Air Fryer XXL",  units: 55, revenue: 109945 },
  { date: "Sep 30", product: "Kindle Paperwhite 5",    units: 63, revenue: 126063 },
  { date: "Sep 29", product: "Noise ColorFit Pro 4",   units: 90, revenue: 89910  },
  { date: "Sep 28", product: "boAt Rockerz 550",       units: 110, revenue: 219780 },
  { date: "Sep 27", product: "Himalaya Face Wash Kit", units: 201, revenue: 100299 },
  { date: "Sep 26", product: "Levi's Jeans 3-Pack",    units: 67, revenue: 133933 },
  { date: "Sep 25", product: "Prestige Induction Set", units: 38, revenue: 75962  },
];

function Countdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1.5">
      {[time.h, time.m, time.s].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="text-2xl font-black tabular-nums" style={{ color: "#ef4444" }}>{pad(v)}</span>
          {i < 2 && <span className="text-xl font-black text-red-400">:</span>}
        </span>
      ))}
    </div>
  );
}

const BLANK_FORM = {
  product: "", dealPrice: 0, originalPrice: 0,
  dealDate: "", maxUnits: 50,
  showOnHomepage: true, pushNotification: false,
};

export function DealOfDayPage() {
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState(BLANK_FORM);
  const [query, setQuery] = useState("");
  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const disc = CURRENT_DEAL.originalPrice > 0
    ? Math.round((1 - CURRENT_DEAL.dealPrice / CURRENT_DEAL.originalPrice) * 100)
    : 0;
  const stockPct = Math.round((CURRENT_DEAL.soldUnits / CURRENT_DEAL.maxUnits) * 100);
  const remaining = CURRENT_DEAL.maxUnits - CURRENT_DEAL.soldUnits;

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Operations / Deal of the Day" title="Deal of the Day"
        subtitle="Set and manage today's featured deal"
        onAdd={() => setModal(true)} addLabel="Set New Deal" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Today's Discount"   val={`${disc}%`}                    color={G}       icon={Gift}   />
        <StatCard label="Units Sold Today"   val={CURRENT_DEAL.soldUnits}        color="#3b82f6" icon={Gift}   />
        <StatCard label="Remaining Units"    val={remaining}                     color="#f59e0b" icon={Gift}   />
        <StatCard label="Today's Revenue"    val={`₹${(CURRENT_DEAL.soldUnits * CURRENT_DEAL.dealPrice / 100000).toFixed(1)}L`} color="#8b5cf6" icon={Gift} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Current deal — prominent card */}
        <div className="xl:col-span-2 space-y-5">
          <div className={`${card} overflow-hidden`}>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2" style={{ background: "#fafafa" }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: G }} />
              <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Today's Deal — Live Now</span>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-5 flex-wrap">
                {/* Product image placeholder */}
                <div className="w-28 h-28 rounded-2xl flex items-center justify-center shrink-0 text-4xl"
                  style={{ background: `${G}10` }}>
                  📱
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-gray-900 mb-1">{CURRENT_DEAL.product}</h2>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-2xl font-black" style={{ color: G }}>
                      ₹{CURRENT_DEAL.dealPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-base text-gray-400 line-through">
                      ₹{CURRENT_DEAL.originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-black text-white" style={{ background: "#ef4444" }}>
                      {disc}% OFF
                    </span>
                  </div>

                  {/* Countdown */}
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Deal Ends In</p>
                    <Countdown />
                  </div>

                  {/* Stock progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">Stock</span>
                      <span className="text-xs font-black text-gray-700">
                        {remaining} / {CURRENT_DEAL.maxUnits} remaining
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${stockPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ background: stockPct > 80 ? "#ef4444" : G }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{stockPct}% sold</p>
                  </div>

                  <button onClick={() => setModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                    style={{ background: G }}>
                    <Plus size={14} /> Change Deal
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule queue */}
          <SectionCard title="Upcoming Deal Queue — Next 7 Days">
            <div className="space-y-2">
              {UPCOMING_DEALS.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all">
                  <GripVertical size={14} className="text-gray-300 shrink-0" />
                  <div className="w-12 text-center shrink-0">
                    <span className="text-[10px] font-black text-gray-400 uppercase">{d.date}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{d.product}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-gray-900">₹{d.price.toLocaleString("en-IN")}</p>
                    <p className="text-[10px] font-bold" style={{ color: G }}>{d.discount}% off</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* History table */}
        <div>
          <SectionCard title="Last 10 Deals History">
            <div className="space-y-3">
              {HISTORY.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 w-12 shrink-0">{h.date}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-700 truncate">{h.product}</p>
                    <p className="text-[10px] text-gray-400">{h.units} units</p>
                  </div>
                  <span className="font-black shrink-0" style={{ color: G }}>
                    ₹{(h.revenue / 100000).toFixed(1)}L
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Set New Deal Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Set New Deal of the Day" wide>
        <div className="space-y-3">
          <Field label="Select Product" required>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input value={query} onChange={e => { setQuery(e.target.value); set("product", e.target.value); }}
                placeholder="Search products…" className={`${inp} pl-8`} />
            </div>
            {query && (
              <div className="border border-gray-200 rounded-xl mt-1 overflow-hidden shadow-sm">
                {["iPhone 15 Pro Max", "Samsung Galaxy S24 Ultra", "Sony WH-1000XM5"]
                  .filter(p => p.toLowerCase().includes(query.toLowerCase()))
                  .map(p => (
                    <button key={p} onClick={() => { set("product", p); setQuery(p); }}
                      className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                      {p}
                    </button>
                  ))}
              </div>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Deal Price (₹)" required>
              <input type="number" value={form.dealPrice} onChange={e => set("dealPrice", +e.target.value)} min={0} className={inp} />
            </Field>
            <Field label="Original Price (₹)" hint="auto-fills from product">
              <input type="number" value={form.originalPrice} onChange={e => set("originalPrice", +e.target.value)} min={0} className={inp} />
            </Field>
            <Field label="Deal Date" required>
              <input type="date" value={form.dealDate} onChange={e => set("dealDate", e.target.value)} className={inp} />
            </Field>
            <Field label="Max Units">
              <input type="number" value={form.maxUnits} onChange={e => set("maxUnits", +e.target.value)} min={1} className={inp} />
            </Field>
          </div>
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div className="flex items-center gap-2">
                <Home size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700">Show on Homepage</span>
              </div>
              <Toggle checked={form.showOnHomepage} onChange={() => set("showOnHomepage", !form.showOnHomepage)} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700">Push Notification</span>
              </div>
              <Toggle checked={form.pushNotification} onChange={() => set("pushNotification", !form.pushNotification)} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all" style={{ background: G }}>
              Set as Deal of the Day
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DealOfDayPage;
