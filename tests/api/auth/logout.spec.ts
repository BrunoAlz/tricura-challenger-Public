import { test, expect } from '@fixtures/auth.fixture';

test.describe('@smoke @auth API logout', () => {
  test('POST /api/auth/logout returns success when logged in', async ({ authApi, loginApiAs }) => {
    await loginApiAs('test_subject');
    const response = await authApi.logout();
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);
  });

  test('GET /api/auth/me after logout returns 4xx (session invalidated)', async ({
    authApi,
    loginApiAs,
  }) => {
    await loginApiAs('test_subject');
    await authApi.logout();
    const response = await authApi.me();
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});
