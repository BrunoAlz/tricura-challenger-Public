import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface DashboardResponse {
  legacy_multiplier?: number;
  cutoff?: string;
}

interface MethodologyResponse {
  formula?: string;
  unknowns?: Array<{ name?: string; value?: number | string | null; source?: string }>;
}

test.describe(`@dashboard @bug-053 "provisional" legacy multiplier has been valid since 1971 because the workflow that ends provisional state has never re-triggered`, () => {
  test('dashboard currently publishes the provisional legacy_multiplier with a cutoff timestamp from 1971 while methodology declares M(legacy) unknown — the institution is shipping a 55-year-old provisional value', async ({
    apiClient,
  }) => {
    const dashResp = await apiClient.get('/api/admin/dashboard');
    expect(dashResp.status()).toBe(200);
    const dashboard = (await dashResp.json()) as DashboardResponse;

    const methResp = await apiClient.get('/api/admin/methodology');
    expect(methResp.status()).toBe(200);
    const methodology = (await methResp.json()) as MethodologyResponse;

    expect(
      dashboard.legacy_multiplier,
      'BUG-053 (dashboard value): legacy_multiplier currently publishes the 1971 provisional value',
    ).toBe(Number(env.T_VAL_LITERAL_03));
    expect(
      dashboard.cutoff,
      'BUG-053 (workflow stall): dashboard cutoff currently still anchors to the founder-era 1971-09-14 timestamp',
    ).toBe(env.T_DATE_LITERAL_01);

    const mLegacy = (methodology.unknowns ?? []).find((u) => u.name === 'M(legacy)');
    expect(
      mLegacy,
      'BUG-053 precondition: methodology.unknowns currently surfaces M(legacy)',
    ).toBeDefined();
    expect(
      mLegacy!.value,
      'BUG-053 (no live source): methodology M(legacy) currently has value=null — there is no data feed populating the provisional value',
    ).toBeNull();
    expect(
      mLegacy!.source ?? '',
      'BUG-053 (source pointer): methodology M(legacy) currently still points at the legacy operator console as the source — the same surface the migration abandoned',
    ).toMatch(/legacy.*operator|operator.*console/i);
  });
});
