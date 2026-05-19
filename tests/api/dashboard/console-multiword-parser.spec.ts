import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface ConsoleResponse {
  lines?: string[];
}

async function sendCommand(
  apiClient: import('@playwright/test').APIRequestContext,
  command: string,
): Promise<string> {
  const response = await apiClient.post('/api/console', { data: { command } });
  expect(response.status()).toBe(200);
  const body = (await response.json()) as ConsoleResponse;
  return (body.lines ?? []).join('\n');
}

test.describe('@dashboard @bug-117 legacy console rejects every multi-word command its own HELP advertises', () => {
  test('LIST alone returns the usage hint (verb is known) but LIST OPERATORS / LIST PROTOCOLS / READ <env-held OPID> currently fail with "Command not recognised"', async ({
    apiClient,
  }) => {
    const listAlone = await sendCommand(apiClient, 'LIST');
    expect(
      listAlone,
      'BUG-117 precondition: LIST alone currently returns the usage hint (verb is recognized)',
    ).toMatch(/Usage: LIST OPERATORS \| LIST PROTOCOLS/);

    const listOperators = await sendCommand(apiClient, 'LIST OPERATORS');
    expect(
      listOperators,
      'BUG-117: LIST OPERATORS currently returns "Command not recognised" despite HELP advertising it',
    ).toContain('Command not recognised');

    const listProtocols = await sendCommand(apiClient, 'LIST PROTOCOLS');
    expect(
      listProtocols,
      'BUG-117: LIST PROTOCOLS currently returns "Command not recognised" despite HELP advertising it',
    ).toContain('Command not recognised');

    const readOp = await sendCommand(apiClient, `READ ${env.T_OPID_LITERAL_02}`);
    expect(
      readOp,
      'BUG-117: READ <env-held OPID> currently returns "Command not recognised" — the parser fault is not LIST-specific',
    ).toContain('Command not recognised');
  });
});
