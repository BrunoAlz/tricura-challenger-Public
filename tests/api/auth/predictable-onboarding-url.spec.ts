import { test, expect, request } from '@playwright/test';
import { env } from '@config/env';

const ONBOARDING_AUDIT_ID = (() => {
  const match = env.T_PATH_LITERAL_06.match(/onboarding-([a-z]+)-\d{8}\.pdf$/i);
  const surname = match?.[1]?.toUpperCase() ?? 'UNKNOWN';
  return `INC-2026-ONBOARD-${surname}`;
})();

test.describe('@auth @bug-009 onboarding asset URL pattern is predictable', () => {
  test('audit attachment_path currently follows /assets/audit/onboarding-<surname>-<YYYYMMDD>.pdf', async () => {
    const ctx = await request.newContext({
      baseURL: env.IRIS_BASE_URL,
      extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
      storageState: 'playwright/.auth/director.json',
    });
    try {
      const response = await ctx.get('/api/admin/audit');
      expect(response.status()).toBe(200);
      const entries = (await response.json()) as Array<{
        id?: string;
        attachment_path?: string | null;
      }>;
      const onboarding = entries.find((e) => e.id === ONBOARDING_AUDIT_ID);
      expect(
        onboarding,
        `BUG-009: audit should currently contain the onboarding entry ${ONBOARDING_AUDIT_ID}`,
      ).toBeDefined();
      expect(
        onboarding!.attachment_path ?? '',
        'BUG-009: attachment_path currently follows the predictable onboarding URL pattern',
      ).toMatch(/^\/assets\/audit\/onboarding-[a-z]+-\d{8}\.pdf$/);
    } finally {
      await ctx.dispose();
    }
  });
});
