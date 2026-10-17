"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Prod } from "../components/types/index";

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
}

const AppCtx = createContext<AppCtxValue>(null!);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDarkVal] = useState(false);
  const [cart, setCart] = useState<number[]>([]);
  const [wish, setWish] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState({ show: false, name: "" });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

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
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
