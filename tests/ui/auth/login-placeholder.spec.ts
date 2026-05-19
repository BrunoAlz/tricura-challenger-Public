import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';

test.describe('@auth login form placeholders', () => {
  test('@bug-088 case-token input currently shows placeholder "t-xxxxxxxx"', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await expect(login.caseTokenInput).toHaveAttribute('placeholder', 't-xxxxxxxx');
  });
});
