# Stage 08 — Reminders, settings, data control

**Est** 2 days · **Branch** `stage/08-retention` · **Depends on** 01, 05
**Gate** A scheduled reminder fires on installed Android and installed iOS 16.4+; data deletion clears both local and remote.
**Moves** Install / offline 9 confirmed; the thing that makes adherence possible

## Objective

Give people a reason to come back, and a place to control their own data.

## Why this matters more than it looks

`DECISIONS.md` names adherence as *the* product priority — it is the stated reason
the 15-minute cap beats the brief's 20–30 minute guidance. And `deriveJourney`
computes a streak, `HomeScreen` renders it in a badge, `progression()` requires ≥70%
of a ten-session block to advance a phase.

But there is no notification, no reminder, and no re-entry surface of any kind. A
streak counter with no mechanism to remind you of the streak is a measurement, not a
habit loop. The product measures adherence and does nothing to support it.

There is also nowhere to change the language permanently, see your transfer code, set
a reminder, or delete your data — the sidebar bottom that held the help link and sync
status is `display:none` on phones today, and stage 03 explicitly deferred its
contents here.

## Tasks

### 1. Settings sheet

A bottom sheet reachable from a topbar icon on every screen, reusing the
`.localise-panel` sheet pattern from the body step (drag handle, `max-height`,
`env(safe-area-inset-bottom)`).

Contents:

- **Daily reminder** — on/off, time picker, and which days
- **Language** — EN / العربية (moves out of the topbar toggle, or stays in both)
- **Sound cues** — the existing `sound` state, currently only reachable inside a
  session
- **Your transfer code** — from stage 05: display, copy, QR, and "I have a code"
- **Install** — the stage-01 prompt, if still available and not installed
- **Your data** — what is stored, where, and a delete button
- **About** — version, `ASSET_VERSION`, a link to the printable handout, and the
  medical disclaimer text (stage 09 adds the first-run gate; this is the permanent
  home for the same copy)

### 2. Web push

```
src/app/api/push/subscribe/route.ts     POST   store subscription against the recovery id
src/app/api/push/unsubscribe/route.ts   POST
src/lib/push.ts                         VAPID keys from env, send helper
```

Schema: a `push_subscriptions` table keyed by the recovery id with the endpoint,
keys, timezone and reminder preferences. Same discipline as
`src/lib/recovery-schema.ts` — bounded zod validation, nothing unbounded reaching the
database.

The service worker from stage 01 gains `push` and `notificationclick` handlers.
`notificationclick` focuses an existing client if there is one rather than opening a
second tab.

**Ask at the right moment.** Never on load. Request permission from inside the
settings sheet, or once after a completed session with a card that says what they
get. A denied permission is permanent per origin — you get one ask.

### 3. A reminder that respects the dose

Do not hardcode one daily ping. `doseInfo` in `src/lib/clinical.ts` already describes
the intended rhythm:

| Irritability | `frequency` | Reminder shape |
|---|---|---|
| high | 2–3 short sessions daily | morning + evening, gentle wording |
| moderate | 1–2 sessions daily | one, at the chosen time |
| low | 3–4 sessions weekly | chosen days only |

Read it. Then three rules:

- **Never nag.** If today's session is already done (`deriveJourney().dailyDone` /
  a session log for today), skip the reminder entirely.
- **Never guilt.** Copy stays in the product's existing voice — "A little movement.
  A good day." not "You've missed 3 days." `HomeScreen` already sets this tone
  explicitly: "No catching up. No falling behind."
- **Urgent flags suppress reminders.** If `redFlags()` returns `urgent`, the plan is
  paused; do not send exercise reminders to someone who has been told to seek
  emergency assessment. This is a safety rule, not a nicety.

Scheduling: a cron route (Vercel Cron) running hourly that selects subscriptions
whose local reminder time falls in this hour and whose journey has no session logged
today. Store the timezone offset at subscribe time and refresh it on each app open.

### 4. Data control

- **Delete** — clears `localStorage` (`kinesio-recovery`, `kinesio-id`,
  `kinesio-language`, install-dismissed), unsubscribes push, `DELETE`s the Postgres
  row and the subscription, unregisters the service worker and clears its caches.
  Confirm first, plainly: "This removes your plan from this device and from our
  server. It cannot be undone."
- Add `DELETE /api/recovery` with the same id validation and rate limiting as the
  existing handlers.
- **Export** — the printable handout at `/handout` already exists and is linked from
  `ProgrammeScreen`. Add a "download my data as JSON" alongside delete. For a health
  app this is table stakes and it costs ten lines.

### 5. iOS, stated honestly

Web push on iOS requires the app to be installed to the home screen (16.4+). So the
stage-01 install prompt is not decoration — it is the precondition for reminders on
half the UAE market. In the settings sheet, if the user is on iOS Safari and not
installed, the reminder toggle should explain that rather than fail silently.

## Gate

```bash
npm run build && npm run start -- --port 3100
npm test
```

- [ ] Settings sheet reachable from every screen, keyboard accessible, axe clean
- [ ] Push permission requested only from settings or post-session, never on load
- [ ] Reminder fires on installed Android
- [ ] Reminder fires on installed iOS 16.4+; the toggle explains the requirement when not installed
- [ ] No reminder sent when today's session is already logged
- [ ] No reminder sent while an urgent red flag is active — test this explicitly
- [ ] High irritability produces two reminders, low irritability produces per-day ones
- [ ] Delete clears localStorage, Postgres row, push subscription, SW caches
- [ ] JSON export works offline
- [ ] Reminder copy reviewed against the app's existing voice

## Rollback

Push is additive and degrades to nothing. The one irreversible action is delete —
build and test it last, with the confirmation copy written before the button works.
