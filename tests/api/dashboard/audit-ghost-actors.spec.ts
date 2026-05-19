import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface AuditEntry {
  id?: string;
  actor?: string;
  actor_role_id?: number | null;
  action?: string;
  target_id?: string;
  timestamp?: string;
  severity?: string;
}

const GHOST_ACTORS = new Set([
  env.T_NAME_LITERAL_01,
  env.T_NAME_LITERAL_02,
  env.T_NAME_LITERAL_03,
  env.T_NAME_LITERAL_04,
]);

async function fetchAuditList(apiClient: import('@playwright/test').APIRequestContext) {
  const response = await apiClient.get('/api/admin/audit');
  expect(response.status()).toBe(200);
  const body = (await response.json()) as AuditEntry[];
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
  return body;
}

function entriesInYear(entries: AuditEntry[], year: string): AuditEntry[] {
  return entries.filter((e) => typeof e.timestamp === 'string' && e.timestamp.startsWith(year));
}

test.describe('@dashboard /api/admin/audit ghost-actor entries', () => {
  test('@bug-011 audit log currently contains entries by archived founder-era operator in 2026', async ({
    apiClient,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const halberg2026 = entriesInYear(entries, '2026').filter(
      (e) => e.actor === env.T_NAME_LITERAL_01,
    );
    expect(
      halberg2026.length,
      'BUG-011: audit currently contains archived-founder entries dated 2026',
    ).toBeGreaterThan(0);
  });

  test('@bug-029 audit log currently contains entries by retired operator (BUG-029) in 2026', async ({
    apiClient,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const vogel2026 = entriesInYear(entries, '2026').filter(
      (e) => e.actor === env.T_NAME_LITERAL_02,
    );
    expect(
      vogel2026.length,
      'BUG-029: audit currently contains retired-operator entries dated 2026',
    ).toBeGreaterThan(0);
  });

  test('@bug-030 audit log currently contains entries by retired operator (BUG-030) in 2026', async ({
    apiClient,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const rasmussen2026 = entriesInYear(entries, '2026').filter(
      (e) => e.actor === env.T_NAME_LITERAL_03,
    );
    expect(
      rasmussen2026.length,
      'BUG-030: audit currently contains retired-operator entries dated 2026',
    ).toBeGreaterThan(0);
  });

  test('@bug-038 audit log currently contains a retired-operator methodology-input action entry in 2026 — a ghost operator modifying QE Index methodology inputs', async ({
    apiClient,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const match = entriesInYear(entries, '2026').filter(
      (e) => e.actor === env.T_NAME_LITERAL_03 && e.action === env.T_ACTION_LITERAL_01,
    );
    expect(
      match.length,
      'BUG-038: audit currently contains a retired-operator methodology-input action entry in 2026',
    ).toBeGreaterThan(0);
  });

  test('@bug-066 ghost-actor audit entries currently outnumber modern-director entries (dominant pattern, not edge case)', async ({
    apiClient,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const ghostCount = entries.filter((e) => e.actor && GHOST_ACTORS.has(e.actor)).length;
    const robertsonCount = entries.filter(
      (e) => e.actor === env.T_NAME_LITERAL_05 || e.actor === env.T_NAME_LITERAL_06,
    ).length;
    expect(
      ghostCount,
      `BUG-066: ghost-actor count (${ghostCount}) should currently exceed modern-director count (${robertsonCount})`,
    ).toBeGreaterThan(robertsonCount);
  });
});
