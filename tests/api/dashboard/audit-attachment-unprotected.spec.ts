import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

const ONBOARDING_AUDIT_ID = (() => {
  const match = env.T_PATH_LITERAL_06.match(/onboarding-([a-z]+)-\d{8}\.pdf$/i);
  const surname = match?.[1]?.toUpperCase() ?? 'UNKNOWN';
  return `INC-2026-ONBOARD-${surname}`;
})();

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@auth @bug-010 audit attachment_path readable without role elevation', () => {
  test('lowest-role authenticated user can fetch the sensitive PDF the audit log links to', async ({
    apiClient,
  }) => {
    const auditResp = await apiClient.get('/api/admin/audit');
    expect(auditResp.status()).toBe(200);
    const entries = (await auditResp.json()) as Array<{
      id?: string;
      attachment_path?: string | null;
    }>;
    const onboarding = entries.find((e) => e.id === ONBOARDING_AUDIT_ID);
    expect(
      onboarding,
      `BUG-010 precondition: audit should expose ${ONBOARDING_AUDIT_ID} to Test Subject (BUG-107)`,
    ).toBeDefined();
    expect(
      onboarding!.attachment_path,
      'BUG-010 precondition: onboarding entry currently carries an attachment_path',
    ).toBeTruthy();

    const attachmentResp = await apiClient.get(onboarding!.attachment_path!);
    expect(
      attachmentResp.status(),
      'BUG-010: attachment_path currently 200s for Test Subject — no elevation required',
    ).toBe(200);
    expect(
      attachmentResp.headers()['content-type'] ?? '',
      'BUG-010: linked attachment currently identifies as a PDF',
    ).toMatch(/pdf/i);
  });
});
