import { test, expect } from '@playwright/test';

test.describe('Image Labeler - Simple Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show upload button', async ({ page }) => {
    await page.goto('/');
    const uploadButton = page.getByRole('button', { name: /Upload/i });
    await expect(uploadButton).toBeVisible();
  });

  test('should show history button', async ({ page }) => {
    await page.goto('/');
    const historyButton = page.getByRole('button', { name: /History/i });
    await expect(historyButton).toBeVisible();
  });
});
