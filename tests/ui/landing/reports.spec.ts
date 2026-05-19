import { test, expect } from '@fixtures/auth.fixture';
import { ReportsPage } from '@pages/public/ReportsPage';

test.describe('@smoke @landing reports page', () => {
  test('renders heading and subtitle', async ({ page }) => {
    const reports = new ReportsPage(page);
    await reports.goto();

    await expect(page).toHaveTitle(/annual reports/i);
    await expect(reports.heading).toBeVisible();
    await expect(reports.subtitle).toBeVisible();
  });
});
