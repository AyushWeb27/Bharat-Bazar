import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bold, Italic, Underline, List, Link2, Video,
  Upload, X, Plus, Zap, CheckCircle2, ChevronRight,
  Package, Image as ImageIcon, Grid3x3, Tag,
  DollarSign, BarChart3, Layers, Truck, Search as SearchIcon,
  FileText, Info, Star, Eye, ShoppingBag, ListChecks,
} from "lucide-react";
import { INIT_CATS, INIT_SUBCATS, INIT_BRANDS } from "./shared/data";
import type { TaxRule } from "./shared/types";
import { G, GD, fmt, disc, inp } from "./shared/constants";
import { Field, Toggle } from "./shared/ui";

// ─────────────────────────────────────────────
// Inline data
// ─────────────────────────────────────────────
const SELLERS = [
  { id: 1, name: "Ravi Electro Hub",   city: "Mumbai"    },
  { id: 2, name: "Delhi Fashion Store",city: "New Delhi" },
  { id: 3, name: "Spice Garden India", city: "Chennai"   },
  { id: 4, name: "Karnataka Artisans", city: "Bengaluru" },
  { id: 5, name: "Punjab Crafts Co.",  city: "Ludhiana"  },
  { id: 6, name: "EcoGreen Products",  city: "Pune"      },
];

const COUNTRIES = [
  "India","USA","China","Germany","Japan",
  "South Korea","UK","France","Italy","Taiwan",
];

const DELIVERY_OPTIONS = [
  { v: "1-2", l: "1–2 Business Days" },
  { v: "2-3", l: "2–3 Business Days" },
  { v: "3-5", l: "3–5 Business Days" },
  { v: "5-7", l: "5–7 Business Days" },
];

const WARRANTY_TYPES = ["Manufacturer","Seller","Brand","None"];

