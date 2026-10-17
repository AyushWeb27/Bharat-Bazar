import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ListOrdered, Clock, PackageCheck, Package, Truck,
  Navigation, CheckCircle2, XCircle, Eye, X,
  MapPin, Phone, IndianRupee, ChevronDown,
  Search, Filter, Download, RefreshCw,
} from "lucide-react";
import { G, fmt, inp } from "./shared/constants";
import { StatCard } from "./shared/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "Pending"
  | "Received"
  | "Processed"
  | "Shipped"
  | "Out For Delivery"
  | "Delivered"
  | "Cancelled";

type Order = {
  id: string;
  customer: string;
  phone: string;
  email: string;
  items: number;
  amount: number;
  status: OrderStatus;
  city: string;
  address: string;
  pincode: string;
  time: string;
  date: string;
  products: string[];
};

// ─── Status meta ─────────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  "Pending":          { color: "#f59e0b", bg: "#fffbeb", icon: Clock,         label: "Pending"          },
  "Received":         { color: "#0d9488", bg: "#f0fdfa", icon: PackageCheck,  label: "Received"         },
  "Processed":        { color: "#3b82f6", bg: "#eff6ff", icon: Package,       label: "Processed"        },
  "Shipped":          { color: "#8b5cf6", bg: "#f5f3ff", icon: Truck,         label: "Shipped"          },
  "Out For Delivery": { color: "#ec4899", bg: "#fdf2f8", icon: Navigation,    label: "Out For Delivery" },
  "Delivered":        { color: "#009966", bg: "#e8fff6", icon: CheckCircle2,  label: "Delivered"        },
  "Cancelled":        { color: "#ef4444", bg: "#fef2f2", icon: XCircle,       label: "Cancelled"        },
};

const SIDE_NAV: { id: string; label: string; status: OrderStatus | null; icon: React.ElementType; color: string }[] = [
  { id: "all",           label: "All Orders",       status: null,              icon: ListOrdered,  color: "#6366f1" },
  { id: "pending",       label: "Pending Order",    status: "Pending",         icon: Clock,        color: "#f59e0b" },
  { id: "received",      label: "Received Order",   status: "Received",        icon: PackageCheck, color: "#0d9488" },
  { id: "processed",     label: "Processed Order",  status: "Processed",       icon: Package,      color: "#3b82f6" },
  { id: "shipped",       label: "Shipped Order",    status: "Shipped",         icon: Truck,        color: "#8b5cf6" },
  { id: "out-delivery",  label: "Out For Delivery", status: "Out For Delivery",icon: Navigation,   color: "#ec4899" },
  { id: "delivered",     label: "Delivered Order",  status: "Delivered",       icon: CheckCircle2, color: "#009966" },
  { id: "cancelled",     label: "Cancelled Order",  status: "Cancelled",       icon: XCircle,      color: "#ef4444" },
];

// ─── Sample data ──────────────────────────────────────────────────────────────

