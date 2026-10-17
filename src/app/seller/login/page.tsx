"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { SellerLoginPage } from "../../components/pages/SellerLoginPage";

export default function SellerLogin() {
  const { setPage } = useNavigation();

  return <SellerLoginPage setPage={setPage} />;
}
