import { test, expect } from '@fixtures/auth.fixture';

test.describe('@smoke @system API health', () => {
  test('GET /api/health returns ok', async ({ systemApi }) => {
    const response = await systemApi.health();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('@bug-018 GET /api/health currently exposes the env field with value "prod"', async ({
    systemApi,
  }) => {
    const response = await systemApi.health();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.env, 'BUG-018: /api/health currently exposes env="prod"').toBe('prod');
  });
});
