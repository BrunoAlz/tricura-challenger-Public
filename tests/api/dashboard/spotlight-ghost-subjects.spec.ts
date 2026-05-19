import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

const PUBLIC_SPOTLIGHT_IDS = [
  env.T_ID_LITERAL_02,
  env.T_ID_LITERAL_03,
  env.T_ID_LITERAL_01,
  env.T_ID_LITERAL_04,
] as const;
const GHOST_IDS = [env.T_ID_LITERAL_02, env.T_ID_LITERAL_03, env.T_ID_LITERAL_04] as const;
const SHARED_ID = env.T_ID_LITERAL_01;
const PUBLIC_NAME_FOR_SHARED = env.T_NAME_LITERAL_08;
const ADMIN_NAME_FOR_SHARED = env.T_STR_LITERAL_04;

test.describe('@dashboard @bug-078 public spotlight features subjects missing or renamed in admin', () => {
  test(`admin currently 404s on the 3 ghost spotlight IDs (${GHOST_IDS.join(', ')})`, async ({
    subjectsApi,
  }) => {
    // BUG-078 part 1: the public root page advertises 4 subjects but only 1
    // exists in /api/admin/subjects. The other 3 IDs resolve to 404 — the
    // public surface is fabricating subject identities. Latch: every ghost
    // ID currently 404s. When the admin catalog is reconciled with the
    // public spotlight (either by creating the records or by removing the
    // spotlight entries), at least one of these 404s flips.
    const statuses = await Promise.all(
      GHOST_IDS.map(async (id) => ({ id, status: (await subjectsApi.get(id)).status() })),
    );
    for (const { id, status } of statuses) {
      expect(
        status,
        `BUG-078 (ghost ${id}): admin currently 404s on the public-spotlight ID`,
      ).toBe(404);
    }
  });

  test(`admin record for ${SHARED_ID} currently carries a different name than the public spotlight ("${ADMIN_NAME_FOR_SHARED}" vs public "${PUBLIC_NAME_FOR_SHARED}")`, async ({
    subjectsApi,
  }) => {
    // BUG-078 part 2: the one ID that does resolve in admin carries
    // a generic placeholder name; the public spotlight presents a fully
    // styled persona. Same ID, different attributes per
    // surface — cross-surface identity drift on the institution's only
    // load-bearing legacy subject (BUG-073). Latch: admin name === the
    // current placeholder, AND that placeholder is not the public name.
    // Either fix (admin gets the persona OR the public stops fabricating)
    // flips the assertion.
    const response = await subjectsApi.get(SHARED_ID);
    expect(
      response.status(),
      `BUG-078 precondition: admin should currently 200 on ${SHARED_ID}`,
    ).toBe(200);
    const body = (await response.json()) as { name?: string };
    expect(
      body.name,
      `BUG-078: admin currently labels ${SHARED_ID} as "${ADMIN_NAME_FOR_SHARED}" instead of the public "${PUBLIC_NAME_FOR_SHARED}"`,
    ).toBe(ADMIN_NAME_FOR_SHARED);
    expect(
      body.name,
      `BUG-078: admin name should not yet match the public spotlight name "${PUBLIC_NAME_FOR_SHARED}"`,
    ).not.toBe(PUBLIC_NAME_FOR_SHARED);
  });

  test('all 4 public-spotlight IDs are documented in the test data so this spec stays comprehensive', async () => {
    // Sanity guard: the cluster's coverage rests on the 4 IDs above. If the
    // public page changes the spotlight slate, this list (and the other two
    // tests) must be updated. A failing assertion here means the spec drifted
    // out of sync with itself, not that the bug changed.
    expect(PUBLIC_SPOTLIGHT_IDS).toContain(SHARED_ID);
    expect(PUBLIC_SPOTLIGHT_IDS).toHaveLength(GHOST_IDS.length + 1);
  });
});
