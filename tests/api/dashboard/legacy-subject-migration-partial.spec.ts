import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

const LEGACY_REGISTER_IDS: readonly string[] = [
  env.T_ID_LITERAL_06,
  env.T_ID_LITERAL_07,
  env.T_ID_LITERAL_08,
  env.T_ID_LITERAL_09,
  env.T_ID_LITERAL_01,
  env.T_ID_LITERAL_10,
  env.T_ID_LITERAL_11,
];
const PRESERVED_ID = env.T_ID_LITERAL_01;

test.describe('@dashboard @bug-073 legacy subject migration to modern admin is partial (1/7 retained)', () => {
  test(`only the preserved legacy subject currently exists in /api/admin/subjects — the other 6 legacy IDs (${LEGACY_REGISTER_IDS.filter((id) => id !== PRESERVED_ID).join(', ')}) all 404`, async ({
    subjectsApi,
  }) => {
    // BUG-073: the paper-register legacy panel lists 7 legacy subjects.
    // Only the load-bearing preserved subject — referenced by the IFR
    // cycle, the methodology page, and the disbursement chain — is
    // preserved in /api/admin/subjects. The other 6 return 404 in the
    // modern admin, even though they remain visible in the legacy register.
    //
    // The catalog's structural assertion is: any legacy ID referenced by
    // any legacy surface must either (a) exist in modern admin under the
    // same ID, or (b) be explicitly marked as legacy-only in a documented
    // migration manifest. We latch the current ratio: 1 preserved, 6 missing.
    // When the migration is completed (all 7 reachable) OR the legacy
    // register is collapsed (subjects flagged legacy-only), the assertion
    // flips.
    const results = await Promise.all(
      LEGACY_REGISTER_IDS.map(async (id) => ({
        id,
        status: (await subjectsApi.get(id)).status(),
      })),
    );
    const present = results.filter((r) => r.status === 200).map((r) => r.id);
    const missing = results.filter((r) => r.status === 404).map((r) => r.id);

    expect(
      present,
      'BUG-073 (preserved): only the preserved legacy subject currently resolves to a modern admin record',
    ).toEqual([PRESERVED_ID]);
    expect(
      missing.sort(),
      'BUG-073 (missing): the remaining 6 legacy IDs currently 404 in modern admin',
    ).toEqual(LEGACY_REGISTER_IDS.filter((id) => id !== PRESERVED_ID).slice().sort());
  });
});
