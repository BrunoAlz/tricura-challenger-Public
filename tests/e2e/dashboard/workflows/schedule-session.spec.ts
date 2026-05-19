import { test, expect } from '@playwright/test';
import { AdminSessionsPage } from '@pages/admin/AdminSessionsPage';
import { gotoAdmin } from '@utils/spa-nav';
import { dodgeCorruptedS0001 } from '@utils/dodge-s0001';


test.use({ storageState: 'playwright/.auth/junior_coordinator.json' });

function nextWizardScheduledFor(): string {
  const base = new Date(Date.now() + 48 * 60 * 60 * 1000);
  base.setMinutes(base.getMinutes() + Math.floor(Math.random() * 48), 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(base.getHours())}:${pad(base.getMinutes())}`;
}

test.describe('@workflow @schedule Junior schedules a test session', () => {
  test('@bug-111 wizard submit returns 422 (UI omits required `id` field)', async ({ page }) => {
    // FIXME ([[BUG-024]]): subject <select> in the wizard is populated by an
    // unfiltered GET /api/admin/subjects which currently 500s. See helper.
    await dodgeCorruptedS0001(page);

    await gotoAdmin(page, '/admin/sessions');
    const sessions = new AdminSessionsPage(page);
    await expect(sessions.heading).toBeVisible();

    await sessions.openNewSessionWizard();

    const submitPromise = (async () => {
      await sessions.pickSubjectByIndex();
      await sessions.pickChamberByIndex();
      await sessions.pickApparatusByIndex();
      await sessions.fillScheduledFor(nextWizardScheduledFor());
      return sessions.submitWizardAndCaptureSubmit();
    })();

    const postResp = await submitPromise;
    const postBody = await postResp.json().catch(() => ({}));
    const sentPayload = postResp.request().postDataJSON() as Record<string, unknown> | null;

    expect(
      postResp.status(),
      `Expected 422 while @bug-111 stands. If 2xx, flip to assert the created session via GET /api/admin/sessions.`,
    ).toBe(422);

    expect(sentPayload, 'UI should POST a JSON body with form fields').toBeTruthy();
    expect(sentPayload).toMatchObject({
      subject_id: expect.any(String),
      chamber_id: expect.any(String),
      apparatus_id: expect.any(String),
      scheduled_for: expect.any(String),
    });
    expect(sentPayload).not.toHaveProperty('id');
    expect(postBody).toHaveProperty('detail');
    expect(JSON.stringify(postBody.detail)).toContain('id');
  });
});
