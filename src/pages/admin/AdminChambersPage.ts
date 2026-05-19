import { Page, Locator, expect } from '@playwright/test';
import { AdminSidebar } from '@pages/components/AdminSidebar';
import { AdminTopBar } from '@pages/components/AdminTopBar';
import { gotoAdmin } from '@utils/spa-nav';

export class AdminChambersPage {
  readonly sidebar: AdminSidebar;
  readonly topBar: AdminTopBar;
  readonly heading: Locator;

  constructor(public page: Page) {
    this.sidebar = new AdminSidebar(page);
    this.topBar = new AdminTopBar(page);

    this.heading = page.getByRole('heading', { name: 'Chambers', exact: true });
  }

  async goto() {
    await this.sidebar.chambersLink.click();
    await expect(this.heading).toBeVisible();
  }

  chamberRow(chamberId: string): Locator {
    return this.page.getByTestId(`chamber-row-${chamberId}`);
  }

  /**
   * Navigate to the chamber detail page via the SPA router. The detail route
   * is `/admin/chambers/{id}`; some legacy chambers render a fallback panel
   * instead of the editor (BUG-039 for the legacy decommissioned chamber).
   */
  async gotoDetail(chamberId: string) {
    await gotoAdmin(this.page, `/admin/chambers/${chamberId}`);
  }

  /**
   * Locator for the fallback message that appears on chamber detail pages
   * when the modern editor is not configured for that chamber. Currently the
   * only chamber rendering it is the legacy decommissioned chamber (BUG-039).
   */
  get detailUnavailableMessage(): Locator {
    return this.page.getByText(/Detail temporarily unavailable/i);
  }
}
