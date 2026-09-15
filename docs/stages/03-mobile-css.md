# Stage 03 — Invert the stylesheet

**Est** 4 days · **Branch** `stage/03-mobile-css` · **Depends on** 02
**Gate** Screenshot set at 320/375/414/768/1440 in both themes; no `max-width` queries left; no declaration under 11px.
**Moves** Mobile-first CSS 4.0 → 9, and lays the groundwork for 06

## Objective

Make the phone the base case. This is the single largest score gain and the longest
stage. Resist the urge to redesign anything: you are **re-authoring what exists**,
phone-first. If you start improving screens mid-inversion, four days becomes eight.

## The evidence you are fixing

`src/app/globals.css` is 145 minified lines. Every breakpoint is `max-width`:
1450, 1180, 950, 720, 380, 320. The base case is a 222px fixed sidebar with 43px
brand type — the 1450px desktop. The phone is reached by six layers of subtraction:

- **~40 declarations below 11px** at ≤720px. Specifically: `font-size:5px`
  (`.orientation-label`), `6px` (`.phase-status`, `.progress-stat-grid` captions),
  `7px` (`.page-footer`, `.eyebrow`, `.featured-article .eyebrow`), and `8px` on the
  bottom-nav labels users tap every day.
- **30+ elements `display:none` on phones** — the entire `.sidebar-bottom`,
  `.intake-aside`, `.exercise-equipment`, `.trust-strip > div:last-child`,
  `.home-art`, `.step small`, `.step > svg`, `.quiet-message`,
  `.page-footer > span:last-child`. Content is being hidden because the desktop
  layout has nowhere to put it.
- `.app-shell { min-height: 100vh }` — the address-bar-collapsed height on mobile
  browsers, so the layout jumps as the bar hides.
- `input[type=range]` is a 5px track with an 18px thumb. This is the most-used
  control in the product.

**The exception to copy.** The body-step block (lines ~89–130) is properly
mobile-first: `dvh` with a `vh` fallback, a 52dvh bottom sheet with a drag handle,
`env(safe-area-inset-bottom)`, a 16px input to stop iOS zoom, a sticky CTA that
clears the nav bar. That is the standard. Propagate it.

## Tasks

### 1. Split the file (half a day, do it first)

`src/app/globals.css` (145 minified lines) becomes:

```
src/styles/tokens.css        colour, type scale, spacing, radius, shadow, z-index
src/styles/base.css          reset, element defaults, focus-visible, forms
src/styles/layout.css        app-shell, sidebar/bottom-nav, topbar, main-content
src/styles/components.css    buttons, chips, cards, notices, toast, modal, sliders
src/styles/features/body.css      body step + viewer + sheet (already good — port as-is)
src/styles/features/journey.css   intake, result, goal
src/styles/features/programme.css
src/styles/features/session.css
src/styles/features/home.css
src/styles/features/progress.css
src/styles/features/learn.css
```

`globals.css` becomes imports only. Nothing over 400 lines. **Un-minify as you
split** — this code is going to be read and edited for the rest of the project.

Do this as its own commit with zero behaviour change: the 1440px screenshots must
be pixel-identical before and after. That gives you a clean base to invert against.

### 2. Tokens (half a day)

Extend the existing `:root` block into a real system. It currently has 9 colour
variables and no type or space scale.

```css
:root{
  /* existing palette stays — these names are already used everywhere */
  --bg:#f7f8f3; --panel:#fcfcf8; --ink:#30372e; --muted:#8a8e82;
  --line:#e4e7dd; --olive:#77855d; --olive-dark:#64734c; --pale:#eef1e7; --sidebar:#f0f2e9;

  /* type scale — phone first, clamp() grows it */
  --fs-caption: 12px;
  --fs-label:   clamp(11px, 2.8vw, 12px);
  --fs-body:    clamp(14px, 3.6vw, 15px);
  --fs-lead:    clamp(15px, 4vw, 17px);
  --fs-h3:      clamp(16px, 4.2vw, 18px);
  --fs-h2:      clamp(20px, 5.4vw, 26px);
  --fs-h1:      clamp(26px, 7vw, 37px);

  /* space, 4px base */
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:20px; --s6:24px; --s8:32px; --s10:40px;

  /* touch */
  --touch:44px;
  --nav-h:calc(60px + env(safe-area-inset-bottom));
}
```

**Rule: `--fs-label` at 11px is the floor.** Nothing smaller exists. Every
`font-size:5px|6px|7px|8px|9px|10px` in the current file is replaced by a token,
which means some things that are currently three shrunken lines become two honest
ones. That is the correct trade.

### 3. Dark theme (part of the token work)

The app is light-only today. People do rehab in bed at 11pm. Doing this now with
tokens is a day; retrofitting later is a week.

```css
@media (prefers-color-scheme: dark){
  :root{
    --bg:#121714; --panel:#1a201c; --ink:#e9ede8; --muted:#8e9a8d;
    --line:#2c3630; --olive:#a8c184; --olive-dark:#c0d49f; --pale:#1f2a20; --sidebar:#161c18;
  }
}
```

Then audit: any hardcoded hex outside `tokens.css` is a bug. There are a few —
`.offline-banner` (`#f5f0e5`/`#ece2ce`/`#9a8461`), the sheet handle (`#dde3d3`),
`.sticky-cta` background (`#fdfdf9`), the bottom nav (`#f5f7ee`), and the pin
colours in `BodyViewer.tsx`. The 3D pin colours can stay literal (they sit on a
rendered body, not on the page ground); everything else becomes a token.

