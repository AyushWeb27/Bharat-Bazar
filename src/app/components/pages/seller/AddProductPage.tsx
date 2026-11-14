"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bold, Italic, Underline, List, Link2, Video,
  Upload, X, Plus, Zap, CheckCircle2, ChevronRight,
  Package, Image as ImageIcon, Grid3x3, Tag,
  DollarSign, BarChart3, Layers, Truck, Search as SearchIcon,
  FileText, Info, Star, Eye, ShoppingBag, ListChecks,
  AlertCircle, ShieldCheck, Send, Check, RefreshCw,
} from "lucide-react";

// ─────────────────────────────────────────────
// Design tokens & Constants (Exact match to Admin)
// ─────────────────────────────────────────────
const G  = "#009966";
const GD = "#007a52";

const inp =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all bg-white";

const fmt  = (n: number) => "₹" + n.toLocaleString("en-IN");
const disc = (mrp: number, price: number) => (mrp > price && mrp > 0 ? Math.round((1 - price / mrp) * 100) : 0);

const COUNTRIES = [
  "India", "USA", "China", "Germany", "Japan",
  "South Korea", "UK", "France", "Italy", "Taiwan",
];

const DELIVERY_OPTIONS = [
  { v: "1-2", l: "1–2 Business Days" },
  { v: "2-3", l: "2–3 Business Days" },
  { v: "3-5", l: "3–5 Business Days" },
  { v: "5-7", l: "5–7 Business Days" },
];

const WARRANTY_TYPES = ["Manufacturer", "Seller", "Brand", "None"];

const GST_RATES = [
  { slab: 0,  label: "0% — GST Exempted",               type: "GST", category: "Exempt" },
  { slab: 5,  label: "5% — Essential Goods",            type: "GST", category: "Essential" },
  { slab: 12, label: "12% — Standard Rate (Tier 1)",    type: "GST", category: "Standard" },
  { slab: 18, label: "18% — Standard Goods & Services", type: "GST", category: "Standard" },
  { slab: 28, label: "28% — Luxury / High Value",       type: "GST", category: "Luxury" },
];

const SPEC_TEMPLATES: Record<string, Array<{ key: string; placeholder: string }>> = {
  Electronics: [
    { key: "Brand", placeholder: "e.g. Apple, Samsung" },
    { key: "Model", placeholder: "e.g. iPhone 15 Pro Max" },
    { key: "Color", placeholder: "e.g. Space Black, Natural Titanium" },
    { key: "RAM", placeholder: "e.g. 8 GB" },
    { key: "Storage", placeholder: "e.g. 256 GB" },
    { key: "Display", placeholder: "e.g. 6.7 inch OLED" },
    { key: "Battery", placeholder: "e.g. 4422 mAh" },
    { key: "OS", placeholder: "e.g. iOS 17" },
    { key: "Processor", placeholder: "e.g. A17 Pro" },
    { key: "Camera", placeholder: "e.g. 48MP + 12MP + 12MP" },
    { key: "Connectivity", placeholder: "e.g. 5G, WiFi 6E, Bluetooth 5.3" },
    { key: "Water Resistance", placeholder: "e.g. IP68" },
    { key: "Warranty", placeholder: "e.g. 1 Year Manufacturer" },
  ],
  Fashion: [
    { key: "Material", placeholder: "e.g. 100% Cotton" },
    { key: "Fit", placeholder: "e.g. Regular Fit" },
    { key: "Care", placeholder: "e.g. Machine washable" },
    { key: "Size Range", placeholder: "e.g. XS–4XL" },
    { key: "Pattern", placeholder: "e.g. Solid, Printed" },
    { key: "Occasion", placeholder: "e.g. Casual, Formal" },
    { key: "Closure", placeholder: "e.g. Button, Zipper" },
  ],
  "Home & Living": [
    { key: "Material", placeholder: "e.g. Stainless Steel" },
    { key: "Dimensions", placeholder: "e.g. 30 × 20 × 15 cm" },
    { key: "Weight", placeholder: "e.g. 1.2 kg" },
    { key: "Color", placeholder: "e.g. Silver" },
    { key: "Capacity", placeholder: "e.g. 5 Litre" },
    { key: "Warranty", placeholder: "e.g. 2 Years" },
  ],
  Grocery: [
    { key: "Net Weight", placeholder: "e.g. 500g, 1kg" },
    { key: "Ingredients", placeholder: "e.g. Basmati Rice" },
    { key: "Allergens", placeholder: "e.g. Contains nuts" },
    { key: "Storage", placeholder: "e.g. Store in cool dry place" },
    { key: "Shelf Life", placeholder: "e.g. 12 months" },
    { key: "Country of Origin", placeholder: "e.g. India" },
  ],
  Sports: [
    { key: "Material", placeholder: "e.g. Synthetic leather" },
    { key: "Size", placeholder: "e.g. UK 8, EU 42" },
    { key: "Weight", placeholder: "e.g. 280g" },
    { key: "Sport Type", placeholder: "e.g. Running, Cricket" },
    { key: "Warranty", placeholder: "e.g. 6 Months" },
  ],
};

const SECTIONS = [
  { id: "section-01", num: "01", label: "Basic Info",    icon: Package     },
  { id: "section-02", num: "02", label: "Media",         icon: ImageIcon   },
  { id: "section-03", num: "03", label: "Organisation",  icon: Grid3x3     },
  { id: "section-04", num: "04", label: "Pricing",       icon: DollarSign  },
  { id: "section-05", num: "05", label: "Inventory",     icon: BarChart3   },
  { id: "section-06", num: "06", label: "Variants",      icon: Layers      },
  { id: "section-07", num: "07", label: "Shipping",      icon: Truck       },
  { id: "section-08", num: "08", label: "SEO",           icon: SearchIcon  },
  { id: "section-09", num: "09", label: "Other Details", icon: FileText    },
  { id: "section-10", num: "10", label: "Specifications", icon: ListChecks },
];

