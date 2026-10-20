import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle, CheckCircle2, XCircle, Layers, Pencil, Trash2, Hash, ImagePlus, Loader2,
} from "lucide-react";
import type { Cat, GroupCat } from "./shared/types";
import { G, toSlug, inp, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, Modal, Field, Toggle, StatusPill, DeleteConfirm } from "./shared/ui";

type CategoryForm = {
  name: string;
  slug: string;
  group_id: number;
  emoji: string;
  active: boolean;
};

const EMOJIS = ["📦", "💻", "👗", "🏠", "💄", "⚽", "📚", "🛒", "🎮", "🛋️", "💍", "🍕", "🎵", "🔧", "🎨"];
const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  group_id: 0,
  emoji: "📦",
  active: true,
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [groups, setGroups] = useState<GroupCat[]>([]);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cat | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [categoryResponse, groupResponse] = await Promise.all([
        fetch("/api/admin/categories", { cache: "no-store" }),
        fetch("/api/admin/group-categories", { cache: "no-store" }),
      ]);
      const [categoryData, groupData] = await Promise.all([
        categoryResponse.json(),
        groupResponse.json(),
      ]);
      if (!categoryResponse.ok || !categoryData.success) {
        setError(categoryData.message || "Failed to load categories.");
        return;
      }
      if (!groupResponse.ok || !groupData.success) {
        setError(groupData.message || "Failed to load group categories.");
        return;
      }
      setCategories(categoryData.categories);
      setGroups(groupData.groups);
    } catch {
      setError("Unable to connect to the category service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  const groupOptions = useMemo(
    () => ["All", ...groups.map(group => group.name)],
    [groups]
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories.filter(category =>
      (!query || category.name.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query)) &&
      (filterGroup === "All" || category.group === filterGroup)
    );
  }, [categories, search, filterGroup]);

  function openAdd() {
    setError("");
    setEditId(null);
    setSelectedImage(null);
    setForm({ ...EMPTY_FORM, group_id: groups[0]?.id ?? 0 });
    setModalOpen(true);
  }

  function openEdit(category: Cat) {
    setError("");
    setEditId(category.id);
    setSelectedImage(null);
    setForm({
      name: category.name,
      slug: category.slug,
      group_id: category.group_id || groups.find(group => group.name === category.group)?.id || 0,
      emoji: category.emoji,
      active: category.active,
    });
    setModalOpen(true);
  }

  async function saveCategory() {
    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }
    if (!form.group_id) {
      setError("Choose a group category.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        editId === null ? "/api/admin/categories" : `/api/admin/categories/${editId}`,
        {
          method: editId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to save category.");
        return;
      }

      const savedCategory: Cat = data.category;
      setCategories(current => editId === null
        ? [...current, savedCategory]
        : current.map(category => category.id === savedCategory.id ? savedCategory : category)
      );
      setEditId(savedCategory.id);

      if (selectedImage) {
        const imageForm = new FormData();
        imageForm.set("image", selectedImage);
        const imageResponse = await fetch(`/api/admin/categories/${savedCategory.id}/image`, {
          method: "POST",
          body: imageForm,
        });
        const imageData = await imageResponse.json();
        if (!imageResponse.ok || !imageData.success) {
          setError(`Category details saved, but its image was not saved: ${imageData.message || "Upload failed."}`);
          return;
        }
        savedCategory.image_url = imageData.image_url;
        setCategories(current => current.map(category => category.id === savedCategory.id ? savedCategory : category));
      }

      setSelectedImage(null);
      setModalOpen(false);
    } catch {
      setError("Unable to connect to the category service.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(category: Cat) {
    setError("");
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: category.name,
          slug: category.slug,
          group_id: category.group_id || 0,
          emoji: category.emoji,
          active: !category.active,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to update category status.");
        return;
      }
      setCategories(current => current.map(item => item.id === category.id ? data.category : item));
    } catch {
      setError("Unable to connect to the category service.");
    }
  }

  async function deleteCategory() {
    if (!deleteTarget) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to delete category.");
        return;
      }
      setCategories(current => current.filter(category => category.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Unable to connect to the category service.");
    }
  }

  async function removeCategoryImage(category: Cat) {
    setError("");
    try {
      const response = await fetch(`/api/admin/categories/${category.id}/image`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to remove category image.");
        return;
      }
      setCategories(current => current.map(item =>
        item.id === category.id ? { ...item, image_url: "" } : item
      ));
    } catch {
      setError("Unable to connect to the category service.");
    }
  }

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP category image.");
      return;
    }
    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError("Category image must be between 1 byte and 5 MB.");
      return;
    }
    setError("");
    setSelectedImage(file);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb="Catalogue › Categories"
        title="Categories"
        subtitle="Manage product categories, icons, and images"
        count={categories.length}
        onAdd={openAdd}
        addLabel="Add Category"
      />
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="ml-auto text-xs underline" onClick={() => void loadData()}>Retry</button>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" val={categories.length} color="#6366f1" icon={Layers} />
        <StatCard label="Active" val={categories.filter(category => category.active).length} color={G} icon={CheckCircle2} />
        <StatCard label="Inactive" val={categories.filter(category => !category.active).length} color="#ef4444" icon={XCircle} />
        <StatCard label="With Images" val={categories.filter(category => category.image_url).length} color="#f59e0b" icon={ImagePlus} />
      </div>

      <div className={card}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search categories…" />
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 overflow-x-auto">
            {groupOptions.slice(0, 5).map(group => (
              <button
                key={group}
                onClick={() => setFilterGroup(group)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
                style={filterGroup === group ? { background: G, color: "#fff" } : { color: "#6b7280" }}
              >
                {group === "All" ? "All" : group.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["#", "Category", "Slug", "Group", "Image", "Status", "Actions"].map(heading => (
                  <th key={heading} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400"><Loader2 size={16} className="inline animate-spin mr-2" />Loading categories…</td></tr>
              ) : filtered.map((category, index) => (
                <motion.tr key={category.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                        {category.image_url
                          ? <img src={category.image_url} alt={`${category.name} category`} className="w-full h-full object-cover" />
                          : category.emoji}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{category.name}</span>
                        <span className="block text-xs text-gray-400">{category.emoji} Icon</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1 text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg w-fit"><Hash size={9} />{category.slug}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-500 whitespace-nowrap">{category.group}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-500">{category.image_url ? "Uploaded" : "Icon only"}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Toggle on={category.active} onChange={() => void toggleCategory(category)} /><StatusPill active={category.active} /></div></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button aria-label={`Edit ${category.name}`} onClick={() => openEdit(category)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all"><Pencil size={13} /></button>
                      <button aria-label={`Delete ${category.name}`} onClick={() => setDeleteTarget(category)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100"><p className="text-[11px] text-gray-400">Showing {filtered.length} of {categories.length}</p></div>
      </div>

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editId === null ? "Add Category" : "Edit Category"}>
        <Field label="Category Name" required>
          <input
            value={form.name}
            maxLength={120}
            onChange={event => setForm(current => ({
              ...current,
              name: event.target.value,
              slug: editId === null ? toSlug(event.target.value) : current.slug,
            }))}
            placeholder="e.g. Electronics"
            className={inp}
          />
        </Field>
        <Field label="Slug" required>
          <input value={form.slug} maxLength={120} onChange={event => setForm(current => ({ ...current, slug: toSlug(event.target.value) }))} placeholder="electronics" className={`${inp} font-mono text-[13px]`} />
        </Field>
        <Field label="Group Category" required>
          <select value={form.group_id} onChange={event => setForm(current => ({ ...current, group_id: Number(event.target.value) }))} className={inp}>
            <option value={0}>Select a group</option>
            {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
        </Field>
        <Field label="Icon / Emoji">
          <div className="grid grid-cols-8 gap-1.5 p-2 border border-gray-200 rounded-xl bg-gray-50">
            {EMOJIS.map(emoji => (
              <button key={emoji} type="button" aria-label={`Choose ${emoji} icon`} onClick={() => setForm(current => ({ ...current, emoji }))} className={`h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.emoji === emoji ? "bg-white shadow-sm border-2" : "hover:bg-white"}`} style={form.emoji === emoji ? { borderColor: G } : {}}>
                {emoji}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Category Image" hint="JPEG, PNG, or WebP · max 5 MB">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-2xl overflow-hidden">
              {imagePreview || categories.find(category => category.id === editId)?.image_url
                ? <img src={imagePreview || categories.find(category => category.id === editId)?.image_url} alt="Category preview" className="w-full h-full object-cover" />
                : form.emoji}
            </div>
            <div className="space-y-2">
              <button type="button" disabled={saving} onClick={() => imageInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                <ImagePlus size={14} /> {selectedImage ? "Change image" : "Choose image"}
              </button>
              {selectedImage && <p className="text-[11px] text-gray-500">Selected: {selectedImage.name}</p>}
              {!selectedImage && categories.find(category => category.id === editId)?.image_url && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    const category = categories.find(item => item.id === editId);
                    if (category) void removeCategoryImage(category);
                  }}
                  className="block text-[11px] font-semibold text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  Remove current image
                </button>
              )}
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />
            </div>
          </div>
        </Field>
        <Field label="Status">
          <div className="flex items-center gap-3 pt-1">
            <Toggle on={form.active} onChange={() => setForm(current => ({ ...current, active: !current.active }))} />
            <span className="text-sm text-gray-600 font-medium">{form.active ? "Active" : "Inactive"}</span>
          </div>
        </Field>
        <div className="flex gap-3 pt-2">
          <button disabled={saving} onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button disabled={saving || groups.length === 0} onClick={() => void saveCategory()} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60" style={{ background: G }}>
            {saving ? "Saving…" : editId === null ? "Add Category" : "Save Changes"}
          </button>
        </div>
      </Modal>

      <DeleteConfirm open={!!deleteTarget} name={deleteTarget?.name ?? ""} onClose={() => setDeleteTarget(null)} onConfirm={() => void deleteCategory()} />
    </div>
  );
}

export default CategoriesPage;
