import { Page, Locator } from '@playwright/test';

export class PublicHeader {
  readonly logo: Locator;
  readonly heritageLink: Locator;
  readonly reportsLink: Locator;
  readonly staffLoginLink: Locator;

  constructor(private page: Page) {
    this.logo = page.getByRole('link', { name: /iris\s*sciences/i });
    this.heritageLink = page.getByRole('link', { name: 'Heritage', exact: true });
    this.reportsLink = page.getByRole('link', { name: 'Reports', exact: true });
    this.staffLoginLink = page.getByRole('link', { name: /staff login/i });
  }

  async goHome() {
    await this.logo.click();
  }
  async goToHeritage() {
    await this.heritageLink.click();
  }
  async goToReports() {
    await this.reportsLink.click();
  }
  async goToLogin() {
    await this.staffLoginLink.click();
  }
}
