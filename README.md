# MOP MAP

> PWA per organizzare le pulizie di casa tra coinquilini.

**MOP MAP** (in app: **Moppy**) è una Progressive Web App pensata per gestire in modo equo e trasparente la routine di pulizie domestiche in una casa condivisa. Ogni coinquilino può vedere cosa c'è da fare, prendersi in carico i task, accumulare punti e tenere traccia dello storico, senza bisogno di app native o store.

---

## Indice

- [Funzionalità](#funzionalità)
- [Stack tecnologico](#stack-tecnologico)
- [Architettura](#architettura)
- [Setup locale](#setup-locale)
- [Variabili d'ambiente](#variabili-dambiente)
- [Script disponibili](#script-disponibili)
- [Struttura del progetto](#struttura-del-progetto)
- [Deploy](#deploy)
- [Convenzioni di sviluppo](#convenzioni-di-sviluppo)

---

## Funzionalità

### Autenticazione e profili

- Login / registrazione con email e password (Supabase Auth)
- Profilo utente con avatar e nome visualizzato

### Gestione case condivise

- Creazione di una "Casa" con codice invito
- Supporto multi-casa per uno stesso utente
- Tutti i membri hanno gli stessi permessi (no ruoli admin)

### Stanze e task

- Dashboard con griglia di stanze (icona + nome)
- Tre tipologie di assegnazione task:
  - **Fisso** — sempre allo stesso utente
  - **Rotazione** — primo che lo svolge prende i punti, poi ruota
  - **Manuale** — chiunque può prenderlo in carico
- Task scaduti evidenziati in rosso (non ruotano automaticamente)
- Ripetizione configurabile: per **frequenza** (ogni N giorni/settimane/mesi) o su **date specifiche**
- Sistema punti **0–3 stelle** per task in base alla difficoltà
- Timer countdown e cronometro integrati durante l'esecuzione

### To-do personale

- Vista personale aggregata con sezioni: **Oggi**, **Scaduti**, **Questa Settimana**, **Questo Mese**

### Statistiche e storico

- Classifiche tra coinquilini
- Grafici (recharts) su attività e punti accumulati
- Storico completo dei task svolti, con possibilità di modifica

### Esperienza PWA

- Installabile su iOS e Android
- Service worker per uso offline base
- Notifiche push
- Bottom navbar persistente: **Dashboard | To-do | Classifiche**

### Design

- Solo **dark mode**
- Palette: verde fresco/verdolino + giallo per CTA e accenti
- Stile minimal ma colorato, colori pieni — niente trasparenze o sfumature

---

## Stack tecnologico

| Area             | Tecnologia                                                                  |
| ---------------- | --------------------------------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org) (App Router)                               |
| Linguaggio       | [TypeScript 5](https://www.typescriptlang.org)                              |
| UI runtime       | [React 19](https://react.dev)                                               |
| Styling          | [Tailwind CSS 4](https://tailwindcss.com)                                   |
| Componenti UI    | [Radix UI](https://www.radix-ui.com) (dialog, dropdown, select, tabs, ...)  |
| Icone            | [lucide-react](https://lucide.dev)                                          |
| State management | [Zustand](https://zustand-demo.pmnd.rs)                                     |
| Grafici          | [Recharts](https://recharts.org)                                            |
| Backend / DB     | [Supabase](https://supabase.com) (Postgres + Auth + RLS)                    |
| Client Supabase  | `@supabase/ssr`, `@supabase/supabase-js`                                    |
| PWA              | Service worker custom + Web App Manifest                                    |
| Hosting          | [Vercel](https://vercel.com)                                                |
| Tooling          | ESLint 9, Prettier 3, Husky, lint-staged, Commitlint (Conventional Commits) |

---

## Architettura

- **App Router** di Next.js 16 con route group:
  - `(auth)` — login e registrazione
  - `(main)` — area autenticata (dashboard, stanze, to-do, statistiche, profilo)
- **Supabase** come backend unico: database Postgres con Row Level Security, Auth via JWT, sessioni gestite lato server tramite `@supabase/ssr`.
- **Zustand** per lo stato client-side (UI, filtri, dati derivati).
- **Service Worker** in `public/sw.js` per caching e supporto offline; manifest in `public/manifest.json`.

> ⚠️ Questa versione di Next.js (16) introduce breaking changes rispetto alle precedenti. Consultare `node_modules/next/dist/docs/` quando si lavora su API o convenzioni del framework.

---

## Setup locale

### Prerequisiti

- Node.js ≥ 20
- npm (oppure pnpm / yarn / bun)
- Un progetto Supabase (gratis su [supabase.com](https://supabase.com))

### Installazione

```bash
# 1. Clona il repository
git clone <url-repo>
cd mopmap

# 2. Installa le dipendenze
npm install

# 3. Configura le variabili d'ambiente
cp .env.local.example .env.local
# poi modifica .env.local con i tuoi valori Supabase

# 4. Avvia il dev server
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

---

## Variabili d'ambiente

File: `.env.local` (non committare).

| Variabile                       | Descrizione                                 |
| ------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del progetto Supabase                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chiave pubblica anon del progetto Supabase  |
| `NEXT_PUBLIC_APP_URL`           | URL pubblico dell'app (default `localhost`) |

---

## Script disponibili

| Comando                | Cosa fa                                       |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Avvia il dev server di Next.js                |
| `npm run build`        | Build di produzione                           |
| `npm run start`        | Avvia il server di produzione (dopo `build`)  |
| `npm run lint`         | ESLint con `--max-warnings=0`                 |
| `npm run lint:fix`     | ESLint con auto-fix                           |
| `npm run format`       | Prettier in modalità write                    |
| `npm run format:check` | Prettier in modalità check                    |
| `npm run type-check`   | Type-check TypeScript senza emettere file     |
| `npm run validate`     | Esegue `type-check` + `lint` + `format:check` |

---

## Struttura del progetto

```
mopmap/
├── public/                  # Asset statici, icone PWA, manifest, service worker
│   ├── icons/
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, registrazione
│   │   ├── (main)/          # Area autenticata
│   │   │   ├── dashboard/
│   │   │   ├── room/[id]/
│   │   │   ├── my-tasks/
│   │   │   ├── stats/
│   │   │   └── profile/
│   │   ├── layout.tsx
│   │   └── page.tsx         # Landing pubblica
│   ├── components/          # Componenti React riutilizzabili (incl. ui/)
│   └── lib/                 # Utility, costanti, client Supabase
├── AGENTS.md
├── CLAUDE.md
├── package.json
└── README.md
```

---

## Deploy

Il progetto è ottimizzato per il deploy su **Vercel**:

1. Importa il repository su [vercel.com/new](https://vercel.com/new).
2. Imposta le variabili d'ambiente nella dashboard Vercel (le stesse di `.env.local`).
3. Ogni push su `main` fa partire una build e un deploy automatici.

In alternativa, qualsiasi host che supporti Next.js 16 in modalità Node è compatibile.

---

## Convenzioni di sviluppo

- **Commit**: [Conventional Commits](https://www.conventionalcommits.org) (validati da Commitlint).
- **Pre-commit**: Husky + lint-staged eseguono lint e formatter sui file in stage.
- **Code style**: Prettier per la formattazione, ESLint per le regole.
- **Branch principale**: `main` (deploy automatico su Vercel).
- Prima di aprire una PR è buona prassi eseguire `npm run validate`.

---

## Licenza

Progetto privato. Tutti i diritti riservati.
