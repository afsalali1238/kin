import { describe, expect, it } from 'vitest';
import { exercises } from '@/lib/clinical';
import { animationFor } from './animationFor';

const VARIANT_SUFFIXES = ['-supported', '-progressed'];

describe('exercise animation registry', () => {
  it('gives every catalogue exercise its own, unique animation key', () => {
    const keys = exercises.map((e) => animationFor[e.id]);
    expect(keys.every(Boolean)).toBe(true);
    expect(new Set(keys).size, 'no two exercises may share an animation').toBe(exercises.length);
    expect(exercises.length).toBe(136);
  });

  it('only contains catalogue exercises and their supported/progressed variants', () => {
    const ids = new Set(exercises.map((e) => e.id));
    for (const key of Object.keys(animationFor)) {
      if (ids.has(key)) continue;
      const suffix = VARIANT_SUFFIXES.find((s) => key.endsWith(s));
      expect(suffix && ids.has(key.slice(0, -suffix.length)), `unknown animation row: ${key}`).toBe(true);
    }
  });
});
