# Stage 00 — Land uncommitted work, measure baseline

**Est** 0.5 day · **Branch** `stage/00-baseline` · **Depends on** nothing
**Gate** CI green on `main`; baseline row committed to `docs/PERF.md`.

## Objective

Get the repo and the working copy to agree, delete the clutter, and record a real
starting measurement. Every later stage claims an improvement — without this row
those claims are folklore.

## Why this is first

The working copy is **ahead of `main`** in eight files, none committed. Two of them
are bug fixes that are currently broken in the published version:

- `src/lib/derive.ts` — the published streak loop starts at today and breaks
  immediately, so a user whose last session was *yesterday* sees a streak of 0.
  The local version handles the yesterday case with an offset.
- `src/lib/rate-limit.ts` — the published limiter's `Map` has no bound. A burst of
  distinct keys grows it until the instance dies. The local version caps at 5000
  buckets with expiry eviction and a hard clamp.

The other six: `src/hooks/useOnlineStatus.ts` (new file), the offline banner in
`KinesioApp.tsx` + `globals.css`, View Transitions on `navigate()`,
`playwright.config.ts` (new file), XFF parsing in the recovery route, and
`engines` + `@axe-core/playwright` in `package.json`.

## Tasks

### 1. Commit and push the local work

Split into reviewable commits rather than one blob:

```bash
git checkout -b stage/00-baseline
git add src/lib/derive.ts src/lib/derive.test.ts
git commit -m "fix(streak): don't reset the streak when the last session was yesterday"

git add src/lib/rate-limit.ts src/lib/rate-limit.test.ts
git commit -m "fix(rate-limit): bound the bucket map with expiry eviction"

git add src/hooks/useOnlineStatus.ts src/components/KinesioApp.tsx src/app/globals.css
git commit -m "feat(offline): live connectivity status and offline banner"

git add src/app/api/recovery/route.ts
git commit -m "fix(api): parse x-forwarded-for defensively for rate-limit keys"

git add playwright.config.ts package.json package-lock.json
git commit -m "test(e2e): playwright config against the production build, axe available"
```

Confirm nothing is left behind: `git status --porcelain` must be empty apart from
the files this stage adds.

### 2. Delete the clutter

All of these are gitignored or already merged as PRs #5 / #6:

```
psyyy/01a08c8c-0c56-7531-98a5-44243ae61af2.patch          474 KB
psyyy/01a08f72-ef13-7660-b9c6-a4c43a1432aa.patch          463 KB
psyyy/01a08f72-ef13-7660-b9c6-a4c43a1432aa (1).patch      897 KB
psyyy/interactive-3d-physiotherapy-app.zip               2.80 MB
psyyy/interactive-3d-physiotherapy-app (1).zip           3.52 MB
psyyy/kin-3d-recovery-app.zip                            3.12 MB
psyyy/kin-v2-master-build.zip                            6.45 MB
psyyy/app/tsconfig.tsbuildinfo                            378 KB
psyyy/app/.next/                                          build output
```

```powershell
cd C:\Users\HP\Desktop\antigravity\psyyy
Remove-Item *.zip, *.patch
Remove-Item app\tsconfig.tsbuildinfo
Remove-Item -Recurse app\.next
```

Keep `node_modules`. Keep `.git`.

### 3. Add these docs

Commit `CLAUDE.md`, `docs/ROADMAP.md`, `docs/PERF.md`, `docs/stages/`,
`docs/handoff/`.

### 4. Record the baseline

Build, serve, and run Lighthouse mobile with the throttle settings in
`docs/PERF.md`. Record: Lighthouse performance score, LCP, First Load JS for `/`,
transferred bytes on the body step, and the axe violation count on the body step.

Also record **repeat-visit** transferred bytes — this is the number that exposes
the `no-store` header, and it should be roughly identical to the first visit.

## Gate

```bash
npm run typecheck && npm run lint && npm test && npm run build
git status --porcelain      # empty
```

- [ ] `main` contains all eight previously-uncommitted files
- [ ] Streak fix and rate-limiter fix are on `main`
- [ ] Archives, patches, tsbuildinfo and `.next` are gone from the folder
- [ ] `docs/PERF.md` baseline row filled in with real numbers, not estimates
- [ ] Repeat-visit payload recorded (expect ~2.11 MB — this is the bug)

## Rollback

Nothing here is risky. If a commit misbehaves, `git revert` it; the deletions are
all regenerable or already in git history.
