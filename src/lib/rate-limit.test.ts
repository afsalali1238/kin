import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rate-limit';

describe('createRateLimiter', () => {
  it('allows up to the limit, then denies within the window', () => {
    const limited = createRateLimiter({ limit: 3, windowMs: 1000 });
    expect(limited('user-1', 0)).toBe(true);
    expect(limited('user-1', 100)).toBe(true);
    expect(limited('user-1', 200)).toBe(true);
    expect(limited('user-1', 300)).toBe(false);
    expect(limited('user-1', 400)).toBe(false);
  });

  it('tracks windows per key', () => {
    const limited = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limited('a', 0)).toBe(true);
    expect(limited('a', 10)).toBe(false);
    expect(limited('b', 10)).toBe(true);
  });

  it('opens a fresh window after the window expires', () => {
    const limited = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(limited('a', 0)).toBe(true);
    expect(limited('a', 999)).toBe(true);
    expect(limited('a', 1000)).toBe(true); // new window starts at 1000
    expect(limited('a', 1100)).toBe(true);
    expect(limited('a', 1200)).toBe(false);
  });

  it('defaults to the current time when no timestamp is injected', () => {
    const limited = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(limited('a')).toBe(true);
    expect(limited('a')).toBe(false);
  });
});
