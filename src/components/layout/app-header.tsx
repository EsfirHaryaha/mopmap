"use client";

import { Logo } from "@/components/ui/logo";
import { Settings, LogOut, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AppHeaderProps {
  houseName?: string | null;
}

export function AppHeader({ houseName }: AppHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-surface-border bg-background">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          {houseName && (
            <div className="flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1">
              <Home size={14} className="text-green-fresh" />
              <span className="text-xs font-semibold text-text-secondary">
                {houseName}
              </span>
            </div>
          )}
        </div>
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
