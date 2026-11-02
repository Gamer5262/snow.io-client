import { expect, test } from '@playwright/test';

test('capture moving sky', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'PLAY' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: './sky-check.png' });
});
