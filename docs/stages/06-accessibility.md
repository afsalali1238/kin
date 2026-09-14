# Stage 06 — Accessibility to AA

**Est** 1.5 days · **Branch** `stage/06-accessibility` · **Depends on** 03
**Gate** Zero axe violations on all ten screens in CI, plus a recorded VoiceOver and TalkBack walk-through.
**Moves** Accessibility 5.5 → 9

## Objective

Reach WCAG 2.1 AA on a phone. Stage 03 already did the heavy lifting — type floor,
44px targets, contrast tokens. This stage closes what is left and locks it in CI so
it cannot rot.

## What's already right

Do not undo these: `aria-live` + `aria-atomic` on the pin-confirm panel,
`role="img"` with a descriptive label on the interactive canvas and `aria-hidden` on
mini viewers, `aria-pressed` on every toggle chip, `aria-expanded` on the region
disclosure, `aria-label` on icon-only buttons, a real `focus-visible` ring
(`outline: 2px solid var(--olive); outline-offset: 4px`), and a
`prefers-reduced-motion` block that kills all animation. `DECISIONS.md` documents the
44px chip minimum as an existing intent.

## Tasks

### 1. axe in CI, all ten screens

`@axe-core/playwright` is already a dependency. Add `tests/e2e/a11y.spec.ts`:

walk body → intake (all 7 steps) → result → goal → programme → session → checkin →
home → progress → learn, plus both modals open, plus the offline banner visible, and
assert zero violations at each stop. Run it at 375px and 1440px.

Wire into `.github/workflows/ci.yml` so it fails the build. Expect the first run to
find things this document does not list — fix those too.

### 2. Modals

`HelpModal.tsx` and `TrafficModal.tsx` need the standard four:

- `role="dialog"` `aria-modal="true"` with `aria-labelledby` pointing at the heading
- focus moved into the dialog on open, to the heading or first control
- focus **trapped** while open, and returned to the triggering button on close
- Escape closes; a click on the backdrop closes; the backdrop click must not fire on
  a drag that started inside the dialog

`TrafficModal` gates session launch, so it is the one a keyboard user hits every
session — test it specifically.

### 3. Sliders that say something useful

Three pain inputs: the body-step intensity slider, `SessionCheckIn`, and
`HomeScreen`'s daily check-in. All three currently have only an `aria-label`.

```tsx
<input
  type="range" min="0" max="10" step="1"
  aria-label={t('Pain right now', '…')}
  aria-valuetext={t(`${v} out of 10 — ${band(v)}`, `${v} من ١٠ — ${bandAr(v)}`)}
/>
```

Where `band()` is the language the app already uses clinically: 0 none, 1–3 mild,
4–6 moderate, 7–10 severe. A screen-reader user hearing "six" learns nothing; "six
out of ten, moderate" is the actual information.

Keyboard: arrows already step natively — verify `step="1"` is set on all three and
that Home/End work.

### 4. Bottom bar as navigation

It is currently a `<nav>` inside `<aside class="sidebar">` with `<button>` children
and a class-based active state.

- keep the buttons (they switch views, they are not links) but add
  `aria-current="page"` on the active one
- the `<aside>` should not be an `aside` on mobile where it is the primary nav —
  render `<nav aria-label="Main">` and drop the `aside` wrapper, or move `role="navigation"`
- labels must survive 200% zoom: with stage 03's `--fs-label` and `--nav-h` this
  works; verify at 200% that nothing clips (WCAG 1.4.4)
- the brand button already has `aria-label="Kinesio home"` — make it consistent with
  the visible name (`kinē`)

### 5. Keyboard path through the body step

The 3D canvas will never be keyboard-operable, and that is fine — but the fallback
must be. `Fallback2D` renders on WebGL failure, and the region chip grid /
`.region-grid` is always present.

Requirement: a keyboard-only user can reach a region, select it, set intensity, and
continue, without ever touching the canvas. Today the chips are reachable but the
`allRegions` disclosure starts collapsed, so verify the tab order gets there in a
sane number of stops and that the sheet's search input is labelled (it is).

Add a visually-hidden "Skip the 3D map, choose from a list" link as the first
focusable element on the body step.

### 6. Live regions and announcements

- The toast is `role="status"` — correct. Make sure it is not also focus-stealing.
- `.offline-banner` is `role="status"` — correct.
- The session timer must **not** be a live region (it would announce every second).
  Announce set transitions only: a separate `role="status"` node that receives
  "Set 2 of 3" and "Rest, 30 seconds".
- The red-flag notice in `ResultStep` already uses `role="alert"` — keep it.

### 7. `prefers-contrast`

```css
@media (prefers-contrast: more){
  :root{ --muted:var(--ink); --line:#b9c0b1 }
  button:focus-visible{ outline-width:3px }
}
```

### 8. Manual screen-reader pass

Automated tools catch maybe 40% of real problems. Record two short screen captures:
VoiceOver on iOS and TalkBack on Android, each walking assessment → session →
check-in. Watch for: unlabelled graphics, the pin confirmation being announced,
whether the traffic-light modal traps correctly, and whether the slider values are
comprehensible. Keep the recordings in `docs/a11y/`.

## Gate

```bash
npm run test:e2e            # includes a11y.spec.ts
```

- [ ] Zero axe violations, ten screens + both modals, at 375px and 1440px
- [ ] Modals: focus moved in, trapped, returned; Escape closes
- [ ] All three sliders have meaningful `aria-valuetext` in both languages
- [ ] `aria-current` on the active nav item; nav labels legible at 200% zoom
- [ ] Full keyboard path: region → intensity → continue → 7 questions → result
- [ ] Skip-to-list link present on the body step
- [ ] Set transitions announced; timer ticks are not
- [ ] `prefers-contrast: more` block present
- [ ] Two screen-reader recordings committed
- [ ] axe gate added to CI

## Rollback

Nothing here is risky. If a focus trap misbehaves, the failure mode is annoying
rather than destructive — but test the traffic-light modal carefully, because a trap
bug there blocks every session start for keyboard users.
