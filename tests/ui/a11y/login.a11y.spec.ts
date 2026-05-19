import { test, expect } from '@fixtures/a11y.fixture';
import { LoginPage } from '@pages/LoginPage';

const EXPECTED_VIOLATIONS = new Set<string>();

test.describe('@a11y @auth Login page', () => {
  test('WCAG 2.1 AA violation set matches expected pins', async ({ page, makeAxeBuilder }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.submitButton).toBeVisible();

    const results = await makeAxeBuilder().analyze();
    const found = new Set(results.violations.map((v) => v.id));

    expect(found).toEqual(EXPECTED_VIOLATIONS);
  });
});
