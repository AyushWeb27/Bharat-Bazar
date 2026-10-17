import { useState } from "react";
import { motion } from "motion/react";
import { Bike, Plus, Edit2, Trash2, Star, Phone } from "lucide-react";
import { Toggle, Modal, DeleteConfirm, Field, PageHeader, SearchBar, StatCard, SectionCard } from "./shared/ui";
import { G, inp } from "./shared/constants";

type Status = "available" | "on_delivery" | "offline";
type Vehicle = "Bike" | "Scooter" | "Bicycle";

type DeliveryBoy = {
  id: number;
  name: string;
  phone: string;
  zone: string;
  vehicle: Vehicle;
  ordersToday: number;
  ordersTotal: number;
  rating: number;
  status: Status;
  active: boolean;
};

const INIT_BOYS: DeliveryBoy[] = [
  { id: 1,  name: "Rajesh Kumar",   phone: "98765 43210", zone: "Zone A", vehicle: "Bike",    ordersToday: 12, ordersTotal: 1847, rating: 4.8, status: "available",   active: true  },
  { id: 2,  name: "Suresh Yadav",   phone: "97654 32109", zone: "Zone A", vehicle: "Bike",    ordersToday: 9,  ordersTotal: 1234, rating: 4.6, status: "on_delivery", active: true  },
  { id: 3,  name: "Mahesh Sharma",  phone: "96543 21098", zone: "Zone B", vehicle: "Scooter", ordersToday: 15, ordersTotal: 2103, rating: 4.9, status: "available",   active: true  },
  { id: 4,  name: "Vikram Singh",   phone: "95432 10987", zone: "Zone C", vehicle: "Bike",    ordersToday: 0,  ordersTotal: 987,  rating: 4.5, status: "offline",     active: true  },
  { id: 5,  name: "Deepak Patel",   phone: "94321 09876", zone: "Zone D", vehicle: "Bike",    ordersToday: 7,  ordersTotal: 1456, rating: 4.7, status: "on_delivery", active: true  },
  { id: 6,  name: "Arjun Nair",     phone: "93210 98765", zone: "Zone E", vehicle: "Scooter", ordersToday: 11, ordersTotal: 1789, rating: 4.8, status: "available",   active: true  },
  { id: 7,  name: "Prashant Joshi", phone: "92109 87654", zone: "Zone F", vehicle: "Bicycle", ordersToday: 4,  ordersTotal: 456,  rating: 4.3, status: "on_delivery", active: true  },
  { id: 8,  name: "Sanjay Meena",   phone: "91098 76543", zone: "Zone G", vehicle: "Bike",    ordersToday: 0,  ordersTotal: 234,  rating: 4.1, status: "offline",     active: false },
  { id: 9,  name: "Kiran Reddy",    phone: "90987 65432", zone: "Zone H", vehicle: "Bike",    ordersToday: 8,  ordersTotal: 1102, rating: 4.6, status: "available",   active: true  },
  { id: 10, name: "Anand Pillai",   phone: "89876 54321", zone: "Zone I", vehicle: "Scooter", ordersToday: 5,  ordersTotal: 678,  rating: 4.4, status: "on_delivery", active: true  },
];

const STATUS_META: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  available:   { label: "Available",   color: "#009966", bg: "#e8fff6", dot: "#22c55e" },
  on_delivery: { label: "On Delivery", color: "#d97706", bg: "#fffbeb", dot: "#f59e0b" },
  offline:     { label: "Offline",     color: "#9ca3af", bg: "#f9fafb", dot: "#d1d5db" },
};

const ZONES    = ["Zone A","Zone B","Zone C","Zone D","Zone E","Zone F","Zone G","Zone H","Zone I"];
const VEHICLES: Vehicle[] = ["Bike","Scooter","Bicycle"];
const BLANK: Omit<DeliveryBoy,"id"> = { name:"", phone:"", zone:"Zone A", vehicle:"Bike", ordersToday:0, ordersTotal:0, rating:5.0, status:"available", active:true };

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

