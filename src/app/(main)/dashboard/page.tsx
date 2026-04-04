import { Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  // TODO: fetch rooms from Supabase
  const rooms: { id: string; name: string; icon: string }[] = [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Le tue stanze</h1>
          <p className="text-sm text-text-muted">
            Seleziona una stanza per vedere i task
          </p>
        </div>
        <Button size="icon" variant="accent">
          <Plus size={20} />
        </Button>
      </div>

      {/* Rooms grid */}
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-surface-border py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface">
            <Home size={32} className="text-text-muted" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-text-primary">Nessuna stanza</p>
            <p className="text-sm text-text-muted">
              Crea la tua prima stanza per iniziare
            </p>
          </div>
          <Button variant="accent" size="sm">
            <Plus size={16} />
            Crea stanza
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/room/${room.id}`}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-surface-border bg-surface p-6 transition-colors hover:border-green-fresh/50 hover:bg-surface-hover"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background text-3xl">
                {room.icon}
              </div>
              <span className="text-sm font-semibold text-text-primary">{room.name}</span>
            </Link>
          ))}
        </div>
      )}

      {/* House info card */}
      <div className="rounded-2xl border-2 border-surface-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">La tua casa</p>
            <p className="font-semibold text-text-primary">Nessuna casa</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Crea casa
            </Button>
            <Button variant="ghost" size="sm" className="text-green-fresh">
              Unisciti
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
