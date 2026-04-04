import { Trophy, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsPage() {
  // TODO: fetch stats from Supabase

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Classifiche</h1>
        <p className="text-sm text-text-muted">Chi pulisce di più?</p>
      </div>

      {/* Classifica */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-accent" />
            <CardTitle>Classifica punti</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-8">
            <Trophy size={40} className="text-text-muted" />
            <p className="text-sm text-text-muted">
              Completa dei task per vedere la classifica
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistiche */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-6">
            <Star size={24} className="text-yellow-accent" />
            <p className="text-2xl font-bold text-text-primary">0</p>
            <p className="text-xs text-text-muted">I tuoi punti</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-6">
            <TrendingUp size={24} className="text-green-fresh" />
            <p className="text-2xl font-bold text-text-primary">0</p>
            <p className="text-xs text-text-muted">Task completati</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
