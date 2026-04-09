export default function StatsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-7 w-32 animate-pulse rounded-lg bg-surface" />
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border-2 border-surface-border bg-surface p-4"
          >
            <div className="h-10 w-10 animate-pulse rounded-full bg-surface-hover" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
              <div className="h-3 w-16 animate-pulse rounded bg-surface-hover" />
            </div>
            <div className="h-6 w-12 animate-pulse rounded bg-surface-hover" />
          </div>
        ))}
      </div>
    </div>
  );
}
