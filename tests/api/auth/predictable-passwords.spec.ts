import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.describe('@auth predictable password pattern', () => {
  test('@bug-004 Senior Coordinator currently authenticates with the predictable password pattern (loaded from T_AUTH_LITERAL_01)', async ({
    authApi,
  }) => {
    const predictablePassword = env.T_AUTH_LITERAL_01;
    test.skip(
      !predictablePassword,
      'T_AUTH_LITERAL_01 not set — BUG-004 latch cannot run',
    );

    const seniorRoleId = Number(env.T_ROLEID_LITERAL_03);
    const response = await authApi.login(seniorRoleId, predictablePassword);
    expect(
      response.status(),
      'BUG-004: Senior login with the predictable pattern currently returns 200',
    ).toBe(200);
    const body = (await response.json()) as { role?: { id?: number } };
    expect(
      body.role?.id,
      'login payload should identify the env-held Senior Coordinator role_id',
    ).toBe(seniorRoleId);
  });
});
