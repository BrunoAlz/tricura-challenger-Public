import { test, expect } from '@fixtures/auth.fixture';
import { request } from '@playwright/test';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface OpenApiSchema {
  additionalProperties?: boolean | object;
  properties?: Record<string, unknown>;
}

test.describe('@dashboard @bug-024 SubjectPatch additionalProperties enables mass-assignment', () => {
  test('SubjectPatch schema currently declares additionalProperties=true OR omits the constraint — the static observable; the dynamic write-through confirmation is deferred per audit', async () => {
    const ctx = await request.newContext({
      baseURL: env.IRIS_BASE_URL,
      extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
    });
    try {
      const response = await ctx.get('/openapi.json');
      expect(response.status()).toBe(200);
      const spec = (await response.json()) as {
        components?: { schemas?: Record<string, OpenApiSchema> };
      };
      const subjectPatch = spec.components?.schemas?.SubjectPatch;
      expect(
        subjectPatch,
        'BUG-024 precondition: SubjectPatch schema currently exists in OpenAPI',
      ).toBeDefined();
      expect(
        subjectPatch!.additionalProperties,
        'BUG-024: SubjectPatch currently does NOT explicitly forbid additionalProperties — mass-assignment surface is open per schema',
      ).not.toBe(false);
    } finally {
      await ctx.dispose();
    }
  });

  test.fixme(
    '[deferred] PATCH /api/admin/subjects/<sandbox> with an unexpected field currently writes through — requires sandbox subject creation that the audit deliberately deferred',
    async ({ apiClient }) => {
      const sandboxId = `wf-bug-024-${Date.now()}`;
      const createResp = await apiClient.post('/api/admin/subjects', {
        data: { id: sandboxId, name: 'BUG-024 sandbox' },
      });
      expect(createResp.status(), 'sandbox subject creation must succeed').toBe(201);

      const patchResp = await apiClient.patch(`/api/admin/subjects/${sandboxId}`, {
        data: { current_wing: env.T_WING_LITERAL_02, injected_admin_flag: true },
      });
      expect(patchResp.status()).toBe(200);

      const getResp = await apiClient.get(`/api/admin/subjects/${sandboxId}`);
      const body = (await getResp.json()) as Record<string, unknown>;
      expect(
        body.injected_admin_flag,
        'BUG-024: fabricated field should NOT write through if mass assignment is properly mitigated',
      ).toBeUndefined();

      await apiClient.delete(`/api/admin/subjects/${sandboxId}`);
    },
  );
});
