import { test, expect } from '@playwright/test';
import { gotoAdmin } from '@utils/spa-nav';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard target document transcript content latches (reachable via SPA at the document detail path)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAdmin(page, env.T_PATH_LITERAL_01);
    await expect(page.locator('body').getByText(env.T_QUOTE_LITERAL_04).first()).toBeVisible();
  });

  test(`@bug-043 target document §V line 7 currently records the QE-index correction quote — institutional metric set by PI directive, not derived from formula`, async ({
    page,
  }) => {
    await expect(
      page.locator('body').getByText(env.T_QUOTE_LITERAL_01, { exact: false }).first(),
      'BUG-043 (line 7): target document §V currently records the canonical QE-index correction quote',
    ).toBeVisible();
    await expect(
      page.locator('body').getByText(env.T_QUOTE_LITERAL_03, { exact: false }).first(),
      'BUG-043 (margin): the §V margin note currently attributes the figure to PI instruction',
    ).toBeVisible();
  });

  test('@bug-044 target document §V line 8 currently records the PI confidentiality directive verbatim', async ({
    page,
  }) => {
    await expect(
      page.locator('body').getByText(env.T_QUOTE_LITERAL_02, { exact: false }).first(),
      "BUG-044: §V currently records the PI's verbatim confidentiality directive",
    ).toBeVisible();
  });

  test(`@bug-048 target document §VI attendance currently lists the QE-relevant role as [REDACTED] and one further [REDACTED]/[REDACTED] role/name row — targeted suppression on the cycle close that produced the index correction`, async ({
    page,
  }) => {
    const redactedRoleRow = new RegExp(
      `\\[REDACTED\\][^\\n]*${env.T_STR_LITERAL_03}|${env.T_STR_LITERAL_03}[^\\n]*\\[REDACTED\\]`,
      'i',
    );
    await expect(
      page.locator('body').getByText(redactedRoleRow).first(),
      'BUG-048 (row 3): §VI currently lists the QE-relevant role as [REDACTED]',
    ).toBeVisible();
    // Body text strips row separators; assert the [REDACTED] token appears
    // at least twice in the attendance section to capture both row 3 and
    // row 5 (which has [REDACTED] in both name and role slots).
    const bodyText = await page.locator('body').innerText();
    const redactedMatches = bodyText.match(/\[REDACTED\]/g) ?? [];
    expect(
      redactedMatches.length,
      `BUG-048 (count): §VI currently contains at least 3 [REDACTED] tokens (row 3 name + row 5 name + row 5 role); got ${redactedMatches.length}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test("@bug-054 §VI quorum currently counts at least 2 redacted attendees toward the cycle-close gate — pinning the data-side half of PROTOCOL-3's redacted-rows policy", async ({
    page,
  }) => {
    // BUG-054 (data half): PROTOCOL-3 says "Redacted rows count toward
    // the gate but are not made public." The §VI evidence in the target
    // document is the operational consequence: the cycle close that
    // produced the QE-index correction was approved by quorum including
    // 2 redacted attendees (the QE-relevant role + the fully-suppressed
    // [REDACTED] row).
    //
    // The PROTOCOL-3 text itself is not currently reachable through any
    // SPA surface I've found (probed the protocols path — empty panel).
    // The console READ path is blocked by BUG-117. This spec latches
    // only the data half (§VI redacted-row count >= 2 distinct rows).
    // When §VI is sanitized — QE-relevant role de-redacted OR anonymous
    // rows replaced with a quorum-marker — at least one observable
    // flips.
    const bodyText = await page.locator('body').innerText();
    const inAttendance = bodyText.slice(bodyText.indexOf('§VI'));
    const redactedRowRegex = new RegExp(
      `\\[REDACTED\\]\\s*\\|?\\s*${env.T_STR_LITERAL_03}|\\[REDACTED\\]\\s*\\|?\\s*\\[REDACTED\\]`,
      'g',
    );
    const redactedNameRows = inAttendance.match(redactedRowRegex) ?? [];
    expect(
      redactedNameRows.length,
      `BUG-054 (data half): §VI currently has at least 2 redacted-attendee rows feeding the quorum; got ${redactedNameRows.length}`,
    ).toBeGreaterThanOrEqual(2);
  });

  test('@bug-059 the reweight rationale document currently renders the redacted-or-withdrawn fallback at PI tier — the documented rationale for the load-bearing legacy multiplier remains unrecoverable through the legacy reports surface', async ({
    page,
  }) => {
    // BUG-059: the reweight rationale document is the documented
    // rationale for the load-bearing legacy multiplier
    // (BUG-002/053). The listing at the reports index labels it
    // WITHDRAWN; the detail page renders the same "not displayed in the
    // portal (status: redacted or withdrawn)" fallback used by BUG-050,
    // confirming the report cannot be retrieved through any
    // PI-accessible surface today.
    //
    // Latch on the fallback at the detail page. When the report becomes
    // accessible (either content rendered, or an explicit "rationale
    // unavailable" disclosure replacing the fallback) the assertion
    // flips. The corresponding admin API also currently 404s (probed
    // 2026-05-19) but the operator-facing surface is /operations.
    await gotoAdmin(page, env.T_PATH_LITERAL_02);
    await expect(
      page.locator('body').getByText(env.T_QUOTE_LITERAL_05, { exact: false }).first(),
      'BUG-059: rationale-document detail currently renders the "not displayed" fallback at PI tier',
    ).toBeVisible();
  });
});
