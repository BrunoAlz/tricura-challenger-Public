import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/director.json' });

const INT64_MAX = '9223372036854775807'; 
const INT64_OVERFLOW = '9223372036854775808'; 

test.describe('@security @bug-121 int64 overflow on pagination params surfaces as 500', () => {
  test('audit?offset at int64 max still responds 200 (baseline)', async ({ apiClient }) => {
    const r = await apiClient.get(`/api/admin/audit?offset=${INT64_MAX}`);
    expect(
      r.status(),
      'baseline: offset=2^63-1 (max int64) currently returns 200 with an empty list',
    ).toBe(200);
  });

  test('audit?offset just above int64 max currently triggers an unhandled OverflowError (HTTP 500)', async ({
    apiClient,
  }) => {
    // BUG-121 latch: offset=2^63 bypasses the Pydantic Optional[int] schema
    // bound and reaches the storage layer, which raises an unhandled
    // OverflowError → HTTP 500 with the literal body "Internal Server Error".
    // The correct behavior is 422 Validation Error (same as for non-integer
    // input like "NaN" or "1.5"). When the validator clamps or rejects the
    // value, the response becomes 422 and this assertion flips.
    const r = await apiClient.fetch(`/api/admin/audit?offset=${INT64_OVERFLOW}`, {
      failOnStatusCode: false,
    });
    expect(
      r.status(),
      'BUG-121: offset=2^63 currently returns 500 (unhandled OverflowError) instead of 422',
    ).toBe(500);
  });

  test('sessions?page just above int64 max currently triggers the same 500', async ({
    apiClient,
  }) => {
    const r = await apiClient.fetch(`/api/admin/sessions?page=${INT64_OVERFLOW}`, {
      failOnStatusCode: false,
    });
    expect(
      r.status(),
      'BUG-121: page=2^63 currently returns 500 (unhandled OverflowError) instead of 422',
    ).toBe(500);
  });
});
