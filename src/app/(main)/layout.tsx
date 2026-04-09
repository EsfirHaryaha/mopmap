import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let houseName: string | null = null;
  if (user) {
    // Single query with join instead of two sequential queries
    const { data: membership } = await supabase
      .from("house_members")
      .select("houses(name)")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    houseName = (membership?.houses as unknown as { name: string })?.name ?? null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader houseName={houseName} />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-20 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
