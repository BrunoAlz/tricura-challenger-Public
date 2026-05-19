import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from '@pages/admin/AdminDashboardPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@smoke @dashboard admin dashboard', () => {
  test('renders after login with sidebar, top bar, stat cards', async ({ page }) => {
    await gotoAdmin(page);
    const dashboard = new AdminDashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.route).toBeVisible();
    await expect(dashboard.heading).toBeVisible();

    await expect(dashboard.sidebar.dashboardLink).toBeVisible();
    await expect(dashboard.sidebar.subjectsLink).toBeVisible();
    await expect(dashboard.sidebar.sessionsLink).toBeVisible();
    await expect(dashboard.sidebar.auditLink).toBeVisible();

    await expect(dashboard.topBar.searchInput).toBeVisible();
    await expect(dashboard.topBar.publicSiteLink).toBeVisible();

    await expect(dashboard.subjectsEnrolledLabel).toBeVisible();
    await expect(dashboard.sessionsRollUpLabel).toBeVisible();
    await expect(dashboard.chambersOnlineLabel).toBeVisible();

    await expect(dashboard.qeIndexSection).toBeVisible();
  });

  test('sidebar navigation: clicking Subjects goes to /admin/subjects', async ({ page }) => {
    await gotoAdmin(page);
    const dashboard = new AdminDashboardPage(page);
    await dashboard.goto();

    await dashboard.sidebar.goToSubjects();
    await expect(page).toHaveURL(/\/admin\/subjects/);
  });

  test('@bug-115 dashboard widget Approve button is a no-op (silent failure)', async ({ page }) => {
    await gotoAdmin(page);
    const dashboard = new AdminDashboardPage(page);

    await expect(dashboard.pendingApprovalsHeading).toBeVisible();

    const approveBtn = page.getByRole('button', { name: /^approve approve session /i }).first();
    await expect(approveBtn).toBeVisible();

    const approvePromise = page
      .waitForRequest(
        (req) => req.method() === 'POST' && /\/api\/admin\/sessions\/.+\/approve$/.test(req.url()),
        { timeout: 2_000 },
      )
      .catch(() => null);

    await approveBtn.click();
    const captured = await approvePromise;

    expect(captured, 'BUG-115: dashboard widget Approve should currently fire no POST').toBeNull();
  });
});
