import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, UserPlus, BarChart2, Star, RefreshCw,
  Pencil, Trash2,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { G, card, inp } from "./shared/constants";
import {
  PageHeader, StatCard, SearchBar, Modal, DeleteConfirm, Field,
} from "./shared/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type CustomerStatus = "Active" | "Inactive";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  orders: number | null;
  spent: number | null;
  status: CustomerStatus;
  vip: boolean;
  emailVerified: boolean;
  authProvider: string;
  joined: string | null;
  lastLogin: string | null;
}

type CustomerForm = Pick<Customer, "name" | "email" | "phone" | "gender" | "dateOfBirth" | "status" | "vip">;
type CustomerStats = { total: number; newThisMonth: number; active: number; vip: number };

const EMPTY_FORM: CustomerForm = {
  name: "", email: "", phone: "", gender: "", dateOfBirth: "", status: "Active", vip: false,
};

const FILTER_TABS = ["All", "Active", "Inactive", "VIP"] as const;
type FilterTab = typeof FILTER_TABS[number];

// ─── Avatar helper ────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function formatJoined(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

const AVATAR_COLORS = [
  "#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981",
  "#6366f1","#ef4444","#0d9488","#f97316","#84cc16",
];

function isCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const customer = value as Record<string, unknown>;
  return typeof customer.id === "number" && typeof customer.name === "string" &&
    typeof customer.email === "string" && typeof customer.phone === "string" &&
    typeof customer.gender === "string" && typeof customer.dateOfBirth === "string" &&
    (customer.orders === null || typeof customer.orders === "number") &&
    (customer.spent === null || typeof customer.spent === "number") &&
    (customer.status === "Active" || customer.status === "Inactive") &&
    typeof customer.vip === "boolean" && typeof customer.emailVerified === "boolean" &&
    typeof customer.authProvider === "string" &&
    (customer.joined === null || typeof customer.joined === "string") &&
    (customer.lastLogin === null || typeof customer.lastLogin === "string");
}

