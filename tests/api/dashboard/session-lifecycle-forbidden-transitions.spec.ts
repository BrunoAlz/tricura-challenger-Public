import { test, expect, request, type APIRequestContext } from '@playwright/test';
import { env } from '@config/env';
import { SessionsApi } from '@api/admin/SessionsApi';


async function withRole(
  roleSlug: 'junior_coordinator' | 'senior_coordinator',
): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: env.IRIS_BASE_URL,
    extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
    storageState: `playwright/.auth/${roleSlug}.json`,
  });
}

async function createFreshPendingSession(): Promise<string> {
  const sid = `wf-bug-025-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const future = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
  const junior = await withRole('junior_coordinator');
  try {
    const resp = await junior.post('/api/admin/sessions', {
      data: {
        id: sid,
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
      throw new Error(`BUG-025 precondition: create returned ${resp.status()}`);
    }
    return sid;
  } finally {
    await junior.dispose();
  }
}

interface SessionState {
  state?: string;
  completed_at?: string | null;
}

test.describe('@destructive @bug-025 @dashboard session lifecycle accepts forbidden transitions', () => {
  test('@bug-025 POST /complete on a fresh pending-approval session currently succeeds (skips both approve and start)', async () => {
    const sid = await createFreshPendingSession();
    const senior = await withRole('senior_coordinator');
    try {
      const sessions = new SessionsApi(senior);
      const resp = await sessions.complete(sid);
      expect(
        resp.status(),
        'BUG-025: /complete on pending-approval currently returns 200 (skips approve+start)',
      ).toBe(200);
      const body = (await resp.json()) as SessionState;
      expect(
        body.state,
        'BUG-025: forbidden transition currently leaves the session in state="completed"',
      ).toBe('completed');
    } finally {
      await senior.dispose();
    }
  });

  test('@bug-025 POST /start on a fresh pending-approval session currently succeeds (skips approve)', async () => {
    const sid = await createFreshPendingSession();
    const senior = await withRole('senior_coordinator');
    try {
      const sessions = new SessionsApi(senior);
      const resp = await sessions.start(sid);
      expect(
        resp.status(),
        'BUG-025: /start on pending-approval currently returns 200 (skips approve)',
      ).toBe(200);
      const body = (await resp.json()) as SessionState;
      expect(
        body.state,
        'BUG-025: forbidden transition currently leaves the session in state="in-progress"',
      ).toBe('in-progress');
    } finally {
      await senior.dispose();
    }
  });

  test('@bug-025 POST /complete on an approved session currently succeeds (skips start)', async () => {
    const sid = await createFreshPendingSession();
    const senior = await withRole('senior_coordinator');
    try {
      const sessions = new SessionsApi(senior);
      const approveResp = await sessions.approve(sid);
      expect(
        approveResp.status(),
        'BUG-025 precondition: approve must succeed so we can probe the post-approve transitions',
      ).toBe(200);
      const completeResp = await sessions.complete(sid);
      expect(
        completeResp.status(),
        'BUG-025: /complete on approved currently returns 200 (skips start)',
      ).toBe(200);
      const body = (await completeResp.json()) as SessionState;
      expect(
        body.state,
        'BUG-025: forbidden transition currently leaves the session in state="completed"',
      ).toBe('completed');
    } finally {
      await senior.dispose();
    }
  });
});
