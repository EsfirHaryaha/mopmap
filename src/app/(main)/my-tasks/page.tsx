import {
  Plus,
  AlertCircle,
  CalendarDays,
  CalendarRange,
  Calendar,
  Repeat,
} from "lucide-react";
import { CreateTaskWithRoomDialog } from "@/components/dashboard/create-task-with-room-dialog";
import { CompleteTaskButton } from "@/components/dashboard/complete-task-button";
import { TaskTimerDialog } from "@/components/dashboard/task-timer-dialog";
import { createClient } from "@/lib/supabase/server";
import { getUserId, getMembership } from "@/lib/supabase/cached";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getDateBounds() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);

  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  return {
    todayStr: toLocal(today),
    in7Str: toLocal(in7),
    in30Str: toLocal(in30),
  };
}

interface Instance {
  id: string;
  due_date: string;
  points_earned: number;
  assigned_to: string | null;
  task_name: string;
  task_description: string | null;
  room_icon: string;
  room_name: string;
}

export default async function MyTasksPage() {
  const supabase = await createClient();
  const [userId, membership] = await Promise.all([getUserId(), getMembership()]);

  let rooms: { id: string; name: string; icon: string }[] = [];
  let members: { user_id: string; name: string }[] = [];
  let instances: Instance[] = [];

  if (membership) {
    const [{ data: roomData }, { data: memberData }, { data: instanceData }] =
      await Promise.all([
        supabase
          .from("rooms")
          .select("id, name, icon")
          .eq("house_id", membership.house_id),
        supabase
          .from("house_members")
          .select("user_id, profiles(name)")
          .eq("house_id", membership.house_id),
        supabase
          .from("task_instances")
          .select(
            "id, due_date, points_earned, assigned_to, task_id, tasks(name, description, room_id, rooms(name, icon))"
          )
          .eq("house_id", membership.house_id)
          .eq("status", "pending")
          .or(`assigned_to.eq.${userId},assigned_to.is.null`)
          .order("due_date", { ascending: true }),
      ]);

    rooms = roomData ?? [];
    members = (memberData ?? []).map((m) => ({
      user_id: m.user_id,
      name: (m.profiles as unknown as { name: string })?.name ?? "",
    }));

    instances = (instanceData ?? []).map((inst) => {
      const task = inst.tasks as unknown as {
        name: string;
        description: string | null;
        room_id: string;
        rooms: { name: string; icon: string };
      };
      return {
        id: inst.id,
        due_date: inst.due_date,
        points_earned: inst.points_earned,
        assigned_to: inst.assigned_to,
        task_name: task?.name ?? "",
        task_description: task?.description ?? null,
        room_icon: task?.rooms?.icon ?? "🏠",
        room_name: task?.rooms?.name ?? "",
      };
    });
  }

  const { todayStr, in7Str, in30Str } = getDateBounds();

  const always = instances.filter((i) => !i.due_date);
  const dated = instances.filter((i) => i.due_date);
  const overdue = dated.filter((i) => i.due_date! < todayStr);
  const today = dated.filter((i) => i.due_date === todayStr);
  const next7 = dated.filter((i) => i.due_date! > todayStr && i.due_date! < in7Str);
  const next30 = dated.filter((i) => i.due_date! >= in7Str && i.due_date! < in30Str);

  const sections = [
    {
      title: "Scaduti",
      items: overdue,
      icon: AlertCircle,
      color: "text-red-error",
      borderColor: "border-red-error/20",
      bgColor: "bg-red-error/5",
      hideWhenEmpty: true,
    },
    {
      title: "Oggi",
      items: today,
      icon: CalendarDays,
      color: "text-green-fresh",
      borderColor: "border-surface-border",
      bgColor: "bg-surface",
    },
    {
      title: "Entro 7 giorni",
      items: next7,
      icon: CalendarRange,
      color: "text-yellow-accent",
      borderColor: "border-surface-border",
      bgColor: "bg-surface",
    },
    {
      title: "Entro 30 giorni",
      items: next30,
      icon: Calendar,
      color: "text-text-secondary",
      borderColor: "border-surface-border",
      bgColor: "bg-surface",
    },
    {
      title: "Sempre disponibili",
      items: always,
      icon: Repeat,
      color: "text-blue-400",
      borderColor: "border-surface-border",
      bgColor: "bg-surface",
      hideWhenEmpty: true,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">I miei task</h1>
        {membership && rooms.length > 0 && (
          <CreateTaskWithRoomDialog
            rooms={rooms}
            houseId={membership.house_id}
            members={members}
            trigger={
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-accent text-background hover:bg-yellow-dark">
                <Plus size={20} />
              </button>
            }
          />
        )}
      </div>

      {sections.map((section) => {
        if (section.hideWhenEmpty && section.items.length === 0) return null;
        return (
          <section key={section.title} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <section.icon size={16} className={section.color} />
              <h2 className={`text-sm font-semibold ${section.color}`}>
                {section.title}
                {section.items.length > 0 && (
                  <span className="ml-1 text-xs font-normal text-text-muted">
                    ({section.items.length})
                  </span>
                )}
              </h2>
            </div>

            {section.items.length === 0 ? (
              <div
                className={`rounded-xl border-2 ${section.borderColor} ${section.bgColor} px-4 py-3 text-center`}
              >
                <p className="text-xs text-text-muted">Nessun task</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {section.items.map((inst) => (
                  <TaskTimerDialog
                    key={inst.id}
                    instanceId={inst.id}
                    taskName={inst.task_name}
                    roomIcon={inst.room_icon}
                    roomName={inst.room_name}
                    points={inst.points_earned}
                    trigger={
                      <div
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 ${section.borderColor} ${section.bgColor} p-3 transition-colors hover:border-green-fresh/30`}
                      >
                        <CompleteTaskButton instanceId={inst.id} />
                        <span className="text-lg">{inst.room_icon}</span>
                        <div className="flex flex-1 flex-col gap-0.5">
                          <span className="text-sm font-semibold text-text-primary">
                            {inst.task_name}
                          </span>
                          <span className="text-xs text-text-muted">
                            {inst.room_name}
                            {inst.due_date !== todayStr &&
                              ` · ${new Date(inst.due_date + "T00:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "short" })}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: inst.points_earned }).map((_, i) => (
                            <span key={i} className="text-xs text-yellow-accent">
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
