import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface AuditEntry {
  id?: string;
  action?: string;
  timestamp?: string;
  notes?: string;
}

test.describe('@dashboard @bug-082 audit currently records a 2026 reward-disbursed entry tied to the cooperative initiative the Heritage page marks as concluded in 1971', () => {
  test('/api/admin/audit currently carries a reward-disbursed entry with a 2026 timestamp that files under the disbursement-notice workflow attributing 1971 participation', async ({
    apiClient,
  }) => {
    const response = await apiClient.get('/api/admin/audit');
    expect(response.status()).toBe(200);
    const entries = (await response.json()) as AuditEntry[];
    const reward2026 = entries.find(
      (e) =>
        e.action === env.T_STR_LITERAL_07 &&
        typeof e.timestamp === 'string' &&
        e.timestamp.startsWith('2026'),
    );
    expect(
      reward2026,
      'BUG-082 precondition: audit currently records a 2026 reward-disbursed entry',
    ).toBeDefined();
    expect(
      reward2026!.notes ?? '',
      'BUG-082: the 2026 reward entry currently files under the disbursement-notice workflow whose notice IDs encode the 1971 year prefix',
    ).toMatch(new RegExp(env.T_QUOTE_LITERAL_07, 'i'));
  });
});
