import { test, expect, request } from '@playwright/test';
import { env } from '@config/env';

test.describe('@auth @bug-026 Cookie + X-Case-Token disagreement (deferred)', () => {
  test.fixme(
    'sending a session cookie issued for one role together with a different X-Case-Token currently allows cross-role / cross-case access — requires a second case_token from the audit lead to confirm safely',
    async () => {
      const caseB = process.env.IRIS_CASE_TOKEN_B ?? '';
      expect(caseB, 'Set IRIS_CASE_TOKEN_B to activate the BUG-026 matrix probe').not.toBe('');
      const ctx = await request.newContext({
        baseURL: env.IRIS_BASE_URL,
        extraHTTPHeaders: { 'X-Case-Token': caseB },
        storageState: 'playwright/.auth/test_subject.json',
      });
      try {
        const response = await ctx.get('/api/admin/methodology');
        expect(
          response.status(),
          'BUG-026 contract: cookie for case A + header for case B must NOT yield 200 with case A data',
        ).not.toBe(200);
      } finally {
        await ctx.dispose();
      }
    },
  );
});
