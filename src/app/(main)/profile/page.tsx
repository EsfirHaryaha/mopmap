"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Copy, Check } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function ProfilePage() {
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setName(user.user_metadata.name || "");
      }
    });
  }, [supabase]);

  const handleCopyCode = () => {
    // TODO: copy actual house invite code
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profilo</h1>
        <p className="text-sm text-text-muted">Gestisci il tuo account</p>
      </div>

      {/* Avatar e info */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-fresh">
            <User size={36} className="text-background" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-text-primary">{name || "Utente"}</p>
            <p className="text-sm text-text-muted">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

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
              ------
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

      {/* Info app */}
      <div className="flex flex-col items-center gap-2 pt-4">
        <Logo size="sm" />
        <p className="text-xs text-text-muted">v1.0.0</p>
      </div>
    </div>
  );
}
