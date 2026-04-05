/**
 * Calculate the next due date after a completed date, based on recurrence rules.
 * Returns null if the task is not recurring.
 */

interface RecurrenceRule {
  type?: string;
  count?: number;
  period?: string;
  weekdays?: number[];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Given a completion date, calculate when the next instance is due.
 */
export function getNextDueDate(
  completedDate: string,
  recurrenceType: string,
  recurrenceRule: RecurrenceRule | null
): string | null {
  if (recurrenceType === "none" || !recurrenceRule) return null;

  const from = new Date(completedDate + "T00:00:00");

  if (recurrenceType === "frequency" && recurrenceRule.type === "frequency") {
    const count = recurrenceRule.count ?? 1;
    const period = recurrenceRule.period ?? "week";

    let intervalDays = count;
    if (period === "week") intervalDays = count * 7;
    if (period === "month") intervalDays = count * 30;

    return toDateString(addDays(from, intervalDays));
  }

  if (recurrenceType === "specific_dates" && recurrenceRule.type === "weekdays") {
    const weekdays = recurrenceRule.weekdays ?? [];
    if (weekdays.length === 0) return null;

    // Find the next matching weekday after completedDate
    let current = addDays(from, 1); // start from tomorrow
    for (let i = 0; i < 8; i++) {
      const jsDay = current.getDay();
      const ourDay = jsDay === 0 ? 6 : jsDay - 1; // Monday=0
      if (weekdays.includes(ourDay)) {
        return toDateString(current);
      }
      current = addDays(current, 1);
    }
    return null;
  }

  return null;
}

/**
 * Get the next member in rotation after the current one.
 */
export function getNextRotationMember(
  currentUserId: string,
  rotationOrder: { user_id: string; position: number }[]
): string | null {
  if (rotationOrder.length === 0) return null;
  const sorted = [...rotationOrder].sort((a, b) => a.position - b.position);
  const currentIdx = sorted.findIndex((r) => r.user_id === currentUserId);
  const nextIdx = (currentIdx + 1) % sorted.length;
  return sorted[nextIdx].user_id;
}