export function DeliveryBoyPage() {
  const [rows, setRows]           = useState(INIT_BOYS);
  const [q, setQ]                 = useState("");
  const [zoneF, setZoneF]         = useState("All");
  const [statusF, setStatusF]     = useState("All");
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState<DeliveryBoy | null>(null);
  const [delId, setDelId]         = useState<number | null>(null);
  const [form, setForm]           = useState(BLANK);

  const filtered = rows.filter(r => {
    const qOk = !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.phone.includes(q);
    const zOk = zoneF === "All" || r.zone === zoneF;
    const sOk = statusF === "All" || r.status === statusF;
    return qOk && zOk && sOk;
  });

  const openAdd = () => { setForm(BLANK); setEditing(null); setModal(true); };
  const openEdit = (r: DeliveryBoy) => {
    setForm({ name:r.name, phone:r.phone, zone:r.zone, vehicle:r.vehicle, ordersToday:r.ordersToday, ordersTotal:r.ordersTotal, rating:r.rating, status:r.status, active:r.active });
    setEditing(r); setModal(true);
  };
  const save = () => {
    if (!form.name.trim()) return;
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

  const todayTotal = rows.reduce((s, r) => s + r.ordersToday, 0);
  const avgRating  = (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1);

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Delivery / Delivery Boys" title="Delivery Boys"
        subtitle="Track agents, zones, live status and performance ratings" count={rows.length}>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
          <Plus size={15}/> Add Agent
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Agents"  val={rows.length}                                       color={G}        icon={Bike}  />
        <StatCard label="Available"     val={rows.filter(r => r.status === "available").length}  color="#10b981"  icon={Bike}  />
        <StatCard label="On Delivery"   val={rows.filter(r => r.status === "on_delivery").length} color="#f59e0b" icon={Bike}  />
        <StatCard label="Offline"       val={rows.filter(r => r.status === "offline").length}    color="#9ca3af"  icon={Bike}  />
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Deliveries Today", val: todayTotal.toString(),       color: G,        sub: "across all agents" },
          { label: "Avg Rating",       val: avgRating,                   color: "#f59e0b", sub: "fleet average"     },
          { label: "Active Agents",    val: rows.filter(r=>r.active).length.toString(), color: "#6366f1", sub: "currently enabled" },
          { label: "Zones Covered",    val: new Set(rows.map(r=>r.zone)).size.toString(), color: "#0d9488", sub: "delivery zones"   },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <div className="w-1.5 h-4 rounded-full mb-2" style={{ background: s.color }}/>
            <p className="text-xl font-black text-gray-900 leading-none mb-0.5">{s.val}</p>
            <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">{s.label}</p>
            <p className="text-[9px] text-gray-400 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <SectionCard>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <SearchBar value={q} onChange={setQ} placeholder="Search name or phone…" />
          <select value={zoneF} onChange={e => setZoneF(e.target.value)} className={`${inp} w-auto`}>
            <option>All</option>
            {ZONES.map(z => <option key={z}>{z}</option>)}
          </select>
          <select value={statusF} onChange={e => setStatusF(e.target.value)} className={`${inp} w-auto`}>
            <option value="All">All Status</option>
            <option value="available">Available</option>
            <option value="on_delivery">On Delivery</option>
            <option value="offline">Offline</option>
          </select>
          <span className="ml-auto self-center text-xs text-gray-400">{filtered.length} agent{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(r => {
            const sm = STATUS_META[r.status];
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-200 bg-white p-4 relative overflow-hidden group hover:shadow-md transition-all">
                {/* Status accent strip */}
                <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl" style={{ background: sm.color }}/>

                {/* Header: avatar + name + toggle */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black text-white"
                        style={{ background: r.active ? G : "#9ca3af" }}>
                        {initials(r.name)}
                      </div>
                      {/* Online dot */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                        style={{ background: sm.dot }}/>
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 leading-tight">{r.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone size={9} className="text-gray-400"/>
                        <span className="text-[10px] text-gray-400">{r.phone}</span>
                      </div>
                    </div>
                  </div>
                  <Toggle checked={r.active} onChange={() => toggleActive(r.id)}/>
                </div>

                {/* Tags: status, zone, vehicle */}
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ color: sm.color, background: sm.bg }}>
                    {sm.label}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600">{r.zone}</span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-600">{r.vehicle}</span>
                </div>

                {/* Metrics: today / total / rating */}
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {[
                    { val: r.ordersToday.toString(),              label: "Today",  color: "#6366f1" },
                    { val: r.ordersTotal.toLocaleString("en-IN"), label: "Total",  color: G         },
                    { val: r.rating.toFixed(1),                   label: "Rating", color: "#d97706", star: true },
                  ].map((m, mi) => (
                    <div key={mi} className="text-center py-2 rounded-xl bg-gray-50">
                      <div className="flex items-center justify-center gap-0.5">
                        {m.star && <Star size={9} className="fill-amber-400 text-amber-400"/>}
                        <p className="text-sm font-black" style={{ color: m.color }}>{m.val}</p>
                      </div>
                      <p className="text-[9px] uppercase tracking-wide text-gray-400 mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Action buttons (hover) */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(r)}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all flex items-center justify-center gap-1">
                    <Edit2 size={10}/> Edit
                  </button>
                  <button onClick={() => setDelId(r.id)}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all flex items-center justify-center gap-1">
                    <Trash2 size={10}/> Remove
                  </button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-gray-400">No delivery agents match your filters</div>
          )}
        </div>
      </SectionCard>

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Delivery Agent" : "Add Delivery Agent"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Full Name">
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Rajesh Kumar" className={inp}/>
              </Field>
            </div>
            <Field label="Phone Number">
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="98765 43210" className={inp}/>
            </Field>
            <Field label="Zone">
              <select value={form.zone} onChange={e => set("zone", e.target.value)} className={inp}>
                {ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
            </Field>
            <Field label="Vehicle Type">
              <select value={form.vehicle} onChange={e => set("vehicle", e.target.value as Vehicle)} className={inp}>
                {VEHICLES.map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value as Status)} className={inp}>
                <option value="available">Available</option>
                <option value="on_delivery">On Delivery</option>
                <option value="offline">Offline</option>
              </select>
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
                {editing ? "Save Changes" : "Add Agent"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <DeleteConfirm
        open={delId !== null} onClose={() => setDelId(null)} onConfirm={() => confirmDelete(delId!)}
        title="Remove Agent" message={`Remove delivery agent "${rows.find(r => r.id === delId)?.name}" from the system?`}
      />
    </div>
  );
}

export default DeliveryBoyPage;
