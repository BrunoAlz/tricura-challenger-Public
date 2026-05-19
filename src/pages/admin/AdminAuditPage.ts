import { Page, Locator, expect } from '@playwright/test';
import { AdminSidebar } from '@pages/components/AdminSidebar';
import { AdminTopBar } from '@pages/components/AdminTopBar';

export class AdminAuditPage {
  readonly sidebar: AdminSidebar;
  readonly topBar: AdminTopBar;
  readonly heading: Locator;
  readonly severityLabel: Locator;
  readonly severityFilter: Locator;
  readonly severityDots: Locator;

  constructor(public page: Page) {
    this.sidebar = new AdminSidebar(page);
    this.topBar = new AdminTopBar(page);

    this.heading = page.getByRole('heading', { name: /audit.*incident log/i });
    this.severityLabel = page.getByText('Severity', { exact: true });
    this.severityFilter = page.getByRole('combobox');

    this.severityDots = page.locator('span.h-2.w-2.rounded-full');
  }

  async goto() {
    await this.sidebar.auditLink.click();
    await expect(this.heading).toBeVisible();
  }

  async filterBySeverity(value: '' | 'Info' | 'Warning' | 'Error' | 'Critical') {
    await this.severityFilter.selectOption(value);
  }

  async waitForData(): Promise<void> {
    await this.page.waitForResponse(
      (r) => r.url().includes('/api/admin/audit') && r.status() === 200,
    );
    await expect(this.severityDots.first()).toBeAttached();
  }

  async distinctSeverityDotClasses(): Promise<string[]> {
    return this.page.evaluate(() => {
      const dots = Array.from(document.querySelectorAll('span.h-2.w-2.rounded-full'));
      return Array.from(new Set(dots.map((d) => d.className)));
    });
  }
}
