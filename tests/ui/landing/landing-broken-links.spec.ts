import { test, expect } from '@playwright/test';

test.describe('@landing root page hero CTAs', () => {

  test('@bug-085 @bug-086 "Explore programs" link targets /programs and currently renders the React Router default error', async ({
    page,
  }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /explore programs/i });
    await expect(link).toBeVisible();
    await expect(link, 'BUG-085: hero link currently targets /programs').toHaveAttribute(
      'href',
      '/programs',
    );

    await link.click();

    await expect(page).toHaveURL(/\/programs$/);
    await expect(
      page.getByText(/Unexpected Application Error/i),
      'BUG-086: 404 page currently shows the framework-default error text',
    ).toBeVisible();
  });

  test('@bug-085 @bug-086 "All subjects" link targets /spotlight and currently renders the React Router default error', async ({
    page,
  }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /all subjects/i });
    await expect(link).toBeVisible();
    await expect(link, 'BUG-085: hero link currently targets /spotlight').toHaveAttribute(
      'href',
      '/spotlight',
    );

    await link.click();

    await expect(page).toHaveURL(/\/spotlight$/);
    await expect(
      page.getByText(/Unexpected Application Error/i),
      'BUG-086: 404 page currently shows the framework-default error text',
    ).toBeVisible();
  });
});
