"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";

export function ProfileForm({
  initialName,
  inviteCode,
}: {
  initialName: string;
  inviteCode: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Modifica nome */}
      <Card>
        <CardHeader>
          <CardTitle>Modifica profilo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary">Nome</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Il tuo nome"
            />
          </div>
          <Button size="sm" className="self-end">
            Salva
          </Button>
        </CardContent>
      </Card>

      {/* Codice casa */}
      <Card>
        <CardHeader>
          <CardTitle>Codice casa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl bg-background p-3 text-center font-mono text-lg font-bold tracking-widest text-green-fresh">
              {inviteCode ?? "------"}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopyCode}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </Button>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Condividi questo codice per invitare coinquilini
          </p>
        </CardContent>
      </Card>
    </>
  );
}
