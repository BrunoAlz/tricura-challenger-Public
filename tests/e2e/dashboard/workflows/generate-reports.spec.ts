import { test, expect } from '@playwright/test';
import * as fs from 'fs/promises';
import { AdminReportsPage } from '@pages/admin/AdminReportsPage';
import { gotoAdmin } from '@utils/spa-nav';


test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@workflow @export Director exports observation reports', () => {
  test('exports CSV via the Export CSV link, file is non-empty CSV', async ({ page }) => {
    await gotoAdmin(page, '/admin/reports');
    const reports = new AdminReportsPage(page);
    await expect(reports.heading).toBeVisible();

    await expect(reports.exportCsvLink).toBeVisible();
    await expect(reports.exportCsvLink).toHaveAttribute('download', /\.csv$/i);

    const download = await reports.downloadCsv();
    expect(download.suggestedFilename()).toMatch(/observation-reports.*\.csv$/i);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();

    const content = await fs.readFile(filePath!, 'utf-8');
    expect(content.length).toBeGreaterThan(0);
    const lines = content.trim().split(/\r?\n/);
    expect(lines.length).toBeGreaterThanOrEqual(2);
    expect(lines[0]).toMatch(/report_id.*session_id.*subject_id/i);
  });

  test.fixme('@bug-114 exports PDF when the button is wired up', async ({ page }) => {
    await gotoAdmin(page, '/admin/reports');
    const reports = new AdminReportsPage(page);
    await expect(reports.exportPdfButton).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 5_000 });
    await reports.exportPdfButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });

  test.fixme('@bug-114 exports Operator format when the button is wired up', async ({ page }) => {
    await gotoAdmin(page, '/admin/reports');
    const reports = new AdminReportsPage(page);
    await expect(reports.operatorFormatButton).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 5_000 });
    await reports.operatorFormatButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('@bug-114 @bug-102 PDF + Operator buttons currently produce no side effect', async ({
    page,
  }) => {
    await gotoAdmin(page, '/admin/reports');
    const reports = new AdminReportsPage(page);
    await expect(reports.heading).toBeVisible();

    const REPORTS_API = /\/api\/admin\/reports/i;

    const pdfReq = page.waitForRequest(REPORTS_API, { timeout: 1_500 }).catch(() => null);
    const pdfDownload = page.waitForEvent('download', { timeout: 1_500 }).catch(() => null);
    await reports.exportPdfButton.click();
    expect(await pdfReq, 'PDF button should not trigger /api/admin/reports request').toBeNull();
    expect(await pdfDownload, 'PDF button should not trigger a download').toBeNull();

    const opReq = page.waitForRequest(REPORTS_API, { timeout: 1_500 }).catch(() => null);
    const opDownload = page.waitForEvent('download', { timeout: 1_500 }).catch(() => null);
    await reports.operatorFormatButton.click();
    expect(await opReq, 'Operator button should not trigger /api/admin/reports request').toBeNull();
    expect(await opDownload, 'Operator button should not trigger a download').toBeNull();
  });
});
