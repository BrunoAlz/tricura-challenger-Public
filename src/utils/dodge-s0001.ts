import { Page } from '@playwright/test';

export async function dodgeCorruptedS0001(page: Page): Promise<void> {
  await page.route(/\/api\/admin\/subjects(\?|$)/, (route) => {
    const url = new URL(route.request().url());
    if (!url.searchParams.has('q')) {
      url.searchParams.set('q', 's');
      return route.continue({ url: url.toString() });
    }
    return route.continue();
  });
}
