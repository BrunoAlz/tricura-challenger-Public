import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { env } from '@config/env';
import { SessionsApi } from '@api/admin/SessionsApi';


async function withRole<T>(
  roleSlug: 'junior_coordinator' | 'senior_coordinator' | 'director',
  fn: (ctx: APIRequestContext) => Promise<T>,
): Promise<T> {
  const ctx = await request.newContext({
    baseURL: env.IRIS_BASE_URL,
    extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
    storageState: `playwright/.auth/${roleSlug}.json`,
  });
  try {
    return await fn(ctx);
  } finally {
    await ctx.dispose();
  }
}

test.describe('@destructive @bug-100 @dashboard session approval does not write to the audit log', () => {
  test('@bug-100 approve as Senior, then audit log contains no entry referencing the session', async () => {
    const sessionId = `wf-bug-100-${Date.now()}`;

    await withRole('junior_coordinator', async (ctx) => {
      const future = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
      const resp = await ctx.post('/api/admin/sessions', {
        data: {
          id: sessionId,
          // FIXME ([[BUG-024]]): S-0001 row corrupted by mass-assignment
          // probe; the create handler validates the FK and 500s on its
          // serialization. S-0032 is a known-good subject (Subject 0032,
          // wing A). Restore 'S-0001' when the sandbox is reseeded.
          subject_id: 'S-0032',
          chamber_id: 'C-01',
          apparatus_id: 'AP-001',
          scheduled_for: future,
        },
      });
      if (resp.status() >= 400) {
        throw new Error(`BUG-100 precondition: create returned ${resp.status()}`);
      }
    });

    await withRole('senior_coordinator', async (ctx) => {
      const sessions = new SessionsApi(ctx);
      const approveResp = await sessions.approve(sessionId);
      expect(
        approveResp.status(),
        'BUG-100 precondition: approve must succeed for the absence-in-audit check to be meaningful',
      ).toBeLessThan(400);

      // Confirm the session transitioned. If state did not change, the
      // following audit check would be meaningless.
      const getResp = await sessions.get(sessionId);
      const detail = (await getResp.json()) as { state?: string };
      expect(detail.state).toBe('approved');
    });

    // Fetch audit as Director and assert ZERO entries reference the sandbox
    // session id. The catalog's claim: approve does not log.
    await withRole('director', async (ctx) => {
      const auditResp = await ctx.get('/api/admin/audit');
      expect(auditResp.status()).toBe(200);
      const entries = (await auditResp.json()) as Array<{ target_id?: string; notes?: string }>;
      const referencing = entries.filter(
        (e) =>
          (e.target_id && e.target_id.includes(sessionId)) ||
          (e.notes && e.notes.includes(sessionId)),
      );
      expect(
        referencing,
        `BUG-100: audit log should currently contain ZERO entries referencing ${sessionId}`,
      ).toEqual([]);
    });
  });
});
