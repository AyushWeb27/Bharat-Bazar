import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Clock, Edit2, Package, Percent, Trash2, Zap } from "lucide-react";
import { DeleteConfirm, Field, Modal, PageHeader, StatCard, Toggle } from "./shared/ui";
import { G, GD, inp, card } from "./shared/constants";

type SaleStatus = "Active" | "Upcoming" | "Ended" | "Paused";
type DiscountType = "percent" | "flat";

type SaleProduct = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  selectable: boolean;
};

type FlashSale = {
  id: number;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  active: boolean;
  productIds: number[];
  productNames: string[];
};

type SaleForm = Omit<FlashSale, "id" | "productNames">;

const EMPTY_FORM: SaleForm = {
  name: "",
  discountType: "percent",
  discountValue: 20,
  startDate: "",
  endDate: "",
  active: true,
  productIds: [],
};

const statusMeta: Record<SaleStatus, { color: string; bg: string }> = {
  Active: { color: G, bg: `${G}15` },
  Upcoming: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  Ended: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  Paused: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};

function getStatus(sale: FlashSale, now: number): SaleStatus {
  if (!sale.active) return "Paused";
  if (new Date(sale.startDate).getTime() > now) return "Upcoming";
  if (new Date(sale.endDate).getTime() > now) return "Active";
  return "Ended";
}

function toLocalDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function fromLocalDateTime(value: string) {
  return new Date(value).toISOString();
}

async function readResponse(response: Response) {
  const result: unknown = await response.json();
  if (!response.ok || !result || typeof result !== "object" ||
      !("success" in result) || result.success !== true) {
    const message = result && typeof result === "object" && "message" in result &&
      typeof result.message === "string" ? result.message : "Flash sale request failed.";
    throw new Error(message);
  }
  return result as Record<string, unknown>;
}

function Countdown({ endDate }: { endDate: string }) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const remaining = Math.max(0, new Date(endDate).getTime() - now);
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  return <span>{days ? `${days}d ` : ""}{hours}h {minutes}m {seconds}s</span>;
}

