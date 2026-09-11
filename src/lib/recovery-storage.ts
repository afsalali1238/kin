import { initialRecovery, type Recovery } from '@/lib/app-types';
import type { PainPin } from '@/components/body/BodyViewer';

export const RECOVERY_STORAGE_KEY = 'kinesio-recovery';
export const RECOVERY_ID_KEY = 'kinesio-id';

/**
 * Persistence schema history:
 *  - v1 (unversioned): multiple pain pins per region were allowed.
 *  - v2: exactly one pin — "one precise point is enough". Legacy saves are
 *    migrated on load by keeping the first pin.
 */
export const RECOVERY_SCHEMA_VERSION = 2;

const isPainPin = (p: unknown): p is PainPin => {
  if (typeof p !== 'object' || p === null) return false;
  const pin = p as Record<string, unknown>;
  return (
    typeof pin.id === 'string' &&
    typeof pin.regionId === 'string' &&
    Array.isArray(pin.point) &&
    pin.point.length === 3 &&
    pin.point.every((n) => typeof n === 'number' && Number.isFinite(n)) &&
    typeof pin.intensity === 'number'
  );
};

/**
 * Upgrade any stored payload to the current Recovery shape. Unknown keys are
 * dropped, missing keys are filled from `initialRecovery`, and legacy multi-pin
 * saves are collapsed to the single-pin model. Never throws.
 */
export function migrateRecovery(raw: unknown): Recovery {
  if (typeof raw !== 'object' || raw === null) return initialRecovery;
  const stored = raw as Record<string, unknown>;
  const pins = Array.isArray(stored.pins) ? (stored.pins as unknown[]).filter(isPainPin).slice(0, 1) : [];
  const intake =
    typeof stored.intake === 'object' && stored.intake !== null
      ? { ...initialRecovery.intake, ...(stored.intake as Partial<Recovery['intake']>) }
      : initialRecovery.intake;
  const phase = typeof stored.phase === 'number' && stored.phase >= 1 && stored.phase <= 3 ? stored.phase : 1;
  const logs = Array.isArray(stored.logs) ? (stored.logs as Recovery['logs']) : [];
  return {
    ...initialRecovery,
    region: typeof stored.region === 'string' ? stored.region : '',
    pins,
    intake,
    goal: typeof stored.goal === 'string' ? stored.goal : initialRecovery.goal,
    presentationId: typeof stored.presentationId === 'string' ? stored.presentationId : initialRecovery.presentationId,
    phase,
    assessed: stored.assessed === true,
    logs,
    swaps: typeof stored.swaps === 'object' && stored.swaps !== null ? (stored.swaps as Record<string, string>) : {},
  };
}
