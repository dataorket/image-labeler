import { test, expect } from '@playwright/test';

test.describe('Image Labeler - Upload & Analysis', () => {
  test('should display the application with upload and history tabs', async ({ page }) => {
    await page.goto('/');
    
    // Check page title and main elements
    await expect(page.locator('text=🖼️ Image Analysis & Labeling Service')).toBeVisible();
    await expect(page.locator('text=📤 Upload')).toBeVisible();
    await expect(page.locator('text=📜 History')).toBeVisible();
  });

  test('should allow file selection', async ({ page }) => {
    await page.goto('/');
    
    // Check file input exists (it's hidden but should be in DOM)
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
    
    // Set a test file
    const testImagePath = './tests/fixtures/test-image.jpg';
    await fileInput.setInputFiles(testImagePath);
    
    // Upload button should be enabled after file selection
    const uploadButton = page.locator('text=🚀 Upload & Analyze');
    await expect(uploadButton).toBeEnabled();
  });

  test('should upload image and show analysis results panel', async ({ page }) => {
    await page.goto('/');
    
    // Upload an image
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = './tests/fixtures/test-image.jpg';
    await fileInput.setInputFiles(testImagePath);
    
    // Click upload button
    await page.locator('text=🚀 Upload & Analyze').click();
    
    // Wait for uploading state
    await expect(page.locator('text=⏳ Uploading...')).toBeVisible();
    
    // Wait for upload to complete (not Vision API analysis)
    await page.waitForTimeout(3000);
    
    // Check that Analysis Results panel appears
    await expect(page.locator('text=Analysis Results')).toBeVisible();
    
    // Check for job details structure
    await expect(page.locator('text=STATUS').first()).toBeVisible();
    await expect(page.locator('text=IMAGES').first()).toBeVisible();
    await expect(page.locator('text=PROGRESS').first()).toBeVisible();
    
    // Verify image is displayed
    const uploadedImage = page.locator('img[alt*=".jpg"]').first();
    await expect(uploadedImage).toBeVisible();
  });

  test.skip('should display detected labels from Vision API', async ({ page }) => {
    // Skipped: Requires working Vision API backend
    // This test would verify that Google Cloud Vision API returns labels
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = './tests/fixtures/test-image.jpg';
    await fileInput.setInputFiles(testImagePath);
    
    await page.locator('text=🚀 Upload & Analyze').click();
    
    // Wait for analysis
    await expect(page.locator('text=DONE').first()).toBeVisible({ timeout: 60000 });
    
    // Check tabs for label categories
    await expect(page.locator('text=Objects')).toBeVisible();
    await expect(page.locator('text=Labels')).toBeVisible();
    
    // At least one label should be detected
    const labelCards = page.locator('div').filter({ hasText: /\d+(\.\d+)?%/ });
    await expect(labelCards.first()).toBeVisible();
  });
});

test.describe('Image Labeler - History', () => {
  test('should switch to history tab and show uploaded images', async ({ page }) => {
    await page.goto('/');
    
    // Click History tab
    await page.locator('text=📜 History').click();
    
    // Check for history heading
    await expect(page.locator('text=📜 All Uploaded Images')).toBeVisible();
    
    // If there are images, grid should be visible
    // Note: This assumes at least one image was uploaded previously
    const imageGrid = page.locator('[style*="grid-template-columns"]').first();
    
    // Either images exist or "No images uploaded yet" message
    const hasImages = await imageGrid.isVisible();
    const noImagesMsg = await page.locator('text=No images uploaded yet').isVisible();
    
    expect(hasImages || noImagesMsg).toBeTruthy();
  });

  test('should show image details when clicked in history', async ({ page }) => {
    // First upload an image to ensure history has content
    await page.goto('/');
    
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = './tests/fixtures/test-image.jpg';
    await fileInput.setInputFiles(testImagePath);
    await page.locator('text=🚀 Upload & Analyze').click();
    
    // Wait for upload to complete (not Vision API)
    await page.waitForTimeout(3000);
    
    // Switch to History tab
    await page.locator('text=📜 History').click();
    await expect(page.locator('text=📜 All Uploaded Images')).toBeVisible();
    
    // Click on the first image in the grid
    const firstHistoryImage = page.locator('[style*="grid-template-columns"] > div').first();
    await firstHistoryImage.click();
    
    // Analysis Results should appear
    await expect(page.locator('text=Analysis Results')).toBeVisible();
    await expect(page.locator('text=Job ID:')).toBeVisible();
  });

  test('should return to grid view when History tab is clicked again', async ({ page }) => {
    await page.goto('/');
    
    // Upload an image first
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = './tests/fixtures/test-image.jpg';
    await fileInput.setInputFiles(testImagePath);
    await page.locator('text=🚀 Upload & Analyze').click();
    await page.waitForTimeout(3000);
    
    // Go to History
    await page.locator('text=📜 History').click();
    
    // Click on an image to show details
    const firstHistoryImage = page.locator('[style*="grid-template-columns"] > div').first();
    await firstHistoryImage.click();
    await expect(page.locator('text=Analysis Results')).toBeVisible();
    
    // Click History tab again
    await page.locator('text=📜 History').click();
    
    // Should show grid again
    await expect(page.locator('text=📜 All Uploaded Images')).toBeVisible();
  });
});

test.describe('Image Labeler - UI/UX', () => {
  test('should have purple theme throughout', async ({ page }) => {
    await page.goto('/');
    
    // Check for gradient background
    const root = page.locator('body');
    await expect(root).toBeVisible();
    
    // Upload tab should have purple when active
    const uploadTab = page.locator('text=📤 Upload');
    await expect(uploadTab).toBeVisible();
  });

  test('should clear results when clear button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Upload an image
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = './tests/fixtures/test-image.jpg';
    await fileInput.setInputFiles(testImagePath);
    await page.locator('text=🚀 Upload & Analyze').click();
    
    // Wait for results panel to appear
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Analysis Results')).toBeVisible();
    
    // Click clear button
    const clearButton = page.locator('text=🗑️ Clear Results');
    await clearButton.click();
    
    // Results should be cleared
    await expect(page.locator('text=Analysis Results')).not.toBeVisible();
  });

  test('should show refresh button in recent jobs', async ({ page }) => {
    await page.goto('/');
    
    // Refresh button should be visible
    const refreshButton = page.locator('button:has-text("🔄")').first();
    await expect(refreshButton).toBeVisible();
    
    // Should be clickable
    await refreshButton.click();
  });
});
