# kinē — road to nine

Ten stages, ~19 working days, solo with agent assistance. Target: an installable
mobile-first PWA scoring 9/10 on every dimension that code can move.

Reviewed against `afsalali1238/kine@4ebdd4b` plus eight uncommitted local files,
12 September 2026.

## Scores

| Dimension | Now | After | Stage |
|---|---|---|---|
| Install / offline | 3.0 | 9 | 01, 08 |
| Mobile performance | 3.5 | 9 | 02 |
| Mobile-first CSS | 4.0 | 9 | 03 |
| Bilingual / Arabic | 5.0 | 7.5 → 9 with translator | 07 |
| Accessibility | 5.5 | 9 | 03, 06 |
| Workflow & flow | 6.5 | 9 | 04 |
| Tests & CI | 7.5 | 9 | 00, 02, 06, 09 |
| Code architecture | 8.0 | 9 | 03, 04 |
| API & data hardening | 8.0 | 9 | 05 |
| Clinical logic & safety | 8.5 | 8.5 → 9 with physio | 09 |

Two dimensions are capped by design. Clinical content and Arabic clinical prose
need a licensed physiotherapist and a medical translator respectively. Stages 07
and 09 exist partly to produce the handoff packets those reviews need — see
`docs/handoff/`.

## Order and dependencies

| Stage | Name | Est | Depends on | Branch |
|---|---|---|---|---|
| [00](stages/00-baseline.md) | Land uncommitted work, measure baseline | 0.5d | — | `stage/00-baseline` |
| [01](stages/01-pwa-shell.md) | PWA shell: manifest, SW, precache | 2d | 00 | `stage/01-pwa-shell` |
| [02](stages/02-performance.md) | Asset and runtime performance | 2d | 01 | `stage/02-performance` |
| [03](stages/03-mobile-css.md) | Invert the stylesheet | 4d | 02 | `stage/03-mobile-css` |
| [04](stages/04-session-engine.md) | Session engine and state machine | 2d | 03 | `stage/04-session-engine` |
| [05](stages/05-sync.md) | Close the sync loop | 1.5d | 01 | `stage/05-sync` |
| [06](stages/06-accessibility.md) | Accessibility to AA | 1.5d | 03 | `stage/06-accessibility` |
| [07](stages/07-i18n.md) | i18n scaffolding + Arabic type | 1.5d | 03 | `stage/07-i18n` |
| [08](stages/08-retention.md) | Reminders, settings, data control | 2d | 01, 05 | `stage/08-retention` |
| [09](stages/09-clinical-traceability.md) | Clinical traceability and CI gates | 2d | 04 | `stage/09-clinical` |

**Why this order.** Platform and assets land before pixels: if the stylesheet is
inverted first, it gets rewritten again once the mini 3D viewers become sprites
and the layout constraints change. Stage 03 is the long pole and wants a settled
foundation underneath and nothing else moving alongside it. Accessibility comes
after 03 because a11y fixes stick to markup that has stopped changing.

Stages 05, 06 and 07 are independent of each other once 03 has landed, so if a
day frees up they can be interleaved. **Stage 03 and stage 04 must never be
interleaved** — 03 touches every screen file, 04 rewires the orchestrator.

## The two caps, stated plainly

Reaching 9 on clinical logic is not an engineering task. The code side —
schema-validated content, referential integrity, a red-flag coverage table, a
dose-decision audit trail, a first-run disclaimer — is stage 09, and it moves the
engineering quality to 9. The *score* stays at 8.5 until a physiotherapist signs
off on cues, exclusions, progression links and scoring weights.

Same for Arabic. Stage 07 loads an Arabic typeface, externalises every string, and
generates a CSV of exactly what needs translating. That is 7.5. The remaining 1.5
is a purchase, not a commit.

## Progress log

Append a row at every gate, pass or no-change. See `docs/PERF.md`.