// ─────────────────────────────────────────────
// UI Components matching Admin AddProductPage exactly
// ─────────────────────────────────────────────
function SectionBadge({ num }: { num: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-black text-white shrink-0"
      style={{ background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)` }}
    >
      {num}
    </span>
  );
}

function SectionCard({
  id, num, title, icon: Icon, children,
}: {
  id: string; num: string; title: string;
  icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-[80px]"
    >
      {/* header with left green border accent */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 border-l-2"
        style={{ borderLeftColor: G }}
      >
        <SectionBadge num={num} />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon size={15} className="text-gray-400 shrink-0" />
          <h2 className="text-sm font-black text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">{title}</h2>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label, hint, required, children,
}: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[10px] text-gray-400 font-medium">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  on, onChange,
}: {
  on: boolean; onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer"
      style={{ background: on ? G : "#d1d5db" }}
    >
      <span
        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200"
        style={{ transform: on ? "translateX(16px)" : "translateX(0)" }}
      />
    </button>
  );
}

function ChipInput({
  value, onChange, placeholder,
}: {
  value: string[]; onChange: (v: string[]) => void; placeholder: string;
}) {
  const [text, setText] = useState("");
  const add = () => {
    const v = text.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setText("");
  };
  const remove = (t: string) => onChange(value.filter(c => c !== t));
  return (
    <div
      className={`${inp} !py-1.5 flex flex-wrap gap-1.5 min-h-[42px] cursor-text`}
      onClick={e => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}
    >
      {value.map(chip => (
        <span
          key={chip}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold"
          style={{ background: `${G}15`, color: GD }}
        >
          {chip}
          <button
            type="button"
            onClick={() => remove(chip)}
            className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
          >
            <X size={9} />
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 py-0.5"
      />
    </div>
  );
}

function UploadZone({
  preview, onFile, small, label,
}: {
  preview?: string; onFile: (f: File) => void; small?: boolean; label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className={`relative border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer transition-all group hover:border-[#009966] hover:shadow-[0_0_0_4px_rgba(0,153,102,0.08)] overflow-hidden ${small ? "h-28" : "h-48"}`}
      onClick={() => ref.current?.click()}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*,.jpg,.jpeg"
        className="hidden"
        onClick={e => e.stopPropagation()}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#009966] transition-colors p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#009966]/10 flex items-center justify-center transition-colors">
            <Upload size={16} />
          </div>
          {!small && <p className="text-xs font-bold text-gray-700">{label ?? "Click to upload"}</p>}
          {!small && <p className="text-[10px] text-gray-400">Image files — max 5MB</p>}
        </div>
      )}
      {preview && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
            <Upload size={13} className="text-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type CategoryOption = {
  id: number;
  name: string;
  slug: string;
  emoji: string;
  subcategories: { id: number; name: string; slug: string; emoji: string }[];
};

type BrandOption = {
  id: number;
  name: string;
  slug: string;
  category: string;
  categories?: string[];
  countryFlag?: string;
};

type ProductVariant = {
  id: number;
  variationType: string;
  title: string;
  price: string;
  offerPrice: string;
  stock: string;
  status: "Active" | "Inactive";
  images: (string | undefined)[];
};

type Spec = { id: number; key: string; value: string };

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function SellerAddProductPage({
  isVerified = false,
  onBack,
}: {
  isVerified?: boolean;
  onBack?: () => void;
}) {
  const [verifiedSeller, setVerifiedSeller] = useState<boolean>(isVerified);

  useEffect(() => {
    setVerifiedSeller(isVerified);
  }, [isVerified]);

  // Real-time verification lookup from database session
  useEffect(() => {
    let active = true;
    async function checkStatus() {
      try {
        const res = await fetch("/api/seller/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (active && data.success && data.seller) {
          const s = (data.seller.status || "").toLowerCase();
          const k = (data.seller.kyc_status || "").toLowerCase();
          const isV = s === "active" || s === "approved" || k === "approved";
          setVerifiedSeller(isV);
        }
      } catch {
        // Fallback to prop
      }
    }
    checkStatus();
    return () => {
      active = false;
    };
  }, []);

  // ── Database Options ─────────────────────────
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, bRes] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/brands", { cache: "no-store" }),
        ]);
        const cData = await cRes.json();
        const bData = await bRes.json();
        if (cData.success) setCategories(cData.categories || []);
        if (bData.success) setBrands(bData.brands || []);
      } catch (e) {
        console.error("Failed to fetch categories/brands:", e);
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadData();
  }, []);

  // ── 01 Basic Info ───────────────────────────
  const [name, setName]                     = useState("");
  const [isPopular, setIsPopular]           = useState(false);
  const [isDeal, setIsDeal]                 = useState(false);
  const [shortDesc, setShortDesc]           = useState("");
  const [highlights, setHighlights]         = useState<string[]>([]);
  const [fullDesc, setFullDesc]             = useState("");

  // ── 02 Media ────────────────────────────────
  const [mainImg, setMainImg]               = useState<string>("");
  const [gallery, setGallery]               = useState<Array<string | undefined>>([]);
  const [videoUrl, setVideoUrl]             = useState("");
  const [videoFile, setVideoFile]           = useState<File | null>(null);
  const galleryInputRef                     = useRef<HTMLInputElement>(null);
  const videoInputRef                       = useRef<HTMLInputElement>(null);

  const addGalleryFiles = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        if (typeof e.target?.result === "string") {
          setGallery(prev => [...prev, e.target?.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  // ── 03 Organisation ─────────────────────────
  const [category, setCategory]             = useState("");
  const [subcat, setSubcat]                 = useState("");
  const [brand, setBrand]                   = useState("");
  const [tags, setTags]                     = useState<string[]>([]);

  const filteredSubcats = useMemo(() => {
    const found = categories.find(c => c.name === category);
    return found?.subcategories || [];
  }, [categories, category]);

  const filteredBrands = useMemo(() => {
    if (!category) return brands;
    const catLower = category.toLowerCase();
    return brands.filter(
      b =>
        (b.categories && b.categories.some(c => c.toLowerCase() === catLower)) ||
        b.category.toLowerCase() === catLower ||
        b.category.toLowerCase() === "all" ||
        b.category.toLowerCase() === "general"
    );
  }, [brands, category]);

  // ── 04 Pricing ──────────────────────────────
  const [mrp, setMrp]                       = useState("");
  const [selling, setSelling]               = useState("");
  const [cost, setCost]                     = useState("");
  const [taxRuleIdx, setTaxRuleIdx]         = useState("3"); // Default 18%

  const mrpN  = parseFloat(mrp) || 0;
  const sellN = parseFloat(selling) || 0;
  const costN = parseFloat(cost) || 0;

  const discPct = disc(mrpN, sellN);
  const saving  = mrpN > sellN ? mrpN - sellN : 0;

  const selectedTax = GST_RATES[parseInt(taxRuleIdx, 10)] || GST_RATES[3];
  const taxAmount   = Math.round(((sellN * selectedTax.slab / 100) + Number.EPSILON) * 100) / 100;
  const priceWithTax = Math.round(((sellN + taxAmount) + Number.EPSILON) * 100) / 100;

  // ── 05 Inventory ────────────────────────────
  const [stock, setStock]                   = useState("");
  const [lowAlert, setLowAlert]             = useState("");
  const [sku, setSku]                       = useState("");
  const [barcode, setBarcode]               = useState("");
  const [moq, setMoq]                       = useState("1");
  const [condition, setCondition]           = useState("New");

  const autoSku = () => {
    const prefix = category ? category.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() : "BB";
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    setSku(`${prefix}-${rand}`);
  };

  // ── 06 Variants ─────────────────────────────
  const [hasVariants, setHasVariants]       = useState(false);
  const [variants, setVariants]             = useState<ProductVariant[]>([]);
  const [vCount, setVCount]                 = useState(1);

  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      {
        id: vCount,
        variationType: "Size",
        title: "",
        price: mrp || "",
        offerPrice: selling || "",
        stock: "10",
        status: "Active",
        images: [undefined],
      },
    ]);
    setVCount(c => c + 1);
  };

  const removeVariant = (id: number) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const updateVariant = (id: number, field: keyof ProductVariant, val: unknown) => {
    setVariants(prev => prev.map(v => (v.id === id ? { ...v, [field]: val } : v)));
  };

  const addVariantImg = (variantId: number, index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      if (typeof e.target?.result === "string") {
        setVariants(prev =>
          prev.map(v => {
            if (v.id !== variantId) return v;
            const imgs = [...v.images];
            imgs[index] = e.target?.result as string;
            return { ...v, images: imgs };
          })
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // ── 07 Shipping ─────────────────────────────
  const [weight, setWeight]                 = useState("");
  const [dimL, setDimL]                     = useState("");
  const [dimW, setDimW]                     = useState("");
  const [dimH, setDimH]                     = useState("");
  const [delivery, setDelivery]             = useState("3-5");
  const [freeShip, setFreeShip]             = useState(false);
  const [cod, setCod]                       = useState(true);

  // ── 08 SEO ──────────────────────────────────
  const [seoTitle, setSeoTitle]             = useState("");
  const [seoKw, setSeoKw]                   = useState("");
  const [seoAlt, setSeoAlt]                 = useState("");
  const [seoMeta, setSeoMeta]               = useState("");

  // ── 09 Other Details ────────────────────────
  const [manufacturer, setManufacturer]     = useState("");
  const [madeIn, setMadeIn]                 = useState("India");
  const [hsn, setHsn]                       = useState("");
  const [warranty, setWarranty]             = useState("");
  const [warrantyType, setWarrantyType]     = useState("Manufacturer");
  const [fssai, setFssai]                   = useState("");
  const [maxCart, setMaxCart]               = useState("");
  const [returnable, setReturnable]         = useState(true);
  const [returnDays, setReturnDays]         = useState("7");

  // ── 10 Specifications ───────────────────────
  const [specs, setSpecs]                   = useState<Spec[]>([]);
  const [specCount, setSpecCount]           = useState(1);

  const addSpec = (key = "", value = "") => {
    setSpecs(prev => [...prev, { id: specCount, key, value }]);
    setSpecCount(c => c + 1);
  };

  const updateSpec = (id: number, field: "key" | "value", val: string) => {
    setSpecs(prev => prev.map(s => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const removeSpec = (id: number) => {
    setSpecs(prev => prev.filter(s => s.id !== id));
  };

  const loadTemplate = (cat: string) => {
    const tpl = SPEC_TEMPLATES[cat];
    if (!tpl) return;
    setSpecs(tpl.map((t, i) => ({ id: i + 1, key: t.key, value: "" })));
    setSpecCount(tpl.length + 1);
  };

  // ── Status / Submit State ───────────────────
  const [active, setActive]                 = useState(true);
  const [featured, setFeatured]             = useState(false);
  const [isSaving, setIsSaving]             = useState(false);
  const [formMessage, setFormMessage]       = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Scroll Spy ──────────────────────────────
  const [activeSection, setActiveSection]   = useState("section-01");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Save Draft, Submit as Request, or Direct Publish ──
  const saveProduct = async (action: "draft" | "request" | "publish" = "request") => {
    if (!name.trim()) {
      setFormMessage({ type: "error", text: "Product Name is required." });
      scrollTo("section-01");
      return;
    }

    if ((action === "request" || action === "publish") && (!category || !selling || !mainImg)) {
      setFormMessage({
        type: "error",
        text: `To ${action === "publish" ? "publish the product live" : "submit as a Request"}, please fill Category, Selling Price, and Main Image.`,
      });
      if (!mainImg) scrollTo("section-02");
      else if (!category) scrollTo("section-03");
      else scrollTo("section-04");
      return;
    }

    setIsSaving(true);
    setFormMessage(null);

    try {
      const payload = {
        action,
        isPublish: action === "publish",
        isRequest: action === "request",
        name: name.trim(),
        shortDescription: shortDesc.trim(),
        fullDescription: fullDesc.trim(),
        category,
        subcategory: subcat,
        brand,
        mrp: mrpN || null,
        sellingPrice: sellN || null,
        costPrice: costN || null,
        stock: parseInt(stock, 10) || 0,
        lowStockAlert: parseInt(lowAlert, 10) || 0,
        sku: sku.trim() || undefined,
        barcode: barcode.trim(),
        videoUrl: videoUrl.trim(),
        mainImageUrl: mainImg || null,
        gallery: gallery.filter(Boolean),
        isPopular,
        isDeal,
        featured,
        condition,
        moq: parseInt(moq, 10) || 1,
        highlights,
        tags,
        taxRule: { rate: selectedTax.slab },
        weight,
        dimL,
        dimW,
        dimH,
        deliveryTime: delivery,
        freeShipping: freeShip,
        cod,
        seoTitle: seoTitle || name,
        seoKeywords: seoKw,
        seoAlt: seoAlt || name,
        seoMeta: seoMeta || shortDesc,
        manufacturer,
        madeIn,
        hsn,
        warrantyPeriod: warranty,
        warrantyType,
        fssai,
        maxCart,
        returnable,
        returnDays,
        specifications: specs.filter(s => s.key.trim() && s.value.trim()),
        variants: hasVariants ? variants : [],
      };

      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setFormMessage({
          type: "success",
          text: action === "publish"
            ? "Product published directly to BharatBazar store! Status: Active & Live in marketplace."
            : action === "request"
            ? "Product submitted for Admin Approval successfully! Status: Under Review."
            : "Product saved as draft successfully!",
        });
      } else {
        setFormMessage({
          type: "error",
          text: data.message || "Failed to save product.",
        });
      }
    } catch (err) {
      console.error("Save product error:", err);
      setFormMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ── Sticky Top Action Bar (Exact match to Admin) ── */}
      <div className="sticky top-0 z-[20] bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${G}15` }}
            >
              <ShoppingBag size={13} style={{ color: G }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                BharatBazar · Seller Hub
              </p>
              <p className="text-sm font-black text-gray-900 truncate font-['Plus_Jakarta_Sans']">
                {name.trim() || <span className="text-gray-400 font-normal">New Product</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                disabled={isSaving}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-black text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Back
              </button>
            )}

            {/* Condition pill */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
              {condition}
            </span>

            {/* Verified Seller status indicator */}
            {verifiedSeller && (
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} className="text-emerald-600" />
                Verified Seller
              </span>
            )}

            {/* Save Draft Button */}
            <button
              type="button"
              onClick={() => saveProduct("draft")}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-black text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? "Saving…" : "Save Draft"}
            </button>

            {/* Submit as Request Button */}
            <button
              type="button"
              onClick={() => saveProduct("request")}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-60 cursor-pointer ${
                verifiedSeller
                  ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "text-white shadow-sm hover:opacity-90"
              }`}
              style={!verifiedSeller ? { background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)` } : {}}
            >
              <Send size={12} />
              <span>{isSaving ? "Submitting…" : "Submit as Request"}</span>
            </button>

            {/* Publish Product Button (Only for Verified Sellers) */}
            {verifiedSeller && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => saveProduct("publish")}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)` }}
              >
                <CheckCircle2 size={13} />
                <span>{isSaving ? "Publishing…" : "Publish Product"}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* ── Status Message Banner ── */}
      {formMessage && (
        <div
          role={formMessage.type === "error" ? "alert" : "status"}
          className={`max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 text-sm font-semibold ${
            formMessage.type === "error" ? "text-red-700" : "text-[#007a52]"
          }`}
        >
          <div
            className={`rounded-xl px-4 py-3 border flex items-center justify-between gap-3 ${
              formMessage.type === "error"
                ? "border-red-200 bg-red-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <span>{formMessage.text}</span>
            <button
              type="button"
              onClick={() => setFormMessage(null)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Three-column Grid (Exact Admin Architecture - Visible on lg & xl) ── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="lg:grid lg:grid-cols-[200px_1fr_270px] xl:grid-cols-[220px_1fr_280px] gap-6 items-start">

          {/* ════════════════════════════════════
              LEFT NAV (sticky on lg and xl)
          ════════════════════════════════════ */}
          <aside className="hidden lg:block sticky top-[80px] self-start z-10">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 overflow-hidden">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-3">
                Sections
              </p>
              <div className="relative">
                {/* Vertical connector line */}
                <div className="absolute left-[22px] top-3 bottom-3 w-px bg-gray-100 z-0" />
                <nav className="space-y-0.5 relative z-10">
                  {SECTIONS.map(({ id, num, label, icon: Icon }) => {
                    const isActive = activeSection === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => scrollTo(id)}
                        className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-all group ${
                          isActive
                            ? "bg-[#009966]/8 border-l-2 pl-[6px]"
                            : "hover:bg-gray-50 border-l-2 border-transparent pl-[6px]"
                        }`}
                        style={isActive ? { borderLeftColor: G } : {}}
                      >
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-all"
                          style={{
                            background: isActive ? G : "#f3f4f6",
                            color: isActive ? "#fff" : "#9ca3af",
                          }}
                        >
                          {num}
                        </span>
                        <span
                          className={`text-xs transition-all ${
                            isActive
                              ? "font-black text-gray-900"
                              : "font-semibold text-gray-500 group-hover:text-gray-700"
                          }`}
                        >
                          {label}
                        </span>
                        {isActive && (
                          <ChevronRight size={10} className="ml-auto shrink-0" style={{ color: G }} />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* ════════════════════════════════════
              MAIN FORM (Center Column)
          ════════════════════════════════════ */}
          <main className="space-y-5 min-w-0">

            {/* 01 Basic Info ───────────────────── */}
            <SectionCard id="section-01" num="01" title="Basic Information" icon={Package}>
              <Field label="Product Name" required>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Kanjeevaram Silk Saree — Royal Red"
                  className={`${inp} text-base font-semibold`}
                />
              </Field>

              {/* Toggles row */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-[#009966]/30 transition-all">
                  <div>
                    <p className="text-xs font-black text-gray-800">Make Product Popular?</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Show in Popular Products on homepage</p>
                  </div>
                  <Toggle on={isPopular} onChange={() => setIsPopular(!isPopular)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-[#009966]/30 transition-all">
                  <div>
                    <p className="text-xs font-black text-gray-800">Insert to Deal of the Day?</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Feature in today's limited-time deal</p>
                  </div>
                  <Toggle on={isDeal} onChange={() => setIsDeal(!isDeal)} />
                </div>
              </div>

              <Field label="Short Description" required hint={`${shortDesc.length}/160`}>
                <input
                  value={shortDesc}
                  onChange={e => e.target.value.length <= 160 && setShortDesc(e.target.value)}
                  placeholder="Brief summary shown in listing cards (max 160 chars)"
                  className={inp}
                />
              </Field>

              <Field label="Product Highlights" hint="Press Enter to add">
                <ChipInput
                  value={highlights}
                  onChange={setHighlights}
                  placeholder="Type a highlight & press Enter..."
                />
              </Field>

              <Field label="Full Description" hint="Markdown supported">
                <div className="flex items-center gap-1 flex-wrap px-3 py-2 bg-gray-50 border border-gray-200 rounded-t-xl border-b-0">
                  {[
                    { Icon: Bold,      label: "Bold",      wrap: ["**", "**"] },
                    { Icon: Italic,    label: "Italic",    wrap: ["*", "*"]   },
                    { Icon: Underline, label: "Underline", wrap: ["<u>", "</u>"] },
                    { Icon: List,      label: "List",      wrap: ["\n- ", ""] },
                    { Icon: Link2,     label: "Link",      wrap: ["[", "](url)"] },
                  ].map(({ Icon, label, wrap }) => (
                    <button
                      key={label}
                      title={label}
                      type="button"
                      onClick={() => {
                        setFullDesc(prev => prev + wrap[0] + "sample" + wrap[1]);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all"
                    >
                      <Icon size={13} />
                    </button>
                  ))}
                  <span className="ml-auto text-[10px] text-gray-400 font-mono">Markdown supported</span>
                </div>
                <textarea
                  value={fullDesc}
                  onChange={e => setFullDesc(e.target.value)}
                  rows={6}
                  placeholder="Write a detailed product description. Supports **bold**, *italic*, and - bullet lists."
                  className={`${inp} rounded-tl-none rounded-tr-none resize-y`}
                />
              </Field>
            </SectionCard>

            {/* 02 Media ────────────────────────── */}
            <SectionCard id="section-02" num="02" title="Media" icon={ImageIcon}>
              <Field label="Main Image" required hint="Min. 800×800px recommended">
                <UploadZone
                  preview={mainImg}
                  onFile={f => {
                    const r = new FileReader();
                    r.onload = e => {
                      if (typeof e.target?.result === "string") setMainImg(e.target.result);
                    };
                    r.readAsDataURL(f);
                  }}
                  label="Drag & drop or click to upload main product image"
                />
              </Field>

              <Field label="Gallery Images" hint={`${gallery.filter(Boolean).length} images selected · You can select multiple files at once`}>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*,.jpg,.jpeg"
                  multiple
                  className="hidden"
                  onChange={e => {
                    addGalleryFiles(Array.from(e.target.files ?? []));
                    e.target.value = "";
                  }}
                />
                {gallery.some(Boolean) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {gallery.map((preview, index) => preview ? (
                      <div key={index} className="relative group aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt={`Gallery image ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          aria-label={`Remove gallery image ${index + 1}`}
                          onClick={() => removeGalleryImage(index)}
                          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : null)}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-400">
                    No gallery images selected yet.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="mt-3 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition-colors hover:border-[#009966] hover:text-[#009966]"
                >
                  <Plus size={14} />
                  Add gallery images
                </button>
                <p className="mt-2 text-[10px] text-gray-400">Image files · maximum 5 MB per image</p>
              </Field>

              <Field label="Product Video URL" hint="YouTube, Vimeo, MP4, or WebM">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Video size={14} />
                  </div>
                  <input
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className={`${inp} pl-9`}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={e => {
                      setVideoFile(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                    className="block max-w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-gray-700 hover:file:bg-gray-200"
                  />
                  {videoFile && (
                    <span className="flex items-center gap-2 text-xs text-gray-600">
                      {videoFile.name}
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null);
                          if (videoInputRef.current) videoInputRef.current.value = "";
                        }}
                        aria-label="Remove product video"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-gray-400">Uploaded videos are stored in the product media bucket (max 100 MB).</p>
              </Field>
            </SectionCard>

            {/* 03 Organisation ─────────────────── */}
            <SectionCard id="section-03" num="03" title="Organisation" icon={Grid3x3}>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Category" required>
                  <select
                    value={category}
                    onChange={e => {
                      setCategory(e.target.value);
                      setSubcat("");
                    }}
                    className={inp}
                    disabled={categoriesLoading}
                  >
                    <option value="">{categoriesLoading ? "Loading categories…" : "Select category…"}</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Sub-Category" required>
                  <select
                    value={subcat}
                    onChange={e => setSubcat(e.target.value)}
                    className={inp}
                    disabled={!category}
                  >
                    <option value="">
                      {!category ? "Select category first…" : "Select sub-category…"}
                    </option>
                    {filteredSubcats.map(s => (
                      <option key={s.id} value={s.name}>{s.emoji} {s.name}</option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Brand"
                  required
                  hint={!category ? "Select category first" : undefined}
                >
                  <select
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className={inp}
                    disabled={!category}
                  >
                    <option value="">
                      {!category
                        ? "Select category first…"
                        : filteredBrands.length === 0
                        ? "No brands found (type or select)"
                        : "Select brand…"}
                    </option>
                    {filteredBrands.map(b => (
                      <option key={b.id} value={b.name}>
                        {b.name} {b.countryFlag || ""}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Tags" hint="Press Enter to add">
                <ChipInput value={tags} onChange={setTags} placeholder="e.g. trending, sale, new-arrival…" />
              </Field>
            </SectionCard>

            {/* 04 Pricing ──────────────────────── */}
            <SectionCard id="section-04" num="04" title="Pricing" icon={DollarSign}>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="MRP (₹)" required hint="Maximum Retail Price">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">₹</span>
                    <input
                      type="number"
                      value={mrp}
                      onChange={e => setMrp(e.target.value)}
                      placeholder="0"
                      className={`${inp} pl-7`}
                    />
                  </div>
                </Field>
                <Field label="Selling Price (₹)" required hint="Price shown to buyers">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">₹</span>
                    <input
                      type="number"
                      value={selling}
                      onChange={e => setSelling(e.target.value)}
                      placeholder="0"
                      className={`${inp} pl-7`}
                    />
                  </div>
                </Field>
                <Field label="Cost / Purchase Price (₹)" hint="Hidden from public">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">₹</span>
                    <input
                      type="number"
                      value={cost}
                      onChange={e => setCost(e.target.value)}
                      placeholder="0"
                      className={`${inp} pl-7`}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Tax Rule" hint="Tax is added on top. Choose the correct tax scope for this product and sale.">
                <select
                  value={taxRuleIdx}
                  onChange={e => setTaxRuleIdx(e.target.value)}
                  className={inp}
                >
                  {GST_RATES.map((rule, idx) => (
                    <option key={rule.slab} value={idx}>
                      {rule.label} ({rule.type}; {rule.category})
                    </option>
                  ))}
                </select>
              </Field>

              {/* Price calculation box */}
              {sellN > 0 && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <p className="mb-2 text-xs font-black text-emerald-900">Price calculation · {selectedTax.label}</p>
                  <div className="space-y-1.5 text-xs text-emerald-800">
                    <div className="flex justify-between gap-3"><span>Selling price</span><span>{fmt(sellN)}</span></div>
                    <div className="flex justify-between gap-3"><span>{selectedTax.type} ({selectedTax.slab}%)</span><span>+ {fmt(taxAmount)}</span></div>
                    <div className="flex justify-between gap-3 border-t border-emerald-200 pt-1.5 font-black"><span>Price including tax</span><span>{fmt(priceWithTax)}</span></div>
                  </div>
                </div>
              )}

              {/* Live discount badge */}
              <AnimatePresence>
                {discPct > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: `${G}0e`, border: `1px solid ${G}30` }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                      style={{ background: G }}
                    >
                      {discPct}%
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">
                        {discPct}% off — buyers save {fmt(saving)}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        MRP {fmt(mrpN)} → Selling {fmt(sellN)}
                      </p>
                    </div>
                    <span
                      className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                      style={{ background: G }}
                    >
                      GREAT DEAL
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>

            {/* 05 Inventory ────────────────────── */}
            <SectionCard id="section-05" num="05" title="Inventory" icon={BarChart3}>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Stock Quantity" required>
                  <input
                    type="number"
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    placeholder="0"
                    className={inp}
                  />
                </Field>
                <Field label="Low Stock Alert" hint="Notify when stock ≤ this">
                  <input
                    type="number"
                    value={lowAlert}
                    onChange={e => setLowAlert(e.target.value)}
                    placeholder="e.g. 10"
                    className={inp}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="SKU" hint="Stock Keeping Unit">
                  <div className="relative">
                    <input
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                      placeholder="e.g. ELC-APL-IP15PM"
                      className={`${inp} pr-[88px] font-mono`}
                    />
                    <button
                      type="button"
                      onClick={autoSku}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black text-white transition-all hover:opacity-90"
                      style={{ background: G }}
                    >
                      <Zap size={9} /> Auto
                    </button>
                  </div>
                </Field>
                <Field label="Barcode / EAN" hint="For inventory scanning">
                  <input
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    placeholder="e.g. 8901234567890"
                    className={`${inp} font-mono`}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Minimum Order Qty (MOQ)">
                  <input
                    type="number"
                    value={moq}
                    onChange={e => setMoq(e.target.value)}
                    placeholder="1"
                    className={inp}
                  />
                </Field>
                <Field label="Product Condition">
                  <select
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                    className={inp}
                  >
                    <option>New</option>
                    <option>Refurbished</option>
                    <option>Used</option>
                  </select>
                </Field>
              </div>
            </SectionCard>

            {/* 06 Variants ─────────────────────── */}
            <SectionCard id="section-06" num="06" title="Product Variants" icon={Layers}>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                <div>
                  <p className="text-sm font-black text-gray-800">Product Has Variants?</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Enable to add colors, sizes, storage options, etc.</p>
                </div>
                <Toggle on={hasVariants} onChange={() => setHasVariants(!hasVariants)} />
              </div>

              <AnimatePresence>
                {hasVariants && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-2">
                      <AnimatePresence>
                        {variants.map((v, idx) => (
                          <motion.div
                            key={v.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                            className="border border-gray-200 rounded-2xl overflow-hidden"
                          >
                            <div className="flex items-center justify-between px-5 py-3 bg-gray-50/80 border-b border-gray-100">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                                  style={{ background: G }}
                                >
                                  {idx + 1}
                                </span>
                                <span className="text-sm font-bold text-gray-700">
                                  {v.title
                                    ? `${v.variationType || "Variant"}: ${v.title}`
                                    : v.variationType || `Variant ${idx + 1}`}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeVariant(v.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-all"
                              >
                                <X size={13} />
                              </button>
                            </div>

                            <div className="p-5 space-y-5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Select Product Variation Type" required>
                                  <select
                                    value={v.variationType}
                                    onChange={e => updateVariant(v.id, "variationType", e.target.value)}
                                    className={`${inp} appearance-none`}
                                  >
                                    <option value="">Select Type...</option>
                                    {["Color","Size","Storage / RAM","Material","Weight","Volume","Pattern / Print","Style","Flavor","Pack Size","Age Group","Length"].map(t => (
                                      <option key={t}>{t}</option>
                                    ))}
                                  </select>
                                </Field>
                                <Field label="Variation Title" required hint="e.g., Red, Large">
                                  <input
                                    value={v.title}
                                    onChange={e => updateVariant(v.id, "title", e.target.value)}
                                    placeholder="e.g., Red, Large"
                                    className={inp}
                                  />
                                </Field>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Field label="Price" required>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                                    <input
                                      type="number"
                                      value={v.price}
                                      onChange={e => updateVariant(v.id, "price", e.target.value)}
                                      placeholder="0.00"
                                      className={`${inp} pl-7`}
                                    />
                                  </div>
                                </Field>
                                <Field label="Offer Price" hint="Optional discount price">
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                                    <input
                                      type="number"
                                      value={v.offerPrice}
                                      onChange={e => updateVariant(v.id, "offerPrice", e.target.value)}
                                      placeholder="0.00"
                                      className={`${inp} pl-7`}
                                    />
                                  </div>
                                  {v.price && v.offerPrice && Number(v.offerPrice) < Number(v.price) && (
                                    <p className="text-[10px] font-bold mt-1" style={{ color: G }}>
                                      {Math.round((1 - Number(v.offerPrice) / Number(v.price)) * 100)}% off
                                    </p>
                                  )}
                                </Field>
                                <Field label="Stock" required>
                                  <input
                                    type="number"
                                    value={v.stock}
                                    onChange={e => updateVariant(v.id, "stock", e.target.value)}
                                    placeholder="0"
                                    className={inp}
                                  />
                                </Field>
                              </div>

                              <Field label="Product Status" required>
                                <div className="flex gap-3">
                                  {(["Active", "Inactive"] as const).map(s => (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() => updateVariant(v.id, "status", s)}
                                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                                        v.status === s
                                          ? "border-[#009966] text-[#009966] bg-[#009966]/8"
                                          : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"
                                      }`}
                                    >
                                      {v.status === s && <CheckCircle2 size={13} />}
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </Field>

                              <Field label="Product Variant Images" hint="Multiple images supported">
                                <div className="flex flex-wrap gap-2">
                                  {v.images.map((img, i) => {
                                    const imgRef = React.createRef<HTMLInputElement>();
                                    return (
                                      <div key={i} className="relative group">
                                        <input
                                          ref={imgRef}
                                          type="file"
                                          accept="image/*,.jpg,.jpeg"
                                          className="hidden"
                                          onChange={e => {
                                            const f = e.target.files?.[0];
                                            if (f) addVariantImg(v.id, i, f);
                                          }}
                                        />
                                        <div
                                          onClick={() => imgRef.current?.click()}
                                          className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
                                            img ? "border-[#009966]/40" : "border-gray-200 hover:border-[#009966] hover:bg-[#009966]/5"
                                          }`}
                                        >
                                          {img ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="flex flex-col items-center gap-1 text-gray-300 hover:text-[#009966] transition-colors">
                                              <Upload size={16} />
                                              <span className="text-[9px] font-bold">Add</span>
                                            </div>
                                          )}
                                        </div>
                                        {img && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const imgs = [...v.images];
                                              imgs[i] = undefined;
                                              updateVariant(v.id, "images", imgs);
                                            }}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <X size={9} />
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                  <button
                                    type="button"
                                    onClick={() => updateVariant(v.id, "images", [...v.images, undefined])}
                                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[#009966] hover:text-[#009966] transition-all"
                                  >
                                    <Plus size={16} />
                                    <span className="text-[9px] font-bold mt-0.5">More</span>
                                  </button>
                                </div>
                              </Field>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <button
                        type="button"
                        onClick={addVariant}
                        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-bold text-gray-500 hover:border-[#009966] hover:text-[#009966] hover:bg-[#009966]/5 transition-all"
                      >
                        <div className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center">
                          <Plus size={13} />
                        </div>
                        Add Another Variant
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>

            {/* 07 Shipping ─────────────────────── */}
            <SectionCard id="section-07" num="07" title="Shipping & Delivery" icon={Truck}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Weight (kg)">
                  <input
                    type="number"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="0.0"
                    className={inp}
                  />
                </Field>
                <Field label="Length (cm)">
                  <input
                    type="number"
                    value={dimL}
                    onChange={e => setDimL(e.target.value)}
                    placeholder="0"
                    className={inp}
                  />
                </Field>
                <Field label="Width (cm)">
                  <input
                    type="number"
                    value={dimW}
                    onChange={e => setDimW(e.target.value)}
                    placeholder="0"
                    className={inp}
                  />
                </Field>
                <Field label="Height (cm)">
                  <input
                    type="number"
                    value={dimH}
                    onChange={e => setDimH(e.target.value)}
                    placeholder="0"
                    className={inp}
                  />
                </Field>
              </div>

              <Field label="Estimated Delivery">
                <select value={delivery} onChange={e => setDelivery(e.target.value)} className={inp}>
                  {DELIVERY_OPTIONS.map(d => (
                    <option key={d.v} value={d.v}>{d.l}</option>
                  ))}
                </select>
              </Field>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-[#009966]/30 transition-all">
                  <div>
                    <p className="text-xs font-black text-gray-800">Free Shipping</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Waive delivery charges for buyers</p>
                  </div>
                  <Toggle on={freeShip} onChange={() => setFreeShip(!freeShip)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-[#009966]/30 transition-all">
                  <div>
                    <p className="text-xs font-black text-gray-800">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Allow payment on delivery</p>
                  </div>
                  <Toggle on={cod} onChange={() => setCod(!cod)} />
                </div>
              </div>
            </SectionCard>

            {/* 08 SEO ──────────────────────────── */}
            <SectionCard id="section-08" num="08" title="SEO Content" icon={SearchIcon}>
              <Field label="SEO Title" hint={`${seoTitle.length}/70`}>
                <input
                  value={seoTitle}
                  onChange={e => e.target.value.length <= 70 && setSeoTitle(e.target.value)}
                  placeholder="Optimised title for search engines"
                  className={inp}
                />
              </Field>

              <Field label="SEO Keywords" hint="Comma-separated">
                <input
                  value={seoKw}
                  onChange={e => setSeoKw(e.target.value)}
                  placeholder="silk saree, kanjeevaram, traditional wear, ethnic"
                  className={inp}
                />
              </Field>

              <Field label="Image Alt Text" hint="Describe the main image for accessibility">
                <input
                  value={seoAlt}
                  onChange={e => setSeoAlt(e.target.value)}
                  placeholder="e.g. Red Kanjeevaram silk saree with gold border"
                  className={inp}
                />
              </Field>

              <Field label="Meta Description" hint={`${seoMeta.length}/170`}>
                <textarea
                  value={seoMeta}
                  onChange={e => e.target.value.length <= 170 && setSeoMeta(e.target.value)}
                  rows={3}
                  placeholder="Short snippet shown in Google search results…"
                  className={`${inp} resize-none`}
                />
              </Field>

              {/* SERP preview */}
              {(seoTitle || name) && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-0.5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Search Preview</p>
                  <p className="text-sm font-bold text-blue-700 truncate">{seoTitle || name}</p>
                  <p className="text-[11px] text-green-700">
                    bharatbazar.in › products › {
                      (seoTitle || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)
                    }
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-2">{seoMeta || shortDesc || "No meta description yet."}</p>
                </div>
              )}
            </SectionCard>

            {/* 09 Other Details ────────────────── */}
            <SectionCard id="section-09" num="09" title="Other Details" icon={FileText}>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Manufacturer">
                  <input
                    value={manufacturer}
                    onChange={e => setManufacturer(e.target.value)}
                    placeholder="e.g. Samsung Electronics Co. Ltd."
                    className={inp}
                  />
                </Field>
                <Field label="Made In">
                  <select value={madeIn} onChange={e => setMadeIn(e.target.value)} className={inp}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="HSN Code" hint="Required for GST filing">
                  <input
                    value={hsn}
                    onChange={e => setHsn(e.target.value)}
                    placeholder="e.g. 8517"
                    className={`${inp} font-mono`}
                  />
                </Field>
                <Field label="Max Qty per Cart" hint="Leave blank = no limit">
                  <input
                    type="number"
                    value={maxCart}
                    onChange={e => setMaxCart(e.target.value)}
                    placeholder="Unlimited"
                    className={inp}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Warranty Period" hint="e.g. 1 Year, 6 Months">
                  <input
                    value={warranty}
                    onChange={e => setWarranty(e.target.value)}
                    placeholder="e.g. 1 Year"
                    className={inp}
                  />
                </Field>
                <Field label="Warranty Type">
                  <select value={warrantyType} onChange={e => setWarrantyType(e.target.value)} className={inp}>
                    {WARRANTY_TYPES.map(w => <option key={w}>{w}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="FSSAI Licence No." hint="Required for food & beverage products">
                <input
                  value={fssai}
                  onChange={e => setFssai(e.target.value)}
                  placeholder="e.g. 10012345000123"
                  className={`${inp} font-mono`}
                />
              </Field>

              {/* Toggles: returnable */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-[#009966]/30 transition-all">
                  <div>
                    <p className="text-xs font-black text-gray-800">Is Returnable?</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Allow buyers to return this product</p>
                  </div>
                  <Toggle on={returnable} onChange={() => setReturnable(!returnable)} />
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
                    <Field label="Max Return Days" hint="e.g. 7 or 30">
                      <input
                        type="number"
                        value={returnDays}
                        onChange={e => setReturnDays(e.target.value)}
                        placeholder="7"
                        className={`${inp} max-w-[200px]`}
                      />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>

            {/* 10 Specifications ────────────────── */}
            <SectionCard id="section-10" num="10" title="Specifications" icon={ListChecks}>
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Load template for category
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SPEC_TEMPLATES).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => loadTemplate(cat)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:border-[#009966] hover:text-[#009966] hover:bg-[#009966]/5 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {specs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 text-center bg-gray-50/50">
                  <ListChecks size={28} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">
                    No specifications added yet — use a template to quick-fill or add manually.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-0 bg-gray-50 border-b border-gray-200 px-4 py-2">
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Specification Key</span>
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Value</span>
                    <span className="w-8" />
                  </div>
                  <div className="divide-y divide-gray-100">
                    {specs.map(spec => (
                      <div key={spec.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={e => updateSpec(spec.id, "key", e.target.value)}
                          placeholder="e.g. Brand"
                          className="w-full text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966] bg-white placeholder:text-gray-300"
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={e => updateSpec(spec.id, "value", e.target.value)}
                          placeholder="Enter value"
                          className="w-full text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#009966]/20 focus:border-[#009966] bg-white placeholder:text-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpec(spec.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => addSpec()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-sm font-semibold text-gray-500 hover:border-[#009966] hover:text-[#009966] hover:bg-[#009966]/5 transition-colors"
              >
                <Plus size={14} />
                Add Specification
              </button>
            </SectionCard>

            {/* Bottom action row */}
            <div className="flex items-center justify-end gap-3 pt-3 pb-8">
              <button
                type="button"
                onClick={() => saveProduct("draft")}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-black text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-60 cursor-pointer"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => saveProduct("request")}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-60 cursor-pointer ${
                  verifiedSeller
                    ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "text-white shadow-sm hover:opacity-90"
                }`}
                style={!verifiedSeller ? { background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)` } : {}}
              >
                <Send size={13} />
                <span>{isSaving ? "Submitting…" : "Submit as Request"}</span>
              </button>

              {verifiedSeller && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => saveProduct("publish")}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60 cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)` }}
                >
                  <CheckCircle2 size={13} />
                  <span>{isSaving ? "Publishing…" : "Publish Product"}</span>
                </motion.button>
              )}
            </div>

          </main>

          {/* ════════════════════════════════════
              RIGHT SIDEBAR (sticky on lg and xl)
          ════════════════════════════════════ */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-[80px] self-start z-10">

            {/* Visibility Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <Eye size={13} className="text-gray-400" />
                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Visibility</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-gray-800">Active / Visible</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Product shows in store</p>
                  </div>
                  <Toggle on={active} onChange={() => setActive(!active)} />
                </div>
                <div className="w-full h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-gray-800">Featured Product</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Show in Featured section</p>
                  </div>
                  <Toggle on={featured} onChange={() => setFeatured(!featured)} />
                </div>
                <div className="w-full h-px bg-gray-100" />
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Condition</p>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black"
                      style={{ background: `${G}12`, color: GD }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: G }} />
                      {condition}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${
                        active ? "" : "bg-gray-100 text-gray-500"
                      }`}
                      style={active ? { background: `${G}12`, color: GD } : {}}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: active ? G : "#9ca3af" }}
                      />
                      {active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Publish Card — Green Gradient (Exact Match to Admin) */}
            <div
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{ background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)` }}
            >
              <div className="p-5 space-y-4">
                {/* Product name & verified indicator preview */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {verifiedSeller ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/20 text-white">
                        <CheckCircle2 size={10} className="text-white" />
                        Verified Merchant
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">
                        Ready to submit
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-black text-white leading-snug font-['Plus_Jakarta_Sans'] line-clamp-2">
                    {name.trim() || "New Product"}
                  </p>
                </div>

                {/* Quick summary chips */}
                <div className="flex flex-wrap gap-1.5">
                  {category && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                      {category}
                    </span>
                  )}
                  {brand && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                      {brand}
                    </span>
                  )}
                  {sellN > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                      {fmt(sellN)}
                    </span>
                  )}
                  {discPct > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-300/30 text-yellow-100">
                      {discPct}% off
                    </span>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  {verifiedSeller ? (
                    <>
                      {/* Primary Publish Product button for Verified Sellers */}
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => saveProduct("publish")}
                        disabled={isSaving}
                        className="w-full py-2.5 rounded-xl bg-white text-sm font-black transition-all hover:bg-white/90 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        style={{ color: GD }}
                      >
                        <CheckCircle2 size={14} />
                        <span>{isSaving ? "Publishing…" : "Publish Product"}</span>
                      </motion.button>

                      {/* Secondary Submit as Request */}
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => saveProduct("request")}
                        className="w-full py-2 rounded-xl border border-white/40 text-xs font-black text-white hover:bg-white/10 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send size={12} />
                        <span>Submit as Request</span>
                      </button>

                      {/* Tertiary Save Draft */}
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => saveProduct("draft")}
                        className="w-full py-1.5 rounded-xl text-xs font-bold text-white/80 hover:text-white transition-all disabled:opacity-60 cursor-pointer"
                      >
                        {isSaving ? "Saving…" : "Save Draft"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => saveProduct("draft")}
                        className="w-full py-2.5 rounded-xl border-2 border-white/40 text-sm font-black text-white hover:bg-white/10 transition-all disabled:opacity-60 cursor-pointer"
                      >
                        {isSaving ? "Saving…" : "Save Draft"}
                      </button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => saveProduct("request")}
                        disabled={isSaving}
                        className="w-full py-2.5 rounded-xl bg-white text-sm font-black transition-all hover:bg-white/90 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        style={{ color: GD }}
                      >
                        <Send size={14} />
                        <span>{isSaving ? "Submitting…" : "Submit as Request"}</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <CheckCircle2 size={13} className="text-gray-400" />
                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Completion</span>
              </div>
              <div className="p-5 space-y-2">
                {[
                  { label: "Product Name",  done: name.trim().length > 0    },
                  { label: "Category",      done: category !== ""            },
                  { label: "Main Image",    done: !!mainImg                  },
                  { label: "Selling Price", done: sellN > 0                  },
                  { label: "Stock Qty",     done: stock !== ""               },
                  { label: "Brand",         done: brand !== ""               },
                  { label: "SEO Title",     done: seoTitle.trim().length > 0 },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        done ? "scale-100" : "scale-90"
                      }`}
                      style={{ background: done ? G : "#f3f4f6" }}
                    >
                      {done && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <span className={`text-xs transition-all ${done ? "text-gray-800 font-semibold" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}

export default SellerAddProductPage;
