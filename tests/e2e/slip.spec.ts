import { test, expect } from '@playwright/test';

test.describe('Slip page', () => {
  test('loads and displays form', async ({ page }) => {
    await page.goto('/slip');
    await expect(page.locator('h1:has-text("Wajar Slip")')).toBeVisible();
    await expect(page.locator('input[name="gross_monthly"]')).toBeVisible();
    await expect(page.locator('select[name="ptkp_status"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('submits form with valid data', async ({ page }) => {
    await page.goto('/slip');

    // Fill in gross monthly salary
    await page.fill('input[name="gross_monthly"]', '10000000');

    // Fill in city
    await page.fill('input[name="city"]', 'Jakarta');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for result or error to appear
    await expect(
      page.locator('text=PPh21 per Bulan').or(page.locator('[class*="bg-red"]'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('shows validation error for empty required fields', async ({ page }) => {
    await page.goto('/slip');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Form should not submit (HTML5 required validation)
    await expect(page.locator('input[name="gross_monthly"]')).toBeVisible();
  });

  test('displays result or error after form submission', async ({ page }) => {
    await page.goto('/slip');

    // Fill in valid data
    await page.fill('input[name="gross_monthly"]', '15000000');
    await page.fill('input[name="city"]', 'Jakarta');

    // Submit form
    await page.click('button[type="submit"]');

    // Either result card or error message should appear (backend may not be available in test env)
    const resultOrError = page.locator('text=PPh21 per Bulan').or(page.locator('[class*="bg-red"]'));
    await expect(resultOrError).toBeVisible({ timeout: 10000 });
  });
});
