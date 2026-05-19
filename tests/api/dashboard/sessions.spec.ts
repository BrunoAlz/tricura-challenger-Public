import { test, expect } from '@fixtures/auth.fixture';

interface Session {
  id?: string;
  session_id?: string;
}

function asSessionList(body: unknown): Session[] {
  if (Array.isArray(body)) return body as Session[];
  if (
    body &&
    typeof body === 'object' &&
    Array.isArray((body as { sessions?: Session[] }).sessions)
  ) {
    return (body as { sessions: Session[] }).sessions;
  }
  throw new Error('Sessions API: response is neither array nor { sessions: [...] }');
}

function sessionId(s: Session): string {
  const id = s.id ?? s.session_id;
  if (!id) throw new Error('Session missing id/session_id');
  return id;
}

test.describe('@smoke @dashboard API admin sessions', () => {
  test.describe('authenticated', () => {
    test.use({ storageState: 'playwright/.auth/test_subject.json' });

    test('GET /api/admin/sessions returns 200 + non-empty list', async ({ sessionsApi }) => {
      const response = await sessionsApi.list();
      expect(response.status()).toBe(200);
      const sessions = asSessionList(await response.json());
      expect(sessions.length).toBeGreaterThan(0);
    });

    test('GET /api/admin/sessions/{id} returns 200 for a known session', async ({
      sessionsApi,
    }) => {
      const listResp = await sessionsApi.list();
      const sessions = asSessionList(await listResp.json());
      const first = sessions[0];
      expect(first).toBeDefined();
      const detailResp = await sessionsApi.get(sessionId(first!));
      expect(detailResp.status()).toBe(200);
    });

    test('GET /api/admin/sessions/{id} returns 4xx for unknown session', async ({
      sessionsApi,
    }) => {
      const response = await sessionsApi.get('SES-DOES-NOT-EXIST');
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('unauthenticated', () => {
    test('GET /api/admin/sessions returns 4xx when NOT logged in', async ({ sessionsApi }) => {
      const response = await sessionsApi.list();
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });
  });
});

test.describe('@smoke @dashboard API session transitions (safe: invalid IDs only)', () => {
  test.use({ storageState: 'playwright/.auth/test_subject.json' });

  const INVALID = 'SES-DOES-NOT-EXIST';

  test('POST .../approve returns 4xx for unknown session', async ({ sessionsApi }) => {
    const response = await sessionsApi.approve(INVALID);
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('POST .../reject returns 4xx for unknown session', async ({ sessionsApi }) => {
    const response = await sessionsApi.reject(INVALID, { reason: 'test reject smoke' });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('POST .../cancel returns 4xx for unknown session', async ({ sessionsApi }) => {
    const response = await sessionsApi.cancel(INVALID, { reason: 'test cancel smoke' });
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('POST .../complete returns 4xx for unknown session', async ({ sessionsApi }) => {
    const response = await sessionsApi.complete(INVALID);
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });

  test('POST .../start returns 4xx for unknown session', async ({ sessionsApi }) => {
    const response = await sessionsApi.start(INVALID);
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
  });
});