const SPEC_TEMPLATES: Record<string, Array<{key: string; placeholder: string}>> = {
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

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberText(value: unknown, fallback = "") {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : fallback;
}

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
// Small helpers
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
      className="bg-white rounded-2xl shadow-sm overflow-hidden scroll-mt-[72px]"
    >
      {/* header with left green border accent */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 border-l-2"
        style={{ borderLeftColor: G }}>
        <SectionBadge num={num} />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon size={15} className="text-gray-400 shrink-0" />
          <h2 className="text-sm font-black text-gray-900 font-['Plus_Jakarta_Sans']">{title}</h2>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// Tag chip input
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
    <div className={`${inp} !py-1.5 flex flex-wrap gap-1.5 min-h-[42px] cursor-text`}
      onClick={e => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}>
      {value.map(chip => (
        <span key={chip}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold"
          style={{ background: `${G}15`, color: GD }}>
          {chip}
          <button type="button" onClick={() => remove(chip)}
            className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors">
            <X size={9} />
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 py-0.5"
      />
    </div>
  );
}

// Image upload zone
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
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onClick={e => e.stopPropagation()}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }} />
      {preview ? (
        <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#009966] transition-colors p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#009966]/10 flex items-center justify-center transition-colors">
            <Upload size={16} />
          </div>
          {!small && <p className="text-xs font-bold">{label ?? "Click to upload"}</p>}
          {!small && <p className="text-[10px] text-gray-400">PNG, JPG, WEBP — max 5MB</p>}
        </div>
      )}
      {preview && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
            <Upload size={13} className="text-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export function AddProductPage({ productId, onCancel }: { productId?: number; onCancel?: () => void }) {
  // ── Basic Info ──────────────────────────────
  const [name, setName]           = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [isDeal, setIsDeal]       = useState(false);
  const [shortDesc, setShortDesc] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [fullDesc, setFullDesc]   = useState("");

  // ── Media ───────────────────────────────────
  const [mainImg, setMainImg]     = useState<string>();
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [gallery, setGallery]     = useState<Array<string | undefined>>(Array(6).fill(undefined));
  const [galleryFiles, setGalleryFiles] = useState<Array<File | undefined>>(Array(6).fill(undefined));
  const [videoUrl, setVideoUrl]   = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingVideoFileUrl, setExistingVideoFileUrl] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Organisation ────────────────────────────
  const [category, setCategory]   = useState("");
  const [subcat, setSubcat]       = useState("");
  const [brand, setBrand]         = useState("");
  const [sellerIds, setSellerIds] = useState<number[]>([]);
  const [tags, setTags]           = useState<string[]>([]);

  // ── Pricing ─────────────────────────────────
  const [mrp, setMrp]             = useState("");
  const [selling, setSelling]     = useState("");
  const [cost, setCost]           = useState("");
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [taxRulesLoading, setTaxRulesLoading] = useState(true);
  const [taxRulesError, setTaxRulesError] = useState("");
  const [taxRuleId, setTaxRuleId] = useState("");

  // ── Inventory ───────────────────────────────
  const [stock, setStock]         = useState("");
  const [lowAlert, setLowAlert]   = useState("");
  const [sku, setSku]             = useState("");
  const [barcode, setBarcode]     = useState("");
  const [moq, setMoq]             = useState("");
  const [condition, setCondition] = useState("New");

  // ── Variants ────────────────────────────────
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
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [vCount, setVCount] = useState(0);

  // ── Shipping ────────────────────────────────
  const [weight, setWeight]       = useState("");
  const [dimL, setDimL]           = useState("");
  const [dimW, setDimW]           = useState("");
  const [dimH, setDimH]           = useState("");
  const [delivery, setDelivery]   = useState("3-5");
  const [freeShip, setFreeShip]   = useState(false);
  const [cod, setCod]             = useState(true);

  // ── SEO ─────────────────────────────────────
  const [seoTitle, setSeoTitle]   = useState("");
  const [seoKw, setSeoKw]         = useState("");
  const [seoAlt, setSeoAlt]       = useState("");
  const [seoMeta, setSeoMeta]     = useState("");

  // ── Other ───────────────────────────────────
  const [manufacturer, setManufacturer] = useState("");
  const [madeIn, setMadeIn]       = useState("India");
  const [hsn, setHsn]             = useState("");
  const [warranty, setWarranty]   = useState("");
  const [warrantyType, setWarrantyType] = useState("Manufacturer");
  const [fssai, setFssai]         = useState("");
  const [maxCart, setMaxCart]     = useState("");
  const [returnable, setReturnable] = useState(true);
  const [returnDays, setReturnDays] = useState("7");

  // ── Specifications ───────────────────────────
  type Spec = { id: number; key: string; value: string };
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [specCount, setSpecCount] = useState(0);

  // ── Status / publish ────────────────────────
  const [active, setActive]       = useState(true);
  const [storedStatus, setStoredStatus] = useState<"draft" | "active" | "inactive">("draft");
  const [featured, setFeatured]   = useState(false);
  const [published, setPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(Boolean(productId));
  const [productLoaded, setProductLoaded] = useState(!productId);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Scroll spy ──────────────────────────────
  const [activeSection, setActiveSection] = useState("section-01");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) {
        sectionRefs.current[id] = el;
        observerRef.current?.observe(el);
      }
    });
    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    async function loadProduct() {
      setLoadingProduct(true);
      setFormMessage(null);
      try {
        const response = await fetch(`/api/admin/products?id=${productId}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || !result.success || !result.product || typeof result.product !== "object") {
          throw new Error(result.message || "Could not load this product for editing.");
        }
        const product = recordValue(result.product);
        const details = recordValue(product.details);
        const shipping = recordValue(details.shipping);
        const dimensions = recordValue(shipping.dimensions);
        const seo = recordValue(details.seo);
        const rawVariants = Array.isArray(details.variants) ? details.variants : [];
        const rawSpecifications = Array.isArray(details.specifications) ? details.specifications : [];
        const rawGallery = Array.isArray(product.galleryImages) ? product.galleryImages : [];
        setName(textValue(product.name));
        setShortDesc(textValue(product.shortDescription));
        setFullDesc(textValue(product.fullDescription));
        setIsPopular(Boolean(product.isPopular ?? details.isPopular));
        setIsDeal(Boolean(product.isDeal ?? details.isDeal));
        setHighlights(Array.isArray(details.highlights) ? details.highlights.filter((item): item is string => typeof item === "string") : []);
        setTags(Array.isArray(details.tags) ? details.tags.filter((item): item is string => typeof item === "string") : []);
        setMainImg(textValue(product.imageUrl) || undefined);
        setMainImageFile(null);
        setGallery(Array.from({ length: 6 }, (_, index) => typeof rawGallery[index] === "string" ? rawGallery[index] as string : undefined));
        setGalleryFiles(Array(6).fill(undefined));
        setVideoUrl(textValue(product.videoUrl));
        setExistingVideoFileUrl(textValue(product.videoFileUrl));
        setVideoFile(null);
        setCategory(textValue(product.cat));
        setSubcat(textValue(product.subcat));
        setBrand(textValue(product.brand));
        setSellerIds(Array.isArray(details.sellerIds) ? details.sellerIds.filter((id): id is number => typeof id === "number") : []);
        setMrp(numberText(product.mrp));
        setSelling(numberText(product.price));
        setCost(numberText(product.costPrice));
        setTaxRuleId(product.taxRuleId === null || product.taxRuleId === undefined ? "" : String(product.taxRuleId));
        setStock(numberText(product.stock));
        setLowAlert(numberText(product.lowStockAlert));
        setSku(textValue(product.sku));
        setBarcode(textValue(product.barcode));
        setMoq(numberText(details.moq));
        setCondition(textValue(details.condition, "New"));
        const variants = rawVariants.map((value, index) => {
          const variant = recordValue(value);
          return {
            id: typeof variant.id === "number" ? variant.id : index + 1,
            variationType: textValue(variant.variationType),
            title: textValue(variant.title),
            price: textValue(variant.price),
            offerPrice: textValue(variant.offerPrice),
            stock: textValue(variant.stock),
            status: variant.status === "Inactive" ? "Inactive" as const : "Active" as const,
            images: [],
          };
        });
        setVariants(variants);
        setVCount(variants.length);
        setHasVariants(Boolean(details.hasVariants));
        setWeight(numberText(shipping.weight));
        setDimL(numberText(dimensions.length));
        setDimW(numberText(dimensions.width));
        setDimH(numberText(dimensions.height));
        setDelivery(textValue(shipping.delivery, "3-5"));
        setFreeShip(Boolean(shipping.freeShip));
        setCod(shipping.cod !== false);
        setSeoTitle(textValue(seo.title));
        setSeoKw(textValue(seo.keywords));
        setSeoAlt(textValue(seo.alt));
        setSeoMeta(textValue(seo.metaDescription));
        setManufacturer(textValue(details.manufacturer));
        setMadeIn(textValue(details.madeIn, "India"));
        setHsn(textValue(details.hsn));
        setWarranty(textValue(details.warranty));
        setWarrantyType(textValue(details.warrantyType, "Manufacturer"));
        setFssai(textValue(details.fssai));
        setMaxCart(numberText(details.maxCart));
        setReturnable(details.returnable !== false);
        setReturnDays(numberText(details.returnDays, "7"));
        const specifications = rawSpecifications.map((value, index) => {
          const specification = recordValue(value);
          return {
            id: index + 1,
            key: textValue(specification.key),
            value: textValue(specification.value),
          };
        });
        setSpecs(specifications);
        setSpecCount(specifications.length);
        const status = product.storedStatus === "active" || product.storedStatus === "inactive" || product.storedStatus === "draft"
          ? product.storedStatus
          : "draft";
        setStoredStatus(status);
        setActive(status === "active");
        setFeatured(Boolean(product.featured));
        setProductLoaded(true);
      } catch (error) {
        if (!controller.signal.aborted) {
          setFormMessage({
            type: "error",
            text: error instanceof Error ? error.message : "Could not load this product for editing.",
          });
        }
      } finally {
        if (!controller.signal.aborted) setLoadingProduct(false);
      }
    }
    void loadProduct();
    return () => controller.abort();
  }, [productId]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadTaxRules() {
      setTaxRulesLoading(true);
      setTaxRulesError("");
      try {
        const response = await fetch("/api/admin/taxes", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || !result.success || !Array.isArray(result.taxes)) {
          throw new Error(result.message || "Failed to load tax rules.");
        }
        setTaxRules(result.taxes);
      } catch (error) {
        if (!controller.signal.aborted) {
          setTaxRulesError(error instanceof Error ? error.message : "Failed to load tax rules.");
        }
      } finally {
        if (!controller.signal.aborted) setTaxRulesLoading(false);
      }
    }
    void loadTaxRules();
    return () => controller.abort();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Derived ─────────────────────────────────
  const mrpN    = parseFloat(mrp) || 0;
  const sellN   = parseFloat(selling) || 0;
  const discPct = disc(mrpN, sellN);
  const saving  = mrpN - sellN;
  const applicableTaxRules = taxRules.filter(
    rule => (rule.active || String(rule.id) === taxRuleId) &&
      (rule.slab !== null || String(rule.id) === taxRuleId)
  );
  const selectedTaxRule = applicableTaxRules.find(rule => String(rule.id) === taxRuleId);
  const taxAmount = selectedTaxRule && selectedTaxRule.slab !== null
    ? Math.round((sellN * selectedTaxRule.slab / 100 + Number.EPSILON) * 100) / 100
    : 0;
  const priceWithTax = Math.round((sellN + taxAmount + Number.EPSILON) * 100) / 100;

  const filteredSubcats = INIT_SUBCATS.filter(s => s.parent === category);

  const autoSku = () => {
    const cat = INIT_CATS.find(c => c.name === category);
    const bnd = INIT_BRANDS.find(b => b.name === brand);
    const slug = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setSku(`${cat?.slug?.slice(0,3).toUpperCase() ?? "PRD"}-${bnd?.slug?.slice(0,3).toUpperCase() ?? "GEN"}-${slug || "ITEM"}`.replace(/--/g, "-"));
  };

  const addVariant = () => {
    const id = vCount + 1;
    setVCount(id);
    setVariants(prev => [...prev, { id, variationType: "", title: "", price: "", offerPrice: "", stock: "", status: "Active", images: Array(4).fill(undefined) }]);
  };

  const updateVariant = (id: number, key: string, value: unknown) =>
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [key]: value } : v));

  const removeVariant = (id: number) =>
    setVariants(prev => prev.filter(v => v.id !== id));

  const addVariantImg = (id: number, idx: number, file: File) => {
    const url = URL.createObjectURL(file);
    setVariants(prev => prev.map(v => {
      if (v.id !== id) return v;
      const imgs = [...v.images]; imgs[idx] = url; return { ...v, images: imgs };
    }));
  };

  const toggleSeller = (id: number) =>
    setSellerIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleGallery = (i: number, f: File) => {
    const url = URL.createObjectURL(f);
    setGallery(prev => {
      const n = [...prev];
      n[i] = url;
      return n;
    });
    setGalleryFiles(prev => {
      const n = [...prev];
      n[i] = f;
      return n;
    });
  };

  const saveProduct = async (publish: boolean) => {
    setIsSaving(true);
    setFormMessage(null);
    const details = {
      highlights, tags, sellerIds, isPopular, isDeal,
      moq: moq === "" ? null : Number(moq),
      condition, hasVariants,
      variants: variants.map(variant => ({
        id: variant.id,
        variationType: variant.variationType,
        title: variant.title,
        price: variant.price,
        offerPrice: variant.offerPrice,
        stock: variant.stock,
        status: variant.status,
      })),
      shipping: {
        weight: weight === "" ? null : Number(weight),
        dimensions: {
          length: dimL === "" ? null : Number(dimL),
          width: dimW === "" ? null : Number(dimW),
          height: dimH === "" ? null : Number(dimH),
        },
        delivery, freeShip, cod,
      },
      seo: { title: seoTitle, keywords: seoKw, alt: seoAlt, metaDescription: seoMeta },
      manufacturer, madeIn, hsn, warranty, warrantyType, fssai,
      maxCart: maxCart === "" ? null : Number(maxCart),
      returnable, returnDays: returnable ? Number(returnDays) : null,
      specifications: specs
        .filter(spec => spec.key.trim() || spec.value.trim())
        .map(({ key, value }) => ({ key: key.trim(), value: value.trim() })),
    };
    const saveStatus: "draft" | "active" | "inactive" = productId
      ? publish
        ? active ? "active" : "inactive"
        : storedStatus === "draft" ? "draft" : active ? "active" : "inactive"
      : publish ? active ? "active" : "inactive" : "draft";
    const payload = {
      ...(productId ? { id: productId } : {}),
      name,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
      category,
      subcategory: subcat,
      brand,
      mrp: mrp === "" ? null : Number(mrp),
      sellingPrice: selling === "" ? null : Number(selling),
      costPrice: cost === "" ? null : Number(cost),
      stock: stock === "" ? "" : Number(stock),
      lowStockAlert: lowAlert === "" ? null : Number(lowAlert),
      sku,
      barcode,
      videoUrl,
      isPopular,
      isDeal,
      featured,
      status: saveStatus,
      taxRuleId: taxRuleId ? Number(taxRuleId) : null,
      details,
    };
    const formData = new FormData();
    formData.append("product", JSON.stringify(payload));
    if (mainImageFile) formData.append("mainImage", mainImageFile);
    galleryFiles.forEach((file, index) => {
      if (file) formData.append(`galleryImage_${index}`, file);
    });
    if (videoFile) formData.append("video", videoFile);

    try {
      const response = await fetch("/api/admin/products", {
        method: productId ? "PUT" : "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(typeof result.message === "string" ? result.message : "Could not save the product.");
      }
      setPublished(publish);
      setStoredStatus(payload.status);
      setFormMessage({
        type: "success",
        text: productId
          ? "Product updated successfully."
          : publish ? "Product published successfully." : "Product draft saved successfully.",
      });
      if (publish) window.setTimeout(() => setPublished(false), 3000);
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save the product. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addSpec = (key = "", value = "") => {
    const id = specCount + 1;
    setSpecCount(id);
    setSpecs(prev => [...prev, { id, key, value }]);
  };
  const updateSpec = (id: number, field: "key" | "value", val: string) =>
    setSpecs(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  const removeSpec = (id: number) => setSpecs(prev => prev.filter(s => s.id !== id));
  const loadTemplate = (cat: string) => {
    const tpl = SPEC_TEMPLATES[cat];
    if (!tpl) return;
    setSpecCount(tpl.length);
    setSpecs(tpl.map((t, i) => ({ id: i + 1, key: t.key, value: "" })));
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f6f8fa]">

      {/* ── Sticky top action bar ── */}
      <div className="sticky top-0 z-[20] bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${G}15` }}>
              <ShoppingBag size={13} style={{ color: G }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                BharatBazar · Super Admin
              </p>
              <p className="text-sm font-black text-gray-900 truncate font-['Plus_Jakarta_Sans']">
                {name.trim() || <span className="text-gray-400 font-normal">{productId ? "Edit Product" : "New Product"}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onCancel && (
              <button type="button" onClick={onCancel} disabled={isSaving}
                className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-black text-gray-700 hover:bg-gray-50 transition-all">
                Back to Products
              </button>
            )}
            {/* condition pill */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
              {condition}
            </span>

            <button
              type="button"
              onClick={() => saveProduct(false)}
              disabled={isSaving || loadingProduct || !productLoaded}
              className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-black text-gray-700 hover:bg-gray-50 transition-all"
            >
              {isSaving ? "Saving…" : productId ? "Save Changes" : "Save Draft"}
            </button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => saveProduct(true)}
              disabled={isSaving || loadingProduct || !productLoaded}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white shadow-sm transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)` }}
            >
              <AnimatePresence mode="wait">
                {published ? (
                  <motion.span key="ok" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} /> Published!
                  </motion.span>
                ) : (
                  <motion.span key="pub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                    {isSaving ? "Saving…" : <><Eye size={13} /> {productId ? "Save & Publish" : "Publish"}</>}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {loadingProduct && (
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-500">
          Loading product details…
        </div>
      )}

      {formMessage && (
        <div
          role={formMessage.type === "error" ? "alert" : "status"}
          className={`max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 text-sm font-semibold ${
            formMessage.type === "error" ? "text-red-700" : "text-[#007a52]"
          }`}
        >
          <div className={`rounded-xl px-4 py-3 border ${
            formMessage.type === "error"
              ? "border-red-200 bg-red-50"
              : "border-emerald-200 bg-emerald-50"
          }`}>
            {formMessage.text}
          </div>
        </div>
      )}

      {/* ── Three-column grid ── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="xl:grid xl:grid-cols-[220px_1fr_280px] lg:grid lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* ════════════════════════════════════
              LEFT NAV (xl only, sticky)
          ════════════════════════════════════ */}
          <aside className="hidden xl:block sticky top-[80px] self-start">
            <div className="bg-white rounded-2xl shadow-sm p-3 overflow-hidden">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-3">
                Sections
              </p>
              <div className="relative">
                {/* vertical connector line */}
                <div className="absolute left-[22px] top-3 bottom-3 w-px bg-gray-100 z-0" />
                <nav className="space-y-0.5 relative z-10">
                  {SECTIONS.map(({ id, num, label, icon: Icon }) => {
                    const isActive = activeSection === id;
                    return (
                      <button
                        key={id}
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
                        <span className={`text-xs transition-all ${
                          isActive ? "font-black text-gray-900" : "font-semibold text-gray-500 group-hover:text-gray-700"
                        }`}>
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
              MAIN FORM
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
                {/* Toolbar */}
                <div className="flex items-center gap-1 flex-wrap px-3 py-2 bg-gray-50 border border-gray-200 rounded-t-xl border-b-0">
                  {[
                    { Icon: Bold,      label: "Bold"      },
                    { Icon: Italic,    label: "Italic"    },
                    { Icon: Underline, label: "Underline" },
                    { Icon: List,      label: "List"      },
                    { Icon: Link2,     label: "Link"      },
                  ].map(({ Icon, label }) => (
                    <button key={label} title={label} type="button"
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all">
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
                    setMainImageFile(f);
                    setMainImg(URL.createObjectURL(f));
                  }}
                  label="Drag & drop or click to upload main product image"
                />
              </Field>

              <Field label="Gallery Images" hint="Up to 6 additional photos">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {gallery.map((prev, i) => (
                    <UploadZone
                      key={i}
                      preview={prev}
                      onFile={f => handleGallery(i, f)}
                      small
                    />
                  ))}
                </div>
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
                {existingVideoFileUrl && (
                  <p className="mt-2 text-xs text-gray-500">
                    Existing product video will be kept unless you upload a replacement.
                  </p>
                )}
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
                      setTaxRuleId("");
                    }}
                    className={inp}
                  >
                    <option value="">Select category…</option>
                    {category && !INIT_CATS.some(item => item.name === category) && <option key={`current-${category}`} value={category}>{category}</option>}
                    {INIT_CATS.filter(c => c.active).map(c => (
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
                    <option value="">Select sub-category…</option>
                    {subcat && !filteredSubcats.some(item => item.name === subcat) && <option key={`current-${subcat}`} value={subcat}>{subcat}</option>}
                    {filteredSubcats.filter(s => s.active).map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Brand" required>
                  <select
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className={inp}
                  >
                    <option value="">Select brand…</option>
                    {brand && !INIT_BRANDS.some(item => item.name === brand) && <option key={`current-${brand}`} value={brand}>{brand}</option>}
                    {INIT_BRANDS.filter(b => b.active).map(b => (
                      <option key={b.id} value={b.name}>{b.name} {b.countryFlag}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Assign to Sellers" hint="Toggle to assign/unassign">
                <div className="flex flex-wrap gap-2">
                  {SELLERS.map(s => {
                    const on = sellerIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSeller(s.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all"
                        style={on
                          ? { borderColor: G, background: `${G}12`, color: GD }
                          : { borderColor: "#e5e7eb", background: "#f9fafb", color: "#6b7280" }}
                      >
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                          style={{ background: on ? G : "#9ca3af" }}>
                          {s.name[0]}
                        </span>
                        {s.name}
                        <span className="text-[10px] opacity-70">· {s.city}</span>
                      </button>
                    );
                  })}
                </div>
              </Field>

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
                      type="number" value={mrp} onChange={e => setMrp(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`}
                    />
                  </div>
                </Field>
                <Field label="Selling Price (₹)" required hint="Price shown to buyers">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">₹</span>
                    <input
                      type="number" value={selling} onChange={e => setSelling(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`}
                    />
                  </div>
                </Field>
                <Field label="Cost / Purchase Price (₹)" hint="Hidden from public">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">₹</span>
                    <input
                      type="number" value={cost} onChange={e => setCost(e.target.value)}
                      placeholder="0" className={`${inp} pl-7`}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Tax Rule" hint="Tax is added on top. Choose the correct tax scope for this product and sale.">
                <select
                  value={taxRuleId}
                  onChange={e => setTaxRuleId(e.target.value)}
                  className={inp}
                  disabled={taxRulesLoading || !applicableTaxRules.length}
                >
                  <option value="">
                    {taxRulesLoading ? "Loading tax rules…" : "No tax rule"}
                  </option>
                  {applicableTaxRules.map(rule => (
                    <option key={rule.id} value={rule.id} disabled={!rule.active || rule.slab === null}>
                      {rule.name} · {rule.rateLabel || `${rule.slab}%`} ({rule.type}; {rule.category})
                    </option>
                  ))}
                </select>
                {taxRulesError && <p role="alert" className="mt-1 text-xs text-red-600">{taxRulesError}</p>}
                {!taxRulesLoading && !taxRulesError && taxRules.length > 0 && applicableTaxRules.length === 0 && (
                  <p className="mt-1 text-xs text-amber-700">No active tax rules with configured rates are available.</p>
                )}
                {!taxRulesLoading && taxRules.some(rule => rule.active && rule.slab === null) && (
                  <p className="mt-1 text-xs text-amber-700">Variable-rate rules are listed in Tax Rules but cannot be used until a numeric rate is configured.</p>
                )}
                {selectedTaxRule && (!selectedTaxRule.active || selectedTaxRule.slab === null) && (
                  <p className="mt-1 text-xs text-red-600">This saved tax rule is inactive or has no configured numeric rate. Choose an active configured rule before saving.</p>
                )}
              </Field>

              {selectedTaxRule && selectedTaxRule.active && selectedTaxRule.slab !== null && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <p className="mb-2 text-xs font-black text-emerald-900">Price calculation · {selectedTaxRule.name}</p>
                  <div className="space-y-1.5 text-xs text-emerald-800">
                    <div className="flex justify-between gap-3"><span>Selling price</span><span>{fmt(sellN)}</span></div>
                    <div className="flex justify-between gap-3"><span>{selectedTaxRule.type} ({selectedTaxRule.rateLabel || `${selectedTaxRule.slab}%`})</span><span>+ {fmt(taxAmount)}</span></div>
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
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                      style={{ background: G }}>
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
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                      style={{ background: G }}>
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
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)}
                    placeholder="0" className={inp} />
                </Field>
                <Field label="Low Stock Alert" hint="Notify when stock ≤ this">
                  <input type="number" value={lowAlert} onChange={e => setLowAlert(e.target.value)}
                    placeholder="e.g. 10" className={inp} />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="SKU" hint="Stock Keeping Unit">
                  <div className="relative">
                    <input value={sku} onChange={e => setSku(e.target.value)}
                      placeholder="e.g. ELC-APL-IP15PM" className={`${inp} pr-[88px] font-mono`} />
                    <button type="button" onClick={autoSku}
                      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black text-white transition-all hover:opacity-90"
                      style={{ background: G }}>
                      <Zap size={9} /> Auto
                    </button>
                  </div>
                </Field>
                <Field label="Barcode / EAN" hint="For inventory scanning">
                  <input value={barcode} onChange={e => setBarcode(e.target.value)}
                    placeholder="e.g. 8901234567890" className={`${inp} font-mono`} />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Minimum Order Qty (MOQ)">
                  <input type="number" value={moq} onChange={e => setMoq(e.target.value)}
                    placeholder="1" className={inp} />
                </Field>
                <Field label="Product Condition">
                  <select value={condition} onChange={e => setCondition(e.target.value)} className={inp}>
                    <option>New</option>
                    <option>Refurbished</option>
                    <option>Used</option>
                  </select>
                </Field>
              </div>
            </SectionCard>

            {/* 06 Variants ─────────────────────── */}
            <SectionCard id="section-06" num="06" title="Product Variants" icon={Layers}>
              {/* Toggle row */}
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
                            {/* Variant card header */}
                            <div className="flex items-center justify-between px-5 py-3 bg-gray-50/80 border-b border-gray-100">
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                                  style={{ background: G }}>
                                  {idx + 1}
                                </span>
                                <span className="text-sm font-bold text-gray-700">
                                  {v.title
                                    ? `${v.variationType || "Variant"}: ${v.title}`
                                    : v.variationType || `Variant ${idx + 1}`}
                                </span>
                              </div>
                              <button type="button" onClick={() => removeVariant(v.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-all">
                                <X size={13} />
                              </button>
                            </div>

                            {/* Variant card body */}
                            <div className="p-5 space-y-5">
                              {/* Type + Title */}
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

                              {/* Price + Offer Price + Stock */}
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

                              {/* Status */}
                              <Field label="Product Status" required>
                                <div className="flex gap-3">
                                  {(["Active", "Inactive"] as const).map(s => (
                                    <button key={s} type="button"
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

                              {/* Variant Images */}
                              <Field label="Product Variant Images" hint="Multiple images supported">
                                <div className="flex flex-wrap gap-2">
                                  {v.images.map((img, i) => {
                                    const imgRef = React.createRef<HTMLInputElement>();
                                    return (
                                      <div key={i} className="relative group">
                                        <input ref={imgRef} type="file" accept="image/*" className="hidden"
                                          onChange={e => { const f = e.target.files?.[0]; if (f) addVariantImg(v.id, i, f); }} />
                                        <div
                                          onClick={() => imgRef.current?.click()}
                                          className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
                                            img ? "border-[#009966]/40" : "border-gray-200 hover:border-[#009966] hover:bg-[#009966]/5"
                                          }`}
                                        >
                                          {img ? (
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="flex flex-col items-center gap-1 text-gray-300 hover:text-[#009966] transition-colors">
                                              <Upload size={16} />
                                              <span className="text-[9px] font-bold">Add</span>
                                            </div>
                                          )}
                                        </div>
                                        {img && (
                                          <button type="button"
                                            onClick={() => { const imgs = [...v.images]; imgs[i] = undefined; updateVariant(v.id, "images", imgs); }}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={9} />
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {/* Add more slot */}
                                  <button type="button"
                                    onClick={() => updateVariant(v.id, "images", [...v.images, undefined])}
                                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[#009966] hover:text-[#009966] transition-all">
                                    <Plus size={16} />
                                    <span className="text-[9px] font-bold mt-0.5">More</span>
                                  </button>
                                </div>
                              </Field>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Add Another Variant */}
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
            </SectionCard>

            {/* 07 Shipping ─────────────────────── */}
            <SectionCard id="section-07" num="07" title="Shipping & Delivery" icon={Truck}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Weight (kg)">
                  <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                    placeholder="0.0" className={inp} />
                </Field>
                <Field label="Length (cm)">
                  <input type="number" value={dimL} onChange={e => setDimL(e.target.value)}
                    placeholder="0" className={inp} />
                </Field>
                <Field label="Width (cm)">
                  <input type="number" value={dimW} onChange={e => setDimW(e.target.value)}
                    placeholder="0" className={inp} />
                </Field>
                <Field label="Height (cm)">
                  <input type="number" value={dimH} onChange={e => setDimH(e.target.value)}
                    placeholder="0" className={inp} />
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
                <input value={seoTitle} onChange={e => e.target.value.length <= 70 && setSeoTitle(e.target.value)}
                  placeholder="Optimised title for search engines" className={inp} />
              </Field>

              <Field label="SEO Keywords" hint="Comma-separated">
                <input value={seoKw} onChange={e => setSeoKw(e.target.value)}
                  placeholder="silk saree, kanjeevaram, traditional wear, ethnic" className={inp} />
              </Field>

              <Field label="Image Alt Text" hint="Describe the main image for accessibility">
                <input value={seoAlt} onChange={e => setSeoAlt(e.target.value)}
                  placeholder="e.g. Red Kanjeevaram silk saree with gold border" className={inp} />
              </Field>

              <Field label="Meta Description" hint={`${seoMeta.length}/170`}>
                <textarea value={seoMeta}
                  onChange={e => e.target.value.length <= 170 && setSeoMeta(e.target.value)}
                  rows={3}
                  placeholder="Short snippet shown in Google search results…"
                  className={`${inp} resize-none`} />
              </Field>

              {/* SERP preview */}
              {(seoTitle || name) && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-0.5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Search Preview</p>
                  <p className="text-sm font-bold text-blue-700 truncate">{seoTitle || name}</p>
                  <p className="text-[11px] text-green-700">bharatbazar.in › products › {
                    (seoTitle || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)
                  }</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{seoMeta || shortDesc || "No meta description yet."}</p>
                </div>
              )}
            </SectionCard>

            {/* 09 Other Details ────────────────── */}
            <SectionCard id="section-09" num="09" title="Other Details" icon={FileText}>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Manufacturer">
                  <input value={manufacturer} onChange={e => setManufacturer(e.target.value)}
                    placeholder="e.g. Samsung Electronics Co. Ltd." className={inp} />
                </Field>
                <Field label="Made In">
                  <select value={madeIn} onChange={e => setMadeIn(e.target.value)} className={inp}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="HSN Code" hint="Required for GST filing">
                  <input value={hsn} onChange={e => setHsn(e.target.value)}
                    placeholder="e.g. 8517" className={`${inp} font-mono`} />
                </Field>
                <Field label="Max Qty per Cart" hint="Leave blank = no limit">
                  <input type="number" value={maxCart} onChange={e => setMaxCart(e.target.value)}
                    placeholder="Unlimited" className={inp} />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Warranty Period" hint="e.g. 1 Year, 6 Months">
                  <input value={warranty} onChange={e => setWarranty(e.target.value)}
                    placeholder="e.g. 1 Year" className={inp} />
                </Field>
                <Field label="Warranty Type">
                  <select value={warrantyType} onChange={e => setWarrantyType(e.target.value)} className={inp}>
                    {WARRANTY_TYPES.map(w => <option key={w}>{w}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="FSSAI Licence No." hint="Required for food & beverage products">
                <input value={fssai} onChange={e => setFssai(e.target.value)}
                  placeholder="e.g. 10012345000123" className={`${inp} font-mono`} />
              </Field>

              {/* Toggles: tax / returnable */}
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
                      <input type="number" value={returnDays} onChange={e => setReturnDays(e.target.value)}
                        placeholder="7" className={`${inp} max-w-[200px]`} />
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>

            {/* 10 Specifications ────────────────── */}
            <SectionCard id="section-10" num="10" title="Specifications" icon={ListChecks}>
              {/* Template quick-fill chips */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Load template for category</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SPEC_TEMPLATES).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => loadTemplate(cat)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spec rows */}
              {specs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-200 text-center bg-gray-50/50">
                  <ListChecks size={28} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No specifications added yet — use a template to quick-fill or add manually.</p>
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
                          className="w-full text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white placeholder:text-gray-300"
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={e => updateSpec(spec.id, "value", e.target.value)}
                          placeholder="Enter value"
                          className="w-full text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white placeholder:text-gray-300"
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

              {/* Add spec button */}
              <button
                type="button"
                onClick={() => addSpec()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-sm font-semibold text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Plus size={14} />
                Add Specification
              </button>
            </SectionCard>

          </main>

          {/* ════════════════════════════════════
              RIGHT SIDEBAR (lg+, sticky)
          ════════════════════════════════════ */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-[80px] self-start">

            {/* Status card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black"
                      style={{ background: `${G}12`, color: GD }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: G }} />
                      {condition}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${
                      active ? "" : "bg-gray-100 text-gray-500"
                    }`}
                      style={active ? { background: `${G}12`, color: GD } : {}}>
                      <span className={`w-1.5 h-1.5 rounded-full inline-block`}
                        style={{ background: active ? G : "#9ca3af" }} />
                      {active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Publish card — green gradient */}
            <div className="rounded-2xl overflow-hidden shadow-sm"
              style={{ background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)` }}>
              <div className="p-5 space-y-4">
                {/* Product name preview */}
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-wider mb-1">Ready to publish</p>
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
                  <button
                    type="button"
                    disabled={isSaving || loadingProduct || !productLoaded}
                    onClick={() => saveProduct(false)}
                    className="w-full py-2.5 rounded-xl border-2 border-white/40 text-sm font-black text-white hover:bg-white/10 transition-all disabled:opacity-60"
                  >
                    {isSaving ? "Saving…" : productId ? "Save Changes" : "Save Draft"}
                  </button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => saveProduct(true)}
                    disabled={isSaving || loadingProduct || !productLoaded}
                    className="w-full py-2.5 rounded-xl bg-white text-sm font-black transition-all hover:bg-white/90 flex items-center justify-center gap-2"
                    style={{ color: GD }}
                  >
                    <AnimatePresence mode="wait">
                      {published ? (
                        <motion.span key="ok" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                          <CheckCircle2 size={14} /> Published!
                        </motion.span>
                      ) : (
                        <motion.span key="pub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                          {isSaving ? "Saving…" : <><Eye size={14} /> {productId ? "Save & Publish" : "Publish Product"}</>}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <CheckCircle2 size={13} className="text-gray-400" />
                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Completion</span>
              </div>
              <div className="p-5 space-y-2">
                {[
                  { label: "Product Name",  done: name.trim().length > 0     },
                  { label: "Category",      done: category !== ""             },
                  { label: "Main Image",    done: !!mainImg                   },
                  { label: "Selling Price", done: sellN > 0                   },
                  { label: "Stock Qty",     done: stock !== ""                },
                  { label: "Brand",         done: brand !== ""                },
                  { label: "SEO Title",     done: seoTitle.trim().length > 0  },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      done ? "scale-100" : "scale-90"
                    }`}
                      style={{ background: done ? G : "#f3f4f6" }}>
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

export default AddProductPage;
