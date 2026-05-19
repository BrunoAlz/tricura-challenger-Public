import { test as base, APIRequestContext } from '@playwright/test';
import { env } from '@config/env';
import { ROLES, RoleSlug } from '@config/roles';
import { AuthApi } from '@api/AuthApi';
import { SystemApi } from '@api/SystemApi';
import { DashboardApi } from '@api/admin/DashboardApi';
import { SubjectsApi } from '@api/admin/SubjectsApi';
import { ChambersApi } from '@api/admin/ChambersApi';
import { SessionsApi } from '@api/admin/SessionsApi';

type Fixtures = {
  apiClient: APIRequestContext;
  authApi: AuthApi;
  systemApi: SystemApi;
  dashboardApi: DashboardApi;
  subjectsApi: SubjectsApi;
  chambersApi: ChambersApi;
  sessionsApi: SessionsApi;
  loginAs: (role: RoleSlug) => Promise<void>;
  loginApiAs: (role: RoleSlug) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  apiClient: async ({ request }, use) => {
    await use(request);
  },

  authApi: async ({ apiClient }, use) => {
    await use(new AuthApi(apiClient));
  },

  systemApi: async ({ apiClient }, use) => {
    await use(new SystemApi(apiClient));
  },

  dashboardApi: async ({ apiClient }, use) => {
    await use(new DashboardApi(apiClient));
  },

  subjectsApi: async ({ apiClient }, use) => {
    await use(new SubjectsApi(apiClient));
  },

  chambersApi: async ({ apiClient }, use) => {
    await use(new ChambersApi(apiClient));
  },

  sessionsApi: async ({ apiClient }, use) => {
    await use(new SessionsApi(apiClient));
  },

  loginAs: async ({ page }, use) => {
    await use(async (roleSlug: RoleSlug) => {
      const role = ROLES[roleSlug];
      if (!role.password) {
        throw new Error(`No password configured for role "${roleSlug}". Set the env var.`);
      }
      await page.goto('/');
      await page.getByRole('link', { name: /staff login/i }).click();
      await page.getByLabel(/case token/i).fill(env.IRIS_CASE_TOKEN);
      await page.getByLabel(/role/i).selectOption(role.slug);
      await page.getByLabel(/password/i).fill(role.password);
      await page.getByRole('button', { name: /sign in|log ?in/i }).click();
    });
  },

  loginApiAs: async ({ apiClient }, use) => {
    await use(async (roleSlug: RoleSlug) => {
      const role = ROLES[roleSlug];
      if (!role.password) {
        throw new Error(`No password configured for role "${roleSlug}". Set the env var.`);
      }
      const auth = new AuthApi(apiClient);
      const response = await auth.login(role.id, role.password);
      if (response.status() !== 200) {
        const body = await response.text();
        throw new Error(`API login as "${roleSlug}" failed: HTTP ${response.status()} — ${body}`);
      }
    });
  },
});

export { expect } from '@playwright/test';
