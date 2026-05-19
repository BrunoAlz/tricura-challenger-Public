import { test, expect, request } from '@playwright/test';
import { env } from '@config/env';

const ONBOARDING_PDF = env.T_PATH_LITERAL_06;
const ONBOARDING_AUDIT_ID = (() => {
  const match = ONBOARDING_PDF.match(/onboarding-([a-z]+)-\d{8}\.pdf$/i);
  const surname = match?.[1]?.toUpperCase() ?? 'UNKNOWN';
  return `INC-2026-ONBOARD-${surname}`;
})();

test.describe('@auth onboarding PDF disclosure', () => {
  test('@bug-007 onboarding PDF currently returns 200 to a request carrying only X-Case-Token (no admin auth)', async () => {
    test.skip(
      !ONBOARDING_PDF,
      'T_PATH_LITERAL_06 not set — BUG-007 latch cannot run',
    );
    const ctx = await request.newContext({
      baseURL: env.IRIS_BASE_URL,
      extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
    });
    try {
      const response = await ctx.get(ONBOARDING_PDF);
      expect(
        response.status(),
        'BUG-007: PDF should currently be reachable with only X-Case-Token',
      ).toBe(200);
      expect(
        response.headers()['content-type'] ?? '',
        'BUG-007: response should currently identify as a PDF',
      ).toMatch(/pdf/i);
    } finally {
      await ctx.dispose();
    }
  });

  test('@bug-008 onboarding audit entry currently still carries "rotation pending" — the Director temp credential is not rotated', async () => {
    test.skip(
      !ONBOARDING_PDF,
      'T_PATH_LITERAL_06 not set — onboarding audit id cannot be derived',
    );
    const ctx = await request.newContext({
      baseURL: env.IRIS_BASE_URL,
      extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
      storageState: 'playwright/.auth/director.json',
    });
    try {
      const response = await ctx.get('/api/admin/audit');
      expect(response.status()).toBe(200);
      const entries = (await response.json()) as Array<{
        id?: string;
        notes?: string;
        timestamp?: string;
      }>;
      const onboarding = entries.find((e) => e.id === ONBOARDING_AUDIT_ID);
      expect(
        onboarding,
        `BUG-008: audit should currently contain the onboarding entry ${ONBOARDING_AUDIT_ID}`,
      ).toBeDefined();
      expect(
        onboarding!.notes ?? '',
        'BUG-008: onboarding entry currently says "rotation pending"',
      ).toMatch(/rotation pending/i);

      expect(typeof onboarding!.timestamp).toBe('string');
      const issuedAt = new Date(onboarding!.timestamp!);
      const ageDays = (Date.now() - issuedAt.getTime()) / (1000 * 60 * 60 * 24);
      expect(
        ageDays,
        `BUG-008: onboarding entry timestamp is currently ${ageDays.toFixed(0)} days old (policy is 7)`,
      ).toBeGreaterThan(7);
    } finally {
      await ctx.dispose();
    }
  });
});
