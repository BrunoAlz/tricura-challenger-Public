import { Page, Locator } from '@playwright/test';

export class PublicFooter {
  readonly root: Locator;
  readonly heritageLink: Locator;
  readonly reportsLink: Locator;
  readonly copyright: Locator;

  constructor(private page: Page) {
    this.root = page.locator('footer');
    this.heritageLink = page.getByRole('link', { name: /our heritage/i });
    this.reportsLink = page.getByRole('link', { name: /annual reports/i });
    this.copyright = this.root.getByText(/©\s*\d{4}/);
  }

  async goToHeritage() {
    await this.heritageLink.click();
  }
  async goToReports() {
    await this.reportsLink.click();
  }
}
