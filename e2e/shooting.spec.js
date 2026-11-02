import { expect, test } from '@playwright/test';

test('clicking in the game sends a snowball and receives projectile state', async ({ page }) => {
  const receivedFrames = [];
  const sentShotMessages = [];
  page.on('websocket', (socket) => {
    socket.on('framereceived', (frame) => {
      const payload = frame.payload;
      receivedFrames.push(typeof payload === 'string' ? payload.length : payload.byteLength);
    });
    socket.on('framesent', (frame) => {
      const payload = frame.payload;
      const decoded = typeof payload === 'string' ? payload : new TextDecoder().decode(payload);
      if (decoded.includes('shoot')) sentShotMessages.push(decoded);
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'PLAY' }).click();
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  // Allow the initial room state to settle before checking for a shooting update.
  await page.waitForTimeout(300);
  const frameCountBeforeShot = receivedFrames.length;
  await canvas.click({ position: { x: 640, y: 360 } });

  await expect.poll(() => sentShotMessages.length, { timeout: 3_000 }).toBeGreaterThan(0);
  await expect.poll(() => receivedFrames.length, { timeout: 3_000 }).toBeGreaterThan(frameCountBeforeShot);
});
