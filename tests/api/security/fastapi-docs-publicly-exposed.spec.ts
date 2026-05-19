import { test, expect, request } from '@playwright/test';
import { env } from '@config/env';


async function anonContext() {
  return request.newContext({
    baseURL: env.IRIS_BASE_URL,
  });
}

test.describe('@security @bug-000 FastAPI docs/redoc/openapi.json publicly exposed', () => {
  test('/docs currently returns 200 + Swagger UI HTML without authentication', async () => {
    const ctx = await anonContext();
    try {
      const r = await ctx.get(env.T_PATH_LITERAL_04);
      expect(r.status(), 'BUG-000: /docs should require auth or be disabled in production').toBe(200);
      const body = await r.text();
      const ct = r.headers()['content-type'] ?? '';
      expect(ct, 'BUG-000: /docs currently serves text/html (Swagger UI shell)').toContain('text/html');
      expect(body, 'BUG-000: response body is the FastAPI Swagger UI shell').toContain('swagger-ui');
    } finally {
      await ctx.dispose();
    }
  });

  test('/redoc currently returns 200 + ReDoc HTML without authentication', async () => {
    const ctx = await anonContext();
    try {
      const r = await ctx.get(env.T_PATH_LITERAL_05);
      expect(r.status(), 'BUG-000: /redoc should require auth or be disabled in production').toBe(200);
      const body = await r.text();
      const ct = r.headers()['content-type'] ?? '';
      expect(ct, 'BUG-000: /redoc currently serves text/html (ReDoc shell)').toContain('text/html');
      expect(body.toLowerCase(), 'BUG-000: response body is the FastAPI ReDoc shell').toContain('redoc');
    } finally {
      await ctx.dispose();
    }
  });

  test('/openapi.json currently returns the full schema AND leaks the undocumented Chief Scientist role in /api/admin/roles description', async () => {
    const ctx = await anonContext();
    try {
      const r = await ctx.get(env.T_PATH_LITERAL_03);
      expect(r.status(), 'BUG-000: /openapi.json should require auth or be disabled').toBe(200);
      const ct = r.headers()['content-type'] ?? '';
      expect(ct, 'BUG-000: served as application/json').toContain('application/json');

      const spec = (await r.json()) as {
        paths?: Record<string, { get?: { description?: string } }>;
      };
      const rolesDesc = spec.paths?.['/api/admin/roles']?.get?.description ?? '';
      expect(
        rolesDesc,
        'BUG-000: /api/admin/roles operation description currently leaks the undocumented role name verbatim',
      ).toContain(env.T_ROLE_LITERAL_02);
    } finally {
      await ctx.dispose();
    }
  });
});
