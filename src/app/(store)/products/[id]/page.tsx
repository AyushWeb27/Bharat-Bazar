"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../context/AppContext";
import { useNavigation } from "../../../hooks/useNavigation";
import { DetailPage } from "../../../components/pages/DetailPage";
import type { Prod } from "../../../components/types/index";

function isProduct(value: unknown): value is Prod {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const product = value as Record<string, unknown>;
  return typeof product.id === "number" &&
    typeof product.name === "string" &&
    typeof product.brand === "string" &&
    typeof product.cat === "string" &&
    typeof product.price === "number" &&
    typeof product.mrp === "number" &&
    typeof product.rating === "number" &&
    typeof product.reviews === "number" &&
    typeof product.off === "number" &&
    typeof product.cod === "boolean" &&
    typeof product.emi === "boolean" &&
    typeof product.freeShip === "boolean" &&
    typeof product.inStock === "boolean" &&
    typeof product.tag === "string" &&
    typeof product.tagClr === "string" &&
    typeof product.img === "string" &&
    typeof product.img2 === "string" &&
    typeof product.desc === "string" &&
    Array.isArray(product.sizes) &&
    product.sizes.every(size => typeof size === "string") &&
    Boolean(product.spec && typeof product.spec === "object" && !Array.isArray(product.spec)) &&
    (!("variants" in product) || (Array.isArray(product.variants) && product.variants.every(v => Boolean(v && typeof v === "object")))) &&
    (!("flashSaleName" in product) || typeof product.flashSaleName === "string") &&
    (!("flashSaleEndDate" in product) || typeof product.flashSaleEndDate === "string");
}

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addCart, wish, toggleWish } = useApp();
  const { viewProduct } = useNavigation();
  const id = params?.id ?? "";
  const [product, setProduct] = useState<Prod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result: unknown = await response.json();
        if (
          !response.ok ||
          !result ||
          typeof result !== "object" ||
          !("success" in result) ||
          result.success !== true ||
          !("product" in result) ||
          !isProduct(result.product)
        ) {
          const message = result && typeof result === "object" &&
            "message" in result && typeof result.message === "string"
            ? result.message
            : "Could not load product details.";
          throw new Error(message);
        }
        setProduct(result.product);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setError(loadError instanceof Error ? loadError.message : "Could not load product details.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    if (id) void loadProduct();
    else {
      setError("A valid product ID is required.");
      setLoading(false);
    }
    return () => controller.abort();
  }, [id, retry]);

  if (loading) {
    return (
      <div className="grid animate-pulse gap-8 md:grid-cols-2" aria-label="Loading product details">
        <div className="aspect-[4/5] rounded-3xl bg-muted" />
        <div className="space-y-4 rounded-3xl border border-border p-6">
          <div className="h-5 w-1/3 rounded bg-muted" />
          <div className="h-8 w-4/5 rounded bg-muted" />
          <div className="h-20 rounded-2xl bg-muted" />
          <div className="h-12 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div role="alert" className="py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Product Unavailable</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{error || "This product could not be found."}</p>
        {error && !error.toLowerCase().includes("not available") && (
          <button
            type="button"
            onClick={() => setRetry(value => value + 1)}
            className="mt-4 mr-4 text-[#009966] font-semibold hover:underline"
          >
            Try again
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push("/category")}
          className="mt-4 text-[#009966] font-semibold hover:underline"
        >
          Browse categories
        </button>
      </div>
    );
  }

  const buyNow = async (selectedProduct: Prod, quantity: number) => {
    const checkoutParams = new URLSearchParams({
      buyNow: "1",
      productId: String(selectedProduct.id),
      quantity: String(quantity),
      variantTitle: selectedProduct.selectedSize || "",
    });
    const checkoutPath = `/checkout?${checkoutParams.toString()}`;
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const session: unknown = await response.json();
      const authenticated = response.ok && session && typeof session === "object" &&
        "authenticated" in session && session.authenticated === true;
      router.push(authenticated ? checkoutPath : `/signin?redirect=${encodeURIComponent(checkoutPath)}`);
    } catch (buyError) {
      console.error("Could not verify sign-in before Buy now:", buyError);
      router.push(`/signin?redirect=${encodeURIComponent(checkoutPath)}`);
    }
  };

  return (
    <DetailPage
      p={product}
      onAdd={addCart}
      onBuyNow={buyNow}
      onWish={toggleWish}
      wished={wish.has(product.id)}
      wishedIds={wish}
      onBack={() => router.push(`/category/${encodeURIComponent(product.cat)}`)}
      onView={viewProduct}
    />
  );
}
