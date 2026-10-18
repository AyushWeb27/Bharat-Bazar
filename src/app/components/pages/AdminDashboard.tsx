import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart2,
  Megaphone, Settings, Bell, Search, TrendingUp, TrendingDown,
  IndianRupee, LogOut, ChevronDown, Boxes, Tag, HelpCircle,
  Menu, X, RefreshCw, CheckCircle2,
  Download, ChevronRight,
  PanelLeftClose, PanelLeftOpen, Layers, FolderOpen, GitBranch,
  Plus, Percent, PackagePlus, ClipboardList,
  Eye, Award, Globe, ShieldCheck,
  Home, Heart, LogIn, UserPlus, LayoutTemplate,
  AlertTriangle, XCircle, MapPin, Clock,
  Truck, Ticket, Bike, Phone, Star,
  UserCog, BellRing, BookOpen,
  Sparkles, ImageIcon, LayoutList, ArrowUp, ArrowDown, MousePointerClick,
  ListOrdered, RotateCcw, BrainCircuit, Printer,
  Zap, Gift, Mail, UserCheck,
} from "lucide-react";

import { AddProductPage }      from "./admin/AddProductPage";
import { ProductListPage }     from "./admin/ProductListPage";
import { ProductRequestsPage } from "./admin/ProductRequestsPage";
import { TaxesPage }           from "./admin/TaxesPage";
import { CategoriesPage }      from "./admin/CategoriesPage";
import { GroupCategoryPage }   from "./admin/GroupCategoryPage";
import { SubCategoryPage }     from "./admin/SubCategoryPage";
import { AllBrandsPage }       from "./admin/AllBrandsPage";
import { AddBrandPage }        from "./admin/AddBrandPage";
import { BrandRequestsPage }   from "./admin/BrandRequestsPage";
import { ManageLocationPage }  from "./admin/ManageLocationPage";
import { CouponPage }          from "./admin/CouponPage";
import { DeliveryBoyPage }     from "./admin/DeliveryBoyPage";
import { HighlightsPage }      from "./admin/HighlightsPage";
import { BannerPage }          from "./admin/BannerPage";
import { HomeSectionPage }     from "./admin/HomeSectionPage";
import { UsersPage }           from "./admin/UsersPage";
import { NotificationPage }    from "./admin/NotificationPage";
import { FAQPage }             from "./admin/FAQPage";
import { SettingsPage }        from "./admin/SettingsPage";
import { OrderListPage }       from "./admin/OrderListPage";
import { ReturnPage }          from "./admin/ReturnPage";
import { AIInsightReportPage } from "./admin/AIInsightReportPage";
import { BulkPrintOrdersPage } from "./admin/BulkPrintOrdersPage";
import { OrdersOverviewPage }      from "./admin/OrdersOverviewPage";
import { CustomersPage }           from "./admin/CustomersPage";
import { AnalyticsPage }           from "./admin/AnalyticsPage";
import { HelpPage }                from "./admin/HelpPage";
import { InventoryPage }           from "./admin/InventoryPage";
import { MarketingPage }           from "./admin/MarketingPage";
import { AddSellerPage }           from "./admin/AddSellerPage";
import { SellerListPage }          from "./admin/SellerListPage";
import { SellerTransactionPage }   from "./admin/SellerTransactionPage";
import { ProductReviewPage }       from "./admin/ProductReviewPage";
import { ProductDetailPage }       from "./admin/ProductDetailPage";
import { FlashSalePage }           from "./admin/FlashSalePage";
import { DealOfDayPage }           from "./admin/DealOfDayPage";
import { AbandonedCartPage }       from "./admin/AbandonedCartPage";
import { EmailTemplatePage }       from "./admin/EmailTemplatePage";
import { ShippingPage }            from "./admin/ShippingPage";
import { SellerKYCPage }           from "./admin/SellerKYCPage";
import { AdminProfilePage }        from "./admin/AdminProfilePage";

import type { Page } from "./types/index";
import { G, fmt, orderStatusMeta, card } from "./admin/shared/constants";
import { revenueData, orderStatus, catRevData, recentOrders, topProducts, NOTIFICATIONS, INIT_CATS, INIT_SUBCATS, INIT_PRODUCTS, INIT_BRANDS, INIT_GROUPS } from "./admin/shared/data";
import { Toggle, StatusPill, Modal, DeleteConfirm, Field, PageHeader, SearchBar, StatCard, SectionCard } from "./admin/shared/ui";

// ── NAV ────────────────────────────────────────────────────────────────────────

