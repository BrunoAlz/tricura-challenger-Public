import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });


interface ConsoleResponse {
  lines?: string[];
}

test.describe(`@dashboard IFR document contracts still blocked after BUG-117 (${env.T_PROTOCOL_LITERAL_03} text only)`, () => {
  test.fixme(
    `@bug-054 ${env.T_PROTOCOL_LITERAL_03} currently states verbatim "${env.T_QUOTE_LITERAL_12}" — needs a SPA surface for PROTOCOL-N documents OR BUG-117 fix to be testable`,
    async ({ apiClient }) => {
      // BUG-054 (text half — the data-side §VI redacted-count latch is
      // already pinned by the @bug-054 test in operations-reports-ifr-71-q3-content.spec.ts).
      // Activate this once any one of the following is true:
      //   - the protocols SPA route serves the target protocol text;
      //   - a corresponding admin protocols endpoint is documented in
      //     OpenAPI;
      //   - BUG-117 is fixed and `READ <protocol>` returns the document.
      const r = await apiClient.post('/api/console', {
        data: { command: `READ ${env.T_PROTOCOL_LITERAL_03}` },
      });
      const body = (await r.json()) as ConsoleResponse;
      const text = (body.lines ?? []).join('\n');
      expect(text).toMatch(new RegExp(env.T_QUOTE_LITERAL_12, 'i'));
    },
  );
});
