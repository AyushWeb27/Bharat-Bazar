import { useState } from "react";
import { motion } from "motion/react";
import {
  UserCog, Plus, Edit2, Trash2, Shield,
  Crown, Headphones, BarChart2, Clock,
} from "lucide-react";
import { Toggle, Modal, DeleteConfirm, Field, PageHeader, SearchBar, StatCard, SectionCard } from "./shared/ui";
import { G, inp } from "./shared/constants";

type Role = "Super Admin" | "Admin" | "Manager" | "Support" | "Analyst";
type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: "active" | "inactive";
  lastLogin: string;
  joined: string;
};

const ROLE_META: Record<Role, { color: string; bg: string; Icon: React.ElementType }> = {
  "Super Admin": { color: "#009966", bg: "#e8fff6", Icon: Crown      },
  "Admin":       { color: "#6366f1", bg: "#eef2ff", Icon: Shield     },
  "Manager":     { color: "#3b82f6", bg: "#eff6ff", Icon: UserCog    },
  "Support":     { color: "#0d9488", bg: "#f0fdfa", Icon: Headphones },
  "Analyst":     { color: "#8b5cf6", bg: "#f5f3ff", Icon: BarChart2  },
};

const ROLES: Role[] = ["Super Admin","Admin","Manager","Support","Analyst"];

const INIT_USERS: AdminUser[] = [
  { id: 1, name: "Arjun Sharma",   email: "arjun@bharatbazar.com",   role: "Super Admin", status: "active",   lastLogin: "5 Sep 2026, 9:14 am",  joined: "Jan 2024" },
  { id: 2, name: "Priya Nair",     email: "priya@bharatbazar.com",    role: "Admin",       status: "active",   lastLogin: "5 Sep 2026, 8:47 am",  joined: "Mar 2024" },
  { id: 3, name: "Rahul Verma",    email: "rahul@bharatbazar.com",    role: "Manager",     status: "active",   lastLogin: "4 Sep 2026, 6:32 pm",  joined: "Jun 2024" },
  { id: 4, name: "Sneha Reddy",    email: "sneha@bharatbazar.com",    role: "Support",     status: "active",   lastLogin: "4 Sep 2026, 5:19 pm",  joined: "Jul 2024" },
  { id: 5, name: "Vikash Kumar",   email: "vikash@bharatbazar.com",   role: "Manager",     status: "inactive", lastLogin: "2 Sep 2026, 11:05 am", joined: "Aug 2024" },
  { id: 6, name: "Meera Iyer",     email: "meera@bharatbazar.com",    role: "Support",     status: "active",   lastLogin: "5 Sep 2026, 7:30 am",  joined: "Aug 2024" },
  { id: 7, name: "Sunil Gupta",    email: "sunil@bharatbazar.com",    role: "Analyst",     status: "active",   lastLogin: "3 Sep 2026, 2:15 pm",  joined: "Sep 2024" },
  { id: 8, name: "Kavya Menon",    email: "kavya@bharatbazar.com",    role: "Support",     status: "inactive", lastLogin: "28 Aug 2026, 10:00 am",joined: "Oct 2024" },
];

const BLANK: Omit<AdminUser,"id"> = { name:"", email:"", role:"Support", status:"active", lastLogin:"–", joined:"" };
const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

