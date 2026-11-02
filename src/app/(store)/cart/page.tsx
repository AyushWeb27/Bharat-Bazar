"use client";

import { useApp } from "../../context/AppContext";
import { useNavigation } from "../../hooks/useNavigation";
import { CartPage } from "../../components/pages/CartPage";

export default function Cart() {
  const {
    cart,
    cartLoading,
    cartError,
    user,
    refreshCart,
    updateCartQuantity,
    removeCartItem,
  } = useApp();
  const { setPage, viewProduct } = useNavigation();

  return (
    <CartPage
      cart={cart}
      loading={cartLoading}
      error={cartError}
      user={user}
      refreshCart={refreshCart}
      updateQuantity={updateCartQuantity}
      removeItem={removeCartItem}
      onView={viewProduct}
      setPage={setPage}
    />
  );
}
