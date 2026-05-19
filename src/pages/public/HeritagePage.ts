import { Page, Locator } from '@playwright/test';
import { PublicHeader } from '@pages/components/PublicHeader';
import { PublicFooter } from '@pages/components/PublicFooter';

export class HeritagePage {
  readonly header: PublicHeader;
  readonly footer: PublicFooter;
  readonly heading: Locator;
  readonly since1959Text: Locator;

  constructor(public page: Page) {
    this.header = new PublicHeader(page);
    this.footer = new PublicFooter(page);
    this.heading = page.getByRole('heading', {
      level: 1,
      name: /from iris laboratories to iris sciences/i,
    });
    this.since1959Text = page.getByText(/since 1959/i);
  }

  async goto() {
    await this.page.goto('/');
    await this.header.goToHeritage();
  }

  milestone(year: number): Locator {
    return this.page.getByText(String(year));
  }
}
