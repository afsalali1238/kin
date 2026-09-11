import { z } from 'zod';

/**
 * Bounded validation for the recovery payload accepted by `/api/recovery`.
 * This is health-adjacent data: nothing unbounded (strings, arrays, numbers)
 * is ever written to the database without limits.
 *
 * Unknown keys are stripped, so the client can add fields later without old
 * servers rejecting the save (they will simply not be persisted).
 */
export const RECOVERY_ID_PATTERN = /^[a-f0-9-]{36}$/;

const bounded = (max: number) => z.string().max(max);
const score0to10 = z.number().min(0).max(10);
const phase = z.number().int().min(1).max(3);
const coordinate = z.number().finite().min(-50).max(50);

const painPinSchema = z.object({
  id: bounded(64),
  regionId: bounded(64),
  point: z.tuple([coordinate, coordinate, coordinate]),
  intensity: score0to10,
});

const intakeSchema = z.object({
  pain: score0to10,
  best: score0to10,
  worst: score0to10,
  onset: bounded(32),
  duration: bounded(32),
  pattern: bounded(32),
  aggravators: z.array(bounded(48)).max(40),
  easers: z.array(bounded(48)).max(40),
  irritability: z.enum(['high', 'moderate', 'low']),
  neuro: bounded(32),
  details: z.array(bounded(48)).max(40),
});

const checkInSchema = z.object({
  date: bounded(40),
  pain: score0to10,
  feeling: bounded(24),
  session: z.boolean(),
  phase,
  settled: z.boolean().optional(),
  morningWorse: z.boolean().optional(),
});

export const recoveryStateSchema = z.object({
  region: bounded(64),
  pins: z.array(painPinSchema).max(4),
  intake: intakeSchema,
  goal: bounded(300),
  presentationId: bounded(64),
  phase,
  assessed: z.boolean(),
  logs: z.array(checkInSchema).max(365),
  swaps: z.record(bounded(64), bounded(64)),
});

export const recoveryPayloadSchema = z.object({
  id: z.string().regex(RECOVERY_ID_PATTERN),
  state: recoveryStateSchema,
});

export type RecoveryPayload = z.infer<typeof recoveryPayloadSchema>;

/** Raw request-body ceiling, enforced before JSON parsing. */
export const MAX_RECOVERY_BODY_BYTES = 128_000;
