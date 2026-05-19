import { test, expect } from '@fixtures/a11y.fixture';
import { AdminChambersPage } from '@pages/admin/AdminChambersPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/director.json' });

const EXPECTED_VIOLATIONS = new Set<string>([
  'color-contrast',
]);

test.describe('@a11y @dashboard Admin Chambers page', () => {
  test('WCAG 2.1 AA violation set matches expected pins', async ({ page, makeAxeBuilder }) => {
    const chambers = new AdminChambersPage(page);
    await gotoAdmin(page, '/admin/chambers');
    await expect(chambers.heading).toBeVisible();

    const results = await makeAxeBuilder().analyze();
    const found = new Set(results.violations.map((v) => v.id));

    expect(found).toEqual(EXPECTED_VIOLATIONS);
  });
});
