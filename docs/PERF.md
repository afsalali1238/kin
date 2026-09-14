# Performance and quality log

One row per stage gate. Never edit a past row — append.

**How to measure (use the same method every time, or the rows mean nothing):**

```bash
npm run build && npm run start -- --port 3100
# Chrome DevTools → Lighthouse → Mobile, "Slow 4G" + 4x CPU throttle
# or:
npx lighthouse http://127.0.0.1:3100 --preset=desktop=false \
  --throttling-method=simulate --output=json --output-path=./lh.json
```

- **Device profile**: Moto G Power class — 4x CPU slowdown, Slow 4G (1.6 Mbps
  down, 150 ms RTT). This is the floor we design for, not a worst case.
- **First-load JS**: from `next build` output, the First Load JS figure for `/`.
- **3D payload**: sum of the bytes in `public/models/` actually requested on the
  body step.
- Always run against a production build. `next dev` numbers are meaningless.

| Date | Stage | Gate | LH mobile | LCP | First-load JS | 3D payload | axe | Notes |
|---|---|---|---|---|---|---|---|---|
| | 00 | baseline | | | | ~2.11 MB | | fill this in first — everything else is measured against it |

Targets to beat by the end:

| Metric | Baseline (expected) | Target |
|---|---|---|
| Lighthouse mobile performance | 40–60 | ≥ 92 |
| LCP (Slow 4G, 4x CPU) | 4–7 s | < 2.0 s |
| First-load JS (gzipped) | ~300 KB+ | < 200 KB |
| 3D payload (transferred) | 2.11 MB every visit | < 300 KB, cached immutably |
| Repeat-visit 3D payload | 2.11 MB (`no-store`) | 0 bytes |
| axe violations, 10 screens | unknown | 0 |
| Installable | no | yes, Android + iOS |
| Usable offline, cold load | no | yes |
