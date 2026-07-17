# PensionSim — Mobile App

A React Native (Expo) mobile app that models long-term retirement savings for the Sri Lankan context, built for an Operations Research module case study (Ms. Romeshi's pension plan).

**Stack:** React Native · Expo SDK 54 · TypeScript · Expo Router · Zustand · Supabase

---

## Implementation Status

| Phase | Area | Status |
|---|---|---|
| 1 | UI scaffolding — all 16 screens, dummy data | ✅ Complete |
| 2.1 | Math engine (chained annuity, dual-vehicle, Monte Carlo, sensitivity, goal programming, inflation) | ✅ Complete — verified against the case study to the exact rupee |
| 2.2 | Supabase — schema, RLS policies, seed data, client singleton | ✅ Complete |
| 2.3 | Real authentication (signup, login, password reset, session persistence) | ✅ Complete |
| 2.4 | Save/load simulations (Results, History, Home dashboard) | ✅ Complete |
| 2.5 | Victory Native charts (corpus growth, Monte Carlo, inflation erosion) | ✅ Complete |
| — | Goal Planner wired to real `allocateGoals()` engine | ✅ Complete |
| — | Inflation Calculator wired to real `inflationErosion()` engine | ✅ Complete |
| — | FD Rate Explorer — reads live Supabase data | ⏳ Not yet wired (still Phase 1 dummy data) |
| — | Admin Panel — config/FD rate CRUD | ⏳ Not yet wired (still Phase 1 dummy data) |
| — | Compare Simulations screen | ⏳ Not yet wired (still Phase 1 dummy data) |
| v2 | Push notifications | Not started |
| v2 | PDF export | Not started |

**Known deviations from the original spec:**
- Goal Programming allocator uses a **greedy priority-order allocator**, not a full LP/Simplex solver — mathematically equivalent output for this use case.
- `simulationStore.ts` also handles Supabase save/load/delete directly rather than a separate service layer — kept simple.

---

## Setup

```bash
git clone https://github.com/malankatharula/pension-sim.git
cd pension-sim
npm install --legacy-peer-deps
```

Create `.env.local` in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then run:

```bash
npx expo start
```

**Note (Windows/PowerShell):** always use `--legacy-peer-deps` on npm installs (React 19 peer conflicts), and quote paths containing parentheses, e.g. `"app\(tabs)"`.

---

## Branches

- `main` / `develop` — up to date, Phase 2 complete
- Personal branches follow the pattern `FCxxxxxx-Name`

## Repo structure

See `src/engine/` for the math engine, `supabase/migrations/` for the DB schema, and `app/` for Expo Router screens.