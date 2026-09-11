import { describe, expect, it } from 'vitest';
import { recoveryPayloadSchema, recoveryStateSchema } from './recovery-schema';
import { initialRecovery } from './app-types';

const validPayload = {
  id: 'a1b2c3d4-0000-4000-8000-abcdef012345',
  state: {
    ...initialRecovery,
    region: 'lower-back',
    pins: [{ id: 'p1', regionId: 'lower-back', point: [0.1, 0.5, 0.2], intensity: 6 }],
    goal: 'Get back to training',
    assessed: true,
    logs: [{ date: '2026-09-01T08:00:00.000Z', pain: 4, feeling: 'right', session: true, phase: 1, settled: true, morningWorse: false }],
    swaps: { 'lower-back-1': 'lower-back-1-supported' },
  },
};

describe('recoveryPayloadSchema — API input validation', () => {
  it('accepts a well-formed payload', () => {
    const result = recoveryPayloadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects a missing or malformed recovery id', () => {
    expect(recoveryPayloadSchema.safeParse({ ...validPayload, id: 'admin' }).success).toBe(false);
    expect(recoveryPayloadSchema.safeParse({ ...validPayload, id: "'; DROP TABLE--" }).success).toBe(false);
    expect(recoveryPayloadSchema.safeParse({ state: validPayload.state }).success).toBe(false);
  });

  it('rejects out-of-range clinical values', () => {
    const pain11 = { ...validPayload, state: { ...validPayload.state, intake: { ...validPayload.state.intake, pain: 11 } } };
    expect(recoveryPayloadSchema.safeParse(pain11).success).toBe(false);
    expect(recoveryPayloadSchema.safeParse({ ...validPayload, state: { ...validPayload.state, phase: 4 } }).success).toBe(false);
    expect(
      recoveryPayloadSchema.safeParse({ ...validPayload, state: { ...validPayload.state, intake: { ...validPayload.state.intake, irritability: 'extreme' } } }).success,
    ).toBe(false);
  });

  it('rejects unbounded payloads: too many pins or logs, oversized goal', () => {
    const pins = Array.from({ length: 5 }, (_, i) => ({ id: `p${i}`, regionId: 'neck', point: [0, 0, 0], intensity: 3 }));
    expect(recoveryPayloadSchema.safeParse({ ...validPayload, state: { ...validPayload.state, pins } }).success).toBe(false);
    expect(recoveryPayloadSchema.safeParse({ ...validPayload, state: { ...validPayload.state, goal: 'x'.repeat(301) } }).success).toBe(false);
    const logs = Array.from({ length: 366 }, () => validPayload.state.logs[0]);
    expect(recoveryPayloadSchema.safeParse({ ...validPayload, state: { ...validPayload.state, logs } }).success).toBe(false);
  });

  it('rejects non-finite or absurd 3D coordinates', () => {
    const nan = { ...validPayload, state: { ...validPayload.state, pins: [{ id: 'p', regionId: 'neck', point: [Number.NaN, 0, 0], intensity: 3 }] } };
    expect(recoveryPayloadSchema.safeParse(nan).success).toBe(false);
    const far = { ...validPayload, state: { ...validPayload.state, pins: [{ id: 'p', regionId: 'neck', point: [9999, 0, 0], intensity: 3 }] } };
    expect(recoveryPayloadSchema.safeParse(far).success).toBe(false);
  });

  it('strips unknown keys instead of rejecting forward-compatible clients', () => {
    const result = recoveryStateSchema.safeParse({ ...validPayload.state, futureField: { nested: true } });
    expect(result.success).toBe(true);
    if (result.success) expect('futureField' in result.data).toBe(false);
  });
});
