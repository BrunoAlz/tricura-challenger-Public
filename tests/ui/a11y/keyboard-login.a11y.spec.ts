import { test, expect } from '@fixtures/a11y.fixture';
import type { Locator } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';


type FocusVisibility = Record<'caseToken' | 'role' | 'password' | 'submit', boolean>;

const EXPECTED_FOCUS_VISIBLE: FocusVisibility = {
  caseToken: true,
  role: true,
  password: true,
  submit: false,
};

test.describe('@a11y @keyboard @auth Login page keyboard navigation', () => {
  test('Tab order: case token → role → password → submit', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.submitButton).toBeVisible();

    await loginPage.caseTokenInput.focus();
    await expect(loginPage.caseTokenInput).toBeFocused();

    for (const next of [loginPage.roleSelect, loginPage.passwordInput, loginPage.submitButton]) {
      await page.keyboard.press('Tab');
      await expect(next).toBeFocused();
    }
  });

  test('Focus indicator visibility per control matches expected pins', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(loginPage.submitButton).toBeVisible();

    const checks: Array<{ key: keyof FocusVisibility; locator: Locator }> = [
      { key: 'caseToken', locator: loginPage.caseTokenInput },
      { key: 'role', locator: loginPage.roleSelect },
      { key: 'password', locator: loginPage.passwordInput },
      { key: 'submit', locator: loginPage.submitButton },
    ];

    const observed: FocusVisibility = { caseToken: false, role: false, password: false, submit: false };
    for (const { key, locator } of checks) {
      await locator.focus();
      observed[key] = await locator.evaluate((el) => {
        const cs = getComputedStyle(el);
        const hasOutline = cs.outlineStyle !== 'none' && cs.outlineWidth !== '0px';
        const hasRing = cs.boxShadow !== 'none' && cs.boxShadow.length > 0;
        return hasOutline || hasRing;
      });
    }

    expect(observed).toEqual(EXPECTED_FOCUS_VISIBLE);
  });
});
