import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award, CheckCircle2, Star, BadgeCheck, Globe,
  Pencil, Trash2, Upload,
} from "lucide-react";
import type { Brand } from "./shared/types";
import { G, toSlug, getBrandCatColor, inp, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, Modal, Field, Toggle, StatusPill, DeleteConfirm } from "./shared/ui";

function BrandLogo({ logoColor, logoInit, logoUrl, size = 40 }: { logoColor: string; logoInit: string; logoUrl?: string; size?: number }) {
  if (logoUrl) {
    return (
      <div className="rounded-xl shrink-0 overflow-hidden bg-white border border-gray-100 flex items-center justify-center"
        style={{ width: size, height: size }}>
        <img src={logoUrl} alt={logoInit} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
    );
  }
  return (
    <div className="rounded-xl flex items-center justify-center text-white font-black shrink-0 select-none"
      style={{ width: size, height: size, background: logoColor, fontSize: size * 0.3 }}>
      {logoInit}
    </div>
  );
}

type CategoryOption = { id: number; name: string; emoji: string };

export function AllBrandsPage() {
  const [brands,    setBrands   ] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [pageError, setPageError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [search,    setSearch   ] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterSts, setFilterSts] = useState("all");
  const [viewMode,  setViewMode ] = useState<"grid"|"list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId   ] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", slug: "", category: "", logoColor: G, logoUrl: "", description: "",
    country: "India", countryFlag: "🇮🇳", website: "",
    featured: false, active: true, premium: false,
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch("/api/admin/brands", { cache: "no-store" }),
      fetch("/api/admin/categories", { cache: "no-store" }),
    ])
      .then(async ([brandResponse, categoryResponse]) => {
        const [brandResult, categoryResult] = await Promise.all([
          brandResponse.json(),
          categoryResponse.json(),
        ]);
        if (!brandResponse.ok || !brandResult.success) {
          throw new Error(brandResult.message || "Failed to load brands.");
        }
        if (!categoryResponse.ok || !categoryResult.success || !Array.isArray(categoryResult.categories)) {
          throw new Error(categoryResult.message || "Failed to load categories.");
        }
        if (!mounted) return;
        setBrands(brandResult.brands as Brand[]);
        const options = categoryResult.categories.filter(
          (item: unknown): item is CategoryOption =>
            Boolean(item && typeof item === "object" &&
              "id" in item && typeof item.id === "number" &&
              "name" in item && typeof item.name === "string" &&
              "emoji" in item && typeof item.emoji === "string")
        );
        setCategories(options);
        setCategoryError(options.length ? "" : "No categories found in the database.");
        setForm(current => ({
          ...current,
          category: current.category || options[0]?.name || "",
        }));
      })
      .catch(error => {
        if (mounted) {
          const message = error instanceof Error ? error.message : "Failed to load brands and categories.";
          setPageError(message);
          setCategoryError(message);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
          setCategoriesLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  const cats     = ["All", ...categories.map(category => category.name)];
  const filtered = useMemo(() => brands.filter(b => {
    const q = search.toLowerCase();
    const matchQ = !q || b.name.toLowerCase().includes(q) || b.slug.includes(q);
    const matchC = filterCat === "All" || b.category === filterCat;
    const matchS = filterSts === "all"
      || (filterSts === "active"   && b.active)
      || (filterSts === "inactive" && !b.active)
      || (filterSts === "featured" && b.featured)
      || (filterSts === "premium"  && b.premium);
    return matchQ && matchC && matchS;
  }), [brands, search, filterCat, filterSts]);

  const LOGO_COLORS = ["#111111","#1428a0","#eb0029","#e91e8c","#8B4513","#722f37","#2d6a4f","#52b788","#0082c3","#c41e3a","#ff6600","#ef4444","#0052cc","#f59e0b",G,"#6366f1"];
  const COUNTRIES = [
    { flag:"🇮🇳",name:"India"}, { flag:"🇺🇸",name:"USA"}, { flag:"🇨🇳",name:"China"},
    { flag:"🇩🇪",name:"Germany"}, { flag:"🇫🇷",name:"France"}, { flag:"🇨🇭",name:"Switzerland"},
    { flag:"🇰🇷",name:"South Korea"}, { flag:"🇬🇧",name:"UK"}, { flag:"🇯🇵",name:"Japan"},
  ];

  function openAdd() {
    setEditId(null);
    setLogoFile(null);
    setRemoveLogo(false);
    setPageError("");
    setForm({ name:"",slug:"",category:categories[0]?.name ?? "",logoColor:G,logoUrl:"",description:"",country:"India",countryFlag:"🇮🇳",website:"",featured:false,active:true,premium:false });
    setModalOpen(true);
  }
  function openEdit(b: Brand) {
    setEditId(b.id);
    setLogoFile(null);
    setRemoveLogo(false);
    setPageError("");
    setForm({ name:b.name,slug:b.slug,category:b.category,logoColor:b.logoColor,logoUrl:b.logoUrl??"",description:b.description??"",country:b.country,countryFlag:b.countryFlag,website:b.website,featured:b.featured,active:b.active,premium:b.premium });
    setModalOpen(true);
  }
  async function handleSave() {
    setPageError("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/brands", {
        method: editId === null ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editId, logoUrl: undefined }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to save brand.");
      const savedBrand = result.brand as Brand;
      let savedLogoUrl = savedBrand.logoUrl;
      setBrands(previous => editId === null
        ? [...previous.filter(brand => brand.id !== savedBrand.id), savedBrand]
        : previous.map(brand => brand.id === savedBrand.id ? { ...savedBrand, logoUrl: brand.logoUrl } : brand));
      if (logoFile) {
        const imageData = new FormData();
        imageData.append("image", logoFile);
        const imageResponse = await fetch(`/api/admin/brands/${savedBrand.id}/image`, { method: "POST", body: imageData });
        const imageResult = await imageResponse.json();
        if (!imageResponse.ok || !imageResult.success) throw new Error(`Brand saved, but the image upload failed: ${imageResult.message || "Upload failed."}`);
        savedLogoUrl = imageResult.logoUrl;
      } else if (removeLogo && editId !== null) {
        const imageResponse = await fetch(`/api/admin/brands/${savedBrand.id}/image`, { method: "DELETE" });
        const imageResult = await imageResponse.json();
        if (!imageResponse.ok || !imageResult.success) throw new Error(imageResult.message || "Failed to remove brand image.");
        savedLogoUrl = undefined;
      }
      const finalBrand = { ...savedBrand, logoUrl: savedLogoUrl };
      setBrands(previous => previous.some(brand => brand.id === finalBrand.id)
        ? previous.map(brand => brand.id === finalBrand.id ? finalBrand : brand)
        : [...previous, finalBrand]);
      setModalOpen(false);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Failed to save brand.");
    } finally {
      setSaving(false);
    }
  }
  async function updateBrand(id: number, updates: Partial<Brand>) {
    const current = brands.find(brand => brand.id === id);
    if (!current) return;
    try {
      const response = await fetch("/api/admin/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...current, ...updates, id, logoColor: current.logoColor, description: current.description ?? "" }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to update brand.");
      setBrands(previous => previous.map(brand => brand.id === id ? { ...result.brand, logoUrl: current.logoUrl } : brand));
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Failed to update brand.");
    }
  }
  function toggleStatus(id: number) {
    const brand = brands.find(item => item.id === id);
    if (brand) void updateBrand(id, { active: !brand.active });
  }
  function toggleFeatured(id: number) {
    const brand = brands.find(item => item.id === id);
    if (brand) void updateBrand(id, { featured: !brand.featured });
  }

  async function deleteBrand(id: number) {
    try {
      const response = await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to delete brand.");
      setBrands(previous => previous.filter(brand => brand.id !== id));
      setDeleteTarget(null);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Failed to delete brand.");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Brands › All Brands" title="All Brands" subtitle="Manage your brand catalogue" count={brands.length}
        onAdd={openAdd} addLabel="Add Brand" />
      {pageError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</p>}
      {isLoading && <p className="text-sm text-gray-500">Loading brands…</p>}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Brands"  val={brands.length}                         color="#6366f1" icon={Award}       />
        <StatCard label="Active"        val={brands.filter(b=>b.active).length}     color={G}       icon={CheckCircle2}/>
        <StatCard label="Featured"      val={brands.filter(b=>b.featured).length}   color="#f59e0b" icon={Star}        />
        <StatCard label="Premium"       val={brands.filter(b=>b.premium).length}    color="#8b5cf6" icon={BadgeCheck}  />
      </div>

      {/* Toolbar */}
      <div className={`${card}`}>
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search brands…" />
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600 outline-none focus:border-[#009966] bg-white font-semibold">
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
            {[["all","All"],["active","Active"],["inactive","Inactive"],["featured","Featured"],["premium","Premium"]].map(([v,l]) => (
              <button key={v} onClick={()=>setFilterSts(v)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
                style={filterSts===v?{background:G,color:"#fff"}:{color:"#6b7280"}}>{l}</button>
            ))}
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 ml-auto bg-gray-50 border border-gray-200 rounded-xl p-1">
            {(["grid","list"] as const).map(mode => (
              <button key={mode} onClick={()=>setViewMode(mode)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all capitalize"
                style={viewMode===mode?{background:G,color:"#fff"}:{color:"#6b7280"}}>{mode}</button>
            ))}
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <AnimatePresence>
              {filtered.map(b => (
                <motion.div key={b.id} layout initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
                  className="relative border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all group cursor-pointer text-center">

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {b.premium && <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{background:"#8b5cf620"}}><BadgeCheck size={11} color="#8b5cf6"/></span>}
                    {b.featured && <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{background:"#f59e0b20"}}><Star size={10} color="#f59e0b"/></span>}
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>openEdit(b)} className="w-6 h-6 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-blue-500 transition-all shadow-sm">
                      <Pencil size={11}/>
                    </button>
                    <button onClick={()=>setDeleteTarget(b)} className="w-6 h-6 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-red-500 transition-all shadow-sm">
                      <Trash2 size={11}/>
                    </button>
                  </div>

                  <div className="flex justify-center mb-3 mt-2">
                    <BrandLogo logoColor={b.logoColor} logoInit={b.logoInit} logoUrl={b.logoUrl} size={48} />
                  </div>

                  <p className="text-sm font-black text-gray-900 leading-tight mb-1">{b.name}</p>
                  <p className="text-[10px] font-bold mb-2 px-2 py-0.5 rounded-full inline-block"
                    style={{ background: `${getBrandCatColor(b.category)}15`, color: getBrandCatColor(b.category) }}>
                    {b.category}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-0.5">{b.countryFlag} {b.country.split(" ")[0]}</span>
                    <span><b className="text-gray-700">{b.products}</b> prods</span>
                  </div>

                  <div className="flex items-center justify-between mt-2.5">
                    <StatusPill active={b.active} />
                    <Toggle on={b.active} onChange={()=>toggleStatus(b.id)} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && <div className="col-span-full py-10 text-center text-sm text-gray-400">No brands found</div>}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead><tr className="border-b border-gray-100">
                {["#","Brand","Category","Country","Website","Products","Featured","Status","Actions"].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b, i) => (
                  <motion.tr key={b.id} layout initial={{opacity:0}} animate={{opacity:1}} className="group hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <BrandLogo logoColor={b.logoColor} logoInit={b.logoInit} logoUrl={b.logoUrl} size={36} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-gray-800">{b.name}</span>
                            {b.premium && <BadgeCheck size={13} color="#8b5cf6" />}
                            {b.featured && <Star size={11} color="#f59e0b" />}
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">/{b.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${getBrandCatColor(b.category)}15`, color: getBrandCatColor(b.category) }}>
                        {b.category}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-500 whitespace-nowrap">{b.countryFlag} {b.country}</span></td>
                    <td className="px-4 py-3">
                      <a className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline whitespace-nowrap" href={b.website.startsWith("http")?b.website:`https://${b.website}`} target="_blank" rel="noreferrer">
                        <Globe size={10}/> {b.website}
                      </a>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-gray-700">{b.products}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={()=>toggleFeatured(b.id)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={b.featured?{background:"#f59e0b20",color:"#f59e0b"}:{color:"#d1d5db"}}>
                        <Star size={14} fill={b.featured?"#f59e0b":"none"} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2"><Toggle on={b.active} onChange={()=>toggleStatus(b.id)}/><StatusPill active={b.active}/></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={()=>openEdit(b)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all"><Pencil size={13}/></button>
                        <button onClick={()=>setDeleteTarget(b)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">No brands found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-[11px] text-gray-400">Showing {filtered.length} of {brands.length} brands</p>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editId?"Edit Brand":"Add Brand"} wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Brand Name">
            <input value={form.name}
              onChange={e=>setForm(f=>({...f,name:e.target.value,slug:editId?f.slug:toSlug(e.target.value)}))}
              placeholder="e.g. Apple" className={inp}/>
          </Field>
          <Field label="Slug">
            <input value={form.slug} onChange={e=>setForm(f=>({...f,slug:toSlug(e.target.value)}))} placeholder="apple" className={`${inp} font-mono text-[13px]`}/>
          </Field>
          <Field label="Category" required>
            <select
              value={form.category}
              onChange={e=>setForm(f=>({...f,category:e.target.value}))}
              className={inp}
              disabled={categoriesLoading || categories.length === 0}
            >
              <option value="">{categoriesLoading ? "Loading categories…" : "Select a category…"}</option>
              {categories.map(c=><option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
            </select>
            {categoryError && <p role="alert" className="mt-1 text-xs text-red-600">{categoryError}</p>}
          </Field>
          <Field label="Country of Origin">
            <select value={form.country} onChange={e=>{const found=COUNTRIES.find(x=>x.name===e.target.value);setForm(f=>({...f,country:e.target.value,countryFlag:found?found.flag:"🌐"}))}} className={inp}>
              {COUNTRIES.map(c=>(
                <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Website URL">
              <input value={form.website} onChange={e=>setForm(f=>({...f,website:e.target.value}))} placeholder="apple.com" className={inp}/>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} maxLength={1000} rows={3} className={`${inp} resize-none`}/>
            </Field>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-700">Brand Logo</p>
          <div className="flex items-start gap-4">
            {/* Preview box */}
            <div className="w-20 h-20 rounded-2xl shrink-0 overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center"
              style={form.logoUrl?{border:"2px solid #e5e7eb",background:"#fff"}:{}}>
              {form.logoUrl
                ? <img src={form.logoUrl} alt="logo" style={{width:"100%",height:"100%",objectFit:"contain",padding:6}}/>
                : <div className="w-full h-full rounded-xl flex items-center justify-center text-sm font-black text-white"
                    style={{background:form.logoColor}}>
                    {form.name?form.name.split(" ").map((w: string)=>w[0]).join("").slice(0,2):"?"}
                  </div>
              }
            </div>
            {/* Upload controls */}
            <div className="flex-1 space-y-2">
              <label className="cursor-pointer block">
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e=>{
                  const file=e.target.files?.[0];
                  if(!file)return;
                  if (file.size > 2 * 1024 * 1024) {
                    setPageError("Brand images must be smaller than 2 MB.");
                    e.target.value="";
                    return;
                  }
                  setLogoFile(file);
                  setRemoveLogo(false);
                  setForm(f=>({...f,logoUrl:URL.createObjectURL(file)}));
                  setPageError("");
                  e.target.value="";
                }}/>
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#009966] hover:text-[#009966] hover:bg-[#009966]/5 transition-all">
                  <Upload size={12}/> {form.logoUrl?"Change Logo":"Upload Logo"}
                </span>
              </label>
              {form.logoUrl && (
                <button onClick={()=>{setLogoFile(null);setRemoveLogo(true);setForm(f=>({...f,logoUrl:""}));}}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-red-400 hover:bg-red-50 hover:border-red-300 transition-all w-full">
                  <Trash2 size={12}/> Remove Logo
                </button>
              )}
              <p className="text-[10px] text-gray-400">PNG, JPG, WebP · Max 2MB</p>
            </div>
          </div>

          {/* Color fallback (shown when no image) */}
          {!form.logoUrl && (
            <div>
              <p className="text-[10px] text-gray-500 mb-2 font-semibold">Fallback color (used when no image):</p>
              <div className="flex flex-wrap gap-1.5">
                {LOGO_COLORS.map(col=>(
                  <button key={col} onClick={()=>setForm(f=>({...f,logoColor:col}))}
                    className="w-7 h-7 rounded-lg text-[9px] font-black text-white transition-all"
                    style={{background:col,outline:form.logoColor===col?`2px solid ${col}`:"none",outlineOffset:2,transform:form.logoColor===col?"scale(1.2)":"scale(1)"}}>
                    {form.name?form.name.split(" ").map((w: string)=>w[0]).join("").slice(0,2):"Aa"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview strip */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
          <BrandLogo logoColor={form.logoColor} logoInit={form.name?form.name.split(" ").map((w: string)=>w[0]).join("").slice(0,2):"?"} logoUrl={form.logoUrl||undefined} size={40}/>
          <div>
            <p className="text-sm font-black text-gray-900">{form.name||"Brand Name"}</p>
            <p className="text-[10px] text-gray-400">/{form.slug||"brand-slug"} · {form.countryFlag} {form.country}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            {label:"Active",    sub:"Visible on store", val:form.active,   set:()=>setForm(f=>({...f,active:!f.active}))},
            {label:"Featured",  sub:"Homepage banner",  val:form.featured, set:()=>setForm(f=>({...f,featured:!f.featured}))},
            {label:"Premium",   sub:"Verified partner", val:form.premium,  set:()=>setForm(f=>({...f,premium:!f.premium}))},
          ].map((item,i)=>(
            <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">{item.label}</span>
                <Toggle on={item.val} onChange={item.set}/>
              </div>
              <p className="text-[10px] text-gray-400">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={()=>setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60" style={{background:G}}>
            {saving ? "Saving…" : editId?"Save Changes":"Add Brand"}
          </button>
        </div>
      </Modal>

      <DeleteConfirm open={!!deleteTarget} name={deleteTarget?.name??""} onClose={()=>setDeleteTarget(null)}
        onConfirm={()=>deleteTarget&&void deleteBrand(deleteTarget.id)}/>
    </div>
  );
}

export default AllBrandsPage;
