import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from '@pages/admin/AdminDashboardPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard @bug-090 pending approvals widget renders rows with no requester attribution', () => {
  test('every "requested by" caption in the dashboard pending approvals widget is currently empty (no role/user appended)', async ({
    page,
  }) => {
    const dashboard = new AdminDashboardPage(page);
    await gotoAdmin(page);
    await dashboard.goto();
    await dashboard.waitForPendingApprovalsData();

    const count = await dashboard.requestedByLabels.count();
    expect(
      count,
      'BUG-090 precondition: pending approvals widget currently renders at least one row',
    ).toBeGreaterThan(0);

    const texts = await dashboard.requestedByLabels.allTextContents();
    const nonEmpty = texts.filter((t) => t.trim() !== 'requested by');
    expect(
      nonEmpty,
      `BUG-090: every pending approval row currently lacks a requester (got ${count} rows, ${nonEmpty.length} non-empty: ${JSON.stringify(nonEmpty)})`,
    ).toEqual([]);
  });
});
