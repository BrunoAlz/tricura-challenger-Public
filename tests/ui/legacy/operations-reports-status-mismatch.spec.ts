import { test, expect } from '@playwright/test';
import { gotoAdmin } from '@utils/spa-nav';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

const STATUS_MISMATCH_IDS = [
  env.T_DOC_LITERAL_04,
  env.T_DOC_LITERAL_05,
  env.T_DOC_LITERAL_06,
] as const;

test.describe('@dashboard @bug-050 archived reports index labels reports AVAILABLE that their detail pages refuse to render', () => {
  test('legacy reports listing currently shows AVAILABLE status on 3 reports whose detail pages render the "not displayed" fallback', async ({
    page,
  }) => {
    await gotoAdmin(page, env.T_PATH_LITERAL_11);
    for (const id of STATUS_MISMATCH_IDS) {
      await expect(
        page.locator('body').getByText(id, { exact: false }).first(),
        `BUG-050 (index): reports listing currently includes ${id}`,
      ).toBeVisible();
    }
    // Snapshot the row text once so the AVAILABLE labelling is asserted on
    // the listing at the same point in time as the detail fallback below.
    const listText = await page.locator('body').innerText();
    for (const id of STATUS_MISMATCH_IDS) {
      const row = new RegExp(`${id}[\\s\\S]{0,160}AVAILABLE`).test(listText);
      expect(
        row,
        `BUG-050 (index): ${id} row currently displays AVAILABLE in the listing`,
      ).toBe(true);
    }

    for (const id of STATUS_MISMATCH_IDS) {
      await gotoAdmin(page, `${env.T_PATH_LITERAL_11}/${id}`);
      await expect(
        page.locator('body').getByText(env.T_QUOTE_LITERAL_05, { exact: false }).first(),
        `BUG-050 (detail): report detail for ${id} currently renders the "not displayed" fallback despite the listing saying AVAILABLE`,
      ).toBeVisible();
    }
  });
});
