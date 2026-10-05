"use client";

import { useLoadingStore } from "@/store/useLoadingStore";

export default function GlobalLoader() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[999999] h-1 bg-orange-100 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse w-full origin-left" />
    </div>
  );
}