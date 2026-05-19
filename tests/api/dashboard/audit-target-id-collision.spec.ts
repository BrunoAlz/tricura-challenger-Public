import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface AuditEntry {
  id?: string;
  target_kind?: string;
  target_id?: string;
}

async function fetchAuditList(apiClient: import('@playwright/test').APIRequestContext) {
  const response = await apiClient.get('/api/admin/audit');
  expect(response.status()).toBe(200);
  const body = (await response.json()) as AuditEntry[];
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
  return body;
}

function countNamespaceCollisions(entries: AuditEntry[]): Array<[string, Set<string>]> {
  const kindsByTargetId = entries
    .filter(
      (e): e is AuditEntry & { target_id: string; target_kind: string } =>
        typeof e.target_id === 'string' && typeof e.target_kind === 'string',
    )
    .reduce((acc, entry) => {
      const set = acc.get(entry.target_id) ?? new Set<string>();
      set.add(entry.target_kind);
      acc.set(entry.target_id, set);
      return acc;
    }, new Map<string, Set<string>>());
  return [...kindsByTargetId.entries()].filter(([, kinds]) => kinds.size > 1);
}

test.describe('@dashboard @bug-072 audit target_id namespace collisions', () => {
  test('audit currently uses the same target_id across multiple target_kind values (namespace not type-disjoint)', async ({
    apiClient,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const collisions = countNamespaceCollisions(entries);

    expect(
      collisions.length,
      `BUG-072: audit currently has ${collisions.length} target_ids reused across kinds (${collisions
        .slice(0, 3)
        .map(([id, kinds]) => `${id}=${[...kinds].join(',')}`)
        .join('; ')})`,
    ).toBeGreaterThan(0);
  });

  test('audit references the env-held subject ID under target_kind="chamber" but the chambers lookup currently 404s while the subjects lookup is 200 — the label is factually wrong', async ({
    apiClient,
    chambersApi,
    subjectsApi,
  }) => {
    const entries = await fetchAuditList(apiClient);
    const subjectAsChamber = entries.some(
      (e) => e.target_id === env.T_ID_LITERAL_12 && e.target_kind === 'chamber',
    );
    expect(
      subjectAsChamber,
      'BUG-072 precondition: audit should currently contain an entry labeling the env-held subject ID as kind=chamber',
    ).toBe(true);

    const chamberLookup = await chambersApi.get(env.T_ID_LITERAL_12);
    expect(
      chamberLookup.status(),
      'BUG-072: chambers/<env-held ID> currently 404s — no such chamber exists',
    ).toBe(404);

    const subjectLookup = await subjectsApi.get(env.T_ID_LITERAL_12);
    expect(
      subjectLookup.status(),
      'BUG-072: subjects/<env-held ID> currently 200s — the ID is actually a subject, so the audit label is factually wrong',
    ).toBe(200);
  });
});
