import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@dashboard /api/admin/methodology 403 disclosure', () => {
  test('@bug-108 methodology 403 body currently discloses the exact role required ("Director of Enrichment")', async ({
    apiClient,
  }) => {
    const response = await apiClient.get('/api/admin/methodology');
    expect(response.status()).toBe(403);
    const body = (await response.json()) as { detail?: string };
    expect(
      body.detail ?? '',
      'BUG-108: 403 detail currently names the exact role required',
    ).toContain('Director of Enrichment');
  });
});
