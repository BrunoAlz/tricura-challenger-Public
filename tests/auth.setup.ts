import { test as setup } from '@playwright/test';
import { env } from '@config/env';
import { ROLES, RoleSlug } from '@config/roles';

const STORAGE_DIR = 'playwright/.auth';

const SETUP_ROLES: RoleSlug[] = [
  'test_subject',
  'junior_coordinator',
  'senior_coordinator',
  'director',
];

for (const roleSlug of SETUP_ROLES) {
  const role = ROLES[roleSlug];

  setup(`authenticate as ${roleSlug}`, async ({ page }) => {
    if (!role.password) {
      setup.skip(true, `No password configured for ${roleSlug}`);
    }
    await page.goto('/');
    await page.getByRole('link', { name: /staff login/i }).click();
    await page.getByLabel(/case token/i).fill(env.IRIS_CASE_TOKEN);
    await page.getByLabel(/role/i).selectOption(role.slug);
    await page.getByLabel(/password/i).fill(role.password);
    await page.getByRole('button', { name: /sign in|log ?in/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'));
    await page.context().storageState({ path: `${STORAGE_DIR}/${roleSlug}.json` });
  });
}
