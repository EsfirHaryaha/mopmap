export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-surface" />
        <div className="h-10 w-10 animate-pulse rounded-lg bg-surface" />
      </div>
      {/* Room cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-5 w-32 animate-pulse rounded bg-surface" />
          <div className="rounded-xl border-2 border-surface-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-pulse rounded-md bg-surface-hover" />
              <div className="flex flex-1 flex-col gap-1">
                <div className="h-4 w-36 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-24 animate-pulse rounded bg-surface-hover" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
