import { randomBytes } from 'node:crypto';
import { test, expect, request } from '@playwright/test';
import { env } from '@config/env';

const WRONG_PASSWORD_A = `bug-005-wrong-A-${randomBytes(8).toString('hex')}`;
const WRONG_PASSWORD_B = `bug-005-wrong-B-${randomBytes(8).toString('hex')}`;

test.describe('@auth @bug-005 lockout counter shared across roles', () => {
  test('attempts_remaining decrements across distinct role_ids on the same case token', async () => {
    const ctx = await request.newContext({
      baseURL: env.IRIS_BASE_URL,
      extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
    });
    try {
      const firstResp = await ctx.post('/api/auth/login', {
        multipart: { role_id: 41, password: WRONG_PASSWORD_A },
      });
      expect(firstResp.status(), 'first bad login should currently return 401').toBe(401);
      const firstAttempts = readAttemptsRemaining(await firstResp.json());

      const secondResp = await ctx.post('/api/auth/login', {
        multipart: { role_id: 42, password: WRONG_PASSWORD_B },
      });
      expect(secondResp.status(), 'second bad login should currently return 401').toBe(401);
      const secondAttempts = readAttemptsRemaining(await secondResp.json());

      expect(
        secondAttempts,
        `BUG-005: counter currently shared across role_ids — first=${firstAttempts}, second=${secondAttempts}; expected -1 decrement`,
      ).toBe(firstAttempts - 1);
    } finally {
      await ctx.dispose();
    }
  });
});

function readAttemptsRemaining(body: unknown): number {
  const obj = body as {
    attempts_remaining?: number;
    detail?: string | { attempts_remaining?: number; message?: string };
  };
  if (typeof obj.attempts_remaining === 'number') return obj.attempts_remaining;
  if (typeof obj.detail === 'object' && obj.detail !== null) {
    if (typeof obj.detail.attempts_remaining === 'number') return obj.detail.attempts_remaining;
    const fromMsg = obj.detail.message?.match(/(\d+)\s+attempts?\s+remaining/i);
    if (fromMsg) return Number(fromMsg[1]);
  }
  if (typeof obj.detail === 'string') {
    const fromStr = obj.detail.match(/(\d+)\s+attempts?\s+remaining/i);
    if (fromStr) return Number(fromStr[1]);
  }
  throw new Error(
    `BUG-005: could not extract attempts_remaining from 401 body: ${JSON.stringify(body)}`,
  );
}
