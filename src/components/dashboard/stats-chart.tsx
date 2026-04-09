"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const COLORS = [
  "#4ADE80",
  "#FACC15",
  "#60A5FA",
  "#F472B6",
  "#A78BFA",
  "#FB923C",
  "#34D399",
  "#F87171",
];

const MONTHS = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic",
];

interface DailyData {
  date: string;
  user_id: string;
  value: number;
}

interface Member {
  user_id: string;
  name: string;
}

interface StatsChartProps {
  dailyData: DailyData[];
  members: Member[];
  selectedMembers: Set<string>;
  period: string; // "7", "14", "30", or a year like "2026"
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function generateDaySlots(days: number, step: number): { key: string; label: string }[] {
  const slots: { key: string; label: string }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= step) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    slots.push({ key, label: `${d.getDate()}/${d.getMonth() + 1}` });
  }
  return slots;
}

function generateMonthSlots(yearNum: number): { key: string; label: string }[] {
  const slots: { key: string; label: string }[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  for (let m = 0; m < 12; m++) {
    // Don't show future months
    if (yearNum === currentYear && m > currentMonth) break;
    const key = `${yearNum}-${pad(m + 1)}`;
    slots.push({ key, label: MONTHS[m] });
  }
  return slots;
}

export function StatsChart({
  dailyData,
  members,
  selectedMembers,
  period,
}: StatsChartProps) {
  const memberColorMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m, i) => map.set(m.user_id, COLORS[i % COLORS.length]));
    return map;
  }, [members]);

  const chartData = useMemo(() => {
    const days = parseInt(period);
    const isYear = days > 300;

    // Generate slots
    let slots: { key: string; label: string }[];
    if (isYear) {
      slots = generateMonthSlots(days);
    } else if (days === 30) {
      slots = generateDaySlots(30, 2); // every 2 days = ~15 slots
    } else {
      slots = generateDaySlots(days, 1); // 7 or 14 = day by day
    }

    // Bucket data into slots
    const buckets = new Map<string, Record<string, number>>();
    for (const slot of slots) {
      buckets.set(slot.key, {});
    }

    for (const entry of dailyData) {
      let bucketKey: string;
      if (isYear) {
        // Match by month: "2026-04"
        bucketKey = entry.date.substring(0, 7);
      } else if (days === 30) {
        // Find nearest slot (round to every 2 days)
        const entryDate = new Date(entry.date + "T00:00:00");
        let bestKey = slots[0].key;
        let bestDiff = Infinity;
        for (const slot of slots) {
          const slotDate = new Date(slot.key + "T00:00:00");
          const diff = Math.abs(entryDate.getTime() - slotDate.getTime());
          if (diff < bestDiff) {
            bestDiff = diff;
            bestKey = slot.key;
          }
        }
        bucketKey = bestKey;
      } else {
        bucketKey = entry.date;
      }

      const bucket = buckets.get(bucketKey);
      if (bucket) {
        bucket[entry.user_id] = (bucket[entry.user_id] ?? 0) + entry.value;
      }
    }

    return slots.map((slot) => {
      const row: Record<string, string | number> = { date: slot.label };
      for (const m of members) {
        if (selectedMembers.has(m.user_id)) {
          row[m.name] = buckets.get(slot.key)?.[m.user_id] ?? 0;
        }
      }
      return row;
    });
  }, [dailyData, period, members, selectedMembers]);

  const visibleMembers = members.filter((m) => selectedMembers.has(m.user_id));

  return (
    <div
      className="h-52 touch-none"
      style={{ minHeight: 208, minWidth: 0, pointerEvents: "none" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={1} barCategoryGap="20%">
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={24}
            allowDecimals={false}
          />
          {visibleMembers.map((m) => (
            <Bar
              key={m.user_id}
              dataKey={m.name}
              fill={memberColorMap.get(m.user_id)}
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { COLORS };
