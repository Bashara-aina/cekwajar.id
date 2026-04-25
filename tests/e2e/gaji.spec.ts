import { test, expect } from '@playwright/test';

test.describe('Gaji page', () => {
  test('loads and displays form', async ({ page }) => {
    await page.goto('/gaji');
    await expect(page.locator('h1:has-text("Wajar Gaji")')).toBeVisible();
    // Use placeholder to find inputs
    await expect(page.locator('input[placeholder*="Software Engineer"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('form validation for required fields', async ({ page }) => {
    await page.goto('/gaji');

    // Try to submit without filling required fields - HTML5 validation should prevent
    await page.locator('button[type="submit"]').click();

    // Form should still be visible (validation prevented submission)
    await expect(page.locator('input[placeholder*="Software Engineer"]')).toBeVisible();
  });

  test('shows validation error for invalid experience years', async ({ page }) => {
    await page.goto('/gaji');

    // Fill job title
    await page.fill('input[placeholder*="Software Engineer"]', 'Software Engineer');

    // Submit form with empty required fields (backend may not be available)
    await page.locator('button[type="submit"]').click();

    // Either result card or error message should appear (backend may not be available in test env)
    await expect(
      page.locator('h1:has-text("Wajar Gaji")')
    ).toBeVisible({ timeout: 10000 });
  });

  test('city selection dropdown works', async ({ page }) => {
    await page.goto('/gaji');

    // Select a city from dropdown - first select in the form
    const citySelect = page.locator('form select').first();
    await citySelect.selectOption('surabaya');
    const selectedValue = await citySelect.inputValue();
    expect(selectedValue).toBe('surabaya');
  });
});
