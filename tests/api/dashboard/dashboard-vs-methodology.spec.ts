import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface DashboardResponse {
  legacy_multiplier?: number;
  cutoff?: string;
}

interface MethodologyUnknown {
  name?: string;
  value?: number | string | null;
}

interface MethodologyResponse {
  unknowns?: MethodologyUnknown[];
}

test.describe('@dashboard @bug-069 dashboard and methodology endpoints disagree on the same variables', () => {
  test('dashboard reports a concrete legacy_multiplier and a concrete Q4 cutoff while methodology reports both as unknown (value=null) in the same Director session', async ({
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
      'BUG-069 (dashboard side): legacy_multiplier currently exposes a concrete value',
    ).toBe(Number(env.T_VAL_LITERAL_03));
    expect(
      dashboard.cutoff,
      'BUG-069 (dashboard side): cutoff currently exposes a concrete timestamp',
    ).toBe(env.T_DATE_LITERAL_01);

    const mLegacy = (methodology.unknowns ?? []).find((u) => u.name === 'M(legacy)');
    const q4Cutoff = (methodology.unknowns ?? []).find((u) => u.name === 'Q4 cutoff');
    expect(
      mLegacy,
      'BUG-069 precondition: methodology.unknowns currently lists M(legacy)',
    ).toBeDefined();
    expect(
      q4Cutoff,
      'BUG-069 precondition: methodology.unknowns currently lists Q4 cutoff',
    ).toBeDefined();
    expect(
      mLegacy!.value,
      'BUG-069 (methodology side): M(legacy) currently reports value=null while dashboard reports a concrete legacy multiplier',
    ).toBeNull();
    expect(
      q4Cutoff!.value,
      'BUG-069 (methodology side): Q4 cutoff currently reports value=null while dashboard reports a concrete 1971 cutoff timestamp',
    ).toBeNull();
  });
});
