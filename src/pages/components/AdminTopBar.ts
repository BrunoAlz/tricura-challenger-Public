import { Page, Locator } from '@playwright/test';

export class AdminTopBar {
  readonly searchInput: Locator;
  readonly publicSiteLink: Locator;

  constructor(private page: Page) {
    this.searchInput = page.getByRole('searchbox', { name: /search admin records/i });
    this.publicSiteLink = page.getByRole('link', { name: /public site/i });
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async goToPublicSite() {
    await this.publicSiteLink.click();
  }
}
