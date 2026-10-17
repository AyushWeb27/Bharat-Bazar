"use client";

import { useApp } from "../../context/AppContext";
import { useNavigation } from "../../hooks/useNavigation";
import { ProductsPage } from "../../components/pages/ProductsPage";

export default function Products() {
  const { addCart, wish, toggleWish } = useApp();
  const { viewProduct } = useNavigation();

  return (
    <ProductsPage
      onAdd={addCart}
      onWish={toggleWish}
      wish={wish}
      onView={viewProduct}
    />
  );
}
