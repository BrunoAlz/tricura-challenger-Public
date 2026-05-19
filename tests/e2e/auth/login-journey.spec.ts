import { test, expect } from '@fixtures/auth.fixture';

test.describe('@smoke @auth login journey', () => {
  test('Subject logs in and reaches authenticated area', async ({ page, loginAs }) => {
    await loginAs('test_subject');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.getByRole('button', { name: /sign in/i })).toBeHidden();
  });
});
