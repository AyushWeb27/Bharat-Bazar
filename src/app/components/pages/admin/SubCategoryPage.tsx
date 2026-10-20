import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle, CheckCircle2, XCircle, GitBranch, Layers, Pencil, Trash2, Hash, ImagePlus, Loader2,
} from "lucide-react";
import type { Cat, SubCat } from "./shared/types";
import { G, toSlug, inp, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard, Modal, Field, Toggle, StatusPill, DeleteConfirm } from "./shared/ui";

type SubcategoryForm = {
  name: string;
  slug: string;
  parent_id: number;
  emoji: string;
  sort: number;
  active: boolean;
};

const EMOJIS = ["📁", "📱", "💻", "📷", "👔", "👗", "👟", "💍", "🛋️", "🍳", "✨", "💇", "🏏", "🏋️", "🎮", "📦"];
const EMPTY_FORM: SubcategoryForm = {
  name: "",
  slug: "",
  parent_id: 0,
  emoji: "📁",
  sort: 1,
  active: true,
};

export function SubCategoryPage() {
  const [subcategories, setSubcategories] = useState<SubCat[]>([]);
  const [parents, setParents] = useState<Cat[]>([]);
  const [search, setSearch] = useState("");
  const [filterParent, setFilterParent] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubCat | null>(null);
  const [form, setForm] = useState<SubcategoryForm>(EMPTY_FORM);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [subcategoryResponse, categoryResponse] = await Promise.all([
        fetch("/api/admin/subcategories", { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
      ]);
      const [subcategoryData, categoryData] = await Promise.all([
        subcategoryResponse.json(),
        categoryResponse.json(),
      ]);
      if (!subcategoryResponse.ok || !subcategoryData.success) {
        setError(subcategoryData.message || "Failed to load subcategories.");
        return;
      }
      if (!categoryResponse.ok || !categoryData.success) {
        setError(categoryData.message || "Failed to load parent categories.");
        return;
      }
      setSubcategories(subcategoryData.subcategories);
      setParents(categoryData.categories);
    } catch {
      setError("Unable to connect to the subcategory service.");
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

  const parentOptions = useMemo(
    () => ["All", ...parents.map(parent => parent.name)],
    [parents]
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return subcategories.filter(subcategory =>
      (!query ||
        subcategory.name.toLowerCase().includes(query) ||
        subcategory.slug.toLowerCase().includes(query) ||
        subcategory.parent.toLowerCase().includes(query)) &&
      (filterParent === "All" || subcategory.parent === filterParent)
    );
  }, [subcategories, search, filterParent]);

  function openAdd() {
    setEditId(null);
    setSelectedImage(null);
    setError("");
    setForm({
      ...EMPTY_FORM,
      parent_id: parents[0]?.id ?? 0,
      sort: subcategories.length + 1,
    });
    setModalOpen(true);
  }

  function openEdit(subcategory: SubCat) {
    setEditId(subcategory.id);
    setSelectedImage(null);
    setError("");
    setForm({
      name: subcategory.name,
      slug: subcategory.slug,
      parent_id: subcategory.parent_id || parents.find(parent => parent.name === subcategory.parent)?.id || 0,
      emoji: subcategory.emoji || "📁",
      sort: subcategory.sort,
      active: subcategory.active,
    });
    setModalOpen(true);
  }

  async function saveSubcategory() {
    if (!form.name.trim()) {
      setError("Subcategory name is required.");
      return;
    }
    if (!form.parent_id) {
      setError("Choose a parent category.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        editId === null ? "/api/admin/subcategories" : `/api/admin/subcategories/${editId}`,
        {
          method: editId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to save subcategory.");
        return;
      }

      const savedSubcategory: SubCat = data.subcategory;
      setSubcategories(current => editId === null
        ? [...current, savedSubcategory]
        : current.map(subcategory => subcategory.id === savedSubcategory.id ? savedSubcategory : subcategory)
      );
      setEditId(savedSubcategory.id);

      if (selectedImage) {
        const imageForm = new FormData();
        imageForm.set("image", selectedImage);
        const imageResponse = await fetch(`/api/admin/subcategories/${savedSubcategory.id}/image`, {
          method: "POST",
          body: imageForm,
        });
        const imageData = await imageResponse.json();
        if (!imageResponse.ok || !imageData.success) {
          setError(`Subcategory details saved, but its image was not saved: ${imageData.message || "Upload failed."}`);
          return;
        }
        savedSubcategory.image_url = imageData.image_url;
        setSubcategories(current => current.map(subcategory =>
          subcategory.id === savedSubcategory.id ? savedSubcategory : subcategory
        ));
      }

      setSelectedImage(null);
      setModalOpen(false);
    } catch {
      setError("Unable to connect to the subcategory service.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleSubcategory(subcategory: SubCat) {
    const parentId = subcategory.parent_id || parents.find(parent => parent.name === subcategory.parent)?.id;
    if (!parentId) {
      setError("Could not identify this subcategory’s parent category.");
      return;
    }
    setError("");
    try {
      const response = await fetch(`/api/admin/subcategories/${subcategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subcategory.name,
          slug: subcategory.slug,
          parent_id: parentId,
          emoji: subcategory.emoji || "📁",
          sort: subcategory.sort,
          active: !subcategory.active,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to update subcategory status.");
        return;
      }
      setSubcategories(current => current.map(item => item.id === subcategory.id ? data.subcategory : item));
    } catch {
      setError("Unable to connect to the subcategory service.");
    }
  }

  async function deleteSubcategory() {
    if (!deleteTarget) return;
    setError("");
    try {
      if (deleteTarget.image_url) {
        const imageResponse = await fetch(`/api/admin/subcategories/${deleteTarget.id}/image`, { method: "DELETE" });
        const imageData = await imageResponse.json();
        if (!imageResponse.ok || !imageData.success) {
          setError(imageData.message || "Failed to remove subcategory image.");
          return;
        }
      }
      const response = await fetch(`/api/admin/subcategories/${deleteTarget.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to delete subcategory.");
        return;
      }
      setSubcategories(current => current.filter(item => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Unable to connect to the subcategory service.");
    }
  }

  async function removeSubcategoryImage(subcategory: SubCat) {
    setError("");
    try {
      const response = await fetch(`/api/admin/subcategories/${subcategory.id}/image`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || "Failed to remove subcategory image.");
        return;
      }
      setSubcategories(current => current.map(item =>
        item.id === subcategory.id ? { ...item, image_url: "" } : item
      ));
    } catch {
      setError("Unable to connect to the subcategory service.");
    }
  }

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP subcategory image.");
      return;
    }
    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError("Subcategory image must be between 1 byte and 5 MB.");
      return;
    }
    setError("");
    setSelectedImage(file);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb="Catalogue › SubCategory"
        title="SubCategories"
        subtitle="Manage product sub-categories, icons, and images"
        count={subcategories.length}
        onAdd={openAdd}
        addLabel="Add SubCategory"
      />
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="ml-auto text-xs underline" onClick={() => void loadData()}>Retry</button>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" val={subcategories.length} color="#6366f1" icon={GitBranch} />
        <StatCard label="Active" val={subcategories.filter(item => item.active).length} color={G} icon={CheckCircle2} />
        <StatCard label="Inactive" val={subcategories.filter(item => !item.active).length} color="#ef4444" icon={XCircle} />
        <StatCard label="With Images" val={subcategories.filter(item => item.image_url).length} color="#f59e0b" icon={ImagePlus} />
      </div>

      <div className={card}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
          <SearchBar value={search} onChange={setSearch} placeholder="Search subcategories…" />
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 overflow-x-auto">
            {parentOptions.slice(0, 6).map(parent => (
              <button
                key={parent}
                onClick={() => setFilterParent(parent)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
                style={filterParent === parent ? { background: G, color: "#fff" } : { color: "#6b7280" }}
              >
                {parent === "All" ? "All" : parent.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["#", "Sub-Category", "Slug", "Parent Category", "Sort", "Image", "Status", "Actions"].map(heading => (
                  <th key={heading} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400"><Loader2 size={16} className="inline animate-spin mr-2" />Loading subcategories…</td></tr>
              ) : filtered.map((subcategory, index) => (
                <motion.tr key={subcategory.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                        {subcategory.image_url
                          ? <img src={subcategory.image_url} alt={`${subcategory.name} subcategory`} className="w-full h-full object-cover" />
                          : subcategory.emoji || "📁"}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{subcategory.name}</span>
                        <span className="block text-xs text-gray-400">{subcategory.emoji || "📁"} Icon</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1 text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg w-fit"><Hash size={9} />{subcategory.slug}</span></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg whitespace-nowrap"><Layers size={10} />{subcategory.parent}</span></td>
                  <td className="px-4 py-3"><span className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-black text-gray-500">{subcategory.sort}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-gray-500">{subcategory.image_url ? "Uploaded" : "Icon only"}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Toggle on={subcategory.active} onChange={() => void toggleSubcategory(subcategory)} /><StatusPill active={subcategory.active} /></div></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button aria-label={`Edit ${subcategory.name}`} onClick={() => openEdit(subcategory)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-all"><Pencil size={13} /></button>
                      <button aria-label={`Delete ${subcategory.name}`} onClick={() => setDeleteTarget(subcategory)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No subcategories found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100"><p className="text-[11px] text-gray-400">Showing {filtered.length} of {subcategories.length}</p></div>
      </div>

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editId === null ? "Add SubCategory" : "Edit SubCategory"}>
        <Field label="SubCategory Name" required>
          <input
            value={form.name}
            maxLength={120}
            onChange={event => setForm(current => ({
              ...current,
              name: event.target.value,
              slug: editId === null ? toSlug(event.target.value) : current.slug,
            }))}
            placeholder="e.g. Smartphones"
            className={inp}
          />
        </Field>
        <Field label="Slug" required>
          <input value={form.slug} maxLength={120} onChange={event => setForm(current => ({ ...current, slug: toSlug(event.target.value) }))} placeholder="smartphones" className={`${inp} font-mono text-[13px]`} />
        </Field>
        <Field label="Parent Category" required>
          <select value={form.parent_id} onChange={event => setForm(current => ({ ...current, parent_id: Number(event.target.value) }))} className={inp}>
            <option value={0}>Select parent category</option>
            {parents.map(parent => <option key={parent.id} value={parent.id}>{parent.emoji} {parent.name}</option>)}
          </select>
        </Field>
        <Field label="Sort Order">
          <input type="number" min={1} max={10000} value={form.sort} onChange={event => setForm(current => ({ ...current, sort: Number.parseInt(event.target.value, 10) || 1 }))} className={inp} />
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
        <Field label="Subcategory Image" hint="JPEG, PNG, or WebP · max 5 MB">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-2xl overflow-hidden">
              {imagePreview || subcategories.find(item => item.id === editId)?.image_url
                ? <img src={imagePreview || subcategories.find(item => item.id === editId)?.image_url} alt="Subcategory preview" className="w-full h-full object-cover" />
                : form.emoji}
            </div>
            <div className="space-y-2">
              <button type="button" disabled={saving} onClick={() => imageInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                <ImagePlus size={14} /> {selectedImage ? "Change image" : "Choose image"}
              </button>
              {selectedImage && <p className="text-[11px] text-gray-500">Selected: {selectedImage.name}</p>}
              {!selectedImage && subcategories.find(item => item.id === editId)?.image_url && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    const item = subcategories.find(subcategory => subcategory.id === editId);
                    if (item) void removeSubcategoryImage(item);
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
          <button disabled={saving || parents.length === 0} onClick={() => void saveSubcategory()} className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60" style={{ background: G }}>
            {saving ? "Saving…" : editId === null ? "Add SubCategory" : "Save Changes"}
          </button>
        </div>
      </Modal>

      <DeleteConfirm open={!!deleteTarget} name={deleteTarget?.name ?? ""} onClose={() => setDeleteTarget(null)} onConfirm={() => void deleteSubcategory()} />
    </div>
  );
}

export default SubCategoryPage;
