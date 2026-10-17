import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight, Star, CheckCircle, Heart, Share2, ZoomIn, Minus, Plus,
  ShoppingCart, Truck, Package, RefreshCw, X, MapPin, ThumbsUp, ThumbsDown,
  MessageSquare, BadgeCheck,
} from "lucide-react";
import { Stars } from "../ui/Stars";
import { CardGrid } from "../cards/CardGrid";
import { fmt } from "../utils/format";
import { G, GD, PRODUCTS, SWATCHES } from "../data/index";
import type { Prod } from "../types/index";

export function DetailPage({ p, onAdd, onWish, wished, wishedIds, onBack, onView }: {
  p:Prod; onAdd:(p:Prod)=>void; onWish:(id:number)=>void; wished:boolean; wishedIds:Set<number>; onBack:()=>void; onView:(p:Prod)=>void;
}) {
  const [selImg, setSelImg] = useState(0);
  const [selSize, setSelSize] = useState(p.sizes[0]);
  const [selSwatch, setSelSwatch] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc"|"spec"|"reviews">("desc");
  const [zoom, setZoom] = useState(false);

  // Pincode delivery check
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<null | { days: string; free: boolean }>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  function checkPincode() {
    if (pincode.length !== 6) return;
    setPincodeLoading(true);
    setTimeout(() => {
      if (pincode.startsWith("4")) {
        setPincodeResult({ days: "2-3 days", free: true });
      } else {
        setPincodeResult({ days: "4-6 days", free: false });
      }
      setPincodeLoading(false);
    }, 600);
  }

  // Q&A
  const [qaQuestion, setQaQuestion] = useState("");
  const [showAskForm, setShowAskForm] = useState(false);
  const [qaSubmitted, setQaSubmitted] = useState(false);
  const [qaHelpful, setQaHelpful] = useState<Record<number, "up" | "down" | null>>({ 0: null, 1: null, 2: null });

  const QA_MOCK = [
    {
      question: "Is this phone dual SIM?",
      asker: "Rohit V.",
      date: "Sep 2026",
      answer: "Yes, nano-dual SIM + eSIM supported.",
      answerer: "Seller",
      verified: true,
    },
    {
      question: "Does it come with a charger?",
      asker: "Meena K.",
      date: "Aug 2026",
      answer: "No, charger sold separately per Apple policy.",
      answerer: "Seller",
      verified: false,
    },
    {
      question: "What is the warranty period?",
      asker: "Arjun P.",
      date: "Jul 2026",
      answer: "1 year manufacturer warranty.",
      answerer: "Admin",
      verified: true,
    },
  ];
  const imgs = [p.img, p.img2];
  const swatches = SWATCHES[p.id] ?? ["#111"];
  const related = PRODUCTS.filter(r => r.cat === p.cat && r.id !== p.id).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button onClick={onBack} className="hover:text-foreground transition-colors font-semibold">Home</button>
        <ChevronRight size={12}/>
        <button onClick={onBack} className="hover:text-foreground transition-colors font-semibold">{p.cat}</button>
        <ChevronRight size={12}/>
        <span className="text-foreground font-bold line-clamp-1">{p.name}</span>
      </div>

      {/* Main detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ── LEFT: Image Gallery ── */}
        <div className="space-y-3">
          {/* Thumbnails */}
          <div className="flex gap-2">
            {imgs.map((img, i) => (
              <button key={i} onClick={() => setSelImg(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selImg===i ? "border-[#009966]" : "border-border"}`}>
                <img src={img} alt="" className="w-full h-full object-cover"/>
              </button>
            ))}
          </div>
          {/* Main image */}
          <motion.div className="relative rounded-3xl overflow-hidden bg-muted aspect-[4/5] cursor-zoom-in"
            whileTap={{ scale:0.99 }} onClick={() => setZoom(true)}>
            <AnimatePresence mode="wait">
              <motion.img key={selImg} src={imgs[selImg]} alt={p.name}
                initial={{ opacity:0, scale:1.04 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                transition={{ duration:0.3 }}
                className="absolute inset-0 w-full h-full object-cover"/>
            </AnimatePresence>
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">-{p.off}% OFF</span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-white" style={{ background:p.tagClr }}>{p.tag}</span>
            </div>
            <button className="absolute bottom-4 right-4 w-9 h-9 bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground">
              <ZoomIn size={15}/>
            </button>
          </motion.div>

          {/* Share / Wishlist row */}
          <div className="flex gap-2">
            <button onClick={() => onWish(p.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-colors ${wished?"border-red-400 text-red-500":"border-border text-foreground hover:border-red-300"}`}>
              <Heart size={15} className={wished ? "fill-red-500" : ""}/> {wished ? "Wishlisted" : "Add to Wishlist"}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:border-[#009966] transition-colors">
              <Share2 size={15}/> Share
            </button>
          </div>
        </div>

        {/* ── RIGHT: Product Info ── */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{p.brand}</span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background:p.tagClr }}>{p.tag}</span>
              {p.inStock
                ? <span className="text-[9px] font-black text-[#009966] flex items-center gap-0.5"><CheckCircle size={9}/> In Stock</span>
                : <span className="text-[9px] font-black text-red-500">Out of Stock</span>}
            </div>
            <h1 className="text-xl md:text-2xl font-black text-foreground mt-2 leading-snug">{p.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <Stars r={p.rating} n={p.reviews}/>
            <button className="text-xs font-bold text-muted-foreground hover:underline">{p.reviews.toLocaleString("en-IN")} Reviews</button>
          </div>

          {/* Price */}
          <div className="bg-muted/60 rounded-2xl p-4 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-foreground">{fmt(p.price)}</span>
              <span className="text-lg text-muted-foreground line-through">{fmt(p.mrp)}</span>
              <span className="text-base font-black text-red-500">{p.off}% OFF</span>
            </div>
            <p className="text-sm font-bold" style={{ color:G }}>You save {fmt(p.mrp-p.price)} 🎉</p>
            {p.emi && <p className="text-xs text-blue-500 font-semibold">No Cost EMI from ₹{Math.round(p.price/12).toLocaleString("en-IN")}/month</p>}
          </div>

          {/* Color swatch */}
          <div>
            <p className="text-xs font-black text-foreground uppercase tracking-wider mb-2">Colour</p>
            <div className="flex gap-2">
              {swatches.map((c,i) => (
                <motion.button key={i} whileTap={{ scale:0.85 }} onClick={() => setSelSwatch(i)}
                  className={`w-8 h-8 rounded-full border-4 transition-all ${selSwatch===i ? "scale-110" : ""}`}
                  style={{ background:c, borderColor: selSwatch===i ? G : "transparent", boxShadow: selSwatch===i ? `0 0 0 2px ${G}` : "none" }}/>
              ))}
            </div>
          </div>

          {/* Size */}
          {p.sizes.length > 0 && (
            <div>
              <p className="text-xs font-black text-foreground uppercase tracking-wider mb-2">
                {p.cat.includes("Saree") || p.cat === "Sarees & Ethnic" ? "Size / Type" : p.cat === "Gold Jewellery" ? "Size" : p.cat === "Electronics" || p.cat === "Mobiles" ? "Storage" : "Size"}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map(s => (
                  <motion.button key={s} whileTap={{ scale:0.92 }} onClick={() => setSelSize(s)}
                    className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${selSize===s ? "text-white border-transparent" : "border-border text-foreground hover:border-[#009966]"}`}
                    style={selSize===s ? { background:G } : {}}>
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-xs font-black text-foreground uppercase tracking-wider mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1,q-1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors text-foreground"><Minus size={14}/></button>
                <span className="w-10 text-center font-black text-sm text-foreground">{qty}</span>
                <button onClick={() => setQty(q => q+1)} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors text-foreground"><Plus size={14}/></button>
              </div>
              <span className="text-xs text-muted-foreground">Only 8 left in stock</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <motion.button whileTap={{ scale:0.96 }} onClick={() => onAdd(p)}
              className="flex-1 text-white py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background:`linear-gradient(to right,${GD},${G})` }}>
              <ShoppingCart size={16}/> Add to Cart
            </motion.button>
            <motion.button whileTap={{ scale:0.96 }}
              className="flex-1 bg-amber-400 text-black py-3.5 rounded-2xl font-black text-sm hover:bg-amber-300 transition-colors">
              ⚡ Buy Now
            </motion.button>
          </div>

          {/* Delivery badges */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon:Truck,     label:"Free Delivery",  sub:"Order ≥ ₹499",  c:"#009966", show:p.freeShip },
              { icon:Package,   label:"COD Available",  sub:"Pay on delivery",c:"#f59e0b", show:p.cod },
              { icon:RefreshCw, label:"Easy Returns",   sub:"10-day window",  c:"#0ea5e9", show:true },
            ].map(({ icon:Icon,label,sub,c,show }) => show ? (
              <div key={label} className="flex flex-col items-center text-center gap-1 p-2.5 rounded-xl bg-muted">
                <Icon size={16} style={{ color:c }}/>
                <p className="text-[9px] font-black text-foreground">{label}</p>
                <p className="text-[8px] text-muted-foreground">{sub}</p>
              </div>
            ) : null)}
          </div>

          {/* ── PINCODE DELIVERY CHECK ── */}
          <div className="bg-muted/60 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} style={{ color:G }}/> Check Delivery
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={e => { setPincode(e.target.value.replace(/\D/g,"")); setPincodeResult(null); }}
                placeholder="Enter 6-digit pincode"
                className="w-36 bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#009966] transition-colors"
              />
              <motion.button
                whileTap={{ scale:0.96 }}
                onClick={checkPincode}
                disabled={pincode.length !== 6 || pincodeLoading}
                className="px-4 py-2 rounded-xl text-white text-xs font-black disabled:opacity-50"
                style={{ background:`linear-gradient(to right,${GD},${G})` }}
              >
                {pincodeLoading ? "..." : "Check"}
              </motion.button>
            </div>
            <AnimatePresence>
              {pincodeResult && (
                <motion.div
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className={`flex items-center gap-2 text-xs font-semibold rounded-xl px-3 py-2 ${pincodeResult.free ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}
                >
                  <Truck size={13}/>
                  <span>
                    Delivery in <strong>{pincodeResult.days}</strong> —{" "}
                    {pincodeResult.free ? "FREE Delivery 🎉" : "₹49 shipping charge"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex border-b border-border">
          {(["desc","spec","reviews"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-colors ${tab===t ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
              style={tab===t ? { background:G } : {}}>
              {t === "desc" ? "Description" : t === "spec" ? "Specifications" : "Reviews"}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === "desc" && <p className="text-sm text-foreground leading-relaxed">{p.desc}</p>}
          {tab === "spec" && (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(p.spec).map(([k,v]) => (
                <div key={k} className="flex flex-col gap-0.5 bg-muted rounded-xl px-3 py-2">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{k}</span>
                  <span className="text-sm font-bold text-foreground">{v}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "reviews" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-foreground">{p.rating}</div>
                  <Stars r={p.rating}/>
                  <div className="text-xs text-muted-foreground mt-1">{p.reviews.toLocaleString("en-IN")} reviews</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map(n => (
                    <div key={n} className="flex items-center gap-2">
                      <span className="text-xs w-3 text-muted-foreground">{n}</span>
                      <Star size={10} className="text-amber-400 fill-amber-400"/>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ background:G, width:`${[75,15,5,3,2][5-n]}%` }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name:"Priya S.", city:"Mumbai", text:"Absolutely beautiful quality! The fabric feels premium and the colour is exactly as shown. Very happy with my purchase.", rating:5 },
                  { name:"Rahul M.", city:"Delhi",  text:"Great value for money. Fast delivery within 2 days. Packaging was excellent. Would recommend to everyone!", rating:5 },
                  { name:"Anita K.", city:"Bengaluru", text:"Good product but sizing runs slightly small. Please order one size up. Customer service was helpful though.", rating:4 },
                ].map((r, i) => (
                  <div key={i} className="bg-muted rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background:G }}>{r.name[0]}</div>
                      <div>
                        <p className="text-xs font-black text-foreground">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground">{r.city}</p>
                      </div>
                      <div className="ml-auto"><Stars r={r.rating}/></div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Q&A ── */}
      <section className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-base font-black text-foreground flex items-center gap-2">
            <MessageSquare size={16} style={{ color:G }}/> Customer Questions &amp; Answers
            <span className="text-xs font-semibold text-muted-foreground">(12)</span>
          </h2>
          <motion.button
            whileTap={{ scale:0.96 }}
            onClick={() => setShowAskForm(a => !a)}
            className="px-4 py-2 rounded-xl text-white text-xs font-black"
            style={{ background:`linear-gradient(to right,${GD},${G})` }}
          >
            {showAskForm ? "Cancel" : "Ask a Question"}
          </motion.button>
        </div>

        {/* Ask form */}
        <AnimatePresence>
          {showAskForm && !qaSubmitted && (
            <motion.div
              initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
              className="overflow-hidden border-b border-border"
            >
              <div className="p-5 space-y-3">
                <textarea
                  rows={3}
                  value={qaQuestion}
                  onChange={e => setQaQuestion(e.target.value)}
                  placeholder="Type your question about this product..."
                  className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#009966] transition-colors resize-none"
                />
                <motion.button
                  whileTap={{ scale:0.96 }}
                  onClick={() => { if (qaQuestion.trim()) { setQaSubmitted(true); setShowAskForm(false); } }}
                  className="px-5 py-2 rounded-xl text-white text-xs font-black"
                  style={{ background:`linear-gradient(to right,${GD},${G})` }}
                >
                  Submit Question
                </motion.button>
              </div>
            </motion.div>
          )}
          {qaSubmitted && (
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="px-5 py-3 bg-green-50 dark:bg-green-950/30 border-b border-border text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-2"
            >
              <CheckCircle size={13}/> Your question has been submitted. Our team will answer shortly.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Q&A list */}
        <div className="divide-y divide-border">
          {QA_MOCK.map((qa, i) => (
            <div key={i} className="p-5 space-y-3">
              {/* Question */}
              <div className="flex items-start gap-2.5">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">Q</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{qa.question}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Asked by <strong>{qa.asker}</strong> · {qa.date}
                  </p>
                </div>
              </div>

              {/* Answer */}
              <div className="flex items-start gap-2.5 ml-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950/40 shrink-0 mt-0.5" style={{ color:G }}>A</span>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">{qa.answer}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full text-white flex items-center gap-0.5 ${qa.answerer === "Admin" ? "bg-purple-500" : ""}`}
                      style={qa.answerer !== "Admin" ? { background:G } : {}}>
                      {qa.verified && <BadgeCheck size={9}/>} {qa.answerer}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-[10px] text-muted-foreground">Helpful?</span>
                      <button
                        onClick={() => setQaHelpful(h => ({ ...h, [i]: h[i]==="up" ? null : "up" }))}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${qaHelpful[i]==="up" ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
                        style={qaHelpful[i]==="up" ? { background:G } : {}}
                      >
                        <ThumbsUp size={11}/> Yes
                      </button>
                      <button
                        onClick={() => setQaHelpful(h => ({ ...h, [i]: h[i]==="down" ? null : "down" }))}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${qaHelpful[i]==="down" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <ThumbsDown size={11}/> No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RELATED ── */}
      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-foreground mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(r => <CardGrid key={r.id} p={r} onAdd={onAdd} onWish={onWish} wished={wishedIds.has(r.id)} onView={onView}/>)}
          </div>
        </section>
      )}

      {/* Zoom overlay */}
      <AnimatePresence>
        {zoom && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4"
            onClick={() => setZoom(false)}>
            <img src={imgs[selImg]} alt={p.name} className="max-w-full max-h-full object-contain rounded-2xl"/>
            <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center" onClick={() => setZoom(false)}>
              <X size={20} className="text-white"/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
