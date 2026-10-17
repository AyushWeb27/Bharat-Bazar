"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, Video, X, Plus, Zap, Bold, Italic, Underline, List, Link2,
  CheckCircle2, AlertCircle, Tag, Percent, Truck, Globe, ShieldCheck,
  Package, IndianRupee, Layers, Warehouse, Settings, FileText,
  ImageIcon, ChevronDown, ListChecks, Clock,
} from "lucide-react";

// ─── Design tokens ───────────────────────────────────────────────────────────
const G = "#009966";

const inp =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all";

const CATEGORIES = [
  "Smartphones","Laptops","Audio","Wearables","Cameras",
  "Accessories","Tablets","Gaming","Speakers","Networking",
];

const SUBCAT_MAP: Record<string, string[]> = {
  Smartphones: ["Android Phones","iPhones","Budget Phones","Premium Phones"],
  Laptops:     ["Gaming Laptops","Business Laptops","Ultrabooks","Budget Laptops"],
  Audio:       ["Wireless Earbuds","Over-ear Headphones","Neckbands","Speakers"],
  Wearables:   ["Smartwatches","Fitness Bands","Smart Glasses"],
  Cameras:     ["DSLR","Mirrorless","Action Cameras","Webcams"],
  Accessories: ["Phone Cases","Chargers","Cables","Screen Guards"],
  Tablets:     ["Android Tablets","iPads","Drawing Tablets"],
  Gaming:      ["Gaming Chairs","Controllers","Gaming Headsets","Gaming Mice"],
  Speakers:    ["Bluetooth Speakers","Home Theatre","Soundbars"],
  Networking:  ["Routers","Switches","Powerline Adapters"],
};

const BRANDS = [
  "Apple","Samsung","OnePlus","boAt","Realme","Xiaomi","Sony","JBL",
  "Noise","Boat","Canon","Nikon","Logitech","HP","Dell","Lenovo","Asus","Acer",
];

const COUNTRIES = [
  "India","USA","China","Germany","Japan","South Korea","UK","France","Italy","Taiwan",
];

// ─── Utility components ───────────────────────────────────────────────────────

function Toggle({
  checked, onChange, label, sublabel,
}: {
  checked: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          checked ? "bg-[#009966]" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function TagInput({
  tags, onChange, placeholder = "Type and press Enter",
}: {
  tags: string[]; onChange: (tags: string[]) => void; placeholder?: string;
}) {
  const [val, setVal] = useState("");
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && val.trim()) {
      e.preventDefault();
      if (!tags.includes(val.trim())) onChange([...tags, val.trim()]);
      setVal("");
    }
  };
  return (
    <div className="flex flex-wrap gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:border-[#009966] focus-within:ring-2 focus-within:ring-[#009966]/20 transition-all min-h-[44px]">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 bg-[#009966]/10 text-[#009966] text-xs font-medium px-2.5 py-1 rounded-full"
        >
          {t}
          <button
            type="button"
            onClick={() => onChange(tags.filter((x) => x !== t))}
            className="hover:text-red-500 transition-colors"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] text-sm outline-none bg-transparent placeholder:text-gray-400"
      />
    </div>
  );
}

function ToolbarTextarea({
  value, onChange, placeholder, rows = 6,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrap = (open: string, close: string) => {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const before = value.slice(0, s);
    const sel = value.slice(s, e);
    const after = value.slice(e);
    onChange(before + open + (sel || "text") + close + after);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(s + open.length, s + open.length + (sel || "text").length);
    }, 0);
  };

  const tools: { icon: React.ReactNode; label: string; action: () => void }[] = [
    { icon: <Bold size={14} />, label: "Bold", action: () => wrap("**", "**") },
    { icon: <Italic size={14} />, label: "Italic", action: () => wrap("_", "_") },
    { icon: <Underline size={14} />, label: "Underline", action: () => wrap("<u>", "</u>") },
    { icon: <List size={14} />, label: "List", action: () => wrap("\n- ", "") },
    { icon: <Link2 size={14} />, label: "Link", action: () => wrap("[", "](url)") },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#009966] focus-within:ring-2 focus-within:ring-[#009966]/20 transition-all">
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            title={t.label}
            onClick={t.action}
            className="p-1.5 rounded-lg text-gray-500 hover:text-[#009966] hover:bg-[#009966]/10 transition-colors"
          >
            {t.icon}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-gray-400 font-medium">Markdown supported</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2.5 text-sm outline-none bg-white resize-none placeholder:text-gray-400"
      />
    </div>
  );
}

