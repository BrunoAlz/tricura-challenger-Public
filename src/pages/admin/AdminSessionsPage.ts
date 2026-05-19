import { Page, Locator, expect } from '@playwright/test';
import { AdminSidebar } from '@pages/components/AdminSidebar';
import { AdminTopBar } from '@pages/components/AdminTopBar';

export class AdminSessionsPage {
  readonly sidebar: AdminSidebar;
  readonly topBar: AdminTopBar;
  readonly heading: Locator;
  readonly newSessionButton: Locator;
  readonly table: Locator;
  readonly scheduleSessionButton: Locator;
  readonly nextButton: Locator;
  readonly scheduledForInput: Locator;
  readonly bloomPaletteBadges: Locator;

  constructor(public page: Page) {
    this.sidebar = new AdminSidebar(page);
    this.topBar = new AdminTopBar(page);

    this.heading = page.getByRole('heading', { name: 'Test sessions', exact: true });
    this.newSessionButton = page.getByRole('button', { name: /new session/i });
    this.table = page.getByRole('table');
    this.scheduleSessionButton = page.getByRole('button', { name: /^schedule session$/i });
    this.nextButton = page.getByRole('button', { name: /^next$/i });
    this.scheduledForInput = page.locator('input[type="datetime-local"]');

    this.bloomPaletteBadges = this.table.locator('span.bg-bloom-50.text-bloom-700');
  }

  async goto() {
    await this.sidebar.sessionsLink.click();
    await expect(this.heading).toBeVisible();
  }

  rowById(sessionId: string): Locator {
    return this.page.getByRole('row').filter({ hasText: sessionId });
  }

  async openNewSessionWizard(): Promise<void> {
    await this.newSessionButton.click();
    await expect(this.page.locator('select').first()).toBeVisible();
  }

  async pickSubjectByIndex(index = 1): Promise<void> {
    const select = this.page.locator('select').first();
    await expect(select).toBeVisible();
    await select.selectOption({ index });
    await this.nextButton.click();
  }

  async pickChamberByIndex(index = 1): Promise<void> {
    const select = this.page.locator('select').first();
    await expect(select).toBeVisible();
    await select.selectOption({ index });
    await this.nextButton.click();
  }

  async pickApparatusByIndex(index = 1): Promise<void> {
    const select = this.page.locator('select').first();
    await expect(select).toBeVisible();
    await select.selectOption({ index });
    await this.nextButton.click();
  }

  async fillScheduledFor(value: string): Promise<void> {
    await expect(this.scheduledForInput).toBeVisible();
    await this.scheduledForInput.fill(value);
    await this.nextButton.click();
  }

  async submitWizardAndCaptureSubmit() {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().endsWith('/api/admin/sessions') && resp.request().method() === 'POST',
    );
    await expect(this.scheduleSessionButton).toBeVisible();
    await this.scheduleSessionButton.click();
    return responsePromise;
  }
}
