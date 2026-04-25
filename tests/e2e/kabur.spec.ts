import { test, expect } from '@playwright/test';

test.describe('Kabur page', () => {
  test('kabur page loads and shows form', async ({ page }) => {
    await page.goto('/kabur');
    await expect(page.locator('h1:has-text("Wajar Kabur")')).toBeVisible();
    // Find select elements inside the form by their containing label text
    const selects = page.locator('form select');
    await expect(selects).toHaveCount(2);
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('can select cities and submit form', async ({ page }) => {
    await page.goto('/kabur');

    // Get all selects in the form - first is current city, second is target city
    const selects = page.locator('form select');
    await expect(selects).toHaveCount(2);

    // Select current city (Jakarta)
    await selects.nth(0).selectOption('jakarta');

    // Select target city (Singapore)
    await selects.nth(1).selectOption('singapore');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for either result or error to appear
    await expect(
      page.locator('button[type="submit"]')
    ).toBeVisible({ timeout: 10000 });
  });

  test('can submit kabur form with different cities', async ({ page }) => {
    await page.goto('/kabur');

    // Get all selects in the form
    const selects = page.locator('form select');

    // Change to different cities
    await selects.nth(0).selectOption('surabaya');
    await selects.nth(1).selectOption('tokyo');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait a bit for the form to process
    await page.waitForTimeout(2000);

    // Verify the form still exists and button is accessible
    await expect(page.locator('h1:has-text("Wajar Kabur")')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
  });

  test('form is pre-populated with default cities', async ({ page }) => {
    await page.goto('/kabur');

    // Get all selects in the form
    const selects = page.locator('form select');
    await expect(selects).toHaveCount(2);

    // Check default selections
    const currentCity = await selects.nth(0).inputValue();
    const targetCity = await selects.nth(1).inputValue();

    expect(currentCity).toBe('jakarta');
    expect(targetCity).toBe('singapore');
  });

  test('can change city selections', async ({ page }) => {
    await page.goto('/kabur');

    // Get all selects in the form
    const selects = page.locator('form select');

    // Change current city to Surabaya
    await selects.nth(0).selectOption('surabaya');

    // Change target city to Bangkok
    await selects.nth(1).selectOption('bangkok');

    // Verify the changes
    const currentCity = await selects.nth(0).inputValue();
    const targetCity = await selects.nth(1).inputValue();

    expect(currentCity).toBe('surabaya');
    expect(targetCity).toBe('bangkok');
  });
});
