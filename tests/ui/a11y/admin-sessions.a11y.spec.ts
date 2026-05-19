import { test, expect } from '@fixtures/a11y.fixture';
import { AdminSessionsPage } from '@pages/admin/AdminSessionsPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/director.json' });

const EXPECTED_VIOLATIONS = new Set<string>([
  'color-contrast',
]);

test.describe('@a11y @dashboard Admin Sessions page', () => {
  test('WCAG 2.1 AA violation set matches expected pins', async ({ page, makeAxeBuilder }) => {
    const sessions = new AdminSessionsPage(page);
    await gotoAdmin(page, '/admin/sessions');
    await expect(sessions.heading).toBeVisible();

    const results = await makeAxeBuilder().analyze();
    const found = new Set(results.violations.map((v) => v.id));

    expect(found).toEqual(EXPECTED_VIOLATIONS);
  });
});
