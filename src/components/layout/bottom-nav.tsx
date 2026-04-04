"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ListChecks, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Stanze",
    icon: LayoutGrid,
  },
  {
    href: "/my-tasks",
    label: "I miei task",
    icon: ListChecks,
  },
  {
    href: "/stats",
    label: "Classifiche",
    icon: Trophy,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-surface-border bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-green-fresh"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
