import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X, Plus, AlertTriangle } from "lucide-react";
import { G, inp, card } from "./constants";

export function Toggle({ on, checked, onChange }: { on?: boolean; checked?: boolean; onChange: () => void }) {
  const active = checked !== undefined ? checked : (on ?? false);
  return (
    <button onClick={onChange}
      className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200"
      style={{ background: active ? G : "#d1d5db" }}>
      <span className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200"
        style={{ transform: active ? "translateX(16px)" : "translateX(0)" }} />
    </button>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={active ? { background: `${G}15`, color: G } : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: active ? G : "#ef4444" }} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={`relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto z-10 ${wide ? "max-w-2xl" : "max-w-md"}`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-sm font-black text-gray-900">{title}</h3>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function DeleteConfirm({ open, onClose, onConfirm, name, title, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  name?: string; title?: string; message?: string;
}) {
  const heading = title ?? "Confirm Delete";
  const body    = message ?? (name ? `Delete "${name}"?` : "Are you sure?");
  return (
    <Modal open={open} onClose={onClose} title={heading}>
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto"><AlertTriangle size={24} className="text-red-500" /></div>
        <div>
          <p className="text-sm font-bold text-gray-800">{body}</p>
          <p className="text-xs text-gray-400 mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-red-500 hover:bg-red-600 transition-all">Delete</button>
        </div>
      </div>
    </Modal>
  );
}

export function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function PageHeader({ breadcrumb, title, subtitle, count, onAdd, addLabel, children }: {
  breadcrumb: string; title: string; subtitle: string; count?: number;
  onAdd?: () => void; addLabel?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-3">
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{breadcrumb}</p>
        <h1 className="text-xl font-black text-gray-900">{title}</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {subtitle}{count !== undefined && <> · <span className="font-bold text-gray-600">{count} total</span></>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onAdd && (
          <button onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white shadow-sm transition-all hover:shadow-md"
            style={{ background: G }}>
            <Plus size={15} /> {addLabel ?? "Add New"}
          </button>
        )}
      </div>
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative flex-1 min-w-[180px]">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all" />
    </div>
  );
}

export function StatCard({ label, val, color, icon: Icon }: { label: string; val: string | number; color: string; icon: React.ElementType }) {
  return (
    <div className={`${card} p-4 flex items-center gap-3`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-lg font-black text-gray-900">{val}</p>
        <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
      </div>
    </div>
  );
}

export function SectionCard({ title, icon: Icon, children }: { title?: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className={`${card} overflow-hidden`}>
      {(title || Icon) && (
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100" style={{ background: "#fafafa" }}>
          {Icon && <Icon size={14} className="text-gray-400" />}
          {title && <span className="text-xs font-black text-gray-600 uppercase tracking-wider">{title}</span>}
        </div>
      )}
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}
