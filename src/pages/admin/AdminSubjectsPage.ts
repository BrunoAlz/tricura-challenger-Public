import { Page, Locator, expect } from '@playwright/test';
import { AdminSidebar } from '@pages/components/AdminSidebar';
import { AdminTopBar } from '@pages/components/AdminTopBar';

export class AdminSubjectsPage {
  readonly sidebar: AdminSidebar;
  readonly topBar: AdminTopBar;
  readonly heading: Locator;
  readonly description: Locator;
  readonly localSearch: Locator;
  readonly table: Locator;
  readonly detailPlaceholder: Locator;
  readonly wingUndefinedCells: Locator;
  readonly nameButtons: Locator;

  constructor(public page: Page) {
    this.sidebar = new AdminSidebar(page);
    this.topBar = new AdminTopBar(page);

    this.heading = page.getByRole('heading', { name: 'Subjects', exact: true });
    this.description = page.getByText(/active and concluded test subjects/i);
    this.localSearch = page.getByPlaceholder(/search by name/i);
    this.table = page.getByRole('table');
    this.detailPlaceholder = page.getByText(/select a subject for detail/i);

    this.wingUndefinedCells = this.table.getByText('Wing undefined');

    this.nameButtons = this.table.locator('button.text-iris-600.hover\\:underline');
  }

  async goto() {
    await this.sidebar.subjectsLink.click();
    await expect(this.heading).toBeVisible();
  }

  rowById(subjectId: string): Locator {
    return this.page.getByRole('row').filter({ hasText: subjectId });
  }
}
