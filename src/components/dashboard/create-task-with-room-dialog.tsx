"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTask } from "@/app/actions/task";
import { WEEKDAYS } from "@/lib/constants";

interface Room {
  id: string;
  name: string;
  icon: string;
}

interface Member {
  user_id: string;
  name: string;
}

interface CreateTaskWithRoomDialogProps {
  rooms: Room[];
  houseId: string;
  members: Member[];
  trigger?: React.ReactNode;
}

export function CreateTaskWithRoomDialog({
  rooms,
  houseId,
  members,
  trigger,
}: CreateTaskWithRoomDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]?.id ?? "");
  const [points, setPoints] = useState(1);
  const [assignmentType, setAssignmentType] = useState<"manual" | "fixed" | "rotation">(
    "manual"
  );
  const [assignedTo, setAssignedTo] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<
    "none" | "frequency" | "specific_dates"
  >("none");
  const [freqCount, setFreqCount] = useState(1);
  const [freqPeriod, setFreqPeriod] = useState<"day" | "week" | "month">("week");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailyCount, setDailyCount] = useState(1);

  function resetForm() {
    setSelectedRoom(rooms[0]?.id ?? "");
    setPoints(1);
    setAssignmentType("manual");
    setAssignedTo("");
    setRecurrenceType("none");
    setFreqCount(1);
    setFreqPeriod("week");
    setSelectedDays([]);
    setStartDate(new Date().toISOString().split("T")[0]);
    setDailyCount(1);
    setError("");
  }

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
    if (!selectedRoom) {
      setError("Seleziona una stanza");
      return;
    }
    setLoading(true);
    formData.set("roomId", selectedRoom);
    formData.set("houseId", houseId);
    formData.set("points", String(points));
    formData.set("assignmentType", assignmentType);
    if ((assignmentType === "fixed" || assignmentType === "rotation") && assignedTo)
      formData.set("assignedTo", assignedTo);
    formData.set("recurrenceType", recurrenceType);
    formData.set("startDate", startDate);
    formData.set("dailyCount", String(dailyCount));
    const rule = buildRecurrenceRule();
    if (rule) formData.set("recurrenceRule", rule);

    const result = await createTask(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      resetForm();
      router.refresh();
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button size="icon" variant="accent">
            <Plus size={20} />
          </Button>
        )}
      </span>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border-2 border-surface-border bg-background p-6">
          <div className="flex items-center justify-between pb-4">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              Nuovo task
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">
            Crea un nuovo task scegliendo la stanza
          </Dialog.Description>

          <form action={handleSubmit} className="flex flex-col gap-5">
            {/* Stanza */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-secondary">Stanza</span>
              <div className="flex flex-wrap gap-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoom(room.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      selectedRoom === room.id
                        ? "bg-green-fresh/20 ring-2 ring-green-fresh text-text-primary"
                        : "bg-surface text-text-muted hover:bg-surface-hover"
                    }`}
                  >
                    <span>{room.icon}</span>
                    <span>{room.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nome */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="task-name-r"
                className="text-sm font-medium text-text-secondary"
              >
                Nome
              </label>
              <Input
                id="task-name-r"
                name="name"
                placeholder="Es. Lavare il pavimento"
                required
                autoFocus
              />
            </div>

            {/* Descrizione */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="task-desc-r"
                className="text-sm font-medium text-text-secondary"
              >
                Descrizione (opzionale)
              </label>
              <Input
                id="task-desc-r"
                name="description"
                placeholder="Es. Usare il mocio con detersivo"
              />
            </div>

            {/* Data */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="task-date-r"
                className="text-sm font-medium text-text-secondary"
              >
                Data
              </label>
              <Input
                id="task-date-r"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* Punti */}
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

            {/* Assegnazione */}
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
              {assignmentType === "manual" && (
                <p className="text-xs text-text-muted">Chiunque può completare</p>
              )}
              {assignmentType === "rotation" && (
                <p className="text-xs text-text-muted">Ruota tra tutti i membri</p>
              )}
            </div>

            {/* Selezione membro */}
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

            {/* Ricorrenza */}
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

            <Button type="submit" disabled={loading}>
              <Plus size={16} />
              {loading ? "Creazione..." : "Crea task"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
