import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Plus, Edit2, Trash2, IndianRupee } from "lucide-react";
import { Toggle, Modal, DeleteConfirm, Field, PageHeader, SearchBar, StatCard, SectionCard } from "./shared/ui";
import { G, inp } from "./shared/constants";

type Location = {
  id: number;
  name: string;
  zone: string;
  pincode: string;
  city: string;
  state: string;
  charge: number;
  freeAbove: number;
  active: boolean;
};

const INIT_LOCATIONS: Location[] = [
  { id: 1,  name: "South Mumbai",    zone: "Zone A", pincode: "400001", city: "Mumbai",    state: "Maharashtra", charge: 49, freeAbove: 499, active: true  },
  { id: 2,  name: "Bandra West",     zone: "Zone A", pincode: "400050", city: "Mumbai",    state: "Maharashtra", charge: 49, freeAbove: 499, active: true  },
  { id: 3,  name: "Connaught Place", zone: "Zone B", pincode: "110001", city: "Delhi",     state: "Delhi",       charge: 59, freeAbove: 599, active: true  },
  { id: 4,  name: "Lajpat Nagar",    zone: "Zone B", pincode: "110024", city: "Delhi",     state: "Delhi",       charge: 59, freeAbove: 599, active: true  },
  { id: 5,  name: "Koramangala",     zone: "Zone C", pincode: "560034", city: "Bengaluru", state: "Karnataka",   charge: 39, freeAbove: 399, active: true  },
  { id: 6,  name: "Indiranagar",     zone: "Zone C", pincode: "560038", city: "Bengaluru", state: "Karnataka",   charge: 39, freeAbove: 399, active: true  },
  { id: 7,  name: "Hitech City",     zone: "Zone D", pincode: "500081", city: "Hyderabad", state: "Telangana",   charge: 39, freeAbove: 399, active: true  },
  { id: 8,  name: "Shivaji Nagar",   zone: "Zone E", pincode: "411005", city: "Pune",      state: "Maharashtra", charge: 49, freeAbove: 499, active: true  },
  { id: 9,  name: "Salt Lake",       zone: "Zone F", pincode: "700064", city: "Kolkata",   state: "West Bengal", charge: 55, freeAbove: 549, active: false },
  { id: 10, name: "T. Nagar",        zone: "Zone G", pincode: "600017", city: "Chennai",   state: "Tamil Nadu",  charge: 45, freeAbove: 449, active: true  },
  { id: 11, name: "Vastrapur",       zone: "Zone H", pincode: "380015", city: "Ahmedabad", state: "Gujarat",     charge: 45, freeAbove: 449, active: true  },
  { id: 12, name: "Civil Lines",     zone: "Zone I", pincode: "302006", city: "Jaipur",    state: "Rajasthan",   charge: 55, freeAbove: 549, active: false },
];

const ZONES = ["Zone A","Zone B","Zone C","Zone D","Zone E","Zone F","Zone G","Zone H","Zone I","Zone J"];
const BLANK: Omit<Location,"id"> = { name:"", zone:"Zone A", pincode:"", city:"", state:"", charge:49, freeAbove:499, active:true };

