"use client";

import { useApp } from "../context/AppContext";
import { useNavigation } from "../hooks/useNavigation";
import { HomePage } from "../components/pages/HomePage";

export default function Home() {
  const { addCart, wish, toggleWish } = useApp();
  const { setPage, viewProduct } = useNavigation();

  return (
    <HomePage
      onAdd={addCart}
      onWish={toggleWish}
      wish={wish}
      onView={viewProduct}
      setPage={setPage}
    />
  );
}
