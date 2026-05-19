import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/director.json' });

interface ConsoleResponse {
  lines?: string[];
}

test.describe('@dashboard @bug-023 legacy console HELP omits RESTORE', () => {
  test('HELP currently lists the available commands but does NOT include RESTORE, even though READ OP-007 instructs operators to use it', async ({
    apiClient,
  }) => {
    const response = await apiClient.post('/api/console', { data: { command: 'HELP' } });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as ConsoleResponse;
    const helpText = (body.lines ?? []).join('\n');
    expect(
      helpText,
      'BUG-023: HELP output currently omits RESTORE despite the command being valid',
    ).not.toMatch(/RESTORE/);
  });
});
