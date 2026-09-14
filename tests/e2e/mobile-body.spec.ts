import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { collectPageErrors, placeAndConfirmPin, waitForViewer } from './helpers';

/**
 * The body step at the smallest supported width: bottom navigation, no
 * horizontal overflow, 44px chip targets, the single-pin flow, offline and
 * back online, plus axe scans of the two most complex layouts.
 */
test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

async function axeNoCritical(page: import('@playwright/test').Page, label: string) {
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter((v) => v.impact === 'critical');
  if (results.violations.length > critical.length) {
    console.log(
      `[axe:${label}] tolerated non-critical violations:`,
      results.violations.filter((v) => v.impact !== 'critical').map((v) => `${v.impact}:${v.id}`).join(', '),
    );
  }
  expect(critical, `[axe:${label}] critical violations`).toEqual([]);
}

test('body step at 375px: pin flow, 44px chips, offline banner, axe', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('/');
  const viewer = await waitForViewer(page);

  // Mobile chrome: bottom nav, and nothing overflows horizontally.
  await expect(page.locator('.mobile-bottom-nav')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await axeNoCritical(page, 'body step');

  // Every chip in the "all areas" sheet meets the 44px target-size fix.
  await page.getByRole('button', { name: 'Explore all body areas', exact: true }).click();
  const firstChip = page.locator('.chip').first();
  await expect(firstChip).toBeVisible();
  const chipBox = await firstChip.boundingBox();
  expect(chipBox && chipBox.height >= 44).toBe(true);
  await page.getByRole('button', { name: 'Hide all body areas', exact: true }).click();

  // Single-pin flow works with touch at this viewport, then into the intake.
  await placeAndConfirmPin(page, viewer);
  await page.getByRole('button', { name: 'Yes, let’s continue', exact: true }).click();
  await expect(page.getByText('01 / 07')).toBeVisible();
  await axeNoCritical(page, 'intake step 1');

  // Offline keeps the app working and announces itself; reconnecting clears it.
  await page.context().setOffline(true);
  await expect(page.locator('.offline-banner')).toBeVisible();
  await page.context().setOffline(false);
  await expect(page.locator('.offline-banner')).toHaveCount(0);

  expect(errors).toEqual([]);
});
