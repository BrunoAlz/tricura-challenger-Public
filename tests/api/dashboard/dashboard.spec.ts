import { test, expect } from '@fixtures/auth.fixture';

test.describe('@smoke @dashboard API admin dashboard', () => {
  test.describe('authenticated', () => {
    test.use({ storageState: 'playwright/.auth/test_subject.json' });

    test('GET /api/admin/dashboard returns 200 when logged in', async ({ dashboardApi }) => {
      const response = await dashboardApi.get();
      expect(response.status()).toBe(200);
    });

    test('dashboard response is a non-empty object', async ({ dashboardApi }) => {
      const response = await dashboardApi.get();
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(typeof body).toBe('object');
      expect(body).not.toBeNull();
      expect(Object.keys(body).length).toBeGreaterThan(0);
    });
  });

  test.describe('unauthenticated', () => {
    test('GET /api/admin/dashboard returns 4xx when NOT logged in', async ({ dashboardApi }) => {
      const response = await dashboardApi.get();
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });
  });
});
