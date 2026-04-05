import { ArrowLeft, Plus, Pencil } from "lucide-react";
import { CreateTaskDialog } from "@/components/dashboard/create-task-dialog";
import { EditTaskDialog } from "@/components/dashboard/edit-task-dialog";
import { CompleteTaskButton } from "@/components/dashboard/complete-task-button";
import { ArchivedTasksToggle } from "@/components/dashboard/archived-tasks-toggle";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("id, name, icon, house_id")
    .eq("id", id)
    .single();

  if (!room) notFound();

  // Active tasks
  const { data: activeTasks } = await supabase
    .from("tasks")
    .select(
      "id, name, description, points, assignment_type, assigned_to, recurrence_type, recurrence_rule, daily_count, room_id"
    )
    .eq("room_id", room.id)
    .eq("archived", false)
    .order("created_at", { ascending: true });

  // Archived tasks
  const { data: archivedTasks } = await supabase
    .from("tasks")
    .select("id, name, description, points")
    .eq("room_id", room.id)
    .eq("archived", true)
    .order("created_at", { ascending: false });

  // Get completed instances for archived tasks (most recent per task)
  const archivedTaskIds = (archivedTasks ?? []).map((t) => t.id);
  const archivedInstances: Record<string, string> = {};
  if (archivedTaskIds.length > 0) {
    const { data: instData } = await supabase
      .from("task_instances")
      .select("id, task_id")
      .in("task_id", archivedTaskIds)
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    for (const inst of instData ?? []) {
      if (!archivedInstances[inst.task_id]) {
        archivedInstances[inst.task_id] = inst.id;
      }
    }
  }

  // Next pending instance per active task
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const activeTaskIds = (activeTasks ?? []).map((t) => t.id);
  const nextInstance: Record<
    string,
    { id: string; assigned_to: string | null; due_date: string }
  > = {};

  if (activeTaskIds.length > 0) {
    const { data: pendingData } = await supabase
      .from("task_instances")
      .select("id, task_id, assigned_to, due_date")
      .in("task_id", activeTaskIds)
      .eq("status", "pending")
      .order("due_date", { ascending: true });

    for (const inst of pendingData ?? []) {
      if (!nextInstance[inst.task_id]) {
        nextInstance[inst.task_id] = inst;
      }
    }
  }

  // Members
  const { data: memberData } = await supabase
    .from("house_members")
    .select("user_id, profiles(name)")
    .eq("house_id", room.house_id);

  const members = (memberData ?? []).map((m) => ({
    user_id: m.user_id,
    name: (m.profiles as unknown as { name: string })?.name ?? "",
  }));

  const memberMap = Object.fromEntries(members.map((m) => [m.user_id, m.name]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary"
          >
            <ArrowLeft size={20} />
          </Link>
          <span className="text-2xl">{room.icon}</span>
          <h1 className="text-xl font-bold text-text-primary">{room.name}</h1>
        </div>
        <CreateTaskDialog
          roomId={room.id}
          houseId={room.house_id}
          members={members}
          trigger={
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-accent text-background hover:bg-yellow-dark">
              <Plus size={20} />
            </button>
          }
        />
      </div>

      {(!activeTasks || activeTasks.length === 0) &&
      (!archivedTasks || archivedTasks.length === 0) ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-text-muted">Nessun task in questa stanza</p>
          <CreateTaskDialog roomId={room.id} houseId={room.house_id} members={members} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Active tasks */}
          {(activeTasks ?? []).map((task) => {
            const inst = nextInstance[task.id];
            const isOverdue = inst && inst.due_date < todayStr;

            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 rounded-xl border-2 bg-surface p-4 ${
                  isOverdue ? "border-red-error/30" : "border-surface-border"
                }`}
              >
                {inst ? (
                  <CompleteTaskButton instanceId={inst.id} />
                ) : (
                  <div className="h-6 w-6 shrink-0" />
                )}
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="font-semibold text-text-primary">{task.name}</span>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                    {inst && inst.assigned_to && memberMap[inst.assigned_to] && (
                      <span>{memberMap[inst.assigned_to]}</span>
                    )}
                    {inst && (
                      <>
                        <span>·</span>
                        <span className={isOverdue ? "text-red-error font-semibold" : ""}>
                          {inst.due_date === todayStr
                            ? "Oggi"
                            : new Date(inst.due_date + "T00:00:00").toLocaleDateString(
                                "it-IT",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
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
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: task.points }).map((_, i) => (
                      <span key={i} className="text-sm text-yellow-accent">
                        ★
                      </span>
                    ))}
                  </div>
                  <EditTaskDialog
                    task={task}
                    members={members}
                    currentDueDate={inst?.due_date}
                    trigger={
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary">
                        <Pencil size={16} />
                      </button>
                    }
                  />
                </div>
              </div>
            );
          })}

          {/* Archived tasks */}
          <ArchivedTasksToggle
            tasks={(archivedTasks ?? []).map((t) => ({
              id: t.id,
              name: t.name,
              description: t.description,
              points: t.points,
              instanceId: archivedInstances[t.id] ?? null,
            }))}
          />
        </div>
      )}
    </div>
  );
}
