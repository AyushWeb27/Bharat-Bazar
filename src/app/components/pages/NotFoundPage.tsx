import { motion } from "motion/react";
import { Home, Package, ShoppingCart, User } from "lucide-react";
import type { Page } from "../types/index";
import { G, GD } from "../data/index";

export function NotFoundPage({ setPage }: { setPage: (p: Page) => void }) {
  const quickLinks: { label: string; icon: typeof Home; page: Page }[] = [
    { label: "Home", icon: Home, page: "home" },
    { label: "Products", icon: Package, page: "products" },
    { label: "Cart", icon: ShoppingCart, page: "cart" },
    { label: "My Account", icon: User, page: "account" },
  ];

  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden"
      style={{
        background: `repeating-linear-gradient(
          135deg,
          transparent,
          transparent 40px,
          rgba(0,153,102,0.04) 40px,
          rgba(0,153,102,0.04) 41px
        )`,
      }}
    >
      {/* Large outlined 404 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="select-none leading-none mb-2"
        style={{
          fontSize: "clamp(7rem, 20vw, 14rem)",
          fontWeight: 900,
          color: "transparent",
          WebkitTextStroke: `3px ${G}`,
          letterSpacing: "-0.04em",
        }}
      >
        404
      </motion.div>

      {/* Floating shopping bag */}
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="text-6xl mb-6 mt-2"
        aria-hidden
      >
        🛍️
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-black text-foreground mb-3"
      >
        Oops! Page not found
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-sm md:text-base max-w-md mb-8"
      >
        Looks like this page went shopping and didn't come back!
      </motion.p>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 mb-10"
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setPage("home")}
          className="px-7 py-3 rounded-2xl text-white font-black text-sm shadow-lg"
          style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}
        >
          🏠 Go Home
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setPage("products")}
          className="px-7 py-3 rounded-2xl font-black text-sm border-2 text-foreground hover:border-[#009966] transition-colors"
          style={{ borderColor: G }}
        >
          🛒 Browse Products
        </motion.button>
      </motion.div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap justify-center"
      >
        {quickLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <span key={link.page} className="flex items-center gap-1">
              {i > 0 && <span className="opacity-40 mx-1">|</span>}
              <button
                onClick={() => setPage(link.page)}
                className="flex items-center gap-1 hover:text-[#009966] transition-colors font-semibold py-1 px-1.5 rounded"
              >
                <Icon size={11} />
                {link.label}
              </button>
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}