const NAV_MAIN = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard"                },
  { id: "orders",    icon: ShoppingCart,    label: "Orders",   badge: "1,847" },
  { id: "customers", icon: Users,           label: "Customers"                },
  { id: "analytics", icon: BarChart2,       label: "Analytics"                },
];
const NAV_PRODUCTS_NAV = [
  { id: "add-product",     icon: PackagePlus,   label: "Add New Product"                          },
  { id: "product-list",    icon: Package,       label: "All Products",     badge: "28,394"        },
  { id: "prod-requests",   icon: ClipboardList, label: "Product Requests", badge: "4", badgeRed: true },
  { id: "product-reviews", icon: Star,          label: "Product Reviews",  badge: "18", badgeRed: true },
  { id: "taxes",           icon: Percent,       label: "Taxes"                                    },
];
const NAV_CATALOGUE = [
  { id: "categories",  icon: Layers,     label: "Categories"     },
  { id: "group-cat",   icon: FolderOpen, label: "Group Category" },
  { id: "subcategory", icon: GitBranch,  label: "SubCategory"    },
];
const NAV_OPS = [
  { id: "inventory",       icon: Boxes,        label: "Inventory",       badge: "12", badgeRed: true },
  { id: "marketing",       icon: Megaphone,    label: "Marketing"                                    },
  { id: "coupons",         icon: Tag,          label: "Coupons"                                      },
  { id: "flash-sales",     icon: Zap,          label: "Flash Sales"                                  },
  { id: "deal-of-day",     icon: Gift,         label: "Deal of the Day"                              },
  { id: "abandoned-carts", icon: ShoppingCart, label: "Abandoned Carts", badge: "24", badgeRed: true },
  { id: "email-templates", icon: Mail,         label: "Email Templates"                              },
  { id: "shipping",        icon: Truck,        label: "Shipping & Logistics"                         },
];
const NAV_BRANDS = [
  { id: "all-brands",     icon: Award,         label: "All Brands",      badge: "18"           },
  { id: "add-brand",      icon: Plus,          label: "Add Brand"                               },
  { id: "brand-requests", icon: ClipboardList, label: "Brand Requests",  badge: "3", badgeRed: true },
];
const NAV_ORDERS = [
  { id: "order-list",  icon: ListOrdered,  label: "Order List",        badge: "1,847"              },
  { id: "returns",     icon: RotateCcw,    label: "Return",            badge: "24", badgeRed: true  },
  { id: "ai-insights", icon: BrainCircuit, label: "AI Insight Report"                               },
  { id: "bulk-print",  icon: Printer,      label: "Bulk Print Orders"                               },
];
const NAV_PROMO = [
  { id: "highlights",   icon: Sparkles,    label: "Highlights"   },
  { id: "banners",      icon: ImageIcon,   label: "Banner"       },
  { id: "home-sections",icon: LayoutList,  label: "Home Section" },
];
const NAV_MISC = [
  { id: "admin-users",   icon: UserCog, label: "Users",        badge: "8"             },
  { id: "notifications", icon: BellRing,label: "Notification", badge: "2", badgeRed: true },
  { id: "faqs",          icon: BookOpen, label: "FAQ",         badge: "10"            },
];
const NAV_DELIVERY = [
  { id: "manage-location",  icon: MapPin,  label: "Manage Location"            },
  { id: "delivery-coupons", icon: Ticket,  label: "Coupons"                    },
  { id: "delivery-boys",    icon: Bike,    label: "Delivery Boys", badge: "10" },
];
const NAV_SELLERS = [
  { id: "add-seller",          icon: UserPlus,    label: "Add Seller"                          },
  { id: "seller-list",         icon: Users,       label: "Manage Seller List", badge: "142"    },
  { id: "seller-transactions", icon: IndianRupee, label: "Seller Transaction"                  },
  { id: "seller-kyc",          icon: UserCheck,   label: "Seller KYC",         badge: "12", badgeRed: true },
];
const NAV_SYSTEM = [
  { id: "admin-profile", icon: UserCog,    label: "View & Edit Profile" },
  { id: "settings",      icon: Settings,   label: "Settings" },
  { id: "help",          icon: HelpCircle, label: "Help"     },
];

// ── CHART TOOLTIPS ──────────────────────────────────────────────────────────────

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs shadow-xl">
      <p className="text-gray-500 font-semibold mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-bold" style={{ color: p.color }}>
          {p.name === "revenue" ? `₹${p.value}L` : p.value.toLocaleString("en-IN")}
          <span className="text-gray-400 font-normal ml-1">{p.name}</span>
        </p>
      ))}
    </div>
  );
};
const PieTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs shadow-xl">
      <p style={{ color: d.payload.color }} className="font-black">{d.name}</p>
      <p className="text-gray-800 font-bold">{d.value.toLocaleString("en-IN")} orders</p>
    </div>
  );
};



// ── DASHBOARD OVERVIEW ─────────────────────────────────────────────────────────

