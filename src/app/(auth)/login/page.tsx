"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email o password non corretti");
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
          <p className="text-text-secondary">Accedi al tuo account</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              placeholder="La tua password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-error">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            <LogIn size={18} />
            {loading ? "Accesso..." : "Accedi"}
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted">
          Non hai un account?{" "}
          <Link href="/register" className="text-green-fresh hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
