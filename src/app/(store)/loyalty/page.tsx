"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { LoyaltyPage } from "../../components/pages/LoyaltyPage";

export default function Loyalty() {
  const { setPage } = useNavigation();

  return <LoyaltyPage setPage={setPage} />;
}
