import { test, expect } from '@playwright/test';
import { ReportsPage } from '@pages/public/ReportsPage';

test.describe('@landing public /reports archive', () => {
  test('@bug-083 every year-shaped card link on /reports currently points back to /reports', async ({
    page,
  }) => {
    const reports = new ReportsPage(page);
    await reports.goto();
    await expect(reports.heading).toBeVisible();

    const yearLinks = page.getByRole('link', { name: /^20(1[89]|2[0-5])/ });
    const count = await yearLinks.count();
    expect(
      count,
      'BUG-083: archive should currently render at least 8 cards',
    ).toBeGreaterThanOrEqual(8);

    const hrefs = await yearLinks.evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href')),
    );
    const unique = Array.from(new Set(hrefs));
    expect(unique, 'BUG-083: every report card should currently link back to /reports').toEqual([
      '/reports',
    ]);
  });

  test('@bug-084 /reports archive currently lists no card for the current year (2026)', async ({
    page,
  }) => {
    const reports = new ReportsPage(page);
    await reports.goto();
    await expect(reports.heading).toBeVisible();

    const card2026 = page.getByRole('link', { name: /^2026/ });
    await expect(card2026, 'BUG-084: archive should currently contain no 2026 card').toHaveCount(0);
  });
});
