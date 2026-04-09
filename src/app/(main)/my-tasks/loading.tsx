export default function MyTasksLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="h-7 w-36 animate-pulse rounded-lg bg-surface" />
        <div className="h-10 w-10 animate-pulse rounded-lg bg-surface" />
      </div>
      {[1, 2].map((section) => (
        <section key={section} className="flex flex-col gap-2">
          <div className="h-4 w-20 animate-pulse rounded bg-surface" />
          <div className="flex flex-col gap-1.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border-2 border-surface-border bg-surface p-3"
              >
                <div className="h-6 w-6 animate-pulse rounded-md bg-surface-hover" />
                <div className="h-5 w-5 animate-pulse rounded bg-surface-hover" />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />
                  <div className="h-3 w-20 animate-pulse rounded bg-surface-hover" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
