"use client";

import { useState, useMemo } from "react";
import { Trophy, Star, TrendingUp, BarChart3, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsChart, COLORS } from "./stats-chart";

interface CompletedInstance {
  completed_by: string;
  points_earned: number;
  completed_at: string;
  duration_sec: number | null;
}

interface Member {
  user_id: string;
  name: string;
}

interface StatsContentProps {
  completed: CompletedInstance[];
  members: Member[];
  userId: string;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function currentYear() {
  return new Date().getFullYear();
}

function getDateRange(period: string): { from: string; to: string } {
  const now = new Date();
  const toStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  if (period === "7" || period === "14" || period === "30") {
    const days = parseInt(period);
    const from = new Date(now);
    from.setDate(from.getDate() - days);
    return {
      from: `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`,
      to: toStr,
    };
  }

  // Year
  const year = parseInt(period);
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

const medals = ["🥇", "🥈", "🥉"];

export function StatsContent({ completed, members, userId }: StatsContentProps) {
  const year = currentYear();
  const periods = [
    { label: "7g", value: "7" },
    { label: "14g", value: "14" },
    { label: "30g", value: "30" },
    { label: String(year - 1), value: String(year - 1) },
    { label: String(year), value: String(year) },
  ];
  const [period, setPeriod] = useState("7");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(members.map((m) => m.user_id))
  );

  function toggleMember(uid: string) {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  const memberColorMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m, i) => map.set(m.user_id, COLORS[i % COLORS.length]));
    return map;
  }, [members]);

  // Filter by period
  const filtered = useMemo(() => {
    const { from, to } = getDateRange(period);
    return completed.filter((inst) => {
      const date = inst.completed_at.split("T")[0];
      return date >= from && date <= to;
    });
  }, [completed, period]);

  // Aggregate stats
  const { leaderboard, myPoints, myCount, myTime, dailyPoints, dailyTime } =
    useMemo(() => {
      const stats = new Map<string, { points: number; count: number; time: number }>();
      for (const m of members) {
        stats.set(m.user_id, { points: 0, count: 0, time: 0 });
      }

      const ptMap = new Map<string, Map<string, number>>();
      const tmMap = new Map<string, Map<string, number>>();

      for (const inst of filtered) {
        if (!inst.completed_by || !inst.completed_at) continue;

        const s = stats.get(inst.completed_by) ?? { points: 0, count: 0, time: 0 };
        s.points += inst.points_earned;
        s.count += 1;
        s.time += inst.duration_sec ?? 0;
        stats.set(inst.completed_by, s);

        const date = inst.completed_at.split("T")[0];

        if (!ptMap.has(date)) ptMap.set(date, new Map());
        const pRow = ptMap.get(date)!;
        pRow.set(
          inst.completed_by,
          (pRow.get(inst.completed_by) ?? 0) + inst.points_earned
        );

        if (inst.duration_sec) {
          if (!tmMap.has(date)) tmMap.set(date, new Map());
          const tRow = tmMap.get(date)!;
          tRow.set(
            inst.completed_by,
            (tRow.get(inst.completed_by) ?? 0) + Math.round(inst.duration_sec / 60)
          );
        }
      }

      const dailyPoints: { date: string; user_id: string; value: number }[] = [];
      for (const [date, perUser] of ptMap) {
        for (const [uid, val] of perUser) {
          dailyPoints.push({ date, user_id: uid, value: val });
        }
      }

      const dailyTime: { date: string; user_id: string; value: number }[] = [];
      for (const [date, perUser] of tmMap) {
        for (const [uid, val] of perUser) {
          dailyTime.push({ date, user_id: uid, value: val });
        }
      }

      const leaderboard = Array.from(stats.entries())
        .map(([uid, s]) => ({
          user_id: uid,
          name: members.find((m) => m.user_id === uid)?.name ?? "Senza nome",
          ...s,
        }))
        .sort((a, b) => b.points - a.points || b.count - a.count);

      const me = stats.get(userId);

      return {
        leaderboard,
        myPoints: me?.points ?? 0,
        myCount: me?.count ?? 0,
        myTime: me?.time ?? 0,
        dailyPoints,
        dailyTime,
      };
    }, [filtered, members, userId]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Classifiche</h1>
        <p className="text-sm text-text-muted">Chi pulisce di più?</p>
      </div>

      {/* Period selector + member filter */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                period === p.value
                  ? "bg-green-fresh text-background"
                  : "bg-surface text-text-muted hover:bg-surface-hover"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          {members.map((m) => (
            <button
              key={m.user_id}
              onClick={() => toggleMember(m.user_id)}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                selectedMembers.has(m.user_id) ? "" : "opacity-40"
              }`}
              style={{
                backgroundColor: selectedMembers.has(m.user_id)
                  ? memberColorMap.get(m.user_id) + "30"
                  : undefined,
                color: memberColorMap.get(m.user_id),
                boxShadow: selectedMembers.has(m.user_id)
                  ? `0 0 0 1px ${memberColorMap.get(m.user_id)}`
                  : undefined,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: memberColorMap.get(m.user_id) }}
              />
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats personali */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-1.5 py-5">
            <Star size={20} className="text-yellow-accent" />
            <p className="text-xl font-bold text-text-primary">{myPoints}</p>
            <p className="text-xs text-text-muted">Punti</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1.5 py-5">
            <TrendingUp size={20} className="text-green-fresh" />
            <p className="text-xl font-bold text-text-primary">{myCount}</p>
            <p className="text-xs text-text-muted">Completati</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1.5 py-5">
            <Clock size={20} className="text-blue-400" />
            <p className="text-xl font-bold text-text-primary">
              {myTime > 0 ? formatDuration(myTime) : "0m"}
            </p>
            <p className="text-xs text-text-muted">Tempo</p>
          </CardContent>
        </Card>
      </div>

      {/* Grafico punti */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-green-fresh" />
            <CardTitle>Punti</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <StatsChart
            dailyData={dailyPoints}
            members={members}
            selectedMembers={selectedMembers}
            period={period}
          />
        </CardContent>
      </Card>

      {/* Grafico tempo */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-blue-400" />
            <CardTitle>Tempo impiegato</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <StatsChart
            dailyData={dailyTime}
            members={members}
            selectedMembers={selectedMembers}
            period={period}
            formatAsTime
          />
        </CardContent>
      </Card>

      {/* Classifica */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-accent" />
            <CardTitle>Classifica</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <Trophy size={40} className="text-text-muted" />
              <p className="text-sm text-text-muted">
                Completa dei task per vedere la classifica
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((entry, i) => {
                const isMe = entry.user_id === userId;
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-3 rounded-xl p-3 ${
                      isMe ? "bg-green-fresh/10 ring-1 ring-green-fresh/30" : "bg-surface"
                    }`}
                  >
                    <span className="w-8 text-center text-lg">
                      {i < 3 ? (
                        medals[i]
                      ) : (
                        <span className="text-sm text-text-muted">{i + 1}</span>
                      )}
                    </span>
                    <div className="flex flex-1 flex-col">
                      <span
                        className={`text-sm font-semibold ${isMe ? "text-green-fresh" : "text-text-primary"}`}
                      >
                        {entry.name}
                        {isMe ? " (tu)" : ""}
                      </span>
                      <span className="text-xs text-text-muted">
                        {entry.count} task ·{" "}
                        {entry.time > 0 ? formatDuration(entry.time) : "0m"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-yellow-accent">
                        {entry.points}
                      </span>
                      <Star size={14} className="text-yellow-accent" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
