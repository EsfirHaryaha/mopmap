export const dynamic = "force-dynamic";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-20 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