function isCustomerStats(value: unknown): value is CustomerStats {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const stats = value as Record<string, unknown>;
  return ["total", "newThisMonth", "active", "vip"].every(key => {
    const count = stats[key];
    return typeof count === "number" && Number.isSafeInteger(count) && count >= 0;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomersPage() {
  const [customers, setCustomers]         = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({ total: 0, newThisMonth: 0, active: 0, vip: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [search, setSearch]               = useState("");
  const [tab, setTab]                     = useState<FilterTab>("All");
  const [editOpen, setEditOpen]           = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteOpen, setDeleteOpen]       = useState(false);
  const [selected, setSelected]           = useState<Customer | null>(null);
  const [editForm, setEditForm]           = useState<CustomerForm>(EMPTY_FORM);

  async function loadCustomers() {
    setLoading(true);
    setPageError("");
    try {
      const response = await fetch("/api/admin/customers", { cache: "no-store" });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || !("success" in result) ||
          result.success !== true || !("customers" in result) || !Array.isArray(result.customers) ||
          !result.customers.every(isCustomer) || !("stats" in result) || !isCustomerStats(result.stats)) {
        const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
          ? result.message : "Failed to load customers.";
        throw new Error(message);
      }
      setCustomers(result.customers);
      setStats(result.stats);
    } catch (error) {
      console.error("Failed to load admin customers:", error);
      setPageError(error instanceof Error ? error.message : "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadCustomers(); }, []);

  const visible = useMemo(() => customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q);
    const matchTab =
      tab === "All"      ? true :
      tab === "VIP"      ? c.vip :
      tab === "Active"   ? c.status === "Active" :
                           c.status === "Inactive";
    return matchSearch && matchTab;
  }), [customers, search, tab]);

  const segmentTotal = customers.length || 1;
  const segmentData = [
    { name: "Active non-VIP", count: customers.filter(customer => customer.status === "Active" && !customer.vip).length, color: G },
    { name: "Active VIP", count: customers.filter(customer => customer.status === "Active" && customer.vip).length, color: "#f59e0b" },
    { name: "Inactive", count: customers.filter(customer => customer.status === "Inactive").length, color: "#6b7280" },
  ].map(segment => ({ ...segment, value: Math.round(segment.count / segmentTotal * 100) }));

  function openEdit(c: Customer) {
    setSelected(c);
    setIsCreating(false);
    setPageError("");
    setEditForm({
      name: c.name, email: c.email, phone: c.phone, gender: c.gender,
      dateOfBirth: c.dateOfBirth, status: c.status, vip: c.vip,
    });
    setEditOpen(true);
  }

  function openCreate() {
    setSelected(null);
    setIsCreating(true);
    setEditForm(EMPTY_FORM);
    setPageError("");
    setEditOpen(true);
  }

  async function saveEdit() {
    setPageError("");
    setSaving(true);
    try {
      const response = await fetch("/api/admin/customers", {
        method: isCreating ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          status: editForm.status.toLowerCase(),
          ...(selected ? { id: selected.id } : {}),
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || !("success" in result) || result.success !== true) {
        const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
          ? result.message : "Failed to save customer.";
        throw new Error(message);
      }
      setEditOpen(false);
      await loadCustomers();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  }

  function openDelete(c: Customer) {
    setSelected(c);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!selected) return;
    setPageError("");
    try {
      const response = await fetch(`/api/admin/customers?id=${selected.id}`, { method: "DELETE" });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || !("success" in result) || result.success !== true) {
        const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
          ? result.message : "Failed to deactivate customer.";
        throw new Error(message);
      }
      setDeleteOpen(false);
      setSelected(null);
      await loadCustomers();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Failed to deactivate customer.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="Customers"
        title="Customers"
        subtitle="Manage customer accounts and segments"
        count={stats.total}
        onAdd={openCreate}
        addLabel="Add Customer"
      />
      {pageError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</p>}

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <StatCard label="Total Customers"  val={stats.total.toLocaleString("en-IN")} color="#3b82f6" icon={Users}    />
        <StatCard label="New This Month"   val={stats.newThisMonth.toLocaleString("en-IN")} color={G} icon={UserPlus} />
        <StatCard label="Active"           val={stats.active.toLocaleString("en-IN")} color="#6366f1" icon={BarChart2} />
        <StatCard label="VIP Members"      val={stats.vip.toLocaleString("en-IN")} color="#f59e0b" icon={Star}     />
      </motion.div>

      {/* Main card: search + table + donut */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.06 }}
        className="grid grid-cols-1 xl:grid-cols-4 gap-4"
      >
        {/* Table section — 3/4 */}
        <div className={`${card} overflow-hidden xl:col-span-3`}>
          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex-1 min-w-[200px]">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by name, email or phone…"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {FILTER_TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                  style={
                    tab === t
                      ? { background: G, color: "#fff" }
                      : { background: "#f1f5f9", color: "#64748b" }
                  }
                >
                  {t}
                </button>
              ))}
              <button type="button" onClick={() => void loadCustomers()} disabled={loading}
                aria-label="Refresh customers"
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="text-center px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Orders</th>
                  <th className="text-right px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Spent</th>
                  <th className="text-center px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <AnimatePresence>
                <tbody>
                  {!loading && visible.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.02 }}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Customer */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                            style={{ background: AVATAR_COLORS[c.id % AVATAR_COLORS.length] }}
                          >
                            {initials(c.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-gray-800">{c.name}</span>
                              {c.vip && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                                  style={{ background: "#fef9c3", color: "#a16207" }}>
                                  <Star size={8} fill="#a16207" /> VIP
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-[10px]">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Phone */}
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{c.phone}</td>
                      {/* Orders */}
                      <td className="px-3 py-3 text-center font-black text-gray-700" title="Order data is not available yet">—</td>
                      {/* Spent */}
                      <td className="px-3 py-3 text-right font-black text-gray-800" title="Order data is not available yet">—</td>
                      {/* Status */}
                      <td className="px-3 py-3 text-center">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                          style={
                            c.status === "Active"
                              ? { background: `${G}15`, color: G }
                              : { background: "rgba(107,114,128,0.12)", color: "#6b7280" }
                          }
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ background: c.status === "Active" ? G : "#9ca3af" }}
                          />
                          {c.status}
                        </span>
                      </td>
                      {/* Joined */}
                      <td className="px-3 py-3 whitespace-nowrap text-gray-500">{formatJoined(c.joined)}</td>
                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEdit(c)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => openDelete(c)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {loading && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-xs">Loading customers from the database…</td></tr>
                  )}
                  {!loading && visible.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-xs">
                        No customers match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </AnimatePresence>
            </table>
          </div>
        </div>

        {/* Segment donut — 1/4 */}
        <div className={`${card} overflow-hidden`}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-[#fafafa]">
            <Users size={14} className="text-gray-400" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Segments</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={74}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {segmentData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "Share"]}
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-2">
              {segmentData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: d.color }} />
                    <span className="text-gray-600 font-semibold">{d.name}</span>
                  </div>
                  <span className="font-black text-gray-700">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => !saving && setEditOpen(false)} title={isCreating ? "Add Customer" : "Edit Customer"} wide>
        {editOpen && (
          <div className="space-y-4">
            {pageError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{pageError}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name">
                <input
                  className={inp}
                  required
                  maxLength={100}
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
              </Field>
              <Field label="Email">
                <input
                  className={inp}
                  type="email"
                  required
                  maxLength={255}
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <input
                  className={inp}
                  maxLength={30}
                  value={editForm.phone}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                />
              </Field>
              <Field label="Gender">
                <select className={inp} value={editForm.gender}
                  onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}>
                  <option value="">Not specified</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date of Birth">
                <input type="date" className={inp} value={editForm.dateOfBirth}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={e => setEditForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
              </Field>
              <Field label="Status">
                <select
                  className={inp}
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value as CustomerStatus }))}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>
            </div>
            <div className="flex items-center gap-2">
              <input id="vip-toggle" type="checkbox" checked={editForm.vip}
                onChange={e => setEditForm(f => ({ ...f, vip: e.target.checked }))}
                className="w-4 h-4 rounded" style={{ accentColor: G }} />
              <label htmlFor="vip-toggle" className="text-xs font-black text-gray-600">VIP Member</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                disabled={saving}
                onClick={() => setEditOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => void saveEdit()}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: G }}
              >
                {saving ? "Saving…" : isCreating ? "Create Customer" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <DeleteConfirm
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        name={selected?.name}
        title="Deactivate Customer"
        message={`Deactivate "${selected?.name ?? ""}"? Their account and profile will remain in the database.`}
        confirmLabel="Deactivate"
      />
    </div>
  );
}
