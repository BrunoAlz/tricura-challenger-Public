import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@auth /login form sensitive prefill', () => {
  test('@bug-087 case-token input currently pre-populates with the live IRIS_CASE_TOKEN when a prior session exists', async ({
    page,
  }) => {
    const login = new LoginPage(page);
    await login.goto();
    await expect(login.caseTokenInput).toBeVisible();
    await expect(
      login.caseTokenInput,
      'BUG-087: case-token input currently exposes the secret in its value attribute',
    ).toHaveValue(env.IRIS_CASE_TOKEN);
  });
});
