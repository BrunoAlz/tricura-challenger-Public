import { test, expect, request } from '@playwright/test';
import { env } from '@config/env';

interface ReassignSchema {
  properties?: { new_wing?: { enum?: string[] } };
}

test.describe(`@dashboard @bug-016 ReassignPayload.new_wing enum omits the Wing ${env.T_WING_LITERAL_01} that actually exists in chamber data`, () => {
  test(`chambers currently expose \`wing: "${env.T_WING_LITERAL_01}"\` (legacy ${env.T_CHAMBER_LITERAL_01}) while the OpenAPI ReassignPayload.new_wing enum only allows ["A","B","${env.T_WING_LITERAL_02}"]`, async () => {
    const ctx = await request.newContext({
      baseURL: env.IRIS_BASE_URL,
      extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
      storageState: 'playwright/.auth/director.json',
    });
    try {
      const openapiResp = await ctx.get(env.T_PATH_LITERAL_03);
      expect(openapiResp.status()).toBe(200);
      const spec = (await openapiResp.json()) as {
        components?: { schemas?: Record<string, ReassignSchema> };
      };
      const enumValues = spec.components?.schemas?.ReassignPayload?.properties?.new_wing?.enum ?? [];
      expect(
        enumValues,
        `BUG-016 (schema side): ReassignPayload.new_wing enum currently does NOT include "${env.T_WING_LITERAL_01}"`,
      ).not.toContain(env.T_WING_LITERAL_01);

      const chambersResp = await ctx.get('/api/admin/chambers');
      expect(chambersResp.status()).toBe(200);
      const chambers = (await chambersResp.json()) as Array<{ wing?: string }>;
      const deltaWings = chambers.filter((c) => c.wing === env.T_WING_LITERAL_01);
      expect(
        deltaWings.length,
        `BUG-016 (data side): chambers currently include at least one wing="${env.T_WING_LITERAL_01}" row`,
      ).toBeGreaterThan(0);
    } finally {
      await ctx.dispose();
    }
  });
});
