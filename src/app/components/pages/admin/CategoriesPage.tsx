import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2, XCircle, Package, Layers, Pencil, Trash2, Hash,
} from "lucide-react";
import type { Cat } from "./shared/types";
import { INIT_CATS, INIT_GROUPS } from "./shared/data";
import { G, toSlug, inp, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, Modal, Field, Toggle, StatusPill, DeleteConfirm } from "./shared/ui";

export function CategoriesPage() {
  const [cats,      setCats     ] = useState<Cat[]>(INIT_CATS);
  const [search,    setSearch   ] = useState("");
  const [filterGrp, setFilterGrp] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId   ] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cat | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", group: INIT_GROUPS[0].name, emoji: "📦", active: true });

  const groups   = ["All", ...INIT_GROUPS.map(g => g.name)];
  const filtered = useMemo(() => cats.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.name.toLowerCase().includes(q) || c.slug.includes(q))
      && (filterGrp === "All" || c.group === filterGrp);
  }), [cats, search, filterGrp]);

  const EMOJIS = ["📦","💻","👗","🏠","💄","⚽","📚","🛒","🎮","🛋️","💍","🍕","🎵","🔧","🎨"];

  function openAdd()  { setEditId(null); setForm({ name:"",slug:"",group:INIT_GROUPS[0].name,emoji:"📦",active:true}); setModalOpen(true); }
  function openEdit(c: Cat) { setEditId(c.id); setForm({ name:c.name,slug:c.slug,group:c.group,emoji:c.emoji,active:c.active}); setModalOpen(true); }
  function handleSave() {
    if (!form.name.trim()) return;
    if (editId !== null) { setCats(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c)); }
    else { setCats(prev => [...prev, { id: Math.max(...cats.map(c=>c.id))+1, ...form, products: 0 }]); }
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Catalogue › Categories" title="Categories" subtitle="Manage all product categories" count={cats.length} onAdd={openAdd} addLabel="Add Category" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total"         val={cats.length}                                                       color="#6366f1" icon={Layers}      />
        <StatCard label="Active"        val={cats.filter(c=>c.active).length}                                   color={G}       icon={CheckCircle2} />
        <StatCard label="Inactive"      val={cats.filter(c=>!c.active).length}                                  color="#ef4444" icon={XCircle}      />
        <StatCard label="Total Products" val={cats.reduce((a,c)=>a+c.products,0).toLocaleString("en-IN")}      color="#f59e0b" icon={Package}      />
      </div>
      <div className={card}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search categories…" />
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
            {groups.slice(0,5).map(g => (
              <button key={g} onClick={() => setFilterGrp(g)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
                style={filterGrp===g ? {background:G,color:"#fff"} : {color:"#6b7280"}}>
                {g==="All"?"All":g.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="border-b border-gray-100">
              {["#","Category","Slug","Group","Products","Status","Actions"].map(h => (
                <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c,i) => (
                <motion.tr key={c.id} layout initial={{opacity:0}} animate={{opacity:1}} className="group hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{i+1}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-base">{c.emoji}</div><span className="text-sm font-bold text-gray-800 whitespace-nowrap">{c.name}</span></div></td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1 text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg w-fit"><Hash size={9}/>{c.slug}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-500 whitespace-nowrap">{c.group}</span></td>
                  <td className="px-4 py-3"><span className="text-xs font-bold text-gray-700">{c.products.toLocaleString("en-IN")}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Toggle on={c.active} onChange={()=>setCats(p=>p.map(x=>x.id===c.id?{...x,active:!x.active}:x))}/><StatusPill active={c.active}/></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1"><button onClick={()=>openEdit(c)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all"><Pencil size={13}/></button><button onClick={()=>setDeleteTarget(c)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={13}/></button></div></td>
                </motion.tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No categories found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100"><p className="text-[11px] text-gray-400">Showing {filtered.length} of {cats.length}</p></div>
      </div>
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editId?"Edit Category":"Add Category"}>
        <Field label="Category Name"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value,slug:editId?f.slug:toSlug(e.target.value)}))} placeholder="e.g. Electronics" className={inp}/></Field>
        <Field label="Slug"><input value={form.slug} onChange={e=>setForm(f=>({...f,slug:toSlug(e.target.value)}))} placeholder="electronics" className={`${inp} font-mono text-[13px]`}/></Field>
        <Field label="Group Category"><select value={form.group} onChange={e=>setForm(f=>({...f,group:e.target.value}))} className={inp}>{INIT_GROUPS.map(g=><option key={g.id} value={g.name}>{g.name}</option>)}</select></Field>
        <Field label="Icon / Emoji"><div className="grid grid-cols-8 gap-1.5 p-2 border border-gray-200 rounded-xl bg-gray-50">{EMOJIS.map(em=><button key={em} onClick={()=>setForm(f=>({...f,emoji:em}))} className={`h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.emoji===em?"bg-white shadow-sm border-2":"hover:bg-white"}`} style={form.emoji===em?{borderColor:G}:{}}>{em}</button>)}</div></Field>
        <Field label="Status"><div className="flex items-center gap-3 pt-1"><Toggle on={form.active} onChange={()=>setForm(f=>({...f,active:!f.active}))}/><span className="text-sm text-gray-600 font-medium">{form.active?"Active":"Inactive"}</span></div></Field>
        <div className="flex gap-3 pt-2"><button onClick={()=>setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button><button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all" style={{background:G}}>{editId?"Save Changes":"Add Category"}</button></div>
      </Modal>
      <DeleteConfirm open={!!deleteTarget} name={deleteTarget?.name??""} onClose={()=>setDeleteTarget(null)} onConfirm={()=>deleteTarget&&setCats(p=>p.filter(c=>c.id!==deleteTarget.id))}/>
    </div>
  );
}

export default CategoriesPage;
