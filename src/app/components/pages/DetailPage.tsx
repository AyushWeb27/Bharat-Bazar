import { useState, useEffect } from "react";
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

function renderDescription(content: string) {
  const lines = content.split(/\r?\n/);
  const blocks: Array<{ type: "paragraph" | "heading" | "list"; text?: string; items?: string[] }> = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (/^#{1,6}\s/.test(line)) {
      blocks.push({ type: "heading", text: line.replace(/^#{1,6}\s*/, "") });
      index += 1;
      continue;
    }

    if (/^(?:[-*+]|\d+\.)\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^(?:[-*+]|\d+\.)\s/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^(?:[-*+]|\d+\.)\s*/, ""));
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^#{1,6}\s/.test(lines[index].trim()) && !/^(?:[-*+]|\d+\.)\s/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  function renderInline(text: string) {
    return text.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  }

  return blocks.map((block, index) => {
    if (block.type === "heading") {
      return <h3 key={index} className="pt-2 text-sm font-black text-foreground">{renderInline(block.text ?? "")}</h3>;
    }
    if (block.type === "list") {
      return (
        <ul key={index} className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/85 marker:text-emerald-700 dark:marker:text-emerald-400">
          {block.items?.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
        </ul>
      );
    }
    return <p key={index} className="text-sm leading-7 text-foreground/85 sm:text-[15px]">{renderInline(block.text ?? "")}</p>;
  });
}

export function DetailPage({ p, onAdd, onBuyNow, onWish, wished, wishedIds, onBack, onView }: {
  p:Prod; onAdd:(p:Prod, quantity?:number)=>void; onBuyNow:(p:Prod, quantity:number)=>void; onWish:(id:number)=>void; wished:boolean; wishedIds:Set<number>; onBack:()=>void; onView:(p:Prod)=>void;
}) {
  const [selImg, setSelImg] = useState(0);
  const [selSize, setSelSize] = useState(p.sizes[0] || "");
  const [selSwatch, setSelSwatch] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc"|"spec"|"reviews">("desc");
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (p.sizes?.length) {
      setSelSize(p.sizes[0]);
    }
  }, [p.id, p.sizes]);

  const activeVariant = p.variants?.find(v => v.title === selSize);
  const currentPrice = activeVariant ? (activeVariant.offerPrice ?? activeVariant.price) : p.price;
  const currentMrp = activeVariant ? (activeVariant.price ?? p.mrp) : p.mrp;
  const currentOff = currentMrp > currentPrice
    ? Math.max(0, Math.round((1 - currentPrice / currentMrp) * 100))
    : (activeVariant ? 0 : p.off);
  const currentStock = activeVariant?.stock !== undefined ? activeVariant.stock : p.stock;
  const currentInStock = currentStock !== undefined ? currentStock > 0 : p.inStock;

  const selectedProduct: Prod = {
    ...p,
    price: currentPrice,
    mrp: currentMrp,
    off: currentOff,
    stock: currentStock,
    inStock: currentInStock,
    selectedSize: selSize,
    selectedVariant: activeVariant,
    name: activeVariant ? `${p.name} (${activeVariant.title})` : (selSize ? `${p.name} (${selSize})` : p.name),
  };

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
  const imgs = p.galleryImages?.length
    ? Array.from(new Set([p.img, ...p.galleryImages].filter(Boolean)))
    : Array.from(new Set([p.img, p.img2].filter(Boolean)));
  const swatches = p.stock === undefined ? SWATCHES[p.id] ?? ["#111"] : p.swatches ?? [];
  const related = p.stock === undefined
    ? PRODUCTS.filter(r => r.cat === p.cat && r.id !== p.id).slice(0, 4)
    : [];

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 overflow-hidden rounded-full border border-border bg-card/70 px-4 py-2.5 text-xs text-muted-foreground">
        <button onClick={onBack} className="hover:text-foreground transition-colors font-semibold">Home</button>
        <ChevronRight size={12}/>
        <button onClick={onBack} className="hover:text-foreground transition-colors font-semibold">{p.cat}</button>
        <ChevronRight size={12}/>
        <span className="text-foreground font-bold line-clamp-1">{p.name}</span>
      </div>

      {/* Main detail */}
      <div className="grid grid-cols-1 items-start gap-7 sm:gap-9 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] lg:gap-10">
        {/* ── LEFT: Image Gallery ── */}
        <div className="flex min-w-0 flex-col gap-3">
          {/* Thumbnails */}
          <div className="order-2 flex gap-2 overflow-x-auto pb-1">
            {imgs.length > 1 && imgs.map((img, i) => (
              <button key={i} onClick={() => setSelImg(i)}
                aria-label={`View product image ${i + 1}`}
                aria-pressed={selImg === i}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 bg-[#f1eee5] p-1 transition-all dark:bg-[#1d2822] ${selImg===i ? "border-[#087a51] shadow-sm" : "border-transparent opacity-60 hover:opacity-100"}`}>
                <img src={img} alt="" className="h-full w-full rounded-xl object-contain"/>
              </button>
            ))}
          </div>
          {/* Main image */}
          <motion.div className="order-1 relative aspect-[5/4] cursor-zoom-in overflow-hidden rounded-[1.5rem] bg-[#f1eee5] dark:bg-[#1d2822] sm:rounded-[2rem]"
            whileTap={{ scale:0.99 }} onClick={() => setZoom(true)}>
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/60 blur-3xl dark:bg-emerald-300/10"/>
            <AnimatePresence mode="wait">
              {imgs[selImg] ? (
                <motion.img key={imgs[selImg]} src={imgs[selImg]} alt={p.name}
                  initial={{ opacity:0, scale:1.04 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                  transition={{ duration:0.3 }}
                  className="absolute inset-0 z-[1] h-full w-full p-10 object-contain drop-shadow-[0_24px_28px_rgba(27,36,28,0.16)] sm:p-12 lg:p-14"/>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Package size={36}/>
                  <span className="text-xs font-bold">Product image coming soon</span>
                </div>
              )}
            </AnimatePresence>
            <div className="absolute left-5 top-5 z-10 flex flex-col gap-2">
              {currentOff > 0 && <span className="rounded-full bg-[#b94735] px-3 py-1.5 text-[10px] font-black tracking-wide text-white">SAVE {currentOff}%</span>}
              {p.tag && <span className="rounded-full px-3 py-1.5 text-[10px] font-black tracking-wide text-white" style={{ background:p.tagClr }}>{p.tag}</span>}
            </div>
            <span className="absolute bottom-4 left-4 z-10 text-[8px] font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-300 sm:bottom-6 sm:left-6 sm:text-[9px] sm:tracking-[0.2em]">Bharat Bazar · Curated for you</span>
            <button aria-label="Zoom product image" className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground dark:bg-zinc-800/80">
              <ZoomIn size={15}/>
            </button>
          </motion.div>

          {/* Share / Wishlist row */}
          <div className="order-3 flex gap-2">
            <button onClick={() => onWish(p.id)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition-colors ${wished?"border-red-400 text-red-500":"border-border text-foreground hover:border-red-300"}`}>
              <Heart size={15} className={wished ? "fill-red-500" : ""}/> {wished ? "Wishlisted" : "Add to Wishlist"}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-xs font-bold text-foreground transition-colors hover:border-[#087a51]">
              <Share2 size={15}/> Share
            </button>
          </div>
        </div>

        {/* ── RIGHT: Product Info ── */}
        <div className="min-w-0 space-y-5 py-1 lg:py-4">
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-800 dark:text-emerald-400">{p.brand || "Bharat Bazar Select"}</span>
              {currentInStock
                ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"><CheckCircle size={12}/> {currentStock === undefined ? "Ready to ship" : `${currentStock} available`}</span>
                : <span className="rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">Out of stock</span>}
            </div>
            <h1 className="max-w-[24ch] break-words text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.35rem] [overflow-wrap:anywhere]">{p.name}</h1>
          </div>

          {p.reviews > 0 ? <div className="flex items-center gap-3">
            <Stars r={p.rating}/>
            <span className="text-sm font-bold text-foreground">{p.rating.toFixed(1)}</span>
            <span className="h-4 w-px bg-border"/>
            <button onClick={() => setTab("reviews")} className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">{p.reviews.toLocaleString("en-IN")} customer reviews</button>
          </div> : <p className="text-xs font-semibold text-muted-foreground">Be the first to review this find</p>}

          {/* Price */}
          <div className="space-y-1 border-y border-border py-5">
            <div className="flex items-baseline gap-3">
              <motion.span
                key={currentPrice}
                initial={{ y: 4, opacity: 0.6 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-black tracking-tight text-foreground"
              >
                {fmt(currentPrice)}
              </motion.span>
              {currentMrp > currentPrice && (
                <span className="text-base text-muted-foreground line-through">
                  {fmt(currentMrp)}
                </span>
              )}
              {currentOff > 0 && (
                <span className="text-xs font-black text-[#b94735]">
                  {currentOff}% off
                </span>
              )}
            </div>
            {currentMrp > currentPrice && (
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                You save {fmt(currentMrp - currentPrice)} on this order
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">Inclusive of all taxes</p>
            {p.emi && <p className="text-xs text-blue-500 font-semibold">No Cost EMI from ₹{Math.round(currentPrice/12).toLocaleString("en-IN")}/month</p>}
          </div>

          {/* Color swatch */}
          {swatches.length > 0 && <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Choose a colour</p>
            <div className="flex gap-3">
              {swatches.map((c,i) => (
                <motion.button key={i} whileTap={{ scale:0.88 }} onClick={() => setSelSwatch(i)}
                  aria-label={`Select colour ${i + 1}`}
                  aria-pressed={selSwatch === i}
                  className={`h-8 w-8 rounded-full border-[3px] transition-all ${selSwatch===i ? "scale-110 border-background ring-2 ring-[#087a51]" : "border-background shadow-sm"}`}
                  style={{ background:c }}/>
              ))}
            </div>
          </div>}

          {/* Size / Variant Options */}
          {p.sizes.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                {p.variants?.length
                  ? (p.variants[0].variationType || "Select Pack / Variant")
                  : p.cat.includes("Saree") || p.cat === "Sarees & Ethnic"
                    ? "Size / Type"
                    : p.cat === "Gold Jewellery"
                      ? "Size"
                      : p.cat === "Electronics" || p.cat === "Mobiles"
                        ? "Storage"
                        : "Size"}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map(s => {
                  const variant = p.variants?.find(v => v.title === s);
                  const isSelected = selSize === s;
                  const variantPrice = variant ? (variant.offerPrice ?? variant.price) : null;
                  const variantSavings = variant && variant.price > variant.offerPrice ? variant.price - variant.offerPrice : 0;
                  return (
                    <motion.button
                      type="button"
                      key={s}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelSize(s)}
                      aria-pressed={isSelected}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                        isSelected
                          ? "border-[#087a51] bg-emerald-50 text-emerald-900 ring-1 ring-[#087a51] dark:bg-emerald-950/40 dark:text-emerald-100"
                          : "border-border bg-card text-foreground hover:border-[#087a51]"
                      }`}
                    >
                      <span>{s}</span>
                      {variantPrice !== null && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-lg font-black transition-colors ${
                            isSelected
                              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {fmt(variantPrice)}
                        </span>
                      )}
                      {variantSavings > 0 && !isSelected && (
                        <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">
                          Save {fmt(variantSavings)}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Quantity</p>
              <div className="flex items-center rounded-xl border border-border">
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty(q => Math.max(1,q-1))} className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-muted"><Minus size={14}/></button>
                <span aria-live="polite" className="w-8 text-center text-sm font-black text-foreground">{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty(q => Math.min(currentStock ?? Number.MAX_SAFE_INTEGER, q+1))} disabled={currentStock !== undefined && qty >= currentStock} className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-muted disabled:opacity-40"><Plus size={14}/></button>
              </div>
            </div>
            {currentStock !== undefined && currentStock <= 10 && currentStock > 0 && (
              <p className="text-right text-[11px] font-semibold text-amber-700 dark:text-amber-400">Only {currentStock} left — order soon</p>
            )}
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button type="button" whileTap={{ scale:0.97 }}             onClick={() => onAdd(selectedProduct, qty)} disabled={!currentInStock}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#087a51] px-4 py-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(8,122,81,0.2)] transition-colors hover:bg-[#066641] disabled:cursor-not-allowed disabled:opacity-50">
              <ShoppingCart size={17}/> Add to cart
            </motion.button>
            <motion.button type="button" whileTap={{ scale:0.97 }} onClick={() => onBuyNow(selectedProduct, qty)} disabled={!currentInStock || !selectedProduct.cod}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#087a51]/30 bg-card px-4 py-4 text-sm font-black text-emerald-800 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30">
              <span aria-hidden="true">⚡</span> {selectedProduct.cod ? "Buy now" : "COD unavailable"}
            </motion.button>
          </div>

          {/* Delivery badges */}
          <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border py-4">
            {[
              { icon:Truck,     label:p.freeShip ? "Free delivery" : "Fast delivery",  sub:"Across India",  show:true },
              { icon:Package,   label:p.cod ? "Cash on delivery" : "Secure checkout",  sub:p.cod ? "Pay at your door" : "Protected payment", show:true },
              { icon:RefreshCw, label:"Easy returns",   sub:"10-day window",  show:true },
            ].map(({ icon:Icon,label,sub }) => (
              <div key={label} className="flex flex-col items-center gap-1 px-1 text-center">
                <Icon size={16} className="text-emerald-700 dark:text-emerald-400"/>
                <p className="text-[9px] font-black text-foreground">{label}</p>
                <p className="text-[8px] text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>

          {/* ── PINCODE DELIVERY CHECK ── */}
          <div className="space-y-3 rounded-2xl bg-muted/60 p-4">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-foreground">
              <MapPin size={13} className="text-emerald-700 dark:text-emerald-400"/> Check delivery to your area
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={e => { setPincode(e.target.value.replace(/\D/g,"")); setPincodeResult(null); }}
                placeholder="Enter 6-digit pincode"
                aria-label="Delivery pincode"
                className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#087a51] focus:outline-none"
              />
              <motion.button
                type="button"
                whileTap={{ scale:0.96 }}
                onClick={checkPincode}
                disabled={pincode.length !== 6 || pincodeLoading}
                className="rounded-xl bg-[#087a51] px-4 py-2.5 text-xs font-black text-white transition-colors hover:bg-[#066641] disabled:opacity-50"
              >
                {pincodeLoading ? "Checking…" : "Check"}
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
                    {pincodeResult.free ? "FREE delivery" : "₹49 shipping charge"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Product information */}
      <section aria-label="Product information" className="scroll-mt-6">
        <div className="mb-5 flex flex-col gap-1 sm:mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">The details</p>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Get to know your pick</h2>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm sm:rounded-[2rem]">
          <div role="tablist" aria-label="Product information tabs" className="grid grid-cols-3 gap-1 border-b border-border bg-muted/40 p-2 sm:gap-2 sm:p-3">
            {([
              { id: "desc", title: "Description", number: "01", subtitle: "The story" },
              { id: "spec", title: "Specifications", number: "02", subtitle: "The details" },
              { id: "reviews", title: "Reviews", number: "03", subtitle: `${p.reviews.toLocaleString("en-IN")} ratings` },
            ] as const).map(({ id, title, number, subtitle }) => (
              <button
                type="button"
                key={id}
                id={`product-tab-${id}`}
                role="tab"
                aria-selected={tab === id}
                aria-controls={`product-panel-${id}`}
                onClick={() => setTab(id)}
                className={`min-w-0 rounded-xl px-2 py-3 text-left transition-all sm:rounded-2xl sm:px-4 sm:py-4 ${
                  tab === id
                    ? "bg-[#075b40] text-white shadow-md shadow-emerald-950/10"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] opacity-70 sm:gap-2 sm:text-[10px] sm:tracking-[0.18em]">
                  <span>{number}</span><span className="h-px w-3 bg-current sm:w-5"/>
                </span>
                <span className="mt-2 block break-words text-[11px] font-extrabold leading-tight sm:text-sm">{title}</span>
                <span className="mt-1 hidden text-[10px] opacity-70 sm:block">{subtitle}</span>
              </button>
            ))}
          </div>

          <div
            id={`product-panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`product-tab-${tab}`}
            className="min-h-64 p-4 sm:p-7 lg:p-9"
          >
            {tab === "desc" && (
              <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)] lg:gap-10">
                <div className="min-w-0">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Made for everyday moments</p>
                  <div className="min-w-0 space-y-4 break-words [overflow-wrap:anywhere]">
                    {renderDescription(p.desc || "Product details will be available soon.")}
                  </div>
                  {!!p.highlights?.length && (
                    <div className="mt-7">
                      <h3 className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-foreground">Why you’ll love it</h3>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {p.highlights.map((highlight, index) => (
                          <li key={`${index}-${highlight}`} className="flex min-w-0 items-start gap-2.5 rounded-xl border border-border/70 bg-muted/35 px-3.5 py-3 text-xs font-semibold leading-relaxed text-foreground">
                            <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400"/>
                            <span className="break-words">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <aside className="h-fit rounded-2xl bg-[#f3f5ef] p-5 dark:bg-emerald-950/25 sm:p-6">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-300">A little more</span>
                  <h3 className="mt-2 text-lg font-black leading-snug text-foreground">Thoughtful details, from source to doorstep.</h3>
                  <dl className="mt-5 space-y-3">
                    {[
                      ["Condition", p.condition],
                      ["Made in", p.madeIn],
                      ["Manufacturer", p.manufacturer],
                      ["Warranty", p.warranty],
                      ["Dispatch", p.deliveryDays ? `${p.deliveryDays} days` : undefined],
                    ].filter((item): item is [string, string] => Boolean(item[1])).map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-3 border-t border-emerald-900/10 pt-3 dark:border-emerald-100/10">
                        <dt className="text-[10px] font-semibold text-muted-foreground">{label}</dt>
                        <dd className="max-w-[65%] break-words text-right text-[10px] font-bold leading-relaxed text-foreground">{value}</dd>
                      </div>
                    ))}
                    {!p.condition && !p.madeIn && !p.manufacturer && !p.warranty && !p.deliveryDays && (
                      <p className="border-t border-emerald-900/10 pt-3 text-xs leading-relaxed text-muted-foreground dark:border-emerald-100/10">
                        Explore the product specifications for more information about this item.
                      </p>
                    )}
                  </dl>
                </aside>
              </div>
            )}

            {tab === "spec" && (
              p.spec && Object.keys(p.spec).length ? (
                <div>
                  <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">At a glance</p>
                      <h3 className="mt-1 text-lg font-black text-foreground">Product specifications</h3>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">{Object.keys(p.spec).length} key details</span>
                  </div>
                  <dl className="grid overflow-hidden rounded-2xl border border-border sm:grid-cols-2">
                    {Object.entries(p.spec).map(([key, value], index) => (
                      <div key={key} className={`min-w-0 border-border p-4 sm:p-5 ${index > 0 ? "border-t" : ""} ${index % 2 === 1 ? "sm:border-l" : ""} ${index >= 2 ? "sm:border-t" : ""} ${index % 4 === 0 ? "bg-muted/35" : "bg-card"}`}>
                        <dt className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">{key}</dt>
                        <dd className="mt-2 break-words text-sm font-bold leading-relaxed text-foreground [overflow-wrap:anywhere]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  {p.sku && <p className="mt-4 text-[10px] text-muted-foreground">Product code <span className="font-bold text-foreground">{p.sku}</span></p>}
                </div>
              ) : (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-5 text-center">
                  <Package size={28} className="text-emerald-700 dark:text-emerald-400"/>
                  <h3 className="mt-3 text-sm font-black text-foreground">Details are on the way</h3>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">Specifications haven’t been added for this product yet. Check back soon for more information.</p>
                </div>
              )
            )}

            {tab === "reviews" && (p.reviews === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-5 text-center">
                <Star size={27} className="text-amber-400"/>
                <h3 className="mt-3 text-sm font-black text-foreground">Your review could be the first</h3>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">There aren’t any reviews for this product yet. Be the first to share what you think.</p>
              </div>
            ) : (
              <div>
                <div className="grid gap-5 rounded-2xl bg-[#f3f5ef] p-5 dark:bg-emerald-950/25 sm:grid-cols-[minmax(150px,0.65fr)_minmax(0,1.35fr)] sm:items-center sm:p-6">
                  <div className="flex items-center gap-4 sm:block sm:text-center">
                    <div className="text-5xl font-black leading-none tracking-tight text-foreground">{p.rating.toFixed(1)}</div>
                    <div>
                      <Stars r={p.rating}/>
                      <p className="mt-1 text-[10px] font-semibold text-muted-foreground">{p.reviews.toLocaleString("en-IN")} customer reviews</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[5,4,3,2,1].map((rating, index) => (
                      <div key={rating} className="flex items-center gap-2.5">
                        <span className="w-3 text-right text-[10px] font-bold text-muted-foreground">{rating}</span>
                        <Star size={11} className="shrink-0 fill-amber-400 text-amber-400"/>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/80 dark:bg-black/20">
                          <div className="h-full rounded-full bg-emerald-700 dark:bg-emerald-400" style={{ width: `${[75,15,5,3,2][index]}%` }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid gap-3 lg:grid-cols-3">
                  {[
                    { name:"Priya S.", city:"Mumbai", text:"Absolutely beautiful quality! The fabric feels premium and the colour is exactly as shown. Very happy with my purchase.", rating:5 },
                    { name:"Rahul M.", city:"Delhi", text:"Great value for money. Fast delivery within 2 days. Packaging was excellent. Would recommend to everyone!", rating:5 },
                    { name:"Anita K.", city:"Bengaluru", text:"Good product but sizing runs slightly small. Please order one size up. Customer service was helpful though.", rating:4 },
                  ].map(review => (
                    <article key={review.name} className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#075b40] text-xs font-black text-white">{review.name[0]}</div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-foreground">{review.name}</p>
                          <p className="text-[10px] text-muted-foreground">{review.city}</p>
                        </div>
                      </div>
                      <div className="mt-3"><Stars r={review.rating}/></div>
                      <p className="mt-3 flex-1 break-words text-xs leading-relaxed text-foreground/80 [overflow-wrap:anywhere]">{review.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {p.stock === undefined && <>
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
      </>}

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
            {imgs[selImg] && <img src={imgs[selImg]} alt={p.name} className="max-w-full max-h-full object-contain rounded-2xl"/>}
            <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center" onClick={() => setZoom(false)}>
              <X size={20} className="text-white"/>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
