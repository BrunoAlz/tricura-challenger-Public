import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@dashboard @bug-013 /api/v1/legacy/exclusions leaks to Test Subject', () => {
  test('legacy exclusions endpoint currently returns 200 + excluded_session_ids to the lowest authenticated role', async ({
    apiClient,
  }) => {
    const response = await apiClient.get('/api/v1/legacy/exclusions');
    expect(
      response.status(),
      'BUG-013: legacy exclusions currently returns 200 to Test Subject',
    ).toBe(200);
    const body = (await response.json()) as { excluded_session_ids?: unknown };
    expect(
      Array.isArray(body.excluded_session_ids),
      'BUG-013: response currently exposes excluded_session_ids array to Test Subject',
    ).toBe(true);
  });
});
