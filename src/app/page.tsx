import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { SprayCan, Sparkles, Users, ListChecks } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-green-fresh/5" />
          <div className="absolute -bottom-20 right-1/4 h-96 w-96 rounded-full bg-yellow-accent/5" />
        </div>

        <div className="relative z-10 flex max-w-md flex-col items-center gap-8">
          <Logo size="lg" />

          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold leading-tight text-text-primary">
              Le pulizie di casa,
              <br />
              <span className="text-green-fresh">organizzate.</span>
            </h1>
            <p className="text-base text-text-secondary">
              Crea la tua casa, invita i coinquilini e organizza le pulizie insieme. Task,
              rotazioni, punti e classifiche.
            </p>
          </div>

          {/* Features */}
          <div className="grid w-full grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 rounded-xl bg-surface p-3">
              <Users size={24} className="text-green-fresh" />
              <span className="text-xs text-text-secondary">Coinquilini</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl bg-surface p-3">
              <ListChecks size={24} className="text-yellow-accent" />
              <span className="text-xs text-text-secondary">Task</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl bg-surface p-3">
              <Sparkles size={24} className="text-green-fresh" />
              <span className="text-xs text-text-secondary">Punti</span>
            </div>
          </div>

          {/* Install buttons */}
          <div className="flex w-full flex-col gap-3">
            <Button size="lg" className="w-full" asChild>
              <Link href="/register">
                <SprayCan size={20} />
                Inizia ora
              </Link>
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="default" className="w-full text-xs">
                Scarica su iOS
              </Button>
              <Button variant="outline" size="default" className="w-full text-xs">
                Scarica su Android
              </Button>
            </div>
          </div>

          <p className="text-xs text-text-muted">
            Hai già un account?{" "}
            <Link href="/login" className="text-green-fresh hover:underline">
              Accedi
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
