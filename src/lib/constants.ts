export const APP_NAME = "MOPMAP";
export const APP_DESCRIPTION = "Organizza le pulizie di casa con i tuoi coinquilini";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const POINTS_MIN = 0;
export const POINTS_MAX = 3;

export const ASSIGNMENT_TYPES = {
  fixed: "Fisso",
  rotation: "Rotazione",
  manual: "Manuale",
} as const;

export const RECURRENCE_TYPES = {
  none: "Nessuna",
  frequency: "Frequenza",
  specific_dates: "Date specifiche",
} as const;

export const PERIODS = {
  day: "Giorno",
  week: "Settimana",
  month: "Mese",
} as const;

export const WEEKDAYS = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
] as const;
