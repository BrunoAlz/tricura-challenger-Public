import { test, expect } from '@playwright/test';
import { AdminAuditPage } from '@pages/admin/AdminAuditPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@smoke @dashboard admin audit', () => {
  test('renders audit log with severity filter', async ({ page }) => {
    await gotoAdmin(page);

    const audit = new AdminAuditPage(page);
    await audit.goto();

    await expect(audit.heading).toBeVisible();
    await expect(audit.severityLabel).toBeVisible();
    await expect(audit.severityFilter).toBeVisible();
  });
});
