"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { AdminLoginPage } from "../../components/pages/AdminLoginPage";

export default function AdminLogin() {
  const { setPage } = useNavigation();

  return <AdminLoginPage setPage={setPage} />;
}
