import { useState } from "react";
import { motion } from "motion/react";
import { Bell, Phone, CheckCircle, IndianRupee } from "lucide-react";
import { SocialIcon } from "../ui/SocialIcon";
import { G, FOOTER_LINKS, STATS, PAYMENTS } from "../data/index";
import type { Page } from "../types/index";

export function AppFooter({ setPage }: { setPage: (p: Page) => void }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [hovSocial, setHovSocial] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  const socials: { type: string; label: string; color: string }[] = [
    { type:"instagram", label:"Instagram", color:"#e1306c" },
    { type:"facebook",  label:"Facebook",  color:"#1877f2" },
    { type:"twitter",   label:"Twitter/X", color:"#000000" },
    { type:"youtube",   label:"YouTube",   color:"#ff0000" },
    { type:"whatsapp",  label:"WhatsApp",  color:"#25d366" },
  ];

  return (
    <footer className="relative overflow-hidden pb-16 md:pb-0" style={{ background:"#050a06" }}>

      {/* ── DOT GRID BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage:`radial-gradient(circle, #009966 1px, transparent 1px)`, backgroundSize:"32px 32px", opacity:0.04 }} />

      {/* ── TOP GLOWING LINE ── */}
      <div className="relative h-px" style={{ background:`linear-gradient(to right, transparent, ${G}, #00cc88, #fbbf24, #00cc88, ${G}, transparent)` }}>
        <div className="absolute inset-0 blur-sm" style={{ background:`linear-gradient(to right, transparent, ${G}88, transparent)` }} />
      </div>

      {/* ══ NEWSLETTER + APP DOWNLOAD ══ */}
      <div className="relative max-w-7xl mx-auto px-5 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left: newsletter */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4 text-[11px] font-bold"
              style={{ borderColor:`${G}44`, background:`${G}12`, color:G }}>
              <Bell size={11} /> Members-Only Deals
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
              Be First to Know<br />
              <span style={{ color:G }}>Every Deal.</span>
            </h2>
            <p className="text-zinc-400 text-sm mb-5 max-w-xs">
              Join 5 Crore+ shoppers. Get exclusive offers, early access & ₹200 cashback on first order.
            </p>

            {subscribed ? (
              <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold"
                style={{ borderColor:`${G}44`, background:`${G}12`, color:G }}>
                <CheckCircle size={16}/> You're on the list — welcome to the family! 🎉
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-0 max-w-sm">
                <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-700 rounded-l-2xl overflow-hidden focus-within:border-[#009966] transition-colors">
                  <Phone size={13} className="ml-3 text-zinc-500 shrink-0" />
                  <input
                    type="tel"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Mobile number or email"
                    required
                    className="flex-1 bg-transparent text-sm px-3 py-3.5 outline-none text-white placeholder:text-zinc-600"
                  />
                </div>
                <motion.button whileTap={{ scale:0.96 }} type="submit"
                  className="px-5 py-3.5 rounded-r-2xl text-black text-sm font-black shrink-0 hover:opacity-90 transition-opacity"
                  style={{ background:`linear-gradient(to right, ${G}, #00cc88)` }}>
                  Subscribe
                </motion.button>
              </form>
            )}
            <p className="text-zinc-600 text-[10px] mt-2.5 font-medium">No spam. Unsubscribe anytime. T&C apply.</p>
          </div>

          {/* Right: app download */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-white font-black text-lg mb-1">Download the App</p>
              <p className="text-zinc-500 text-xs">Shop faster, track orders & get app-only deals</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { store:"App Store",   sub:"Download on the", icon:"🍎", rating:"4.8★", reviews:"2M+ reviews" },
                { store:"Google Play", sub:"Get it on",        icon:"🤖", rating:"4.7★", reviews:"3M+ reviews" },
              ].map(app => (
                <motion.a key={app.store} href="#" whileHover={{ y:-3, scale:1.03 }} whileTap={{ scale:0.97 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-zinc-700 bg-zinc-900 hover:border-[#009966]/60 transition-all group">
                  <span className="text-2xl">{app.icon}</span>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-medium">{app.sub}</p>
                    <p className="text-white font-black text-sm leading-tight">{app.store}</p>
                    <p className="text-[10px] font-bold" style={{ color:G }}>{app.rating} &nbsp;·&nbsp; <span className="text-zinc-500">{app.reviews}</span></p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* QR code placeholder */}
            <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 w-fit">
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shrink-0">
                <div className="grid grid-cols-3 gap-0.5 p-1">
                  {Array.from({length:9}).map((_,i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${[0,2,3,5,6,8].includes(i) ? "bg-black" : "bg-white"}`} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white text-xs font-black">Scan QR Code</p>
                <p className="text-zinc-500 text-[10px]">Point camera to download</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ STATS BAR ══ */}
      <div className="border-y border-zinc-800/60 py-6" style={{ background:"#080f09" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center text-center group"
              >
                <motion.span whileHover={{ scale:1.3, rotate:10 }} className="text-2xl mb-1 cursor-default">{s.icon}</motion.span>
                <p className="font-black text-xl text-white leading-tight" style={{
                  background:`linear-gradient(to right, #ffffff, ${G})`,
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                }}>{s.value}</p>
                <p className="text-zinc-500 text-[10px] font-medium mt-0.5 uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MAIN LINK GRID ══ */}
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">

          {/* Brand column */}
          <div className="col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-[#009966]/20"
                style={{ background:`linear-gradient(135deg, ${G}, #00cc88)` }}>
                <IndianRupee size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-white leading-none">Bharat<span style={{ color:G }}>Bazar</span></p>
                <p className="text-[9px] text-zinc-500 font-medium">भारत बाज़ार</p>
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed mb-5 max-w-[200px]">
              India's most-loved online marketplace. Quality products, unbeatable prices, delivered with care.
            </p>

            {/* Social icons */}
            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2.5">Follow Us</p>
              <div className="flex gap-2">
                {socials.map(s => (
                  <motion.a key={s.type} href="#"
                    whileHover={{ scale:1.18, y:-3 }} whileTap={{ scale:0.9 }}
                    onMouseEnter={() => setHovSocial(s.type)}
                    onMouseLeave={() => setHovSocial(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-200"
                    style={{
                      borderColor: hovSocial === s.type ? s.color + "80" : "#27272a",
                      background:  hovSocial === s.type ? s.color + "18" : "#18181b",
                      color:       hovSocial === s.type ? s.color : "#71717a",
                      boxShadow:   hovSocial === s.type ? `0 4px 16px ${s.color}30` : "none",
                    }}
                    title={s.label}
                  >
                    <SocialIcon type={s.type} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Trust seals */}
            <div className="flex flex-wrap gap-2 mt-5">
              {["🔒 SSL Secure","✅ ISO Certified","🏆 Award Winning"].map(seal => (
                <span key={seal} className="text-[9px] font-bold text-zinc-500 border border-zinc-800 px-2 py-1 rounded-lg bg-zinc-900">
                  {seal}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col, ci) => (
            <div key={col.title}>
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-sm">{col.emoji}</span>
                <p className="text-[10px] font-black text-white uppercase tracking-[0.15em]">{col.title}</p>
              </div>
              <ul className="space-y-2.5">
                {col.links.map((link, li) => (
                  <motion.li key={link.label}
                    initial={{ opacity:0, x:-8 }} whileInView={{ opacity:1, x:0 }}
                    viewport={{ once:true }} transition={{ delay: ci*0.05 + li*0.04 }}
                  >
                    <a href="#" className="group flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors duration-150">
                      <motion.span
                        className="w-0 h-px rounded-full transition-all duration-200 group-hover:w-3 shrink-0"
                        style={{ background:G }}
                      />
                      {link.label}
                      {link.hot && (
                        <span className="text-[8px] font-black px-1 py-0.5 rounded" style={{ background:`${G}33`, color:G }}>NEW</span>
                      )}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PAYMENT METHODS ══ */}
      <div className="border-t border-zinc-800/60 py-6" style={{ background:"#080f09" }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest shrink-0">Accepted Payments</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENTS.map(p => (
                <motion.div key={p.label} whileHover={{ y:-2, scale:1.06 }} whileTap={{ scale:0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 cursor-pointer group transition-all"
                  style={{ "--hover-color": p.color } as React.CSSProperties}
                >
                  <span className="text-sm">{p.icon}</span>
                  <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors">{p.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ CERTIFICATIONS ══ */}
      <div className="max-w-7xl mx-auto px-5 py-5 flex flex-wrap items-center gap-4 border-t border-zinc-800/40">
        {[
          { icon:"🛡️", title:"BIS Certified",      sub:"All electronics" },
          { icon:"🌿", title:"Eco Packaging",       sub:"Sustainable" },
          { icon:"🔐", title:"256-bit SSL",         sub:"Secure checkout" },
          { icon:"📜", title:"GST Compliant",       sub:"Legal & Transparent" },
          { icon:"🚚", title:"Pan-India Delivery",  sub:"28 states" },
        ].map(c => (
          <div key={c.title} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-base">{c.icon}</span>
            <div>
              <p className="text-[10px] font-black text-zinc-300">{c.title}</p>
              <p className="text-[9px] text-zinc-600">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══ BOTTOM BAR ══ */}
      <div className="border-t border-zinc-800/60" style={{ background:"#030705" }}>
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] text-zinc-600">

            {/* Left */}
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
              <span>© 2025 BharatBazar Pvt. Ltd.</span>
              <span className="hidden md:inline text-zinc-800">|</span>
              <span>CIN: U52100MH2025PTC123456</span>
              <span className="hidden md:inline text-zinc-800">|</span>
              <span>GST: 27AABCB1234A1Z5</span>
            </div>

            {/* Center: Made in India */}
            <motion.div
              animate={{ scale:[1, 1.04, 1] }}
              transition={{ repeat:Infinity, duration:2.5, ease:"easeInOut" }}
              className="flex items-center gap-1.5 font-bold"
              style={{ color:G }}
            >
              <span>Made with ❤️ in</span>
              <span className="text-base">🇮🇳</span>
              <span>India</span>
            </motion.div>

            {/* Right: legal links */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {([
                ["Privacy Policy","privacy"],
                ["Terms of Use","terms"],
                ["About Us","about"],
                ["Contact","contact"],
              ] as [string,string][]).map(([l, pg], i) => (
                <span key={l} className="flex items-center gap-4">
                  <button onClick={() => setPage(pg as any)} className="hover:text-white transition-colors whitespace-nowrap">{l}</button>
                  {i < 3 && <span className="text-zinc-800 hidden md:inline">·</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
