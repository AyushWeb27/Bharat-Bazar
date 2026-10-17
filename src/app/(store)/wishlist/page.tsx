"use client";

import { useApp } from "../../context/AppContext";
import { useNavigation } from "../../hooks/useNavigation";
import { WishlistPage } from "../../components/pages/WishlistPage";

export default function Wishlist() {
  const { wish, toggleWish, addCart } = useApp();
  const { viewProduct } = useNavigation();

  return (
    <WishlistPage
      wish={wish}
      onWish={toggleWish}
      onAdd={addCart}
      onView={viewProduct}
    />
  );
}
