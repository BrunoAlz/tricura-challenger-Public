import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface ConsoleResponse {
  lines?: string[];
  state?: { auth?: string };
}

interface AuditEntry {
  actor?: string;
}

test.describe('@dashboard @bug-034 operator name format inconsistent across surfaces', () => {
  test('legacy console and modern audit render the same operator under two different name formats', async ({
    apiClient,
  }) => {
    const whoamiResp = await apiClient.post('/api/console', { data: { command: 'WHOAMI' } });
    expect(whoamiResp.status()).toBe(200);
    const whoamiBody = (await whoamiResp.json()) as ConsoleResponse;

    test.skip(
      whoamiBody.state?.auth !== env.T_USER_LITERAL_01,
      'BUG-034 console-side latch unobservable until sandbox is reseeded — state.auth ' +
        `currently "${whoamiBody.state?.auth}".`,
    );

    const whoamiText = (whoamiBody.lines ?? []).join('\n');
    expect(
      whoamiText.toLowerCase(),
      'BUG-034 (console side): WHOAMI currently renders the operator under the console banner format',
    ).toContain(env.T_QUOTE_LITERAL_06.toLowerCase());

    const auditResp = await apiClient.get('/api/admin/audit');
    expect(auditResp.status()).toBe(200);
    const entries = (await auditResp.json()) as AuditEntry[];
    const halbergEntries = entries.filter((e) => e.actor === env.T_NAME_LITERAL_01);
    expect(
      halbergEntries.length,
      'BUG-034 (audit side): audit log currently records the same person under the canonical full-name format',
    ).toBeGreaterThan(0);
  });
});
