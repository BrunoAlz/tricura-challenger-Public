import { test, expect } from '@fixtures/a11y.fixture';
import { AdminAuditPage } from '@pages/admin/AdminAuditPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/director.json' });

const EXPECTED_VIOLATIONS = new Set<string>([
  'color-contrast',
  'select-name',
]);

test.describe('@a11y @dashboard Admin Audit page', () => {
  test('WCAG 2.1 AA violation set matches expected pins', async ({ page, makeAxeBuilder }) => {
    const audit = new AdminAuditPage(page);
    await gotoAdmin(page, '/admin/audit');
    await expect(audit.heading).toBeVisible();

    const results = await makeAxeBuilder().analyze();
    const found = new Set(results.violations.map((v) => v.id));

    expect(found).toEqual(EXPECTED_VIOLATIONS);
  });
});
