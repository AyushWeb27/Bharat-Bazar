import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, ShoppingCart, Heart, Menu, X, Home, IndianRupee, Bell, CheckCircle, LogOut,
} from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";
import { G, CATEGORIES } from "../data/index";
import type { Page } from "../types/index";
import { useApp } from "../../context/AppContext";

const NOTIFS = [
  { id:1, icon:"📦", text:"Your order #BB2610050001 has been shipped!", time:"2 min ago", unread:true },
  { id:2, icon:"🎁", text:"Flash Sale starts in 1 hour — Up to 80% off!", time:"1 hr ago", unread:true },
  { id:3, icon:"⭐", text:"Rate your recent purchase: iPhone 15 Pro Max", time:"Yesterday", unread:false },
  { id:4, icon:"💰", text:"₹200 cashback credited to your wallet", time:"2 days ago", unread:false },
];

export function Header({ dark, setDark, cart, wish, page, setPage, query, setQuery }:{
  dark:boolean; setDark:(v:boolean)=>void; cart:number[]; wish:Set<number>;
  page:Page; setPage:(p:Page)=>void; query:string; setQuery:(s:string)=>void;
}) {
  const { user, logoutUser } = useApp();
  const [mob, setMob] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = NOTIFS.filter(n => n.unread && !readIds.has(n.id)).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="text-white text-center text-[11px] font-bold py-1.5 px-4 overflow-hidden relative" style={{ background: G }}>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          className="flex whitespace-nowrap gap-12 w-max"
        >
          {[
            "🎉 India's #1 Online Marketplace",
            "🚚 Free delivery on orders over ₹499",
            "📞 24×7 Support: 1800-123-4567",
            "🎁 New users get ₹200 cashback",
            "🪔 Grand Diwali Sale — Up to 80% OFF",
          ].concat([
            "🎉 India's #1 Online Marketplace",
            "🚚 Free delivery on orders over ₹499",
            "📞 24×7 Support: 1800-123-4567",
            "🎁 New users get ₹200 cashback",
            "🪔 Grand Diwali Sale — Up to 80% OFF",
          ]).map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              {t}
              <span className="text-white/40 text-[8px]">◆</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        {/* Gradient line at very top */}
        <div className="h-[2px]" style={{ background:`linear-gradient(90deg, ${G}, #00cc88, #fbbf24, #00cc88, ${G})` }} />

        <div className="max-w-7xl mx-auto px-3 md:px-5">
          <div className="flex items-center gap-3 md:gap-4 py-2.5">

            {/* ── LOGO ── */}
            <motion.button
              onClick={() => setPage("home")}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 shrink-0 group"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background:`linear-gradient(135deg, ${G}, #00cc88)` }}>
                  <IndianRupee size={17} className="text-white" />
                </div>
                {/* Corner sparkle */}
                <motion.div
                  animate={{ scale:[1,1.4,1], opacity:[0.6,1,0.6] }}
                  transition={{ repeat:Infinity, duration:2, ease:"easeInOut" }}
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400"
                />
              </div>
              <div className="leading-none text-left hidden sm:block">
                <div className="text-lg font-black tracking-tight text-foreground">
                  Bharat<span style={{ color: G }}>Bazar</span>
                </div>
                <div className="text-[8px] text-muted-foreground font-medium tracking-wide">भारत बाज़ार</div>
              </div>
            </motion.button>

            {/* ── SEARCH BAR ── */}
            <motion.div
              animate={{ boxShadow: searchFocus ? `0 0 0 2px ${G}40` : "0 0 0 0px transparent" }}
              className="flex-1 flex items-center bg-muted border border-border rounded-2xl overflow-hidden transition-colors duration-200"
              style={{ borderColor: searchFocus ? G : undefined }}
            >
              <select className="bg-transparent text-[11px] font-semibold text-muted-foreground pl-3 pr-2 border-r border-border h-11 outline-none hidden lg:block shrink-0 cursor-pointer hover:text-foreground transition-colors">
                <option>All Categories</option>
                {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
              </select>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                onKeyDown={e => { if (e.key === "Enter") setPage("search" as any); }}
                placeholder="Search products, brands, categories..."
                className="flex-1 bg-transparent text-sm px-3 h-11 outline-none text-foreground placeholder:text-muted-foreground"
              />
              <motion.button
                onClick={() => setPage("search" as any)}
                whileHover={{ width: 52 }} whileTap={{ scale: 0.95 }}
                className="h-11 px-5 flex items-center gap-1.5 text-white text-xs font-black shrink-0 transition-all hover:opacity-90"
                style={{ background:`linear-gradient(to right, ${G}, #00cc88)` }}
              >
                <Search size={14} />
                <span className="hidden xl:inline">Search</span>
              </motion.button>
            </motion.div>

            {/* ── ACTION ICONS ── */}
            <div className="flex items-center gap-1 shrink-0">

              {/* Home */}
              <motion.button whileHover={{ y:-2 }} whileTap={{ scale:0.9 }}
                onClick={() => setPage("home")}
                className="hidden md:flex flex-col items-center px-2.5 py-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Home size={18}/><span className="text-[8px] mt-0.5 font-medium">Home</span>
              </motion.button>

              {/* Notification bell */}
              <div ref={notifRef} className="relative hidden md:block">
                <motion.button whileHover={{ y:-2 }} whileTap={{ scale:0.9 }}
                  onClick={() => { setNotifOpen(o => !o); setReadIds(new Set(NOTIFS.map(n => n.id))); }}
                  className="relative flex flex-col items-center px-2.5 py-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <motion.div animate={unreadCount > 0 ? { rotate:[0,-12,12,-8,0] } : {}} transition={{ duration:0.5, repeat:Infinity, repeatDelay:4 }}>
                    <Bell size={18}/>
                  </motion.div>
                  <span className="text-[8px] mt-0.5 font-medium">Alerts</span>
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span key="nb" initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow"
                        style={{ background:"#ef4444" }}>
                        {unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.95 }}
                      transition={{ type:"spring", damping:26, stiffness:380 }}
                      className="absolute right-0 top-[calc(100%+10px)] w-80 rounded-3xl border border-border bg-card shadow-2xl overflow-hidden z-[70]"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <p className="text-sm font-black text-foreground">Notifications</p>
                        <button onClick={() => setReadIds(new Set(NOTIFS.map(n => n.id)))} className="text-[10px] font-bold hover:underline" style={{ color:G }}>Mark all read</button>
                      </div>
                      {NOTIFS.map(n => (
                        <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-0 ${n.unread && !readIds.has(n.id) ? "bg-[#009966]/4" : ""}`}>
                          <span className="text-xl shrink-0">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground font-semibold leading-snug">{n.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                          </div>
                          {n.unread && !readIds.has(n.id) && <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background:G }}/>}
                        </div>
                      ))}
                      <div className="px-4 py-2.5 text-center">
                        <button className="text-xs font-bold hover:underline" style={{ color:G }}>View all notifications</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wishlist */}
              <motion.button whileHover={{ y:-2 }} whileTap={{ scale:0.9 }}
                onClick={() => setPage("wishlist")}
                className="relative hidden md:flex flex-col items-center px-2.5 py-1.5 rounded-xl hover:bg-muted transition-colors group">
                <motion.div whileHover={{ scale:1.2 }} transition={{ type:"spring", stiffness:400 }}>
                  <Heart size={18} className="text-muted-foreground group-hover:text-red-500 transition-colors"/>
                </motion.div>
                <span className="text-[8px] mt-0.5 font-medium text-muted-foreground group-hover:text-foreground transition-colors">Wishlist</span>
                <AnimatePresence>
                  {wish.size > 0 && (
                    <motion.span initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm">
                      {wish.size}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Cart */}
              <motion.button whileHover={{ y:-2 }} whileTap={{ scale:0.9 }}
                onClick={() => setPage("cart")}
                className="relative flex flex-col items-center px-2.5 py-1.5 rounded-xl hover:bg-muted transition-colors group">
                <motion.div
                  whileHover={{ rotate:[0,-12,12,-8,0] }}
                  transition={{ duration:0.4 }}
                >
                  <ShoppingCart size={18} className="text-muted-foreground group-hover:text-foreground transition-colors"/>
                </motion.div>
                <span className="text-[8px] mt-0.5 font-medium text-muted-foreground group-hover:text-foreground transition-colors">Cart</span>
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.span key={cart.length} initial={{ scale:0, rotate:-20 }} animate={{ scale:1, rotate:0 }} exit={{ scale:0 }}
                      transition={{ type:"spring", stiffness:500, damping:25 }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm"
                      style={{ background: G }}>
                      {cart.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* ── PROFILE ICON (unique component) ── */}
              <ProfileAvatar dark={dark} setDark={setDark} setPage={setPage} wish={wish} />

              {/* Mobile: compact Sign In / Account button */}
              {user ? (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setPage("account")}
                  className="md:hidden flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1.5 rounded-xl border border-[#009966]/30 bg-[#009966]/10 text-[#009966] shrink-0"
                >
                  <span className="w-5 h-5 rounded-full bg-[#009966] text-white flex items-center justify-center text-[10px] overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="max-w-[60px] truncate">{user.name.split(" ")[0]}</span>
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setPage("signin")}
                  className="md:hidden flex items-center gap-1 text-[11px] font-black px-3 py-1.5 rounded-xl border text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${G}, #00cc88)`, borderColor: "transparent" }}
                >
                  Sign In
                </motion.button>
              )}

              {/* Mobile menu toggle */}
              <motion.button whileTap={{ scale:0.88 }}
                className="md:hidden p-2 rounded-xl hover:bg-muted text-muted-foreground"
                onClick={() => setMob(true)}>
                <Menu size={20}/>
              </motion.button>
            </div>
          </div>

          {/* ── SUB-NAV ── */}
          <div className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
            {[
              ["🔥 Today's Deals","products"],
              ["🪔 Festival Sale","products"],
              ["🥻 Sarees","products"],
              ["📱 Mobiles","products"],
              ["💍 Jewellery","products"],
              ["🌿 Ayurveda","products"],
              ["🏏 Cricket","products"],
              ["🏠 Home & Décor","products"],
              ["📚 Books","products"],
            ].map(([label, pg]) => (
              <motion.button key={label} whileHover={{ y:-1 }}
                onClick={() => setPage(pg as Page)}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted border-b-2 border-transparent hover:border-[#009966]">
                {label}
              </motion.button>
            ))}
            {/* Sale badge */}
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => setPage("products")}
              className="ml-auto shrink-0 text-[10px] font-black text-white px-3 py-1 rounded-full"
              style={{ background:`linear-gradient(to right, #ef4444, #f97316)` }}>
              🔥 SALE
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mob && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
              onClick={() => setMob(false)} />
            <motion.div
              initial={{ x:"-100%" }} animate={{ x:0 }} exit={{ x:"-100%" }}
              transition={{ type:"spring", damping:28, stiffness:280 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card z-[100] flex flex-col shadow-2xl"
            >
              {/* Menu header */}
              <div className="relative overflow-hidden p-5"
                style={{ background:`linear-gradient(135deg, ${G}, #00cc88)` }}>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10"/>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-lg overflow-hidden shrink-0">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        user ? user.name.charAt(0).toUpperCase() : "G"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-black text-sm truncate">{user ? user.name : "Guest User"}</p>
                      <p className="text-white/80 text-[10px] truncate">
                        {user ? user.email : "भारत बाज़ार Member"}
                      </p>
                      {user?.email_verified && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-white bg-black/20 px-2 py-0.5 rounded-full mt-1">
                          <CheckCircle size={9} /> Email Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setMob(false)} className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <X size={16} className="text-white"/>
                  </button>
                </div>
                <div className="flex gap-2 mt-3.5 relative">
                  {user ? (
                    <button
                      onClick={async () => {
                        await logoutUser();
                        setMob(false);
                      }}
                      className="flex-1 bg-white/20 text-white text-xs font-black py-2 rounded-lg border border-white/30 flex items-center justify-center gap-1.5 hover:bg-white/30 transition-colors"
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { setPage("signin"); setMob(false); }} className="flex-1 bg-white text-xs font-black py-2 rounded-lg" style={{ color:G }}>Sign In</button>
                      <button onClick={() => { setPage("register"); setMob(false); }} className="flex-1 bg-white/20 text-white text-xs font-black py-2 rounded-lg border border-white/30">Register</button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Quick links */}
                <div className="p-3 space-y-1">
                  {[["🏠","Home","home"],["🛒","Shop All","products"],["❤️","Wishlist","wishlist"],["🛍️","My Cart","cart"]].map(([em,l,pg]) => (
                    <motion.button key={pg} whileHover={{ x:4 }}
                      onClick={() => { setPage(pg as Page); setMob(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-bold text-foreground text-left">
                      <span className="text-base w-5">{em}</span> {l}
                    </motion.button>
                  ))}
                </div>
                {/* Categories */}
                <div className="border-t border-border px-3 py-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3 py-1.5">Categories</p>
                  {CATEGORIES.map(c => (
                    <motion.button key={c.name} whileHover={{ x:4 }}
                      onClick={() => { setPage("products"); setMob(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-sm font-semibold text-foreground">
                      <span className="text-base w-5">{c.icon}</span> {c.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Dark mode in mobile menu */}
              <div className="border-t border-border p-4">
                <button onClick={() => setDark(!dark)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted font-semibold text-sm text-foreground">
                  <span className="flex items-center gap-2">{dark ? "🌙" : "☀️"} {dark ? "Dark Mode" : "Light Mode"}</span>
                  <div className="relative w-11 h-6 rounded-full transition-colors" style={{ background: dark ? G : "#d1d5db" }}>
                    <motion.div layout transition={{ type:"spring", stiffness:500, damping:35 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                      style={{ left: dark ? "calc(100% - 20px)" : 4 }}/>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
