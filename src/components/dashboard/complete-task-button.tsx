"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeInstance } from "@/app/actions/task";

interface CompleteTaskButtonProps {
  instanceId: string;
}

export function CompleteTaskButton({ instanceId }: CompleteTaskButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleComplete() {
    if (loading) return;
    setLoading(true);
    const result = await completeInstance(instanceId);
    if (!result.error) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleComplete();
      }}
      disabled={loading}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-surface-border transition-colors hover:border-green-fresh"
    >
      {loading && (
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-text-muted border-t-transparent" />
      )}
    </button>
  );
}
