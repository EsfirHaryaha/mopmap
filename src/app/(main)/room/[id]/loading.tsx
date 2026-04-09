export default function RoomLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-surface" />
          <div className="h-7 w-7 animate-pulse rounded bg-surface" />
          <div className="h-6 w-28 animate-pulse rounded-lg bg-surface" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-lg bg-surface" />
      </div>
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border-2 border-surface-border bg-surface p-4"
          >
            <div className="h-6 w-6 animate-pulse rounded-md bg-surface-hover" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="h-4 w-36 animate-pulse rounded bg-surface-hover" />
              <div className="h-3 w-24 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
