import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

interface ConsoleResponse {
  lines?: string[];
}

test.describe('@dashboard @bug-041 console LIST PROTOCOLS enumerates redacted entries to guests', () => {
  test.fixme(
    'LIST PROTOCOLS as a low-privilege role currently returns 7 rows of which 6 are "[REDACTED — PI authorisation required]" — existence/IDs/count leak even when content is hidden',
    async ({ apiClient }) => {
      const response = await apiClient.post('/api/console', {
        data: { command: 'LIST PROTOCOLS' },
      });
      expect(response.status()).toBe(200);
      const body = (await response.json()) as ConsoleResponse;
      const lines = body.lines ?? [];

      expect(
        lines.length,
        'BUG-041 contract: LIST PROTOCOLS should return all 7 protocols (the catalog count) — including those the role cannot read',
      ).toBeGreaterThanOrEqual(7);

      const joined = lines.join('\n');
      expect(
        joined,
        'BUG-041 contract: at least one row currently exposes PROTOCOL-1 by title',
      ).toContain('PROTOCOL-1');
      expect(
        joined,
        'BUG-041 contract: at least one row currently leaks existence via "[REDACTED" placeholder',
      ).toContain('[REDACTED');
    },
  );
});
