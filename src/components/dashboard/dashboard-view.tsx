"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, List, Plus, Pencil } from "lucide-react";
import { CreateRoomDialog } from "./create-room-dialog";
import { CreateTaskWithRoomDialog } from "./create-task-with-room-dialog";
import { CompleteTaskButton } from "./complete-task-button";
import { EditTaskDialog } from "./edit-task-dialog";
import Link from "next/link";

interface Room {
  id: string;
  name: string;
  icon: string;
}

interface TaskWithInstance {
  id: string;
  name: string;
  description: string | null;
  points: number;
  assignment_type: string;
  assigned_to: string | null;
  recurrence_type: string;
  recurrence_rule: {
    type?: string;
    count?: number;
    period?: string;
    weekdays?: number[];
  } | null;
  room_id: string;
  room_name: string;
  room_icon: string;
  instance_id: string | null;
  instance_assigned_to: string | null;
  instance_due_date: string | null;
  is_overdue: boolean;
}

interface Member {
  user_id: string;
  name: string;
}

interface DashboardViewProps {
  rooms: Room[];
  houseId: string;
  tasksByRoom: Record<string, TaskWithInstance[]>;
  members: Member[];
  memberMap: Record<string, string>;
  todayStr: string;
}

const STORAGE_KEY = "mopmap-dashboard-view";

export function DashboardView({
  rooms,
  houseId,
  tasksByRoom,
  members,
  memberMap,
  todayStr,
}: DashboardViewProps) {
  const [view, setView] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY) as "grid" | "list") || "grid";
    }
    return "grid";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, view);
  }, [view]);

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar: toggle + add buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView("grid")}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              view === "grid"
                ? "bg-green-fresh text-background"
                : "text-text-muted hover:bg-surface-hover"
            }`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              view === "list"
                ? "bg-green-fresh text-background"
                : "text-text-muted hover:bg-surface-hover"
            }`}
          >
            <List size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {view === "list" && (
            <CreateTaskWithRoomDialog
              rooms={rooms}
              houseId={houseId}
              members={members}
              trigger={
                <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-yellow-accent px-3 text-xs font-semibold text-background hover:bg-yellow-dark">
                  <Plus size={16} />
                  Task
                </button>
              }
            />
          )}
          <CreateRoomDialog
            houseId={houseId}
            trigger={
              <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-green-fresh px-3 text-xs font-semibold text-background hover:bg-green-muted">
                <Plus size={16} />
                Stanza
              </button>
            }
          />
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-surface-border bg-surface p-6 transition-colors hover:border-green-fresh/50 hover:bg-surface-hover"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background text-3xl">
                {room.icon}
              </div>
              <span className="text-sm font-semibold text-text-primary">{room.name}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {rooms.map((room) => {
            const tasks = [...(tasksByRoom[room.id] ?? [])].sort((a, b) => {
              const dateA = a.instance_due_date ?? "9999-12-31";
              const dateB = b.instance_due_date ?? "9999-12-31";
              return dateA.localeCompare(dateB);
            });
            return (
              <div key={room.id} className="flex flex-col gap-2">
                <Link
                  href={`/room/${room.id}`}
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  <span className="text-lg">{room.icon}</span>
                  <h2 className="text-sm font-bold text-text-primary">{room.name}</h2>
                  <span className="text-xs text-text-muted">({tasks.length})</span>
                </Link>

                {tasks.length === 0 ? (
                  <p className="px-2 text-xs text-text-muted">Nessun task</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 rounded-xl border-2 bg-surface p-3 ${
                          task.is_overdue
                            ? "border-red-error/30"
                            : "border-surface-border"
                        }`}
                      >
                        {task.instance_id ? (
                          <CompleteTaskButton instanceId={task.instance_id} />
                        ) : (
                          <div className="h-6 w-6 shrink-0" />
                        )}
                        <div className="flex flex-1 flex-col gap-0.5">
                          <span className="text-sm font-semibold text-text-primary">
                            {task.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                            {task.instance_assigned_to &&
                              memberMap[task.instance_assigned_to] && (
                                <span>{memberMap[task.instance_assigned_to]}</span>
                              )}
                            {task.instance_due_date && (
                              <>
                                <span>·</span>
                                <span
                                  className={
                                    task.is_overdue ? "text-red-error font-semibold" : ""
                                  }
                                >
                                  {task.instance_due_date === todayStr
                                    ? "Oggi"
                                    : new Date(
                                        task.instance_due_date + "T00:00:00"
                                      ).toLocaleDateString("it-IT", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                </span>
                              </>
                            )}
                            {task.recurrence_type !== "none" && (
                              <>
                                <span>·</span>
                                <span className="text-green-fresh">Ricorrente</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: task.points }).map((_, i) => (
                              <span key={i} className="text-xs text-yellow-accent">
                                ★
                              </span>
                            ))}
                          </div>
                          <EditTaskDialog
                            task={task}
                            members={members}
                            currentDueDate={task.instance_due_date ?? undefined}
                            trigger={
                              <button className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary">
                                <Pencil size={14} />
                              </button>
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
