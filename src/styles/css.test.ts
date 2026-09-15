import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Mobile-First CSS Architecture (Stage 03 Gates)', () => {
  const stylesDir = path.resolve(__dirname);
  const cssFiles = fs.readdirSync(stylesDir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => path.join(stylesDir, f))
    .concat(
      fs.readdirSync(path.join(stylesDir, 'features'))
        .filter((f) => f.endsWith('.css'))
        .map((f) => path.join(stylesDir, 'features', f))
    );

  it('contains all required modular stylesheet files', () => {
    const requiredFiles = [
      'tokens.css',
      'base.css',
      'layout.css',
      'components.css',
      'features/body.css',
      'features/journey.css',
      'features/programme.css',
      'features/session.css',
      'features/home.css',
      'features/progress.css',
      'features/learn.css',
    ];

    for (const rel of requiredFiles) {
      const fullPath = path.join(stylesDir, rel);
      expect(fs.existsSync(fullPath), `Expected ${rel} to exist`).toBe(true);
    }
  });

  it('contains zero max-width media queries (mobile is unconditional base)', () => {
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasMaxWidth = /@media[^{]*max-width/i.test(content);
      expect(hasMaxWidth, `Found max-width query in ${path.relative(stylesDir, file)}`).toBe(false);
    }
  });

  it('enforces typography floor: no declarations below 11px', () => {
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const sub11pxMatches = content.match(/font-size:\s*([0-9]|10)px/g);
      expect(sub11pxMatches, `Found sub-11px font size in ${path.relative(stylesDir, file)}`).toBeNull();
    }
  });

  it('defines touch floor of 44px and safe area insets in tokens', () => {
    const tokens = fs.readFileSync(path.join(stylesDir, 'tokens.css'), 'utf-8');
    expect(tokens).toContain('--touch: 44px');
    expect(tokens).toContain('safe-area-inset-bottom');
  });

  it('globals.css imports all modular stylesheets cleanly', () => {
    const globals = fs.readFileSync(path.resolve(__dirname, '../app/globals.css'), 'utf-8');
    expect(globals).toContain('@import "../styles/tokens.css";');
    expect(globals).toContain('@import "../styles/base.css";');
    expect(globals).toContain('@import "../styles/layout.css";');
    expect(globals).toContain('@import "../styles/components.css";');
    expect(globals).toContain('@import "../styles/features/body.css";');
    expect(globals).toContain('@import "../styles/features/journey.css";');
    expect(globals).toContain('@import "../styles/features/programme.css";');
    expect(globals).toContain('@import "../styles/features/session.css";');
    expect(globals).toContain('@import "../styles/features/home.css";');
    expect(globals).toContain('@import "../styles/features/progress.css";');
    expect(globals).toContain('@import "../styles/features/learn.css";');
  });
});
