"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { PAGE_PATHS, type Page, type Prod } from "../components/types/index";

export function useNavigation() {
  const router = useRouter();

  const setPage = useCallback(
    (p: Page) => {
      const target = PAGE_PATHS[p];
      if (target) router.push(target);
    },
    [router]
  );

  const viewProduct = useCallback(
    (p: Prod) => {
      router.push(`/products/${p.id}`);
    },
    [router]
  );

  return { router, setPage, viewProduct };
}
