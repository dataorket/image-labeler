import { test, expect } from '@playwright/test';

test.describe('Image Labeler - Simple Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show upload button', async ({ page }) => {
    await page.goto('/');
    const uploadText = page.locator('text=Upload');
    await expect(uploadText).toBeVisible();
  });

  test('should show history button', async ({ page }) => {
    await page.goto('/');
    const historyText = page.locator('text=History');
    await expect(historyText).toBeVisible();
  });
});
