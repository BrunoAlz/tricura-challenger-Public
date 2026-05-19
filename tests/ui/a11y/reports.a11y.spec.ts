import { test, expect } from '@fixtures/a11y.fixture';
import { ReportsPage } from '@pages/public/ReportsPage';

const EXPECTED_VIOLATIONS = new Set<string>([
  'color-contrast',
]);

test.describe('@a11y @public Reports page', () => {
  test('WCAG 2.1 AA violation set matches expected pins', async ({ page, makeAxeBuilder }) => {
    const reports = new ReportsPage(page);
    await reports.goto();
    await expect(reports.heading).toBeVisible();

    const results = await makeAxeBuilder().analyze();
    const found = new Set(results.violations.map((v) => v.id));

    expect(found).toEqual(EXPECTED_VIOLATIONS);
  });
});
