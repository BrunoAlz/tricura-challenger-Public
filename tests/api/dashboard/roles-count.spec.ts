import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard /api/admin/roles contract', () => {
  test('@bug-021 GET /api/admin/roles currently returns 5 roles even though OpenAPI claims seven', async ({
    apiClient,
  }) => {
    const response = await apiClient.get('/api/admin/roles');
    expect(response.status()).toBe(200);
    const body = (await response.json()) as unknown[];
    expect(Array.isArray(body), '/api/admin/roles should return an array').toBe(true);
    expect(
      body,
      'BUG-021: /api/admin/roles currently returns 5 entries (OpenAPI claims 7)',
    ).toHaveLength(5);
  });
});
