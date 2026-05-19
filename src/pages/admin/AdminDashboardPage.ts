import { Page, Locator, expect } from '@playwright/test';
import { AdminSidebar } from '@pages/components/AdminSidebar';
import { AdminTopBar } from '@pages/components/AdminTopBar';

export class AdminDashboardPage {
  readonly sidebar: AdminSidebar;
  readonly topBar: AdminTopBar;
  readonly route: Locator;
  readonly heading: Locator;
  readonly subjectsEnrolledLabel: Locator;
  readonly sessionsRollUpLabel: Locator;
  readonly openIncidentsLabel: Locator;
  readonly chambersOnlineLabel: Locator;
  readonly pendingApprovalsLabel: Locator;
  readonly qeIndexSection: Locator;
  readonly pendingApprovalsHeading: Locator;
  readonly recentActivityHeading: Locator;
  readonly welcomeBanner: Locator;
  readonly dismissBannerButton: Locator;
  readonly requestedByLabels: Locator;

  constructor(public page: Page) {
    this.sidebar = new AdminSidebar(page);
    this.topBar = new AdminTopBar(page);

    this.route = page.getByTestId('route-admin-dashboard');
    this.heading = page.getByRole('heading', { name: 'Dashboard', exact: true });

    this.subjectsEnrolledLabel = page.getByText(/subjects enrolled/i);
    this.sessionsRollUpLabel = page.getByText(/sessions in qe roll-up/i);
    this.openIncidentsLabel = page.getByText(/open incidents/i);
    this.chambersOnlineLabel = page.getByText(/chambers online/i);
    this.pendingApprovalsLabel = page.getByText(/pending approvals/i).first();

    this.qeIndexSection = page.getByText(/quarterly enrichment index/i);

    this.pendingApprovalsHeading = page.getByRole('heading', { name: /pending approvals/i });
    this.recentActivityHeading = page.getByRole('heading', { name: /recent activity/i });

    this.welcomeBanner = page.getByText(/welcome back\. things are tracking/i);
    this.dismissBannerButton = page.getByRole('button', { name: /dismiss banner/i });

    this.requestedByLabels = page.locator('p:has-text("requested by")');
  }

  async waitForPendingApprovalsData(): Promise<void> {
    await this.page.waitForResponse(
      (r) => r.url().includes('/api/admin/sessions') && r.ok(),
      { timeout: 8_000 },
    );
  }

  async goto() {
    await this.sidebar.dashboardLink.click();
    await expect(this.route).toBeVisible();
  }

  async dismissWelcomeBanner() {
    await this.dismissBannerButton.click();
  }
}
