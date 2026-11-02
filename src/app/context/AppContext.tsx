"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CartItem, Prod } from "../components/types/index";

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "number" || typeof item.quantity !== "number" ||
      !item.product || typeof item.product !== "object" || Array.isArray(item.product)) return false;
  const product = item.product as Record<string, unknown>;
  return typeof product.id === "number" && typeof product.name === "string" &&
    typeof product.price === "number" && typeof product.mrp === "number" &&
    typeof product.stock === "number" && typeof product.inStock === "boolean" &&
    typeof product.img === "string" && typeof product.brand === "string" &&
    typeof product.off === "number" && typeof product.rating === "number" &&
    typeof product.reviews === "number" && typeof product.cod === "boolean" &&
    typeof product.freeShip === "boolean" && typeof product.cat === "string" &&
    typeof product.tag === "string" && typeof product.tagClr === "string" &&
    typeof product.img2 === "string" && typeof product.desc === "string" &&
    Array.isArray(product.sizes) && product.sizes.every(size => typeof size === "string") &&
    Boolean(product.spec && typeof product.spec === "object" && !Array.isArray(product.spec));
}

export interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  email_verified: boolean;
  auth_provider: string;
  gender?: string;
  date_of_birth?: string;
  created_at?: string;
}

export interface StoreSettings {
  store_name: string;
  store_tagline: string;
  support_email: string;
  support_phone: string;
  business_address: string;
  gst_number: string;
  logo_url: string;
  favicon_url: string;
  currency: string;
  timezone: string;
  language: string;
  min_order_amount: string;
  delivery_charge: string;
  free_delivery_above: string;
  maintenance_mode: string;
  guest_checkout: string;
  reviews_enabled: string;
  multiple_addresses: string;
}

interface AppCtxValue {
  dark: boolean;
  setDark: (d: boolean) => void;
  cart: CartItem[];
  cartCount: number;
  cartLoading: boolean;
  cartError: string;
  refreshCart: () => Promise<void>;
  addCart: (p: Prod, quantity?: number) => Promise<void>;
  updateCartQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeCartItem: (itemId: number) => Promise<void>;
  wish: Set<number>;
  toggleWish: (id: number) => void;
  toast: { show: boolean; name: string; kind: "success" | "error" };
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  user: CustomerUser | null;
  userLoading: boolean;
  refreshUser: () => Promise<void>;
  logoutUser: () => Promise<void>;
  storeSettings: StoreSettings | null;
  storeSettingsLoading: boolean;
  refreshStoreSettings: () => Promise<void>;
}

