import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/director.json' });

interface SessionRecord {
  id?: string;
  state?: string;
  observer_role_id?: number | null;
  approved_by?: unknown;
  approver?: unknown;
  approver_id?: unknown;
  actor_role_id?: unknown;
}

test.describe('@dashboard /api/admin/sessions approver-identity contract', () => {
  test('@bug-099 sessions in approved state currently expose no approver identity field', async ({
    sessionsApi,
  }) => {
    const listResp = await sessionsApi.list();
    expect(listResp.status()).toBe(200);
    const list = (await listResp.json()) as SessionRecord[];
    const approved = list.find((s) => s.state === 'approved');
    expect(
      approved,
      'BUG-099 precondition: at least one approved session must exist to read the payload',
    ).toBeDefined();

    const detailResp = await sessionsApi.get(approved!.id!);
    expect(detailResp.status()).toBe(200);
    const detail = (await detailResp.json()) as SessionRecord;

    expect(detail.state).toBe('approved');
    expect(
      detail.observer_role_id,
      'BUG-099: approved session currently has observer_role_id=null (no approver recorded)',
    ).toBeNull();
    expect(
      detail.approved_by,
      'BUG-099: approved session currently has no approved_by field',
    ).toBeUndefined();
    expect(
      detail.approver,
      'BUG-099: approved session currently has no approver field',
    ).toBeUndefined();
    expect(
      detail.approver_id,
      'BUG-099: approved session currently has no approver_id field',
    ).toBeUndefined();
    expect(
      detail.actor_role_id,
      'BUG-099: approved session currently has no actor_role_id field',
    ).toBeUndefined();
  });
});
