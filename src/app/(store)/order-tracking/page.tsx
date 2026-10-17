"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { OrderTrackingPage } from "../../components/pages/OrderTrackingPage";

export default function OrderTracking() {
  const { setPage } = useNavigation();

  return <OrderTrackingPage setPage={setPage} />;
}