function ImageUploadBox({
  label, large = false, preview, onFile, onRemove,
}: {
  label?: string; large?: boolean; preview?: string | null;
  onFile: (f: File) => void; onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onFile(f);
  };

  return (
    <div
      onClick={() => !preview && ref.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      className={`relative border-2 border-dashed rounded-xl flex items-center justify-center transition-all cursor-pointer overflow-hidden
        ${large ? "h-48" : "h-28"}
        ${preview ? "border-[#009966]/40 cursor-default" : drag ? "border-[#009966] bg-[#009966]/5 shadow-lg shadow-[#009966]/10" : "border-gray-200 hover:border-[#009966]/60 hover:bg-[#009966]/5"}`}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      {preview ? (
        <>
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full p-1 shadow text-gray-600 hover:text-red-500 transition-colors"
          >
            <X size={13} />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1.5 text-gray-400 px-3 text-center">
          <div className={`rounded-xl bg-gray-100 flex items-center justify-center ${large ? "w-12 h-12" : "w-9 h-9"}`}>
            <Upload size={large ? 22 : 16} />
          </div>
          {label && <span className="text-xs font-medium text-gray-500">{label}</span>}
          {large && <span className="text-[11px] text-gray-400">PNG, JPG, WebP · Max 5MB</span>}
        </div>
      )}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  num, icon, title, children,
}: {
  num: string; icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-l-4 border-[#009966]">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold text-white" style={{ background: G }}>
          {num}
        </span>
        <span className="text-[#009966] mr-1">{icon}</span>
        <h2 className="text-sm font-semibold text-gray-800 tracking-wide">{title}</h2>
      </div>
      <div className="px-5 pb-5 pt-2 space-y-4">{children}</div>
    </motion.div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Row({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  const grid = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[cols] ?? "grid-cols-2";
  return <div className={`grid ${grid} gap-3`}>{children}</div>;
}

// ─── Variants section ─────────────────────────────────────────────────────────

type SellerVariant = {
  id: number;
  variationType: string;
  title: string;
  price: string;
  offerPrice: string;
  stock: string;
  status: "Active" | "Inactive";
  images: (string | undefined)[];
};

const VARIATION_TYPES = [
  "Color","Size","Storage / RAM","Material","Weight",
  "Volume","Pattern / Print","Style","Flavor","Pack Size","Age Group","Length",
];

function VariantsSection() {
  const [enabled, setEnabled] = useState(false);
  const [variants, setVariants] = useState<SellerVariant[]>([]);
  const [count, setCount] = useState(0);

  const addVariant = () => {
    const id = count + 1;
    setCount(id);
    setVariants(p => [...p, { id, variationType: "", title: "", price: "", offerPrice: "", stock: "", status: "Active", images: Array(4).fill(undefined) }]);
  };

  const update = (id: number, key: string, value: unknown) =>
    setVariants(p => p.map(v => v.id === id ? { ...v, [key]: value } : v));

  const remove = (id: number) => setVariants(p => p.filter(v => v.id !== id));

  const addImg = (id: number, idx: number, file: File) => {
    const url = URL.createObjectURL(file);
    setVariants(p => p.map(v => {
      if (v.id !== id) return v;
      const imgs = [...v.images]; imgs[idx] = url; return { ...v, images: imgs };
    }));
  };

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/60">
        <div>
          <p className="text-sm font-bold text-gray-800">Product Has Variants?</p>
          <p className="text-xs text-gray-400 mt-0.5">Enable to add colors, sizes, storage options, etc.</p>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(e => !e)}
          className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors"
          style={{ background: enabled ? G : "#d1d5db" }}
        >
          <span className="inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform"
            style={{ transform: enabled ? "translateX(16px)" : "translateX(0)" }} />
        </button>
      </div>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-1">
              <AnimatePresence>
                {variants.map((v, idx) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                    className="border border-gray-200 rounded-2xl overflow-hidden"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                          style={{ background: G }}>
                          {idx + 1}
                        </span>
                        <span className="text-sm font-bold text-gray-700">
                          {v.title ? `${v.variationType || "Variant"}: ${v.title}` : v.variationType || `Variant ${idx + 1}`}
                        </span>
                      </div>
                      <button type="button" onClick={() => remove(v.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-all">
                        <X size={13} />
                      </button>
                    </div>

                    {/* Card body */}
                    <div className="p-4 space-y-4">
                      {/* Type + Title */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                            Select Product Variation Type <span className="text-red-500">*</span>
                          </p>
                          <select
                            value={v.variationType}
                            onChange={e => update(v.id, "variationType", e.target.value)}
                            className={`${inp} appearance-none`}
                          >
                            <option value="">Select Type...</option>
                            {VARIATION_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                            Variation Title <span className="text-red-500">*</span>
                          </p>
                          <input
                            value={v.title}
                            onChange={e => update(v.id, "title", e.target.value)}
                            placeholder="e.g., Red, Large"
                            className={inp}
                          />
                        </div>
                      </div>

                      {/* Price + Offer Price + Stock */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                            Price <span className="text-red-500">*</span>
                          </p>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                            <input type="number" value={v.price} onChange={e => update(v.id, "price", e.target.value)}
                              placeholder="0.00" className={`${inp} pl-7`} />
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Offer Price</p>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                            <input type="number" value={v.offerPrice} onChange={e => update(v.id, "offerPrice", e.target.value)}
                              placeholder="0.00" className={`${inp} pl-7`} />
                          </div>
                          {v.price && v.offerPrice && Number(v.offerPrice) < Number(v.price) && (
                            <p className="text-[10px] font-bold mt-1" style={{ color: G }}>
                              {Math.round((1 - Number(v.offerPrice) / Number(v.price)) * 100)}% off
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                            Stock <span className="text-red-500">*</span>
                          </p>
                          <input type="number" value={v.stock} onChange={e => update(v.id, "stock", e.target.value)}
                            placeholder="0" className={inp} />
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">
                          Product Status <span className="text-red-500">*</span>
                        </p>
                        <div className="flex gap-2">
                          {(["Active","Inactive"] as const).map(s => (
                            <button key={s} type="button" onClick={() => update(v.id, "status", s)}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                v.status === s ? "text-[#009966] bg-[#009966]/8" : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"
                              }`}
                              style={v.status === s ? { borderColor: G } : {}}>
                              {v.status === s && (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Variant Images */}
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
                          Product Variant Images (Multiple) <span className="text-red-500">*</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {v.images.map((img, i) => {
                            const iRef = React.createRef<HTMLInputElement>();
                            return (
                              <div key={i} className="relative group">
                                <input ref={iRef} type="file" accept="image/*" className="hidden"
                                  onChange={e => { const f = e.target.files?.[0]; if (f) addImg(v.id, i, f); }} />
                                <div
                                  onClick={() => iRef.current?.click()}
                                  className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
                                    img ? "border-[#009966]/40" : "border-gray-200 hover:border-[#009966] hover:bg-[#009966]/5"
                                  }`}
                                >
                                  {img
                                    ? <img src={img} alt="" className="w-full h-full object-cover" />
                                    : <div className="flex flex-col items-center gap-1 text-gray-300">
                                        <Upload size={16} />
                                        <span className="text-[9px] font-bold">Add</span>
                                      </div>
                                  }
                                </div>
                                {img && (
                                  <button type="button"
                                    onClick={() => { const imgs = [...v.images]; imgs[i] = undefined; update(v.id, "images", imgs); }}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={9} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          <button type="button"
                            onClick={() => update(v.id, "images", [...v.images, undefined])}
                            className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[#009966] hover:text-[#009966] transition-all">
                            <Plus size={16} />
                            <span className="text-[9px] font-bold mt-0.5">More</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add variant button */}
              <button type="button" onClick={addVariant}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-bold text-gray-500 hover:border-[#009966] hover:text-[#009966] hover:bg-[#009966]/5 transition-all">
                <div className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center">
                  <Plus size={13} />
                </div>
                Add Another Variant
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function SellerAddProductPage() {
  // Basic info
  const [name, setName] = useState("");
  const [popular, setPopular] = useState(false);
  const [dealOfDay, setDealOfDay] = useState(false);
  const [shortDesc, setShortDesc] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [fullDesc, setFullDesc] = useState("");

  // Media
  const [mainImg, setMainImg] = useState<string | null>(null);
  const [gallery, setGallery] = useState<(string | null)[]>(Array(6).fill(null));
  const [videoUrl, setVideoUrl] = useState("");

  // Organisation
  const [category, setCategory] = useState("");
  const [subcat, setSubcat] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Pricing
  const [mrp, setMrp] = useState("");
  const [selling, setSelling] = useState("");
  const [cost, setCost] = useState("");

  // Inventory
  const [stock, setStock] = useState("");
  const [lowStock, setLowStock] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [moq, setMoq] = useState("1");
  const [condition, setCondition] = useState("New");

  // Shipping
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [delivery, setDelivery] = useState("");
  const [freeShipping, setFreeShipping] = useState(false);
  const [cod, setCod] = useState(true);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoAlt, setSeoAlt] = useState("");
  const [seoMeta, setSeoMeta] = useState("");

  // Other
  const [manufacturer, setManufacturer] = useState("");
  const [madeIn, setMadeIn] = useState("India");
  const [hsn, setHsn] = useState("");
  const [warrantyPeriod, setWarrantyPeriod] = useState("");
  const [warrantyType, setWarrantyType] = useState("Manufacturer");
  const [fssai, setFssai] = useState("");
  const [maxCart, setMaxCart] = useState("");
  const [taxIncluded, setTaxIncluded] = useState(true);
  const [returnable, setReturnable] = useState(true);
  const [returnDays, setReturnDays] = useState("7");

  // Specifications
  type Spec = { id: number; key: string; value: string };
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [specCount, setSpecCount] = useState(0);

  const addSpec = (key = "", value = "") => {
    const id = specCount + 1;
    setSpecCount(id);
    setSpecs(prev => [...prev, { id, key, value }]);
  };
  const updateSpec = (id: number, field: "key" | "value", val: string) =>
    setSpecs(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  const removeSpec = (id: number) => setSpecs(prev => prev.filter(s => s.id !== id));
  const loadTemplate = (tpl: Array<{ key: string }>) => {
    setSpecCount(tpl.length);
    setSpecs(tpl.map((t, i) => ({ id: i + 1, key: t.key, value: "" })));
  };

  // Sidebar
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);

  const discount =
    mrp && selling && parseFloat(mrp) > parseFloat(selling)
      ? Math.round(((parseFloat(mrp) - parseFloat(selling)) / parseFloat(mrp)) * 100)
      : null;

  const genSku = () => {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    setSku(`SKU-${rand}`);
  };

  const handleGalleryFile = (idx: number, f: File) => {
    const url = URL.createObjectURL(f);
    setGallery((g) => g.map((v, i) => (i === idx ? url : v)));
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-['Plus_Jakarta_Sans']">
      {/* ── Sticky top bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-[20] bg-white/90 backdrop-blur border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
          <span className="truncate">Seller Dashboard</span>
          <ChevronDown size={13} className="rotate-[-90deg] shrink-0" />
          <span className="truncate">Products</span>
          <ChevronDown size={13} className="rotate-[-90deg] shrink-0" />
          <span className="font-semibold text-gray-800 truncate">Add New Product</span>
        </div>
        {name && (
          <span className="hidden sm:inline-block bg-[#009966]/10 text-[#009966] text-xs font-medium px-2.5 py-1 rounded-full truncate max-w-[160px]">
            {name}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-semibold text-amber-600 border border-amber-200 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors flex items-center gap-1.5"
          >
            <Clock size={13} />
            Requests
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">3</span>
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            type="button"
            className="px-4 py-1.5 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-opacity hover:opacity-90"
            style={{ background: G }}
          >
            <CheckCircle2 size={14} />
            Add Product
          </button>
        </div>
      </div>

      {/* ── Layout ────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start px-4 sm:px-6 py-6">
        {/* Main sections */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ── 01 Basic Information ─────────────────────────────── */}
          <Section num="01" icon={<FileText size={16} />} title="Basic Information">
            <div>
              <Label required>Product Name</Label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. boAt Airdopes 141 Wireless Earbuds"
                className={`${inp} text-base font-medium`}
              />
            </div>

            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4">
                <Toggle
                  checked={popular}
                  onChange={setPopular}
                  label="Make Product Popular?"
                  sublabel="Show in Popular Products section on homepage"
                />
              </div>
              <div className="px-4">
                <Toggle
                  checked={dealOfDay}
                  onChange={setDealOfDay}
                  label="Insert to Deal of the Day?"
                  sublabel="Feature this product in daily deals (subject to admin approval)"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label required>Short Description</Label>
                <span className={`text-xs font-medium ${shortDesc.length > 160 ? "text-red-500" : "text-gray-400"}`}>
                  {shortDesc.length}/160
                </span>
              </div>
              <input
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value.slice(0, 160))}
                placeholder="Brief, compelling description shown in listings…"
                className={inp}
              />
            </div>

            <div>
              <Label>Product Highlights</Label>
              <TagInput
                tags={highlights}
                onChange={setHighlights}
                placeholder="Type a highlight and press Enter (e.g. 42hr battery life)"
              />
              <p className="text-[11px] text-gray-400 mt-1.5">Each highlight appears as a bullet point on the product page.</p>
            </div>

            <div>
              <Label>Full Description</Label>
              <ToolbarTextarea
                value={fullDesc}
                onChange={setFullDesc}
                placeholder="Detailed product description with features, specifications and benefits…"
                rows={7}
              />
            </div>
          </Section>

          {/* ── 02 Media ─────────────────────────────────────────── */}
          <Section num="02" icon={<ImageIcon size={16} />} title="Media">
            <div>
              <Label required>Main Product Image</Label>
              <ImageUploadBox
                large
                label="Click or drag to upload main image"
                preview={mainImg}
                onFile={(f) => setMainImg(URL.createObjectURL(f))}
                onRemove={() => setMainImg(null)}
              />
            </div>

            <div>
              <Label>Gallery Images</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {gallery.map((p, i) => (
                  <ImageUploadBox
                    key={i}
                    label={`${i + 1}`}
                    preview={p}
                    onFile={(f) => handleGalleryFile(i, f)}
                    onRemove={() => setGallery((g) => g.map((v, j) => (j === i ? null : v)))}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Product Video URL</Label>
              <div className="relative">
                <Video size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or direct MP4 link"
                  className={`${inp} pl-9`}
                />
              </div>
            </div>
          </Section>

          {/* ── 03 Organisation ──────────────────────────────────── */}
          <Section num="03" icon={<Layers size={16} />} title="Organisation">
            <Row cols={2}>
              <div>
                <Label required>Category</Label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setSubcat(""); }}
                    className={`${inp} appearance-none pr-8`}
                  >
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <Label required>Sub-Category</Label>
                <div className="relative">
                  <select
                    value={subcat}
                    onChange={(e) => setSubcat(e.target.value)}
                    disabled={!category}
                    className={`${inp} appearance-none pr-8 disabled:opacity-50`}
                  >
                    <option value="">Select sub-category…</option>
                    {(SUBCAT_MAP[category] ?? []).map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </Row>

            <div>
              <Label required>Brand</Label>
              <div className="relative">
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className={`${inp} appearance-none pr-8`}>
                  <option value="">Select brand…</option>
                  {BRANDS.map((b) => <option key={b}>{b}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <TagInput
                tags={tags}
                onChange={setTags}
                placeholder="Add searchable tags (e.g. wireless, bluetooth, gaming)"
              />
            </div>
          </Section>

          {/* ── 04 Pricing ───────────────────────────────────────── */}
          <Section num="04" icon={<IndianRupee size={16} />} title="Pricing">
            <Row cols={3}>
              <div>
                <Label required>MRP (₹)</Label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    placeholder="0.00"
                    className={`${inp} pl-8`}
                  />
                </div>
              </div>
              <div>
                <Label required>Selling Price (₹)</Label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={selling}
                    onChange={(e) => setSelling(e.target.value)}
                    placeholder="0.00"
                    className={`${inp} pl-8`}
                  />
                </div>
              </div>
              <div>
                <Label>Cost / Purchase Price (₹)</Label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0.00"
                    className={`${inp} pl-8`}
                  />
                </div>
              </div>
            </Row>

            <AnimatePresence>
              {discount !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
                >
                  <div className="w-9 h-9 rounded-full bg-[#009966] flex items-center justify-center shrink-0">
                    <Percent size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#009966]">{discount}% off</p>
                    <p className="text-xs text-gray-500">
                      Customer saves ₹{(parseFloat(mrp) - parseFloat(selling)).toFixed(2)} on this product
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* ── 05 Inventory ─────────────────────────────────────── */}
          <Section num="05" icon={<Warehouse size={16} />} title="Inventory">
            <Row cols={2}>
              <div>
                <Label required>Stock Quantity</Label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g. 100"
                  className={inp}
                />
              </div>
              <div>
                <Label>Low Stock Alert (units)</Label>
                <input
                  type="number"
                  value={lowStock}
                  onChange={(e) => setLowStock(e.target.value)}
                  placeholder="e.g. 10"
                  className={inp}
                />
              </div>
            </Row>

            <Row cols={2}>
              <div>
                <Label>SKU</Label>
                <div className="flex gap-2">
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SKU-XXXXXX"
                    className={`${inp} font-mono`}
                  />
                  <button
                    type="button"
                    onClick={genSku}
                    title="Auto-generate SKU"
                    className="shrink-0 px-2.5 border border-gray-200 rounded-xl hover:bg-[#009966]/5 hover:border-[#009966]/40 transition-colors text-gray-500 hover:text-[#009966]"
                  >
                    <Zap size={15} />
                  </button>
                </div>
              </div>
              <div>
                <Label>Barcode / EAN</Label>
                <input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g. 8901234567890"
                  className={`${inp} font-mono`}
                />
              </div>
            </Row>

            <Row cols={2}>
              <div>
                <Label>Minimum Order Qty (MOQ)</Label>
                <input
                  type="number"
                  min="1"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  className={inp}
                />
              </div>
              <div>
                <Label>Product Condition</Label>
                <div className="relative">
                  <select value={condition} onChange={(e) => setCondition(e.target.value)} className={`${inp} appearance-none pr-8`}>
                    {["New","Refurbished","Open Box","Used – Like New","Used – Good"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </Row>
          </Section>

          {/* ── 06 Variants ──────────────────────────────────────── */}
          <Section num="06" icon={<Package size={16} />} title="Product Variants">
            <VariantsSection />
          </Section>

          {/* ── 07 Shipping & Delivery ───────────────────────────── */}
          <Section num="07" icon={<Truck size={16} />} title="Shipping & Delivery">
            <Row cols={4}>
              <div>
                <Label>Weight (kg)</Label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.00" className={inp} />
              </div>
              <div>
                <Label>Length (cm)</Label>
                <input type="number" value={length} onChange={(e) => setLength(e.target.value)} placeholder="0" className={inp} />
              </div>
              <div>
                <Label>Width (cm)</Label>
                <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="0" className={inp} />
              </div>
              <div>
                <Label>Height (cm)</Label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="0" className={inp} />
              </div>
            </Row>

            <div>
              <Label>Estimated Delivery Time</Label>
              <div className="relative">
                <select value={delivery} onChange={(e) => setDelivery(e.target.value)} className={`${inp} appearance-none pr-8`}>
                  <option value="">Select estimate…</option>
                  {["Same Day","Next Day","2–3 Days","3–5 Days","5–7 Days","7–10 Days"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4">
                <Toggle
                  checked={freeShipping}
                  onChange={setFreeShipping}
                  label="Free Shipping"
                  sublabel="Customer pays no delivery charges"
                />
              </div>
              <div className="px-4">
                <Toggle
                  checked={cod}
                  onChange={setCod}
                  label="Cash on Delivery (COD)"
                  sublabel="Allow payment at doorstep"
                />
              </div>
            </div>
          </Section>

          {/* ── 08 SEO ───────────────────────────────────────────── */}
          <Section num="08" icon={<Globe size={16} />} title="SEO Content">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>SEO Title</Label>
                <span className={`text-xs font-medium ${seoTitle.length > 70 ? "text-red-500" : "text-gray-400"}`}>
                  {seoTitle.length}/70
                </span>
              </div>
              <input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value.slice(0, 70))}
                placeholder="SEO-optimised page title…"
                className={inp}
              />
            </div>

            <div>
              <Label>SEO Keywords</Label>
              <input
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="e.g. wireless earbuds, bluetooth earphones India"
                className={inp}
              />
            </div>

            <div>
              <Label>Image Alt Text</Label>
              <input
                value={seoAlt}
                onChange={(e) => setSeoAlt(e.target.value)}
                placeholder="Describe the main image for screen readers…"
                className={inp}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Meta Description</Label>
                <span className={`text-xs font-medium ${seoMeta.length > 170 ? "text-red-500" : "text-gray-400"}`}>
                  {seoMeta.length}/170
                </span>
              </div>
              <textarea
                value={seoMeta}
                onChange={(e) => setSeoMeta(e.target.value.slice(0, 170))}
                rows={3}
                placeholder="Compelling description shown in Google search results…"
                className={`${inp} resize-none`}
              />
            </div>
          </Section>

          {/* ── 09 Other Details ─────────────────────────────────── */}
          <Section num="09" icon={<Settings size={16} />} title="Other Details">
            <Row cols={2}>
              <div>
                <Label>Manufacturer Name</Label>
                <input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="e.g. boAt Lifestyle Pvt. Ltd." className={inp} />
              </div>
              <div>
                <Label>Made In</Label>
                <div className="relative">
                  <select value={madeIn} onChange={(e) => setMadeIn(e.target.value)} className={`${inp} appearance-none pr-8`}>
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </Row>

            <Row cols={2}>
              <div>
                <Label>HSN Code</Label>
                <input value={hsn} onChange={(e) => setHsn(e.target.value)} placeholder="e.g. 8518300000" className={`${inp} font-mono`} />
              </div>
              <div>
                <Label>Max Cart Quantity</Label>
                <input type="number" value={maxCart} onChange={(e) => setMaxCart(e.target.value)} placeholder="e.g. 5" className={inp} />
              </div>
            </Row>

            <Row cols={2}>
              <div>
                <Label>Warranty Period</Label>
                <input value={warrantyPeriod} onChange={(e) => setWarrantyPeriod(e.target.value)} placeholder="e.g. 1 Year" className={inp} />
              </div>
              <div>
                <Label>Warranty Type</Label>
                <div className="relative">
                  <select value={warrantyType} onChange={(e) => setWarrantyType(e.target.value)} className={`${inp} appearance-none pr-8`}>
                    {["Manufacturer","Seller","Brand","No Warranty"].map((w) => <option key={w}>{w}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </Row>

            <div>
              <Label>FSSAI License No. <span className="normal-case font-normal text-gray-400">(if food/beverage)</span></Label>
              <input value={fssai} onChange={(e) => setFssai(e.target.value)} placeholder="e.g. 10019022012345" className={`${inp} font-mono`} />
            </div>

            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4">
                <Toggle
                  checked={taxIncluded}
                  onChange={setTaxIncluded}
                  label="Tax Included in Price"
                  sublabel="MRP already includes applicable GST"
                />
              </div>
              <div className="px-4">
                <Toggle
                  checked={returnable}
                  onChange={setReturnable}
                  label="Is Returnable?"
                  sublabel="Customers can initiate a return request"
                />
              </div>
            </div>

            <AnimatePresence>
              {returnable && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Label>Max Return Days</Label>
                  <div className="relative">
                    <select value={returnDays} onChange={(e) => setReturnDays(e.target.value)} className={`${inp} appearance-none pr-8`}>
                      {["3","5","7","10","14","30"].map((d) => (
                        <option key={d} value={d}>{d} days</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* ── 10 Specifications ────────────────────────────────── */}
          <Section num="10" icon={<ListChecks size={16} />} title="Specifications">
            {/* Template quick-fill chips */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Quick-fill template</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "📱 Electronics", tpl: [
                    { key: "Brand" }, { key: "Model" }, { key: "Color" }, { key: "RAM" },
                    { key: "Storage" }, { key: "Display" }, { key: "Battery" }, { key: "OS" },
                    { key: "Processor" }, { key: "Camera" }, { key: "Connectivity" }, { key: "Warranty" },
                  ]},
                  { label: "👗 Fashion", tpl: [
                    { key: "Material" }, { key: "Fit" }, { key: "Care" },
                    { key: "Size Range" }, { key: "Pattern" }, { key: "Occasion" },
                  ]},
                  { label: "🏠 Home & Living", tpl: [
                    { key: "Material" }, { key: "Dimensions" }, { key: "Weight" },
                    { key: "Color" }, { key: "Capacity" }, { key: "Warranty" },
                  ]},
                  { label: "🛒 Grocery", tpl: [
                    { key: "Net Weight" }, { key: "Ingredients" }, { key: "Allergens" },
                    { key: "Storage" }, { key: "Shelf Life" }, { key: "Country of Origin" },
                  ]},
                  { label: "⚽ Sports", tpl: [
                    { key: "Material" }, { key: "Size" }, { key: "Weight" },
                    { key: "Sport Type" }, { key: "Warranty" },
                  ]},
                ].map(({ label, tpl }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => loadTemplate(tpl)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:border-[#009966] hover:text-[#009966] hover:bg-[#009966]/5 transition-all"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spec rows */}
            {specs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 text-center">
                <ListChecks size={28} className="text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-400">No specifications yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Use a template above or add manually</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1fr_1fr_32px] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Specification</p>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Value</p>
                  <span />
                </div>
                {specs.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className={`grid grid-cols-[1fr_1fr_32px] gap-3 px-4 py-2.5 items-center ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} border-b border-gray-100 last:border-b-0`}
                  >
                    <input
                      value={s.key}
                      onChange={e => updateSpec(s.id, "key", e.target.value)}
                      placeholder="e.g. Brand"
                      className="text-sm text-gray-800 bg-transparent outline-none border-b border-transparent focus:border-[#009966] transition-colors placeholder:text-gray-300 w-full"
                    />
                    <input
                      value={s.value}
                      onChange={e => updateSpec(s.id, "value", e.target.value)}
                      placeholder="e.g. Apple"
                      className="text-sm text-gray-700 bg-transparent outline-none border-b border-transparent focus:border-[#009966] transition-colors placeholder:text-gray-300 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpec(s.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <X size={13} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add row button */}
            <button
              type="button"
              onClick={() => addSpec()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:border-[#009966] hover:text-[#009966] hover:bg-[#009966]/5 transition-all"
            >
              <Plus size={14} /> Add Specification
            </button>
          </Section>

          {/* Bottom submit */}
          <div className="pb-6 flex items-center justify-end gap-3">
            <button
              type="button"
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center gap-2 shadow transition-opacity hover:opacity-90"
              style={{ background: G }}
            >
              <CheckCircle2 size={16} />
              Add Product
            </button>
          </div>
        </div>

        {/* ── Right Sidebar ────────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-[72px]">

          {/* Status card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-l-4 border-[#009966]">
              <ShieldCheck size={16} style={{ color: G }} />
              <h3 className="text-sm font-semibold text-gray-800">Product Status</h3>
            </div>
            <div className="px-4 pb-4 pt-1 space-y-1 divide-y divide-gray-100">
              <Toggle
                checked={active}
                onChange={setActive}
                label="Active / Visible"
                sublabel="Product visible to customers"
              />
              <Toggle
                checked={featured}
                onChange={setFeatured}
                label="Featured Product"
                sublabel="Highlight in featured section"
              />
            </div>
          </div>

          {/* Store info card */}
          <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "#0d1117" }}>
            <div className="px-4 py-3.5 border-b border-white/10 flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: G }}
              >
                RS
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">Ravi Electro Hub</p>
                <p className="text-[11px] text-gray-400">Your store</p>
              </div>
            </div>
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Products listed</span>
                <span className="text-xs font-bold text-white">47</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Account status</span>
                <span className="text-xs font-semibold flex items-center gap-1" style={{ color: G }}>
                  <CheckCircle2 size={12} /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Store rating</span>
                <span className="text-xs font-bold text-yellow-400">★ 4.8</span>
              </div>
            </div>
          </div>

          {/* Publish card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-l-4 border-[#009966]">
              <Tag size={16} style={{ color: G }} />
              <h3 className="text-sm font-semibold text-gray-800">Publish</h3>
            </div>
            <div className="px-4 pb-4 space-y-3">
              <button
                type="button"
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 shadow transition-opacity hover:opacity-90"
                style={{ background: G }}
              >
                <CheckCircle2 size={15} />
                Add Product
              </button>
            </div>
          </div>

          {/* Quick checklist */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-l-4 border-[#009966]">
              <CheckCircle2 size={16} style={{ color: G }} />
              <h3 className="text-sm font-semibold text-gray-800">Listing Checklist</h3>
            </div>
            <div className="px-4 pb-4 space-y-2.5">
              {[
                { label: "Product name", done: name.length > 3 },
                { label: "Short description", done: shortDesc.length > 10 },
                { label: "Main image", done: !!mainImg },
                { label: "Category selected", done: !!category },
                { label: "MRP & Selling Price", done: !!(mrp && selling) },
                { label: "Stock quantity", done: !!stock },
                { label: "SEO title", done: seoTitle.length > 5 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      item.done ? "bg-[#009966]" : "bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {item.done && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <span className={`text-xs transition-colors ${item.done ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                    {item.label}
                  </span>
                </div>
              ))}

              {/* Progress bar */}
              {(() => {
                const items = [
                  name.length > 3, shortDesc.length > 10, !!mainImg,
                  !!category, !!(mrp && selling), !!stock, seoTitle.length > 5,
                ];
                const pct = Math.round((items.filter(Boolean).length / items.length) * 100);
                return (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-gray-500 font-medium">Completion</span>
                      <span className="text-[11px] font-bold" style={{ color: G }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4 }}
                        className="h-full rounded-full"
                        style={{ background: G }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerAddProductPage;
