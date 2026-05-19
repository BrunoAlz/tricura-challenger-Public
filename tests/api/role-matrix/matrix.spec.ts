import { test, expect } from '@playwright/test';
import { PERMISSIONS, expectationFor } from '@config/role-permissions';
import { ROLES, RoleSlug } from '@config/roles';

const ROLE_SLUGS = Object.keys(ROLES) as RoleSlug[];

for (const role of ROLE_SLUGS) {
  test.describe(`@role-matrix ${role}`, () => {
    test.use({ storageState: `playwright/.auth/${role}.json` });

    for (const ep of PERMISSIONS) {
      const expected = expectationFor(role, ep);
      const bugTag = ep.knownBug ? ` @${ep.knownBug.toLowerCase()}` : '';
      const label = `${ep.method} ${ep.path} → ${expected.toUpperCase()}${bugTag} (${ep.description})`;

      // One test per (role, endpoint, expectation) — branching on `expected`
      // happens at the describe-build phase (not inside a test body) so the
      // playwright/no-conditional-expect lint rule is satisfied.
      if (expected === 'allowed') {
        test(label, async ({ request }) => {
          const response = await request.fetch(ep.path, { method: ep.method, data: ep.body });
          expect(response.status(), `${role} should be allowed but got 403`).not.toBe(403);
          expect(response.status(), `${role} should be allowed but got 5xx`).toBeLessThan(500);
        });
      } else {
        test(label, async ({ request }) => {
          const response = await request.fetch(ep.path, { method: ep.method, data: ep.body });
          expect(
            response.status(),
            `${role} should be denied (per brief) but server returned ${response.status()}`,
          ).toBe(403);
        });
      }
    }
  });
}
