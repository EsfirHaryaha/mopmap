"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Check,
  X,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import {
  updateCompletedInstance,
  revertCompletedInstance,
  deleteCompletedInstance,
} from "@/app/actions/task";

interface HistoryEntry {
  id: string;
  task_name: string;
  room_name: string;
  room_icon: string;
  points_earned: number;
  completed_at: string;
  completed_by: string;
  duration_sec: number | null;
}

interface Member {
  user_id: string;
  name: string;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

function durationToMinutes(sec: number | null): string {
  if (!sec) return "";
  return String(Math.round(sec / 60));
}

function isoToDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const h = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function formatWeekLabel(weekStart: string): string {
  const monday = new Date(weekStart + "T00:00:00");
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const from = monday.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
  const to = sunday.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
  return `${from} – ${to}`;
}

function shiftWeek(weekStart: string, direction: number): string {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + direction * 7);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isCurrentWeek(weekStart: string): boolean {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  const y = monday.getFullYear();
  const m = (monday.getMonth() + 1).toString().padStart(2, "0");
  const d = monday.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}` === weekStart;
}

export function HistoryList({
  history,
  members,
  weekStart,
}: {
  history: HistoryEntry[];
  members: Member[];
  weekStart: string;
}) {
  const memberMap = Object.fromEntries(members.map((m) => [m.user_id, m.name]));
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState(0);
  const [editCompletedBy, setEditCompletedBy] = useState("");
  const [editCompletedAt, setEditCompletedAt] = useState("");
  const [editMinutes, setEditMinutes] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function navigateWeek(direction: number) {
    const newWeek = shiftWeek(weekStart, direction);
    router.push(`/stats/history?week=${newWeek}`);
  }

  function startEdit(entry: HistoryEntry) {
    setEditingId(entry.id);
    setEditPoints(entry.points_earned);
    setEditCompletedBy(entry.completed_by);
    setEditCompletedAt(isoToDatetimeLocal(entry.completed_at));
    setEditMinutes(durationToMinutes(entry.duration_sec));
  }

  async function handleRevert(id: string) {
    setLoadingId(id);
    await revertCompletedInstance(id);
    router.refresh();
    setLoadingId(null);
  }

  async function handleDelete(id: string) {
    setLoadingId(id);
    await deleteCompletedInstance(id);
    router.refresh();
    setLoadingId(null);
  }

  async function handleSaveEdit(id: string) {
    setLoadingId(id);
    const minutes = parseInt(editMinutes);
    await updateCompletedInstance(id, {
      points_earned: editPoints,
      completed_by: editCompletedBy,
      completed_at: editCompletedAt ? new Date(editCompletedAt).toISOString() : undefined,
      duration_sec: editMinutes ? minutes * 60 : null,
    });
    setEditingId(null);
    router.refresh();
    setLoadingId(null);
  }

  const currentWeek = isCurrentWeek(weekStart);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/stats"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Storico</h1>
      </div>

      {/* Week selector */}
      <div className="flex items-center justify-between rounded-xl border-2 border-surface-border bg-surface px-2 py-2">
        <button
          onClick={() => navigateWeek(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-text-primary">
          {formatWeekLabel(weekStart)}
        </span>
        <button
          onClick={() => navigateWeek(1)}
          disabled={currentWeek}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-text-muted">
        {history.length} task completat{history.length === 1 ? "o" : "i"} questa settimana
      </p>

      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-text-muted">Nessun task completato</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {history.map((entry) => (
            <div key={entry.id} className="flex flex-col">
              <div className="flex items-center gap-3 rounded-xl border-2 border-surface-border bg-surface p-3">
                {entry.room_icon && <span className="text-lg">{entry.room_icon}</span>}
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-semibold text-text-primary">
                    {entry.task_name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {memberMap[entry.completed_by] ?? "Sconosciuto"}
                    {entry.room_name && ` · ${entry.room_name}`}
                    {entry.duration_sec ? ` · ${formatDuration(entry.duration_sec)}` : ""}
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatDate(entry.completed_at)}
                  </span>
                </div>

                <div className="flex items-center gap-0.5">
                  <div className="flex items-center gap-0.5 pr-1">
                    {Array.from({ length: entry.points_earned }).map((_, i) => (
                      <span key={i} className="text-xs text-yellow-accent">
                        ★
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      editingId === entry.id ? setEditingId(null) : startEdit(entry)
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary"
                  >
                    {editingId === entry.id ? <X size={14} /> : <Pencil size={14} />}
                  </button>
                  <button
                    onClick={() => handleRevert(entry.id)}
                    disabled={loadingId === entry.id}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-yellow-accent"
                    title="Annulla completamento"
                  >
                    <Undo2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={loadingId === entry.id}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-hover hover:text-red-error"
                    title="Elimina"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Edit form */}
              {editingId === entry.id && (
                <div className="flex flex-col gap-3 rounded-b-xl border-2 border-t-0 border-surface-border bg-surface/50 p-3">
                  {/* Completato da */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-muted">
                      Completato da
                    </label>
                    <select
                      value={editCompletedBy}
                      onChange={(e) => setEditCompletedBy(e.target.value)}
                      className="rounded-lg border-2 border-surface-border bg-background px-3 py-2 text-sm text-text-primary"
                    >
                      {members.map((m) => (
                        <option key={m.user_id} value={m.user_id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Data completamento */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-muted">
                      Data completamento
                    </label>
                    <input
                      type="datetime-local"
                      value={editCompletedAt}
                      onChange={(e) => setEditCompletedAt(e.target.value)}
                      className="rounded-lg border-2 border-surface-border bg-background px-3 py-2 text-sm text-text-primary"
                    />
                  </div>

                  {/* Tempo (minuti) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-muted">
                      Tempo impiegato (minuti)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(e.target.value)}
                      placeholder="Es. 30"
                      className="rounded-lg border-2 border-surface-border bg-background px-3 py-2 text-sm text-text-primary"
                    />
                  </div>

                  {/* Punti */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-muted">Punti</label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5].map((p) => (
                        <button
                          key={p}
                          onClick={() => setEditPoints(p)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                            editPoints === p
                              ? "bg-yellow-accent text-background"
                              : "bg-surface text-text-muted hover:bg-surface-hover"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save */}
                  <button
                    onClick={() => handleSaveEdit(entry.id)}
                    disabled={loadingId === entry.id}
                    className="flex items-center justify-center gap-2 rounded-lg bg-green-fresh px-4 py-2 text-sm font-semibold text-background hover:bg-green-muted disabled:opacity-50"
                  >
                    <Check size={16} />
                    Salva
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