export function ManageLocationPage() {
  const [rows, setRows]             = useState(INIT_LOCATIONS);
  const [q, setQ]                   = useState("");
  const [zoneF, setZoneF]           = useState("All");
  const [statusF, setStatusF]       = useState("All");
  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState<Location | null>(null);
  const [delId, setDelId]           = useState<number | null>(null);
  const [form, setForm]             = useState(BLANK);

  const filtered = rows.filter(r => {
    const qOk = !q || [r.name, r.city, r.state, r.pincode].some(v => v.toLowerCase().includes(q.toLowerCase()));
    const zOk = zoneF === "All" || r.zone === zoneF;
    const sOk = statusF === "All" || (statusF === "Active" ? r.active : !r.active);
    return qOk && zOk && sOk;
  });

  const openAdd = () => { setForm(BLANK); setEditing(null); setModal(true); };
  const openEdit = (r: Location) => {
    setForm({ name:r.name, zone:r.zone, pincode:r.pincode, city:r.city, state:r.state, charge:r.charge, freeAbove:r.freeAbove, active:r.active });
    setEditing(r); setModal(true);
  };
  const save = () => {
    if (!form.name.trim() || !form.pincode.trim() || !form.city.trim()) return;
    if (editing) {
      setRows(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r));
    } else {
      setRows(p => [...p, { id: Date.now(), ...form }]);
    }
    setModal(false);
  };
  const confirmDelete = (id: number) => { setRows(p => p.filter(r => r.id !== id)); setDelId(null); };
  const toggleActive  = (id: number) => setRows(p => p.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  const zones = new Set(rows.map(r => r.zone)).size;
  const avgCharge = Math.round(rows.reduce((s, r) => s + r.charge, 0) / rows.length);

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Delivery / Manage Location" title="Manage Location"
        subtitle="Configure delivery zones, pincodes and charge rules" count={rows.length}>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
          <Plus size={15}/> Add Location
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Locations" val={rows.length}                      color={G}         icon={MapPin}      />
        <StatCard label="Active"          val={rows.filter(r=>r.active).length}  color="#10b981"   icon={MapPin}      />
        <StatCard label="Zones"           val={zones}                            color="#6366f1"   icon={MapPin}      />
        <StatCard label="Avg Charge"      val={`₹${avgCharge}`}                  color="#f59e0b"   icon={IndianRupee} />
      </div>

      <SectionCard>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search name, city, pincode…" />
          <select value={zoneF} onChange={e=>setZoneF(e.target.value)} className={`${inp} w-auto`}>
            <option>All</option>
            {ZONES.map(z => <option key={z}>{z}</option>)}
          </select>
          <select value={statusF} onChange={e=>setStatusF(e.target.value)} className={`${inp} w-auto`}>
            {["All","Active","Inactive"].map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="ml-auto self-center text-xs text-gray-400">{filtered.length} location{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["Location","City","State","Pincode","Zone","Delivery Charge","Free Above","Status",""].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider pb-3 pr-4 last:pr-0 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(r => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="group hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${G}15` }}>
                        <MapPin size={13} style={{ color: G }}/>
                      </div>
                      <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-600 whitespace-nowrap">{r.city}</td>
                  <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">{r.state}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-gray-600">{r.pincode}</td>
                  <td className="py-3 pr-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600">{r.zone}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm font-black text-gray-900">₹{r.charge}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-gray-500">₹{r.freeAbove}+</span>
                  </td>
                  <td className="py-3 pr-4">
                    <Toggle checked={r.active} onChange={() => toggleActive(r.id)}/>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                        <Edit2 size={12}/>
                      </button>
                      <button onClick={() => setDelId(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={12}/>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-gray-400">No locations match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Location" : "Add Location"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Location Name">
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Koramangala 5th Block" className={inp}/>
              </Field>
            </div>
            <Field label="City">
              <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Mumbai" className={inp}/>
            </Field>
            <Field label="State">
              <input value={form.state} onChange={e => set("state", e.target.value)} placeholder="Maharashtra" className={inp}/>
            </Field>
            <Field label="Pincode">
              <input value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="400001" maxLength={6} className={inp}/>
            </Field>
            <Field label="Zone">
              <select value={form.zone} onChange={e => set("zone", e.target.value)} className={inp}>
                {ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
            </Field>
            <Field label="Delivery Charge (₹)">
              <input type="number" value={form.charge} onChange={e => set("charge", +e.target.value)} min={0} className={inp}/>
            </Field>
            <Field label="Free Delivery Above (₹)">
              <input type="number" value={form.freeAbove} onChange={e => set("freeAbove", +e.target.value)} min={0} className={inp}/>
            </Field>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Toggle checked={form.active} onChange={() => set("active", !form.active)}/>
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={save} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all" style={{ background: G }}>
                {editing ? "Save Changes" : "Add Location"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <DeleteConfirm
        open={delId !== null} onClose={() => setDelId(null)} onConfirm={() => confirmDelete(delId!)}
        title="Delete Location" message={`Remove "${rows.find(r => r.id === delId)?.name}" from delivery zones?`}
      />
    </div>
  );
}

export default ManageLocationPage;
