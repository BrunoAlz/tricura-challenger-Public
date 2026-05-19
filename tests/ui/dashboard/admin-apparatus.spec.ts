import { test, expect } from '@playwright/test';
import { AdminApparatusPage } from '@pages/admin/AdminApparatusPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@smoke @dashboard admin apparatus', () => {
  test('renders apparatus catalog with at least one card', async ({ page }) => {
    await gotoAdmin(page);

    const apparatus = new AdminApparatusPage(page);
    await apparatus.goto();

    await expect(apparatus.heading).toBeVisible();
    await expect(apparatus.apparatusCard('AP-001')).toBeVisible();
  });
});
