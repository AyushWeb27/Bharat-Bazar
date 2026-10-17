import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart, Clock, Package, Truck, CheckCircle2, RotateCcw,
  Search, X, Filter, MapPin, Phone, IndianRupee, Printer,
  Eye, ChevronDown, Calendar,
} from "lucide-react";
import { fmt, card, inp, ORDER_STATUS_META } from "./shared/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "Pending" | "Processing" | "Shipped" | "Delivered"
  | "Returned" | "Cancelled";

type Order = {
  id: string;
  customer: string;
  phone: string;
  product: string;
  qty: number;
  amount: number;
  status: OrderStatus;
  date: string;
  city: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const ORDERS: Order[] = [
  { id:"BB-4847",customer:"Priya Sharma",   phone:"+91 98765 43210",product:"Samsung A55",     qty:1,amount:18999,status:"Processing", date:"Sep 4, 2026",  city:"Mumbai"       },
  { id:"BB-4846",customer:"Rahul Gupta",    phone:"+91 87654 32109",product:"Boat Airdopes",   qty:1,amount:2499, status:"Delivered",  date:"Sep 4, 2026",  city:"Delhi"        },
  { id:"BB-4845",customer:"Anita Kumar",    phone:"+91 76543 21098",product:"OnePlus Nord",    qty:1,amount:27999,status:"Pending",    date:"Sep 3, 2026",  city:"Bengaluru"    },
  { id:"BB-4844",customer:"Vikram Patel",   phone:"+91 65432 10987",product:"JBL Speaker",     qty:2,amount:4999, status:"Shipped",    date:"Sep 3, 2026",  city:"Hyderabad"    },
  { id:"BB-4843",customer:"Neha Joshi",     phone:"+91 54321 09876",product:"Apple Watch",     qty:1,amount:42999,status:"Delivered",  date:"Sep 2, 2026",  city:"Pune"         },
  { id:"BB-4842",customer:"Arjun Mehta",    phone:"+91 43210 98765",product:"Mi Band 8",       qty:1,amount:3499, status:"Processing", date:"Sep 2, 2026",  city:"Chennai"      },
  { id:"BB-4841",customer:"Deepa Nair",     phone:"+91 32109 87654",product:"Sony WH1000",     qty:1,amount:22999,status:"Pending",    date:"Sep 1, 2026",  city:"Kolkata"      },
  { id:"BB-4840",customer:"Suresh Rao",     phone:"+91 21098 76543",product:"HP Laptop",       qty:1,amount:54999,status:"Delivered",  date:"Sep 1, 2026",  city:"Jaipur"       },
  { id:"BB-4839",customer:"Kavitha Iyer",   phone:"+91 98765 11223",product:"Redmi Note 13",   qty:1,amount:16999,status:"Shipped",    date:"Aug 31, 2026", city:"Surat"        },
  { id:"BB-4838",customer:"Mohan Das",      phone:"+91 87654 22334",product:"Noise ColorFit",  qty:1,amount:2999, status:"Delivered",  date:"Aug 31, 2026", city:"Nagpur"       },
  { id:"BB-4837",customer:"Sunita Verma",   phone:"+91 76543 33445",product:"Lenovo Laptop",   qty:1,amount:48999,status:"Processing", date:"Aug 30, 2026", city:"Lucknow"      },
  { id:"BB-4836",customer:"Ravi Krishnan",  phone:"+91 65432 44556",product:"iQOO Z9 Lite",   qty:1,amount:11999,status:"Shipped",    date:"Aug 30, 2026", city:"Ahmedabad"    },
  { id:"BB-4835",customer:"Meera Pillai",   phone:"+91 54321 55667",product:"Zebronics Mouse", qty:1,amount:899,  status:"Delivered",  date:"Aug 29, 2026", city:"Kochi"        },
  { id:"BB-4834",customer:"Arun Gupta",     phone:"+91 43210 66778",product:"Canon EOS",       qty:1,amount:34999,status:"Delivered",  date:"Aug 29, 2026", city:"Indore"       },
  { id:"BB-4833",customer:"Pooja Mehta",    phone:"+91 32109 77889",product:"Realme Buds",     qty:1,amount:2299, status:"Returned",   date:"Aug 28, 2026", city:"Bhopal"       },
  { id:"BB-4832",customer:"Rajesh Rao",     phone:"+91 21098 88990",product:"OnePlus Nord",    qty:1,amount:27999,status:"Returned",   date:"Aug 28, 2026", city:"Vadodara"     },
  { id:"BB-4831",customer:"Kiran Sharma",   phone:"+91 98765 99001",product:"Samsung A55",     qty:1,amount:18999,status:"Delivered",  date:"Aug 27, 2026", city:"Coimbatore"   },
  { id:"BB-4830",customer:"Neha Singh",     phone:"+91 87654 00112",product:"JBL Speaker",     qty:1,amount:4999, status:"Delivered",  date:"Aug 27, 2026", city:"Visakhapatnam"},
  { id:"BB-4829",customer:"Deepak Gupta",   phone:"+91 76543 11223",product:"Mi Band 8",       qty:1,amount:3499, status:"Delivered",  date:"Aug 26, 2026", city:"Chandigarh"   },
  { id:"BB-4828",customer:"Rekha Patel",    phone:"+91 65432 22334",product:"Sony WH1000",     qty:1,amount:22999,status:"Processing", date:"Aug 26, 2026", city:"Patna"        },
];

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { id: string; label: string; status: OrderStatus | null; count: number; icon: any; color: string }[] = [
  { id:"all",        label:"All",        status:null,          count:1847, icon:ShoppingCart, color:"#6366f1" },
  { id:"pending",    label:"Pending",    status:"Pending",     count:8,    icon:Clock,        color:"#f59e0b" },
  { id:"processing", label:"Processing", status:"Processing",  count:12,   icon:Package,      color:"#3b82f6" },
  { id:"shipped",    label:"Shipped",    status:"Shipped",     count:19,   icon:Truck,        color:"#8b5cf6" },
  { id:"delivered",  label:"Delivered",  status:"Delivered",   count:756,  icon:CheckCircle2, color:"#009966" },
  { id:"returned",   label:"Returned",   status:"Returned",    count:5,    icon:RotateCcw,    color:"#ef4444" },
  { id:"cancelled",  label:"Cancelled",  status:"Cancelled",   count:3,    icon:X,            color:"#6b7280" },
];

const DATE_FILTERS = ["Today", "Last 7 Days", "Last 30 Days", "Last 90 Days", "Custom"];

// ─── Timeline ─────────────────────────────────────────────────────────────────

const TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: "Pending",    label: "Ordered"   },
  { status: "Processing", label: "Confirmed" },
  { status: "Shipped",    label: "Packed / Shipped" },
  { status: "Delivered",  label: "Delivered" },
];

