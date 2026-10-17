import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, UserPlus, BarChart2, Star,
  Pencil, Trash2,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { G, fmt, card, inp } from "./shared/constants";
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
  orders: number;
  spent: number;
  status: CustomerStatus;
  vip: boolean;
  joined: string;
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const INIT_CUSTOMERS: Customer[] = [
  { id:  1, name: "Priya Sharma",   email: "priya@gmail.com",    phone: "+91 98765 43210", orders: 24, spent: 58420, status: "Active",   vip: true,  joined: "Jan 2024" },
  { id:  2, name: "Rahul Gupta",    email: "rahul@yahoo.com",    phone: "+91 87654 32109", orders: 18, spent: 32100, status: "Active",   vip: false, joined: "Mar 2024" },
  { id:  3, name: "Anita Singh",    email: "anita@gmail.com",    phone: "+91 76543 21098", orders:  7, spent: 12340, status: "Inactive", vip: false, joined: "Jun 2024" },
  { id:  4, name: "Vikram Patel",   email: "vikram@hotmail.com", phone: "+91 65432 10987", orders: 31, spent: 74890, status: "Active",   vip: true,  joined: "Oct 2023" },
  { id:  5, name: "Neha Joshi",     email: "neha@gmail.com",     phone: "+91 54321 09876", orders: 12, spent: 28750, status: "Active",   vip: false, joined: "Apr 2024" },
  { id:  6, name: "Arjun Kumar",    email: "arjun@outlook.com",  phone: "+91 43210 98765", orders:  3, spent:  5670, status: "Inactive", vip: false, joined: "Aug 2024" },
  { id:  7, name: "Deepa Nair",     email: "deepa@gmail.com",    phone: "+91 32109 87654", orders: 45, spent: 98320, status: "Active",   vip: true,  joined: "Jul 2023" },
  { id:  8, name: "Suresh Rao",     email: "suresh@yahoo.com",   phone: "+91 21098 76543", orders:  8, spent: 18900, status: "Active",   vip: false, joined: "Feb 2024" },
  { id:  9, name: "Kavitha Iyer",   email: "kavitha@gmail.com",  phone: "+91 19876 54321", orders: 22, spent: 51200, status: "Active",   vip: true,  joined: "Nov 2023" },
  { id: 10, name: "Mohan Das",      email: "mohan@gmail.com",    phone: "+91 98123 45678", orders:  5, spent:  9340, status: "Inactive", vip: false, joined: "Jul 2024" },
  { id: 11, name: "Sunita Verma",   email: "sunita@gmail.com",   phone: "+91 87234 56789", orders: 19, spent: 43670, status: "Active",   vip: false, joined: "Dec 2023" },
  { id: 12, name: "Ravi Krishnan",  email: "ravi@outlook.com",   phone: "+91 76345 67890", orders: 11, spent: 24800, status: "Active",   vip: false, joined: "Mar 2024" },
  { id: 13, name: "Meera Pillai",   email: "meera@gmail.com",    phone: "+91 65456 78901", orders: 37, spent: 84300, status: "Active",   vip: true,  joined: "Sep 2023" },
  { id: 14, name: "Arun Sharma",    email: "arun@yahoo.com",     phone: "+91 54567 89012", orders:  2, spent:  3200, status: "Inactive", vip: false, joined: "Sep 2024" },
  { id: 15, name: "Pooja Mehta",    email: "pooja@gmail.com",    phone: "+91 43678 90123", orders: 28, spent: 63100, status: "Active",   vip: true,  joined: "Jan 2024" },
];

const SEGMENT_DATA = [
  { name: "Regular",    value: 45, color: "#6b7280" },
  { name: "Occasional", value: 28, color: "#3b82f6" },
  { name: "Loyal",      value: 18, color: G          },
  { name: "VIP",        value:  9, color: "#f59e0b"  },
];

const FILTER_TABS = ["All", "Active", "Inactive", "VIP"] as const;
type FilterTab = typeof FILTER_TABS[number];

// ─── Avatar helper ────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981",
  "#6366f1","#ef4444","#0d9488","#f97316","#84cc16",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomersPage() {
  const [customers, setCustomers]         = useState<Customer[]>(INIT_CUSTOMERS);
  const [search, setSearch]               = useState("");
  const [tab, setTab]                     = useState<FilterTab>("All");
  const [editOpen, setEditOpen]           = useState(false);
  const [deleteOpen, setDeleteOpen]       = useState(false);
  const [selected, setSelected]           = useState<Customer | null>(null);
  const [editForm, setEditForm]           = useState<Partial<Customer>>({});

  // Filtering
  const visible = customers.filter(c => {
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
  });

  // Edit handlers
  function openEdit(c: Customer) {
    setSelected(c);
    setEditForm({ ...c });
    setEditOpen(true);
  }

  function saveEdit() {
    if (!selected) return;
    setCustomers(prev => prev.map(c => c.id === selected.id ? { ...c, ...editForm } as Customer : c));
    setEditOpen(false);
  }

  // Delete handlers
  function openDelete(c: Customer) {
    setSelected(c);
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (!selected) return;
    setCustomers(prev => prev.filter(c => c.id !== selected.id));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        breadcrumb="Customers"
        title="Customers"
        subtitle="Manage customer accounts and segments"
        count={customers.length}
      />

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <StatCard label="Total Customers"  val="28,491" color="#3b82f6" icon={Users}    />
        <StatCard label="New This Month"   val="1,247"  color={G}       icon={UserPlus} />
        <StatCard label="Active"           val="19,834" color="#6366f1" icon={BarChart2} />
        <StatCard label="VIP Members"      val="342"    color="#f59e0b" icon={Star}     />
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
                  {visible.map((c, i) => (
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
                      <td className="px-3 py-3 text-center font-black text-gray-700">{c.orders}</td>
                      {/* Spent */}
                      <td className="px-3 py-3 text-right font-black text-gray-800">{fmt(c.spent)}</td>
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
                      <td className="px-3 py-3 text-gray-500">{c.joined}</td>
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
                  {visible.length === 0 && (
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
                  data={SEGMENT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={74}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {SEGMENT_DATA.map((d) => (
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
              {SEGMENT_DATA.map(d => (
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
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Customer" wide>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name">
                <input
                  className={inp}
                  value={editForm.name ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
              </Field>
              <Field label="Email">
                <input
                  className={inp}
                  type="email"
                  value={editForm.email ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <input
                  className={inp}
                  value={editForm.phone ?? ""}
                  onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                />
              </Field>
              <Field label="Status">
                <select
                  className={inp}
                  value={editForm.status ?? "Active"}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value as CustomerStatus }))}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="vip-toggle"
                type="checkbox"
                checked={editForm.vip ?? false}
                onChange={e => setEditForm(f => ({ ...f, vip: e.target.checked }))}
                className="w-4 h-4 rounded"
                style={{ accentColor: G }}
              />
              <label htmlFor="vip-toggle" className="text-xs font-black text-gray-600">VIP Member</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                style={{ background: G }}
              >
                Save Changes
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
        title="Delete Customer"
      />
    </div>
  );
}
