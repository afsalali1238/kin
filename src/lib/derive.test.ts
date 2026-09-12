import { describe, expect, it } from 'vitest';
import { deriveJourney } from './derive';
import { initialRecovery } from './app-types';
import { defaultIntake, type CheckIn } from './clinical';
import demo from '@/data/demo.json';

const base = { ...initialRecovery };
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const sessionLog = (n: number): CheckIn => ({ date: daysAgo(n), pain: 4, feeling: 'right', session: true, phase: 1, settled: true, morningWorse: false });
const dailyLog = (n: number): CheckIn => ({ date: daysAgo(n), pain: 3, feeling: 'same', session: false, phase: 1 });

describe('deriveJourney — fallbacks before any data exists', () => {
  it('falls back to the lower-back group when no region is selected', () => {
    const j = deriveJourney(base, 1, []);
    expect(j.region).toBeUndefined();
    expect(j.group).toBe('lower-back');
  });

  it('shows the clearly-labelled demo journey until the first real log', () => {
    const j = deriveJourney(base, 1, []);
    expect(j.real).toBe(false);
    expect(j.painValues).toEqual(demo.pain);
    expect(j.dailyDone).toBe(false);
  });

  it('prefers the persisted presentation over the recomputed top match', () => {
    expect(deriveJourney({ ...base, region: 'neck', presentationId: 'neck-postural' }, 1, []).currentPresentation.id).toBe('neck-postural');
  });
});

describe('deriveJourney — engagement signals', () => {
  it('counts consecutive session days as a streak, today inclusive', () => {
    expect(deriveJourney({ ...base, logs: [sessionLog(2), sessionLog(1), sessionLog(0)] }, 1, []).streak).toBe(3);
  });

  it('retains the active streak when the last session was yesterday, awaiting today', () => {
    // 3 consecutive days ending yesterday -> streak = 3 (active)
    expect(deriveJourney({ ...base, logs: [sessionLog(3), sessionLog(2), sessionLog(1)] }, 1, []).streak).toBe(3);
    // single session yesterday -> streak = 1
    expect(deriveJourney({ ...base, logs: [sessionLog(1)] }, 1, []).streak).toBe(1);
  });

  it('breaks the streak when more than 1 day was missed', () => {
    // Last session was 2 days ago -> streak resets to 0
    expect(deriveJourney({ ...base, logs: [sessionLog(2)] }, 1, []).streak).toBe(0);
    // Gap in consecutive days ending today
    expect(deriveJourney({ ...base, logs: [sessionLog(3), sessionLog(1), sessionLog(0)] }, 1, []).streak).toBe(2);
  });

  it('marks the daily check-in done for today only', () => {
    expect(deriveJourney({ ...base, logs: [dailyLog(0)] }, 1, []).dailyDone).toBe(true);
    expect(deriveJourney({ ...base, logs: [dailyLog(1)] }, 1, []).dailyDone).toBe(false);
  });
});

describe('deriveJourney — match reranking stays wired through', () => {
  it('surfaces a different top match after a rejection', () => {
    const state = { ...base, intake: { ...defaultIntake, aggravators: ['sitting', 'bending'], easers: ['arching'] } };
    const first = deriveJourney(state, 1, []).top.id;
    expect(deriveJourney(state, 1, [first]).top.id).not.toBe(first);
  });
});
