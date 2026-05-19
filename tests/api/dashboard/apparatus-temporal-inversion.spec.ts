import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface Apparatus {
  id?: string;
  install_date?: string;
  last_calibrated?: string;
}

test.describe(`@dashboard @bug-035 apparatus ${env.T_APPARATUS_LITERAL_02} last_calibrated precedes install_date`, () => {
  test(`${env.T_APPARATUS_LITERAL_02} currently reports last_calibrated 2025-08-11 which is BEFORE its install_date 2025-12-05 (temporal impossibility)`, async ({
    apiClient,
  }) => {
    const response = await apiClient.get('/api/admin/apparatus');
    expect(response.status()).toBe(200);
    const apparatus = (await response.json()) as Apparatus[];
    const ap006 = apparatus.find((a) => a.id === env.T_APPARATUS_LITERAL_02);
    expect(
      ap006,
      `BUG-035 precondition: ${env.T_APPARATUS_LITERAL_02} should currently appear in /api/admin/apparatus`,
    ).toBeDefined();
    expect(
      ap006!.install_date,
      `BUG-035 (install): ${env.T_APPARATUS_LITERAL_02} install_date currently reports 2025-12-05`,
    ).toBe('2025-12-05');
    expect(
      ap006!.last_calibrated,
      `BUG-035 (calibration): ${env.T_APPARATUS_LITERAL_02} last_calibrated currently reports 2025-08-11 (before install_date)`,
    ).toBe('2025-08-11');
    expect(
      new Date(ap006!.last_calibrated!).getTime() < new Date(ap006!.install_date!).getTime(),
      `BUG-035: ${env.T_APPARATUS_LITERAL_02} last_calibrated currently precedes install_date — temporal impossibility`,
    ).toBe(true);
  });
});
