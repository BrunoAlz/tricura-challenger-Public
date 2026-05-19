import { Page, Locator, expect, Download } from '@playwright/test';
import { AdminSidebar } from '@pages/components/AdminSidebar';
import { AdminTopBar } from '@pages/components/AdminTopBar';

export class AdminReportsPage {
  readonly sidebar: AdminSidebar;
  readonly topBar: AdminTopBar;
  readonly heading: Locator;
  readonly exportCsvLink: Locator;
  readonly exportCsvButton: Locator;
  readonly exportPdfButton: Locator;
  readonly operatorFormatButton: Locator;

  constructor(public page: Page) {
    this.sidebar = new AdminSidebar(page);
    this.topBar = new AdminTopBar(page);

    this.heading = page.getByRole('heading', { name: /reports.*export/i });
    this.exportCsvLink = page.getByRole('link', { name: /export csv/i });
    this.exportCsvButton = page.getByRole('button', { name: /export csv/i });
    this.exportPdfButton = page.getByRole('button', { name: /export pdf/i });
    this.operatorFormatButton = page.getByRole('button', { name: /operator format/i });
  }

  async goto() {
    await this.sidebar.reportsLink.click();
    await expect(this.heading).toBeVisible();
  }

  async downloadCsv(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportCsvLink.click();
    return downloadPromise;
  }
}
