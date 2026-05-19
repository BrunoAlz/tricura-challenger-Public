import { test, expect } from '@fixtures/auth.fixture';
import { LandingPage } from '@pages/public/LandingPage';

test.describe('@smoke @landing landing page', () => {
  test('renders header, hero, and CTAs', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.goto();

    await expect(page).toHaveTitle(/iris/i);
    await expect(landing.header.logo).toBeVisible();
    await expect(landing.header.heritageLink).toBeVisible();
    await expect(landing.header.reportsLink).toBeVisible();
    await expect(landing.header.staffLoginLink).toBeVisible();
    await expect(landing.heading).toBeVisible();
    await expect(landing.tagline).toBeVisible();
    await expect(landing.exploreProgramsButton).toBeVisible();
  });

  test('staff login link navigates to /login', async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.goto();
    await landing.header.goToLogin();
    await expect(page).toHaveURL(/\/login/);
  });
});
