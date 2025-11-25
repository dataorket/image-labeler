import { test, expect } from '@playwright/test';

test.describe('Image Labeler - Basic UI', () => {
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

  test('should have file input', async ({ page }) => {
    await page.goto('/');
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('should show upload button', async ({ page }) => {
    await page.goto('/');
    const uploadButton = page.getByRole('button', { name: '🚀 Upload & Analyze' });
    await expect(uploadButton).toBeVisible();
  });

  test('should have purple theme color', async ({ page }) => {
    await page.goto('/');
    const uploadTab = page.getByRole('button', { name: '📤 Upload' });
    await expect(uploadTab).toHaveCSS('background-color', 'rgb(111, 66, 193)');
  });
});

test.describe('Image Labeler - Navigation', () => {
  test('should switch to history tab', async ({ page }) => {
    await page.goto('/');
    const historyTab = page.getByRole('button', { name: '📜 History' });
    await historyTab.click();
    
    // Should show history heading
    await expect(page.locator('text=All Uploaded Images').first()).toBeVisible();
  });

  test('should switch back to upload tab', async ({ page }) => {
    await page.goto('/');
    
    // Go to history
    const historyTab = page.getByRole('button', { name: '📜 History' });
    await historyTab.click();
    
    // Go back to upload
    const uploadTab = page.getByRole('button', { name: '📤 Upload' });
    await uploadTab.click();
    
    // Upload button should be visible
    const uploadButton = page.getByRole('button', { name: '🚀 Upload & Analyze' });
    await expect(uploadButton).toBeVisible();
  });
});

test.describe('Image Labeler - Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Elements should still be visible on mobile
    await expect(page.locator('h1')).toBeVisible();
    const uploadTab = page.getByRole('button', { name: '📤 Upload' });
    await expect(uploadTab).toBeVisible();
  });
});
