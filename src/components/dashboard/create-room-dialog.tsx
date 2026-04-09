"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRoom } from "@/app/actions/room";

const ROOM_ICONS = ["🛋️", "🛏️", "🍳", "🚿", "🚽", "💻", "🏠", "🌿", "🚗", "📚"];

interface CreateRoomDialogProps {
  houseId: string;
  trigger?: React.ReactNode;
}

export function CreateRoomDialog({ houseId, trigger }: CreateRoomDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("🛋️");

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    formData.set("icon", selectedIcon);
    formData.set("houseId", houseId);
    const result = await createRoom(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      setSelectedIcon("🛋️");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button variant="accent" size="sm">
            <Plus size={16} />
            Crea stanza
          </Button>
        )}
      </span>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-surface-border bg-background p-6">
          <div className="flex items-center justify-between pb-4">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              Nuova stanza
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">
            Inserisci nome e icona per creare una nuova stanza
          </Dialog.Description>

          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="room-name"
                className="text-sm font-medium text-text-secondary"
              >
                Nome della stanza
              </label>
              <Input
                id="room-name"
                name="name"
                placeholder="Es. Soggiorno, Cucina..."
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-text-secondary">Icona</span>
              <div className="flex flex-wrap gap-2">
                {ROOM_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-colors ${
                      selectedIcon === icon
                        ? "bg-green-fresh/20 ring-2 ring-green-fresh"
                        : "bg-surface hover:bg-surface-hover"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-error">{error}</p>}

            <Button type="submit" disabled={loading}>
              <Plus size={16} />
              {loading ? "Creazione..." : "Crea stanza"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
