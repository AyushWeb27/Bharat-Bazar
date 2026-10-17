"use client";

import { useNavigation } from "./hooks/useNavigation";
import { NotFoundPage } from "./components/pages/NotFoundPage";

export default function NotFound() {
  const { setPage } = useNavigation();

  return <NotFoundPage setPage={setPage} />;
}
