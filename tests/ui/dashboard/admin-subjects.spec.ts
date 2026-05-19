import { test, expect } from '@playwright/test';
import { AdminSubjectsPage } from '@pages/admin/AdminSubjectsPage';
import { gotoAdmin } from '@utils/spa-nav';
import { dodgeCorruptedS0001 } from '@utils/dodge-s0001';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@smoke @dashboard admin subjects', () => {
  test('renders subjects page with search and table', async ({ page }) => {
    await dodgeCorruptedS0001(page);

    await gotoAdmin(page);

    const subjects = new AdminSubjectsPage(page);
    await subjects.goto();

    await expect(subjects.heading).toBeVisible();
    await expect(subjects.description).toBeVisible();
    await expect(subjects.localSearch).toBeVisible();
    await expect(subjects.table).toBeVisible();
  });
});
