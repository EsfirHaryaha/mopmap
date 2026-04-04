import { ListChecks, AlertCircle, CalendarDays, CalendarRange } from "lucide-react";

export default function MyTasksPage() {
  // TODO: fetch user's tasks from Supabase

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">I miei task</h1>
        <p className="text-sm text-text-muted">Le tue cose da fare</p>
      </div>

      {/* Scaduti */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-red-error" />
          <h2 className="text-sm font-semibold text-red-error">Scaduti</h2>
        </div>
        <div className="rounded-2xl border-2 border-red-error/20 bg-red-error/5 p-4 text-center">
          <p className="text-sm text-text-muted">Nessun task scaduto</p>
        </div>
      </section>

      {/* Oggi */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-green-fresh" />
          <h2 className="text-sm font-semibold text-green-fresh">Oggi</h2>
        </div>
        <div className="rounded-2xl border-2 border-surface-border bg-surface p-4 text-center">
          <p className="text-sm text-text-muted">Nessun task per oggi</p>
        </div>
      </section>

      {/* Questa settimana */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange size={18} className="text-yellow-accent" />
          <h2 className="text-sm font-semibold text-yellow-accent">Questa settimana</h2>
        </div>
        <div className="rounded-2xl border-2 border-surface-border bg-surface p-4 text-center">
          <p className="text-sm text-text-muted">Nessun task questa settimana</p>
        </div>
      </section>

      {/* Questo mese */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ListChecks size={18} className="text-text-secondary" />
          <h2 className="text-sm font-semibold text-text-secondary">Questo mese</h2>
        </div>
        <div className="rounded-2xl border-2 border-surface-border bg-surface p-4 text-center">
          <p className="text-sm text-text-muted">Nessun task questo mese</p>
        </div>
      </section>
    </div>
  );
}
