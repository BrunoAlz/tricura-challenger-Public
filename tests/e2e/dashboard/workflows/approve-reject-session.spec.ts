import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { env } from '@config/env';
import { SessionsApi } from '@api/admin/SessionsApi';
import { AdminApprovalsPage } from '@pages/admin/AdminApprovalsPage';
import { gotoAdmin } from '@utils/spa-nav';


test.use({ storageState: 'playwright/.auth/senior_coordinator.json' });

async function withRole<T>(
  roleSlug: 'junior_coordinator' | 'senior_coordinator',
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

async function createPendingSession(sessionId: string): Promise<void> {
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
      throw new Error(
        `workflow 2 precondition: POST /api/admin/sessions returned ${resp.status()}: ${await resp.text()}`,
      );
    }
  });
}

async function readSessionState(sessionId: string): Promise<string> {
  return withRole('senior_coordinator', async (ctx) => {
    const sessions = new SessionsApi(ctx);
    const resp = await sessions.get(sessionId);
    expect(resp.status()).toBe(200);
    const body = (await resp.json()) as { state?: string };
    expect(body.state).toBeTruthy();
    return body.state!;
  });
}

test.describe('@workflow @approve Senior approves a pending session', () => {
  test('approves via UI, verifies state via API', async ({ page }) => {
    const sessionId = `wf2-approve-${Date.now()}`;
    await createPendingSession(sessionId);

    await gotoAdmin(page, '/admin/approvals');
    const approvals = new AdminApprovalsPage(page);
    await expect(approvals.heading).toBeVisible();

    await approvals.approveAndWaitForServer(sessionId);
    expect(await readSessionState(sessionId)).toBe('approved');
  });
});

test.describe('@workflow @reject Senior rejects a pending session', () => {
  test('@bug-112 rejects via UI, verifies state via API', async ({ page }) => {
    const sessionId = `wf2-reject-${Date.now()}`;
    await createPendingSession(sessionId);

    await gotoAdmin(page, '/admin/approvals');
    const approvals = new AdminApprovalsPage(page);
    await expect(approvals.heading).toBeVisible();

    // BUG-112: Reject button's `title` attribute says "Approve session".
    // Asserting the swapped tooltip pins the bug — the day it flips, this
    // assertion fails and we update both the POM and the spec.
    const rejectBtn = approvals.rejectButtonFor(sessionId);
    await expect(rejectBtn).toBeVisible();
    await expect(rejectBtn).toHaveAttribute('title', 'Approve session');

    await approvals.rejectAndWaitForServer(sessionId);
    expect(await readSessionState(sessionId)).toBe('rejected');
  });
});
