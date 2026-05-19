import { Page, Locator } from '@playwright/test';
import { PublicHeader } from '@pages/components/PublicHeader';
import { PublicFooter } from '@pages/components/PublicFooter';

export class LandingPage {
  readonly header: PublicHeader;
  readonly footer: PublicFooter;
  readonly heading: Locator;
  readonly tagline: Locator;
  readonly exploreProgramsButton: Locator;
  readonly readTheReportButton: Locator;
  readonly allProgramsButton: Locator;
  readonly allSubjectsButton: Locator;
  readonly viewTimelineButton: Locator;

  constructor(public page: Page) {
    this.header = new PublicHeader(page);
    this.footer = new PublicFooter(page);
    this.heading = page.getByRole('heading', {
      level: 1,
      name: /advancing enrichment outcomes/i,
    });
    this.tagline = page.getByText(/q1 2026.*public outcomes summary/i);
    this.exploreProgramsButton = page.getByRole('button', { name: /explore programs/i });
    this.readTheReportButton = page.getByRole('button', { name: /read the report/i });
    this.allProgramsButton = page.getByRole('button', { name: /all programs/i });
    this.allSubjectsButton = page.getByRole('button', { name: /all subjects/i });
    this.viewTimelineButton = page.getByRole('button', { name: /view timeline/i });
  }

  async goto() {
    await this.page.goto('/');
  }
}
