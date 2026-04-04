"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <p className="text-text-secondary">Crea il tuo account</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary">Nome</label>
            <Input
              type="text"
              placeholder="Il tuo nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary">Email</label>
            <Input
              type="email"
              placeholder="la-tua@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary">Password</label>
            <Input
              type="password"
              placeholder="Minimo 6 caratteri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-sm text-red-error">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            <UserPlus size={18} />
            {loading ? "Registrazione..." : "Registrati"}
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted">
          Hai già un account?{" "}
          <Link href="/login" className="text-green-fresh hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
