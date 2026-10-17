"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../context/AppContext";
import { useNavigation } from "../../../hooks/useNavigation";
import { DetailPage } from "../../../components/pages/DetailPage";
import { PRODUCTS } from "../../../components/data/index";
import type { Prod } from "../../../components/types/index";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addCart, wish, toggleWish } = useApp();
  const { viewProduct } = useNavigation();

  const id = params?.id;
  const product: Prod | undefined = PRODUCTS.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
        <button
          onClick={() => router.push("/products")}
          className="text-[#009966] font-semibold hover:underline"
        >
          Return to Products
        </button>
      </div>
    );
  }

  return (
    <DetailPage
      p={product}
      onAdd={addCart}
      onWish={toggleWish}
      wished={wish.has(product.id)}
      wishedIds={wish}
      onBack={() => router.push("/products")}
      onView={viewProduct}
    />
  );
}
