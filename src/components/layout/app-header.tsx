"use client";

import { Logo } from "@/components/ui/logo";
import { Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AppHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-surface-border bg-background">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary"
          >
            <Settings size={20} />
          </Link>
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-red-error"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
