import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, CheckCircle2, Clock, XCircle, Eye, Pencil, Star,
  MapPin, Tag, ShoppingBag, TrendingUp, MessageSquare, Package,
  Receipt, BadgePercent, ShieldCheck, ShieldOff,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";
import { G, fmt, card, inp } from "./shared/constants";
import {
  PageHeader, Field, Modal, DeleteConfirm, Toggle, StatCard, SearchBar,
} from "./shared/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type SellerStatus = "Active" | "Pending" | "Suspended";

interface Seller {
  id: number;
  name: string;
  owner: string;
  cat: string;
  city: string;
  gstin: string;
  products: number;
  rating: number;
  revenue: number;
  status: SellerStatus;
  joined: string;
  commission: number;
  featured: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SELLERS_INIT: Seller[] = [
  { id: 1,  name: "Ravi Electro Hub",    owner: "Ravi Shankar",   cat: "Electronics",  city: "Mumbai",      gstin: "27AABCR1234F1Z5", products: 284, rating: 4.7, revenue: 18420000, status: "Active",    joined: "Jan 2023", commission: 8,  featured: true  },
  { id: 2,  name: "FashionFiesta Store", owner: "Priya Kapoor",   cat: "Fashion",      city: "Delhi",       gstin: "07AADCF5678G1Z3", products: 567, rating: 4.5, revenue: 12300000, status: "Active",    joined: "Mar 2023", commission: 12, featured: false },
  { id: 3,  name: "GreenGrocer India",   owner: "Mohan Das",      cat: "Grocery",      city: "Bengaluru",   gstin: "29AACCG9012H1Z1", products: 89,  rating: 4.8, revenue: 8940000,  status: "Active",    joined: "Jun 2023", commission: 6,  featured: true  },
  { id: 4,  name: "BeautyBliss",         owner: "Sneha Pillai",   cat: "Beauty",       city: "Chennai",     gstin: "33AABCB3456I1Z9", products: 142, rating: 4.3, revenue: 6720000,  status: "Active",    joined: "Aug 2023", commission: 15, featured: false },
  { id: 5,  name: "SportZone Pro",       owner: "Arjun Mehta",    cat: "Sports",       city: "Pune",        gstin: "27AADCS7890J1Z7", products: 198, rating: 4.6, revenue: 9850000,  status: "Active",    joined: "Oct 2023", commission: 10, featured: false },
  { id: 6,  name: "HomeDecor Dreams",    owner: "Kavitha Nair",   cat: "Home & Living",city: "Hyderabad",   gstin: "36AABCH2345K1Z5", products: 321, rating: 4.4, revenue: 11200000, status: "Active",    joined: "Nov 2023", commission: 11, featured: true  },
  { id: 7,  name: "TechGadgets India",   owner: "Vikram Singh",   cat: "Electronics",  city: "Jaipur",      gstin: "08AAACT6789L1Z3", products: 156, rating: 4.2, revenue: 7430000,  status: "Pending",   joined: "Jan 2024", commission: 9,  featured: false },
  { id: 8,  name: "KurtiKorner",         owner: "Anita Sharma",   cat: "Fashion",      city: "Ahmedabad",   gstin: "24AABCK1234M1Z1", products: 0,   rating: 0,   revenue: 0,        status: "Pending",   joined: "Feb 2024", commission: 12, featured: false },
  { id: 9,  name: "OrganicFarm Fresh",   owner: "Suresh Kumar",   cat: "Grocery",      city: "Coimbatore",  gstin: "33AACSO5678N1Z9", products: 0,   rating: 0,   revenue: 0,        status: "Pending",   joined: "Feb 2024", commission: 7,  featured: false },
  { id: 10, name: "GlowSkin Cosmetics",  owner: "Deepa Iyer",     cat: "Beauty",       city: "Kochi",       gstin: "32AABCG9012O1Z7", products: 0,   rating: 0,   revenue: 0,        status: "Pending",   joined: "Mar 2024", commission: 14, featured: false },
  { id: 11, name: "PedalPower Sports",   owner: "Rahul Verma",    cat: "Sports",       city: "Lucknow",     gstin: "09AADCP3456P1Z5", products: 74,  rating: 3.8, revenue: 2140000,  status: "Active",    joined: "Dec 2023", commission: 10, featured: false },
  { id: 12, name: "Bookworm Paradise",   owner: "Meera Patel",    cat: "Books",        city: "Surat",       gstin: "24AABCB7890Q1Z3", products: 432, rating: 4.9, revenue: 3280000,  status: "Active",    joined: "Sep 2023", commission: 8,  featured: false },
  { id: 13, name: "ToyLand Kingdom",     owner: "Arun Gupta",     cat: "Toys",         city: "Nagpur",      gstin: "27AADCT2345R1Z1", products: 267, rating: 4.1, revenue: 4890000,  status: "Active",    joined: "Jul 2023", commission: 13, featured: false },
  { id: 14, name: "ElectroPlanet",       owner: "Sunita Reddy",   cat: "Electronics",  city: "Vizag",       gstin: "37AABCE6789S1Z9", products: 189, rating: 3.9, revenue: 5340000,  status: "Suspended", joined: "Apr 2023", commission: 9,  featured: false },
  { id: 15, name: "SilkRoute Fabrics",   owner: "Pooja Joshi",    cat: "Fashion",      city: "Varanasi",    gstin: "09AADCS1234T1Z7", products: 0,   rating: 0,   revenue: 0,        status: "Suspended", joined: "May 2023", commission: 12, featured: false },
  { id: 16, name: "PureHarvest Organic", owner: "Rajesh Rao",     cat: "Grocery",      city: "Mysore",      gstin: "29AACRP5678U1Z5", products: 56,  rating: 4.0, revenue: 1820000,  status: "Active",    joined: "Oct 2023", commission: 6,  featured: false },
  { id: 17, name: "GadgetNest",          owner: "Kiran Sharma",   cat: "Electronics",  city: "Indore",      gstin: "23AABCG9012V1Z3", products: 112, rating: 4.3, revenue: 6120000,  status: "Active",    joined: "Aug 2023", commission: 9,  featured: false },
  { id: 18, name: "FitLife Equipment",   owner: "Neha Singh",     cat: "Sports",       city: "Chandigarh",  gstin: "03AABCF3456W1Z1", products: 0,   rating: 0,   revenue: 0,        status: "Pending",   joined: "Mar 2024", commission: 11, featured: false },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TABS = ["All", "Active", "Pending", "Suspended"] as const;
type FilterTab = typeof FILTER_TABS[number];

const CAT_COLOR: Record<string, string> = {
  "Electronics":  "#3b82f6",
  "Fashion":      "#ec4899",
  "Grocery":      "#10b981",
  "Beauty":       "#a855f7",
  "Sports":       "#f59e0b",
  "Home & Living":"#f97316",
  "Books":        "#6366f1",
  "Toys":         "#ef4444",
};

const STATUS_META: Record<SellerStatus, { color: string; bg: string; label: string }> = {
  Active:    { color: G,         bg: `${G}18`,                  label: "Active"    },
  Pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   label: "Pending"   },
  Suspended: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",    label: "Suspended" },
};

const AVATAR_PALETTE = [
  "#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981",
  "#6366f1","#ef4444","#0d9488","#f97316","#a855f7",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function catColor(cat: string) { return CAT_COLOR[cat] ?? G; }
function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function avatarColor(id: number) { return AVATAR_PALETTE[(id - 1) % AVATAR_PALETTE.length]; }

// ─── Seller Card ─────────────────────────────────────────────────────────────

function SellerCard({
  seller,
  onView,
  onEdit,
  onToggleStatus,
}: {
  seller: Seller;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}) {
  const cc  = catColor(seller.cat);
  const sm  = STATUS_META[seller.status];
  const av  = avatarColor(seller.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className={`${card} overflow-hidden flex flex-col`}
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full" style={{ background: cc }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Avatar + badges row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm"
              style={{ background: av }}
            >
              {initials(seller.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-black text-gray-900 leading-tight">{seller.name}</span>
                {seller.featured && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-500 border border-amber-200">
                    <Star size={8} fill="#f59e0b" /> Featured
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">{seller.owner}</p>
            </div>
          </div>
          {/* Status pill */}
          <span
            className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
            style={{ background: sm.bg, color: sm.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: sm.color }} />
            {sm.label}
          </span>
        </div>

        {/* Location + category */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
            <MapPin size={10} className="shrink-0" /> {seller.city}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: `${cc}15`, color: cc }}
          >
            <Tag size={8} /> {seller.cat}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-xs font-black text-gray-800">{seller.products > 0 ? seller.products : "—"}</p>
            <p className="text-[9px] text-gray-400 mt-0.5 font-semibold">Products</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-xs font-black text-gray-800 flex items-center justify-center gap-0.5">
              {seller.rating > 0 ? (
                <><Star size={9} fill="#f59e0b" className="text-amber-400" />{seller.rating.toFixed(1)}</>
              ) : "—"}
            </p>
            <p className="text-[9px] text-gray-400 mt-0.5 font-semibold">Rating</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-xs font-black text-gray-800">{seller.revenue > 0 ? fmt(seller.revenue) : "—"}</p>
            <p className="text-[9px] text-gray-400 mt-0.5 font-semibold">Revenue</p>
          </div>
        </div>

        {/* Commission badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-600">
            <BadgePercent size={10} /> Commission: {seller.commission}%
          </span>
          <span className="text-[10px] text-gray-400 font-medium">Since {seller.joined}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
          >
            <Eye size={12} /> View
          </button>
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all"
          >
            <Pencil size={12} />
          </button>
          {seller.status === "Suspended" ? (
            <button
              onClick={onToggleStatus}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-white transition-all"
              style={{ background: G }}
            >
              <ShieldCheck size={12} /> Activate
            </button>
          ) : (
            <button
              onClick={onToggleStatus}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
            >
              <ShieldOff size={12} /> Suspend
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  seller,
  onClose,
  onChange,
}: {
  seller: Seller;
  onClose: () => void;
  onChange: (updated: Seller) => void;
}) {
  const cc  = catColor(seller.cat);
  const av  = avatarColor(seller.id);
  const sm  = STATUS_META[seller.status];

  const revenueData = [
    { month: "Q1", value: Math.round(seller.revenue * 0.18) },
    { month: "Q2", value: Math.round(seller.revenue * 0.26) },
    { month: "Q3", value: Math.round(seller.revenue * 0.31) },
    { month: "Q4", value: Math.round(seller.revenue * 0.25) },
  ];

  return (
    <Modal open onClose={onClose} title="Seller Details" wide>
      {/* Header band */}
      <div className="rounded-xl overflow-hidden border border-gray-100 mb-2">
        <div className="h-2" style={{ background: cc }} />
        <div className="p-4 flex items-start gap-4 bg-gray-50">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0 shadow"
            style={{ background: av }}
          >
            {initials(seller.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-gray-900">{seller.name}</h2>
              {seller.featured && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-500 border border-amber-200">
                  <Star size={8} fill="#f59e0b" /> Featured
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{seller.owner}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                <MapPin size={10} /> {seller.city}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: `${cc}15`, color: cc }}
              >
                <Tag size={8} /> {seller.cat}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                style={{ background: sm.bg, color: sm.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.color }} />
                {sm.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GSTIN */}
      <div className="rounded-xl border border-gray-100 px-4 py-2.5 bg-gray-50 flex items-center justify-between">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">GSTIN</span>
        <span className="text-xs font-black text-gray-700 font-mono">{seller.gstin}</span>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Products",   val: seller.products > 0 ? seller.products : "—",              icon: ShoppingBag,   color: "#3b82f6" },
          { label: "Revenue",    val: seller.revenue  > 0 ? fmt(seller.revenue) : "—",          icon: TrendingUp,    color: G         },
          { label: "Rating",     val: seller.rating   > 0 ? `${seller.rating.toFixed(1)} ★` : "—", icon: Star,      color: "#f59e0b" },
          { label: "Commission", val: `${seller.commission}%`,                                   icon: BadgePercent,  color: "#a855f7" },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-gray-100 p-3 text-center bg-white">
            <div className="w-7 h-7 rounded-lg mx-auto mb-1.5 flex items-center justify-center" style={{ background: `${color}15`, color }}>
              <Icon size={13} />
            </div>
            <p className="text-sm font-black text-gray-900">{val}</p>
            <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart (only if has revenue) */}
      {seller.revenue > 0 && (
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Quarterly Revenue Breakdown</p>
          <div className="rounded-xl border border-gray-100 p-3">
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={revenueData} barSize={20}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v: number) => [fmt(v), "Revenue"]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 11 }}
                />
                <Bar dataKey="value" fill={cc} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Status">
          <select
            value={seller.status}
            onChange={e => onChange({ ...seller, status: e.target.value as SellerStatus })}
            className={inp}
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </Field>
        <Field label="Commission Rate (%)">
          <input
            type="number"
            min={0}
            max={50}
            value={seller.commission}
            onChange={e => onChange({ ...seller, commission: Number(e.target.value) })}
            className={inp}
          />
        </Field>
      </div>

      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
        <div>
          <p className="text-xs font-black text-gray-700">Featured Seller</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Show in featured section on homepage</p>
        </div>
        <Toggle checked={seller.featured} onChange={() => onChange({ ...seller, featured: !seller.featured })} />
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Send Message",       icon: MessageSquare, color: "#3b82f6" },
            { label: "View Products",      icon: Package,       color: G         },
            { label: "View Transactions",  icon: Receipt,       color: "#a855f7" },
          ].map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>
                <Icon size={14} />
              </div>
              <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-1">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-black text-white transition-all"
          style={{ background: G }}
        >
          Done
        </button>
      </div>
    </Modal>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  seller,
  onClose,
  onSave,
}: {
  seller: Seller;
  onClose: () => void;
  onSave: (updated: Seller) => void;
}) {
  const [draft, setDraft] = useState<Seller>({ ...seller });
  const set = <K extends keyof Seller>(k: K, v: Seller[K]) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <Modal open onClose={onClose} title={`Edit — ${seller.name}`} wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Owner Name">
          <input value={draft.owner} onChange={e => set("owner", e.target.value)} className={inp} placeholder="Owner name" />
        </Field>
        <Field label="City">
          <input value={draft.city} onChange={e => set("city", e.target.value)} className={inp} placeholder="City" />
        </Field>
        <Field label="Category">
          <select value={draft.cat} onChange={e => set("cat", e.target.value)} className={inp}>
            {["Electronics","Fashion","Grocery","Beauty","Sports","Home & Living","Books","Toys"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Commission Rate (%)">
          <input
            type="number" min={0} max={50}
            value={draft.commission}
            onChange={e => set("commission", Number(e.target.value))}
            className={inp}
          />
        </Field>
        <Field label="Status">
          <select value={draft.status} onChange={e => set("status", e.target.value as SellerStatus)} className={inp}>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </Field>
        <Field label="Joined">
          <input value={draft.joined} onChange={e => set("joined", e.target.value)} className={inp} placeholder="e.g. Jan 2024" />
        </Field>
      </div>

      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
        <div>
          <p className="text-xs font-black text-gray-700">Featured Seller</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Highlight this seller on the homepage</p>
        </div>
        <Toggle checked={draft.featured} onChange={() => set("featured", !draft.featured)} />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={() => { onSave(draft); onClose(); }}
          className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all"
          style={{ background: G }}
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SellerListPage() {
  const [sellers, setSellers]         = useState<Seller[]>(SELLERS_INIT);
  const [search, setSearch]           = useState("");
  const [tab, setTab]                 = useState<FilterTab>("All");
  const [detailSeller, setDetailSeller] = useState<Seller | null>(null);
  const [editSeller, setEditSeller]   = useState<Seller | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Seller | null>(null);

  // ── Derived stats ──
  const total     = sellers.length;
  const active    = sellers.filter(s => s.status === "Active").length;
  const pending   = sellers.filter(s => s.status === "Pending").length;
  const suspended = sellers.filter(s => s.status === "Suspended").length;

  // ── Filtered list ──
  const filtered = sellers.filter(s => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q)  ||
      s.owner.toLowerCase().includes(q) ||
      s.gstin.toLowerCase().includes(q) ||
      s.cat.toLowerCase().includes(q)   ||
      s.city.toLowerCase().includes(q);
    const matchTab =
      tab === "All"       ||
      (tab === "Active"    && s.status === "Active")    ||
      (tab === "Pending"   && s.status === "Pending")   ||
      (tab === "Suspended" && s.status === "Suspended");
    return matchSearch && matchTab;
  });

  // ── Mutations ──
  const update = (updated: Seller) =>
    setSellers(prev => prev.map(s => s.id === updated.id ? updated : s));

  const handleToggleStatus = (seller: Seller) => {
    if (seller.status === "Suspended") {
      update({ ...seller, status: "Active" });
    } else {
      setSuspendTarget(seller);
    }
  };

  // Category distribution for pie
  const catCounts = sellers.reduce<Record<string, number>>((acc, s) => {
    acc[s.cat] = (acc[s.cat] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(catCounts).map(([name, value]) => ({ name, value, color: catColor(name) }));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <PageHeader
        breadcrumb="Manage Seller"
        title="Manage Seller List"
        subtitle="View and manage all registered sellers"
        count={total}
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Sellers"        val={total}     color="#3b82f6" icon={Users}        />
        <StatCard label="Active Sellers"       val={active}    color={G}       icon={CheckCircle2} />
        <StatCard label="Pending Verification" val={pending}   color="#f59e0b" icon={Clock}        />
        <StatCard label="Suspended"            val={suspended} color="#ef4444" icon={XCircle}      />
      </div>

      {/* ── Category distribution chart ── */}
      <div className={`${card} p-5`}>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-4">Sellers by Category</p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <ResponsiveContainer width={160} height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, name: string) => [v, name]}
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2">
            {pieData.map(d => (
              <span key={d.name} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: d.color }} />
                {d.name} <span className="font-black text-gray-800">({d.value})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search + filter bar ── */}
      <div className={`${card} p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3`}>
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, store, GSTIN, category…"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          {FILTER_TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-3.5 py-1.5 rounded-full text-xs font-black transition-all"
              style={
                tab === t
                  ? { background: G, color: "#fff" }
                  : { background: "#f3f4f6", color: "#4b5563" }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="text-xs text-gray-400 font-semibold px-0.5">
        Showing <span className="font-black text-gray-700">{filtered.length}</span> of {total} sellers
      </p>

      {/* ── Seller cards grid ── */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map(seller => (
            <SellerCard
              key={seller.id}
              seller={seller}
              onView={() => setDetailSeller(seller)}
              onEdit={() => setEditSeller(seller)}
              onToggleStatus={() => handleToggleStatus(seller)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Users size={22} className="text-gray-300" />
          </div>
          <p className="text-sm font-black text-gray-400">No sellers found</p>
          <p className="text-xs text-gray-300 mt-1">Try adjusting your search or filter</p>
        </motion.div>
      )}

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {detailSeller && (
          <DetailModal
            seller={detailSeller}
            onClose={() => setDetailSeller(null)}
            onChange={updated => {
              update(updated);
              setDetailSeller(updated);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editSeller && (
          <EditModal
            seller={editSeller}
            onClose={() => setEditSeller(null)}
            onSave={updated => {
              update(updated);
              setEditSeller(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Suspend Confirm ── */}
      <DeleteConfirm
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={() => {
          if (suspendTarget) update({ ...suspendTarget, status: "Suspended" });
          setSuspendTarget(null);
        }}
        title="Suspend Seller"
        message={suspendTarget ? `Suspend "${suspendTarget.name}"? They will not be able to sell until reactivated.` : ""}
      />
    </div>
  );
}
