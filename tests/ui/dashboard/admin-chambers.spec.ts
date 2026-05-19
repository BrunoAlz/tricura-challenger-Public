import { test, expect } from '@playwright/test';
import { AdminChambersPage } from '@pages/admin/AdminChambersPage';
import { gotoAdmin } from '@utils/spa-nav';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@smoke @dashboard admin chambers', () => {
  test('renders chambers page and shows known chamber rows', async ({ page }) => {
    await gotoAdmin(page);

    const chambers = new AdminChambersPage(page);
    await chambers.goto();

    await expect(chambers.heading).toBeVisible();
    await expect(chambers.chamberRow('C-01')).toBeVisible();
    await expect(chambers.chamberRow(env.T_CHAMBER_LITERAL_01)).toBeVisible();
  });
});
