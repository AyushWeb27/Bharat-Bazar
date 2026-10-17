"use client";

import { useNavigation } from "../hooks/useNavigation";
import { AdminDashboard } from "../components/pages/AdminDashboard";

export default function Admin() {
  const { setPage } = useNavigation();

  return <AdminDashboard setPage={setPage} />;
}
