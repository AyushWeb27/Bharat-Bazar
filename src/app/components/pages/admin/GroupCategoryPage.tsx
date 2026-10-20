import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle, CheckCircle2, XCircle, FolderOpen, Pencil, Trash2, Layers, Loader2,
} from "lucide-react";
import type { GroupCategory } from "@/lib/group-categories";
import { G, toSlug, GROUP_COLORS, inp, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, Modal, Field, Toggle, StatusPill, DeleteConfirm } from "./shared/ui";

type GroupForm = {
  name: string;
  slug: string;
  color: string;
  description: string;
  active: boolean;
};

const EMPTY_FORM: GroupForm = {
  name: "",
  slug: "",
  color: G,
  description: "",
  active: true,
};

export function GroupCategoryPage() {
  const [groups, setGroups] = useState<GroupCategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GroupCategory | null>(null);
  const [form, setForm] = useState<GroupForm>(EMPTY_FORM);

  const loadGroups = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/group-categories", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to load group categories.");
        return;
      }
      setGroups(data.groups);
    } catch {
      setError("Unable to connect to the group categories service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGroups();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return groups.filter(group =>
      !query ||
      group.name.toLowerCase().includes(query) ||
      group.slug.toLowerCase().includes(query)
    );
  }, [groups, search]);

  function openAdd() {
    setError("");
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(group: GroupCategory) {
    setError("");
    setEditId(group.id);
    setForm({
      name: group.name,
      slug: group.slug,
      color: group.color,
      description: group.description || "",
      active: group.active,
    });
    setModalOpen(true);
  }

  async function saveGroup() {
    if (!form.name.trim()) {
      setError("Group name is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        editId === null
          ? "/api/admin/group-categories"
          : `/api/admin/group-categories/${editId}`,
        {
          method: editId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to save group category.");
        return;
      }

      if (editId === null) {
        setGroups(previous => [...previous, data.group]);
      } else {
        setGroups(previous => previous.map(group =>
          group.id === editId ? data.group : group
        ));
      }
      setModalOpen(false);
    } catch {
      setError("Unable to connect to the group categories service.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleGroup(group: GroupCategory) {
    setError("");
    try {
      const response = await fetch(`/api/admin/group-categories/${group.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...group, active: !group.active }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to update group status.");
        return;
      }
      setGroups(previous => previous.map(item =>
        item.id === group.id ? data.group : item
      ));
    } catch {
      setError("Unable to connect to the group categories service.");
    }
  }

  async function deleteGroup() {
    if (!deleteTarget) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/group-categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to delete group category.");
        return;
      }
      setGroups(previous => previous.filter(group => group.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Unable to connect to the group categories service.");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb="Catalogue › Group Category"
        title="Group Categories"
        subtitle="Manage top-level product category groups"
        count={groups.length}
        onAdd={openAdd}
        addLabel="Add Group"
      />

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="ml-auto text-xs underline" onClick={() => void loadGroups()}>Retry</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Groups" val={groups.length} color="#6366f1" icon={FolderOpen} />
        <StatCard label="Active" val={groups.filter(group => group.active).length} color={G} icon={CheckCircle2} />
        <StatCard label="Inactive" val={groups.filter(group => !group.active).length} color="#ef4444" icon={XCircle} />
        <StatCard label="With Description" val={groups.filter(group => group.description?.trim()).length} color="#f59e0b" icon={Layers} />
      </div>

      <div className={card}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search group categories…" />
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {loading ? (
            <div className="col-span-full flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading group categories…
            </div>
          ) : (
            <>
              <AnimatePresence>
                {filtered.map(group => (
                  <motion.div
                    key={group.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all group"
                  >
                    <div className="h-1.5 rounded-full mb-4" style={{ background: group.color }} />
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${group.color}15` }}>
                        <FolderOpen size={18} style={{ color: group.color }} />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button aria-label={`Edit ${group.name}`} onClick={() => openEdit(group)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all">
                          <Pencil size={12} />
                        </button>
                        <button aria-label={`Delete ${group.name}`} onClick={() => setDeleteTarget(group)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-black text-gray-900 mb-0.5">{group.name}</p>
                    <p className="text-[10px] font-mono text-gray-400 mb-2">/{group.slug}</p>
                    <p className="text-xs text-gray-500 min-h-8 line-clamp-2">
                      {group.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                      <StatusPill active={group.active} />
                      <Toggle on={group.active} onChange={() => void toggleGroup(group)} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="col-span-full py-10 text-center text-sm text-gray-400">
                  {search ? "No groups found" : "No group categories yet. Add one to get started."}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editId === null ? "Add Group Category" : "Edit Group Category"}
      >
        <Field label="Group Name" required>
          <input
            value={form.name}
            maxLength={120}
            onChange={event => setForm(current => ({
              ...current,
              name: event.target.value,
              slug: editId === null ? toSlug(event.target.value) : current.slug,
            }))}
            placeholder="e.g. Electronics & Tech"
            className={inp}
          />
        </Field>
        <Field label="Slug" required>
          <input
            value={form.slug}
            maxLength={120}
            onChange={event => setForm(current => ({ ...current, slug: toSlug(event.target.value) }))}
            placeholder="electronics-tech"
            className={`${inp} font-mono text-[13px]`}
          />
        </Field>
        <Field label="Color">
          <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-xl bg-gray-50">
            {GROUP_COLORS.map(color => (
              <button
                key={color}
                type="button"
                aria-label={`Choose ${color}`}
                onClick={() => setForm(current => ({ ...current, color }))}
                className="w-7 h-7 rounded-lg transition-all border-2"
                style={{
                  background: color,
                  borderColor: form.color === color ? "#fff" : color,
                  boxShadow: form.color === color ? `0 0 0 2px ${color}` : "none",
                  transform: form.color === color ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </Field>
        <Field label="Description">
          <textarea
            value={form.description}
            maxLength={1000}
            onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
            placeholder="Brief description…"
            rows={3}
            className={`${inp} resize-none`}
          />
        </Field>
        <Field label="Status">
          <div className="flex items-center gap-3 pt-1">
            <Toggle on={form.active} onChange={() => setForm(current => ({ ...current, active: !current.active }))} />
            <span className="text-sm text-gray-600 font-medium">{form.active ? "Active" : "Inactive"}</span>
          </div>
        </Field>
        <div className="flex gap-3 pt-2">
          <button disabled={saving} onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button disabled={saving} onClick={() => void saveGroup()} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60" style={{ background: G }}>
            {saving ? "Saving…" : editId === null ? "Add Group" : "Save Changes"}
          </button>
        </div>
      </Modal>

      <DeleteConfirm
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void deleteGroup()}
      />
    </div>
  );
}

export default GroupCategoryPage;
