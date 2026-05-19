import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface DashboardPayload {
  qe_index?: number;
  legacy_multiplier?: number;
  cutoff?: string;
}

test.describe('@dashboard /api/admin/dashboard frozen-1971 values', () => {
  test('@bug-001 dashboard.qe_index currently reconciles with NEITHER the public reference value NOR the 1971 directive value', async ({
    dashboardApi,
  }) => {
    const response = await dashboardApi.get();
    expect(response.status()).toBe(200);
    const body = (await response.json()) as DashboardPayload;
    expect(typeof body.qe_index, 'qe_index must be a number to compare').toBe('number');
    expect(
      body.qe_index,
      'BUG-001: dashboard.qe_index currently differs from the public reference value',
    ).not.toBeCloseTo(Number(env.T_VAL_LITERAL_01), 1);
    expect(
      body.qe_index,
      'BUG-001: dashboard.qe_index currently differs from the 1971 directive value',
    ).not.toBeCloseTo(Number(env.T_VAL_LITERAL_02), 1);
  });

  test('@bug-002 dashboard.legacy_multiplier currently equals the provisional Q3-1971 weight (never updated in 55 years)', async ({
    dashboardApi,
  }) => {
    const response = await dashboardApi.get();
    expect(response.status()).toBe(200);
    const body = (await response.json()) as DashboardPayload;
    expect(
      body.legacy_multiplier,
      'BUG-002: dashboard.legacy_multiplier currently equals the provisional 1971 weight',
    ).toBe(Number(env.T_VAL_LITERAL_03));
  });

  test('@bug-003 dashboard.cutoff currently equals the exact second of the PI final action', async ({
    dashboardApi,
  }) => {
    const response = await dashboardApi.get();
    expect(response.status()).toBe(200);
    const body = (await response.json()) as DashboardPayload;
    expect(
      body.cutoff,
      "BUG-003: dashboard.cutoff currently equals the second of the PI's final action",
    ).toBe(env.T_DATE_LITERAL_01);
  });
});
