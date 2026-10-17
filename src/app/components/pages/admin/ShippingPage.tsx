import { useState } from "react";
import { motion } from "motion/react";
import { Truck, Settings, Search, CheckCircle2, Circle, Plus } from "lucide-react";
import { Toggle, Field, PageHeader, SectionCard } from "./shared/ui";
import { G, inp, card } from "./shared/constants";

type ShippingTab = "Courier Partners" | "Shipping Rates" | "AWB Tracking" | "Settings";

const TABS: ShippingTab[] = ["Courier Partners", "Shipping Rates", "AWB Tracking", "Settings"];

type Courier = {
  id: string;
  emoji: string;
  name: string;
  coverage: string;
  avgDays: string;
  cod: boolean;
  costPerKg: string;
  status: "Active" | "Inactive" | "Coming Soon";
  enabled: boolean;
};

const COURIERS: Courier[] = [
  { id: "delhivery", emoji: "🚚", name: "Delhivery",  coverage: "Pan-India (29,000+ pincodes)", avgDays: "2-4 days", cod: true,  costPerKg: "₹39/kg", status: "Active",      enabled: true  },
  { id: "bluedart",  emoji: "🔵", name: "Blue Dart",  coverage: "Metro + Tier 1 (8,500+ pincodes)", avgDays: "1-2 days", cod: true,  costPerKg: "₹65/kg", status: "Active",  enabled: true  },
  { id: "dtdc",      emoji: "🟡", name: "DTDC",       coverage: "Pan-India (11,000+ pincodes)", avgDays: "3-5 days", cod: false, costPerKg: "₹32/kg", status: "Inactive",    enabled: false },
  { id: "shiprocket",emoji: "🚀", name: "Shiprocket", coverage: "Multi-courier aggregator",     avgDays: "Varies",   cod: true,  costPerKg: "₹28/kg", status: "Coming Soon", enabled: false },
];

type ShippingRate = {
  id: number;
  zone: string;
  minWeight: string;
  maxWeight: string;
  rate: number;
  freeAbove: number;
};

const INIT_RATES: ShippingRate[] = [
  { id: 1, zone: "Local (Same City)", minWeight: "0g",  maxWeight: "500g", rate: 29,  freeAbove: 299  },
  { id: 2, zone: "Regional",         minWeight: "0g",  maxWeight: "1kg",  rate: 49,  freeAbove: 499  },
  { id: 3, zone: "National",         minWeight: "0g",  maxWeight: "2kg",  rate: 79,  freeAbove: 999  },
  { id: 4, zone: "National Heavy",   minWeight: "2kg", maxWeight: "5kg",  rate: 149, freeAbove: 1999 },
];

const statusMeta: Record<string, { color: string; bg: string }> = {
  Active:       { color: G,         bg: `${G}15`                   },
  Inactive:     { color: "#6b7280", bg: "rgba(107,114,128,0.1)"    },
  "Coming Soon": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)"   },
};

const TRACKING_STEPS = [
  { label: "Picked Up",         date: "Oct 5, 9:00 AM",   done: true  },
  { label: "In Transit",        date: "Oct 5, 2:30 PM",   done: true  },
  { label: "Out for Delivery",  date: "Oct 6, 8:45 AM",   done: true  },
  { label: "Delivered",         date: "Oct 6, 11:20 AM",  done: true  },
];

