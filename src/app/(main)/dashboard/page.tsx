import { Home } from "lucide-react";
import { CreateHouseDialog } from "@/components/dashboard/create-house-dialog";
import { JoinHouseDialog } from "@/components/dashboard/join-house-dialog";
import { CreateRoomDialog } from "@/components/dashboard/create-room-dialog";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { createClient } from "@/lib/supabase/server";

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("house_members")
    .select("house_id")
    .eq("user_id", user!.id)
    .limit(1)
    .single();

  let house: { id: string; name: string; invite_code: string } | null = null;
  if (membership) {
    const { data } = await supabase
      .from("houses")
      .select("id, name, invite_code")
      .eq("id", membership.house_id)
      .single();
    house = data;
  }

  if (!house) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface">
          <Home size={40} className="text-text-muted" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-text-primary">Benvenuto su MOP MAP!</h1>
          <p className="text-sm text-text-muted">
            Crea una nuova casa o unisciti a una esistente.
          </p>
        </div>
        <div className="flex gap-3">
          <CreateHouseDialog />
          <JoinHouseDialog />
        </div>
      </div>
    );
  }

  // Fetch rooms
  const { data: roomData } = await supabase
    .from("rooms")
    .select("id, name, icon")
    .eq("house_id", house.id)
    .order("created_at", { ascending: true });
  const rooms = roomData ?? [];

  if (rooms.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface">
          <Home size={32} className="text-text-muted" />
        </div>
        <p className="text-sm text-text-muted">Nessuna stanza ancora</p>
        <CreateRoomDialog houseId={house.id} />
      </div>
    );
  }

  // Fetch all active tasks for the house
  const { data: allTasks } = await supabase
    .from("tasks")
    .select(
      "id, name, description, points, assignment_type, assigned_to, recurrence_type, recurrence_rule, daily_count, room_id"
    )
    .eq("house_id", house.id)
    .eq("archived", false)
    .order("created_at", { ascending: true });

  // Fetch pending instances for all tasks
  const taskIds = (allTasks ?? []).map((t) => t.id);
  const instanceMap: Record<
    string,
    { id: string; assigned_to: string | null; due_date: string }
  > = {};

  if (taskIds.length > 0) {
    const { data: instances } = await supabase
      .from("task_instances")
      .select("id, task_id, assigned_to, due_date")
      .in("task_id", taskIds)
      .eq("status", "pending")
      .order("due_date", { ascending: true });

    for (const inst of instances ?? []) {
      if (!instanceMap[inst.task_id]) {
        instanceMap[inst.task_id] = inst;
      }
    }
  }

  // Fetch members
  const { data: memberData } = await supabase
    .from("house_members")
    .select("user_id, profiles(name)")
    .eq("house_id", house.id);

  const members = (memberData ?? []).map((m) => ({
    user_id: m.user_id,
    name: (m.profiles as unknown as { name: string })?.name ?? "",
  }));
  const memberMap = Object.fromEntries(members.map((m) => [m.user_id, m.name]));

  const todayStr = todayString();
  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]));

  // Build tasks by room with instance info
  const tasksByRoom: Record<
    string,
    Array<{
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
    }>
  > = {};

  for (const room of rooms) {
    tasksByRoom[room.id] = [];
  }

  for (const task of allTasks ?? []) {
    const inst = instanceMap[task.id];
    const room = roomMap[task.room_id];
    if (!room) continue;

    const entry = {
      ...task,
      recurrence_rule: task.recurrence_rule as {
        type?: string;
        count?: number;
        period?: string;
        weekdays?: number[];
      } | null,
      room_name: room.name,
      room_icon: room.icon,
      instance_id: inst?.id ?? null,
      instance_assigned_to: inst?.assigned_to ?? null,
      instance_due_date: inst?.due_date ?? null,
      is_overdue: inst ? inst.due_date < todayStr : false,
    };

    if (!tasksByRoom[task.room_id]) tasksByRoom[task.room_id] = [];
    tasksByRoom[task.room_id].push(entry);
  }

  return (
    <DashboardView
      rooms={rooms}
      houseId={house.id}
      tasksByRoom={tasksByRoom}
      members={members}
      memberMap={memberMap}
      todayStr={todayStr}
    />
  );
}
