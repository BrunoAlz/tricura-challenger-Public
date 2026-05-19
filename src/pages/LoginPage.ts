import { Page, expect, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly caseTokenInput: Locator;
  readonly roleSelect: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.caseTokenInput = page.getByLabel(/case token/i);
    this.roleSelect = page.getByLabel(/role/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /sign in|log ?in/i });
    this.errorAlert = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.getByRole('link', { name: /staff login/i }).click();
  }

  async loginAs(roleSlug: string, password: string, caseToken: string) {
    await this.caseTokenInput.fill(caseToken);
    await this.roleSelect.selectOption(roleSlug);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/dashboard|console|operations/);
  }
}
