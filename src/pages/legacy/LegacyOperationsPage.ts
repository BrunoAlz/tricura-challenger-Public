import { Page, Locator } from '@playwright/test';
import { env } from '@config/env';
import { gotoAdmin } from '@utils/spa-nav';

export class LegacyOperationsPage {
  readonly body: Locator;

  constructor(public page: Page) {
    this.body = page.locator('body');
  }

  async gotoRoles() {
    await gotoAdmin(this.page, env.T_PATH_LITERAL_09);
  }

  async gotoFounder() {
    await gotoAdmin(this.page, env.T_PATH_LITERAL_10);
  }

  async gotoLog() {
    await gotoAdmin(this.page, env.T_PATH_LITERAL_07);
  }

  async gotoSubjects() {
    await gotoAdmin(this.page, env.T_PATH_LITERAL_08);
  }

  async gotoSubjectDetail(subjectId: string) {
    await gotoAdmin(this.page, `${env.T_PATH_LITERAL_08}/${subjectId}`);
  }

  /**
   * Locator for the "no detail on file" fallback rendered when the legacy
   * console has no record for the requested subject ID. Use after
   * `gotoSubjectDetail` to assert the fallback is/isn't visible.
   */
  noDetailFallbackFor(subjectId: string): Locator {
    return this.page.getByText(`Subject ${subjectId} — no detail on file.`, { exact: false });
  }

  /**
   * Locator for a row in the legacy subjects table. The panel renders
   * subjects as a single text block — Playwright matches on the visible row
   * caption which carries the subject ID prefix.
   */
  subjectRowText(subjectId: string): Locator {
    return this.page.getByText(new RegExp(`^${subjectId}\\b`, 'm'));
  }
}
