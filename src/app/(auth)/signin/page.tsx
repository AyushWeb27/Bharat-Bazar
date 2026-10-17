"use client";

import { useNavigation } from "../../hooks/useNavigation";
import { SignInPage } from "../../components/pages/SignInPage";

export default function SignIn() {
  const { setPage } = useNavigation();

  return <SignInPage setPage={setPage} />;
}
