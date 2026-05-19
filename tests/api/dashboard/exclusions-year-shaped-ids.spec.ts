import { test, expect, request } from '@playwright/test';
import { env } from '@config/env';

function asStringList(body: unknown): string[] {
  const list = (body as { excluded_session_ids?: unknown }).excluded_session_ids;
  if (!Array.isArray(list)) return [];
  return list.filter((id): id is string => typeof id === 'string');
}

test.describe('@dashboard @bug-028 legacy exclusion list contains session IDs matching year-shaped pattern', () => {
  test('/api/v1/legacy/exclusions currently includes at least one ID of the form SES-20XX, suggesting the filter matches ID substrings instead of a year field', async () => {
    const ctx = await request.newContext({
      baseURL: env.IRIS_BASE_URL,
      extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
      storageState: 'playwright/.auth/test_subject.json',
    });
    try {
      const response = await ctx.get('/api/v1/legacy/exclusions');
      expect(response.status()).toBe(200);
      const ids = asStringList(await response.json());
      const yearShaped = ids.filter((id) => /^SES-20\d{2}$/.test(id));
      expect(
        yearShaped.length,
        `BUG-028: exclusion list currently contains ${yearShaped.length} year-shaped IDs (sample: ${JSON.stringify(yearShaped.slice(0, 3))})`,
      ).toBeGreaterThan(0);
    } finally {
      await ctx.dispose();
    }
  });
});
