"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Play, Pause, Square, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeInstance } from "@/app/actions/task";

interface TaskTimerDialogProps {
  instanceId: string;
  taskName: string;
  taskDescription?: string | null;
  roomIcon: string;
  roomName: string;
  points: number;
  trigger: React.ReactNode;
}

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TaskTimerDialog({
  instanceId,
  taskName,
  taskDescription,
  roomIcon,
  roomName,
  points,
  trigger,
}: TaskTimerDialogProps) {
  const [open, setOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [completing, setCompleting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const toggle = useCallback(() => {
    if (running) {
      stop();
    } else {
      start();
    }
  }, [running, start, stop]);

  const reset = useCallback(() => {
    stop();
    setElapsed(0);
  }, [stop]);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function handleOpenChange(v: boolean) {
    if (!v) {
      stop();
      setElapsed(0);
    }
    setOpen(v);
  }

  async function handleComplete() {
    stop();
    setCompleting(true);
    const duration = elapsed >= 60 ? elapsed : undefined;
    await completeInstance(instanceId, duration);
    setCompleting(false);
    setElapsed(0);
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-surface-border bg-background p-6">
          <div className="flex items-center justify-between pb-2">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              {taskName}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">Timer per il task</Dialog.Description>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{roomIcon}</span>
            <span>{roomName}</span>
            {points > 0 && (
              <>
                <span>·</span>
                <span className="text-yellow-accent">{"★".repeat(points)}</span>
              </>
            )}
          </div>

          {taskDescription && (
            <p className="whitespace-pre-wrap text-sm text-text-secondary pb-2">
              {taskDescription}
            </p>
          )}

          <div className="pb-2" />

          {/* Timer display */}
          <div className="flex flex-col items-center gap-6">
            <div className="text-5xl font-bold tabular-nums text-text-primary">
              {formatTime(elapsed)}
            </div>

            {/* Timer controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggle}
                className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                  running
                    ? "bg-yellow-accent text-background hover:bg-yellow-dark"
                    : "bg-green-fresh text-background hover:bg-green-muted"
                }`}
              >
                {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>

              {elapsed > 0 && !running && (
                <button
                  onClick={reset}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-muted hover:bg-surface-hover"
                >
                  <Square size={18} />
                </button>
              )}
            </div>

            {/* Complete button */}
            <Button
              onClick={handleComplete}
              disabled={completing}
              className="w-full"
              size="lg"
            >
              <Check size={20} />
              {completing ? "Completamento..." : "Completa task"}
            </Button>

            {elapsed > 0 && (
              <p className="text-xs text-text-muted">
                {elapsed < 60
                  ? "Il tempo sotto 1 minuto non verrà salvato"
                  : "Il tempo verrà salvato al completamento"}
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
