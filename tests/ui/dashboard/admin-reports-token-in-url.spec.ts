import { test, expect } from '@playwright/test';
import { AdminReportsPage } from '@pages/admin/AdminReportsPage';
import { gotoAdmin } from '@utils/spa-nav';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard /admin/reports CSV link sensitive prefill', () => {
  test('@bug-101 CSV export link href currently embeds the live case_token as the ?t= query parameter', async ({
    page,
  }) => {
    await gotoAdmin(page, '/admin/reports');
    const reports = new AdminReportsPage(page);
    await expect(reports.heading).toBeVisible();
    await expect(reports.exportCsvLink).toBeVisible();
    await expect(
      reports.exportCsvLink,
      'BUG-101: CSV export href currently embeds ?t=<IRIS_CASE_TOKEN>',
    ).toHaveAttribute('href', new RegExp(`t=${env.IRIS_CASE_TOKEN}`));
  });
});
