"use client";

import { useState } from "react";
import { completeInstance } from "@/app/actions/task";

interface CompleteTaskButtonProps {
  instanceId: string;
}

export function CompleteTaskButton({ instanceId }: CompleteTaskButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleComplete() {
    if (loading || done) return;
    setLoading(true);
    const result = await completeInstance(instanceId);
    setLoading(false);

    if (!result.error) {
      setDone(true);
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleComplete();
      }}
      disabled={loading}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
        done
          ? "border-green-fresh bg-green-fresh text-background"
          : "border-surface-border hover:border-green-fresh"
      }`}
    >
      {done && (
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
      {loading && !done && (
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-text-muted border-t-transparent" />
      )}
    </button>
  );
}
