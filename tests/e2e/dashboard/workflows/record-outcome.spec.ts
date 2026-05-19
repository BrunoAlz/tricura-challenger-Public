import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { env } from '@config/env';
import { SessionsApi } from '@api/admin/SessionsApi';
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

async function createApprovedSession(sessionId: string): Promise<void> {
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
      throw new Error(`workflow 3 precondition: create returned ${resp.status()}`);
    }
  });
  await withRole('senior_coordinator', async (ctx) => {
    const sessions = new SessionsApi(ctx);
    const resp = await sessions.approve(sessionId);
    if (resp.status() >= 400) {
      throw new Error(`workflow 3 precondition: approve returned ${resp.status()}`);
    }
  });
}

interface SessionState {
  state: string;
  completed_at: string | null;
}

async function readSession(sessionId: string): Promise<SessionState> {
  return withRole('senior_coordinator', async (ctx) => {
    const sessions = new SessionsApi(ctx);
    const resp = await sessions.get(sessionId);
    expect(resp.status()).toBe(200);
    return (await resp.json()) as SessionState;
  });
}

test.describe('@workflow @record-outcome Senior progresses approved session through lifecycle', () => {
  test('approved → in-progress → completed via API', async () => {
    const sessionId = `wf3-api-${Date.now()}`;
    await createApprovedSession(sessionId);

    await withRole('senior_coordinator', async (ctx) => {
      const sessions = new SessionsApi(ctx);

      const initial = await readSession(sessionId);
      expect(initial.state).toBe('approved');
      expect(initial.completed_at).toBeNull();

      const startResp = await sessions.start(sessionId);
      expect(startResp.status()).toBe(200);
      const afterStart = await readSession(sessionId);
      expect(afterStart.state).toBe('in-progress');
      expect(afterStart.completed_at).toBeNull();

      const completeResp = await sessions.complete(sessionId);
      expect(completeResp.status()).toBe(200);
      const afterComplete = await readSession(sessionId);
      expect(afterComplete.state).toBe('completed');
      expect(afterComplete.completed_at).not.toBeNull();
    });
  });

  test.fixme('@bug-113 UI exposes Start + Complete affordance for an approved session', async ({
    page,
  }) => {
    const sessionId = `wf3-ui-${Date.now()}`;
    await createApprovedSession(sessionId);

    await gotoAdmin(page, `/admin/sessions/${sessionId}`);
    await expect(page.getByRole('heading', { name: new RegExp(sessionId) })).toBeVisible();

    const startBtn = page.getByRole('button', { name: /^start/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    expect((await readSession(sessionId)).state).toBe('in-progress');

    const obsField = page.getByLabel(/observation|outcome|notes/i);
    await expect(obsField).toBeVisible();
    await obsField.fill('Workflow test observation: completed successfully.');

    const completeBtn = page.getByRole('button', { name: /^complete/i });
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();
    const after = await readSession(sessionId);
    expect(after.state).toBe('completed');
    expect(after.completed_at).not.toBeNull();
  });
});
