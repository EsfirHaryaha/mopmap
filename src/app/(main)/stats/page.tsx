import { StatsContent } from "@/components/dashboard/stats-content";
import { createClient } from "@/lib/supabase/server";

export default async function StatsPage() {
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

  if (!membership) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm text-text-muted">
          Unisciti a una casa per vedere le classifiche
        </p>
      </div>
    );
  }

  // Fetch completed instances and members in parallel
  const [{ data: completed }, { data: memberData }] = await Promise.all([
    supabase
      .from("task_instances")
      .select("completed_by, points_earned, completed_at, duration_sec")
      .eq("house_id", membership.house_id)
      .eq("status", "completed"),
    supabase
      .from("house_members")
      .select("user_id, profiles(name)")
      .eq("house_id", membership.house_id),
  ]);

  const members = (memberData ?? []).map((m) => ({
    user_id: m.user_id,
    name: (m.profiles as unknown as { name: string })?.name ?? "Senza nome",
  }));

  return (
    <StatsContent
      completed={(completed ?? []).map((c) => ({
        completed_by: c.completed_by ?? "",
        points_earned: c.points_earned,
        completed_at: c.completed_at ?? "",
        duration_sec: c.duration_sec,
      }))}
      members={members}
      userId={user!.id}
    />
  );
}
