import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from '@pages/admin/AdminDashboardPage';
import { gotoAdmin } from '@utils/spa-nav';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard /admin Director-visible QE Index mismatch warning', () => {
  test('@bug-089 dashboard currently surfaces the QE Index discrepancy with a vs-Home comparison line and a "mismatch" label', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const dashboard = new AdminDashboardPage(page);
    await expect(dashboard.heading).toBeVisible();
    await page.waitForResponse(
      (r) => r.url().includes('/api/admin/dashboard') && r.status() === 200,
    );

    const publicQe = Number(env.T_VAL_LITERAL_01);
    const publicQeEscaped = String(publicQe).replace('.', '\\.');
    await expect(
      page.getByText(new RegExp(`vs Home:\\s*${publicQeEscaped}%\\s*\\(displayed\\)`, 'i')),
      'BUG-089: the vs-Home displayed comparison line should currently render',
    ).toBeVisible();
    await expect(
      page.getByText('mismatch', { exact: true }),
      'BUG-089: the "mismatch" label should currently render alongside the QE comparison',
    ).toBeVisible();
  });
});
