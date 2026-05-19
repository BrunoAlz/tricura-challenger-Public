import { test, expect } from '@fixtures/auth.fixture';
import { ROLES } from '@config/roles';

test.describe('@smoke @auth API me', () => {
  test('GET /api/auth/me returns the logged-in role', async ({ authApi, loginApiAs }) => {
    await loginApiAs('test_subject');
    const response = await authApi.me();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.role.id).toBe(ROLES.test_subject.id);
  });

  test('GET /api/auth/me returns 4xx when not logged in', async ({ authApi }) => {
    const response = await authApi.me();
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});
