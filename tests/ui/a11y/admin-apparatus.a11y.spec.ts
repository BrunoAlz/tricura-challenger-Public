import { test, expect } from '@fixtures/a11y.fixture';
import { AdminApparatusPage } from '@pages/admin/AdminApparatusPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/director.json' });

const EXPECTED_VIOLATIONS = new Set<string>([
  'color-contrast',
]);

test.describe('@a11y @dashboard Admin Apparatus page', () => {
  test('WCAG 2.1 AA violation set matches expected pins', async ({ page, makeAxeBuilder }) => {
    const apparatus = new AdminApparatusPage(page);
    await gotoAdmin(page, '/admin/apparatus');
    await expect(apparatus.heading).toBeVisible();

    const results = await makeAxeBuilder().analyze();
    const found = new Set(results.violations.map((v) => v.id));

    expect(found).toEqual(EXPECTED_VIOLATIONS);
  });
});
