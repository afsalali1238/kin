# Stage 02 — Asset and runtime performance

**Est** 2 days · **Branch** `stage/02-performance` · **Depends on** 01
**Gate** Lighthouse mobile ≥ 92, LCP < 2.0 s, 3D payload < 300 KB, first-load JS < 200 KB.
**Moves** Mobile performance 3.5 → 9

## Objective

Make the app fast on a Moto G on Slow 4G. Four separate problems, in descending
order of cost.

## Tasks

### 1. Kill the mini viewers — biggest single win

`LazyBodyViewer` with `mini` is mounted on three screens:

- `src/features/home/HomeScreen.tsx` — the hero body
- `src/features/progress/ProgressScreen.tsx` — the pain map card
- `src/features/session/SessionPlayer.tsx` — `.target-mini`

Each one is a full `<Canvas>` from `BodyViewer.tsx`: shadows on, three directional
lights plus ambient plus hemisphere, `ContactShadows`, and a breathing loop that
calls `invalidate()` at 24 Hz forever. On the session screen that runs next to a
ticking timer. Three WebGL contexts, three shadow maps, continuous repaint,
on a phone, during a rehab session.

**Replace with a build-time sprite.** Add `scripts/build-body-sprites.mjs`:

- boot headless three (the repo already runs headless WebGL in CI via SwiftShader —
  see `playwright.config.ts` launch args, and `scripts/asset-check.mjs` for the
  GLTFLoader-without-a-browser pattern)
- for each of the 31 regions in `src/data/regions.json`, and for front and back,
  render the highlighted body at 2× the display size
- write WebP to `public/body-sprites/<regionId>-<front|back>.webp`, plus a
  `none-front` / `none-back` pair for the unassessed state
- emit a manifest so a missing sprite is a build error, not a broken image

Then a tiny component:

```tsx
// src/components/body/BodySprite.tsx
export default function BodySprite({ region, back, alt }: { region: string; back?: boolean; alt?: string }) {
  const key = `${region || 'none'}-${back ? 'back' : 'front'}`;
  return <img src={`/body-sprites/${key}.webp?v=${ASSET_VERSION}`} alt={alt ?? ''} aria-hidden={!alt} width={220} height={440} loading="lazy" decoding="async" />;
}
```

Swap all three `mini` usages to `BodySprite`. Then **delete the `mini` prop from
`BodyViewer.tsx`** entirely so it cannot come back — the live canvas exists on the
body step only, and in `LazyBodyViewer` for that one screen.

Expected: ~31 × 2 sprites at roughly 8–14 KB each, of which a given screen loads
one. Two fewer GL contexts per screen and no background repaint.

Also delete the breathing `setInterval` path for any non-primary viewer (it becomes
dead code once `mini` is gone — confirm nothing else calls `invalidate` on a timer).

### 2. Compress the geometry and textures

Current `public/models/`:

| File | Now | Target | How |
|---|---|---|---|
| `male.glb` | 787 KB | ~150 KB | meshopt (`gltfpack -cc`) or Draco |
| `female.glb` | 787 KB | ~150 KB | same |
| `skin-normal.png` | 461 KB | ~80 KB | KTX2 / Basis, or a 1K WebP if quality holds |
| `body-regions.png` | 58 KB | keep PNG | **must stay lossless** — it is the picker mask |
| `skin-albedo.jpg` | 24 KB | fine | — |

Two hard constraints:

- **`body-regions.png` must never be lossily compressed.** `useRegionPicker.ts`
  samples it by exact colour to resolve which of the 31 regions was tapped. Lossy
  compression silently breaks tap accuracy — and `scripts/asset-check.mjs` already
  asserts all 31 region IDs are present with ≥95% UV coverage, so it will fail,
  but understand *why* before you try to "optimise" it.
- Add the matching loader (`MeshoptDecoder` or `DRACOLoader`) and make sure the
  decoder itself is lazily loaded with the viewer, not in the main bundle.

Extend `scripts/asset-check.mjs` with size ceilings so this cannot regress, and run
it in CI (`npm run check:assets`).

Bump `ASSET_VERSION` — bytes changed.

### 3. Self-host the fonts

`src/app/globals.css` line 1:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:…&family=Manrope:…&display=swap');
```

A CSS `@import` of a remote stylesheet is a chained, render-blocking request: the
browser must fetch and parse `globals.css` before it even discovers the font
request. On Slow 4G that is a visible second of unstyled text.

Move to `next/font/google` in `layout.tsx`, expose the CSS variables, and point the
existing `--font-sans` token at them:

```ts
import { DM_Sans, Manrope } from 'next/font/google';
const sans = DM_Sans({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-dm', display: 'swap' });
const display = Manrope({ subsets: ['latin'], weight: ['500','600','700'], variable: '--font-manrope', display: 'swap' });
```

Drop the weights nothing uses — the current import requests seven weights of DM
Sans (400, 450, 500, 550, 600, 650, 700) and eight of Manrope. Grep the stylesheet
for `font-weight` and request only what is actually set.

Stage 07 adds the Arabic face alongside these; leave room for a third variable.

### 4. Trim the icon barrel

`lucide-react` is imported by name across every screen. Add to `next.config.ts`:

```ts
experimental: { optimizePackageImports: ['lucide-react'] }
```

Verify in the build output that the per-route JS drops.

### 5. Budgets in CI

Add to `.github/workflows/ci.yml` after `build`:

- `npm run check:assets` (now with size ceilings)
- a Lighthouse CI run asserting performance ≥ 92 and LCP < 2000 ms on mobile
- a first-load-JS assertion — parse `next build` output, fail over 200 KB

A budget that is not enforced in CI is a suggestion.

## Gate

```bash
npm run build && npm run start -- --port 3100
npm run check:assets
# Lighthouse mobile with docs/PERF.md throttle settings
```

- [ ] Lighthouse mobile performance ≥ 92
- [ ] LCP < 2.0 s on the Moto G profile
- [ ] First-load JS < 200 KB gzipped
- [ ] Total 3D payload < 300 KB; repeat visit still 0 bytes
- [ ] Exactly one `<canvas>` in the DOM on the body step, zero on every other screen
- [ ] `mini` prop no longer exists in `BodyViewer.tsx`
- [ ] Region tapping still resolves correctly for all 31 regions (`npm run check:assets`)
- [ ] `PERF.md` row appended with all five numbers

## Rollback

Sprites are additive — if a sprite looks wrong, the fix is the render script, not
reinstating a canvas. Geometry compression is the one place to be careful: keep the
uncompressed GLBs in git history and verify `check:assets` passes (single indexed
skin primitive, ≥20k triangles, feet at Y=0, crown ~1.8 m) before deleting anything.
