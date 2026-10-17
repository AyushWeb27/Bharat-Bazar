import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Printer, Download, CheckSquare, Square, FileText, Tag, Package, IndianRupee, Search, X, CheckCircle2, Filter } from "lucide-react";
import { PageHeader, StatCard, SectionCard } from "./shared/ui";
import { G, fmt, inp } from "./shared/constants";

type PrintType = "invoice" | "label" | "packing";
type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered";

type PrintOrder = {
  id: string;
  customer: string;
  city: string;
  amount: number;
  items: number;
  status: OrderStatus;
  date: string;
  address: string;
  pincode: string;
  phone: string;
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending:    "#f59e0b",
  Processing: "#3b82f6",
  Shipped:    "#8b5cf6",
  Delivered:  "#009966",
};

const INIT_ORDERS: PrintOrder[] = [
  { id: "BB-29041", customer: "Arjun Mehta",     city: "Mumbai",    amount: 1840,  items: 3, status: "Delivered",  date: "5 Sep 2026", address: "12 Marine Lines, Churchgate", pincode: "400020", phone: "9876543210" },
  { id: "BB-29042", customer: "Priya Singh",      city: "Delhi",     amount: 2499,  items: 1, status: "Shipped",    date: "5 Sep 2026", address: "45 Connaught Place",          pincode: "110001", phone: "9823456789" },
  { id: "BB-29043", customer: "Rahul Nair",       city: "Bengaluru", amount: 890,   items: 5, status: "Processing", date: "5 Sep 2026", address: "88 Koramangala 5th Block",    pincode: "560034", phone: "9988776655" },
  { id: "BB-29044", customer: "Sneha Reddy",      city: "Hyderabad", amount: 3200,  items: 2, status: "Pending",    date: "5 Sep 2026", address: "23 Jubilee Hills",            pincode: "500033", phone: "9712345678" },
  { id: "BB-29045", customer: "Vikash Gupta",     city: "Pune",      amount: 560,   items: 4, status: "Delivered",  date: "5 Sep 2026", address: "7 Koregaon Park",             pincode: "411001", phone: "9823111222" },
  { id: "BB-29046", customer: "Meera Iyer",       city: "Chennai",   amount: 12499, items: 1, status: "Shipped",    date: "5 Sep 2026", address: "56 Anna Nagar",               pincode: "600040", phone: "9900112233" },
  { id: "BB-29047", customer: "Sunil Krishnan",   city: "Kolkata",   amount: 780,   items: 6, status: "Processing", date: "5 Sep 2026", address: "33 Park Street",              pincode: "700016", phone: "9876001122" },
  { id: "BB-29049", customer: "Ankit Sharma",     city: "Jaipur",    amount: 2100,  items: 3, status: "Delivered",  date: "5 Sep 2026", address: "14 Civil Lines",              pincode: "302006", phone: "9751234567" },
  { id: "BB-29050", customer: "Deepa Pillai",     city: "Mumbai",    amount: 4999,  items: 1, status: "Processing", date: "5 Sep 2026", address: "90 Linking Road, Bandra",     pincode: "400050", phone: "9632587410" },
  { id: "BB-29051", customer: "Ravi Shankar",     city: "Delhi",     amount: 1220,  items: 8, status: "Shipped",    date: "5 Sep 2026", address: "22 Lajpat Nagar",             pincode: "110024", phone: "9786541230" },
  { id: "BB-29052", customer: "Pooja Desai",      city: "Ahmedabad", amount: 870,   items: 2, status: "Pending",    date: "5 Sep 2026", address: "5 Ashram Road",               pincode: "380009", phone: "9812309876" },
  { id: "BB-29053", customer: "Karan Malhotra",   city: "Bengaluru", amount: 1490,  items: 3, status: "Shipped",    date: "5 Sep 2026", address: "11 Indiranagar 100ft Road",   pincode: "560038", phone: "9741236547" },
];

const PRINT_TYPES: { id: PrintType; label: string; desc: string; icon: React.ElementType }[] = [
  { id: "invoice", label: "Invoice",         desc: "Full tax invoice with itemised billing", icon: FileText  },
  { id: "label",   label: "Shipping Label",  desc: "Address + barcode for courier handover", icon: Tag       },
  { id: "packing", label: "Packing Slip",    desc: "Contents list for warehouse packing",    icon: Package   },
];

