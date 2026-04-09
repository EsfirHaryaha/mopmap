export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-7 w-24 animate-pulse rounded-lg bg-surface" />
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-surface-border bg-surface p-6">
        <div className="h-16 w-16 animate-pulse rounded-full bg-surface-hover" />
        <div className="h-5 w-32 animate-pulse rounded bg-surface-hover" />
        <div className="h-4 w-48 animate-pulse rounded bg-surface-hover" />
      </div>
    </div>
  );
}
