import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads without errors', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/cekwajar/i);
  });

  test('shows 5 tool cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Wajar Slip')).toBeVisible();
    await expect(page.locator('text=Wajar Gaji')).toBeVisible();
    await expect(page.locator('text=Wajar Kabur')).toBeVisible();
    await expect(page.locator('text=Wajar Hidup')).toBeVisible();
    await expect(page.locator('text=Wajar Tanah')).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Wajar Slip');
    await expect(page).toHaveURL(/\/slip/);
  });
});
