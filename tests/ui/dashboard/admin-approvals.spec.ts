import { test, expect } from '@playwright/test';
import { AdminApprovalsPage } from '@pages/admin/AdminApprovalsPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@smoke @dashboard admin approvals', () => {
  test('renders approval queue with approve and reject actions', async ({ page }) => {
    await gotoAdmin(page);

    const approvals = new AdminApprovalsPage(page);
    await approvals.goto();

    await expect(approvals.heading).toBeVisible();
    await expect(approvals.approveButtons.first()).toBeVisible();
    await expect(approvals.rejectButtons.first()).toBeVisible();
  });
});