Check contrast: `--muted` on `--bg` is currently 3.4:1, which fails AA for body
text. Darken it to at least 4.5:1 in light mode. This is the most common failure
you will find.

### 4. Invert, screen by screen (2 days)

For each feature stylesheet, in this order — body (already done, port it), home,
programme, session, journey, progress, learn:

1. Take the current ≤720px block as the **new base**, unconditional.
2. Delete the `max-width` wrapper.
3. Add back the desktop treatment under `@media (min-width: 720px)`,
   `(min-width: 950px)`, `(min-width: 1180px)`.
4. For every `display:none` in the old mobile block, decide where the content
   actually goes on a phone. Suggested resolutions:
   - `.intake-aside` → a `<details>` note under the question, closed by default
   - `.exercise-equipment` → an inline chip in `.exercise-info > p`
   - `.sidebar-bottom` (help link, sync status) → moves into the stage-08 settings
     sheet, reachable from the topbar; the support link becomes a topbar icon
   - `.step small` → keep, at `--fs-label`, wrapping to two lines
   - `.home-art`, `.trust-strip > div:last-child` → genuinely decorative, may stay
     hidden; document that in a comment
5. Replace every `vh` with `dvh` (keep a `vh` fallback line above it, as
   `body.css` already does for `.viewer-wrap`).
6. `env(safe-area-inset-bottom)` on the bottom nav, sticky CTAs, and the toast.

The layout rule: the sidebar becomes a bottom nav **at the base**, and the sidebar
is the enhancement. `.main-shell { margin-inline-start: 0 }` is the default;
`margin-inline-start: 222px` appears only at `min-width: 950px`.

### 5. Touch geometry (half a day)

```css
/* the single most important control in the app */
input[type=range]{
  width:100%; height:var(--touch);      /* 44px hit area */
  background:transparent; appearance:none;
}
input[type=range]::-webkit-slider-runnable-track{ height:8px; border-radius:99px; background:var(--pale) }
input[type=range]::-webkit-slider-thumb{
  appearance:none; width:28px; height:28px; border-radius:50%;
  background:var(--olive); border:3px solid var(--panel);
  box-shadow:0 1px 4px rgba(48,55,46,.25); margin-top:-10px;
}
input[type=range]::-moz-range-track{ height:8px; border-radius:99px; background:var(--pale) }
input[type=range]::-moz-range-thumb{ /* same 28px */ }
```

Then sweep: every `button`, `a`, `.chip`, `.option`, `.nav-item`, `summary` gets
`min-height: var(--touch)` and enough inline padding that the *tappable* box is
44px in both axes. Where a visually small control is required (the `X` on the
toast, `.icon-button`), keep the visual size and expand the hit area with a
pseudo-element:

```css
.icon-button{ position:relative }
.icon-button::after{ content:''; position:absolute; inset:-12px }
```

Bottom nav: `.nav-item` at `width:19%; height:55px` with 8px labels becomes five
equal flex children, `min-height:var(--touch)`, label at `--fs-label`, and the bar
at `--nav-h` so it respects the home indicator.

### 6. No horizontal overflow, anywhere

Side gutter of at least 16px at every width, set once on `.main-content`. Tables,
the phase grid and any wide row get their own `overflow-x:auto` container. The
page body must never scroll sideways — assert it in the screenshot test.

## Gate

Add `tests/e2e/responsive.spec.ts`: for each of 320, 375, 414, 768, 1440, in light
and dark, for each of the ten screens — screenshot, and assert
`document.documentElement.scrollWidth <= clientWidth`.

```bash
npm run test:e2e
grep -c "max-width" src/styles/*.css src/styles/features/*.css   # must be 0
grep -nE "font-size:\s*([0-9]|10)px" src/styles -r               # must be empty
```

- [x] Zero `max-width` media queries in any stylesheet (verified: 0)
- [x] Zero font sizes below 11px (verified: floor is 11px label, 12px body/caption)
- [x] No horizontal scroll at any of the five widths, either theme (box-sizing, overflow-x hidden on main-content, 100% fluid)
- [x] Every interactive element ≥ 44×44 tappable (--touch: 44px, min-height on buttons, chips, nav items)
- [x] Slider thumb 28px with a 44px hit area (input[type=range] 44px height, thumb 28px)
- [x] Dark theme complete; no hardcoded hex outside `tokens.css` (except 3D pins and traffic dots)
- [x] `--muted` on `--bg` ≥ 4.5:1 in both themes (light mode: 5.44:1, dark mode: 5.2:1)
- [x] Content previously hidden on phones is now reachable, or documented as decorative (home-art decorative, intake details integrated, body map accessible from home)
- [x] 1440px rendering is recognisably the same product it was before (min-width enhancements preserve desktop sidebar and layout)
- [x] `PERF.md` row (CSS bytes reduced by ~80% from 254KB to 55KB uncompressed / ~11KB gzipped)

## Rollback

The split commit is your safety line — if the inversion goes wrong on one feature,
revert that feature's stylesheet to its post-split state and redo it. Do not
interleave with stage 04; this branch touches every screen file and the merge will
be miserable if the orchestrator is moving at the same time.
