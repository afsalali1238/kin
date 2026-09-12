## What changed

<!-- One-paragraph summary of the change and why. -->

## Clinical safety

- [ ] No clinically-facing copy was changed, **or** wording was reviewed for plain, supportive tone (Arabic strings updated in step with English)
- [ ] Red-flag safety logic (`redFlags` in `src/lib/clinical.ts`) was untouched, **or** tests in `clinical.test.ts` were updated to cover the change
- [ ] Exercise prescriptions still respect irritability, phase caps and `contraindicatedFor` (full-matrix test in `clinical.test.ts` passes)

## Verification

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] Touched journeys still pass the e2e suite (`npm run test:e2e`), or this change is covered by existing specs

## Risk & rollout

<!-- Widest path affected (body map, intake, programme, session, journey) and how it degrades: offline, low-memory devices, reduced motion. -->
