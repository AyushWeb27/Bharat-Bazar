"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Gift, Home, Pencil, Search, Star, Trash2 } from "lucide-react";
import { Field, Modal, PageHeader, StatCard, Toggle } from "./shared/ui";
import { G, inp, card } from "./shared/constants";

type Deal = {
  id: number;
  productId: number;
  productName: string;
  brand: string;
  category: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  stock: number;
  dealDate: string;
  active: boolean;
  featured: boolean;
  showOnHomepage: boolean;
};

type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  selectable: boolean;
};

type DealForm = {
  id?: number;
  productId: number;
  discountPercent: number;
  dealDate: string;
  active: boolean;
  featured: boolean;
  showOnHomepage: boolean;
};

function isDeal(value: unknown): value is Deal {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const deal = value as Record<string, unknown>;
  return typeof deal.id === "number" && typeof deal.productId === "number" &&
    typeof deal.productName === "string" && typeof deal.brand === "string" &&
    typeof deal.category === "string" && typeof deal.imageUrl === "string" &&
    typeof deal.originalPrice === "number" && typeof deal.dealPrice === "number" &&
    typeof deal.discountPercent === "number" && typeof deal.stock === "number" &&
    typeof deal.dealDate === "string" && typeof deal.active === "boolean" &&
    typeof deal.featured === "boolean" && typeof deal.showOnHomepage === "boolean";
}

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const product = value as Record<string, unknown>;
  return typeof product.id === "number" && typeof product.name === "string" &&
    typeof product.brand === "string" && typeof product.category === "string" &&
    typeof product.price === "number" && typeof product.stock === "number" &&
    typeof product.imageUrl === "string" && typeof product.selectable === "boolean";
}

function indiaDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function money(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

const emptyForm = (): DealForm => ({
  productId: 0,
  discountPercent: 10,
  dealDate: indiaDate(),
  active: true,
  featured: false,
  showOnHomepage: true,
});

export function DealOfDayPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<DealForm>(emptyForm);
  const [query, setQuery] = useState("");

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/deal-of-day", {
        cache: "no-store",
        signal,
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" ||
          !("success" in result) || result.success !== true ||
          !("deals" in result) || !Array.isArray(result.deals) ||
          !result.deals.every(isDeal) ||
          !("products" in result) || !Array.isArray(result.products) ||
          !result.products.every(isProduct)) {
        const message = result && typeof result === "object" && "message" in result &&
          typeof result.message === "string" ? result.message : "Failed to load Deal of the Day.";
        throw new Error(message);
      }
      setDeals(result.deals);
      setProducts(result.products);
      setError("");
    } catch (loadError) {
      if (!signal?.aborted) {
        console.error("Failed to load admin Deal of the Day:", loadError);
        setError(loadError instanceof Error ? loadError.message : "Failed to load Deal of the Day.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const today = indiaDate();
  const todayDeals = useMemo(() => deals.filter(deal => deal.dealDate === today), [deals, today]);
  const activeToday = todayDeals.filter(deal => deal.active).length;
  const featuredToday = todayDeals.filter(deal => deal.featured).length;
  const upcoming = deals.filter(deal => deal.dealDate > today).length;
  const filteredProducts = products.filter(product =>
    product.selectable && `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query.toLowerCase())
  );
  const selectedProduct = products.find(product => product.id === form.productId);

  function startCreate() {
    setForm(emptyForm());
    setQuery("");
    setError("");
    setModal(true);
  }

  function startEdit(deal: Deal) {
    setForm({
      id: deal.id,
      productId: deal.productId,
      discountPercent: deal.discountPercent,
      dealDate: deal.dealDate,
      active: deal.active,
      featured: deal.featured,
      showOnHomepage: deal.showOnHomepage,
    });
    setQuery(deal.productName);
    setError("");
    setModal(true);
  }

  async function saveDeal() {
    if (!form.productId || !form.dealDate || form.discountPercent <= 0 || form.discountPercent >= 100) {
      setError("Choose a product, valid date, and discount between 1% and 99%.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/deal-of-day", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" ||
          !("success" in result) || result.success !== true) {
        const message = result && typeof result === "object" && "message" in result &&
          typeof result.message === "string" ? result.message : "Failed to save this deal.";
        throw new Error(message);
      }
      setModal(false);
      await loadData();
    } catch (saveError) {
      console.error("Failed to save Deal of the Day:", saveError);
      setError(saveError instanceof Error ? saveError.message : "Failed to save this deal.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDeal(deal: Deal) {
    if (!window.confirm(`Delete the deal for "${deal.productName}" on ${deal.dealDate}?`)) return;
    setDeletingId(deal.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/deal-of-day?id=${deal.id}`, { method: "DELETE" });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" ||
          !("success" in result) || result.success !== true) {
        const message = result && typeof result === "object" && "message" in result &&
          typeof result.message === "string" ? result.message : "Failed to delete this deal.";
        throw new Error(message);
      }
      await loadData();
    } catch (deleteError) {
      console.error("Failed to delete Deal of the Day:", deleteError);
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete this deal.");
    } finally {
      setDeletingId(null);
    }
  }

  function set<K extends keyof DealForm>(key: K, value: DealForm[K]) {
    setForm(previous => ({ ...previous, [key]: value }));
  }

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Operations / Deal of the Day" title="Deal of the Day"
        subtitle="Schedule product discounts and choose the featured homepage deal"
        count={deals.length} onAdd={startCreate} addLabel="Set New Deal" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Deals Today" val={todayDeals.length} color={G} icon={Gift} />
        <StatCard label="Active Today" val={activeToday} color="#3b82f6" icon={Gift} />
        <StatCard label="Featured Today" val={featuredToday} color="#f59e0b" icon={Star} />
        <StatCard label="Upcoming Deals" val={upcoming} color="#8b5cf6" icon={CalendarDays} />
      </div>

      {error && !modal && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {loading ? (
        <div className={`${card} p-8 text-center text-sm text-gray-500`}>Loading Deal of the Day campaigns…</div>
      ) : deals.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <Gift className="mx-auto mb-3 text-gray-300" size={32} />
          <p className="font-bold text-gray-700">No daily deals scheduled</p>
          <p className="mt-1 text-sm text-gray-400">Create a deal to show special product pricing in your store.</p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-black text-gray-800">Scheduled and past deals</h2>
            <p className="mt-1 text-xs text-gray-400">Only active deals for today are included in store pricing.</p>
          </div>
          <div className="divide-y divide-gray-100">
            {deals.map(deal => (
              <article key={deal.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  {deal.imageUrl ? <img src={deal.imageUrl} alt="" className="h-full w-full object-contain" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-gray-900">{deal.productName}</h3>
                    {deal.featured && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Featured</span>}
                    {deal.showOnHomepage && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Homepage</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${deal.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {deal.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{deal.brand || deal.category} · {deal.dealDate}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-black text-emerald-700">{money(deal.dealPrice)}</span>
                    <span className="text-gray-400 line-through">{money(deal.originalPrice)}</span>
                    <span className="font-bold text-rose-600">{deal.discountPercent}% off</span>
                    <span className="text-gray-400">{deal.stock} in stock</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => startEdit(deal)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">
                    <Pencil size={13} /> Edit
                  </button>
                  <button type="button" disabled={deletingId === deal.id} onClick={() => void deleteDeal(deal)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">
                    <Trash2 size={13} /> {deletingId === deal.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <Modal open={modal} onClose={() => !saving && setModal(false)}
        title={form.id ? "Edit Deal of the Day" : "Set Deal of the Day"} wide>
        <div className="space-y-4">
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          <Field label="Find a product" required>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={event => setQuery(event.target.value)}
                placeholder="Search active products by name, brand, or category" className={`${inp} pl-9`} />
            </div>
            <select value={form.productId || ""} onChange={event => {
              const productId = Number(event.target.value);
              set("productId", productId);
              const product = products.find(item => item.id === productId);
              if (product) setQuery(product.name);
            }} className={`${inp} mt-2`} required>
              <option value="">Select a product</option>
              {filteredProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} {product.brand ? `— ${product.brand}` : ""} · {money(product.price)}
                </option>
              ))}
              {form.productId && !filteredProducts.some(product => product.id === form.productId) &&
                products.filter(product => product.id === form.productId).map(product => (
                  <option key={product.id} value={product.id} disabled>{product.name} (not selectable)</option>
                ))}
            </select>
            {selectedProduct && <p className="mt-1 text-[10px] text-gray-400">
              Current price: {money(selectedProduct.price)} · Stock: {selectedProduct.stock}
            </p>}
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Discount percent" required hint="Between 1 and 99">
              <input type="number" min="1" max="99" step="0.01" value={form.discountPercent}
                onChange={event => set("discountPercent", Number(event.target.value))} className={inp} />
            </Field>
            <Field label="Deal date" required>
              <input type="date" value={form.dealDate} onChange={event => set("dealDate", event.target.value)}
                className={inp} />
            </Field>
          </div>
          {selectedProduct && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              Deal price preview: <strong>{money(selectedProduct.price * (1 - form.discountPercent / 100))}</strong>
            </p>
          )}
          <div className="space-y-2">
            {[
              { key: "featured" as const, label: "Featured main product", icon: Star },
              { key: "showOnHomepage" as const, label: "Show in homepage Deal of the Day", icon: Home },
              { key: "active" as const, label: "Deal active for the scheduled date", icon: Gift },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="flex items-center gap-2 text-sm text-gray-700"><Icon size={14} className="text-gray-400" />{label}</span>
                <Toggle checked={form[key] as boolean} onChange={() => set(key, !form[key])} />
              </div>
            ))}
          </div>
          {form.featured && <p className="text-[11px] text-gray-400">Setting this as featured replaces the featured product for this date.</p>}
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button type="button" disabled={saving} onClick={() => setModal(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="button" disabled={saving || !form.productId}
              onClick={() => void saveDeal()}
              className="rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: G }}>
              {saving ? "Saving…" : form.id ? "Save Changes" : "Create Deal"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DealOfDayPage;
