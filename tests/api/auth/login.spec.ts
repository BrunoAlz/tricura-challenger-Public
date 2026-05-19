import { test, expect } from '@fixtures/auth.fixture';
import { ROLES } from '@config/roles';

test.describe('@smoke @auth API login', () => {
  test('Subject can authenticate via API', async ({ authApi }) => {
    const role = ROLES.test_subject;
    const response = await authApi.login(role.id, role.password);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.role.id).toBe(role.id);
  });
});
