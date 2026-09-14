# Stage 09 — Clinical traceability and CI gates

**Est** 2 days · **Branch** `stage/09-clinical` · **Depends on** 04
**Gate** Content CI fails on a deliberately broken progression link; disclaimer blocks the first session until accepted; coverage floor holds.
**Moves** Tests & CI 7.5 → 9; clinical engineering to 9 (the score waits on the physio)

## Objective

Make the clinical layer verifiable by someone who is not a programmer, and make the
first-run experience legally sane. This stage produces the packet your physiotherapist
reviews — which is what turns their sign-off from a week of code reading into an
afternoon.

## What is already strong

`DECISIONS.md` documents the clinical reasoning honestly and `src/lib/clinical.ts` is
a clean set of pure functions over editable JSON. `redFlags()` blocks session launch
on urgent findings and `startSession` enforces it. Irritability clamps dose. Frozen
shoulder cannot receive phase 2/3 loading. Progression is response-gated, not
calendar-gated. Existing vitest suites cover `match`, `makeProgramme`, `redFlags`,
`progression`, `traffic` and `variant`.

The gap is not the logic. It is that nothing *proves* the content behind the logic is
internally consistent, and nothing explains a given session after the fact.

## Tasks

### 1. Schema-validate the clinical content

Four files, currently trusted implicitly:

| File | Contains |
|---|---|
| `src/data/exercises.json` | 136 movement records, ~159 KB |
| `src/data/matching-rules.json` | scored rules per presentation |
| `src/data/presentations.json` | 28 presentations across 8 regional families |
| `src/data/regions.json` | 31 coarse regions with mask colours |

Add `src/lib/content-schema.ts` with zod schemas, and `scripts/check-content.mjs`
that runs them plus **referential integrity**:

- every `exercise.presentationIds[]` resolves to a presentation id
- every `exercise.contraindicatedFor[]` resolves to a presentation id
- every `exercise.targetRegions[]` resolves to a region id
- every `rule.presentationId` resolves, and every presentation has at least one rule
- every `rule.group` matches a real `region.group`
- every easier/harder `variant` link resolves, is not self-referential, and is not
  contraindicated for the presentations that reference it
- every presentation has at least one non-contraindicated exercise **per phase it can
  reach** — this is the one that catches an empty session
- region `maskColor` values are unique (the picker resolves taps by colour)
- `holdSeconds` xor `reps` is set, never both, never neither
- `sets`, `restSeconds`, `holdSeconds`/`reps` within sane clinical bounds

Wire into CI. Then **prove the gate works**: break a progression link on a scratch
branch, watch CI fail, revert. A gate you have not seen fail is not a gate.

This is what makes the JSON genuinely clinician-editable, which is the whole premise
of storing it as data.

### 2. Red-flag coverage table, generated

`scripts/gen-redflag-table.mjs` reads `redFlags()` behaviour via its tests and emits
`docs/clinical/RED-FLAGS.md`:

| Detail flag | Level | Trigger condition | Product behaviour | Copy shown |
|---|---|---|---|---|
| `bladder` | urgent | any | session launch blocked, plan paused | … |
| `saddle` | urgent | any | blocked | … |
| `both-legs` | urgent | any | blocked | … |
| `chest` | urgent | any | blocked, emergency wording | … |
| `severe-headache` | urgent | any | blocked | … |
| `weakness` | review | any | in-person review advised, sessions allowed | … |
| `weight-loss` / `fever` / `major-trauma` / `locked` / `weight-bearing` | review | any | review advised | … |
| — | review | `pattern === 'night'` | review advised | … |

Generate it rather than writing it by hand, so it cannot drift from the code. This
one page is the single most valuable artifact for the physio review: it lets them
check the screening rules without reading TypeScript.

Add tests asserting each urgent flag actually prevents `launchSession` — the block
lives in `startSession` in `KinesioApp.tsx`, so this needs an e2e case as well as the
unit test on `redFlags`.

### 3. Dose-decision audit trail

