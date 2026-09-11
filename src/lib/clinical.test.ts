import { describe, expect, it } from 'vitest';
import {
  defaultIntake,
  exercises,
  makeProgramme,
  match,
  progression,
  redFlags,
  traffic,
  variant,
  type CheckIn,
} from './clinical';

const high = { ...defaultIntake, irritability: 'high' as const };
const low = { ...defaultIntake, irritability: 'low' as const };
const sessionSecondsOf = (e: (typeof exercises)[number]) =>
  e.sets * (e.holdSeconds || e.reps * (e.type === 'mobility' ? 3 : 4)) + Math.max(0, e.sets - 1) * e.restSeconds;

describe('makeProgramme — dosing rules', () => {
  it('splits the plan by irritability: high stays gentle, low loads earlier', () => {
    const highPlan = makeProgramme('shoulder', high, 'rotator-cuff', 1);
    const lowPlan = makeProgramme('shoulder', low, 'rotator-cuff', 1);
    expect(highPlan).toHaveLength(4);
    expect(lowPlan).toHaveLength(4);
    expect(highPlan.map((x) => x.id)).not.toEqual(lowPlan.map((x) => x.id));
    expect(highPlan.every((e) => e.phase === 1)).toBe(true);
    expect(highPlan.every((e) => e.sets === 1)).toBe(true);
    expect(lowPlan.every((e) => e.phase === 2)).toBe(true);
  });

  it('never lets frozen-shoulder receive strengthening phases, whatever the user picks', () => {
    for (const intake of [high, low, defaultIntake]) {
      for (const phase of [1, 2, 3]) {
        const frozen = makeProgramme('shoulder', intake, 'frozen-shoulder', phase);
        expect(frozen).toHaveLength(4);
        expect(frozen.every((e) => e.phase === 1)).toBe(true);
      }
    }
  });

  it('excludes exercises contraindicated for the presentation', () => {
    const plan = makeProgramme('lower-back', defaultIntake, 'back-flexion', 2);
    expect(plan.length).toBeGreaterThan(0);
    expect(plan.every((e) => !e.contraindicatedFor.includes('back-flexion'))).toBe(true);
  });

  it('keeps a high-irritability session within the 7-minute budget', () => {
    const plan = makeProgramme('shoulder', high, 'rotator-cuff', 1);
    expect(plan.reduce((s, e) => s + sessionSecondsOf(e), 0)).toBeLessThanOrEqual(420);
  });
});

describe('match — transparent pattern scoring', () => {
  it('matches a directional-preference back pattern', () => {
    expect(match('lower-back', { ...defaultIntake, aggravators: ['sitting', 'bending'], easers: ['arching'] })[0].id).toBe('back-extension');
  });

  it('weights multi-directional stiffness as a frozen-shoulder pattern', () => {
    expect(match('shoulder', { ...defaultIntake, aggravators: ['stiff-all', 'dressing'] })[0].id).toBe('frozen-shoulder');
  });

  it('demotes a rejected pattern so the user can say “that’s not me”', () => {
    const intake = { ...defaultIntake, aggravators: ['sitting', 'bending'], easers: ['arching'] };
    const first = match('lower-back', intake)[0];
    expect(match('lower-back', intake, [first.id])[0].id).not.toBe(first.id);
  });

  it('returns scores sorted with confidence labels on every entry', () => {
    const results = match('neck', defaultIntake);
    expect(results.length).toBeGreaterThan(1);
    for (let i = 1; i < results.length; i++) expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    expect(results.every((r) => typeof r.confidence === 'string' && r.confidence.length > 0)).toBe(true);
  });
});

describe('redFlags — safety screening', () => {
  it('treats bladder/saddle/both-legs answers as urgent', () => {
    expect(redFlags({ ...high, details: ['bladder'] }, 'lower-back')?.level).toBe('urgent');
    expect(redFlags({ ...high, details: ['saddle'] }, 'lower-back')?.level).toBe('urgent');
    expect(redFlags({ ...high, details: ['both-legs'] }, 'lower-back')?.level).toBe('urgent');
  });

  it('gives chest pain its emergency message', () => {
    expect(redFlags({ ...high, details: ['chest'] }, 'neck')?.message).toMatch(/emergency/);
  });

  it('keeps night-waking pain at review level, not urgent', () => {
    expect(redFlags({ ...high, pattern: 'night' }, 'neck')?.level).toBe('review');
  });

  it('returns null for a clean history', () => {
    expect(redFlags(defaultIntake, 'knee')).toBeNull();
  });
});

describe('progression — earned, not scheduled', () => {
  const buildLogs = (count: number): CheckIn[] =>
    Array.from({ length: count }, (_, i) => ({
      date: new Date(2026, 0, i + 1).toISOString(),
      pain: 6 - i * 0.5,
      feeling: 'right',
      session: true,
      phase: 1,
      settled: true,
      morningWorse: false,
    }));

  it('advances only when adherence, trend, feel and recovery all agree', () => {
    expect(progression(buildLogs(7), 1).action).toBe('advance');
    expect(progression(buildLogs(7), 1).eligible).toBe(true);
    expect(progression(buildLogs(6), 1).action).toBe('hold');
  });

  it('holds while the next-day response is unknown', () => {
    const uncertain = buildLogs(7).map((e) => ({ ...e, settled: undefined, morningWorse: undefined }));
    expect(progression(uncertain, 1).action).toBe('hold');
  });

  it('regresses on a rising pain trend', () => {
    const rising = buildLogs(7).map((e, i) => ({ ...e, pain: i + 1 }));
    expect(progression(rising, 1).action).toBe('regress');
  });

  it('handles an empty logbook without crashing', () => {
    const p = progression([], 1);
    expect(p.action).toBe('hold');
    expect(p.adherence).toBe(0);
  });
});

describe('traffic — the 4/10 rule', () => {
  it('is red above 4/10 or when symptoms do not settle', () => {
    expect(traffic(5)).toBe('red');
    expect(traffic(3, false, false)).toBe('red');
    expect(traffic(3, true, true)).toBe('red');
  });
  it('is amber while the next-day response is unknown', () => {
    expect(traffic(3)).toBe('amber');
  });
  it('is green only with known, settled, not-worse responses', () => {
    expect(traffic(3, true, false)).toBe('green');
  });
});

describe('variant — easier/harder swaps', () => {
  it('swaps to a distinct, non-contraindicated exercise', () => {
    const highPlan = makeProgramme('shoulder', high, 'rotator-cuff', 1);
    const next = variant(highPlan[0], 'easier', 'rotator-cuff');
    expect(next.id).not.toBe(highPlan[0].id);
    expect(next.contraindicatedFor.includes('rotator-cuff')).toBe(false);
  });

  it('falls back to a reduced dose of the same exercise when no variant is mapped', () => {
    const base = { ...exercises[0], easierVariantId: 'no-such-exercise' };
    const fallback = variant(base, 'easier', base.presentationIds[0]);
    expect(fallback.id).toBe(base.id);
    expect(fallback.sets).toBe(1);
    expect(fallback.reps).toBeLessThanOrEqual(base.reps);
  });
});
