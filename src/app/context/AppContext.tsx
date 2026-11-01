"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Prod } from "../components/types/index";

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
  cart: number[];
  addCart: (p: Prod) => void;
  setCart: React.Dispatch<React.SetStateAction<number[]>>;
  wish: Set<number>;
  toggleWish: (id: number) => void;
  toast: { show: boolean; name: string };
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
  const [cart, setCart] = useState<number[]>([]);
  const [wish, setWish] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState({ show: false, name: "" });
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

  const logoutUser = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
  }, []);

  const setDark = (d: boolean) => setDarkVal(d);

  const addCart = (p: Prod) => {
    setCart((c) => [...c, p.id]);
    setToast({ show: true, name: p.name });
    setTimeout(() => setToast({ show: false, name: "" }), 2600);
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
        addCart,
        setCart,
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
