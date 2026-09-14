import { test, expect } from '@playwright/test';
import { collectPageErrors, placeAndConfirmPin, waitForViewer } from './helpers';

/**
 * The core product journey end to end: locate → understand → plan → session →
 * check-in, including the single-pin gate and the undo affordance. Runs on the
 * production build with software WebGL (SwiftShader).
 */
test('locate pain → intake → programme → session → check-in', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('/');
  const viewer = await waitForViewer(page);

  // --- Locate: region → one precise point → confirm → undo works ----------
  await placeAndConfirmPin(page, viewer);
  const continueCta = page.getByRole('button', { name: 'Yes, let’s continue', exact: true });

  await page.clock.install({ time: Date.now() });
  await page.getByRole('button', { name: 'Remove point', exact: true }).click();
  await expect(page.getByText('Point removed.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Place one point to continue', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByText('Point restored.')).toBeVisible();
  await page.clock.resume();
  await expect(continueCta).toBeEnabled();
  await continueCta.click();

  // --- Intake: seven questions with regional chips ------------------------
  await expect(page.getByText('01 / 07')).toBeVisible();
  for (let s = 0; s < 6; s++) {
    if (s === 4) await page.getByRole('button', { name: 'Bending forward', exact: true }).first().click();
    if (s === 5) await page.getByRole('button', { name: 'Very little sets it off' }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Understand my pain', exact: true }).click();

  // --- Result → goal → programme ------------------------------------------
  await expect(page.getByText('This looks most like…')).toBeVisible();
  await page.getByRole('button', { name: 'Let’s build my plan', exact: true }).click();
  await page.getByRole('button', { name: 'See my personal programme', exact: true }).click();
  await expect(page.locator('.sample-banner')).toHaveCount(0);
  await expect(page.locator('.exercise-row')).toHaveCount(4);

  // --- Session: traffic light gate, adapt, complete ------------------------
  await page.getByRole('button', { name: 'Start my session', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Your pain traffic light' })).toBeVisible();
  await page.getByRole('button', { name: 'Got it. Let’s move.', exact: true }).click();
  await expect(page.getByText('EXERCISE 01 / 04')).toBeVisible();

  const firstExercise = await page.locator('.session-instructions h1').innerText();
  await page.getByRole('button', { name: 'Too painful', exact: true }).click();
  await expect(page.locator('.session-instructions h1')).not.toHaveText(firstExercise);

  // Advance through all sets and exercises until the session is finished.
  let iterationCap = 0;
  while (await page.getByRole('button', { name: 'Finish & check in', exact: true }).isHidden()) {
    if (++iterationCap > 50) throw new Error('Infinite loop in session progression');
    await page.getByRole('button', { name: /Complete set|Next exercise/i }).click();
    await page.waitForTimeout(150);
  }
  await page.getByRole('button', { name: 'Finish & check in', exact: true }).click();
  await page.getByRole('button', { name: 'Save & finish', exact: true }).click();

  // --- Persistence: single pin kept, high-irritability swap logged ---------
  await expect(page.locator('.home-session')).toBeVisible({ timeout: 8_000 });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('kinesio-recovery') || 'null'));
  expect(saved.pins.length).toBeLessThanOrEqual(1);
  expect(saved.logs.length).toBe(1);
  expect(saved.intake.irritability).toBe('high');
  expect(saved.assessed).toBe(true);

  expect(errors).toEqual([]);
});
