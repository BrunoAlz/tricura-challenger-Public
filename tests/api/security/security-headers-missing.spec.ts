import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/director.json' });

const EXPECTED_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
] as const;

const REPRESENTATIVE_ENDPOINTS = [
  '/',
  '/admin/audit',
  '/api/health',
  '/api/auth/me',
  '/api/admin/dashboard',
  '/api/admin/audit',
] as const;

test.describe('@security @bug-120 HTTP responses ship with zero browser security headers', () => {
  for (const path of REPRESENTATIVE_ENDPOINTS) {
    test(`response from ${path} currently lacks all 6 standard security headers`, async ({
      apiClient,
    }) => {
      // BUG-120 latch: every probed endpoint must currently return at least
      // ONE response that contains zero of the six standard browser security
      // headers (CSP, HSTS, XFO, XCTO, Referrer-Policy, Permissions-Policy).
      // When middleware is added to set any of them, the matching endpoint's
      // assertion below flips and the spec fails — at which point we update
      // the latch to reflect the new (post-fix) baseline.
      const response = await apiClient.fetch(path, { failOnStatusCode: false });
      const received = Object.keys(response.headers()).map((h) => h.toLowerCase());
      const present = EXPECTED_HEADERS.filter((h) => received.includes(h));
      expect(
        present,
        `BUG-120: ${path} currently advertises none of [${EXPECTED_HEADERS.join(', ')}]`,
      ).toEqual([]);
    });
  }
});
