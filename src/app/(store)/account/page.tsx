"use client";

import { useApp } from "../../context/AppContext";
import { useNavigation } from "../../hooks/useNavigation";
import { AccountPage } from "../../components/pages/AccountPage";

export default function Account() {
  const { dark, setDark } = useApp();
  const { setPage } = useNavigation();

  return <AccountPage setPage={setPage} dark={dark} setDark={setDark} />;
}
