"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { ForgotPasswordPage } from "../../components/pages/ForgotPasswordPage";

export default function ForgotPassword() {
  const { setPage } = useNavigation();

  return <ForgotPasswordPage setPage={setPage} />;
}
