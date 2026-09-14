# Stage 05 — Close the sync loop

**Est** 1.5 days · **Branch** `stage/05-sync` · **Depends on** 01
**Gate** Two browser profiles converge on one journey; a 429 holds across instances; an offline-logged session lands in Postgres.
**Moves** API & data hardening 8.0 → 9

## Objective

Make the sync that already exists actually work, and make a lost browser survivable.

## The defects

**1. `GET /api/recovery` is dead code.** `src/app/api/recovery/route.ts` implements
a perfectly good GET handler with id validation and rate limiting. `useRecovery`
never calls it — it only PUTs on a 900 ms debounce. So state flows one way and
`README.md`'s "seamless cloud sync to PostgreSQL" / sync-across-devices framing is
not true. Either implement it or stop claiming it; this stage implements it.

**2. A cleared browser is a lost journey.** The anonymous id lives only in
`localStorage` under `kinesio-id`. `DECISIONS.md` names this honestly ("Losing both
local storage and the random identifier means there is no account-based recovery"),
but a rehab journey is weeks long and phones get replaced. The id is already an
unguessable UUID — it just needs to be showable and enterable.

**3. Rate limiting enforces nothing on serverless.** `src/lib/rate-limit.ts` is
in-memory per process. The file says so. On Vercel each lambda instance has its own
window, so the real limit is 30 writes/minute × instance count.

**4. Replayed offline writes can clobber newer state.** Stage 01 added a
background-sync queue. Without a version guard, a request queued an hour ago can
overwrite what the user did since on another device.

## Tasks

### 1. Read on mount, resolve conflicts honestly

In `src/hooks/useRecovery.ts`, after the localStorage load and before enabling
writes:

```ts
// 1. load local (existing code) → gives us localUpdatedAt
// 2. if online, GET /api/recovery?id=… → remote state + remoteUpdatedAt
// 3. reconcile
```

Add `updatedAt: string` to the persisted `Recovery` (schema v4 — bump
`RECOVERY_SCHEMA_VERSION`, extend `migrateRecovery` to default it to the epoch, add
the test). Set it on every `update()`.

Reconciliation rules, in order:

- No remote → keep local, push it.
- No local (fresh browser, id entered by hand) → take remote.
- `remote.updatedAt > local.updatedAt` **and** local has no `activeSession` and no
  logs newer than remote → take remote silently.
- Otherwise → **surface it.** A one-time card: "This plan looks further along on
  another device. Use that one, or keep what's on this phone?" Never silently discard
  a completed session. Two logs merging is not a conflict — union them by `date` and
  de-duplicate; that is the common case and should need no prompt.

Guard the write path so the debounced PUT cannot fire before reconciliation
completes, or the first PUT will overwrite the remote with the fresh local default.
This is the one real hazard in this stage.

### 2. Send and enforce `updatedAt`

- Add `updatedAt` to `recoveryStateSchema` in `src/lib/recovery-schema.ts`
  (`bounded(40)`, same as `CheckIn.date`).
- In the PUT handler, read the existing row and reject with **409** when the
  incoming `updatedAt` is older than the stored one, returning the stored state so
  the client can reconcile rather than guess.
- `recovery_states.updatedAt` already exists in `src/db/schema.ts` and is set by
  `onConflictDoUpdate` — keep that as the server's own record, and compare against
  the state's own `updatedAt` field so a replayed request is judged by when the user
  acted, not when the packet arrived.

This is what makes the stage-01 background-sync queue safe.

### 3. Transfer code

A settings sheet (built properly in stage 08 — a minimal version here is fine):

- show the recovery id, formatted in groups for readability, with copy-to-clipboard
- a QR code rendered client-side into the existing canvas-free stack (a small
  inline QR generator, not a CDN image — the app must work offline)
- "I have a code" → validate against `RECOVERY_ID_PATTERN`, GET that id, and on
  success replace local state and write the id to `kinesio-id`
- warn before replacing: this device's current journey will be replaced

Copy matters here. This is not an account; say so. "Your plan is saved on this
device. This code lets you move it to another one — keep it somewhere safe."

### 4. Shared rate limiting

Move the limiter to Vercel KV or Upstash Redis, keeping the exact key shape from
`clientKey()` (`ip:id`) and the current limits (30 writes, 60 reads per minute).

Keep `createRateLimiter` and its tests: use the in-memory implementation as the
fallback when `KV_REST_API_URL` is absent, so local dev and CI need no external
service. The function stays a pure `(key, now) => boolean` so
`rate-limit.test.ts` keeps working.

### 5. Honest README

Update the sync bullet to describe what now happens: local-first, syncs when online,
moves between devices with a transfer code, no account.

## Gate

```bash
npm test
npm run test:e2e
```

- [ ] Fresh browser + entered transfer code restores the full journey
- [ ] Two profiles on one id converge; logs union without loss
- [ ] A stale PUT gets 409 and the client reconciles instead of overwriting
- [ ] Offline-logged session reaches Postgres after reconnect (stage 01 queue)
- [ ] 429 holds across two server instances (or KV fallback documented)
- [ ] First PUT after mount cannot overwrite remote with a default state — test this
      explicitly, it is the easiest thing to get wrong here
- [ ] `README.md` sync claims match behaviour

## Rollback

Schema v4 is additive. The 409 path is the only behaviour change the client must
handle — ship the client's reconciliation before the server starts rejecting, or a
deploy gap will surface as failed saves.

## Known gap, still open after this stage

Authentication. The anonymous UUID is a bearer token: anyone who has it can read and
write that journey. `DECISIONS.md` already records this. The mitigations are that it
is unguessable, rate-limited, and never displayed except deliberately in the
transfer sheet. If this app ever carries identifiable data, that changes — and that
is a bigger conversation than this stage.
