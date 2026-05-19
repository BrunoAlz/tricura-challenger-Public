import { Page, Locator, expect } from '@playwright/test';
import { AdminSidebar } from '@pages/components/AdminSidebar';
import { AdminTopBar } from '@pages/components/AdminTopBar';

export class AdminApprovalsPage {
  readonly sidebar: AdminSidebar;
  readonly topBar: AdminTopBar;
  readonly heading: Locator;
  readonly approveButtons: Locator;
  readonly rejectButtons: Locator;

  constructor(public page: Page) {
    this.sidebar = new AdminSidebar(page);
    this.topBar = new AdminTopBar(page);

    this.heading = page.getByRole('heading', { name: 'Approval queue', exact: true });
    this.approveButtons = page.getByRole('button', { name: /^approve approve session/i });
    this.rejectButtons = page.getByRole('button', { name: /^reject approve session/i });
  }

  async goto() {
    await this.sidebar.approvalsLink.click();
    await expect(this.heading).toBeVisible();
  }

  approveButtonFor(sessionId: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^approve.*${sessionId}`, 'i') });
  }

  rejectButtonFor(sessionId: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(`^reject.*${sessionId}`, 'i') });
  }

  async approveAndWaitForServer(sessionId: string): Promise<void> {
    const action = this.page.waitForResponse(
      (resp) =>
        resp.url().includes(`/api/admin/sessions/${sessionId}`) &&
        ['POST', 'PATCH', 'PUT'].includes(resp.request().method()) &&
        resp.status() < 400,
    );
    await this.approveButtonFor(sessionId).click();
    await action;
  }

  async rejectAndWaitForServer(sessionId: string): Promise<void> {
    const action = this.page.waitForResponse(
      (resp) =>
        resp.url().includes(`/api/admin/sessions/${sessionId}`) &&
        ['POST', 'PATCH', 'PUT', 'DELETE'].includes(resp.request().method()) &&
        resp.status() < 400,
    );
    await this.rejectButtonFor(sessionId).click();
    await action;
  }
}