export function FlashSalePage() {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<FlashSale | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<SaleForm>(EMPTY_FORM);
  const [now, setNow] = useState(Date.now);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/admin/flash-sales", {
      cache: "no-store",
      ...(signal ? { signal } : {}),
    });
    const result = await readResponse(response);
    if (!Array.isArray(result.sales) || !Array.isArray(result.products)) {
      throw new Error("The flash sale response was invalid.");
    }
    setSales(result.sales as FlashSale[]);
    setProducts(result.products as SaleProduct[]);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal).catch(loadError => {
      if (!controller.signal.aborted) {
        console.error("Failed to load admin flash sales:", loadError);
        setError(loadError instanceof Error ? loadError.message : "Failed to load flash sales.");
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [loadData]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const activeSales = useMemo(() => sales.filter(sale => getStatus(sale, now) === "Active").length, [sales, now]);
  const upcomingSales = useMemo(() => sales.filter(sale => getStatus(sale, now) === "Upcoming").length, [sales, now]);
  const percentageSales = sales.filter(sale => sale.discountType === "percent");
  const averageDiscount = percentageSales.length
    ? Math.round(percentageSales.reduce((total, sale) => total + sale.discountValue, 0) / percentageSales.length)
    : 0;

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setError("");
    setModal(true);
  };

  const openEdit = (sale: FlashSale) => {
    setForm({
      name: sale.name,
      discountType: sale.discountType,
      discountValue: sale.discountValue,
      startDate: toLocalDateTime(sale.startDate),
      endDate: toLocalDateTime(sale.endDate),
      active: sale.active,
      productIds: sale.productIds,
    });
    setEditing(sale);
    setError("");
    setModal(true);
  };

  const updateForm = <K extends keyof SaleForm>(key: K, value: SaleForm[K]) => {
    setForm(previous => ({ ...previous, [key]: value }));
  };

  const save = async () => {
    if (!form.name.trim() || !form.startDate || !form.endDate || (!editing && !form.productIds.length)) {
      setError("Enter a name, choose sale dates, and select at least one product.");
      return;
    }
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate >= endDate) {
      setError("The end date must be later than the start date.");
      return;
    }
    if (!Number.isFinite(form.discountValue) || form.discountValue <= 0 ||
        (form.discountType === "percent" && form.discountValue > 100)) {
      setError("Enter a valid discount greater than 0 (and no more than 100%).");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/flash-sales", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editing ? { id: editing.id } : {}),
          ...form,
          startDate: fromLocalDateTime(form.startDate),
          endDate: fromLocalDateTime(form.endDate),
        }),
      });
      await readResponse(response);
      setModal(false);
      setEditing(null);
      await loadData();
    } catch (saveError) {
      console.error("Failed to save flash sale:", saveError);
      setError(saveError instanceof Error ? saveError.message : "Failed to save flash sale.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSale = async (sale: FlashSale) => {
    setError("");
    try {
      const response = await fetch("/api/admin/flash-sales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sale.id,
          name: sale.name,
          discountType: sale.discountType,
          discountValue: sale.discountValue,
          startDate: sale.startDate,
          endDate: sale.endDate,
          active: !sale.active,
          productIds: sale.productIds,
        }),
      });
      await readResponse(response);
      await loadData();
    } catch (toggleError) {
      console.error("Failed to update flash sale status:", toggleError);
      setError(toggleError instanceof Error ? toggleError.message : "Failed to update flash sale.");
    }
  };

  const deleteSale = async () => {
    if (deleteId === null) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/flash-sales?id=${deleteId}`, { method: "DELETE" });
      await readResponse(response);
      setSales(current => current.filter(sale => sale.id !== deleteId));
      setDeleteId(null);
    } catch (deleteError) {
      console.error("Failed to delete flash sale:", deleteError);
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete flash sale.");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Operations / Flash Sales" title="Flash Sales"
        subtitle="Manage time-limited discounts shown on the storefront"
        count={sales.length} onAdd={openAdd} addLabel="Create Flash Sale" />

      {error && !modal && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active Sales" val={activeSales} color={G} icon={Zap} />
        <StatCard label="Upcoming" val={upcomingSales} color="#3b82f6" icon={Clock} />
        <StatCard label="Products in Sales" val={sales.reduce((total, sale) => total + sale.productIds.length, 0)} color="#8b5cf6" icon={Package} />
        <StatCard label="Avg Percent Discount" val={percentageSales.length ? `${averageDiscount}%` : "—"} color="#f59e0b" icon={Percent} />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-500">
          Loading flash sales…
        </div>
      ) : !sales.length ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Zap size={28} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm font-bold text-gray-700">No flash sales yet</p>
          <p className="mt-1 text-xs text-gray-400">Create a sale and select products to publish it on the store home page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {sales.map(sale => {
            const status = getStatus(sale, now);
            const meta = statusMeta[status];
            return (
              <motion.div key={sale.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`${card} p-5 transition-all hover:shadow-md`}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-gray-900">{sale.name}</h3>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ color: meta.color, background: meta.bg }}>
                        {status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {sale.discountType === "percent"
                        ? `${sale.discountValue}% off`
                        : `₹${sale.discountValue.toLocaleString("en-IN")} off`}
                      {" · "}{sale.productIds.length} products
                    </p>
                  </div>
                  <Toggle checked={sale.active} onChange={() => void toggleSale(sale)} />
                </div>

                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: `${GD}15`, color: GD }}>
                    <span className="text-base font-black">
                      {sale.discountValue}{sale.discountType === "percent" ? "%" : "₹"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {status === "Active" && (
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={11} className="text-red-500" />
                        <span className="font-bold text-red-500">Ends in: </span>
                        <Countdown endDate={sale.endDate} />
                      </p>
                    )}
                    {status === "Upcoming" && (
                      <p className="text-xs text-gray-500">
                        Starts: <span className="font-bold text-gray-700">
                          {new Date(sale.startDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </p>
                    )}
                    {status === "Ended" && (
                      <p className="text-xs text-gray-500">
                        Ended: <span className="font-bold text-gray-700">
                          {new Date(sale.endDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </span>
                      </p>
                    )}
                    <p className="line-clamp-2 text-[11px] text-gray-500">
                      {sale.productNames.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <div className="flex-1" />
                  <button type="button" onClick={() => openEdit(sale)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:bg-blue-100">
                    <Edit2 size={11} /> Edit
                  </button>
                  <button type="button" onClick={() => setDeleteId(sale.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 transition-all hover:bg-red-100">
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => !saving && setModal(false)}
        title={editing ? "Edit Flash Sale" : "Create Flash Sale"} wide>
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Sale Name" required>
              <input value={form.name} onChange={event => updateForm("name", event.target.value)}
                maxLength={120} placeholder="e.g. Weekend Electronics Sale" className={inp} />
            </Field>
          </div>
          <Field label="Start Date & Time" required>
            <input type="datetime-local" value={form.startDate}
              onChange={event => updateForm("startDate", event.target.value)} className={inp} />
          </Field>
          <Field label="End Date & Time" required>
            <input type="datetime-local" value={form.endDate}
              onChange={event => updateForm("endDate", event.target.value)} className={inp} />
          </Field>
          <Field label="Discount Type">
            <select value={form.discountType}
              onChange={event => updateForm("discountType", event.target.value as DiscountType)} className={inp}>
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
          </Field>
          <Field label={form.discountType === "percent" ? "Discount %" : "Discount (₹)"}>
            <input type="number" value={form.discountValue}
              onChange={event => updateForm("discountValue", Number(event.target.value))}
              min="0.01" max={form.discountType === "percent" ? 100 : undefined} step="0.01" className={inp} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Select Products" required hint={`${form.productIds.length} selected`}>
              {products.length ? (
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-2">
                  {products.map(product => (
                    <label key={product.id}
                      className={`flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 ${product.selectable || form.productIds.includes(product.id) ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                      <input type="checkbox" checked={form.productIds.includes(product.id)}
                        onChange={event => updateForm(
                          "productIds",
                          event.target.checked
                            ? [...form.productIds, product.id]
                            : form.productIds.filter(id => id !== product.id)
                        )}
                        disabled={!product.selectable && !form.productIds.includes(product.id)}
                        className="h-4 w-4 accent-[#009966]" />
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                          <Package size={16} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-gray-800">{product.name}</span>
                        <span className="block truncate text-[10px] text-gray-400">
                          {[product.brand, product.category, !product.selectable ? "Unavailable — remove from sale" : ""]
                            .filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-bold text-gray-600">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800">
                  No active products are available. Add active products before creating a flash sale.
                </p>
              )}
            </Field>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Toggle checked={form.active} onChange={() => updateForm("active", !form.active)} />
              <span className="text-sm text-gray-600">Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setModal(false)} disabled={saving}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button type="button" onClick={() => void save()}
                disabled={saving || (!editing && !products.some(product => product.selectable))}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: G }}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Sale"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <DeleteConfirm
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { void deleteSale(); }}
        title="Delete Flash Sale"
        message={`Remove "${sales.find(sale => sale.id === deleteId)?.name}"? This cannot be undone.`}
      />
    </div>
  );
}

export default FlashSalePage;