Today a session's shape is recomputed and forgotten. When a user's pain trend
worsens, there is no way to see what they were actually doing.

Extend the `CheckIn` log entry (schema v5 — same migration discipline) with a compact
decision record written at session launch:

```ts
type DoseRecord = {
  irritability: 'high'|'moderate'|'low';
  phase: number;
  presentationId: string;
  exerciseIds: string[];
  swapsApplied: string[];
  budgetSeconds: number;      // 420 / 720 / 900
  clampedSets: boolean;       // the while-loop in makeProgramme reduced sets
};
```

Surface it read-only in `ProgressScreen` under the phase history — "what your
sessions looked like" — and include it in the stage-08 JSON export. A clinician
looking at a bad week can then see that phase 2 was reached with high irritability
still set, rather than guessing.

Keep it bounded in `recovery-schema.ts` like everything else.

### 4. First-run medical disclaimer

`DECISIONS.md` records the absence of a consent or legal gate as deliberate for an
internal-testing MVP. That was the right call for testing and is the wrong call for a
UAE-facing symptom-triage product that is about to be shown to people.

A single blocking screen before the body step, once, acknowledgement stored in
`localStorage` and in `Recovery`:

- what this is: educational and self-management support, based on pattern matching
- what it is not: a diagnosis, and not a substitute for in-person assessment
- the pattern scores are transparent fit scores, not probabilities — this language
  already exists in the app and should be reused verbatim
- when to stop and seek help, naming the urgent categories plainly
- one checkbox, one button, no dark pattern

Keep it short enough to be read. This is also the copy that lives permanently in the
stage-08 settings sheet.

### 5. Mobile device profiles and a coverage floor

`playwright.config.ts` currently defines one project with SwiftShader WebGL args. Add
two device projects:

```ts
projects: [
  { name: 'pixel-7',   use: { ...devices['Pixel 7'],   launchOptions } },
  { name: 'iphone-14', use: { ...devices['iPhone 14'], launchOptions } },
  { name: 'desktop',   use: { viewport: { width: 1440, height: 900 }, launchOptions } },
]
```

Run the full journey on all three. Note that `devices['iPhone 14']` runs WebKit,
which will surface `dvh`, safe-area and Wake Lock differences the Chromium projects
hide — expect to find real bugs here.

Add a vitest coverage threshold on `src/lib/**` (start at whatever the current number
is, rounded down, then ratchet). `src/lib` is the clinical engine; untested branches
there are the ones that matter.

### 6. Update DECISIONS.md

Add a section for this stage: what is now machine-verified, what the disclaimer says
and why it was added, what the audit trail records, and the standing statement that
clinical content review is still outstanding. Keep the existing honesty.

## Gate

```bash
node scripts/check-content.mjs
node scripts/gen-redflag-table.mjs && git diff --exit-code docs/clinical/RED-FLAGS.md
npm test          # with the coverage floor
npm run test:e2e  # three device projects
```

- [ ] Content CI passes clean, and **fails** on a deliberately broken link (show the run)
- [ ] Every presentation has a viable session in every phase it can reach
- [ ] `docs/clinical/RED-FLAGS.md` generated and committed; regenerating is a no-op
- [ ] Each urgent flag proven to block `launchSession` in unit and e2e tests
- [ ] Dose record written at launch, visible in Progress, included in export
- [ ] Disclaimer blocks the first session until accepted; acknowledgement persists
- [ ] Playwright green on Pixel 7, iPhone 14 and desktop
- [ ] Coverage floor on `src/lib` enforced in CI
- [ ] `DECISIONS.md` updated

## What this stage does not do

It does not make the clinical content correct. It makes the content *checkable* and
the product's behaviour *explainable*. The score moves from 8.5 to 9 when a licensed
physiotherapist works through `docs/handoff/PHYSIO-BRIEF.md` and signs off — which
now costs them an afternoon instead of a week, because `RED-FLAGS.md` and the
content-integrity report do the mechanical part for them.
