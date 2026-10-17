"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { OrderConfirmationPage } from "../../components/pages/OrderConfirmationPage";

export default function OrderConfirmation() {
  const { setPage } = useNavigation();

  return <OrderConfirmationPage setPage={setPage} />;
}
