import { test, expect } from '@playwright/test';

test.describe('Image Labeler - Simple Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show upload tab', async ({ page }) => {
    await page.goto('/');
    const uploadTab = page.getByRole('button', { name: '📤 Upload' });
    await expect(uploadTab).toBeVisible();
  });

  test('should show history tab', async ({ page }) => {
    await page.goto('/');
    const historyTab = page.getByRole('button', { name: '📜 History' });
    await expect(historyTab).toBeVisible();
  });
});
