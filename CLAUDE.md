# kinē — working agreement for Claude / agents

Read this before touching anything. It is short on purpose.

## What this project is

An interactive 3D physiotherapy and rehabilitation guide. Next.js 16 App Router,
React 19, Three.js via @react-three/fiber, Tailwind v4 tokens in plain CSS,
Drizzle + Postgres for optional sync. One anonymous user, one recovery journey,
no accounts.

`DECISIONS.md` is the authority on clinical and product intent. It is unusually
honest about what is *not* validated — do not "fix" a documented limitation by
making a stronger claim in the UI. If a change contradicts `DECISIONS.md`, update
that file in the same commit and say why.

## Current mission

Take the app from a desktop-shaped prototype to an installable, mobile-first PWA.
The plan lives in `docs/ROADMAP.md` and one file per stage in `docs/stages/`.

**Work one stage at a time, on its own branch, and do not start a stage until the
previous stage's gate passes.** The gates are the only thing keeping this from
becoming a pile of half-migrations.

## Hard rules

1. **Mobile is the base case.** From stage 03 onward, no new `max-width` media
   query may be added to any stylesheet. Phone styles are unconditional; desktop
   is added with `min-width`. A PR that adds a `max-width` query is wrong by
   definition.
2. **No text below 12px body / 11px label**, and no interactive target under 44px
   in either axis. If something does not fit, reflow it — never `display: none` it
   on small screens to make room.
3. **Never re-type a file's contents from tool output.** Edit in place. Several
   data files here are 150 KB+ and will be silently truncated in a transcript.
4. **Clinical content is data, not code.** Exercise cues, scoring weights,
   contraindications and progression links live in `src/data/*.json` so a
   clinician can edit them. Do not move clinical rules into TypeScript.
5. **Never weaken a safety gate.** `redFlags()` returning `urgent` must keep
   blocking session launch. Adding a bypass is a clinical product failure, not a
   UX improvement.
6. **Measure, don't assert.** Any claim about performance gets a row in
   `docs/PERF.md` with the device profile it was measured on.
7. **`ASSET_VERSION` bumps whenever any file in `public/models/` changes.**
   That is what makes immutable caching safe.

## Commands

```bash
npm run dev              # local dev
npm run typecheck        # tsc --noEmit
npm run lint             # eslint
npm test                 # vitest unit suites
npm run test:e2e         # playwright against a production build
npm run check:assets     # validate the 3D assets without a browser
npm run check:illustrations
node scripts/smoke-test.mjs   # full-journey browser walk
```

CI runs `typecheck → lint → test → build` on PRs and `main`
(`.github/workflows/ci.yml`). Stages 02, 06 and 09 add gates to it.

## Architecture you must preserve

- `src/components/KinesioApp.tsx` is the orchestrator: it owns flow state and
  passes callbacks down. Screens in `src/features/*` are presentation-only and
  must stay that way.
- `src/lib/derive.ts` (`deriveJourney`) is **pure**. Everything a screen needs
  that can be computed from persisted state is computed there, once, and unit
  tested. Do not duplicate derivation inside a screen.
- `src/lib/clinical.ts` is the clinical engine: `match`, `redFlags`,
  `makeProgramme`, `progression`, `variant`, `doseInfo`. Pure functions over JSON.
- `src/hooks/useRecovery.ts` owns persistence: localStorage is the source of
  truth on-device, the server is a convenience. Schema changes go through
  `migrateRecovery` in `src/lib/recovery-storage.ts` with a version bump and a
  test — never a breaking read.
- `src/components/body/` owns all WebGL. Nothing outside it may import `three`.

## Definition of done for any stage

- Its gate commands pass, locally and in CI.
- A row appended to `docs/PERF.md` if it touched anything user-visible.
- `DECISIONS.md` updated if intent changed.
- The stage file's checklist fully ticked, with the actual measured numbers
  written in beside the targets.
