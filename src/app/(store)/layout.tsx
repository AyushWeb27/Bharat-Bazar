"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Header/index";
import { AppFooter } from "../components/Footer/index";
import { CookieConsent } from "../components/CookieConsent";
import { G } from "../components/data/index";
import { PAGE_PATHS, type Page } from "../components/types/index";

function useCurrentPage(): Page {
  const pathname = usePathname();
  if (pathname === "/") return "home";
  if (pathname.startsWith("/products/")) return "detail";
  if (pathname === "/products") return "products";
  if (pathname === "/cart") return "cart";
  if (pathname === "/wishlist") return "wishlist";
  if (pathname === "/orders") return "orders";
  if (pathname === "/account") return "account";
  if (pathname === "/checkout") return "checkout";
  if (pathname === "/order-confirmation") return "order-confirmation";
  if (pathname === "/order-tracking") return "order-tracking";
  if (pathname === "/search") return "search";
  if (pathname.startsWith("/category")) return "category";
  if (pathname === "/loyalty") return "loyalty";
  if (pathname === "/refer") return "refer";
  if (pathname === "/about") return "about";
  if (pathname === "/contact") return "contact";
  if (pathname === "/terms") return "terms";
  if (pathname === "/privacy") return "privacy";
  return "home";
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, wish, dark, setDark, toast, searchQuery, setSearchQuery } = useApp();
  const currentPage = useCurrentPage();

  const setPage = (p: Page) => {
    const target = PAGE_PATHS[p];
    if (target) router.push(target);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
      <Header
        dark={dark}
        setDark={setDark}
        cart={cart}
        wish={wish}
        page={currentPage}
        setPage={setPage}
        query={searchQuery}
        setQuery={setSearchQuery}
      />

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex">
        {([
          ["home", "🏠", "Home"],
          ["products", "🛒", "Shop"],
          ["wishlist", "❤️", "Saved"],
          ["cart", "🛍️", "Cart"],
          ["account", "👤", "Profile"],
        ] as [Page, string, string][]).map(([pg, em, label]) => (
          <button
            key={pg}
            onClick={() => setPage(pg as Page)}
            className={`flex-1 flex flex-col items-center py-2 text-[10px] font-bold transition-colors relative ${currentPage === pg ? "" : "text-muted-foreground"}`}
            style={currentPage === pg ? { color: G } : {}}
          >
            <span className="text-xl leading-none">{em}</span>
            <span className="mt-0.5">{label}</span>
            {pg === "cart" && cart.length > 0 && (
              <span
                className="absolute top-1 right-4 w-3.5 h-3.5 text-white text-[7px] font-black rounded-full flex items-center justify-center"
                style={{ background: G }}
              >
                {cart.length}
              </span>
            )}
            {pg === "wishlist" && wish.size > 0 && (
              <span className="absolute top-1 right-3 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-black rounded-full flex items-center justify-center">
                {wish.size}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Admin quick-access */}
      <button
        onClick={() => router.push("/admin/login")}
        className="fixed bottom-24 md:bottom-6 left-4 z-[100] flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black shadow-lg transition-all hover:scale-105"
        style={{ background: "#070b14", borderColor: "#1a2535", color: G }}
      >
        ⚙️ Admin
      </button>

      <main className="max-w-7xl mx-auto px-3 md:px-5 py-5 pb-20 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <AppFooter setPage={setPage} />

      {/* Cookie consent */}
      <CookieConsent />

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            className="fixed bottom-20 md:bottom-6 right-4 z-[200] bg-zinc-900 dark:bg-zinc-800 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold border border-zinc-700 max-w-xs"
          >
            <CheckCircle size={15} style={{ color: G }} />
            <span className="line-clamp-1">
              Added: <span style={{ color: G }}>{toast.name}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
