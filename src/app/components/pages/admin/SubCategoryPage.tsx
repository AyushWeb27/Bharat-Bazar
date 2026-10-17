import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2, XCircle, GitBranch, Layers, Pencil, Trash2, Hash,
} from "lucide-react";
import type { SubCat } from "./shared/types";
import { INIT_SUBCATS, INIT_CATS } from "./shared/data";
import { G, toSlug, inp, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, Modal, Field, Toggle, StatusPill, DeleteConfirm } from "./shared/ui";

export function SubCategoryPage() {
  const [subcats,  setSubcats ] = useState<SubCat[]>(INIT_SUBCATS);
  const [search,   setSearch  ] = useState("");
  const [filterPar,setFilterPar] = useState("All");
  const [modalOpen,setModalOpen] = useState(false);
  const [editId,   setEditId  ] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubCat | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", parent: INIT_CATS[0].name, sort: 1, active: true });

  const parents  = ["All", ...INIT_CATS.map(c => c.name)];
  const filtered = useMemo(() => subcats.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.name.toLowerCase().includes(q) || s.parent.toLowerCase().includes(q))
      && (filterPar === "All" || s.parent === filterPar);
  }), [subcats, search, filterPar]);

  function openAdd()  { setEditId(null); setForm({name:"",slug:"",parent:INIT_CATS[0].name,sort:subcats.length+1,active:true}); setModalOpen(true); }
  function openEdit(s: SubCat) { setEditId(s.id); setForm({name:s.name,slug:s.slug,parent:s.parent,sort:s.sort,active:s.active}); setModalOpen(true); }
  function handleSave() {
    if (!form.name.trim()) return;
    if (editId !== null) { setSubcats(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s)); }
    else { setSubcats(prev => [...prev, { id: Math.max(...subcats.map(s=>s.id))+1, ...form, products: 0 }]); }
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Catalogue › SubCategory" title="SubCategories" subtitle="Manage product sub-categories" count={subcats.length} onAdd={openAdd} addLabel="Add SubCategory" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total"          val={subcats.length}                                                color="#6366f1" icon={GitBranch}   />
        <StatCard label="Active"         val={subcats.filter(s=>s.active).length}                           color={G}       icon={CheckCircle2} />
        <StatCard label="Inactive"       val={subcats.filter(s=>!s.active).length}                          color="#ef4444" icon={XCircle}      />
        <StatCard label="Parent Cats"    val={[...new Set(subcats.map(s=>s.parent))].length}                color="#f59e0b" icon={Layers}       />
      </div>
      <div className={card}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search subcategories…"/>
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 overflow-x-auto">
            {parents.slice(0,6).map(p=>(
              <button key={p} onClick={()=>setFilterPar(p)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
                style={filterPar===p?{background:G,color:"#fff"}:{color:"#6b7280"}}>{p==="All"?"All":p.split(" ")[0]}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="border-b border-gray-100">
              {["#","Sub-Category","Slug","Parent Category","Sort","Products","Status","Actions"].map(h=>(
                <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((s,i)=>(
                <motion.tr key={s.id} layout initial={{opacity:0}} animate={{opacity:1}} className="group hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{i+1}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-1.5 h-6 rounded-full shrink-0" style={{background:`${G}60`}}/><span className="text-sm font-bold text-gray-800 whitespace-nowrap">{s.name}</span></div></td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1 text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg w-fit"><Hash size={9}/>{s.slug}</span></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg whitespace-nowrap"><Layers size={10}/> {s.parent}</span></td>
                  <td className="px-4 py-3"><span className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-black text-gray-500">{s.sort}</span></td>
                  <td className="px-4 py-3"><span className="text-xs font-bold text-gray-700">{s.products.toLocaleString("en-IN")}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Toggle on={s.active} onChange={()=>setSubcats(p=>p.map(x=>x.id===s.id?{...x,active:!x.active}:x))}/><StatusPill active={s.active}/></div></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1"><button onClick={()=>openEdit(s)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all"><Pencil size={13}/></button><button onClick={()=>setDeleteTarget(s)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={13}/></button></div></td>
                </motion.tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No subcategories found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100"><p className="text-[11px] text-gray-400">Showing {filtered.length} of {subcats.length}</p></div>
      </div>
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editId?"Edit SubCategory":"Add SubCategory"}>
        <Field label="SubCategory Name"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value,slug:editId?f.slug:toSlug(e.target.value)}))} placeholder="e.g. Smartphones" className={inp}/></Field>
        <Field label="Slug"><input value={form.slug} onChange={e=>setForm(f=>({...f,slug:toSlug(e.target.value)}))} placeholder="smartphones" className={`${inp} font-mono text-[13px]`}/></Field>
        <Field label="Parent Category"><select value={form.parent} onChange={e=>setForm(f=>({...f,parent:e.target.value}))} className={inp}>{INIT_CATS.map(c=><option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}</select></Field>
        <Field label="Sort Order"><input type="number" min={1} value={form.sort} onChange={e=>setForm(f=>({...f,sort:parseInt(e.target.value)||1}))} className={inp}/></Field>
        <Field label="Status"><div className="flex items-center gap-3 pt-1"><Toggle on={form.active} onChange={()=>setForm(f=>({...f,active:!f.active}))}/><span className="text-sm text-gray-600 font-medium">{form.active?"Active":"Inactive"}</span></div></Field>
        <div className="flex gap-3 pt-2"><button onClick={()=>setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button><button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all" style={{background:G}}>{editId?"Save Changes":"Add SubCategory"}</button></div>
      </Modal>
      <DeleteConfirm open={!!deleteTarget} name={deleteTarget?.name??""} onClose={()=>setDeleteTarget(null)} onConfirm={()=>deleteTarget&&setSubcats(p=>p.filter(s=>s.id!==deleteTarget.id))}/>
    </div>
  );
}

export default SubCategoryPage;
