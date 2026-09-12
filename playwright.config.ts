import { defineConfig } from '@playwright/test';

/**
 * E2E runs against the production build (`next start`) so CI tests what ships.
 * SwiftShader gives headless Chromium a real WebGL2 context, so the 3D viewer
 * (not just the 2D fallback) is exercised in CI.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    launchOptions: {
      args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  webServer: {
    command: 'npm run start -- --port 3100 --hostname 127.0.0.1',
    port: 3100,
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
});
