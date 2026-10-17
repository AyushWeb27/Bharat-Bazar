"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { RegisterPage } from "../../components/pages/RegisterPage";

export default function Register() {
  const { setPage } = useNavigation();

  return <RegisterPage setPage={setPage} />;
}
