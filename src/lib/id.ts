/**
 * RFC-4122-style random identifier.
 *
 * `crypto.randomUUID()` is unavailable in non-secure contexts (plain HTTP
 * deployments, some embedded WebViews), so fall back to a Math.random-based
 * UUID v4 shape instead of throwing on first launch.
 */
export function makeId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fall through to the Math.random implementation below
  }
  return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16),
  );
}
