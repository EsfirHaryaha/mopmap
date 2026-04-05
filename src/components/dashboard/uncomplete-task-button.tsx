"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uncompleteInstance } from "@/app/actions/task";

interface UncompleteTaskButtonProps {
  instanceId: string;
}

export function UncompleteTaskButton({ instanceId }: UncompleteTaskButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUncomplete() {
    if (loading) return;
    setLoading(true);
    await uncompleteInstance(instanceId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleUncomplete();
      }}
      disabled={loading}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-green-fresh bg-green-fresh text-background transition-colors hover:bg-green-fresh/70"
    >
      {loading ? (
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 7L6 10L11 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
