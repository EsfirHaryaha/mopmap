"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinHouse } from "@/app/actions/house";

export function JoinHouseDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    const result = await joinHouse(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>
        <Button variant="ghost" size="sm" className="text-green-fresh">
          Unisciti
        </Button>
      </span>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-surface-border bg-background p-6">
          <div className="flex items-center justify-between pb-4">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              Unisciti a una casa
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">
            Inserisci il codice invito per unirti a una casa
          </Dialog.Description>

          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="invite-code"
                className="text-sm font-medium text-text-secondary"
              >
                Codice invito
              </label>
              <Input
                id="invite-code"
                name="code"
                placeholder="Es. ABC123"
                maxLength={6}
                required
                autoFocus
                className="text-center text-lg font-mono tracking-widest uppercase"
              />
              <p className="text-xs text-text-muted">
                Chiedi il codice a chi ha creato la casa
              </p>
            </div>

            {error && <p className="text-sm text-red-error">{error}</p>}

            <Button type="submit" disabled={loading}>
              <UserPlus size={16} />
              {loading ? "Accesso..." : "Unisciti"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
