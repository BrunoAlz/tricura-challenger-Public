import { test, expect } from '@playwright/test';
import { AdminSessionsPage } from '@pages/admin/AdminSessionsPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@smoke @dashboard admin sessions', () => {
  test('renders sessions page with new-session action and table', async ({ page }) => {
    await gotoAdmin(page);

    const sessions = new AdminSessionsPage(page);
    await sessions.goto();

    await expect(sessions.heading).toBeVisible();
    await expect(sessions.newSessionButton).toBeVisible();
    await expect(sessions.table).toBeVisible();
  });
});
