# Clinical review brief — kinē

**For:** a licensed physiotherapist (musculoskeletal / rehabilitation)
**Time:** roughly 15–20 hours, best split across three sittings
**Prepared by:** the build team · read `DECISIONS.md` first, it is short and candid

## What you are reviewing

kinē is a self-management app. A person marks where it hurts on a 3D body, answers
seven triage questions, is shown a **pattern match** (never a diagnosis), sets a
goal, and gets a short daily exercise programme that adapts to how they respond.

You are not being asked to validate a diagnostic system. You are being asked whether
the content and the guardrails are safe and sensible for unsupervised use.

## What is explicitly *not* claimed

Please hold the team to these — and flag anywhere the interface drifts from them:

- Pattern scores are **transparent fit scores**, not calibrated probabilities. The UI
  says "Stronger / Possible / Early pattern match".
- Frozen shoulder, SI joint, meniscal, inflammatory and nerve presentations are
  provisional patterns only. No structural claims.
- The 4/10 · settles-in-24-hours · no-worse-next-morning rule is presented as a
  **load-monitoring heuristic**, not as permission to exercise.
- Session media is a labelled animated illustration, not a filmed demonstration.

## Read in this order

1. `DECISIONS.md` — clinical intent, dosage reasoning, and the team's own list of
   limitations.
2. `docs/clinical/RED-FLAGS.md` — **generated from the code**, so it is what the app
   actually does, not what someone remembers it doing. Start here for safety.
3. `docs/clinical/CONTENT-REPORT.md` — machine-checked integrity: every exercise
   resolves to a presentation, every progression link resolves, every presentation has
   a viable session in each phase it can reach.
4. `src/data/presentations.json` — the 28 presentations and their education prose.
5. `src/data/exercises.json` — 136 movement records: name, phase, type, sets,
   holds/reps, tempo, rest, cues, equipment, target regions, `presentationIds`,
   `contraindicatedFor`, easier/harder links.
6. `src/data/matching-rules.json` — the scoring weights.

You do not need to read any code. If you want to, `src/lib/clinical.ts` is about 90
lines and contains the whole engine.

## The eight questions we need answered

1. **Red flags.** Using `RED-FLAGS.md`: is the urgent set right — new bladder/bowel
   change, saddle numbness, bilateral leg symptoms, chest pain with breathlessness,
   first sudden severe headache? Is anything missing that must block exercise? Is
   anything over-triaged to the point of causing needless alarm?
2. **The review tier.** Night-waking pain, progressive weakness, fever, major
   trauma, unexplained weight loss, locked joint, inability to weight-bear — currently
   these advise in-person assessment but still allow sessions. Correct call, or should
   any of them block?
3. **Dosage.** Irritability drives dose: high = 1 set, 15 s holds, 6 reps, ~7 min
   budget; moderate ~12 min; low ~15 min, and low irritability starts at phase-2
   exercises without a waiting period. Four exercises per session, hard 15-minute cap.
   Is this defensible for unsupervised use?
4. **Exercise cues.** Each movement shows three written cues. Are they sufficient to
   perform the movement safely without a clinician present? Flag any that could be
   misread into a harmful position.
5. **Contraindications.** Per-presentation exclusions and the easier/harder variant
   links. Is anything prescribed that should not be — particularly supported extension
   in flexion-preferring back patterns, and anything loaded in the frozen-shoulder
   pathway (which is currently clamped to phase 1 permanently).
6. **Scoring weights.** In `matching-rules.json`: base scores, aggravator and easer
   weights, neuro weight, gradual vs. incident onset weights. Do the relative
   magnitudes match how you would actually weight these findings?
7. **Progression.** A phase advances only on ≥70% of a ten-session block **plus**
   stable-or-falling pain **plus** manageable effort **plus** a next-morning check.
   Pain above 4/10 or a worse morning reduces the dose. Are those thresholds right?
   Is the ten-session block a reasonable simplification?
8. **The disclaimer.** Does the first-run copy say enough, in plain language, about
   what this is not and when to stop?

## How to give us feedback

Per item, one of: **OK**, **Change** (say what to), or **Remove**. Severity as
**safety** / **clinical accuracy** / **wording**.

Content lives in plain JSON and is designed to be edited — you can mark up the files
directly, or use a spreadsheet keyed by exercise id and we will apply it. Safety items
get fixed before anything else ships.

## What we already know needs work

Stated so you do not spend your hours rediscovering it:

- Arabic clinical terminology is interim and is being handled separately (see
  `TRANSLATOR-BRIEF.md`). Do not review the Arabic.
- Boundary exercise variants exist but are not independently validated protocols.
- The next-morning check is a single same-scale comparison, not true 24-hour recovery
  timing.
- Coarse body-region segmentation is approximate; fine muscular boundaries would need
  an anatomist-authored atlas.
- No examination, so no presentation can be confirmed — the education prose
  deliberately avoids confident structural statements. Tell us if any of it still
  reads too confidently.