function DashboardOverview({ rangeTab, setRangeTab }: { rangeTab: string; setRangeTab: (t: string) => void }) {
  const totalOrds     = orderStatus.reduce((s, o) => s + o.value, 0);
  const completedOrds = orderStatus.find(o => o.name === "Delivered")?.value ?? 0;
  const pendingOrds   = (orderStatus.find(o => o.name === "Processing")?.value ?? 0) +
                        (orderStatus.find(o => o.name === "Shipped")?.value ?? 0);
  const cancelledOrds = orderStatus.find(o => o.name === "Cancelled")?.value ?? 0;
  const returnedOrds  = orderStatus.find(o => o.name === "Returned")?.value ?? 0;
  const soldOutProds  = INIT_PRODUCTS.filter(p => p.status === "out_of_stock").length;
  const lowStockProds = INIT_PRODUCTS.filter(p => p.status === "low_stock").length;
  const calcPct       = (n: number) => ((n / totalOrds) * 100).toFixed(1);

  const salesTodayData = [
    { hour: "9am",  sales: 12.4 }, { hour: "10am", sales: 18.7 },
    { hour: "11am", sales: 24.2 }, { hour: "12pm", sales: 31.8 },
    { hour: "1pm",  sales: 28.3 }, { hour: "2pm",  sales: 35.6 },
    { hour: "3pm",  sales: 22.1 }, { hour: "4pm",  sales: 19.8 },
    { hour: "5pm",  sales: 26.4 }, { hour: "6pm",  sales: 38.9 },
    { hour: "7pm",  sales: 42.1 }, { hour: "8pm",  sales: 29.7 },
  ];
  const salesByLocData = [
    { city: "Mumbai",    sales: 28.4 }, { city: "Delhi",     sales: 24.7 },
    { city: "Bengaluru", sales: 19.2 }, { city: "Hyderabad", sales: 14.8 },
    { city: "Pune",      sales: 11.3 }, { city: "Kolkata",   sales: 8.9  },
    { city: "Chennai",   sales: 9.7  }, { city: "Jaipur",    sales: 7.2  },
  ];
  const totalSalesToday = salesTodayData.reduce((s, d) => s + d.sales, 0).toFixed(1);

  return (
    <div className="space-y-4">

      {/* ── DARK HERO BAND ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #050e09 0%, #0d2318 50%, #091410 100%)" }}>
        {/* Decorative radial glows */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,153,102,0.14) 0%, transparent 65%)" }}/>
        <div className="absolute bottom-0 left-1/3 w-56 h-28 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)" }}/>
        <div className="absolute top-0 right-1/4 w-40 h-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)" }}/>

        <div className="relative p-5 md:p-7">
          {/* Top row */}
          <div className="flex items-start justify-between flex-wrap gap-5 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4ade80" }}/>
                <span className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: G }}>Live · BharatBazar Super Admin</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-1">Overview Dashboard</h1>
              <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.32)" }}>
                Saturday, 5 September 2026 &nbsp;·&nbsp; India Standard Time
              </p>
            </div>

            {/* Hero metric strip */}
            <div className="flex items-stretch rounded-2xl overflow-hidden border shrink-0"
              style={{ borderColor: "rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)" }}>
              {[
                { label: "Sales Today",  val: `₹${totalSalesToday}L`,                          badge: "▲ +18.4%",      ok: true  },
                { label: "Total Orders", val: totalOrds.toLocaleString("en-IN"),                 badge: `${calcPct(completedOrds)}% done`, ok: true  },
                { label: "Delivery Rate",val: `${calcPct(completedOrds)}%`,                      badge: `${completedOrds.toLocaleString("en-IN")} orders`, ok: true  },
                { label: "Alerts",       val: String(soldOutProds + lowStockProds),              badge: "inventory",     ok: false },
              ].map((m, i) => (
                <div key={i} className="px-4 py-3.5 md:px-5 text-right"
                  style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                  <p className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.32)" }}>{m.label}</p>
                  <p className="text-base md:text-xl font-black text-white leading-none mb-0.5">{m.val}</p>
                  <p className="text-[9px] font-bold" style={{ color: m.ok ? "#4ade80" : "#f87171" }}>{m.badge}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Range tabs + timestamp */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-1.5">
              {["Today","7D","30D","90D"].map(t => (
                <button key={t} onClick={() => setRangeTab(t)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  style={rangeTab === t
                    ? { background: `${G}35`, color: "#4ade80", border: `1px solid ${G}65` }
                    : { color: "rgba(255,255,255,0.28)", border: "1px solid transparent" }}>
                  {t}
                </button>
              ))}
            </div>
            <span className="text-[9px] font-medium" style={{ color: "rgba(255,255,255,0.18)" }}>
              Auto-refresh · every 5 min
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── BUSINESS METRICS — 4 colorful gradient cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Total Users",         val: "51,29,847",                                     sub: "+2,140 today",                       Icon: Users,     grad: "linear-gradient(140deg,#6366f1,#4338ca)" },
          { label: "Total Categories",    val: INIT_CATS.length.toString(),                     sub: `${INIT_GROUPS.length} category groups`, Icon: Layers,    grad: "linear-gradient(140deg,#009966,#006644)" },
          { label: "Total Subcategories", val: INIT_SUBCATS.length.toString(),                  sub: `${INIT_CATS.length} parent cats`,     Icon: GitBranch, grad: "linear-gradient(140deg,#0d9488,#0f766e)" },
          { label: "Total Products",      val: INIT_PRODUCTS.length.toLocaleString("en-IN"),    sub: `${INIT_BRANDS.length} brands listed`, Icon: Package,   grad: "linear-gradient(140deg,#3b82f6,#1d4ed8)" },
        ].map((k, i) => {
          const Icon = k.Icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.07, duration: 0.35 }}
              className="relative rounded-2xl p-4 md:p-5 overflow-hidden cursor-pointer hover:scale-[1.015] transition-transform"
              style={{ background: k.grad }}>
              {/* Shine overlay */}
              <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl pointer-events-none"
                style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.13) 0%,transparent 100%)" }}/>
              {/* Giant watermark icon */}
              <div className="absolute -bottom-4 -right-4 opacity-[0.08] text-white">
                <Icon size={80}/>
              </div>
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">{k.label}</p>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/15 shrink-0">
                    <Icon size={13} className="text-white"/>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-black text-white leading-none mb-1.5">{k.val}</p>
                <p className="text-[10px] font-medium text-white/50">{k.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── ORDER BREAKDOWN — 5 cards with progress bars ── */}
      <div>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.22em] mb-2.5 px-0.5">Order Breakdown</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {[
            { label: "Total Orders",    val: totalOrds,     sub: "All time",          Icon: ShoppingCart, color: "#8b5cf6", barPct: 100,                             isAlert: false },
            { label: "Completed",       val: completedOrds, sub: `${calcPct(completedOrds)}% rate`, Icon: CheckCircle2, color: G,        barPct: parseFloat(calcPct(completedOrds)), isAlert: false },
            { label: "Pending",         val: pendingOrds,   sub: "Ship + Processing", Icon: Clock,        color: "#f59e0b", barPct: parseFloat(calcPct(pendingOrds)),   isAlert: false },
            { label: "Cancelled",       val: cancelledOrds, sub: `${calcPct(cancelledOrds)}% rate`, Icon: XCircle,      color: "#ef4444", barPct: parseFloat(calcPct(cancelledOrds)), isAlert: true  },
            { label: "Returned",        val: returnedOrds,  sub: "Refund pending",    Icon: RefreshCw,    color: "#ec4899", barPct: parseFloat(calcPct(returnedOrds)),  isAlert: true  },
          ].map((k, i) => {
            const Icon = k.Icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                className={`${card} p-4 relative overflow-hidden hover:shadow-md transition-all cursor-pointer group`}>
                <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: k.color }}/>
                {k.isAlert && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `${k.color}06` }}/>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15` }}>
                    <Icon size={14} style={{ color: k.color }}/>
                  </div>
                  {k.isAlert && <div className="w-1.5 h-1.5 rounded-full mt-1 animate-pulse" style={{ background: k.color }}/>}
                </div>
                <p className="text-xl md:text-2xl font-black leading-none mb-0.5"
                  style={{ color: k.isAlert ? k.color : "#111827" }}>
                  {k.val.toLocaleString("en-IN")}
                </p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2.5">{k.label}</p>
                <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${Math.min(k.barPct, 100)}%` }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.7, ease: "easeOut" }}
                    style={{ background: k.color, opacity: 0.7 }}/>
                </div>
                <p className="text-[9px] text-gray-400 mt-1.5">{k.sub}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── INVENTORY ALERT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Product Sold Out",     val: soldOutProds,  sub: `${soldOutProds} product${soldOutProds !== 1 ? "s" : ""} require immediate restocking`,        Icon: AlertTriangle, color: "#ef4444", bg: "linear-gradient(135deg,#fef2f2,#fee2e2)", border: "#fca5a5" },
          { label: "Product Low on Stock", val: lowStockProds, sub: `${lowStockProds} product${lowStockProds !== 1 ? "s" : ""} below minimum inventory threshold`, Icon: AlertTriangle, color: "#f97316", bg: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "#fdba74" },
        ].map((k, i) => {
          const Icon = k.Icon;
          const hasAlert = k.val > 0;
          return (
            <motion.div key={i} initial={{ opacity: 0, x: i === 0 ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.3 }}
              className="rounded-2xl p-4 flex items-center gap-4 border cursor-pointer hover:shadow-md transition-all"
              style={{ background: k.bg, borderColor: hasAlert ? k.border : "#e5e7eb" }}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${hasAlert ? "animate-pulse" : ""}`}
                style={{ background: `${k.color}18`, border: `2px solid ${k.color}30` }}>
                <Icon size={22} style={{ color: k.color }}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500 mb-0.5">{k.label}</p>
                <p className="text-3xl font-black leading-none mb-1" style={{ color: hasAlert ? k.color : "#374151" }}>{k.val}</p>
                <p className="text-[11px] text-gray-500 leading-snug">{k.sub}</p>
              </div>
              {hasAlert && (
                <span className="shrink-0 px-3 py-2 rounded-xl text-[10px] font-black border"
                  style={{ color: k.color, borderColor: `${k.color}35`, background: `${k.color}10` }}>
                  Action Needed
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── SALES TODAY + LOCATION ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className={`${card} p-4 md:p-5 xl:col-span-3`}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className="text-sm font-black text-gray-900">Total Sales Today</p>
              <p className="text-xs text-gray-400 mt-0.5">Hourly · ₹{totalSalesToday}L cumulative</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold" style={{ background: `${G}12`, color: G }}>
              <TrendingUp size={11}/> +18.4% vs yesterday
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesTodayData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ovr-today" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={G} stopOpacity={0.22}/>
                  <stop offset="95%" stopColor={G} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="hour" tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: "#9ca3af", fontSize: 9 }} axisLine={false} tickLine={false}/>
              <Tooltip content={({ active, payload, label }: any) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs shadow-xl">
                    <p className="text-gray-400 font-semibold mb-0.5">{label}</p>
                    <p className="font-black" style={{ color: G }}>₹{payload[0].value}L</p>
                  </div>
                );
              }}/>
              <Area type="monotone" dataKey="sales" stroke={G} strokeWidth={2.5} fill="url(#ovr-today)" dot={false} activeDot={{ r: 4, fill: G, strokeWidth: 0 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`${card} p-4 md:p-5 xl:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-black text-gray-900">Sales by Location</p>
              <p className="text-xs text-gray-400 mt-0.5">Top 8 cities · ₹ Lakhs</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold" style={{ background: "#6366f115", color: "#6366f1" }}>
              <MapPin size={10}/> 8 cities
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesByLocData} layout="vertical" margin={{ top: 0, right: 6, left: 0, bottom: 0 }} barCategoryGap="18%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false}/>
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 8 }} axisLine={false} tickLine={false} domain={[0, 35]}/>
              <YAxis type="category" dataKey="city" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} width={64}/>
              <Tooltip content={({ active, payload, label }: any) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs shadow-xl">
                    <p className="font-black text-gray-800 mb-0.5">{label}</p>
                    <p style={{ color: G }}>₹{payload[0].value}L</p>
                  </div>
                );
              }}/>
              <Bar dataKey="sales" fill={G} radius={[0, 5, 5, 0]} opacity={0.85}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── REVENUE TREND + ORDER PIE ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={`${card} p-4 md:p-5 xl:col-span-2`}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div><p className="text-sm font-black text-gray-900">Revenue & Orders</p><p className="text-xs text-gray-400 mt-0.5">Last 7 days</p></div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-3 h-1.5 rounded-sm inline-block" style={{background:G}}/> Revenue</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-3 h-1.5 bg-blue-400 rounded-sm inline-block"/> Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{top:5,right:5,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="ovr-rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={G} stopOpacity={0.18}/><stop offset="95%" stopColor={G} stopOpacity={0}/></linearGradient>
                <linearGradient id="ovr-ord" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15}/><stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="day" tick={{fill:"#9ca3af",fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#9ca3af",fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="revenue" stroke={G} strokeWidth={2.5} fill="url(#ovr-rev)" dot={false} activeDot={{r:4,fill:G,strokeWidth:0}}/>
              <Area type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} fill="url(#ovr-ord)" dot={false} activeDot={{r:3.5,fill:"#60a5fa",strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={`${card} p-4 md:p-5`}>
          <p className="text-sm font-black text-gray-900 mb-0.5">Order Status</p>
          <p className="text-xs text-gray-400 mb-3">{totalOrds.toLocaleString("en-IN")} total</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart><Pie data={orderStatus} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>{orderStatus.map((s,i)=><Cell key={i} fill={s.color} opacity={0.9}/>)}</Pie><Tooltip content={<PieTip/>}/></PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {orderStatus.map((s,i)=>(
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0" style={{background:s.color}}/><span className="text-[11px] text-gray-500">{s.name}</span></div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-400 font-medium">{((s.value/totalOrds)*100).toFixed(0)}%</span>
                  <span className="text-[11px] font-black text-gray-800">{s.value.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOP PRODUCTS + RECENT ORDERS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={`${card} p-4 md:p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div><p className="text-sm font-black text-gray-900">Top Products</p><p className="text-xs text-gray-400 mt-0.5">By units sold today</p></div>
            <button className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors hover:opacity-80"
              style={{ color: G, background: `${G}10` }}>View All</button>
          </div>
          <div className="space-y-3">
            {topProducts.map((p,i)=>(
              <div key={i} className="flex items-center gap-3 group/row">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border border-gray-100 bg-gray-50 text-gray-400 shrink-0 group-hover/row:bg-white transition-colors">{i+1}</div>
                <div className="flex-1 min-w-0"><p className="text-xs font-bold text-gray-800 truncate">{p.name}</p><p className="text-[10px] text-gray-400">{p.cat} · {p.stock} in stock</p></div>
                <div className="text-right shrink-0"><p className="text-xs font-black text-gray-800">{p.sold} sold</p><p className="text-[10px] font-bold" style={{color:G}}>{fmt(p.revenue)}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} p-4 md:p-5 xl:col-span-2`}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div><p className="text-sm font-black text-gray-900">Recent Orders</p><p className="text-xs text-gray-400 mt-0.5">Today, 5 Sep 2026</p></div>
            <button className="text-[10px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
              style={{ color: G, background: `${G}10` }}>
              View all <ChevronRight size={11}/>
            </button>
          </div>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[480px]">
              <thead><tr className="border-b border-gray-100">
                {["Order","Customer","Amount","Items","Status","Time"].map(h=>(
                  <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider pb-3 pr-3 last:pr-0 whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(o=>{
                  const s=orderStatusMeta[o.status];
                  return(
                    <tr key={o.id} className="group hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 pr-3"><span className="text-[10px] font-mono font-bold text-gray-400 group-hover:text-gray-600 transition-colors">#{o.id}</span></td>
                      <td className="py-3 pr-3"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0" style={{background:`${G}18`,color:G}}>{o.av}</div><span className="text-xs font-semibold text-gray-800 whitespace-nowrap hidden sm:block">{o.customer}</span></div></td>
                      <td className="py-3 pr-3"><span className="text-xs font-black text-gray-900 whitespace-nowrap">{fmt(o.amount)}</span></td>
                      <td className="py-3 pr-3"><span className="text-xs text-gray-400">{o.items}</span></td>
                      <td className="py-3 pr-3"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap" style={{color:s.color,background:s.bg}}>{s.icon} {o.status}</span></td>
                      <td className="py-3"><span className="text-[10px] text-gray-400 whitespace-nowrap">{o.time}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="h-4"/>
    </div>
  );
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────────

type NavItem_ = { id: string; icon: React.ElementType; label: string; badge?: string; badgeRed?: boolean };

function NavItemBtn({ item, active, collapsed, onClick }: {
  item: NavItem_; active: boolean; collapsed: boolean; onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <div className="relative group">
      <button onClick={onClick}
        className="w-full flex items-center gap-3 rounded-xl text-left transition-all"
        style={{ padding: collapsed?"9px 0":"9px 12px", justifyContent: collapsed?"center":"flex-start", background: active?`${G}20`:"transparent", color: active?G:"rgba(255,255,255,0.5)" }}>
        {active && !collapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{background:G}}/>}
        <Icon size={16} className={`shrink-0 transition-colors ${active?"":"group-hover:text-white"}`}/>
        {!collapsed && (
          <>
            <span className={`text-sm flex-1 transition-colors truncate ${active?"font-bold":"font-medium group-hover:text-white"}`}>{item.label}</span>
            {item.badge && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${item.badgeRed?"bg-red-500/25 text-red-400":"bg-white/10 text-white/50"}`}>{item.badge}</span>}
          </>
        )}
      </button>
      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
            {item.label}
            {item.badge && <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded ${item.badgeRed?"bg-red-500/30 text-red-300":"bg-white/20"}`}>{item.badge}</span>}
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-900"/>
        </div>
      )}
    </div>
  );
}

function SidebarInner({ activeNav, setActiveNav, collapsed, setCollapsed, closeMobile, setPage, currentAdmin, onLogout }: {
  activeNav: string; setActiveNav: (id: string) => void;
  collapsed: boolean; setCollapsed: (v: boolean) => void;
  closeMobile: () => void; setPage: (p: Page) => void;
  currentAdmin?: any;
  onLogout: () => void;
}) {
  const handleClick = (id: string) => { setActiveNav(id); closeMobile(); };
  const adminName = currentAdmin?.name || "Super Admin";
  const adminEmail = currentAdmin?.email || "admin@bharatbazar.com";
  const initials = adminName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "SA";

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ scrollbarWidth: "none" }}>
      {/* Logo */}
      <div className={`flex items-center border-b border-white/10 shrink-0 transition-all ${collapsed?"justify-center px-0 py-4":"gap-3 px-5 py-4"}`}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:G}}>
          <IndianRupee size={17} className="text-white"/>
        </div>
        {!collapsed && <div className="overflow-hidden"><p className="text-sm font-black text-white whitespace-nowrap">BharatBazar</p><p className="text-[9px] font-bold uppercase tracking-[0.15em] whitespace-nowrap" style={{color:`${G}bb`}}>Super Admin</p></div>}
      </div>

      {/* Status pill */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{background:`${G}18`}}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0"/>
            <span className="text-[10px] font-bold truncate" style={{color:G}}>All systems live</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none", padding: collapsed?"12px 8px":"12px" }}>
        {[
          { title: "Main",       items: NAV_MAIN        },
          { title: "Products",   items: NAV_PRODUCTS_NAV },
          { title: "Catalogue",  items: NAV_CATALOGUE    },
          { title: "Brands",     items: NAV_BRANDS       },
          { title: "Orders",         items: NAV_ORDERS       },
          { title: "Delivery",       items: NAV_DELIVERY     },
          { title: "Promotion",      items: NAV_PROMO        },
          { title: "Miscellaneous",  items: NAV_MISC         },
          { title: "Operations",     items: NAV_OPS          },
          { title: "Manage Seller",  items: NAV_SELLERS      },
          { title: "System",     items: NAV_SYSTEM       },
        ].map(group => (
          <div key={group.title} className="mb-3">
            {!collapsed
              ? <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em] px-3 mb-1">{group.title}</p>
              : <div className="my-2 border-t border-white/10"/>
            }
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItemBtn key={item.id} item={item} active={activeNav === item.id} collapsed={collapsed} onClick={() => handleClick(item.id)}/>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`shrink-0 border-t border-white/10 ${collapsed?"p-2 space-y-2":"p-3 space-y-2"}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{background:G}}>{initials}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-bold text-white truncate">{adminName}</p><p className="text-[10px] text-white/35 truncate">{adminEmail}</p></div>
            <button onClick={onLogout} className="text-white/25 hover:text-red-400 transition-colors shrink-0" title="Sign out"><LogOut size={14}/></button>
          </div>
        ) : (
          <div className="relative group flex justify-center">
            <button onClick={onLogout} className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-white" style={{background:G}}>{initials}</button>
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">Sign Out</div>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-full items-center justify-center gap-2 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold">
          {collapsed ? <PanelLeftOpen size={14}/> : <><PanelLeftClose size={14}/><span>Collapse</span></>}
        </button>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ────────────────────────────────────────────────────────────────

export function AdminDashboard({ setPage, currentAdmin }: { setPage: (p: Page) => void; currentAdmin?: any }) {
  const [activeNav,         setActiveNav        ] = useState("dashboard");
  const [adminState,        setAdminState       ] = useState(currentAdmin);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed,  setSidebarCollapsed ] = useState(false);
  const [notifOpen,         setNotifOpen        ] = useState(false);
  const [profileOpen,       setProfileOpen      ] = useState(false);
  const [refreshing,        setRefreshing       ] = useState(false);
  const [refreshDone,       setRefreshDone      ] = useState(false);
  const [rangeTab,          setRangeTab         ] = useState("7D");
  const [notifItems, setNotifItems] = useState([
    { id:0, msg:"1,847 orders pending dispatch",    time:"Just now",  urgent:true,  read:false, icon:"cart"   },
    { id:1, msg:"12 products are out of stock",     time:"8 min ago", urgent:true,  read:false, icon:"box"    },
    { id:2, msg:"Daily target ₹1Cr achieved!",      time:"1 hr ago",  urgent:false, read:false, icon:"trend"  },
    { id:3, msg:"New admin registered: dev@bb.com", time:"2 hr ago",  urgent:false, read:false, icon:"user"   },
    { id:4, msg:"Flash Sale campaign started",      time:"3 hr ago",  urgent:false, read:true,  icon:"trend"  },
    { id:5, msg:"Bulk import completed: 240 items", time:"5 hr ago",  urgent:false, read:true,  icon:"box"    },
  ]);
  const unreadCount = notifItems.filter(n => !n.read).length;

  useEffect(() => {
    if (currentAdmin) setAdminState(currentAdmin);
  }, [currentAdmin]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    setPage("admin-login");
  };

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); setRefreshDone(true); }, 1200);
    setTimeout(() => setRefreshDone(false), 2400);
  };
  const markAllRead   = () => setNotifItems(p => p.map(n => ({...n, read:true})));
  const markRead      = (id: number) => setNotifItems(p => p.map(n => n.id===id ? {...n,read:true} : n));
  const closeDropdowns = () => { setNotifOpen(false); setProfileOpen(false); };

  const sidebarW = sidebarCollapsed ? 64 : 240;
  const sidebarProps = { activeNav, setActiveNav, collapsed: sidebarCollapsed, setCollapsed: setSidebarCollapsed, closeMobile: () => setMobileSidebarOpen(false), setPage, currentAdmin: adminState, onLogout: handleLogout };

  function renderPage() {
    switch (activeNav) {
      case "orders":          return <OrdersOverviewPage onNav={setActiveNav} />;
      case "customers":       return <CustomersPage />;
      case "analytics":       return <AnalyticsPage />;
      case "help":            return <HelpPage />;
      case "inventory":       return <InventoryPage />;
      case "marketing":       return <MarketingPage />;
      case "coupons":              return <CouponPage />;
      case "add-seller":           return <AddSellerPage />;
      case "seller-list":          return <SellerListPage />;
      case "seller-transactions":  return <SellerTransactionPage />;
      case "seller-kyc":           return <SellerKYCPage />;
      case "flash-sales":          return <FlashSalePage />;
      case "deal-of-day":          return <DealOfDayPage />;
      case "abandoned-carts":      return <AbandonedCartPage />;
      case "email-templates":      return <EmailTemplatePage />;
      case "shipping":             return <ShippingPage />;
      case "add-product":      return <AddProductPage />;
      case "product-list":     return <ProductListPage />;
      case "product-reviews":  return <ProductReviewPage />;
      case "product-detail":   return <ProductDetailPage />;
      case "prod-requests":   return <ProductRequestsPage />;
      case "taxes":           return <TaxesPage />;
      case "categories":      return <CategoriesPage />;
      case "group-cat":       return <GroupCategoryPage />;
      case "subcategory":     return <SubCategoryPage />;
      case "all-brands":      return <AllBrandsPage />;
      case "add-brand":       return <AddBrandPage />;
      case "brand-requests":  return <BrandRequestsPage />;
      case "manage-location": return <ManageLocationPage />;
      case "delivery-coupons":return <CouponPage />;
      case "delivery-boys":   return <DeliveryBoyPage />;
      case "highlights":      return <HighlightsPage />;
      case "banners":         return <BannerPage />;
      case "home-sections":   return <HomeSectionPage />;
      case "order-list":      return <OrderListPage />;
      case "returns":         return <ReturnPage />;
      case "ai-insights":     return <AIInsightReportPage />;
      case "admin-profile":   return <AdminProfilePage currentAdmin={adminState} onProfileUpdated={(upd) => setAdminState((p: any) => ({ ...p, ...upd }))} />;
      case "admin-users":     return <UsersPage />;
      case "notifications":   return <NotificationPage />;
      case "faqs":            return <FAQPage />;
      case "settings":        return <SettingsPage />;
      default:                return <DashboardOverview rangeTab={rangeTab} setRangeTab={setRangeTab} />;
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f4f6f8] font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300 ease-in-out"
        style={{ width: sidebarW, background: "#111111", borderRight: "1px solid #1a1a1a" }}>
        <SidebarInner {...sidebarProps} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div key="mob-ov" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)}/>
            <motion.aside key="mob-dr" initial={{x:-280}} animate={{x:0}} exit={{x:-280}} transition={{type:"spring",stiffness:300,damping:30}}
              className="fixed top-0 left-0 h-full z-50 lg:hidden flex flex-col" style={{width:260,background:"#111111"}}>
              <button onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <X size={16}/>
              </button>
              <SidebarInner {...sidebarProps} collapsed={false}/>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-[60] bg-white border-b border-gray-200 shadow-sm">
          {/* Click-away overlay for dropdowns */}
          {(notifOpen || profileOpen) && (
            <div className="fixed inset-0 z-[65]" onClick={closeDropdowns}/>
          )}

          <div className="flex items-center gap-2 px-4 py-3">
            {/* Mobile menu + logo */}
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all shrink-0"><Menu size={20}/></button>
            <div className="lg:hidden flex items-center gap-2 mr-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{background:G}}><IndianRupee size={14} className="text-white"/></div>
              <span className="text-sm font-black text-gray-900 whitespace-nowrap">BharatBazar</span>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs hidden sm:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              <input placeholder="Search orders, products…" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all"/>
            </div>
            <div className="flex-1"/>

            {/* Range tabs */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-xl p-1 gap-0.5 shrink-0">
              {["Today","7D","30D","90D"].map(t => (
                <button key={t} onClick={()=>setRangeTab(t)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap" style={rangeTab===t?{background:G,color:"#fff"}:{color:"#6b7280"}}>{t}</button>
              ))}
            </div>

            {/* Export */}
            <button className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:text-gray-800 transition-all shrink-0"><Download size={13}/> Export</button>

            {/* ── REFRESH ── */}
            <button onClick={handleRefresh}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-white shrink-0 transition-all"
              style={{background: refreshDone ? "#10b981" : G}}>
              <motion.span animate={{rotate: refreshing ? 360 : 0}} transition={{duration:1, repeat: refreshing ? Infinity : 0, ease:"linear"}}>
                {refreshDone ? <CheckCircle2 size={13}/> : <RefreshCw size={13}/>}
              </motion.span>
              <span className="hidden md:inline">{refreshDone ? "Done!" : refreshing ? "Refreshing…" : "Refresh"}</span>
            </button>

            {/* ── NOTIFICATIONS ── */}
            <div className="relative shrink-0 z-[70]">
              <button onClick={()=>{ setNotifOpen(v=>!v); setProfileOpen(false); }}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all">
                <Bell size={16}/>
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span key="badge" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                      {unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{opacity:0,y:8,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:6,scale:0.96}}
                    transition={{duration:0.15}}
                    className="absolute right-0 top-12 w-80 rounded-2xl border border-gray-200 bg-white shadow-2xl z-[80] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900">Notifications</span>
                        {unreadCount > 0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-500">{unreadCount} new</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && <button onClick={markAllRead} className="text-[10px] font-bold hover:underline" style={{color:G}}>Mark all read</button>}
                        <button onClick={()=>setNotifOpen(false)} className="text-gray-400 hover:text-gray-700 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all"><X size={13}/></button>
                      </div>
                    </div>
                    {/* Items */}
                    <div className="max-h-72 overflow-y-auto py-1.5" style={{scrollbarWidth:"none"}}>
                      {notifItems.map(n => {
                        const iconMap: Record<string,{icon:React.ElementType;color:string}> = {
                          cart:  {icon:ShoppingCart, color:"#3b82f6"},
                          box:   {icon:Package,      color:"#f59e0b"},
                          trend: {icon:TrendingUp,   color:G},
                          user:  {icon:UserPlus,     color:"#8b5cf6"},
                        };
                        const ic = iconMap[n.icon] ?? iconMap.trend;
                        const Icon = ic.icon;
                        return (
                          <div key={n.id} onClick={()=>markRead(n.id)}
                            className={`flex items-start gap-3 mx-1.5 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${n.read?"opacity-50":"hover:bg-gray-50"}`}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{background:`${ic.color}15`}}>
                              <Icon size={14} style={{color:ic.color}}/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs leading-snug ${n.read?"text-gray-400":"text-gray-700 font-medium"}`}>{n.msg}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                            </div>
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{background:n.urgent?"#ef4444":G}}/>}
                          </div>
                        );
                      })}
                    </div>
                    {/* Footer */}
                    <div className="border-t border-gray-100 px-4 py-2.5">
                      <button
                        type="button"
                        onClick={(e)=>{
                          e.stopPropagation();
                          setActiveNav("notifications");
                          setNotifOpen(false);
                        }}
                        className="w-full text-xs font-bold text-center py-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" style={{color:G}}>
                        View all notifications →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── SUPER ADMIN PROFILE ── */}
            <div className="relative shrink-0 z-[70] pl-2 border-l border-gray-200">
              <button
                type="button"
                onClick={(e)=>{
                  e.stopPropagation();
                  setProfileOpen(v=>!v);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 pointer-events-none" style={{background:G}}>
                  {(adminState?.name || "SA").split(" ").map((w: string)=>w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block text-left pointer-events-none">
                  <p className="text-xs font-bold text-gray-900 whitespace-nowrap leading-tight">{adminState?.name || "Super Admin"}</p>
                  <p className="text-[10px] text-gray-400 whitespace-nowrap leading-tight">{adminState?.email || "admin@bharatbazar.com"}</p>
                </div>
                <motion.span animate={{rotate: profileOpen ? 180 : 0}} transition={{duration:0.18}} className="hidden md:block pointer-events-none">
                  <ChevronDown size={12} className="text-gray-400"/>
                </motion.span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{opacity:0,y:8,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:6,scale:0.96}}
                    transition={{duration:0.15}}
                    className="absolute right-0 top-14 w-60 rounded-2xl border border-gray-200 bg-white shadow-2xl z-[80] overflow-hidden">
                    {/* Profile header */}
                    <div className="px-4 pt-4 pb-3 border-b border-gray-100" style={{background:`${G}08`}}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{background:G}}>
                          {(adminState?.name || "SA").split(" ").map((w: string)=>w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-gray-900">{adminState?.name || "Super Admin"}</p>
                          <p className="text-[10px] text-gray-500 truncate">{adminState?.email || "admin@bharatbazar.com"}</p>
                          <span className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{background:`${G}20`,color:G}}>
                            ● {adminState?.role || "superadmin"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Menu items */}
                    <div className="py-1.5">
                      {[
                        {icon:UserCog,    label:"My Profile",     sub:"View & edit profile",  action:()=>{ setActiveNav("admin-profile"); setProfileOpen(false); }},
                        {icon:Settings,   label:"Settings",        sub:"System configuration", action:()=>{ setActiveNav("settings");    setProfileOpen(false); }},
                        {icon:Bell,       label:"Notifications",   sub:"Manage alerts",        action:()=>{ setActiveNav("notifications"); setProfileOpen(false); }},
                        {icon:HelpCircle, label:"Help & Support",  sub:"Docs and tickets",     action:()=>{ setActiveNav("help");         setProfileOpen(false); }},
                      ].map(item => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              item.action();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left cursor-pointer">
                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 pointer-events-none">
                              <Icon size={13} className="text-gray-500"/>
                            </div>
                            <div className="flex-1 min-w-0 pointer-events-none">
                              <p className="text-xs font-bold text-gray-800">{item.label}</p>
                              <p className="text-[9px] text-gray-400">{item.sub}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-gray-100 p-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-left cursor-pointer">
                        <LogOut size={13} className="text-red-500 shrink-0 pointer-events-none"/>
                        <span className="text-xs font-bold text-red-500 pointer-events-none">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 md:p-5">
          <AnimatePresence mode="wait">
            <motion.div key={activeNav} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.18}}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
