"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { CheckoutPage } from "../../components/pages/CheckoutPage";
import { useApp } from "../../context/AppContext";

export default function Checkout() {
  const { setPage } = useNavigation();
  const { cart, cartLoading, refreshCart, user, userLoading } = useApp();

  return (
    <CheckoutPage
      setPage={setPage}
      cart={cart}
      cartLoading={cartLoading}
      refreshCart={refreshCart}
      user={user}
      userLoading={userLoading}
    />
  );
}