const INIT_ORDERS: Order[] = [
  { id: "BB-29041", customer: "Arjun Mehta",      phone: "9876543210", email: "arjun@email.com",   items: 3, amount: 1840,  status: "Delivered",        city: "Mumbai",    address: "12 Marine Lines, Churchgate",       pincode: "400020", time: "9:14 am",  date: "5 Sep 2026", products: ["Basmati Rice 5kg", "Dosa Mix", "Coconut Oil"]          },
  { id: "BB-29042", customer: "Priya Singh",       phone: "9823456789", email: "priya@email.com",   items: 1, amount: 2499,  status: "Shipped",          city: "Delhi",     address: "45 Connaught Place, New Delhi",     pincode: "110001", time: "9:32 am",  date: "5 Sep 2026", products: ["OnePlus Earbuds Pro"]                                  },
  { id: "BB-29043", customer: "Rahul Nair",        phone: "9988776655", email: "rahul@email.com",   items: 5, amount: 890,   status: "Processed",        city: "Bengaluru", address: "88 Koramangala 5th Block",          pincode: "560034", time: "10:02 am", date: "5 Sep 2026", products: ["Turmeric", "Coriander", "Chilli", "Jeera", "Atta"]    },
  { id: "BB-29044", customer: "Sneha Reddy",       phone: "9712345678", email: "sneha@email.com",   items: 2, amount: 3200,  status: "Pending",          city: "Hyderabad", address: "23 Jubilee Hills",                  pincode: "500033", time: "10:18 am", date: "5 Sep 2026", products: ["Mixer Grinder 750W", "Knife Set"]                      },
  { id: "BB-29045", customer: "Vikash Gupta",      phone: "9823111222", email: "vikash@email.com",  items: 4, amount: 560,   status: "Delivered",        city: "Pune",      address: "7 Koregaon Park",                   pincode: "411001", time: "10:45 am", date: "5 Sep 2026", products: ["Mango Pickle", "Lemon Pickle", "Mixed Veg", "Amla"]   },
  { id: "BB-29046", customer: "Meera Iyer",        phone: "9900112233", email: "meera@email.com",   items: 1, amount: 12499, status: "Out For Delivery", city: "Chennai",   address: "56 Anna Nagar",                     pincode: "600040", time: "11:07 am", date: "5 Sep 2026", products: ["Samsung Galaxy Tab S8"]                                },
  { id: "BB-29047", customer: "Sunil Krishnan",    phone: "9876001122", email: "sunil@email.com",   items: 6, amount: 780,   status: "Cancelled",        city: "Kolkata",   address: "33 Park Street",                    pincode: "700016", time: "11:22 am", date: "5 Sep 2026", products: ["Assam Tea", "Darjeeling Tea", "Green Tea", "Honey", "Jam", "Bread"] },
  { id: "BB-29048", customer: "Kavya Menon",       phone: "9845678901", email: "kavya@email.com",   items: 2, amount: 1450,  status: "Received",         city: "Kochi",     address: "8 MG Road, Ernakulam",              pincode: "682011", time: "11:55 am", date: "5 Sep 2026", products: ["Kurti Set", "Dupatta"]                                 },
  { id: "BB-29049", customer: "Ankit Sharma",      phone: "9751234567", email: "ankit@email.com",   items: 3, amount: 2100,  status: "Delivered",        city: "Jaipur",    address: "14 Civil Lines",                    pincode: "302006", time: "12:10 pm", date: "5 Sep 2026", products: ["Rajasthani Bedsheet", "Pillow Cover", "Curtain"]       },
  { id: "BB-29050", customer: "Deepa Pillai",      phone: "9632587410", email: "deepa@email.com",   items: 1, amount: 4999,  status: "Processed",        city: "Mumbai",    address: "90 Linking Road, Bandra West",      pincode: "400050", time: "12:40 pm", date: "5 Sep 2026", products: ["Prestige Cooker 5L"]                                   },
  { id: "BB-29051", customer: "Ravi Shankar",      phone: "9786541230", email: "ravi@email.com",    items: 8, amount: 1220,  status: "Shipped",          city: "Delhi",     address: "22 Lajpat Nagar",                   pincode: "110024", time: "1:05 pm",  date: "5 Sep 2026", products: ["Spice Box Set", "Mortar & Pestle", "Tawa", "Kadai", "Ladle", "Spatula", "Peeler", "Chakla"] },
  { id: "BB-29052", customer: "Pooja Desai",       phone: "9812309876", email: "pooja@email.com",   items: 2, amount: 870,   status: "Pending",          city: "Ahmedabad", address: "5 Ashram Road",                     pincode: "380009", time: "1:28 pm",  date: "5 Sep 2026", products: ["Jaggery 2kg", "Groundnut Oil 2L"]                      },
  { id: "BB-29053", customer: "Karan Malhotra",    phone: "9741236547", email: "karan@email.com",   items: 3, amount: 1490,  status: "Shipped",          city: "Bengaluru", address: "11 Indiranagar 100ft Road",         pincode: "560038", time: "2:10 pm",  date: "5 Sep 2026", products: ["Wheat Flour 10kg", "Rice 5kg", "Dal 2kg"]             },
  { id: "BB-29054", customer: "Neha Kapoor",       phone: "9654321098", email: "neha@email.com",    items: 2, amount: 3400,  status: "Out For Delivery", city: "Mumbai",    address: "67 Worli Sea Face",                 pincode: "400018", time: "2:30 pm",  date: "5 Sep 2026", products: ["Air Fryer 4L", "Silicon Spatula Set"]                 },
  { id: "BB-29055", customer: "Sanjay Verma",      phone: "9908765432", email: "sanjay@email.com",  items: 1, amount: 8999,  status: "Received",         city: "Noida",     address: "Sector 62, Block C",                pincode: "201309", time: "3:00 pm",  date: "5 Sep 2026", products: ["Philips Air Fryer XL"]                                 },
  { id: "BB-29056", customer: "Lakshmi Rao",       phone: "9876123456", email: "lakshmi@email.com", items: 4, amount: 650,   status: "Delivered",        city: "Visakhapatnam", address: "Dwaraka Nagar, 3rd Lane",       pincode: "530016", time: "3:20 pm",  date: "5 Sep 2026", products: ["Neem Soap 6-pack", "Coconut Shampoo", "Aloe Gel", "Face Wash"] },
  { id: "BB-29057", customer: "Harish Nambiar",    phone: "9843215678", email: "harish@email.com",  items: 2, amount: 5400,  status: "Processed",        city: "Thiruvananthapuram", address: "Kowdiar, Medical College Road", pincode: "695003", time: "3:45 pm",  date: "5 Sep 2026", products: ["Smart Watch Series 8", "Charging Cable"]             },
  { id: "BB-29058", customer: "Geeta Sharma",      phone: "9765432100", email: "geeta@email.com",   items: 7, amount: 1120,  status: "Pending",          city: "Chandigarh","address": "Sector 17, Market Road",         pincode: "160017", time: "4:00 pm",  date: "5 Sep 2026", products: ["Pulao Rice", "Chana Dal", "Rajma", "Moong Dal", "Masoor", "Urad Dal", "Arhar Dal"] },
  { id: "BB-29059", customer: "Ritu Agarwal",      phone: "9812987654", email: "ritu@email.com",    items: 3, amount: 2800,  status: "Out For Delivery", city: "Lucknow",   address: "Gomti Nagar, Sector A",             pincode: "226010", time: "4:15 pm",  date: "5 Sep 2026", products: ["Cotton Saree", "Blouse Fabric", "Petticoat"]          },
  { id: "BB-29060", customer: "Mohan Das",         phone: "9900871234", email: "mohan@email.com",   items: 1, amount: 15999, status: "Received",         city: "Bhopal",    address: "MP Nagar Zone 1",                   pincode: "462011", time: "4:40 pm",  date: "5 Sep 2026", products: ["iPhone 15 Case Bundle"]                               },
  { id: "BB-29061", customer: "Divya Nair",        phone: "9856321470", email: "divya@email.com",   items: 5, amount: 980,   status: "Shipped",          city: "Kochi",     address: "Panampilly Nagar",                  pincode: "682036", time: "5:00 pm",  date: "5 Sep 2026", products: ["Spice Set", "Masala Box", "Pepper", "Cardamom", "Bay Leaf"] },
  { id: "BB-29062", customer: "Arun Pillai",       phone: "9741200987", email: "arun@email.com",    items: 2, amount: 4200,  status: "Cancelled",        city: "Coimbatore","address": "RS Puram, 2nd Cross",             pincode: "641002", time: "5:20 pm",  date: "5 Sep 2026", products: ["Electric Kettle", "Tea Strainer"]                     },
  { id: "BB-29063", customer: "Sunita Joshi",      phone: "9823654100", email: "sunita@email.com",  items: 3, amount: 1700,  status: "Delivered",        city: "Indore",    address: "Vijay Nagar, South Avenue",         pincode: "452010", time: "5:50 pm",  date: "5 Sep 2026", products: ["Kurti Pack 3", "Leggings 2-pack", "Dupatta"]          },
  { id: "BB-29064", customer: "Tarun Mehta",       phone: "9965432876", email: "tarun@email.com",   items: 1, amount: 6999,  status: "Processed",        city: "Surat",     address: "Citylight Road, Adajan",            pincode: "395009", time: "6:10 pm",  date: "5 Sep 2026", products: ["Instant Pot 6L Duo"]                                  },
  { id: "BB-29065", customer: "Pallavi Krishnan",  phone: "9876540023", email: "pallavi@email.com", items: 4, amount: 3100,  status: "Out For Delivery", city: "Nagpur",    address: "Dharampeth, Central Avenue",        pincode: "440010", time: "6:30 pm",  date: "5 Sep 2026", products: ["Bedsheet King", "Pillow Set 2", "Blanket", "Cushion"] },
  { id: "BB-29066", customer: "Vinod Kumar",       phone: "9741320098", email: "vinod@email.com",   items: 2, amount: 750,   status: "Cancelled",        city: "Patna",     address: "Boring Road, Patna",                pincode: "800001", time: "7:00 pm",  date: "5 Sep 2026", products: ["Glucose Biscuits 5-pack", "Namkeen Mix"]              },
  { id: "BB-29067", customer: "Rekha Menon",       phone: "9876002134", email: "rekha@email.com",   items: 6, amount: 2400,  status: "Received",         city: "Thrissur",  address: "Round South, Thrissur",             pincode: "680001", time: "7:20 pm",  date: "5 Sep 2026", products: ["Tamarind 1kg", "Kokum", "Curry Leaves", "Drumstick", "Raw Mango", "Jackfruit Chips"] },
  { id: "BB-29068", customer: "Suresh Babu",       phone: "9654009871", email: "suresh@email.com",  items: 1, amount: 22999, status: "Pending",          city: "Hyderabad", address: "Banjara Hills, Road No 10",         pincode: "500034", time: "7:45 pm",  date: "5 Sep 2026", products: ["DSLR Camera Lens 50mm"]                               },
  { id: "BB-29069", customer: "Anjali Gupta",      phone: "9876543001", email: "anjali@email.com",  items: 3, amount: 1900,  status: "Shipped",          city: "Agra",      address: "Kamla Nagar, MG Road",              pincode: "282002", time: "8:00 pm",  date: "5 Sep 2026", products: ["Leather Wallet", "Belt", "Sunglasses"]                },
  { id: "BB-29070", customer: "Prakash Rao",       phone: "9712000765", email: "prakash@email.com", items: 2, amount: 500,   status: "Delivered",        city: "Mysuru",    address: "VV Mohalla, Ashoka Road",           pincode: "570002", time: "8:30 pm",  date: "5 Sep 2026", products: ["Agarbatti Premium", "Camphor Pack"]                   },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const PAGE_DESCRIPTIONS: Record<string, string> = {
  all:          "Every order placed across all statuses",
  pending:      "Orders awaiting confirmation from your team",
  received:     "Orders confirmed and logged in the system",
  processed:    "Orders packed and ready for handover to courier",
  shipped:      "Orders dispatched with the courier partner",
  "out-delivery": "Orders currently with the delivery agent",
  delivered:    "Successfully completed deliveries",
  cancelled:    "Orders cancelled by customer or admin",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderListPage() {
  const [orders, setOrders]   = useState(INIT_ORDERS);
  const [activeTab, setActiveTab] = useState("all");
  const [q, setQ]             = useState("");
  const [detail, setDetail]   = useState<Order | null>(null);
  const [sideCollapsed, setSideCollapsed] = useState(false);

  const navItem     = SIDE_NAV.find(n => n.id === activeTab)!;
  const countOf     = (status: OrderStatus | null) => status ? orders.filter(o => o.status === status).length : orders.length;

  const displayed = orders.filter(o => {
    const statusOk = !navItem.status || o.status === navItem.status;
    const qOk      = !q || o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.toLowerCase().includes(q.toLowerCase()) || o.city.toLowerCase().includes(q.toLowerCase());
    return statusOk && qOk;
  });

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders(p => p.map(o => o.id === id ? { ...o, status } : o));
    if (detail?.id === id) setDetail(d => d ? { ...d, status } : d);
  };

  const totalRevenue = displayed.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] -m-4 md:-m-5 overflow-hidden">

      {/* ── MOBILE HORIZONTAL NAV ── */}
      <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto flex shrink-0"
        style={{ scrollbarWidth: "none" }}>
        {SIDE_NAV.map(nav => {
          const Icon = nav.icon;
          const isActive = activeTab === nav.id;
          const short = nav.id === "all" ? "All" : nav.id === "out-delivery" ? "Delivery" : (nav.status ?? "All");
          return (
            <button key={nav.id} onClick={() => { setActiveTab(nav.id); setQ(""); }}
              className="flex flex-col items-center gap-1 px-3 py-2.5 shrink-0 border-b-2 transition-all"
              style={{ borderBottomColor: isActive ? nav.color : "transparent",
                       color: isActive ? nav.color : "#6b7280" }}>
              <Icon size={15}/>
              <span className="text-[9px] font-bold whitespace-nowrap">{short}</span>
            </button>
          );
        })}
      </div>

      {/* ── LEFT SIDE NAV (desktop) ── */}
      <motion.div
        animate={{ width: sideCollapsed ? 56 : 220 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="hidden md:flex shrink-0 flex-col border-r border-gray-200 bg-white overflow-hidden min-h-0 h-full">

        {/* Panel header */}
        <div className={`flex items-center border-b border-gray-100 px-3 py-3.5 ${sideCollapsed ? "justify-center" : "justify-between"}`}>
          {!sideCollapsed && <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">Order Status</span>}
          <button onClick={() => setSideCollapsed(v => !v)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0">
            <Filter size={12}/>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "none" }}>
          {SIDE_NAV.map(nav => {
            const Icon    = nav.icon;
            const count   = countOf(nav.status);
            const isActive = activeTab === nav.id;
            return (
              <button key={nav.id} onClick={() => { setActiveTab(nav.id); setQ(""); }}
                title={sideCollapsed ? nav.label : undefined}
                className={`relative w-full flex items-center transition-all group ${sideCollapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5"}`}
                style={{ background: isActive ? `${nav.color}12` : "transparent" }}>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full" style={{ background: nav.color }}/>}

                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={isActive ? { background: `${nav.color}20` } : { background: "transparent" }}>
                  <Icon size={14} style={{ color: isActive ? nav.color : "#9ca3af" }}
                    className="transition-colors group-hover:text-gray-600"/>
                </div>

                {!sideCollapsed && (
                  <>
                    <span className="flex-1 text-left text-xs font-bold truncate transition-colors"
                      style={{ color: isActive ? nav.color : "#374151" }}>
                      {nav.label}
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 transition-all"
                      style={isActive
                        ? { background: `${nav.color}20`, color: nav.color }
                        : { background: "#f3f4f6", color: "#9ca3af" }}>
                      {count}
                    </span>
                  </>
                )}

                {/* Tooltip when collapsed */}
                {sideCollapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-[10px] font-semibold px-2 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-1.5">
                      {nav.label}
                      <span className="font-black text-gray-400">{count}</span>
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"/>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Total count footer */}
        {!sideCollapsed && (
          <div className="border-t border-gray-100 px-3 py-3">
            <p className="text-[9px] text-gray-400 font-semibold">{orders.length} total orders</p>
          </div>
        )}
      </motion.div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 p-4 md:p-5 space-y-4 overflow-y-auto">

        {/* Page title */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.16 }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${navItem.color}15` }}>
                  <navItem.icon size={18} style={{ color: navItem.color }}/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Orders</p>
                  <h2 className="text-lg font-black text-gray-900">{navItem.label}</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">{PAGE_DESCRIPTIONS[activeTab]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">
                  <Download size={12}/> Export
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white" style={{ background: navItem.color }}>
                  <RefreshCw size={12}/> Refresh
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Stat cards */}
        <AnimatePresence mode="wait">
          <motion.div key={`stats-${activeTab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total"        val={displayed.length}                     color={navItem.color}  icon={navItem.icon}  />
            <StatCard label="Order Value"  val={`₹${(totalRevenue/1000).toFixed(1)}k`} color="#3b82f6"      icon={IndianRupee}   />
            <StatCard label="Avg Order"    val={displayed.length ? `₹${Math.round(totalRevenue/displayed.length).toLocaleString("en-IN")}` : "₹0"} color="#8b5cf6" icon={IndianRupee}/>
            <StatCard label="Cities"       val={new Set(displayed.map(o => o.city)).size} color="#f59e0b"   icon={MapPin}        />
          </motion.div>
        </AnimatePresence>

        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder={`Search in ${navItem.label}…`}
              className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-8 py-2 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all"/>
            {q && (
              <button onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X size={12}/>
              </button>
            )}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{displayed.length} result{displayed.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Order table */}
        <AnimatePresence mode="wait">
          <motion.div key={`table-${activeTab}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {displayed.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                      {["Order ID","Customer","Amount","Items","City","Status","Date",""].map(h => (
                        <th key={h} className="text-left text-[9px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 first:rounded-tl-2xl whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {displayed.map(o => {
                      const sm = STATUS_META[o.status];
                      const SI = sm.icon;
                      return (
                        <motion.tr key={o.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="group hover:bg-gray-50/60 transition-colors">
                          {/* Order ID */}
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-mono font-bold text-gray-400">#{o.id}</span>
                          </td>
                          {/* Customer */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white shrink-0"
                                style={{ background: navItem.color }}>
                                {initials(o.customer)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-800 whitespace-nowrap">{o.customer}</p>
                                <p className="text-[9px] text-gray-400">{o.phone}</p>
                              </div>
                            </div>
                          </td>
                          {/* Amount */}
                          <td className="px-4 py-3">
                            <span className="text-xs font-black text-gray-900">{fmt(o.amount)}</span>
                          </td>
                          {/* Items */}
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-500">{o.items}</span>
                          </td>
                          {/* City */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin size={10} className="text-gray-300 shrink-0"/>
                              {o.city}
                            </div>
                          </td>
                          {/* Status — hover to change */}
                          <td className="px-4 py-3">
                            <div className="relative group/st">
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer select-none"
                                style={{ color: sm.color, background: sm.bg }}>
                                <SI size={10}/> {o.status}
                                <ChevronDown size={9} className="opacity-60"/>
                              </span>
                              <div className="hidden group-hover/st:block absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden w-44">
                                {(Object.keys(STATUS_META) as OrderStatus[]).map(st => {
                                  const m2 = STATUS_META[st];
                                  const I2 = m2.icon;
                                  return (
                                    <button key={st} onClick={() => updateStatus(o.id, st)}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold hover:bg-gray-50 transition-colors text-left"
                                      style={{ color: m2.color }}>
                                      <I2 size={11}/> {st}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                          {/* Date */}
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-[10px] text-gray-500 whitespace-nowrap">{o.date}</p>
                              <p className="text-[9px] text-gray-400">{o.time}</p>
                            </div>
                          </td>
                          {/* Actions */}
                          <td className="px-4 py-3">
                            <button onClick={() => setDetail(o)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                              <Eye size={13}/>
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${navItem.color}12` }}>
                  <navItem.icon size={28} style={{ color: navItem.color, opacity: 0.5 }}/>
                </div>
                <p className="text-sm font-black text-gray-400">No {navItem.label.toLowerCase()} found</p>
                {q && <button onClick={() => setQ("")} className="text-xs font-bold" style={{ color: G }}>Clear search</button>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── ORDER DETAIL DRAWER ── */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetail(null)}/>
            <motion.div initial={{ x: 380, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 380, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col overflow-hidden">

              {/* Drawer header */}
              <div className="shrink-0 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Order Detail</p>
                  <p className="text-sm font-black text-gray-900">#{detail.id}</p>
                </div>
                <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                  <X size={15}/>
                </button>
              </div>

              {/* Status bar */}
              <div className="shrink-0 px-5 py-3 flex items-center gap-3 border-b border-gray-100" style={{ background: `${STATUS_META[detail.status].bg}` }}>
                {(() => { const sm = STATUS_META[detail.status]; const SI = sm.icon; return (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl" style={{ color: sm.color, background: "rgba(255,255,255,0.6)" }}>
                    <SI size={12}/> {detail.status}
                  </span>
                ); })()}
                <select value={detail.status} onChange={e => updateStatus(detail.id, e.target.value as OrderStatus)} className={`${inp} flex-1 text-xs`}>
                  {(Object.keys(STATUS_META) as OrderStatus[]).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Customer */}
                <div className="rounded-2xl border border-gray-200 p-3.5 space-y-2.5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0"
                      style={{ background: G }}>{initials(detail.customer)}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{detail.customer}</p>
                      <p className="text-[10px] text-gray-400">{detail.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={11} className="text-gray-400"/> {detail.phone}
                  </div>
                </div>

                {/* Address */}
                <div className="rounded-2xl border border-gray-200 p-3.5 space-y-1.5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Delivery Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0"/>
                    <div>
                      <p className="text-xs text-gray-700 leading-relaxed">{detail.address}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{detail.city} — {detail.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="rounded-2xl border border-gray-200 p-3.5 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Products ({detail.items})</p>
                  {detail.products.map((pr, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Package size={12} className="text-gray-400"/>
                      </div>
                      <span className="text-xs text-gray-700">{pr}</span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="rounded-2xl border border-gray-200 p-3.5 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Summary</p>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Subtotal</span><span className="font-bold text-gray-800">{fmt(detail.amount)}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Delivery</span><span className="font-bold text-green-600">FREE</span></div>
                  <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-black">
                    <span className="text-gray-900">Total</span>
                    <span style={{ color: G }}>{fmt(detail.amount)}</span>
                  </div>
                </div>

                {/* Order timeline */}
                <div className="rounded-2xl border border-gray-200 p-3.5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Order Timeline</p>
                  {(["Pending","Received","Processed","Shipped","Out For Delivery","Delivered"] as OrderStatus[]).map((step, i, arr) => {
                    const sm    = STATUS_META[step];
                    const SI    = sm.icon;
                    const stepIdx = arr.indexOf(step);
                    const curIdx  = arr.indexOf(detail.status as OrderStatus);
                    const isDone  = stepIdx <= curIdx && detail.status !== "Cancelled";
                    const isCur   = step === detail.status;
                    return (
                      <div key={step} className="flex items-start gap-3 relative">
                        {i < arr.length - 1 && (
                          <div className="absolute left-[11px] top-5 w-[2px] h-6 rounded-full"
                            style={{ background: isDone && stepIdx < curIdx ? sm.color : "#e5e7eb" }}/>
                        )}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2"
                          style={isDone
                            ? { background: `${sm.color}15`, borderColor: sm.color }
                            : { background: "#f9fafb", borderColor: "#e5e7eb" }}>
                          <SI size={10} style={{ color: isDone ? sm.color : "#d1d5db" }}/>
                        </div>
                        <div className="pb-4">
                          <p className="text-xs font-bold" style={{ color: isDone ? (isCur ? sm.color : "#111827") : "#9ca3af" }}>{step}</p>
                          {isCur && <p className="text-[9px] font-medium text-gray-400">{detail.time} · {detail.date}</p>}
                        </div>
                      </div>
                    );
                  })}
                  {detail.status === "Cancelled" && (
                    <div className="flex items-center gap-2.5 pt-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2" style={{ background: "#fef2f2", borderColor: "#ef4444" }}>
                        <XCircle size={10} className="text-red-500"/>
                      </div>
                      <p className="text-xs font-bold text-red-500">Cancelled</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OrderListPage;
