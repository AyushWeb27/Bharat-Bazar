"use client";

import { useRouter } from "next/navigation";
import { PAGE_PATHS, type Page, type Prod } from "../components/types/index";

export function useNavigation() {
  const router = useRouter();

  const setPage = (p: Page) => {
    const target = PAGE_PATHS[p];
    if (target) router.push(target);
  };

  const viewProduct = (p: Prod) => {
    router.push(`/products/${p.id}`);
  };

  return { router, setPage, viewProduct };
}
