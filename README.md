# PensionSim — Mobile App

A React Native (Expo) mobile app that models long-term retirement savings for the Sri Lankan context, built for an Operations Research module case study (Ms. Romeshi's pension plan).

**Stack:** React Native · Expo SDK 54 · TypeScript · Expo Router · Zustand · Supabase

---

## Implementation Status

**All 16 screens are fully wired to real math, real auth, and real Supabase data. No dummy/placeholder data remains anywhere in the app.**

| Phase | Area | Status |
|---|---|---|
| 1 | UI scaffolding — all 16 screens | ✅ Complete |
| 2.1 | Math engine (chained annuity, dual-vehicle, Monte Carlo, sensitivity, goal programming, inflation) | ✅ Complete — verified against the case study to the exact rupee |
| 2.2 | Supabase — schema, RLS policies, seed data, client singleton | ✅ Complete |
| 2.3 | Real authentication (signup, login, password reset, session persistence) | ✅ Complete |
| 2.4 | Save/load simulations (Results, History, Home dashboard) | ✅ Complete |
| 2.5 | Victory Native charts (corpus growth, Monte Carlo, inflation erosion) | ✅ Complete |
| 2.6 | Remaining screens — FD Rate Explorer, Admin Panel, Compare Simulations, Settings | ✅ Complete |
| v2 | Push notifications | Not started |
| v2 | PDF export | Not started |
| v2 | Full deep-link password reset (requires native build, not just Expo Go) | Partially configured — reset emails send correctly; completing the reset via the emailed link requires a native build with the `pensionsim://` scheme registered |

**Known deviations from the original spec:**
- Goal Programming allocator uses a **greedy priority-order allocator**, not a full LP/Simplex solver — mathematically equivalent output for this use case.
- `simulationStore.ts` also handles Supabase save/load/delete directly rather than a separate service layer — kept simple.
- `currency_symbol` config value exists in `app_config` and is editable via the Admin Panel, but is not yet consumed anywhere in the UI — every screen displays "LKR" directly, which is appropriate given the project's Sri Lanka-specific scope.
- Admin Panel's FD Rate Manager supports viewing and toggling active/inactive status; full add/edit/delete forms were not built (scope trim — toggling covers the main use case of hiding outdated rates).
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