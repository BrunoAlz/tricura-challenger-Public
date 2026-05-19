import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface AuditEntry {
  id?: string;
  action?: string;
  notes?: string;
  attachment_path?: string | null;
  timestamp?: string;
}

test.describe('@dashboard @bug-060 reward disbursement notice stamped with the filed-pending marker (workflow stall)', () => {
  test('the system currently logs a reward-disbursed audit entry tied to a notice whose status (per catalog) is PENDING_INDEFINITE — the audit observable today is the entry filing plus the null attachment_path that signals the notice was never archived for follow-up', async ({
    apiClient,
  }) => {
    const response = await apiClient.get('/api/admin/audit');
    expect(response.status()).toBe(200);
    const entries = (await response.json()) as AuditEntry[];
    const reward = entries.find(
      (e) =>
        e.action === env.T_STR_LITERAL_07 &&
        typeof e.timestamp === 'string' &&
        e.timestamp.startsWith('2026'),
    );
    expect(
      reward,
      'BUG-060 precondition: audit currently has a 2026 reward-disbursed entry',
    ).toBeDefined();
    expect(
      reward!.attachment_path,
      'BUG-060: the notice was never archived for follow-up (attachment_path === null) — consistent with PENDING_INDEFINITE state',
    ).toBeNull();
    expect(
      reward!.notes ?? '',
      'BUG-060: notes currently reference the disbursement-notice filing workflow',
    ).toMatch(new RegExp(env.T_QUOTE_LITERAL_07, 'i'));
  });

  test.fixme(
    'verbatim filed-pending stamp on the disbursement notice — requires the notice content to be reachable through an admin API surface',
    async ({ apiClient }) => {
      const noticeId = `${env.T_PREFIX_LITERAL_01}${env.IRIS_CASE_TOKEN.slice(0, 8)}-001`;
      const r = await apiClient.get(`/api/admin/notices/${noticeId}`);
      expect(r.status()).toBe(200);
      const body = await r.text();
      expect(body).toContain(env.T_STR_LITERAL_06);
      expect(body).toContain(env.T_QUOTE_LITERAL_08);
    },
  );
});
