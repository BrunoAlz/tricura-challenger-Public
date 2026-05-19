import { Page, Locator } from '@playwright/test';

export class AdminSidebar {
  readonly nav: Locator;
  readonly dashboardLink: Locator;
  readonly subjectsLink: Locator;
  readonly chambersLink: Locator;
  readonly sessionsLink: Locator;
  readonly approvalsLink: Locator;
  readonly apparatusLink: Locator;
  readonly reportsLink: Locator;
  readonly auditLink: Locator;
  readonly methodologyLink: Locator;

  constructor(private page: Page) {
    this.nav = page.getByRole('navigation', { name: /admin sections/i });
    this.dashboardLink = this.nav.getByRole('link', { name: 'Dashboard', exact: true });
    this.subjectsLink = this.nav.getByRole('link', { name: 'Subjects', exact: true });
    this.chambersLink = this.nav.getByRole('link', { name: 'Chambers', exact: true });
    this.sessionsLink = this.nav.getByRole('link', { name: 'Sessions', exact: true });
    this.approvalsLink = this.nav.getByRole('link', { name: 'Approvals', exact: true });
    this.apparatusLink = this.nav.getByRole('link', { name: 'Apparatus', exact: true });
    this.reportsLink = this.nav.getByRole('link', { name: 'Reports', exact: true });
    this.auditLink = this.nav.getByRole('link', { name: 'Audit', exact: true });
    this.methodologyLink = this.nav.getByRole('link', { name: 'Methodology', exact: true });
  }

  async goToDashboard() {
    await this.dashboardLink.click();
  }
  async goToSubjects() {
    await this.subjectsLink.click();
  }
  async goToChambers() {
    await this.chambersLink.click();
  }
  async goToSessions() {
    await this.sessionsLink.click();
  }
  async goToApprovals() {
    await this.approvalsLink.click();
  }
  async goToApparatus() {
    await this.apparatusLink.click();
  }
  async goToReports() {
    await this.reportsLink.click();
  }
  async goToAudit() {
    await this.auditLink.click();
  }
  async goToMethodology() {
    await this.methodologyLink.click();
  }
}
