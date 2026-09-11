import { describe, expect, it } from 'vitest';
import { defaultIntake } from './clinical';
import { initialRecovery } from './app-types';
import { migrateRecovery } from './recovery-storage';

const pin = { id: 'p1', regionId: 'lower-back', point: [0, 0.5, 0] as [number, number, number], intensity: 6 };

describe('migrateRecovery — persisted schema upgrades', () => {
  it('collapses a legacy multi-pin save to a single pin (v1 → v2)', () => {
    const legacy = { ...initialRecovery, pins: [pin, { ...pin, id: 'p2' }, { ...pin, id: 'p3' }] };
    const migrated = migrateRecovery(legacy);
    expect(migrated.pins).toHaveLength(1);
    expect(migrated.pins[0].id).toBe('p1');
  });

  it('keeps a valid single-pin save intact', () => {
    const valid = {
      ...initialRecovery,
      region: 'neck',
      pins: [pin],
      goal: 'Keep up with my family',
      presentationId: 'neck-tension',
      phase: 2,
      assessed: true,
      logs: [{ date: '2026-01-01T00:00:00.000Z', pain: 4, feeling: 'right', session: true, phase: 1, settled: true, morningWorse: false }],
      swaps: { 'neck-1': 'neck-1-supported' },
    };
    expect(migrateRecovery(valid)).toEqual(valid);
  });

  it('drops junk and fills missing pieces from defaults', () => {
    expect(migrateRecovery(null)).toEqual(initialRecovery);
    expect(migrateRecovery('not an object')).toEqual(initialRecovery);
    expect(migrateRecovery({ pins: 'nope', region: 42, phase: 99, unexpected: 'x' })).toEqual(initialRecovery);
    expect(migrateRecovery({})).toEqual(initialRecovery);
  });

  it('drops malformed pins but keeps the rest of the save', () => {
    const migrated = migrateRecovery({ region: 'knee-left', pins: [{ bogus: true }, pin] });
    expect(migrated.region).toBe('knee-left');
    expect(migrated.pins).toEqual([pin]);
  });

  it('fills partial intake answers from defaults', () => {
    const migrated = migrateRecovery({ intake: { pain: 8 } });
    expect(migrated.intake.pain).toBe(8);
    expect(migrated.intake.irritability).toBe(defaultIntake.irritability);
    expect(migrated.intake.aggravators).toEqual([]);
  });
});
