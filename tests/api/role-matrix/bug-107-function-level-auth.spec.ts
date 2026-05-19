import { test, expect } from '@fixtures/auth.fixture';


test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@bug-107 @role-matrix admin endpoints currently leak to Test Subject', () => {
  test('@bug-107 GET /api/admin/subjects currently returns 200 to Test Subject', async ({
    subjectsApi,
  }) => {
    const resp = await subjectsApi.list({ q: 's' });
    expect(
      resp.status(),
      'BUG-107: Test Subject should not see full subject PII; currently 200',
    ).toBe(200);
  });

  test('@bug-107 GET /api/admin/audit currently returns 200 to Test Subject', async ({
    apiClient,
  }) => {
    const resp = await apiClient.get('/api/admin/audit');
    expect(
      resp.status(),
      'BUG-107: Test Subject should not read the audit log; currently 200',
    ).toBe(200);
  });

  test('@bug-107 GET /api/admin/reports/export currently returns 200 to Test Subject', async ({
    apiClient,
  }) => {
    const resp = await apiClient.get('/api/admin/reports/export');
    expect(
      resp.status(),
      'BUG-107: Test Subject should not export observation-reports.csv; currently 200',
    ).toBe(200);
  });
});
