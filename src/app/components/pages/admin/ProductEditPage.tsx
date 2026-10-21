import { useEffect, useMemo, useState } from "react";
import { Pencil, Package } from "lucide-react";
import type { Product } from "./shared/types";
import { G, fmt, prodStatusMeta, card } from "./shared/constants";
import { PageHeader, SearchBar, StatCard } from "./shared/ui";

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Record<string, unknown>;
  return typeof product.id === "number" &&
    typeof product.name === "string" &&
    typeof product.sku === "string" &&
    typeof product.cat === "string" &&
    typeof product.subcat === "string" &&
    typeof product.mrp === "number" &&
    typeof product.price === "number" &&
    typeof product.stock === "number" &&
    typeof product.featured === "boolean" &&
    ["active", "inactive", "out_of_stock", "low_stock", "draft"].includes(String(product.status));
}

export function ProductEditPage({ onEdit }: { onEdit: (id: number) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/admin/products", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result: unknown = await response.json();
        if (!response.ok || !result || typeof result !== "object" ||
          !("success" in result) || result.success !== true ||
          !("products" in result) || !Array.isArray(result.products) ||
          !result.products.every(isProduct)) {
          const message = result && typeof result === "object" && "message" in result && typeof result.message === "string"
            ? result.message
            : "Could not load products.";
          throw new Error(message);
        }
        setProducts(result.products);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load products.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadProducts();
    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.cat.toLowerCase().includes(query)
    );
  }, [products, search]);

  return (
    <div className="space-y-5">
      <PageHeader breadcrumb="Products › Edit Product" title="Edit Product" subtitle="Search your catalogue and open a product in the full product editor" count={products.length} />
      <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
        <StatCard label="Products" val={products.length} color={G} icon={Package} />
        <StatCard label="Search Results" val={filteredProducts.length} color="#6366f1" icon={Pencil} />
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className={card}>
        <div className="border-b border-gray-100 p-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by product name, SKU, or category…" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["Product", "SKU", "Category", "Price", "Stock", "Status", "Action"].map(label => (
                  <th key={label} className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map(product => {
                const status = prodStatusMeta[product.status];
                return (
                  <tr key={product.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-gray-800">{product.name}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{product.sku || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{product.cat || "—"}</td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-800">{fmt(product.price)}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg px-2 py-1 text-[10px] font-bold" style={{ color: status.color, background: status.bg }}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => onEdit(product.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100">
                        <Pencil size={13} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredProducts.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  {error ? "Products could not be loaded." : products.length === 0 ? "No products have been added yet." : "No products match your search."}
                </td></tr>
              )}
              {loading && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">Loading products…</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-4 py-3">
          <p className="text-[11px] text-gray-400">Showing {filteredProducts.length} of {products.length} products</p>
        </div>
      </div>
    </div>
  );
}

export default ProductEditPage;
