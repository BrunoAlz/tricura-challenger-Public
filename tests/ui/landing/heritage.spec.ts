import { test, expect } from '@fixtures/auth.fixture';
import { HeritagePage } from '@pages/public/HeritagePage';

test.describe('@smoke @landing heritage page', () => {
  test('renders heading and Since 1959 section', async ({ page }) => {
    const heritage = new HeritagePage(page);
    await heritage.goto();

    await expect(page).toHaveTitle(/heritage/i);
    await expect(heritage.heading).toBeVisible();
    await expect(heritage.since1959Text).toBeVisible();
  });

  test('shows the 4 known milestone years', async ({ page }) => {
    const heritage = new HeritagePage(page);
    await heritage.goto();

    for (const year of [1959, 1971, 1989, 2026]) {
      await expect(heritage.milestone(year).first()).toBeVisible();
    }
  });
});
