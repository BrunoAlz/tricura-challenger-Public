import { test, expect } from '@playwright/test';
import { AdminAuditPage } from '@pages/admin/AdminAuditPage';
import { gotoAdmin } from '@utils/spa-nav';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard /admin/audit rendering defects', () => {
  test('@bug-104 severity filter dropdown currently exposes Title Case option values that do not match the lowercase API field', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const audit = new AdminAuditPage(page);
    await audit.goto();
    await expect(audit.severityFilter).toBeVisible();

    for (const value of ['Info', 'Warning', 'Error', 'Critical']) {
      await expect(
        audit.severityFilter.locator(`option[value="${value}"]`),
        `BUG-104: severity filter currently has option[value="${value}"]`,
      ).toHaveCount(1);
    }
  });

  test('@bug-104 selecting any non-empty severity filter currently zeroes the audit table (Title Case option ≠ lowercase data)', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const audit = new AdminAuditPage(page);
    await audit.goto();
    await audit.waitForData();

    const baselineCount = await audit.severityDots.count();
    expect(
      baselineCount,
      'BUG-104 precondition: with no filter, the audit table currently renders rows',
    ).toBeGreaterThan(0);

    await audit.filterBySeverity('Info');
    await expect(
      audit.severityDots,
      'BUG-104: selecting Info currently empties the table (option value "Info" ≠ data value "info")',
    ).toHaveCount(0);
  });

  test('@bug-105 Halberg cutoff audit entry currently renders UI timestamp at API_UTC + 3h offset', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const audit = new AdminAuditPage(page);
    await audit.goto();

    await expect(
      page.getByText(env.T_DATE_LITERAL_02),
      'BUG-105: cutoff timestamp currently renders with a +3h offset from API UTC',
    ).toBeVisible();
  });

  test('@bug-106 audit table currently renders only 3 distinct dot colors for 4 API severity values (error + critical collapse)', async ({
    page,
  }) => {
    await gotoAdmin(page);
    const audit = new AdminAuditPage(page);
    await audit.goto();
    await audit.waitForData();

    const distinctDotClasses = await audit.distinctSeverityDotClasses();
    expect(
      distinctDotClasses,
      'BUG-106: audit dots currently use 3 classes for 4 API severities (error + critical collapse)',
    ).toHaveLength(3);
  });
});
