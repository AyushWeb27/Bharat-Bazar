"use client";

import { useParams } from "next/navigation";
import { useApp } from "../../../context/AppContext";
import { useNavigation } from "../../../hooks/useNavigation";
import { CategoryLandingPage } from "../../../components/pages/CategoryLandingPage";

export default function Category() {
  const params = useParams<{ cat: string }>();
  const { addCart, wish, toggleWish } = useApp();
  const { setPage, viewProduct } = useNavigation();

  const rawCat = params?.cat || "Electronics";
  const decodedCategory = decodeURIComponent(rawCat);

  return (
    <CategoryLandingPage
      category={decodedCategory}
      onAdd={addCart}
      onWish={toggleWish}
      wish={wish}
      onView={viewProduct}
      setPage={setPage}
    />
  );
}
