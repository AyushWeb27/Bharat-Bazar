"use client";

import { useNavigation } from "../hooks/useNavigation";
import { SellerDashboard } from "../components/pages/SellerDashboard";

export default function Seller() {
  const { setPage } = useNavigation();

  return <SellerDashboard setPage={setPage} />;
}
