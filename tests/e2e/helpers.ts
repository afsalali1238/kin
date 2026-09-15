import { expect, type Page } from '@playwright/test';

/** Collect uncaught page errors; assert the array is empty at the end of a test. */
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

export type ViewerKind = 'canvas' | 'fallback';

/** Waits for either the 3D canvas or the 2D fallback to be ready and reports which one rendered. */
export async function waitForViewer(page: Page): Promise<ViewerKind> {
  const canvas = page.locator('.body-canvas canvas');
  await expect(page.locator('.body-canvas canvas, .body-canvas .fallback-body')).toBeVisible({ timeout: 45_000 });
  return (await canvas.count()) > 0 ? 'canvas' : 'fallback';
}

/**
 * Selects a region and then places and confirms the single precise point.
 * Works with the 3D canvas (UV pick on the torso) and the 2D fallback
 * (region buttons), stopping with the Continue CTA enabled but not clicked.
 */
export async function placeAndConfirmPin(page: Page, viewer: ViewerKind) {
  // The floating stage chips share region names, so scope to the panel grid.
  await page.locator('.region-grid').getByRole('button', { name: 'Lower back', exact: true }).click();
  // Region alone is not enough — the CTA stays disabled until a point exists.
  await expect(page.getByRole('button', { name: 'Place one point to continue', exact: true })).toBeDisabled();

  const confirmPanel = page.locator('.bv-confirm');
  if (viewer === 'canvas') {
    const canvasEl = page.locator('.body-canvas canvas').first();
    await canvasEl.scrollIntoViewIfNeeded();
    const box = await canvasEl.boundingBox();
    if (!box) throw new Error('3D canvas has no bounding box');
    // Try a few torso spots until the UV→region pick resolves a pending pin.
    for (const [ox, oy] of [[0.5, 0.45], [0.5, 0.55], [0.46, 0.4], [0.54, 0.5], [0.5, 0.34]] as const) {
      await page.mouse.click(box.x + box.width * ox, box.y + box.height * oy);
      if (await confirmPanel.isVisible().catch(() => false)) break;
      await page.waitForTimeout(400);
    }
  } else {
    await page.locator('.fallback-body [role="button"]').first().click();
  }

  // The live-region confirmation panel offers the pending point for review.
  await expect(confirmPanel).toBeVisible({ timeout: 8_000 });
  await page.getByRole('button', { name: 'Yes, that’s it', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Yes, let’s continue', exact: true })).toBeEnabled({ timeout: 8_000 });
}
