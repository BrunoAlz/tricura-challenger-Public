import { test, expect } from '@playwright/test';
import { AdminApprovalsPage } from '@pages/admin/AdminApprovalsPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard /admin/approvals action button defects', () => {
  test('@bug-097 every Approve button currently has tooltip title="Reject session" and every Reject button has title="Approve session" (tooltips swapped)', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const approvals = new AdminApprovalsPage(page);
    await approvals.goto();

    const firstApprove = approvals.approveButtons.first();
    const firstReject = approvals.rejectButtons.first();
    await expect(firstApprove).toBeVisible();
    await expect(firstReject).toBeVisible();

    await expect(
      firstApprove,
      'BUG-097: Approve button currently carries the swapped title "Reject session"',
    ).toHaveAttribute('title', 'Reject session');
    await expect(
      firstReject,
      'BUG-097: Reject button currently carries the swapped title "Approve session"',
    ).toHaveAttribute('title', 'Approve session');
  });

  test('@bug-098 every Approve button aria-label currently begins with the duplicated phrase "Approve Approve session"', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const approvals = new AdminApprovalsPage(page);
    await approvals.goto();

    const firstApprove = approvals.approveButtons.first();
    const firstReject = approvals.rejectButtons.first();
    await expect(firstApprove).toBeVisible();
    await expect(firstReject).toBeVisible();

    const approveLabel = await firstApprove.getAttribute('aria-label');
    const rejectLabel = await firstReject.getAttribute('aria-label');

    expect(
      approveLabel,
      'BUG-098: Approve aria-label currently begins with "Approve Approve session"',
    ).toMatch(/^Approve Approve session /);
    expect(
      rejectLabel,
      'BUG-098: Reject aria-label currently begins with "Reject Approve session" (contradiction)',
    ).toMatch(/^Reject Approve session /);
  });
});
