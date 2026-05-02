import { cn } from "@/lib/utils";

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

function MopIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Handle stub */}
      <line x1="12" y1="2" x2="12" y2="8" />
      {/* Mop base */}
      <rect x="4" y="8" width="16" height="3" rx="1.5" />
      {/* Mop strands */}
      <line x1="6" y1="11" x2="5" y2="22" />
      <line x1="9" y1="11" x2="8.5" y2="22" />
      <line x1="12" y1="11" x2="12" y2="22" />
      <line x1="15" y1="11" x2="15.5" y2="22" />
      <line x1="18" y1="11" x2="19" y2="22" />
    </svg>
  );
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center justify-center rounded-xl bg-green-fresh p-2">
        <MopIcon size={s.icon} />
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight text-text-primary", s.text)}>
          Moppy
        </span>
      )}
    </div>
  );
}
