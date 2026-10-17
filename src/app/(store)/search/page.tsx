"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "../../context/AppContext";
import { useNavigation } from "../../hooks/useNavigation";
import { SearchResultsPage } from "../../components/pages/SearchResultsPage";

function SearchContent() {
  const searchParams = useSearchParams();
  const { addCart, wish, toggleWish, searchQuery } = useApp();
  const { viewProduct } = useNavigation();

  const urlQuery = searchParams.get("q") || "";
  const activeQuery = urlQuery || searchQuery;

  return (
    <SearchResultsPage
      query={activeQuery}
      onAdd={addCart}
      onWish={toggleWish}
      wish={wish}
      onView={viewProduct}
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
