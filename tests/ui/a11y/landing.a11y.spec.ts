import { test, expect } from '@fixtures/a11y.fixture';
import { LandingPage } from '@pages/public/LandingPage';

const EXPECTED_VIOLATIONS = new Set<string>([
  'color-contrast',
]);

test.describe('@a11y @landing Landing page', () => {
  test('WCAG 2.1 AA violation set matches expected pins', async ({ page, makeAxeBuilder }) => {
    const landing = new LandingPage(page);
    await landing.goto();
    await expect(landing.heading).toBeVisible();

    const results = await makeAxeBuilder().analyze();
    const found = new Set(results.violations.map((v) => v.id));

    expect(found).toEqual(EXPECTED_VIOLATIONS);
  });
});
