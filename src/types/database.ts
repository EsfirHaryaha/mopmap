export type AssignmentType = "fixed" | "rotation" | "manual";
export type RecurrenceType = "none" | "frequency" | "specific_dates";
export type Period = "day" | "week" | "month";

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface House {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface HouseMember {
  id: string;
  house_id: string;
  user_id: string;
  joined_at: string;
  profile?: Profile;
}

export interface Room {
  id: string;
  house_id: string;
  name: string;
  icon: string;
  image_url: string | null;
  created_by: string;
  created_at: string;
}

export interface RecurrenceRule {
  type: "frequency" | "day_of_month" | "nth_weekday" | "interval" | "weekdays";
  count?: number;
  period?: Period;
  days?: number[];
  weekday?: number;
  nth?: number;
  every?: number;
  weekdays?: number[];
}

export interface Task {
  id: string;
  room_id: string;
  house_id: string;
  name: string;
  description: string | null;
  points: number;
  assignment_type: AssignmentType;
  assigned_to: string | null;
  recurrence_type: RecurrenceType;
  recurrence_rule: RecurrenceRule | null;
  daily_count: number;
  archived: boolean;
  created_by: string;
  created_at: string;
}

export interface TaskInstance {
  id: string;
  task_id: string;
  house_id: string;
  assigned_to: string | null;
  due_date: string | null;
  status: "pending" | "completed";
  completed_at: string | null;
  completed_by: string | null;
  points_earned: number;
  duration_sec: number | null;
  created_at: string;
}

export interface TaskRotationOrder {
  id: string;
  task_id: string;
  user_id: string;
  position: number;
}