export function BulkPrintOrdersPage() {
  const [orders]          = useState(INIT_ORDERS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printType, setPrintType] = useState<PrintType>("invoice");
  const [statusF, setStatusF] = useState<OrderStatus | "All">("All");
  const [q, setQ]         = useState("");
  const [printed, setPrinted] = useState(false);
  const [printing, setPrinting] = useState(false);

  const filtered = orders.filter(o => {
    const qOk = !q || o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.toLowerCase().includes(q.toLowerCase());
    const sOk  = statusF === "All" || o.status === statusF;
    return qOk && sOk;
  });

  const toggleOne  = (id: string) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll  = () => { if (selected.size === filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map(o => o.id))); };
  const allChecked = filtered.length > 0 && selected.size === filtered.length;

  const selectedOrders = orders.filter(o => selected.has(o.id));
  const totalValue = selectedOrders.reduce((s, o) => s + o.amount, 0);

  const handlePrint = () => {
    if (selected.size === 0) return;
    setPrinting(true);
    setTimeout(() => { setPrinting(false); setPrinted(true); setTimeout(() => setPrinted(false), 3000); }, 1800);
  };

  const STATUSES: (OrderStatus | "All")[] = ["All", "Pending", "Processing", "Shipped", "Delivered"];

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Orders / Bulk Print" title="Bulk Print Orders"
        subtitle="Select orders and batch-print invoices, shipping labels or packing slips">
        <button onClick={handlePrint} disabled={selected.size === 0 || printing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
          style={{ background: G }}>
          <Printer size={14} className={printing ? "animate-pulse" : ""}/>
          {printing ? "Printing…" : `Print ${selected.size > 0 ? `(${selected.size})` : ""}`}
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Orders"    val={orders.length}                                  color={G}        icon={Printer}     />
        <StatCard label="Selected"        val={selected.size}                                  color="#6366f1"  icon={CheckSquare} />
        <StatCard label="Selected Value"  val={selected.size > 0 ? fmt(totalValue) : "₹0"}    color="#f59e0b"  icon={IndianRupee} />
        <StatCard label="Print Type"      val={PRINT_TYPES.find(p => p.id === printType)?.label ?? ""} color="#0d9488" icon={FileText}/>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {printed && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
            style={{ background: "#e8fff6", borderColor: `${G}30` }}>
            <CheckCircle2 size={18} style={{ color: G }}/>
            <p className="text-sm font-bold" style={{ color: G }}>
              {selected.size} order{selected.size !== 1 ? "s" : ""} sent to print — {PRINT_TYPES.find(p => p.id === printType)?.label} generated successfully.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left — Order table */}
        <div className="lg:col-span-2 space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search order ID or customer…"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#009966] transition-all"/>
            </div>
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
              <Filter size={12} className="text-gray-400 ml-1"/>
              {STATUSES.map(s => (
                <button key={s} onClick={() => setStatusF(s)}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                  style={statusF === s ? { background: s === "All" ? G : STATUS_COLORS[s as OrderStatus], color: "#fff" } : { color: "#6b7280" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <SectionCard>
            {/* Select-all header */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-1">
              <button onClick={toggleAll} className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors">
                {allChecked
                  ? <CheckSquare size={16} style={{ color: G }}/>
                  : <Square size={16} className="text-gray-300"/>}
                {allChecked ? "Deselect All" : `Select All (${filtered.length})`}
              </button>
              {selected.size > 0 && (
                <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: `${G}15`, color: G }}>
                  {selected.size} selected
                </span>
              )}
            </div>

            {/* Order rows */}
            <div className="space-y-1">
              {filtered.map(o => {
                const isSel  = selected.has(o.id);
                const sColor = STATUS_COLORS[o.status];
                return (
                  <motion.div key={o.id} layout
                    onClick={() => toggleOne(o.id)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border"
                    style={{ borderColor: isSel ? `${G}40` : "transparent", background: isSel ? `${G}06` : "transparent" }}>
                    {isSel
                      ? <CheckSquare size={15} style={{ color: G }} className="shrink-0"/>
                      : <Square size={15} className="text-gray-300 shrink-0"/>}

                    <div className="flex-1 min-w-0 grid grid-cols-4 gap-2 items-center">
                      <div>
                        <p className="text-[10px] font-mono font-bold text-gray-500">#{o.id}</p>
                        <p className="text-xs font-bold text-gray-800 truncate">{o.customer}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400">{o.city}</p>
                        <p className="text-[10px] font-mono text-gray-400">{o.pincode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-900">{fmt(o.amount)}</p>
                        <p className="text-[10px] text-gray-400">{o.items} item{o.items !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block text-[9px] font-black px-2 py-1 rounded-lg"
                          style={{ color: sColor, background: `${sColor}15` }}>{o.status}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-10 text-center text-sm text-gray-400">No orders match filters</div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right — Print settings + preview */}
        <div className="space-y-4">
          {/* Print type selector */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Print Type</p>
            <div className="space-y-2">
              {PRINT_TYPES.map(pt => {
                const Icon = pt.icon;
                const active = printType === pt.id;
                return (
                  <button key={pt.id} onClick={() => setPrintType(pt.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
                    style={{ borderColor: active ? G : "#e5e7eb", background: active ? `${G}06` : "transparent" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: active ? `${G}20` : "#f3f4f6" }}>
                      <Icon size={15} style={{ color: active ? G : "#9ca3af" }}/>
                    </div>
                    <div>
                      <p className="text-xs font-black" style={{ color: active ? G : "#374151" }}>{pt.label}</p>
                      <p className="text-[10px] text-gray-400">{pt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document preview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Preview</p>

            {/* Fake document */}
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 font-mono">
              {/* Header */}
              <div className="flex items-start justify-between mb-3 pb-2 border-b border-gray-200">
                <div>
                  <p className="text-[9px] font-black text-gray-800">BharatBazar</p>
                  <p className="text-[7px] text-gray-400">Super Admin · admin@bharatbazar.com</p>
                </div>
                <p className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: `${G}20`, color: G }}>
                  {printType === "invoice" ? "TAX INVOICE" : printType === "label" ? "SHIPPING LABEL" : "PACKING SLIP"}
                </p>
              </div>

              {selectedOrders.length > 0 ? (
                <div className="space-y-2">
                  {selectedOrders.slice(0, 3).map(o => (
                    <div key={o.id} className="text-[8px] text-gray-600 space-y-0.5 pb-2 border-b border-gray-100 last:border-0">
                      <p className="font-black text-gray-800">#{o.id} — {o.customer}</p>
                      {printType === "label" && <><p>{o.address}</p><p>{o.city} {o.pincode}</p><p>Ph: {o.phone}</p></>}
                      {printType === "invoice" && <><p>Amount: {fmt(o.amount)}</p><p>Items: {o.items}</p></>}
                      {printType === "packing" && <><p>Items: {o.items} units</p><p>Destination: {o.city}</p></>}
                    </div>
                  ))}
                  {selectedOrders.length > 3 && (
                    <p className="text-[7px] text-gray-400 text-center">… and {selectedOrders.length - 3} more order{selectedOrders.length - 3 !== 1 ? "s" : ""}</p>
                  )}
                </div>
              ) : (
                <p className="text-[8px] text-gray-400 text-center py-4">Select orders to preview</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={handlePrint} disabled={selected.size === 0 || printing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white disabled:opacity-40 transition-all"
              style={{ background: G }}>
              <Printer size={15} className={printing ? "animate-pulse" : ""}/>
              {printing ? "Sending to Printer…" : `Print ${selected.size} Order${selected.size !== 1 ? "s" : ""}`}
            </button>
            <button disabled={selected.size === 0}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-40 transition-all">
              <Download size={14}/> Download as PDF
            </button>
          </div>

          {selected.size > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <IndianRupee size={12} style={{ color: G }}/>
              <span>Combined order value: <span className="font-black text-gray-900">{fmt(totalValue)}</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkPrintOrdersPage;
