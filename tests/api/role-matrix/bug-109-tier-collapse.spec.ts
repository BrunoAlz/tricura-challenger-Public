import { test, expect, request } from '@playwright/test';
import { env } from '@config/env';


type LowerRole = 'test_subject' | 'junior_coordinator' | 'senior_coordinator';
const LOWER_ROLES: readonly LowerRole[] = [
  'test_subject',
  'junior_coordinator',
  'senior_coordinator',
];

const ENDPOINTS: readonly string[] = [
  '/api/admin/subjects',
  '/api/admin/sessions',
  '/api/admin/chambers',
  '/api/admin/audit',
  '/api/admin/methodology',
];

async function statusAs(role: LowerRole, path: string): Promise<number> {
  const ctx = await request.newContext({
    baseURL: env.IRIS_BASE_URL,
    extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
    storageState: `playwright/.auth/${role}.json`,
  });
  try {
    const r = await ctx.get(path);
    return r.status();
  } finally {
    await ctx.dispose();
  }
}

test.describe('@bug-109 @role-matrix lower-tier roles collapse to a single authorization tier', () => {
  for (const path of ENDPOINTS) {
    test(`@bug-109 GET ${path} currently returns identical status to test_subject, junior_coordinator, senior_coordinator`, async () => {
      const [subjectStatus, juniorStatus, seniorStatus] = await Promise.all(
        LOWER_ROLES.map((role) => statusAs(role, path)),
      );
      expect(
        juniorStatus,
        `BUG-109: junior_coordinator should differ from test_subject on ${path}; both currently ${subjectStatus}`,
      ).toBe(subjectStatus);
      expect(
        seniorStatus,
        `BUG-109: senior_coordinator should differ from junior_coordinator on ${path}; both currently ${juniorStatus}`,
      ).toBe(juniorStatus);
    });
  }
});
