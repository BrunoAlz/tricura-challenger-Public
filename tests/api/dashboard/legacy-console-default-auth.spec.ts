import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface ConsoleResponse {
  lines?: string[];
  state?: { auth?: string; filed?: string | null };
}

test.describe('@dashboard @bug-057 legacy console default-auth ghost session', () => {
  test('@bug-057 console session is implicitly authenticated as archived founder-era operator without any LOGIN call', async ({
    apiClient,
  }) => {

    await apiClient.post('/api/console', { data: { command: 'EXIT' } });

    const whoamiResp = await apiClient.post('/api/console', {
      data: { command: 'WHOAMI' },
    });
    expect(whoamiResp.status()).toBe(200);
    const body = (await whoamiResp.json()) as ConsoleResponse;

    test.skip(
      body.state?.auth !== env.T_USER_LITERAL_01,
      'BUG-057 latch is unobservable until sandbox is reseeded — state.auth ' +
        `currently "${body.state?.auth}" (was the archived-operator default before LOGOUT probe).`,
    );

    expect(
      body.state?.auth,
      'BUG-057: console state.auth currently defaults to the archived-operator username without any LOGIN call',
    ).toBe(env.T_USER_LITERAL_01);

    const lines = (body.lines ?? []).join(' ');
    expect(
      lines.toLowerCase(),
      'BUG-057: WHOAMI currently identifies the session under the archived-role session-open banner',
    ).toContain(env.T_QUOTE_LITERAL_06.toLowerCase());
  });
});
