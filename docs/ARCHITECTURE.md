# MOP MAP - Architettura

## Struttura Progetto

```
mopmap/
├── public/
│   ├── icons/              # Icone PWA (varie dimensioni)
│   └── manifest.json       # PWA manifest
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Route group: login, register
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/         # Route group: app autenticata
│   │   │   ├── dashboard/  # Griglia stanze
│   │   │   ├── room/[id]/  # Dettaglio stanza + task
│   │   │   ├── my-tasks/   # To-do personale
│   │   │   ├── stats/      # Classifiche e statistiche
│   │   │   ├── house/      # Gestione casa
│   │   │   └── profile/    # Profilo utente
│   │   ├── layout.tsx
│   │   └── page.tsx        # Landing/redirect
│   ├── components/
│   │   ├── ui/             # Componenti base (Button, Card, Input...)
│   │   ├── auth/           # Form login/register
│   │   ├── house/          # Componenti casa (create, join, switch)
│   │   ├── room/           # Card stanza, form stanza
│   │   ├── task/           # Card task, form task, timer
│   │   ├── stats/          # Grafici, classifica
│   │   └── layout/         # Navbar, Header, Layout wrapper
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts   # Client browser
│   │   │   ├── server.ts   # Client server-side
│   │   │   └── middleware.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useHouse.ts
│   │   ├── useRooms.ts
│   │   ├── useTasks.ts
│   │   └── useTimer.ts
│   ├── stores/             # Zustand stores
│   │   ├── authStore.ts
│   │   └── houseStore.ts
│   └── types/              # TypeScript types
│       ├── database.ts     # Tipi generati da Supabase
│       └── index.ts
├── supabase/
│   ├── migrations/         # SQL migrations
│   └── seed.sql            # Dati di test
└── ...config files
```

## Database Schema (Supabase/PostgreSQL)

### Tabelle

#### profiles

| Colonna    | Tipo      | Note                    |
| ---------- | --------- | ----------------------- |
| id         | uuid (PK) | = auth.users.id         |
| email      | text      | Unique                  |
| name       | text      |                         |
| avatar_url | text      | URL immagine su Storage |
| created_at | timestamp |                         |

#### houses

| Colonna     | Tipo      | Note                  |
| ----------- | --------- | --------------------- |
| id          | uuid (PK) |                       |
| name        | text      |                       |
| invite_code | text      | Unique, 6-8 caratteri |
| created_by  | uuid (FK) | -> profiles.id        |
| created_at  | timestamp |                       |

#### house_members

| Colonna   | Tipo      | Note                |
| --------- | --------- | ------------------- |
| id        | uuid (PK) |                     |
| house_id  | uuid (FK) | -> houses.id        |
| user_id   | uuid (FK) | -> profiles.id      |
| joined_at | timestamp |                     |
| UNIQUE    |           | (house_id, user_id) |

#### rooms

| Colonna    | Tipo      | Note                  |
| ---------- | --------- | --------------------- |
| id         | uuid (PK) |                       |
| house_id   | uuid (FK) | -> houses.id          |
| name       | text      |                       |
| icon       | text      | Nome icona o emoji    |
| image_url  | text      | Foto stanza (Storage) |
| created_by | uuid (FK) | -> profiles.id        |
| created_at | timestamp |                       |

#### tasks

| Colonna         | Tipo      | Note                                    |
| --------------- | --------- | --------------------------------------- |
| id              | uuid (PK) |                                         |
| room_id         | uuid (FK) | -> rooms.id                             |
| house_id        | uuid (FK) | -> houses.id                            |
| name            | text      |                                         |
| description     | text      | Nullable                                |
| points          | int       | 0-3 (stelle)                            |
| assignment_type | enum      | 'fixed' / 'rotation' / 'manual'         |
| assigned_to     | uuid (FK) | -> profiles.id (per fixed/manual)       |
| recurrence_type | enum      | 'frequency' / 'specific_dates' / 'none' |
| recurrence_rule | jsonb     | Regole di ripetizione (vedi sotto)      |
| created_by      | uuid (FK) | -> profiles.id                          |
| created_at      | timestamp |                                         |

**recurrence_rule (JSONB) esempi:**

```json
// Frequenza: 2 volte a settimana
{ "type": "frequency", "count": 2, "period": "week" }

// Frequenza: 1 volta al giorno
{ "type": "frequency", "count": 1, "period": "day" }

// Data specifica: ogni 15 del mese
{ "type": "day_of_month", "days": [15] }

// Data specifica: ogni secondo martedì del mese
{ "type": "nth_weekday", "weekday": 2, "nth": 2 }

// Intervallo: ogni 3 giorni
{ "type": "interval", "every": 3, "period": "day" }
```

#### task_completions

| Colonna       | Tipo      | Note                    |
| ------------- | --------- | ----------------------- |
| id            | uuid (PK) |                         |
| task_id       | uuid (FK) | -> tasks.id             |
| completed_by  | uuid (FK) | -> profiles.id          |
| completed_at  | timestamp |                         |
| points_earned | int       |                         |
| duration_sec  | int       | Durata timer (nullable) |

#### task_rotation_order

| Colonna  | Tipo      | Note                   |
| -------- | --------- | ---------------------- |
| id       | uuid (PK) |                        |
| task_id  | uuid (FK) | -> tasks.id            |
| user_id  | uuid (FK) | -> profiles.id         |
| position | int       | Ordine nella rotazione |

## Flussi Principali

### Registrazione e creazione casa

1. Utente si registra (email + password)
2. Compila profilo (nome + avatar)
3. Crea una casa (nome) → genera codice invito
4. Condivide codice con coinquilini
5. Coinquilini si registrano e inseriscono codice → join casa

### Creazione task

1. Utente entra in una stanza
2. Crea nuovo task: nome, descrizione, punti (0-3 stelle)
3. Sceglie tipo assegnazione (fisso/rotazione/manuale)
4. Configura ripetizione (frequenza O date specifiche)
5. Task appare nella stanza e nel to-do della persona assegnata

### Completamento task

1. Utente vede task nel suo to-do o nella stanza
2. (Opzionale) Avvia cronometro/timer
3. Clicca checkbox → task completato
4. Punti accreditati → classifica aggiornata
