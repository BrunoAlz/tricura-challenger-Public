import { test, expect } from '@fixtures/a11y.fixture';
import { HeritagePage } from '@pages/public/HeritagePage';

const EXPECTED_VIOLATIONS = new Set<string>([
  'color-contrast',
]);

test.describe('@a11y @public Heritage page', () => {
  test('WCAG 2.1 AA violation set matches expected pins', async ({ page, makeAxeBuilder }) => {
    const heritage = new HeritagePage(page);
    await heritage.goto();
    await expect(heritage.heading).toBeVisible();

    const results = await makeAxeBuilder().analyze();
    const found = new Set(results.violations.map((v) => v.id));

    expect(found).toEqual(EXPECTED_VIOLATIONS);
  });
});
