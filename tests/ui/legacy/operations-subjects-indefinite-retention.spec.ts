import { test, expect } from '@playwright/test';
import { LegacyOperationsPage } from '@pages/legacy/LegacyOperationsPage';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard @bug-056 subject lifecycle records retained indefinitely (no documented purge policy)', () => {
  test('the legacy subjects panel currently renders S-001 (intake Q1 1968) — a 58-year-old subject record retained with no documented purge or anonymization policy', async ({
    page,
  }) => {
    const legacy = new LegacyOperationsPage(page);
    await legacy.gotoSubjects();

    await expect(
      legacy.body.getByText('S-001', { exact: false }).first(),
      'BUG-056: S-001 currently visible in the legacy subject register (1968 intake retained indefinitely)',
    ).toBeVisible();
    await expect(
      legacy.body.getByText('Q1 1968', { exact: false }).first(),
      'BUG-056: the 1968-Q1 intake cycle currently still renders alongside the subject ID',
    ).toBeVisible();
  });
});