const AppCtx = createContext<AppCtxValue>(null!);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDarkVal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [wish, setWish] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ show: boolean; name: string; kind: "success" | "error" }>({ show: false, name: "", kind: "success" });
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [storeSettingsLoading, setStoreSettingsLoading] = useState(true);

  // Sync dark theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Load store settings from Neon DB
  const refreshStoreSettings = useCallback(async () => {
    try {
      setStoreSettingsLoading(true);
      const res = await fetch("/api/store-settings", {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data.success && data.settings) {
        setStoreSettings(data.settings as StoreSettings);
      }
    } catch (e) {
      console.error("Failed to fetch store settings:", e);
    } finally {
      setStoreSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStoreSettings();

    // Fast-refresh listeners: window event, storage event (cross-tab), and tab focus
    const handleSync = () => {
      refreshStoreSettings();
    };

    window.addEventListener("store-settings-updated", handleSync);
    window.addEventListener("storage", (e) => {
      if (e.key === "bb_store_settings_updated") refreshStoreSettings();
    });
    window.addEventListener("focus", handleSync);

    return () => {
      window.removeEventListener("store-settings-updated", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [refreshStoreSettings]);

  // Update favicon dynamically with fast cache-busting when storeSettings change
  useEffect(() => {
    if (typeof document === "undefined") return;

    const faviconUrl = storeSettings?.favicon_url?.trim()
      ? (storeSettings.favicon_url.includes("?")
          ? `${storeSettings.favicon_url}&t=${Date.now()}`
          : `${storeSettings.favicon_url}?t=${Date.now()}`)
      : `/favicon.ico?t=${Date.now()}`;

    // Update or create standard icon links
    const rels = ["icon", "shortcut icon", "apple-touch-icon"];
    rels.forEach(rel => {
      let link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    });

  }, [storeSettings?.favicon_url, storeSettings?.store_name]);

  // Load customer user session from Neon DB
  const refreshUser = useCallback(async () => {
    try {
      setUserLoading(true);
      const res = await fetch("/api/auth/me", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const readCartResponse = useCallback(async (response: Response) => {
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("success" in data) || data.success !== true ||
        !("items" in data) || !Array.isArray(data.items) || !data.items.every(isCartItem)) {
      const message = data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : "Could not update your cart.";
      throw new Error(message);
    }
    if (!response.ok) {
      throw new Error("Could not update your cart.");
    }
    setCart(data.items);
    setCartError("");
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user || userLoading) {
      setCart([]);
      setCartLoading(userLoading);
      setCartError("");
      return;
    }

    setCartLoading(true);
    try {
      const response = await fetch("/api/cart", {
        credentials: "same-origin",
        cache: "no-store",
      });
      await readCartResponse(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load your cart.";
      console.error("Failed to load customer cart:", error);
      setCartError(message);
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  }, [readCartResponse, user, userLoading]);

  useEffect(() => {
    if (!userLoading) void refreshCart();
  }, [refreshCart, userLoading]);

  const logoutUser = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
    setCart([]);
  }, []);

  const setDark = (d: boolean) => setDarkVal(d);

  const addCart = async (p: Prod, quantity = 1) => {
    let authenticated = Boolean(user);
    if (!authenticated && userLoading) {
      try {
        const sessionResponse = await fetch("/api/auth/me", {
          credentials: "same-origin",
          cache: "no-store",
        });
        const sessionData: unknown = await sessionResponse.json();
        if (!sessionResponse.ok) {
          throw new Error("Could not verify your sign-in. Please try again.");
        }
        authenticated = Boolean(sessionData && typeof sessionData === "object" &&
          "authenticated" in sessionData && sessionData.authenticated === true);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not verify your sign-in.";
        setCartError(message);
        setToast({ show: true, name: message, kind: "error" });
        return;
      }
    }
    if (!authenticated) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/signin?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }

    setCartError("");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: p.id,
          quantity,
          variantTitle: p.selectedSize || "",
        }),
      });
      await readCartResponse(response);
      setToast({ show: true, name: p.name, kind: "success" });
      setTimeout(() => setToast({ show: false, name: "", kind: "success" }), 2600);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not add this product to your cart.";
      console.error("Failed to add product to customer cart:", error);
      setCartError(message);
      setToast({ show: true, name: message, kind: "error" });
      setTimeout(() => setToast({ show: false, name: "", kind: "success" }), 3600);
    }
  };

  const updateCartQuantity = async (itemId: number, quantity: number) => {
    setCartError("");
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      await readCartResponse(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update your cart.";
      console.error("Failed to update customer cart:", error);
      setCartError(message);
    }
  };

  const removeCartItem = async (itemId: number) => {
    setCartError("");
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      await readCartResponse(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not remove this cart item.";
      console.error("Failed to remove customer cart item:", error);
      setCartError(message);
    }
  };

  const toggleWish = (id: number) => {
    setWish((w) => {
      const n = new Set(w);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <AppCtx.Provider
      value={{
        dark,
        setDark,
        cart,
        cartCount: cart.reduce((total, item) => total + item.quantity, 0),
        cartLoading,
        cartError,
        refreshCart,
        addCart,
        updateCartQuantity,
        removeCartItem,
        wish,
        toggleWish,
        toast,
        searchQuery,
        setSearchQuery,
        user,
        userLoading,
        refreshUser,
        logoutUser,
        storeSettings,
        storeSettingsLoading,
        refreshStoreSettings,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
