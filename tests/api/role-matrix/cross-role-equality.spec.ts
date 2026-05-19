import { test, expect, request } from '@playwright/test';
import { env } from '@config/env';
import { PERMISSIONS } from '@config/role-permissions';

const LIST_ENDPOINTS = PERMISSIONS.filter(
  (ep) => ep.method === 'GET' && (ep.id.endsWith('.list') || ep.id === 'dashboard'),
);

async function bodyAs(roleSlug: string, path: string) {
  const ctx = await request.newContext({
    baseURL: env.IRIS_BASE_URL,
    extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
    storageState: `playwright/.auth/${roleSlug}.json`,
  });
  const r = await ctx.get(path);
  const body = await r.text();
  await ctx.dispose();
  return body;
}

for (const ep of LIST_ENDPOINTS) {
  test(`@role-matrix @bug-110 ${ep.path} differs between Test Subject and Director`, async () => {
    const subjectBody = await bodyAs('test_subject', ep.path);
    const directorBody = await bodyAs('director', ep.path);
    expect(
      subjectBody,
      `Per brief, roles see different scopes. Byte-identical = BUG-110 reproduced.`,
    ).not.toBe(directorBody);
  });
}
