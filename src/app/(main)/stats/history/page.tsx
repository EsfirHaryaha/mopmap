import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/supabase/cached";
import { HistoryList } from "@/components/dashboard/history-list";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Get Monday of the week containing the given date */
function getMonday(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const membership = await getMembership();

  if (!membership) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm text-text-muted">
          Unisciti a una casa per vedere lo storico
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const now = new Date();
  let monday: Date;

  if (params.week) {
    const parsed = new Date(params.week + "T00:00:00");
    monday = isNaN(parsed.getTime()) ? getMonday(now) : getMonday(parsed);
  } else {
    monday = getMonday(now);
  }

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const fromStr = toDateStr(monday);
  const toStart = fromStr + "T00:00:00";
  const toEnd = toDateStr(sunday) + "T23:59:59";

  const supabase = await createClient();

  const [{ data: instances }, { data: memberData }] = await Promise.all([
    supabase
      .from("task_instances")
      .select(
        "id, points_earned, completed_at, completed_by, duration_sec, tasks(name, rooms(name, icon))"
      )
      .eq("house_id", membership.house_id)
      .eq("status", "completed")
      .gte("completed_at", toStart)
      .lte("completed_at", toEnd)
      .order("completed_at", { ascending: false }),
    supabase
      .from("house_members")
      .select("user_id, profiles(name)")
      .eq("house_id", membership.house_id),
  ]);

  const members = (memberData ?? []).map((m) => ({
    user_id: m.user_id,
    name: (m.profiles as unknown as { name: string })?.name ?? "Senza nome",
  }));

  const history = (instances ?? []).map((inst) => {
    const task = inst.tasks as unknown as {
      name: string;
      rooms: { name: string; icon: string } | null;
    } | null;
    return {
      id: inst.id,
      task_name: task?.name ?? "Task eliminato",
      room_name: task?.rooms?.name ?? "",
      room_icon: task?.rooms?.icon ?? "",
      points_earned: inst.points_earned,
      completed_at: inst.completed_at ?? "",
      completed_by: inst.completed_by ?? "",
      duration_sec: inst.duration_sec,
    };
  });

  return <HistoryList history={history} members={members} weekStart={fromStr} />;
}
