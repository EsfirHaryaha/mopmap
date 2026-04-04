import { cn } from "@/lib/utils";
import { SprayCan } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 20, text: "text-lg" },
  md: { icon: 28, text: "text-2xl" },
  lg: { icon: 40, text: "text-4xl" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center justify-center rounded-xl bg-green-fresh p-2">
        <SprayCan size={s.icon} className="text-background" />
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight text-text-primary", s.text)}>
          MOPMAP
        </span>
      )}
    </div>
  );
}
