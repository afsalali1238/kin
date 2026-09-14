# Stage 04 — Session engine and state machine

**Est** 2 days · **Branch** `stage/04-session-engine` · **Depends on** 03
**Gate** Background the tab 60 s and the timer is still right; kill and reload mid-session and state resumes to the second.
**Moves** Workflow 6.5 → 9, Code architecture 8.0 → 9

## Objective

Make a session survive a phone. Four defects, all in the same area, plus the state
cleanup that makes them fixable.

## The defects

**1. Nothing about the session is persisted.** `sessionList`, `exerciseIndex`,
`seconds`, `sessionHadPain`, `playing` are all `useState` in `KinesioApp.tsx`. A
phone call, a backgrounded tab or an iOS memory reclaim drops the user to the body
step with no log and no way back in. This is the highest user-visible data loss in
the app.

**2. The timer is a counter, not a clock.**

```ts
// KinesioApp.tsx, current
setInterval(() => setSeconds(s => s <= 1 ? 0 : s - 1), 1000)
```

Browsers throttle timers in backgrounded tabs to once a minute or stop them
entirely. A 45-second hold under-counts whenever the screen sleeps — and the user is
lying on the floor, not watching. The number on screen is wrong precisely when it
matters.

**3. No Wake Lock.** The screen dims mid-hold with the user's hands on the floor.

**4. Sets are prescribed but not tracked.** `makeProgramme` returns exercises with
`sets`, `holdSeconds`/`reps` and `restSeconds`, `ProgrammeScreen` displays
`3 sets × 30s hold`, and `SessionPlayer` times **one** hold with no set counter and
no rest timer. The user must track sets themselves. In rehab apps this is the
single most common cause of dropped adherence.

Plus two flow inconsistencies worth fixing in the same pass:

**5. The pain question is asked twice.** `changePinIntensity` on the body step
writes straight to `intake.pain` via `answer({pain:n})`, then intake question 1 asks
about pain again. Users reasonably wonder whether the first answer counted.

**6. Re-pinning silently desyncs the journey.** `selectRegion` updates
`state.region` immediately. `deriveJourney` then computes a new `group` and new
`matches`, while `state.presentationId` still holds the *old* assessment — so
`HomeScreen` shows the new body area and `ProgrammeScreen` shows the old condition,
with a plan built from a presentation that no longer matches the region.

## Tasks

### 1. Two reducers

`KinesioApp.tsx` holds ~30 `useState` calls. Split:

```
src/features/session/sessionMachine.ts   // useReducer
  state: { list, index, setIndex, phase: 'idle'|'holding'|'resting'|'done',
           endsAt: number|null, hadPain: boolean }
  actions: LAUNCH, PLAY, PAUSE, TICK_RECONCILE, SET_DONE, NEXT, PREV,
           ADAPT_EASIER, ADAPT_HARDER, RESET_TIMER, LEAVE, FINISH

src/lib/journeyMachine.ts (or keep in the orchestrator)
  screen, step, pendingPin, rejected, riskAcknowledged, phaseTab
```

Target: no more than 8 `useState` left in the orchestrator (language, sound, toast,
help/traffic modal flags, learn article, coarse pointer). Everything sequential goes
in a reducer — pure, unit-testable, and it eliminates the timestamp bugs by
construction rather than by vigilance.

Keep the screens presentation-only. They receive state and dispatchers.

### 2. Recovery schema v3

`src/lib/app-types.ts` — extend `Recovery`:

```ts
export type ActiveSession = {
  startedAt: string;          // ISO
  exerciseIds: string[];      // the resolved list, so swaps survive a reload
  index: number;
  setIndex: number;
  phase: 'holding' | 'resting' | 'paused';
  endsAt: number | null;      // epoch ms; null when paused
  remainingMs: number | null; // set when paused
  hadPain: boolean;
};

export type Recovery = { /* …existing… */ activeSession: ActiveSession | null };
```

`src/lib/recovery-storage.ts`:

- `RECOVERY_SCHEMA_VERSION = 3`
- extend `migrateRecovery` — v1/v2 payloads get `activeSession: null`. Never throw.
- add a test beside the existing ones in `recovery-storage.test.ts`