function timelineIndex(s: OrderStatus): number {
  const map: Record<OrderStatus, number> = {
    Pending: 0, Processing: 1, Shipped: 2, Delivered: 3,
    Returned: 3, Cancelled: 0,
  };
  return map[s] ?? 0;
}

// ─── Order Drawer ─────────────────────────────────────────────────────────────

function OrderDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  const sm       = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META["Processing"];
  const subtotal = order.amount * order.qty;
  const shipping = 0;
  const gst      = Math.round(subtotal * 0.18);
  const total    = subtotal + gst;
  const curIdx   = timelineIndex(order.status);

  const canShip     = order.status === "Processing" || order.status === "Pending";
  const canDeliver  = order.status === "Shipped";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Order Detail</p>
            <p className="text-sm font-black text-gray-900">{order.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg"
              style={{ color: sm.color, background: sm.bg }}>
              {sm.label}
            </span>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={13} />
            <span>{order.date}</span>
          </div>

          {/* Customer */}
          <div className={`${card} p-4`}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Customer</p>
            <p className="text-sm font-bold text-gray-900">{order.customer}</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <Phone size={11} />
              <span>{order.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
              <MapPin size={11} />
              <span>{order.city}</span>
            </div>
          </div>

          {/* Product */}
          <div className={`${card} p-4`}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Product</p>
            <p className="text-sm font-bold text-gray-900">{order.product}</p>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Qty × {order.qty}</span>
              <span className="font-semibold">{fmt(order.amount)} / unit</span>
            </div>
            <div className="flex justify-between mt-1 text-xs font-bold text-gray-800 border-t border-gray-100 pt-1">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
          </div>

          {/* Financial summary */}
          <div className={`${card} p-4`}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Financial Summary</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold">{shipping === 0 ? "Free" : fmt(shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span><span>{fmt(gst)}</span>
              </div>
              <div className="flex justify-between font-black text-gray-900 text-sm border-t border-gray-100 pt-2 mt-1">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className={`${card} p-4`}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4">Order Timeline</p>
            <div className="relative">
              {/* connector line */}
              <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-100" />
              <div className="space-y-4">
                {TIMELINE.map((step, i) => {
                  const done    = i <= curIdx;
                  const current = i === curIdx;
                  return (
                    <div key={step.status} className="flex items-start gap-3 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 text-[10px] font-black border-2 transition-all ${done ? "border-transparent text-white" : "border-gray-200 text-gray-300 bg-white"}`}
                        style={done ? { background: "#009966" } : {}}>
                        {done ? <CheckCircle2 size={12} /> : i + 1}
                      </div>
                      <div className="pt-0.5">
                        <p className={`text-xs font-bold ${current ? "text-gray-900" : done ? "text-gray-600" : "text-gray-300"}`}>
                          {step.label}
                        </p>
                        {current && (
                          <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#009966" }}>Current status</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 px-5 py-4 border-t border-gray-100 space-y-2">
          {canShip && (
            <button className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "#8b5cf6" }}>
              Mark as Shipped
            </button>
          )}
          {canDeliver && (
            <button className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "#009966" }}>
              Mark as Delivered
            </button>
          )}
          <button className="w-full py-2.5 rounded-xl text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <Printer size={14} /> Print Invoice
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SellerOrdersPage() {
  const [activeTab,   setActiveTab]   = useState("all");
  const [search,      setSearch]      = useState("");
  const [dateFilter,  setDateFilter]  = useState("Today");
  const [dateOpen,    setDateOpen]    = useState(false);
  const [selected,    setSelected]    = useState<Order | null>(null);

  const activeTabCfg = TABS.find(t => t.id === activeTab)!;

  const filtered = ORDERS.filter(o => {
    const matchTab    = activeTab === "all" || o.status === activeTabCfg.status;
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all your customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search orders..."
              className={`${inp} pl-8 w-56`}
            />
          </div>
          {/* Date filter */}
          <div className="relative">
            <button
              onClick={() => setDateOpen(v => !v)}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 font-semibold bg-white hover:bg-gray-50 transition-all"
            >
              <Filter size={13} className="text-gray-400" />
              {dateFilter}
              <ChevronDown size={13} className="text-gray-400" />
            </button>
            <AnimatePresence>
              {dateOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[160px]"
                >
                  {DATE_FILTERS.map(d => (
                    <button key={d}
                      onClick={() => { setDateFilter(d); setDateOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${d === dateFilter ? "font-bold text-[#009966]" : "text-gray-700"}`}>
                      {d}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Orders",  value: "1,847",    icon: ShoppingCart, color: "#6366f1", bg: "rgba(99,102,241,0.10)"  },
          { label: "Pending",       value: "8",        icon: Clock,        color: "#ef4444", bg: "rgba(239,68,68,0.10)"   },
          { label: "Processing",    value: "12",       icon: Package,      color: "#3b82f6", bg: "rgba(59,130,246,0.10)"  },
          { label: "Revenue",       value: "₹1.84 Cr", icon: IndianRupee,  color: "#009966", bg: "rgba(0,153,102,0.10)"   },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className={`${card} p-4 flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className="text-lg font-black text-gray-900">{s.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className={`${card} p-1.5 flex gap-1 overflow-x-auto`}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${active ? "text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
              style={active ? { background: tab.color } : {}}>
              <Icon size={12} />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <motion.div layout className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-400 uppercase tracking-wider">
                {["#", "Order ID", "Customer", "Product", "Qty", "Amount", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((o, i) => {
                  const sm = ORDER_STATUS_META[o.status] ?? ORDER_STATUS_META["Processing"];
                  return (
                    <motion.tr
                      key={o.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-gray-400 font-semibold">{i + 1}</td>
                      <td className="px-4 py-3 font-bold text-gray-800 text-xs">{o.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-gray-800">{o.customer}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={9} />{o.city}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 max-w-[130px] truncate">{o.product}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 font-semibold">{o.qty}</td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-900">{fmt(o.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ color: sm.color, background: sm.bg }}>
                          {sm.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{o.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setSelected(o)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#3b82f6] hover:bg-blue-50 transition-all">
                            <Eye size={13} />
                          </button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                            <Printer size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                    No orders found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Order detail drawer */}
      <AnimatePresence>
        {selected && (
          <OrderDrawer order={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
