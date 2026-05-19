import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface AuditEntry {
  id?: string;
  action?: string;
}

test.describe('@dashboard @bug-062 disbursement notice ID leaks first 8 chars of case_token', () => {
  test('audit entry for the reward disbursement currently embeds the leading 8 hex chars of the case_token verbatim in its ID', async ({
    apiClient,
  }) => {
    const response = await apiClient.get('/api/admin/audit');
    expect(response.status()).toBe(200);
    const entries = (await response.json()) as AuditEntry[];
    const reward = entries.find((e) => e.action === env.T_STR_LITERAL_07);
    expect(
      reward,
      'BUG-062 precondition: audit currently contains a reward-disbursed entry',
    ).toBeDefined();

    const match = (reward!.id ?? '').match(new RegExp(`^${env.T_PREFIX_LITERAL_02}([0-9a-f]{8})$`));
    expect(
      match,
      `BUG-062 precondition: reward audit ID currently follows the documented prefix + 8-hex pattern (got "${reward!.id}")`,
    ).not.toBeNull();

    const leakedPrefix = match![1];
    const expectedPrefix = env.IRIS_CASE_TOKEN.slice(0, 8).toLowerCase();
    expect(
      leakedPrefix,
      `BUG-062: audit ID currently leaks the first 8 chars of the case_token verbatim ("${leakedPrefix}" === "${expectedPrefix}")`,
    ).toBe(expectedPrefix);
  });
});
