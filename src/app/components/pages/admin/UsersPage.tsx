import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  UserCog, Plus, Edit2, Trash2, Shield,
  Crown, Headphones, BarChart2, Clock, Lock, RefreshCw, Database
} from "lucide-react";
import { Toggle, Modal, DeleteConfirm, Field, PageHeader, SearchBar, SectionCard } from "./shared/ui";
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

const BLANK = {
  name: "",
  email: "",
  password: "",
  role: "Super Admin" as Role,
  status: "active" as "active" | "inactive",
  lastLogin: "–",
  joined: "Just now"
};

const initials = (name: string) =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "AD";

export function UsersPage() {
  const [rows, setRows]         = useState<AdminUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [q, setQ]               = useState("");
  const [roleF, setRoleF]       = useState("All");
  const [statusF, setStatusF]   = useState("All");
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState<AdminUser | null>(null);
  const [delId, setDelId]       = useState<number | null>(null);
  const [form, setForm]         = useState(BLANK);

  // Fetch admins from Neon Database
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.admins) {
        const formatted: AdminUser[] = data.admins.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: (u.role === "superadmin" ? "Super Admin" : u.role === "admin" ? "Admin" : u.role) as Role,
          status: u.status === "active" ? "active" : "inactive",
          lastLogin: u.last_login ? new Date(u.last_login).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Never",
          joined: u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Recent",
        }));
        setRows(formatted);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filtered = rows.filter(r => {
    const qOk = !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.email.toLowerCase().includes(q.toLowerCase());
    const rOk = roleF === "All" || r.role === roleF;
    const sOk = statusF === "All" || (statusF === "Active" ? r.status === "active" : r.status !== "active");
    return qOk && rOk && sOk;
  });

  const openAdd = () => {
    setForm(BLANK);
    setEditing(null);
    setErrorMsg("");
    setModal(true);
  };

  const openEdit = (r: AdminUser) => {
    setForm({
      name: r.name,
      email: r.email,
      password: "",
      role: r.role,
      status: r.status,
      lastLogin: r.lastLogin,
      joined: r.joined
    });
    setEditing(r);
    setErrorMsg("");
    setModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg("Name and email are required.");
      return;
    }

    if (!editing && !form.password.trim()) {
      setErrorMsg("Password is required for new admin.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      if (!editing) {
        // Create in Neon DB table
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role === "Super Admin" ? "superadmin" : form.role.toLowerCase(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMsg(data.message || "Failed to save admin into database table.");
          setSaving(false);
          return;
        }

        await fetchAdmins();
      } else {
        // Update state in table
        setRows(p => p.map(r => r.id === editing.id ? { ...r, ...form } : r));
      }
      setModal(false);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to connect to Neon database API.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: number) => {
    setRows(p => p.filter(r => r.id !== id));
    setDelId(null);
  };

  const toggleStatus = (id: number) =>
    setRows(p => p.map(r => r.id === id ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r));

  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Miscellaneous / Users" title="Admin Users"
        subtitle="Manage Neon PostgreSQL admin accounts, roles and table records" count={rows.length}>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdmins}
            title="Refresh from Neon DB"
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-emerald-600" : ""} />
            <span className="hidden sm:inline">Sync Neon DB</span>
          </button>
          <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-95 transition-all" style={{ background: G }}>
            <Plus size={15}/> Add Admin to Table
          </button>
        </div>
      </PageHeader>

      {/* Database Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Database size={16} />
          </div>
          <div>
            <p className="font-bold text-gray-800">Neon PostgreSQL Table: <span className="font-mono text-emerald-700">admins</span></p>
            <p className="text-[11px] text-gray-500">Live credential storage with bcrypt hashing and active session checks.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Connected
        </div>
      </div>

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
          <span className="ml-auto self-center text-xs text-gray-400">{filtered.length} admin{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["Admin","Email","Role","Status","Last Login","Joined",""].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider pb-3 pr-4 last:pr-0 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(r => {
                const rm = ROLE_META[r.role] || ROLE_META["Admin"];
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
                        <div>
                          <span className="text-sm font-bold text-gray-800 whitespace-nowrap block">{r.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: #{r.id}</span>
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="py-3 pr-4">
                      <span className="text-xs text-gray-600 font-medium">{r.email}</span>
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
                  <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                    {loading ? "Loading admins from Neon database..." : "No admins match your filters"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit Admin" : "Add Admin to Neon Table"}>
        <div className="space-y-3">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Full Name">
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Rahul Sharma" className={inp}/>
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Email Address">
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="admin@bharatbazar.com" className={inp}/>
              </Field>
            </div>

            {!editing && (
              <div className="col-span-2">
                <Field label="Password">
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => set("password", e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={`${inp} pl-9`}
                    />
                  </div>
                </Field>
              </div>
            )}

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
              {(() => { const m = ROLE_META[form.role] || ROLE_META["Admin"]; const I = m.Icon; return (
                <>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: m.bg }}>
                    <I size={13} style={{ color: m.color }}/>
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: m.color }}>{form.role}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {form.role === "Super Admin" ? "Full access to all platform controls and database tables" :
                       form.role === "Admin"       ? "Manage products, orders and general store settings" :
                       form.role === "Manager"     ? "Manage products, catalogue and reports" :
                       form.role === "Support"     ? "View orders and handle customer tickets" :
                       "View analytics, reports and business dashboards"}
                    </p>
                  </div>
                </>
              ); })()}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setModal(false)}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-1.5"
              style={{ background: G }}
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : null}
              {saving ? "Saving to Neon..." : editing ? "Save Changes" : "Insert to Neon Table"}
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
