#!/usr/bin/env node
// Browser-free regression check for the per-exercise movement illustrations.
// Validates the exact module the app renders (src/lib/illustrations.ts)
// against every exercise in src/data/exercises.json:
//
//   1. every exercise maps onto one of the 10 pose archetypes
//   2. the illustration's position matches the exercise's positionRequired
//   3. exactly FRAME_COUNT frames, all coordinates finite
//   4. the 10 pose variants are pairwise distinct
//   5. limb segment lengths stay constant across frames (±2px)
//   6. equipment-driven props are present (chair / wall / band / weight)
//   7. the movement arc actually travels (≥12px dynamic, ≥1.5px held)
//   8. figureSvg / figurePairSvg emit complete, labelled SVG markup
//
// Run: npm run check:illustrations
//   (node --experimental-strip-types scripts/illustration-check.mjs)
import fs from 'node:fs';
import { illustrationFor, figureSvg, figurePairSvg, ARCHETYPES, FRAME_COUNT } from '../src/lib/illustrations.ts';

const exercises = JSON.parse(fs.readFileSync(new URL('../src/data/exercises.json', import.meta.url), 'utf8'));
const archPositions = Object.fromEntries(ARCHETYPES.map(a => [a.key, a.position]));

let failures = 0;
let passes = 0;
const fail = (id, msg) => { console.log(`FAIL  ${id}  — ${msg}`); failures++; };

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const joints = sk => [sk.head, sk.neck, sk.pelvis, sk.elbowF, sk.handF, sk.kneeF, sk.footF, sk.elbowN, sk.handN, sk.kneeN, sk.footN];
const chains = sk => [
  ['thigh-near', sk.pelvis, sk.kneeN], ['shin-near', sk.kneeN, sk.footN],
  ['thigh-far', sk.pelvis, sk.kneeF], ['shin-far', sk.kneeF, sk.footF],
  ['upperarm-near', sk.neck, sk.elbowN], ['forearm-near', sk.elbowN, sk.handN],
  ['upperarm-far', sk.neck, sk.elbowF], ['forearm-far', sk.elbowF, sk.handF],
];

for (const e of exercises) {
  let ok = true;
  const note = msg => { if (ok) { fail(e.id, msg); ok = false; } };

  let spec;
  try {
    spec = illustrationFor(e);
  } catch (err) {
    note('threw: ' + err.message);
    continue;
  }
  const tag = `[${e.name} · ${spec.variant}]`;

  if (!archPositions[spec.key]) note(`unknown archetype ${spec.key}`);
  if (archPositions[spec.key] !== spec.position) note(`archetype/position mismatch on ${spec.key}`);
  if (spec.position !== e.positionRequired) note(`position ${spec.position} != required ${e.positionRequired}`);
  if (spec.frames.length !== FRAME_COUNT) note(`frame count ${spec.frames.length}`);

  // 3. finite coordinates
  for (const [i, sk] of spec.frames.entries()) {
    for (const j of joints(sk)) {
      if (!Number.isFinite(j.x) || !Number.isFinite(j.y)) { note(`frame ${i} has non-finite coordinates`); break; }
    }
  }

  // 4. pairwise-distinct poses
  outer:
  for (let i = 0; i < FRAME_COUNT; i++) {
    for (let k = i + 1; k < FRAME_COUNT; k++) {
      const A = joints(spec.frames[i]), B = joints(spec.frames[k]);
      let d = 0;
      for (let n = 0; n < A.length; n++) d = Math.max(d, dist(A[n], B[n]));
      if (d < 0.5) { note(`frames ${i} and ${k} are the same pose`); break outer; }
    }
  }

  // 5. constant limb lengths across frames
  const base = chains(spec.frames[0]).map(([name, a, b]) => [name, dist(a, b)]);
  for (let i = 1; i < FRAME_COUNT; i++) {
    const cs = chains(spec.frames[i]);
    for (const [n, [name, l0]] of base.entries()) {
      if (Math.abs(dist(cs[n][1], cs[n][2]) - l0) > 2) { note(`${name} stretches in frame ${i}`); break; }
    }
  }

  // 6. equipment props
  for (const p of ['chair', 'wall', 'band', 'weight']) {
    if (e.equipment === p && !spec.props.includes(p)) note(`missing ${p} prop`);
  }

  // 7. motion travel
  const a = spec.frames[0][spec.moving], b = spec.frames[FRAME_COUNT - 1][spec.moving];
  const travel = dist(a, b);
  if (spec.isHold ? travel < 1.5 : travel < 12) note(`insufficient motion travel (${travel.toFixed(1)}px)`);

  // 8. SVG emission
  const svg = figureSvg(e, 0);
  if (!svg.startsWith('<svg') || !svg.includes('role="img"') || !svg.includes('aria-label=')) note('figureSvg malformed');
  if ((svg.match(/<g class="fig-frame/g) || []).length !== FRAME_COUNT) note('figureSvg missing frames');
  if (!svg.includes('fig-frame on')) note('figureSvg missing active frame');
  const pair = figurePairSvg(e);
  if (!pair.startsWith('<svg') || !pair.includes('k-figure-pair')) note('figurePairSvg malformed');

  if (ok) passes++;
}

console.log(`\n${passes}/${exercises.length} exercises pass all illustration checks` +
  (failures ? ` (${failures} failure${failures > 1 ? 's' : ''})` : ' — ALL PASS'));
process.exit(failures ? 1 : 0);
