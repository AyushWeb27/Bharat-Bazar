import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, ShoppingCart, Monitor, Tag, Layers, PackagePlus,
  Upload, RefreshCw, Percent, List, Boxes, Wallet, ArrowUpRight,
  BarChart2, TrendingUp, FileText, RotateCcw,
  Bell, Search, Menu, X, LogOut, ChevronDown,
  PanelLeftClose, PanelLeftOpen, ShoppingBag,
  UserCheck, MessageSquare, Banknote,
} from "lucide-react";

import { SellerDashboardPage }        from "./seller/DashboardPage";
import { SellerOrdersPage }           from "./seller/OrdersPage";
import { SellerPOSOrdersPage }        from "./seller/POSOrdersPage";
import { SellerCategoryPage }         from "./seller/CategoryPage";
import { SellerSubCategoryPage }      from "./seller/SubCategoryPage";
import { SellerAddProductPage }       from "./seller/AddProductPage";
import { SellerBulkImportPage }       from "./seller/BulkImportPage";
import { SellerBulkUpdatePage }       from "./seller/BulkUpdatePage";
import { SellerTaxesPage }            from "./seller/TaxesPage";
import { SellerProductListPage }      from "./seller/ProductListPage";
import { SellerStockManagementPage }  from "./seller/StockManagementPage";
import { SellerWalletPage }           from "./seller/WalletPage";
import { SellerWithdrawalPage }       from "./seller/WithdrawalPage";
import { SellerProductSellingReport } from "./seller/ProductSellingReport";
import { SellerSalesReportPage }      from "./seller/SalesReportPage";
import { SellerPOSReportPage }        from "./seller/POSReportPage";
import { SellerReturnPage }           from "./seller/ReturnPage";
import { KYCPage }                    from "./seller/KYCPage";
import { PerformancePage }            from "./seller/PerformancePage";
import { CustomerMessagesPage }       from "./seller/CustomerMessagesPage";
import { BankAccountPage }            from "./seller/BankAccountPage";
import { InvoicePage }                from "./seller/InvoicePage";

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const S = "#009966";

// ── NAV STRUCTURE ──────────────────────────────────────────────────────────────
type NavItem = {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  badgeRed?: boolean;
};

const NAV_MAIN: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
];
const NAV_ORDERS: NavItem[] = [
  { id: "orders",     icon: ShoppingCart, label: "Orders",     badge: "47"              },
  { id: "pos-orders", icon: Monitor,      label: "POS Orders", badge: "12"              },
];
const NAV_PRODUCT: NavItem[] = [
  { id: "category",     icon: Tag,         label: "Category"                        },
  { id: "sub-category", icon: Layers,      label: "SubCategory"                     },
  { id: "add-product",  icon: PackagePlus, label: "Add New Product"                 },
  { id: "bulk-import",  icon: Upload,      label: "Bulk Import"                     },
  { id: "bulk-update",  icon: RefreshCw,   label: "Bulk Update"                     },
  { id: "taxes",        icon: Percent,     label: "Taxes"                           },
  { id: "product-list", icon: List,        label: "Product List", badge: "284"      },
];
const NAV_INVENTORY: NavItem[] = [
  { id: "stock-management", icon: Boxes, label: "Stock Management", badge: "12", badgeRed: true },
];
const NAV_FINANCE: NavItem[] = [
  { id: "wallet-transaction",  icon: Wallet,       label: "Wallet Transaction"                      },
  { id: "withdrawal-request",  icon: ArrowUpRight, label: "Withdrawal Request", badge: "3"          },
];
const NAV_REPORTS: NavItem[] = [
  { id: "product-selling-report", icon: BarChart2,  label: "Product Selling"                        },
  { id: "sales-report",           icon: TrendingUp, label: "Sales Report"                           },
  { id: "pos-report",             icon: FileText,   label: "POS Report"                             },
  { id: "return",                 icon: RotateCcw,  label: "Return", badge: "5", badgeRed: true     },
];
const NAV_ACCOUNT: NavItem[] = [
  { id: "kyc",               icon: UserCheck,     label: "KYC & Verification"                             },
  { id: "performance",       icon: TrendingUp,    label: "Performance",          badge: "87"              },
  { id: "customer-messages", icon: MessageSquare, label: "Customer Messages",    badge: "5"               },
  { id: "bank-account",      icon: Banknote,      label: "Bank Account & Payouts"                         },
  { id: "invoices",          icon: FileText,      label: "Invoices"                                       },
];

