import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface AuditEntry {
  id?: string;
  severity?: string;
  action?: string;
  actor?: string;
  actor_role_id?: number | null;
  target_kind?: string;
  target_id?: string;
  timestamp?: string;
}

const NAMED_ORPHAN_OPERATOR_SURNAMES = [
  env.T_NAME_LITERAL_02,
  env.T_NAME_LITERAL_03,
  env.T_NAME_LITERAL_04,
];
const NAMED_ORPHAN_OPERATOR_PATTERN = new RegExp(
  NAMED_ORPHAN_OPERATOR_SURNAMES.join('|'),
  'i',
);

function expectedKindFor(targetId: string): string | null {
  if (/^S-/.test(targetId)) return 'subject';
  if (/^C-/.test(targetId)) return 'chamber';
  if (/^AP-/.test(targetId)) return 'apparatus';
  if (/^SES-/.test(targetId)) return 'session';
  if (/^[0-9a-f]{64}$/.test(targetId)) return 'case';
  return null;
}

async function fetchAuditList(apiClient: import('@playwright/test').APIRequestContext) {
  const response = await apiClient.get('/api/admin/audit');
  expect(response.status()).toBe(200);
  const body = (await response.json()) as AuditEntry[];
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
  return body;
}

test.describe('@dashboard /api/admin/audit data integrity', () => {
  test('@bug-070 @bug-015 audit log currently contains entries where target_kind disagrees with target_id prefix', async ({
    apiClient,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const mismatches = entries.filter((e) => {
      if (!e.target_id || !e.target_kind) return false;
      const expected = expectedKindFor(e.target_id);
      return expected !== null && expected !== e.target_kind;
    });
    expect(
      mismatches.length,
      'BUG-070: audit log currently contains target_kind/target_id prefix mismatches',
    ).toBeGreaterThan(0);
  });

  test('@bug-071 audit log currently maps the env-held decommission action to multiple distinct severities', async ({
    apiClient,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const severities = new Set(
      entries
        .filter((e) => e.action === env.T_ACTION_LITERAL_02)
        .map((e) => e.severity)
        .filter((s): s is string => typeof s === 'string'),
    );
    expect(
      severities.size,
      'BUG-071: env-held decommission action currently maps to multiple severities (no policy)',
    ).toBeGreaterThan(1);
  });

  test('@bug-075 audit log currently records env-held decommission actions while no modern apparatus or chamber actually transitions out of online', async ({
    apiClient,
    chambersApi,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const decommissionCount = entries.filter(
      (e) => e.action === env.T_ACTION_LITERAL_02,
    ).length;
    expect(
      decommissionCount,
      'BUG-075 (a): audit currently contains env-held decommission action entries',
    ).toBeGreaterThan(0);

    const chambersResp = await chambersApi.list();
    expect(chambersResp.status()).toBe(200);
    const chambers = (await chambersResp.json()) as Array<{
      id?: string;
      type?: string;
      operational_status?: string;
    }>;
    const modernNonOnline = chambers.filter(
      (c) => c.type !== 'legacy' && c.operational_status !== 'online',
    );
    expect(
      modernNonOnline,
      'BUG-075 (b): no modern chamber currently transitioned out of online despite the audit decommission entries',
    ).toEqual([]);
  });

  test('@bug-031 audit currently contains entries by named legacy operators with actor_role_id === null', async ({
    apiClient,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const orphanedNamed = entries.filter(
      (e) =>
        typeof e.actor === 'string' &&
        NAMED_ORPHAN_OPERATOR_PATTERN.test(e.actor) &&
        e.actor_role_id === null,
    );
    expect(
      orphanedNamed.length,
      'BUG-031: audit currently has named-operator entries with null actor_role_id',
    ).toBeGreaterThan(0);
  });

  test('@bug-040 legacy-transfer operator audit entries currently lack actor_role_id, so the legacy persona cannot be disambiguated from a modern role sharing the surname', async ({
    apiClient,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const sharedSurnamePattern = new RegExp(env.T_NAME_LITERAL_04, 'i');
    const aaltonenWithoutRole = entries.filter(
      (e) =>
        typeof e.actor === 'string' &&
        sharedSurnamePattern.test(e.actor) &&
        e.actor_role_id === null,
    );
    expect(
      aaltonenWithoutRole.length,
      'BUG-040: shared-surname audit entries currently carry null actor_role_id',
    ).toBeGreaterThan(0);
  });

  test('@bug-068 audit currently records the disbursement action with a past-tense, completed verb for a notice that has not actually disbursed', async ({
    apiClient,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const reward = entries.filter((e) => e.action === env.T_STR_LITERAL_07);
    expect(
      reward.length,
      'BUG-068: audit currently carries past-tense completed-disbursement entries despite no actual disbursement',
    ).toBeGreaterThan(0);
  });
});
