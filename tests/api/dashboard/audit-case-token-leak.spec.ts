import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

const ONBOARDING_AUDIT_ID = (() => {
  const match = env.T_PATH_LITERAL_06.match(/onboarding-([a-z]+)-\d{8}\.pdf$/i);
  const surname = match?.[1]?.toUpperCase() ?? 'UNKNOWN';
  return `INC-2026-ONBOARD-${surname}`;
})();

interface AuditEntry {
  id?: string;
  target_kind?: string;
  target_id?: string;
  attachment_path?: string | null;
  notes?: string;
}

test.describe('@dashboard /api/admin/audit security disclosures', () => {
  test('@bug-065 audit currently exposes the case_token in plaintext as target_id for target_kind="case" entries', async ({
    apiClient,
  }) => {
    const response = await apiClient.get('/api/admin/audit');
    expect(response.status()).toBe(200);
    const entries = (await response.json()) as AuditEntry[];
    const caseEntries = entries.filter((e) => e.target_kind === 'case');
    expect(
      caseEntries.length,
      'BUG-065 precondition: at least one target_kind="case" entry must exist to assert on',
    ).toBeGreaterThan(0);
    const leaking = caseEntries.find((e) => e.target_id === env.IRIS_CASE_TOKEN);
    expect(
      leaking,
      'BUG-065: at least one case-kind audit entry currently has target_id === IRIS_CASE_TOKEN',
    ).toBeDefined();
  });

  test('@bug-067 audit currently records the reward-disbursement entry with attachment_path=null while onboarding entries retain an archived PDF path', async ({
    apiClient,
  }) => {
    const response = await apiClient.get('/api/admin/audit');
    expect(response.status()).toBe(200);
    const entries = (await response.json()) as AuditEntry[];

    const tokenPrefix = env.IRIS_CASE_TOKEN.slice(0, 8);
    const rewardId = `${env.T_PREFIX_LITERAL_02}${tokenPrefix}`;
    const reward = entries.find((e) => e.id === rewardId);
    expect(
      reward,
      `BUG-067 precondition: reward audit entry ${rewardId} must exist`,
    ).toBeDefined();
    expect(
      reward!.attachment_path,
      'BUG-067 (a): reward audit entry currently has attachment_path=null',
    ).toBeNull();

    const onboarding = entries.find((e) => e.id === ONBOARDING_AUDIT_ID);
    expect(
      onboarding,
      `BUG-067 precondition: onboarding audit entry ${ONBOARDING_AUDIT_ID} must exist`,
    ).toBeDefined();
    expect(
      onboarding!.attachment_path,
      'BUG-067 (b): onboarding audit entry currently retains a non-null attachment_path',
    ).not.toBeNull();
  });
});
