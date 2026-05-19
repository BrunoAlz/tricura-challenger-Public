import { test, expect } from '@playwright/test';
import { AdminReportsPage } from '@pages/admin/AdminReportsPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@smoke @dashboard admin reports', () => {
  test('renders reports page with export actions', async ({ page }) => {
    await gotoAdmin(page);

    const reports = new AdminReportsPage(page);
    await reports.goto();

    await expect(reports.heading).toBeVisible();
    await expect(reports.exportCsvLink).toBeVisible();
    await expect(reports.exportPdfButton).toBeVisible();
    await expect(reports.operatorFormatButton).toBeVisible();
  });
});
