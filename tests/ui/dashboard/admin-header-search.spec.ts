import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from '@pages/admin/AdminDashboardPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@bug-116 @dashboard admin header search input', () => {
  test('@bug-116 typing + Enter in the global admin search produces no observable side effect', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const dashboard = new AdminDashboardPage(page);
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.topBar.searchInput).toBeVisible();

    const initialUrl = page.url();

    const searchShapedRequest = page
      .waitForRequest(
        (req) => /\/api\/.*search/.test(req.url()),
        { timeout: 2_000 },
      )
      .catch(() => null);

    const anyApiMutation = page
      .waitForRequest(
        (req) => ['POST', 'PUT', 'PATCH'].includes(req.method()) && /\/api\//.test(req.url()),
        { timeout: 2_000 },
      )
      .catch(() => null);

    const navigationAway = page
      .waitForURL((url) => url.toString() !== initialUrl, { timeout: 2_000 })
      .catch(() => null);

    await dashboard.topBar.search('S-0001');

    expect(
      await searchShapedRequest,
      'header search should currently fire no /api/...search request',
    ).toBeNull();
    expect(
      await anyApiMutation,
      'header search should currently fire no mutating API call',
    ).toBeNull();
    expect(
      await navigationAway,
      'header search should currently not navigate away from /admin',
    ).toBeNull();
    expect(page.url(), 'URL should match the page we landed on').toBe(initialUrl);
  });
});
