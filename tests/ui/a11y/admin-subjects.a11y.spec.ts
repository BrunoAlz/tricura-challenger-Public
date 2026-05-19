import { test, expect } from '@fixtures/a11y.fixture';
import { AdminSubjectsPage } from '@pages/admin/AdminSubjectsPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/director.json' });

const EXPECTED_VIOLATIONS = new Set<string>([
  'color-contrast',
]);

test.describe('@a11y @dashboard Admin Subjects page', () => {
  test('WCAG 2.1 AA violation set matches expected pins', async ({ page, makeAxeBuilder }) => {
    const subjects = new AdminSubjectsPage(page);
    await gotoAdmin(page, '/admin/subjects');
    await expect(subjects.heading).toBeVisible();

    const results = await makeAxeBuilder().analyze();
    const found = new Set(results.violations.map((v) => v.id));

    expect(found).toEqual(EXPECTED_VIOLATIONS);
  });
});
