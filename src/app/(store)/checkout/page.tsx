"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { CheckoutPage } from "../../components/pages/CheckoutPage";

export default function Checkout() {
  const { setPage } = useNavigation();

  return <CheckoutPage setPage={setPage} />;
}
