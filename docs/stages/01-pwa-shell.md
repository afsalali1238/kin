# Stage 01 — PWA shell

**Est** 2 days · **Branch** `stage/01-pwa-shell` · **Depends on** 00
**Gate** Airplane mode, cold load from the home-screen icon, complete a session.
**Moves** Install / offline 3.0 → 9

## Objective

Make the offline claim true and the app installable. Today `README.md` says
"Resilient Offline-First Sync" and what exists is `localStorage` plus an offline
banner — state resilience, not offline capability. With no network the app does not
load at all.

Evidence: no `manifest`, no service worker, no icon files anywhere in the repo
(`git ls-files | grep -iE "manifest|service-worker|icon"` returns only
`IconButton.tsx`).

## Tasks

### 1. Manifest and icons

Create `src/app/manifest.ts` (Next's typed route, not a static file — it picks up
the metadata base automatically):

```ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'kinē — physiotherapy & rehabilitation',
    short_name: 'kinē',
    description: 'Understand your pain and follow a plan that fits your day.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f7f8f3',
    theme_color: '#f7f8f3',
    lang: 'en',
    dir: 'auto',
    categories: ['health', 'medical', 'fitness'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
```

Assets to add under `public/icons/`: `icon-192.png`, `icon-512.png`,
`maskable-512.png` (keep the mark inside the inner 80% safe zone — the brand mark
is the four-bar glyph in `KinesioApp.tsx`'s `.brand-mark`), `apple-touch-icon.png`
at 180×180.

In `src/app/layout.tsx`, extend the existing `metadata` and `viewport`:

```ts
export const metadata: Metadata = {
  // …existing title/description…
  applicationName: 'kinē',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'kinē' },
  icons: { apple: '/icons/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8f3' },
    { media: '(prefers-color-scheme: dark)',  color: '#121714' },
  ],
};
```

The dark `themeColor` is forward-looking — stage 03 adds the dark theme it matches.

### 2. Service worker

Use Serwist (the maintained successor to next-pwa; works with App Router and
Turbopack builds).

```bash
npm i @serwist/next serwist
```

`src/app/sw.ts`:

```ts
import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 3D assets and textures: immutable, versioned by ?v=ASSET_VERSION
    {
      matcher: ({ url }) => url.pathname.startsWith('/models/'),
      handler: { /* CacheFirst, 1 year, cacheName: 'kine-models-v1' */ },
    },
    // clinical content JSON is bundled, not fetched — nothing to do
    // recovery sync: network-first with a background-sync queue
    {
      matcher: ({ url }) => url.pathname === '/api/recovery',
      handler: { /* NetworkOnly + BackgroundSyncPlugin queue 'kine-recovery' */ },
    },
    ...defaultCache,
  ],
  fallbacks: { entries: [{ url: '/offline', matcher: ({ request }) => request.mode === 'navigate' }] },
});

serwist.addEventListeners();
```

Wire it in `next.config.ts` with `withSerwist({ swSrc: 'src/app/sw.ts', swDest: 'public/sw.js' })`.

**Precache list must include**: the app shell, both GLBs, all three textures, and
the region mask. `src/data/*.json` is imported at build time and ends up in the JS
bundle, so it is covered by the shell precache — do not add it separately.

Add `/offline/page.tsx` — a calm page that says the plan is saved on this device
and will sync when they are back, in both languages, matching the offline banner
copy already in `KinesioApp.tsx`.

### 3. Background sync for logged sessions

This is the part that makes offline real rather than cosmetic. A session completed
on the metro should reach Postgres when the user surfaces. The
`BackgroundSyncPlugin` queue replays the `PUT /api/recovery` request; stage 05 adds
the `updatedAt` guard that makes a replayed write safe to accept.

### 4. Fix the cache headers

In `next.config.ts`, replace the current block:

```ts
// BEFORE — re-downloads 2.11 MB on every single visit
headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' }]

// AFTER
headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
```

The comment in that file explains `no-store` was added because a stale cached
placeholder GLB rendered a broken body. That problem is already solved properly:
`src/components/body/assetVersion.ts` exports `ASSET_VERSION` and every asset URL
in `BodyViewer.tsx` carries `?v=${ASSET_VERSION}`. Changing bytes means bumping
that constant, which changes the URL, which busts the cache. Keep that discipline —
it is rule 7 in `CLAUDE.md`.

### 5. Install prompt with manners

```ts
// src/hooks/useInstallPrompt.ts — capture, don't call
// window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); stash(e) })
```

Surface it **only after the first completed session** (`state.logs.some(l => l.session)`),
as a dismissible card on `HomeScreen`, remembering dismissal in `localStorage`
under `kinesio-install-dismissed`. Asking before the user has any reason to want
the app on their home screen wastes the one prompt you get.

On iOS Safari `beforeinstallprompt` does not exist. Detect standalone
(`navigator.standalone`) and, if not installed, show a one-time Share-sheet hint
instead. Say what it gets them: reminders and offline use.

## Gate

```bash
npm run build && npm run start -- --port 3100
# DevTools → Application → Manifest: no errors, installable
# DevTools → Application → Service Workers: activated
# Install to home screen, then: DevTools → Network → Offline, hard reload
```

- [ ] Lighthouse "Installable" passes; no manifest warnings
- [ ] Airplane mode + cold launch from the home-screen icon reaches the body step
- [ ] Full journey completes offline: pin → 7 questions → result → goal → session
- [ ] A session logged offline appears in Postgres after reconnecting
- [ ] Repeat-visit 3D payload is **0 bytes** (was ~2.11 MB) — record in `PERF.md`
- [ ] Bumping `ASSET_VERSION` visibly re-fetches the models
- [ ] Install card appears only after a completed session; dismissal sticks
- [ ] iOS: Share-sheet hint shown once, not on every launch

## Rollback

The service worker is the only risky piece — a bad SW can stick. Ship with
`skipWaiting` and `clientsClaim` (as above) so a new deploy always wins, and keep a
kill switch: an SW that on activation checks a `/api/health` flag and
`registration.unregister()`s itself if told to. Test the kill switch before you need
it.
