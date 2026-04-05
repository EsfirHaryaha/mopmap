"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Save, Trash2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateTask, deleteTask, archiveTask } from "@/app/actions/task";
import { WEEKDAYS } from "@/lib/constants";

interface Member {
  user_id: string;
  name: string;
}

interface TaskData {
  id: string;
  name: string;
  description: string | null;
  points: number;
  assignment_type: string;
  assigned_to: string | null;
  recurrence_type: string;
  recurrence_rule: {
    type?: string;
    count?: number;
    period?: string;
    weekdays?: number[];
  } | null;
  daily_count?: number;
  room_id: string;
}

interface EditTaskDialogProps {
  task: TaskData;
  currentDueDate?: string;
  members: Member[];
  trigger: React.ReactNode;
}

export function EditTaskDialog({
  task,
  members,
  trigger,
  currentDueDate,
}: EditTaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [points, setPoints] = useState(task.points);
  const [assignmentType, setAssignmentType] = useState(
    task.assignment_type as "manual" | "fixed" | "rotation"
  );
  const [assignedTo, setAssignedTo] = useState(task.assigned_to ?? "");
  const [recurrenceType, setRecurrenceType] = useState(
    task.recurrence_type as "none" | "frequency" | "specific_dates"
  );
  const [freqCount, setFreqCount] = useState(task.recurrence_rule?.count ?? 1);
  const [freqPeriod, setFreqPeriod] = useState<"day" | "week" | "month">(
    (task.recurrence_rule?.period as "day" | "week" | "month") ?? "week"
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    task.recurrence_rule?.weekdays ?? []
  );
  const [dailyCount, setDailyCount] = useState(task.daily_count ?? 1);
  const [dueDate, setDueDate] = useState(
    currentDueDate ?? new Date().toISOString().split("T")[0]
  );

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function buildRecurrenceRule(): string | null {
    if (recurrenceType === "none") return null;
    if (recurrenceType === "frequency") {
      return JSON.stringify({ type: "frequency", count: freqCount, period: freqPeriod });
    }
    if (recurrenceType === "specific_dates") {
      return JSON.stringify({ type: "weekdays", weekdays: selectedDays });
    }
    return null;
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    formData.set("taskId", task.id);
    formData.set("roomId", task.room_id);
    formData.set("points", String(points));
    formData.set("assignmentType", assignmentType);
    if ((assignmentType === "fixed" || assignmentType === "rotation") && assignedTo)
      formData.set("assignedTo", assignedTo);
    formData.set("recurrenceType", recurrenceType);
    formData.set("dailyCount", String(dailyCount));
    formData.set("dueDate", dueDate);
    const rule = buildRecurrenceRule();
    if (rule) formData.set("recurrenceRule", rule);

    const result = await updateTask(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const fd = new FormData();
    fd.set("taskId", task.id);
    fd.set("roomId", task.room_id);
    const result = await deleteTask(fd);
    setDeleting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      router.refresh();
    }
  }

  async function handleArchive() {
    setArchiving(true);
    const fd = new FormData();
    fd.set("taskId", task.id);
    fd.set("roomId", task.room_id);
    const result = await archiveTask(fd);
    setArchiving(false);

    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border-2 border-surface-border bg-background p-6">
          <div className="flex items-center justify-between pb-4">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              Modifica task
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">
            Modifica i dettagli del task
          </Dialog.Description>

          <form action={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-name"
                className="text-sm font-medium text-text-secondary"
              >
                Nome
              </label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={task.name}
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-desc"
                className="text-sm font-medium text-text-secondary"
              >
                Descrizione (opzionale)
              </label>
              <Input
                id="edit-desc"
                name="description"
                defaultValue={task.description ?? ""}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="edit-date"
                className="text-sm font-medium text-text-secondary"
              >
                Data
              </label>
              <Input
                id="edit-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-secondary">Punti</span>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPoints(p)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      points === p
                        ? "bg-yellow-accent text-background"
                        : "bg-surface text-text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {"★".repeat(p) || "0"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-secondary">
                Assegnazione
              </span>
              <div className="flex gap-2">
                {(
                  [
                    ["manual", "Manuale"],
                    ["fixed", "Fisso"],
                    ["rotation", "Rotazione"],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setAssignmentType(type);
                      setAssignedTo("");
                    }}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      assignmentType === type
                        ? "bg-green-fresh text-background"
                        : "bg-surface text-text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {(assignmentType === "fixed" || assignmentType === "rotation") && (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-secondary">
                  {assignmentType === "fixed" ? "Assegnato a" : "Parte da"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <button
                      key={m.user_id}
                      type="button"
                      onClick={() => setAssignedTo(m.user_id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        assignedTo === m.user_id
                          ? "bg-green-fresh/20 ring-2 ring-green-fresh text-text-primary"
                          : "bg-surface text-text-muted hover:bg-surface-hover"
                      }`}
                    >
                      {m.name || "Senza nome"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-secondary">Ripetizione</span>
              <div className="flex gap-2">
                {(
                  [
                    ["none", "Mai"],
                    ["frequency", "Frequenza"],
                    ["specific_dates", "Giorni"],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRecurrenceType(type)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      recurrenceType === type
                        ? "bg-green-fresh text-background"
                        : "bg-surface text-text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {recurrenceType === "frequency" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Ogni</span>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={freqCount}
                  onChange={(e) => setFreqCount(parseInt(e.target.value) || 1)}
                  className="w-16 text-center"
                />
                <div className="flex gap-1">
                  {(
                    [
                      ["day", "Giorni"],
                      ["week", "Sett."],
                      ["month", "Mesi"],
                    ] as const
                  ).map(([p, label]) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFreqPeriod(p)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        freqPeriod === p
                          ? "bg-green-fresh/20 ring-2 ring-green-fresh text-text-primary"
                          : "bg-surface text-text-muted hover:bg-surface-hover"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recurrenceType === "specific_dates" && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-text-muted">
                  Seleziona i giorni della settimana
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        selectedDays.includes(i)
                          ? "bg-green-fresh/20 ring-2 ring-green-fresh text-text-primary"
                          : "bg-surface text-text-muted hover:bg-surface-hover"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Volte al giorno */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-secondary">
                Volte al giorno
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setDailyCount(n)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      dailyCount === n
                        ? "bg-green-fresh text-background"
                        : "bg-surface text-text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-error">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save size={16} />
                {loading ? "Salvataggio..." : "Salva"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleArchive}
                disabled={archiving}
                size="icon"
                title="Archivia"
              >
                <Archive size={16} />
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                size="icon"
                title="Elimina"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
