import { test, expect, request } from '@playwright/test';
import { env } from '@config/env';

test.describe('@dashboard @bug-055 exclusion ledger exposes no documented correction or reversal path', () => {
  test('OpenAPI currently lists only `get` on /api/v1/legacy/exclusions — no POST/PUT/PATCH/DELETE means PROTOCOL-4 append-only behavior is also schema-enforced', async () => {
    const ctx = await request.newContext({
      baseURL: env.IRIS_BASE_URL,
      extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
    });
    try {
      const response = await ctx.get('/openapi.json');
      expect(response.status()).toBe(200);
      const spec = (await response.json()) as {
        paths?: Record<string, Record<string, unknown>>;
      };
      const exclusionsPath = spec.paths?.['/api/v1/legacy/exclusions'];
      expect(
        exclusionsPath,
        'BUG-055 precondition: OpenAPI currently documents the exclusions path',
      ).toBeDefined();
      const methods = Object.keys(exclusionsPath!).sort();
      expect(
        methods,
        `BUG-055: exclusions endpoint currently exposes only ["get"] — no mutation path (got ${JSON.stringify(methods)})`,
      ).toEqual(['get']);
    } finally {
      await ctx.dispose();
    }
  });
});
