import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/director.json' });

interface MethodologyPayload {
  formula?: string;
  unknowns?: Array<{ name: string; value: number | null; source?: string }>;
  exclusions?: string[];
}

test.describe('@dashboard /api/admin/methodology unknowns', () => {
  test('@bug-037 methodology endpoint currently exposes M(legacy) AND Q4 cutoff as unknowns with value=null (upstream legacy systems unlinked)', async ({
    apiClient,
  }) => {
    const response = await apiClient.get('/api/admin/methodology');
    expect(response.status()).toBe(200);
    const body = (await response.json()) as MethodologyPayload;
    expect(Array.isArray(body.unknowns)).toBe(true);

    const mLegacy = body.unknowns!.find((u) => u.name === 'M(legacy)');
    const q4Cutoff = body.unknowns!.find((u) => u.name === 'Q4 cutoff');

    expect(
      mLegacy,
      'BUG-037: methodology should currently list M(legacy) as an unknown',
    ).toBeDefined();
    expect(
      mLegacy!.value,
      'BUG-037: M(legacy) currently has value=null (legacy system unlinked)',
    ).toBeNull();

    expect(
      q4Cutoff,
      'BUG-037: methodology should currently list Q4 cutoff as an unknown',
    ).toBeDefined();
    expect(
      q4Cutoff!.value,
      'BUG-037: Q4 cutoff currently has value=null (legacy system unlinked)',
    ).toBeNull();
  });
});
