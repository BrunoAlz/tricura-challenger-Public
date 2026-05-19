import { Page, Locator, expect } from '@playwright/test';
import { AdminSidebar } from '@pages/components/AdminSidebar';
import { AdminTopBar } from '@pages/components/AdminTopBar';

export class AdminApparatusPage {
  readonly sidebar: AdminSidebar;
  readonly topBar: AdminTopBar;
  readonly heading: Locator;

  constructor(public page: Page) {
    this.sidebar = new AdminSidebar(page);
    this.topBar = new AdminTopBar(page);

    this.heading = page.getByRole('heading', { name: 'Apparatus catalog', exact: true });
  }

  async goto() {
    await this.sidebar.apparatusLink.click();
    await expect(this.heading).toBeVisible();
  }

  apparatusCard(apparatusId: string): Locator {
    return this.page.getByText(apparatusId, { exact: true }).first();
  }
}
