import { Logo } from "@/components/ui/logo";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { getSessionUser, getMembership } from "@/lib/supabase/cached";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const [user, membership] = await Promise.all([getSessionUser(), getMembership()]);

  const name = user?.user_metadata?.name || "";
  const inviteCode = membership?.house?.invite_code ?? null;

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

      {/* Modifica nome + Codice casa (client component) */}
      <ProfileForm initialName={name} inviteCode={inviteCode} />

      {/* Info app */}
      <div className="flex flex-col items-center gap-2 pt-4">
        <Logo size="sm" />
        <p className="text-xs text-text-muted">v1.0.0</p>
      </div>
    </div>
  );
}
