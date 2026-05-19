import { test, expect } from '@playwright/test';
import { AdminSessionsPage } from '@pages/admin/AdminSessionsPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard /admin/sessions state badge styling', () => {
  test('@bug-095 multiple session state badges currently share the identical "bloom" palette', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const sessions = new AdminSessionsPage(page);
    await sessions.goto();
    await expect(sessions.table).toBeVisible();

    const count = await sessions.bloomPaletteBadges.count();
    expect(
      count,
      'BUG-095: sessions table should currently contain multiple badges on the shared "bloom" palette',
    ).toBeGreaterThan(1);
  });
});