export function UsersPage() {
  const [rows, setRows]         = useState(INIT_USERS);
  const [q, setQ]               = useState("");
  const [roleF, setRoleF]       = useState("All");
  const [statusF, setStatusF]   = useState("All");
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState<AdminUser | null>(null);
  const [delId, setDelId]       = useState<number | null>(null);
  const [form, setForm]         = useState(BLANK);

  const filtered = rows.filter(r => {
    const qOk = !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.email.toLowerCase().includes(q.toLowerCase());
    const rOk = roleF === "All" || r.role === roleF;
    const sOk = statusF === "All" || (statusF === "Active" ? r.status === "active" : r.status !== "active");
    return qOk && rOk && sOk;
  });

  const openAdd = () => { setForm(BLANK); setEditing(null); setModal(true); };
  const openEdit = (r: AdminUser) => {
    setForm({ name:r.name, email:r.email, role:r.role, status:r.status, lastLogin:r.lastLogin, joined:r.joined });
    setEditing(r); setModal(true);
  };
  const save = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (editing) {
      setRows(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r));
    } else {
      setRows(p => [...p, { id: Date.now(), ...form, lastLogin: "–", joined: "Sep 2026" }]);
    }
    setModal(false);
  };
  const confirmDelete = (id: number) => { setRows(p => p.filter(r => r.id !== id)); setDelId(null); };
  const toggleStatus  = (id: number) => setRows(p => p.map(r => r.id === id ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r));
  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Miscellaneous / Users" title="Admin Users"
        subtitle="Manage admin accounts, roles and access permissions" count={rows.length}>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: G }}>
          <Plus size={15}/> Add User
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {ROLES.map(role => {
          const m = ROLE_META[role];
          const count = rows.filter(r => r.role === role).length;
          const Icon = m.Icon;
          return (
            <motion.div key={role} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: m.bg }}>
                  <Icon size={13} style={{ color: m.color }}/>
                </div>
                <span className="text-xl font-black text-gray-900">{count}</span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-tight">{role}</p>
            </motion.div>
          );
        })}
      </div>

      <SectionCard>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search name or email…" />
          <select value={roleF} onChange={e => setRoleF(e.target.value)} className={`${inp} w-auto`}>
            <option>All</option>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={statusF} onChange={e => setStatusF(e.target.value)} className={`${inp} w-auto`}>
            {["All","Active","Inactive"].map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="ml-auto self-center text-xs text-gray-400">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["User","Email","Role","Status","Last Login","Joined",""].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider pb-3 pr-4 last:pr-0 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(r => {
                const rm = ROLE_META[r.role];
                const RoleIcon = rm.Icon;
                return (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="group hover:bg-gray-50/60 transition-colors">
                    {/* User */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0"
                          style={{ background: r.status === "active" ? rm.color : "#9ca3af" }}>
                          {initials(r.name)}
                        </div>
                        <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{r.name}</span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="py-3 pr-4">
                      <span className="text-xs text-gray-500">{r.email}</span>
                    </td>
                    {/* Role */}
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                        style={{ color: rm.color, background: rm.bg }}>
                        <RoleIcon size={10}/> {r.role}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="py-3 pr-4">
                      <Toggle
                        checked={r.status === "active"}
                        onChange={() => toggleStatus(r.id)}
                      />
                    </td>
                    {/* Last Login */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={10} className="text-gray-400 shrink-0"/>
                        <span className="text-[11px] text-gray-500 whitespace-nowrap">{r.lastLogin}</span>
                      </div>
                    </td>
                    {/* Joined */}
                    <td className="py-3 pr-4">
                      <span className="text-[11px] text-gray-400">{r.joined}</span>
                    </td>
                    {/* Actions */}
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
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-gray-400">No users match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit User" : "Add Admin User"}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Full Name">
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Arjun Sharma" className={inp}/>
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Email Address">
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="arjun@bharatbazar.com" className={inp}/>
              </Field>
            </div>
            <Field label="Role">
              <select value={form.role} onChange={e => set("role", e.target.value as Role)} className={inp}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value as "active"|"inactive")} className={inp}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>

          {/* Role preview */}
          {form.role && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50">
              {(() => { const m = ROLE_META[form.role]; const I = m.Icon; return (
                <>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: m.bg }}>
                    <I size={13} style={{ color: m.color }}/>
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: m.color }}>{form.role}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {form.role === "Super Admin" ? "Full access to all admin features" :
                       form.role === "Admin"       ? "Manage products, orders and settings" :
                       form.role === "Manager"     ? "Manage products, catalogue and reports" :
                       form.role === "Support"     ? "View orders and handle customer tickets" :
                       "View analytics, reports and dashboards"}
                    </p>
                  </div>
                </>
              ); })()}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={save} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all" style={{ background: G }}>
              {editing ? "Save Changes" : "Add User"}
            </button>
          </div>
        </div>
      </Modal>

      <DeleteConfirm
        open={delId !== null} onClose={() => setDelId(null)} onConfirm={() => confirmDelete(delId!)}
        title="Remove User" message={`Remove admin access for "${rows.find(r => r.id === delId)?.name}"? They will no longer be able to log in.`}
      />
    </div>
  );
}

export default UsersPage;
