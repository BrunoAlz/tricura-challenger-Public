import { Page, Locator } from '@playwright/test';
import { PublicHeader } from '@pages/components/PublicHeader';
import { PublicFooter } from '@pages/components/PublicFooter';

export class ReportsPage {
  readonly header: PublicHeader;
  readonly footer: PublicFooter;
  readonly heading: Locator;
  readonly subtitle: Locator;

  constructor(public page: Page) {
    this.header = new PublicHeader(page);
    this.footer = new PublicFooter(page);
    this.heading = page.getByRole('heading', { level: 1, name: /annual reports/i });
    this.subtitle = page.getByText(/audited annual reports are available for download/i);
  }

  async goto() {
    await this.page.goto('/');
    await this.header.goToReports();
  }

  reportCard(year: number): Locator {
    return this.page.getByText(String(year), { exact: false });
  }
}
