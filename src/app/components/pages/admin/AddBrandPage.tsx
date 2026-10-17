import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award, CheckCircle2, Globe, ImageIcon, Layers,
  Settings, Upload, Trash2, BadgeCheck, Star,
} from "lucide-react";
import { INIT_CATS } from "./shared/data";
import { G, toSlug, inp, card } from "./shared/constants";
import { SectionCard, Field, PageHeader, Toggle } from "./shared/ui";

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

export function AddBrandPage() {
  const [name,     setName    ] = useState("");
  const [slug,     setSlug    ] = useState("");
  const [category, setCategory] = useState(INIT_CATS[0].name);
  const [logoColor,setLogoColor] = useState(G);
  const [country,  setCountry ] = useState("India");
  const [countryFlag, setCountryFlag] = useState("🇮🇳");
  const [website,  setWebsite ] = useState("");
  const [desc,     setDesc    ] = useState("");
  const [featured, setFeatured] = useState(false);
  const [premium,  setPremium ] = useState(false);
  const [active,   setActive  ] = useState(true);
  const [logoUrl,  setLogoUrl ] = useState("");
  const [saved,    setSaved   ] = useState(false);

  const logoInit = name ? name.split(" ").map(w=>w[0]).join("").slice(0,2) : "?";
  const LOGO_COLORS = ["#111111","#1428a0","#eb0029","#e91e8c","#8B4513","#722f37","#2d6a4f","#52b788","#0082c3","#c41e3a","#ff6600","#ef4444","#0052cc","#f59e0b",G,"#6366f1"];
  const COUNTRIES = [{flag:"🇮🇳",name:"India"},{flag:"🇺🇸",name:"USA"},{flag:"🇨🇳",name:"China"},{flag:"🇩🇪",name:"Germany"},{flag:"🇫🇷",name:"France"},{flag:"🇨🇭",name:"Switzerland"},{flag:"🇰🇷",name:"South Korea"},{flag:"🇬🇧",name:"UK"},{flag:"🇯🇵",name:"Japan"}];

  function handleSave() { setSaved(true); setTimeout(()=>setSaved(false),2500); }

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Brands › Add Brand" title="Add New Brand" subtitle="Register a new brand in the catalogue" />

      <div className="flex flex-col xl:flex-row gap-5 items-start">

        {/* LEFT */}
        <div className="flex-1 min-w-0 space-y-4">
          <SectionCard title="Brand Identity" icon={Award}>
            <Field label="Brand Name">
              <input value={name} onChange={e=>{setName(e.target.value);if(!slug)setSlug(toSlug(e.target.value));}} placeholder="e.g. Apple, Fabindia, boAt" className={inp}/>
            </Field>
            <Field label="Slug">
              <input value={slug} onChange={e=>setSlug(toSlug(e.target.value))} placeholder="apple" className={`${inp} font-mono text-[13px]`}/>
            </Field>
            <Field label="Description">
              <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Tell customers about this brand — history, values, speciality…" rows={4} className={`${inp} resize-none`}/>
            </Field>
          </SectionCard>

          <SectionCard title="Brand Logo" icon={ImageIcon}>
            {/* Upload zone */}
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={e=>{
                const file=e.target.files?.[0];
                if(!file)return;
                const reader=new FileReader();
                reader.onload=ev=>setLogoUrl(ev.target?.result as string);
                reader.readAsDataURL(file);
                e.target.value="";
              }}/>
              {logoUrl ? (
                <div className="relative rounded-2xl border-2 border-gray-200 overflow-hidden bg-white flex items-center justify-center" style={{height:160}}>
                  <img src={logoUrl} alt="logo preview" style={{maxHeight:"100%",maxWidth:"100%",objectFit:"contain",padding:16}}/>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{background:"rgba(0,0,0,0.12)"}}>
                    <span className="bg-white rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 shadow-md flex items-center gap-1.5">
                      <Upload size={12}/> Change Logo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#009966] bg-gray-50 hover:bg-[#009966]/5 transition-all flex flex-col items-center justify-center gap-3 p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{background:`${G}15`}}>
                    <Upload size={22} color={G}/>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Click to upload logo</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, SVG, WebP · Max 2MB</p>
                  </div>
                </div>
              )}
            </label>

            {logoUrl && (
              <button onClick={()=>setLogoUrl("")}
                className="w-full mt-2 py-2 rounded-xl border border-gray-200 text-xs font-bold text-red-400 hover:bg-red-50 hover:border-red-300 flex items-center justify-center gap-1.5 transition-all">
                <Trash2 size={12}/> Remove Logo
              </button>
            )}

            {/* Fallback color (only when no image) */}
            {!logoUrl && (
              <div className="mt-4">
                <p className="text-[11px] font-semibold text-gray-500 mb-2">Or choose a brand color as placeholder:</p>
                <div className="flex flex-wrap gap-2">
                  {LOGO_COLORS.map(col=>(
                    <button key={col} onClick={()=>setLogoColor(col)}
                      className="w-9 h-9 rounded-xl text-[10px] font-black text-white transition-all shadow-sm"
                      style={{background:col,outline:logoColor===col?`3px solid ${col}`:"none",outlineOffset:2,transform:logoColor===col?"scale(1.18)":"scale(1)"}}>
                      {logoInit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live preview */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 mt-4">
              <BrandLogo logoColor={logoColor} logoInit={logoInit} logoUrl={logoUrl||undefined} size={56}/>
              <div>
                <p className="text-base font-black text-gray-900">{name||"Brand Name"}</p>
                <p className="text-xs text-gray-400">/{slug||"brand-slug"}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {featured && <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{color:"#f59e0b"}}><Star size={9}/> Featured</span>}
                  {premium  && <span className="flex items-center gap-0.5 text-[10px] font-bold" style={{color:"#8b5cf6"}}><BadgeCheck size={9}/> Premium</span>}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT */}
        <div className="w-full xl:w-72 shrink-0 space-y-4">
          <SectionCard title="Classification" icon={Layers}>
            <Field label="Category">
              <select value={category} onChange={e=>setCategory(e.target.value)} className={inp}>
                {INIT_CATS.map(c=><option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
              </select>
            </Field>
            <Field label="Country of Origin">
              <select value={country} onChange={e=>{const c=COUNTRIES.find(x=>x.name===e.target.value);setCountry(e.target.value);setCountryFlag(c?.flag??"🌐");}} className={inp}>
                {COUNTRIES.map(c=><option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
              </select>
            </Field>
            <Field label="Official Website">
              <div className="relative">
                <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                <input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="apple.com" className={`${inp} pl-8`}/>
              </div>
            </Field>
          </SectionCard>

          <SectionCard title="Settings" icon={Settings}>
            {[
              {label:"Active",         sub:"Show brand on store",     val:active,   set:()=>setActive(v=>!v)},
              {label:"Featured Brand", sub:"Highlight on homepage",   val:featured, set:()=>setFeatured(v=>!v)},
              {label:"Premium Partner",sub:"Mark as verified partner",val:premium,  set:()=>setPremium(v=>!v)},
            ].map((item,i)=>(
              <div key={i} className="flex items-center justify-between">
                <div><p className="text-xs font-bold text-gray-700">{item.label}</p><p className="text-[10px] text-gray-400">{item.sub}</p></div>
                <Toggle on={item.val} onChange={item.set}/>
              </div>
            ))}
          </SectionCard>
        </div>
      </div>

      {/* Action bar */}
      <div className={`${card} px-5 py-4 flex items-center justify-between gap-4 sticky bottom-4`}>
        <p className="text-xs text-gray-400 hidden sm:block">Complete all required fields before publishing</p>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Save Draft</button>
          <motion.button whileTap={{scale:0.97}} onClick={handleSave}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all"
            style={{background: saved ? "#10b981" : G}}>
            <AnimatePresence mode="wait">
              {saved
                ? <motion.span key="done" initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} className="flex items-center gap-1.5"><CheckCircle2 size={14}/> Brand Added!</motion.span>
                : <motion.span key="pub"  initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}>Publish Brand</motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default AddBrandPage;
