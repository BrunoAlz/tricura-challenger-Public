import { test, expect } from '@playwright/test';
import { AdminSubjectsPage } from '@pages/admin/AdminSubjectsPage';
import { gotoAdmin } from '@utils/spa-nav';
import { dodgeCorruptedS0001 } from '@utils/dodge-s0001';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard /admin/subjects table rendering defects', () => {
  test.beforeEach(async ({ page }) => {
    await dodgeCorruptedS0001(page);
  });

  test('@bug-091 every subject row currently renders the Wing column as "Wing undefined"', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const subjects = new AdminSubjectsPage(page);
    await subjects.goto();
    await expect(subjects.table).toBeVisible();

    const count = await subjects.wingUndefinedCells.count();
    expect(
      count,
      'BUG-091: subjects table should currently render "Wing undefined" cells',
    ).toBeGreaterThan(0);
  });

  test('@bug-092 subject name buttons currently render with empty text content', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const subjects = new AdminSubjectsPage(page);
    await subjects.goto();
    await expect(subjects.table).toBeVisible();

    const count = await subjects.nameButtons.count();
    expect(count, 'BUG-092: subjects table should currently expose name buttons').toBeGreaterThan(
      0,
    );

    const firstText = (await subjects.nameButtons.first().textContent()) ?? '';
    expect(firstText.trim(), 'BUG-092: first subject name button currently has empty text').toBe(
      '',
    );
  });

  test('@bug-093 subject name buttons currently have no aria-label and no title attributes', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const subjects = new AdminSubjectsPage(page);
    await subjects.goto();
    await expect(subjects.table).toBeVisible();

    const firstButton = subjects.nameButtons.first();
    await expect(firstButton).toBeAttached();
    const ariaLabel = await firstButton.getAttribute('aria-label');
    const title = await firstButton.getAttribute('title');
    expect(ariaLabel, 'BUG-093: subject name button currently has no aria-label').toBeNull();
    expect(title, 'BUG-093: subject name button currently has no title').toBeNull();
  });
});
