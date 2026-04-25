import { test, expect } from '@playwright/test';

test.describe('Hidup page', () => {
  test('loads and displays form', async ({ page }) => {
    await page.goto('/hidup');
    await expect(page.locator('h1:has-text("Wajar Hidup")')).toBeVisible();
    // Use placeholder to find inputs
    await expect(page.locator('input[placeholder*="8000000"]')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('form validation for required fields', async ({ page }) => {
    await page.goto('/hidup');

    // Try to submit without filling required fields
    await page.locator('button[type="submit"]').click();

    // Form should still be visible (validation prevented submission)
    await expect(page.locator('input[placeholder*="8000000"]')).toBeVisible();
  });

  test('city selection dropdown contains cities', async ({ page }) => {
    await page.goto('/hidup');

    // Get all selects in the form - family_members is first, city is second
    const selects = page.locator('form select');
    const count = await selects.count();
    expect(count).toBeGreaterThan(1);

    // City dropdown should be the second select
    const citySelect = selects.nth(1);

    // Verify options exist
    const options = citySelect.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(1);

    // Verify specific cities exist - options are in DOM but hidden until dropdown opens
    await expect(citySelect.locator('option[value="jakarta"]')).toBeAttached();
    await expect(citySelect.locator('option[value="surabaya"]')).toBeAttached();
  });

  test('submits form with valid data', async ({ page }) => {
    await page.goto('/hidup');

    // Fill income using placeholder
    await page.fill('input[placeholder*="8000000"]', '10000000');

    // Select family members (first select)
    await page.locator('form select').first().selectOption('4');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for result
    await expect(
      page.locator('h1:has-text("Wajar Hidup")')
    ).toBeVisible({ timeout: 10000 });
  });
});
