import { test, expect, type Locator } from '@playwright/test';
import { AdminSidebar } from '@pages/components/AdminSidebar';
import { gotoAdmin } from '@utils/spa-nav';
import { ROLES, type RoleSlug } from '@config/roles';


const ROLE_SLUGS = Object.keys(ROLES) as readonly RoleSlug[];

interface SidebarLink {
  name: string;
  briefAllowedRoles: readonly RoleSlug[];
  currentlyVisibleTo: readonly RoleSlug[];
  locator: (sidebar: AdminSidebar) => Locator;
}

const ALL_ROLES: readonly RoleSlug[] = [
  'test_subject',
  'junior_coordinator',
  'senior_coordinator',
  'director',
];

const SIDEBAR_LINKS: readonly SidebarLink[] = [
  {
    name: 'Dashboard',
    briefAllowedRoles: ALL_ROLES,
    currentlyVisibleTo: ALL_ROLES,
    locator: (s) => s.dashboardLink,
  },
  {
    name: 'Subjects',
    briefAllowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    currentlyVisibleTo: ALL_ROLES,
    locator: (s) => s.subjectsLink,
  },
  {
    name: 'Chambers',
    briefAllowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    currentlyVisibleTo: ALL_ROLES,
    locator: (s) => s.chambersLink,
  },
  {
    name: 'Sessions',
    briefAllowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    currentlyVisibleTo: ALL_ROLES,
    locator: (s) => s.sessionsLink,
  },
  {
    name: 'Apparatus',
    briefAllowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    currentlyVisibleTo: ALL_ROLES,
    locator: (s) => s.apparatusLink,
  },
  {
    name: 'Audit',
    briefAllowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    currentlyVisibleTo: ALL_ROLES,
    locator: (s) => s.auditLink,
  },
  {
    name: 'Approvals',
    briefAllowedRoles: ['senior_coordinator', 'director'],
    currentlyVisibleTo: ALL_ROLES,
    locator: (s) => s.approvalsLink,
  },
  {
    name: 'Reports',
    briefAllowedRoles: ['director'],
    currentlyVisibleTo: ALL_ROLES,
    locator: (s) => s.reportsLink,
  },
  {
    name: 'Methodology',
    briefAllowedRoles: ['director'],
    currentlyVisibleTo: ['director'],
    locator: (s) => s.methodologyLink,
  },
];

for (const role of ROLE_SLUGS) {
  test.describe(`@role-matrix @dashboard @bug-118 sidebar visibility — ${role}`, () => {
    test.use({ storageState: `playwright/.auth/${role}.json` });

    for (const link of SIDEBAR_LINKS) {
      const isVisibleNow = link.currentlyVisibleTo.includes(role);
      const isAllowedByBrief = link.briefAllowedRoles.includes(role);
      const isDivergent = isVisibleNow !== isAllowedByBrief;
      const divergenceNote = isDivergent
        ? ` (currently visible despite brief denying — UI permission drift)`
        : '';

      // Conditional below is at describe-build time, mirroring the
      // pattern in tests/api/role-matrix/matrix.spec.ts so the
      // playwright/no-conditional-in-test rule stays satisfied.
      if (isVisibleNow) {
        test(`${link.name} link currently visible for ${role}${divergenceNote}`, async ({
          page,
        }) => {
          await gotoAdmin(page);
          const sidebar = new AdminSidebar(page);
          await expect(sidebar.nav).toBeVisible();
          await expect(link.locator(sidebar)).toBeVisible();
        });
      } else {
        test(`${link.name} link currently hidden for ${role}${divergenceNote}`, async ({
          page,
        }) => {
          await gotoAdmin(page);
          const sidebar = new AdminSidebar(page);
          await expect(sidebar.nav).toBeVisible();
          await expect(link.locator(sidebar)).toBeHidden();
        });
      }
    }
  });
}