`src/lib/recovery-schema.ts` — add a bounded zod schema for `activeSession`
(`exerciseIds` array max 12, ids max 64 chars, `index`/`setIndex` ints 0–20,
`endsAt`/`remainingMs` finite). Unknown keys are already stripped, so an old server
will simply not persist it — which is fine.

**Stale session guard:** on load, if `startedAt` is more than 6 hours old, discard
`activeSession` rather than offering to resume a session from yesterday.

### 3. Timestamp timer

```ts
// derive, never accumulate
const remainingMs = phase === 'paused' ? remainingMs : Math.max(0, endsAt - Date.now());
```

- `requestAnimationFrame` or a 250 ms interval **for rendering only** — the value
  always comes from `endsAt - Date.now()`.
- On `visibilitychange` → visible, recompute immediately. If `remainingMs` hit 0
  while hidden, fire the completion path once (spoken cue only if the document is
  visible — do not talk to an empty room).
- Pausing stores `remainingMs`; resuming sets `endsAt = Date.now() + remainingMs`.

Unit-test the reducer with an injected clock: pause at 12 s, advance the fake clock
60 s, resume, assert 12 s remains.

### 4. Wake Lock

```ts
// src/hooks/useWakeLock.ts
// request 'screen' while phase is holding|resting, release on pause/leave/unmount
// re-request on visibilitychange → visible, because the lock is dropped on hide
// wrap in try/catch — unsupported on iOS < 16.4 and behind a user gesture elsewhere
```

Never block the session on a failed lock. If unsupported, leave a one-line note in
the session UI the first time only.

### 5. Sets and rests

`SessionPlayer` gets: `Set 2 of 3` as a real indicator, a rest timer between sets
using `restSeconds`, and cues at both ends — "Begin" at set start, the existing
"Well done, take a short rest" at set end, and "Last set" before the final one.
Keep them behind the existing `sound` toggle and the Arabic/English branch.

`NEXT` advances `setIndex` first and only moves to the next exercise when the sets
are done. The completion path (`checkin`) fires when the last set of the last
exercise finishes.

### 6. Resume banner

On `HomeScreen` (and on the programme screen), when `activeSession` exists:

> You were two exercises in — **continue**, or **start fresh**.

Continue restores the list by id, so swaps made mid-session survive. Start fresh
clears `activeSession` and logs nothing.

### 7. Fix the duplicated pain question

Pick one:

- **(preferred)** relabel the body-step slider as "pain right now, at this spot" and
  drop pain from intake question 1, keeping `best`/`worst` there; or
- keep both and label question 1 "your pain over the last week" explicitly.

Whichever you choose, say so in `DECISIONS.md` — the NPRS `best ≤ current ≤ worst`
invariant is documented there and must still hold.

### 8. Guard re-pinning

In `selectRegion`, if `state.assessed` and the new region's `group` differs from the
current presentation's group, do not silently update. Ask:

> That's a different area. Start a new assessment for it? Your current plan stays
> saved until you finish.

On confirm: run `match()` for the new group and set `presentationId` together with
`region` in one `update()`, then send the user to intake. On cancel: leave state
untouched.

## Gate

```bash
npm test                    # reducer tests incl. the injected-clock cases
npm run test:e2e
```

New e2e specs:

- `tests/e2e/session-resume.spec.ts` — start a session, complete one set, reload the
  page, assert the resume banner and that continuing lands on the same set
- `tests/e2e/timer-background.spec.ts` — start a 30 s hold, `page.evaluate` a
  visibility-hidden dispatch plus a 60 s clock advance, return, assert the timer
  reads 0 and the completion fired exactly once

- [ ] `activeSession` persists across reload; resume is exact to the second
- [ ] Timer correct after 60 s backgrounded
- [ ] Wake Lock held while holding/resting, released on pause and leave
- [ ] Set counter and rest timer work for a 3-set exercise
- [ ] Swap-to-easier mid-session survives a reload
- [ ] `activeSession` older than 6 h is discarded, not offered
- [ ] ≤ 8 `useState` in `KinesioApp.tsx`
- [ ] Pain asked once, or both instances explicitly scoped
- [ ] Re-pinning after assessment prompts and updates region + presentation together
- [ ] `DECISIONS.md` updated for the pain-question decision

## Rollback

Schema v3 is additive and `migrateRecovery` never throws, so a revert leaves v3
payloads readable by v2 code (the extra key is ignored on read and dropped on next
write). Ship the migration test before the feature.
