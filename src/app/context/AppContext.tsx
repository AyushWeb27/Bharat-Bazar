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

  // Sync dark theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

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
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
