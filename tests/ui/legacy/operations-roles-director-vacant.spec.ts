import { test, expect } from '@playwright/test';
import { LegacyOperationsPage } from '@pages/legacy/LegacyOperationsPage';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard @bug-052 Role Registry Director shows "Vacant" since 1971 despite modern admin having an active Director', () => {
  test('legacy roles registry currently certifies the Director slot as "Vacant" with tenure "1971-" — 55 years out of sync with the modern admin active Director (onboarded 2026-03-12)', async ({
    page,
  }) => {
    const legacy = new LegacyOperationsPage(page);
    await legacy.gotoRoles();

    await expect(
      legacy.body.getByText('Vacant', { exact: false }).first(),
      'BUG-052: Role Registry currently certifies a "Vacant" entry (Director slot)',
    ).toBeVisible();
    await expect(
      legacy.body.getByText(env.T_ROLE_LITERAL_03).first(),
      'BUG-052: the Vacant entry is currently labeled with the uppercase legacy role',
    ).toBeVisible();
    await expect(
      legacy.body.getByText('1971–', { exact: false }).first(),
      'BUG-052: Director tenure currently reads "1971-" with no end year (still vacant 55 years later)',
    ).toBeVisible();
  });
});
