import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2, XCircle, FolderOpen, Layers, Pencil, Trash2,
} from "lucide-react";
import type { GroupCat } from "./shared/types";
import { INIT_GROUPS } from "./shared/data";
import { G, toSlug, GROUP_COLORS, inp, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, Modal, Field, Toggle, StatusPill, DeleteConfirm } from "./shared/ui";

export function GroupCategoryPage() {
  const [groups,   setGroups  ] = useState<GroupCat[]>(INIT_GROUPS);
  const [search,   setSearch  ] = useState("");
  const [modalOpen,setModalOpen] = useState(false);
  const [editId,   setEditId  ] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GroupCat | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", color: G, description: "", active: true });

  const filtered = useMemo(() =>
    groups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.slug.includes(search.toLowerCase()))
  , [groups, search]);

  function openAdd()  { setEditId(null); setForm({name:"",slug:"",color:G,description:"",active:true}); setModalOpen(true); }
  function openEdit(g: GroupCat) { setEditId(g.id); setForm({name:g.name,slug:g.slug,color:g.color,description:"",active:g.active}); setModalOpen(true); }
  function handleSave() {
    if (!form.name.trim()) return;
    if (editId !== null) { setGroups(prev => prev.map(g => g.id === editId ? { ...g, ...form } : g)); }
    else { setGroups(prev => [...prev, { id: Math.max(...groups.map(g=>g.id))+1, ...form, cats: 0, products: 0 }]); }
    setModalOpen(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Catalogue › Group Category" title="Group Categories" subtitle="Top-level category groups" count={groups.length} onAdd={openAdd} addLabel="Add Group" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Groups"    val={groups.length}                                 color="#6366f1" icon={FolderOpen}  />
        <StatCard label="Active"          val={groups.filter(g=>g.active).length}             color={G}       icon={CheckCircle2}/>
        <StatCard label="Inactive"        val={groups.filter(g=>!g.active).length}            color="#ef4444" icon={XCircle}     />
        <StatCard label="Total Categories" val={groups.reduce((a,g)=>a+g.cats,0)}            color="#f59e0b" icon={Layers}      />
      </div>
      <div className={card}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100"><SearchBar value={search} onChange={setSearch} placeholder="Search group categories…" /></div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <AnimatePresence>
            {filtered.map(g => (
              <motion.div key={g.id} layout initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
                className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all group">
                <div className="h-1.5 rounded-full mb-4" style={{background:g.color}}/>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:`${g.color}15`}}><FolderOpen size={18} style={{color:g.color}}/></div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>openEdit(g)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all"><Pencil size={12}/></button>
                    <button onClick={()=>setDeleteTarget(g)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={12}/></button>
                  </div>
                </div>
                <p className="text-sm font-black text-gray-900 mb-0.5">{g.name}</p>
                <p className="text-[10px] font-mono text-gray-400 mb-3">/{g.slug}</p>
                <div className="flex items-center justify-between text-[11px] mb-3">
                  <span className="text-gray-500"><span className="font-bold text-gray-700">{g.cats}</span> categories</span>
                  <span className="text-gray-500"><span className="font-bold text-gray-700">{g.products.toLocaleString("en-IN")}</span> products</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <StatusPill active={g.active}/>
                  <Toggle on={g.active} onChange={()=>setGroups(p=>p.map(x=>x.id===g.id?{...x,active:!x.active}:x))}/>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length===0 && <div className="col-span-full py-10 text-center text-sm text-gray-400">No groups found</div>}
        </div>
      </div>
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editId?"Edit Group Category":"Add Group Category"}>
        <Field label="Group Name"><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value,slug:editId?f.slug:toSlug(e.target.value)}))} placeholder="e.g. Electronics & Tech" className={inp}/></Field>
        <Field label="Slug"><input value={form.slug} onChange={e=>setForm(f=>({...f,slug:toSlug(e.target.value)}))} placeholder="electronics-tech" className={`${inp} font-mono text-[13px]`}/></Field>
        <Field label="Color"><div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl bg-gray-50">{GROUP_COLORS.map(col=><button key={col} onClick={()=>setForm(f=>({...f,color:col}))} className="w-7 h-7 rounded-lg transition-all border-2" style={{background:col,borderColor:form.color===col?"#fff":col,boxShadow:form.color===col?`0 0 0 2px ${col}`:"none",transform:form.color===col?"scale(1.2)":"scale(1)"}}/>)}</div></Field>
        <Field label="Description"><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief description…" rows={2} className={`${inp} resize-none`}/></Field>
        <Field label="Status"><div className="flex items-center gap-3 pt-1"><Toggle on={form.active} onChange={()=>setForm(f=>({...f,active:!f.active}))}/><span className="text-sm text-gray-600 font-medium">{form.active?"Active":"Inactive"}</span></div></Field>
        <div className="flex gap-3 pt-2"><button onClick={()=>setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button><button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all" style={{background:G}}>{editId?"Save Changes":"Add Group"}</button></div>
      </Modal>
      <DeleteConfirm open={!!deleteTarget} name={deleteTarget?.name??""} onClose={()=>setDeleteTarget(null)} onConfirm={()=>deleteTarget&&setGroups(p=>p.filter(g=>g.id!==deleteTarget.id))}/>
    </div>
  );
}

export default GroupCategoryPage;
