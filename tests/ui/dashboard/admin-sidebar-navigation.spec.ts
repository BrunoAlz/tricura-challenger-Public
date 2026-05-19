import { test, expect, type Locator } from '@playwright/test';
import { AdminSidebar } from '@pages/components/AdminSidebar';
import { AdminTopBar } from '@pages/components/AdminTopBar';
import { LandingPage } from '@pages/public/LandingPage';
import { gotoAdmin } from '@utils/spa-nav';

test.use({ storageState: 'playwright/.auth/director.json' });


interface SidebarLink {
  name: string;
  href: string;
  startFrom: string;
  heading: RegExp;
}

const SIDEBAR_LINKS: readonly SidebarLink[] = [
  { name: 'Dashboard', href: '/admin', startFrom: '/admin/sessions', heading: /^Dashboard$/ },
  { name: 'Subjects', href: '/admin/subjects', startFrom: '/admin', heading: /^Subjects$/ },
  { name: 'Chambers', href: '/admin/chambers', startFrom: '/admin', heading: /^Chambers$/ },
  {
    name: 'Sessions',
    href: '/admin/sessions',
    startFrom: '/admin',
    heading: /^Test sessions$/,
  },
  {
    name: 'Approvals',
    href: '/admin/approvals',
    startFrom: '/admin',
    heading: /^Approval queue$/,
  },
  {
    name: 'Apparatus',
    href: '/admin/apparatus',
    startFrom: '/admin',
    heading: /^Apparatus catalog$/,
  },
  { name: 'Reports', href: '/admin/reports', startFrom: '/admin', heading: /reports.*export/i },
  {
    name: 'Audit',
    href: '/admin/audit',
    startFrom: '/admin',
    heading: /audit.*incident log/i,
  },
  {
    name: 'Methodology',
    href: '/admin/methodology',
    startFrom: '/admin',
    heading: /methodology/i,
  },
];

test.describe('@smoke @dashboard admin sidebar navigation as Director', () => {
  for (const link of SIDEBAR_LINKS) {
    test(`clicking "${link.name}" lands on ${link.href} with the sidebar reflecting the active route`, async ({
      page,
    }) => {
      await gotoAdmin(page, link.startFrom);

      const sidebar = new AdminSidebar(page);
      const target: Locator = sidebar.nav.getByRole('link', {
        name: link.name,
        exact: true,
      });

      await expect(target, `sidebar must expose a link to ${link.href}`).toHaveAttribute(
        'href',
        link.href,
      );

      await target.click();

      await expect(page).toHaveURL(new RegExp(`${link.href.replace(/\/$/, '')}\\/?$`));

      await expect(target).toHaveAttribute('aria-current', 'page');

      await expect(page.getByRole('heading', { name: link.heading }).first()).toBeVisible();
      await expect(page.getByText(/unexpected application error/i)).toBeHidden();
    });
  }
});

test.describe('@smoke @dashboard admin top-bar return-to-public link', () => {
  test('clicking "Public site →" from the admin shell lands on the public landing page', async ({
    page,
  }) => {
    await gotoAdmin(page, '/admin');

    const topBar = new AdminTopBar(page);
    const landing = new LandingPage(page);

    await expect(
      topBar.publicSiteLink,
      'top-bar must expose a link to the public site root',
    ).toHaveAttribute('href', '/');

    await topBar.goToPublicSite();

    await expect(page).not.toHaveURL(/\/admin(\/|$)/);
    await expect(landing.heading).toBeVisible();
  });
});
