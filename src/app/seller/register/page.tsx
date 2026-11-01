"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { SellerRegisterPage } from "../../components/pages/SellerRegisterPage";

export default function SellerRegister() {
  const { setPage } = useNavigation();

  return <SellerRegisterPage setPage={setPage} />;
}

