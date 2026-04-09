import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getMembership } from "@/lib/supabase/cached";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const membership = await getMembership();
  const houseName = membership?.house?.name ?? null;

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
