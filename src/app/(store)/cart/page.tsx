"use client";

import { useApp } from "../../context/AppContext";
import { useNavigation } from "../../hooks/useNavigation";
import { CartPage } from "../../components/pages/CartPage";

export default function Cart() {
  const { cart, setCart } = useApp();
  const { setPage, viewProduct } = useNavigation();

  return (
    <CartPage
      cart={cart}
      setCart={setCart}
      onView={viewProduct}
      setPage={setPage}
    />
  );
}
