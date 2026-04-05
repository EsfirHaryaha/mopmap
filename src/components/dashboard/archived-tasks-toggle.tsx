"use client";

import { useState } from "react";
import { UncompleteTaskButton } from "./uncomplete-task-button";

interface ArchivedTask {
  id: string;
  name: string;
  description: string | null;
  points: number;
  instanceId: string | null;
}

interface ArchivedTasksToggleProps {
  tasks: ArchivedTask[];
}

export function ArchivedTasksToggle({ tasks }: ArchivedTasksToggleProps) {
  const [show, setShow] = useState(false);

  if (tasks.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-sm text-text-muted underline hover:text-text-secondary"
      >
        {show ? "Nascondi" : "Mostra"} task archiviati ({tasks.length})
      </button>

      {show && (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-xl border-2 border-surface-border bg-surface/50 p-4 opacity-60"
            >
              {task.instanceId ? (
                <UncompleteTaskButton instanceId={task.instanceId} />
              ) : (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-green-fresh bg-green-fresh text-background">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7L6 10L11 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-semibold text-text-primary line-through">
                  {task.name}
                </span>
                {task.description && (
                  <span className="text-xs text-text-muted">{task.description}</span>
                )}
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: task.points }).map((_, i) => (
                  <span key={i} className="text-sm text-yellow-accent">
                    ★
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
