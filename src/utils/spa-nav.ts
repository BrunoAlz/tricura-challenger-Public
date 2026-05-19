import { Page } from '@playwright/test';

export async function gotoAdmin(page: Page, route = '/admin'): Promise<void> {
  await page.goto('/');
  await page.evaluate((r) => {
    window.history.pushState({}, '', r);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, route);
}
