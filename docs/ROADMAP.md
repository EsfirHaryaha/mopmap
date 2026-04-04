# MOP MAP - Roadmap

## Stack Tecnologico

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Deploy**: Vercel (sottodominio gratuito .vercel.app)
- **PWA**: next-pwa per service worker e installabilità
- **UI Components**: Radix UI (accessibile, leggero)
- **Charts**: Recharts (per le statistiche/classifiche)
- **Icone**: Lucide React
- **State management**: Zustand (leggero e semplice)
- **Notifiche push**: Web Push API + Supabase Edge Functions

---

## Fasi di Sviluppo

### FASE 1 - Fondamenta (Setup + Auth + Case)

- [x] Inizializzazione progetto Next.js + TypeScript + Tailwind
- [ ] Configurazione PWA (manifest, service worker, icone)
- [ ] Setup Supabase (progetto + tabelle + RLS policies)
- [ ] Sistema Auth (registrazione email/password, login, logout)
- [ ] Profilo utente (avatar, nome)
- [ ] CRUD Casa (crea casa, genera codice invito)
- [ ] Join casa tramite codice
- [ ] Gestione multi-casa (switch tra case)

### FASE 2 - Core (Stanze + Task)

- [ ] CRUD Stanze (nome, foto/upload, icona)
- [ ] Dashboard con griglia stanze (card visive)
- [ ] CRUD Task dentro ogni stanza
  - [ ] Nome, descrizione
  - [ ] Tipo assegnazione: fisso / rotazione / manuale
  - [ ] Sistema punti (0-3 stelle)
- [ ] Sistema ripetizione task:
  - [ ] Frequenza custom (N volte per giorno/settimana/mese)
  - [ ] Date specifiche (ogni X del mese, ogni N° giorno della settimana)
- [ ] Logica rotazione automatica
- [ ] Completamento task (checkbox)
- [ ] Cronologia completamenti

### FASE 3 - Navigazione + Viste

- [ ] Bottom navbar (3 sezioni)
- [ ] Dashboard stanze (vista principale)
- [ ] To-do list personale (solo i tuoi task del giorno/settimana)
- [ ] Vista dettaglio stanza con lista task

### FASE 4 - Timer e Cronometro

- [ ] Cronometro per task (start/stop, traccia durata)
- [ ] Timer countdown per task (imposta durata, notifica a scadenza)
- [ ] Storico tempi per task

### FASE 5 - Classifiche e Statistiche

- [ ] Pagina classifiche/statistiche
- [ ] Classifica punti tra coinquilini
- [ ] Grafici per periodo (giorno, settimana, mese)
- [ ] Punti totali per utente
- [ ] Storico attività per partecipante

### FASE 6 - Notifiche Push

- [ ] Setup Web Push API
- [ ] Notifica task in scadenza oggi
- [ ] Notifica task scaduti/non completati
- [ ] Gestione preferenze notifiche

### FASE 7 - Polish e Ottimizzazione

- [ ] Animazioni e transizioni
- [ ] Dark mode / tema
- [ ] Offline support (service worker cache)
- [ ] Ottimizzazione performance (lazy loading, code splitting)
- [ ] Testing
- [ ] Deploy finale su Vercel

---

## Struttura Navbar (Bottom)

```
┌─────────────────────────────────────────┐
│                                         │
│            [Contenuto App]              │
│                                         │
├─────────┬─────────────┬─────────────────┤
│  🏠     │    ✅       │     🏆          │
│ Stanze  │  I miei     │  Classifiche    │
│         │  task       │                 │
└─────────┴─────────────┴─────────────────┘
```