function CourierTab() {
  const [couriers, setCouriers] = useState(COURIERS);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {couriers.map(c => {
        const meta = statusMeta[c.status];
        return (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`${card} p-5`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-gray-100 bg-gray-50">
                  {c.emoji}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">{c.name}</h3>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ color: meta.color, background: meta.bg }}>
                    {c.status}
                  </span>
                </div>
              </div>
              {c.status !== "Coming Soon" && (
                <Toggle checked={c.enabled}
                  onChange={() => setCouriers(p => p.map(x => x.id === c.id ? { ...x, enabled: !x.enabled } : x))} />
              )}
            </div>
            <div className="space-y-1.5 text-xs text-gray-500 mb-3">
              <p>📍 {c.coverage}</p>
              <p>⏱ Avg delivery: <span className="font-bold text-gray-700">{c.avgDays}</span></p>
              <p>💰 Cost: <span className="font-bold text-gray-700">{c.costPerKg}</span></p>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${c.cod ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100"}`}>
                {c.cod ? "✓" : "✗"} COD
              </span>
              <div className="flex-1" />
              {c.status !== "Coming Soon" && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                  <Settings size={11} /> Configure
                </button>
              )}
              {c.status === "Coming Soon" && (
                <span className="text-[10px] text-gray-400 italic">Coming soon</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function RatesTab() {
  const [rates, setRates] = useState(INIT_RATES);
  return (
    <SectionCard title="Shipping Zones & Rates">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-gray-100">
              {["Zone", "Min Weight", "Max Weight", "Rate (₹)", "Free Shipping Above (₹)", ""].map(h => (
                <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rates.map(r => (
              <tr key={r.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="py-3 pr-4 text-xs font-bold text-gray-800">{r.zone}</td>
                <td className="py-3 pr-4 text-xs text-gray-500">{r.minWeight}</td>
                <td className="py-3 pr-4 text-xs text-gray-500">{r.maxWeight}</td>
                <td className="py-3 pr-4 text-xs font-black" style={{ color: G }}>₹{r.rate}</td>
                <td className="py-3 pr-4 text-xs text-gray-700">₹{r.freeAbove.toLocaleString("en-IN")}</td>
                <td className="py-3">
                  <button className="text-[10px] font-bold text-blue-500 hover:text-blue-700 transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all mt-2">
        <Plus size={13} /> Add Rate Row
      </button>
    </SectionCard>
  );
}

function TrackingTab() {
  const [awb, setAwb] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <div className="space-y-5">
      <SectionCard title="Track Shipment">
        <div className="flex gap-3">
          <input value={awb} onChange={e => setAwb(e.target.value)}
            placeholder="Enter AWB number or Order ID (e.g. DEL2610123456)"
            className={`${inp} flex-1`} />
          <button onClick={() => setSearched(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 transition-all"
            style={{ background: G }}>
            <Search size={14} /> Track
          </button>
        </div>
      </SectionCard>

      {(searched || true) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`${card} p-5`}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Shipment Details</p>
              <h3 className="text-base font-black text-gray-900">AWB: DEL2610123456</h3>
              <p className="text-xs text-gray-500 mt-0.5">Order #BB-20261005-8472 · Courier: Delhivery</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black" style={{ background: `${G}15`, color: G }}>
              Delivered
            </span>
          </div>

          {/* Stepper */}
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
            <div className="absolute left-4 top-4 w-0.5 bg-green-500 transition-all" style={{ height: "calc(100% - 32px)" }} />

            <div className="space-y-6">
              {TRACKING_STEPS.map((step, i) => (
                <div key={i} className="relative flex items-start gap-4 pl-10">
                  <div className="absolute left-0 top-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
                    style={{ background: step.done ? G : "#f3f4f6" }}>
                    {step.done
                      ? <CheckCircle2 size={16} className="text-white" />
                      : <Circle size={16} className="text-gray-300" />
                    }
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${step.done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [autoAssign, setAutoAssign]       = useState(true);
  const [codCharges, setCodCharges]       = useState(30);
  const [weightBased, setWeightBased]     = useState(true);
  const [packingSize, setPackingSize]     = useState("30x20x15 cm");

  return (
    <div className="space-y-4">
      <SectionCard title="Courier Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
            <div>
              <p className="text-sm font-bold text-gray-800">Auto-assign Courier</p>
              <p className="text-xs text-gray-400 mt-0.5">Automatically assign best courier based on pincode and weight</p>
            </div>
            <Toggle checked={autoAssign} onChange={() => setAutoAssign(v => !v)} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
            <div>
              <p className="text-sm font-bold text-gray-800">Weight-based Shipping</p>
              <p className="text-xs text-gray-400 mt-0.5">Charge by weight; toggle off for price-based rates</p>
            </div>
            <Toggle checked={weightBased} onChange={() => setWeightBased(v => !v)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Packing & COD">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Default Packing Size">
            <input value={packingSize} onChange={e => setPackingSize(e.target.value)}
              placeholder="e.g. 30x20x15 cm" className={inp} />
          </Field>
          <Field label="COD Charges (₹)">
            <input type="number" value={codCharges} onChange={e => setCodCharges(+e.target.value)} min={0} className={inp} />
          </Field>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all" style={{ background: G }}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

export function ShippingPage() {
  const [activeTab, setActiveTab] = useState<ShippingTab>("Courier Partners");

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Operations / Shipping" title="Shipping & Logistics"
        subtitle="Manage courier partners, rates, and tracking" />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
            style={activeTab === t ? { background: G, color: "#fff" } : { color: "#6b7280" }}>
            {t === "Courier Partners" && <Truck size={12} />}
            {t === "Settings" && <Settings size={12} />}
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Courier Partners" && <CourierTab />}
      {activeTab === "Shipping Rates"   && <RatesTab />}
      {activeTab === "AWB Tracking"     && <TrackingTab />}
      {activeTab === "Settings"         && <SettingsTab />}
    </div>
  );
}

export default ShippingPage;
