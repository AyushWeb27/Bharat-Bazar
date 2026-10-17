import { motion } from "motion/react";
import { ArrowRight, Zap, Truck, Package, RefreshCw, Shield, Headphones, Bell } from "lucide-react";
import { HeroSlider } from "../HeroSlider/index";
import { CardFlash } from "../cards/CardFlash";
import { CardFeature } from "../cards/CardFeature";
import { CardGrid } from "../cards/CardGrid";
import { TimeSeg } from "../ui/TimeSeg";
import { useCountdown } from "../hooks/useCountdown";
import { G, PRODUCTS, CATEGORIES } from "../data/index";
import type { Prod, Page } from "../types/index";

export function HomePage({ onAdd, onWish, wish, onView, setPage }: {
  onAdd:(p:Prod)=>void; onWish:(id:number)=>void; wish:Set<number>; onView:(p:Prod)=>void; setPage:(p:Page)=>void;
}) {
  const cd = useCountdown(5*3600+47*60+18);
  const featured3 = PRODUCTS.slice(0, 3);
  const flashDeals = [PRODUCTS[0], PRODUCTS[4], PRODUCTS[7], PRODUCTS[8], PRODUCTS[9], PRODUCTS[10]];

  return (
    <div className="space-y-8">
      {/* ── HERO ── */}
      <HeroSlider onShop={() => setPage("products")} />

      {/* ── CATEGORIES ── */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-lg md:text-xl font-black text-foreground">🛍️ Shop by Category</h2>
          <button onClick={() => setPage("products")} className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color:G }}>View All <ArrowRight size={11}/></button>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
          {CATEGORIES.map(cat => (
            <motion.button key={cat.name} whileHover={{ y:-4 }} whileTap={{ scale:0.95 }}
              onClick={() => setPage("products")}
              className="flex flex-col items-center rounded-2xl border border-border bg-card overflow-hidden hover:border-[#009966] hover:shadow-md transition-all group">
              <div className="w-full aspect-square overflow-hidden">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="py-1.5 px-1 text-center">
                <p className="text-[9px] font-black text-foreground leading-tight">{cat.name}</p>
                <p className="text-[8px] text-muted-foreground">{cat.count.toLocaleString("en-IN")}+</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── FLASH SALE ── */}
      <section className="rounded-2xl overflow-hidden" style={{ background:"linear-gradient(135deg,#000 0%,#111 40%,#001f14 100%)" }}>
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><Zap size={18} className="text-yellow-400 fill-yellow-400"/><span className="text-white font-black text-xl">⚡ Flash Sale</span></div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
                <div className="flex items-center gap-0.5"><TimeSeg v={cd.h} u="hrs"/><span className="text-white font-black text-lg mb-5">:</span><TimeSeg v={cd.m} u="min"/><span className="text-white font-black text-lg mb-5">:</span><TimeSeg v={cd.s} u="sec"/></div>
              </div>
            </div>
            <button onClick={() => setPage("products")} className="text-xs font-black flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color:G }}>View All <ArrowRight size={11}/></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {flashDeals.map(p => <CardFlash key={p.id} p={p} onAdd={onAdd} onView={onView}/>)}
          </div>
        </div>
      </section>

      {/* ── FEATURED (CardFeature) ── */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-lg md:text-xl font-black text-foreground">🌟 Featured This Week</h2>
          <button onClick={() => setPage("products")} className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color:G }}>See All <ArrowRight size={11}/></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featured3.map(p => <CardFeature key={p.id} p={p} onAdd={onAdd} onWish={onWish} wished={wish.has(p.id)} onView={onView}/>)}
        </div>
      </section>

      {/* ── AD BANNERS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { t:"🪔 Diwali Bonanza", s:"Up to 70% off everything",  g:"from-[#78350f] via-[#b45309] to-[#f59e0b]", img:"https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=500&h=200&fit=crop&auto=format" },
          { t:"🥻 Ethnic Festival", s:"Sarees, Lehengas, Kurtas",  g:"from-[#500724] via-[#9d174d] to-[#ec4899]", img:"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&h=200&fit=crop&auto=format" },
          { t:"🌿 Ayurveda Sale",   s:"100% Natural Products",      g:"from-[#003d28] via-[#009966] to-[#00cc88]", img:"https://images.unsplash.com/photo-1564594326930-17381130fd2e?w=500&h=200&fit=crop&auto=format" },
        ].map(b => (
          <motion.button key={b.t} whileHover={{ scale:1.02, y:-3 }} whileTap={{ scale:0.98 }}
            onClick={() => setPage("products")}
            className={`relative rounded-2xl overflow-hidden h-32 bg-gradient-to-br ${b.g} shadow-lg text-left`}>
            <img src={b.img} alt={b.t} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"/>
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <p className="text-white font-black text-base drop-shadow-lg">{b.t}</p>
              <p className="text-white/80 text-xs">{b.s}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ── NEW ARRIVALS GRID ── */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-lg md:text-xl font-black text-foreground">🆕 New Arrivals</h2>
          <button onClick={() => setPage("products")} className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color:G }}>View All <ArrowRight size={11}/></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PRODUCTS.slice(4, 8).map(p => <CardGrid key={p.id} p={p} onAdd={onAdd} onWish={onWish} wished={wish.has(p.id)} onView={onView}/>)}
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="bg-card border border-border rounded-2xl px-4 py-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon:Truck,      label:"Free Delivery",  sub:"Orders ≥ ₹499",     color:"#009966" },
          { icon:Package,    label:"COD Available",  sub:"Pay on delivery",    color:"#f59e0b" },
          { icon:RefreshCw,  label:"Easy Returns",   sub:"10-day window",      color:"#0ea5e9" },
          { icon:Shield,     label:"100% Authentic", sub:"Genuine products",   color:"#8b5cf6" },
          { icon:Headphones, label:"24×7 Support",   sub:"Hindi & English",    color:"#ec4899" },
        ].map(({ icon:Icon, label, sub, color }) => (
          <motion.div key={label} whileHover={{ y:-2 }} className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: color+"18" }}>
              <Icon size={16} style={{ color }}/>
            </div>
            <div>
              <p className="text-xs font-black text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── NEWSLETTER ── */}
      <section className="rounded-2xl overflow-hidden relative" style={{ background:"linear-gradient(135deg,#003d28 0%,#009966 60%,#00cc88 100%)" }}>
        <div className="relative p-8 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3"><Bell size={22} className="text-white"/></div>
          <h2 className="text-2xl font-black text-white">Get Exclusive Offers First!</h2>
          <p className="text-white/70 text-sm mt-1 mb-5">Join 5 Crore+ shoppers. Get ₹200 cashback on first order.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="tel" placeholder="📱 Enter Mobile Number" className="flex-1 bg-white/15 border border-white/30 text-white placeholder:text-white/50 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/60 transition-colors"/>
            <button className="bg-white font-black px-6 py-3 rounded-xl text-sm shrink-0 hover:bg-white/90 transition-colors" style={{ color:G }}>Subscribe 🎉</button>
          </div>
        </div>
      </section>
    </div>
  );
}
