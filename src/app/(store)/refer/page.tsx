"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { ReferPage } from "../../components/pages/ReferPage";

export default function Refer() {
  const { setPage } = useNavigation();

  return <ReferPage setPage={setPage} />;
}