const NAV_GROUPS = [
  { title: "",          items: NAV_MAIN      },
  { title: "Orders",    items: NAV_ORDERS    },
  { title: "Product",   items: NAV_PRODUCT   },
  { title: "Inventory", items: NAV_INVENTORY },
  { title: "Finance",   items: NAV_FINANCE   },
  { title: "Reports",   items: NAV_REPORTS   },
  { title: "Account",   items: NAV_ACCOUNT   },
];

// ── NAV ITEM BUTTON ────────────────────────────────────────────────────────────
function NavItemBtn({
  item, active, collapsed, onClick,
}: {
  item: NavItem; active: boolean; collapsed: boolean; onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 rounded-xl text-left transition-all relative"
        style={{
          padding:        collapsed ? "9px 0" : "9px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          background:     active ? `${S}18` : "transparent",
          color:          active ? S : "rgba(255,255,255,0.5)",
          borderLeft:     active && !collapsed ? `2px solid ${S}` : "2px solid transparent",
        }}
      >
        <Icon
          size={16}
          className={`shrink-0 transition-colors ${active ? "" : "group-hover:text-white"}`}
        />
        {!collapsed && (
          <>
            <span className="text-xs font-semibold flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span
                className="text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0"
                style={{
                  background: item.badgeRed ? "#ef444422" : `${S}22`,
                  color:      item.badgeRed ? "#ef4444"   : S,
                }}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full shrink-0"
            style={{ background: item.badgeRed ? "#ef4444" : S }} />
        )}
      </button>

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl flex items-center gap-2">
            {item.label}
            {item.badge && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: item.badgeRed ? "#ef444422" : `${S}22`, color: item.badgeRed ? "#ef4444" : S }}>
                {item.badge}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────────
function SidebarInner({
  activeNav, setActiveNav, collapsed, setCollapsed, closeMobile, setPage,
}: {
  activeNav: string;
  setActiveNav: (id: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  closeMobile: () => void;
  setPage: (p: any) => void;
}) {
  const handleClick = (id: string) => {
    setActiveNav(id);
    closeMobile();
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0d1117" }}>
      {/* Logo */}
      <div
        className="shrink-0 flex items-center gap-3 border-b border-white/10"
        style={{ padding: collapsed ? "16px 0" : "16px 16px", justifyContent: collapsed ? "center" : "flex-start" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: S }}
        >
          <ShoppingBag size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-black text-white leading-tight">BharatBazar</p>
            <span
              className="inline-block text-[9px] font-black px-1.5 py-0.5 rounded-md mt-0.5"
              style={{ background: `${S}25`, color: S }}
            >
              Seller
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" style={{ scrollbarWidth: "none" }}>
        {NAV_GROUPS.map(group => (
          <div key={group.title || "__main"} className="mb-3">
            {group.title && !collapsed && (
              <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em] px-3 mb-1">
                {group.title}
              </p>
            )}
            {group.title && collapsed && (
              <div className="my-2 border-t border-white/10" />
            )}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItemBtn
                  key={item.id}
                  item={item}
                  active={activeNav === item.id}
                  collapsed={collapsed}
                  onClick={() => handleClick(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`shrink-0 border-t border-white/10 ${collapsed ? "p-2 space-y-2" : "p-3 space-y-2"}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
              style={{ background: S }}
            >
              RS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">Ravi Electro Hub</p>
              <p className="text-[10px] text-white/35 truncate">seller@ravielectro.com</p>
            </div>
            <button
              onClick={() => setPage("seller-login")}
              className="text-white/25 hover:text-red-400 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="relative group flex justify-center">
            <button
              onClick={() => setPage("seller-login")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-white"
              style={{ background: S }}
            >
              RS
            </button>
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                Sign Out
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-full items-center justify-center gap-2 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
        >
          {collapsed ? <PanelLeftOpen size={14} /> : <><PanelLeftClose size={14} /><span>Collapse</span></>}
        </button>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ────────────────────────────────────────────────────────────────
export function SellerDashboard({ setPage }: { setPage: (p: any) => void }) {
  const [activeNav,         setActiveNav        ] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed,  setSidebarCollapsed ] = useState(false);
  const [notifOpen,         setNotifOpen        ] = useState(false);
  const [profileOpen,       setProfileOpen      ] = useState(false);
  const [refreshing,        setRefreshing       ] = useState(false);

  const sidebarW = sidebarCollapsed ? 64 : 240;

  const sidebarProps = {
    activeNav,
    setActiveNav,
    collapsed:   sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
    closeMobile: () => setMobileSidebarOpen(false),
    setPage,
  };

  const closeDropdowns = () => { setNotifOpen(false); setProfileOpen(false); };

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  function renderPage() {
    switch (activeNav) {
      case "dashboard":              return <SellerDashboardPage onNav={setActiveNav} />;
      case "orders":                 return <SellerOrdersPage filter="" />;
      case "pos-orders":             return <SellerPOSOrdersPage />;
      case "category":               return <SellerCategoryPage />;
      case "sub-category":           return <SellerSubCategoryPage />;
      case "add-product":            return <SellerAddProductPage />;
      case "bulk-import":            return <SellerBulkImportPage />;
      case "bulk-update":            return <SellerBulkUpdatePage />;
      case "taxes":                  return <SellerTaxesPage />;
      case "product-list":           return <SellerProductListPage />;
      case "stock-management":       return <SellerStockManagementPage />;
      case "wallet-transaction":     return <SellerWalletPage />;
      case "withdrawal-request":     return <SellerWithdrawalPage />;
      case "product-selling-report": return <SellerProductSellingReport />;
      case "sales-report":           return <SellerSalesReportPage />;
      case "pos-report":             return <SellerPOSReportPage />;
      case "return":                 return <SellerReturnPage />;
      case "kyc":                    return <KYCPage />;
      case "performance":            return <PerformancePage />;
      case "customer-messages":      return <CustomerMessagesPage />;
      case "bank-account":           return <BankAccountPage />;
      case "invoices":               return <InvoicePage />;
      default:                       return <SellerDashboardPage onNav={setActiveNav} />;
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f4f6f8] font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300 ease-in-out"
        style={{ width: sidebarW, borderRight: "1px solid #1a2a1f" }}
      >
        <SidebarInner {...sidebarProps} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              key="mob-ov"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              key="mob-dr"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full z-50 lg:hidden flex flex-col"
              style={{ width: 260 }}
            >
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
              <SidebarInner {...sidebarProps} collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-[60] bg-white border-b border-gray-200 shadow-sm">
          {(notifOpen || profileOpen) && (
            <div className="fixed inset-0 z-[59]" onClick={closeDropdowns} />
          )}

          <div className="flex items-center gap-2 px-4 py-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all shrink-0"
            >
              <Menu size={20} />
            </button>
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mr-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: S }}>
                <ShoppingBag size={14} className="text-white" />
              </div>
              <span className="text-sm font-black text-gray-900 whitespace-nowrap">BharatBazar</span>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs hidden sm:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                placeholder="Search orders, products..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all"
              />
            </div>

            <div className="flex-1" />

            {/* Today's earnings badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border border-green-200 bg-green-50 shrink-0">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              <span className="text-xs font-black text-green-700">₹2.8L Today</span>
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-white shrink-0 transition-all hover:opacity-90"
              style={{ background: S }}
            >
              <motion.span
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw size={13} />
              </motion.span>
              <span className="hidden md:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
            </button>

            {/* Notifications */}
            <div className="relative shrink-0 z-50">
              <button
                onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
              >
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  3
                </span>
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-80 rounded-2xl border border-gray-200 bg-white shadow-2xl z-[70] overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                      <span className="text-sm font-black text-gray-900">Notifications</span>
                      <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-700 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all">
                        <X size={13} />
                      </button>
                    </div>
                    <div className="py-2">
                      {[
                        { msg: "New order #BB-4821 received", time: "2 min ago", dot: S },
                        { msg: "Stock alert: Samsung TV is low", time: "15 min ago", dot: "#f59e0b" },
                        { msg: "Payout of ₹42,000 processed", time: "1 hr ago", dot: "#3b82f6" },
                      ].map((n, i) => (
                        <div key={i} className="flex items-start gap-3 mx-1.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                          <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.dot }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 font-medium leading-snug">{n.msg}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative shrink-0 z-50 pl-2 border-l border-gray-200">
              <button
                onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0"
                  style={{ background: S }}
                >
                  RS
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-gray-900 whitespace-nowrap leading-tight">Ravi Electro Hub</p>
                  <p className="text-[10px] text-gray-400 whitespace-nowrap leading-tight">seller portal</p>
                </div>
                <motion.span
                  animate={{ rotate: profileOpen ? 180 : 0 }}
                  transition={{ duration: 0.18 }}
                  className="hidden md:block"
                >
                  <ChevronDown size={12} className="text-gray-400" />
                </motion.span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-14 w-56 rounded-2xl border border-gray-200 bg-white shadow-2xl z-[70] overflow-hidden"
                  >
                    <div className="px-4 pt-4 pb-3 border-b border-gray-100" style={{ background: `${S}08` }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black text-white shrink-0"
                          style={{ background: S }}
                        >
                          RS
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-gray-900">Ravi Electro Hub</p>
                          <span
                            className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                            style={{ background: `${S}20`, color: S }}
                          >
                            ● Verified Seller
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <button
                        onClick={() => { setPage("seller-login"); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
