"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { OrdersPage } from "../../components/pages/OrdersPage";

export default function Orders() {
  const { setPage } = useNavigation();

  return <OrdersPage setPage={setPage} />;
}
