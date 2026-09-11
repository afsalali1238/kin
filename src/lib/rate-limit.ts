/**
 * Best-effort sliding-window rate limiter for the recovery API.
 *
 * In-memory and per-process: on serverless/multi-instance deployments each
 * instance enforces its own window, so treat this as abuse damping, not a
 * hard guarantee. The shape is a pure function of (key, now) so it can be
 * tested deterministically.
 */
type Bucket = { count: number; resetAt: number };

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const buckets = new Map<string, Bucket>();
  return (key: string, now: number = Date.now()): boolean => {
    const bucket = buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    bucket.count += 1;
    return bucket.count <= limit;
  };
}

const putLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });
const getLimiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

export function checkRecoveryRateLimit(key: string, kind: 'read' | 'write' = 'write', now?: number): boolean {
  return (kind === 'write' ? putLimiter : getLimiter)(key, now);
}
