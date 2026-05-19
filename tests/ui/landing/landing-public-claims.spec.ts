import { test, expect } from '@playwright/test';
import { LandingPage } from '@pages/public/LandingPage';
import { env } from '@config/env';

test.describe('@landing public root page claims', () => {
  test('@bug-077 root page renders the literal public QE Index value', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.goto();
    await expect(page.getByText(`${Number(env.T_VAL_LITERAL_01)}%`)).toBeVisible();
  });

  test('@bug-079 root page claims active-programs count while rendering 3 program references', async ({
    page,
  }) => {
    const landing = new LandingPage(page);
    await landing.goto();
    // BUG-079: two simultaneous observables — the claim text states a count
    // and the page currently renders exactly 3 distinct PRG-XXX references.
    // A real fix requires both to align; either assertion failing signals a
    // partial change worth triaging.
    await expect(page.getByText(new RegExp(env.T_QUOTE_LITERAL_13, 'i'))).toBeVisible();
    const programs = page.getByText(/PRG-\d{3}/);
    await expect(programs).toHaveCount(3);
  });

  test('@bug-080 root page footer currently displays the stale copyright string', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.goto();
    // BUG-080: footer copyright is stale by 2 years (catalog observed 2026-05-16).
    // Latch the exact current string; flips the moment the year is updated.
    // The env value uses a curly © glyph; match either curly or straight.
    const copyrightYear = env.T_STR_LITERAL_09.replace(/^[©©]\s*/, '').match(/^\d{4}/)?.[0] ?? '';
    const copyrightTail = env.T_STR_LITERAL_09.replace(/^[©©]\s*\d{4}\s*/, '');
    await expect(landing.footer.copyright).toHaveText(
      new RegExp(`[©©]\\s*${copyrightYear}\\s+${copyrightTail}`),
    );
  });

  test('@bug-081 root page contains the literal welfare-monitoring claim', async ({
    page,
  }) => {
    const landing = new LandingPage(page);
    await landing.goto();
    // BUG-081: the claim is misleading per the catalog (no IFR since 1971).
    // We can only mechanically detect that the claim text exists today; a
    // human must triage whether any future edit/removal constitutes a real
    // fix or only a wording change.
    await expect(
      page.getByText(new RegExp(`${env.T_STR_LITERAL_10} and reviewed each quarter`, 'i')),
    ).toBeVisible();
  });
});
