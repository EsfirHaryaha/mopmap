import { ArrowLeft, Plus } from "lucide-react";
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

  // Fetch active tasks, archived tasks, and members in parallel
  const [{ data: activeTasks }, { data: archivedTasks }, { data: memberData }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select(
          "id, name, description, points, assignment_type, assigned_to, recurrence_type, recurrence_rule, daily_count, room_id"
        )
        .eq("room_id", room.id)
        .eq("archived", false)
        .order("created_at", { ascending: true }),
      supabase
        .from("tasks")
        .select("id, name, description, points")
        .eq("room_id", room.id)
        .eq("archived", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("house_members")
        .select("user_id, profiles(name)")
        .eq("house_id", room.house_id),
    ]);

  // Fetch archived instances and pending instances in parallel
  const archivedTaskIds = (archivedTasks ?? []).map((t) => t.id);
  const activeTaskIds = (activeTasks ?? []).map((t) => t.id);

  const [archivedInstResult, pendingInstResult] = await Promise.all([
    archivedTaskIds.length > 0
      ? supabase
          .from("task_instances")
          .select("id, task_id")
          .in("task_id", archivedTaskIds)
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
      : Promise.resolve({ data: [] as { id: string; task_id: string }[] }),
    activeTaskIds.length > 0
      ? supabase
          .from("task_instances")
          .select("id, task_id, assigned_to, due_date")
          .in("task_id", activeTaskIds)
          .eq("status", "pending")
          .order("due_date", { ascending: true })
      : Promise.resolve({
          data: [] as {
            id: string;
            task_id: string;
            assigned_to: string | null;
            due_date: string;
          }[],
        }),
  ]);

  const archivedInstances: Record<string, string> = {};
  for (const inst of archivedInstResult.data ?? []) {
    if (!archivedInstances[inst.task_id]) {
      archivedInstances[inst.task_id] = inst.id;
    }
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;

  const nextInstance: Record<
    string,
    { id: string; assigned_to: string | null; due_date: string }
  > = {};
  for (const inst of pendingInstResult.data ?? []) {
    if (!nextInstance[inst.task_id]) {
      nextInstance[inst.task_id] = inst;
    }
  }

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
                <EditTaskDialog
                  task={task}
                  members={members}
                  currentDueDate={inst?.due_date}
                  trigger={
                    <button className="flex flex-1 items-center gap-3 text-left">
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="font-semibold text-text-primary">
                          {task.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                          {inst && inst.assigned_to && memberMap[inst.assigned_to] && (
                            <span>{memberMap[inst.assigned_to]}</span>
                          )}
                          {inst && (
                            <>
                              <span>·</span>
                              <span
                                className={
                                  isOverdue ? "text-red-error font-semibold" : ""
                                }
                              >
                                {inst.due_date === todayStr
                                  ? "Oggi"
                                  : new Date(
                                      inst.due_date + "T00:00:00"
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
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: task.points }).map((_, i) => (
                          <span key={i} className="text-sm text-yellow-accent">
                            ★
                          </span>
                        ))}
                      </div>
                    </button>
                  }
                />
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
