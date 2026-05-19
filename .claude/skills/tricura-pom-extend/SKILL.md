---
name: tricura-pom-extend
description: Extend an existing Page Object or create a new one inside tricura-challenger/src/pages/ following the established conventions. Trigger whenever a new test would need a selector that doesn't already exist on a POM, when adding a workflow helper (multi-step UI actions), or when the user asks to "criar/atualizar POM", "adicionar locator", "extrair seletor para POM", or to refactor inline DOM into a POM. Use this skill BEFORE writing the spec that needs the helper — POMs come first, specs consume them. Builds on [[tricura-test-standards]].
---

# Tricura POM extension

The cardinal rule: **all DOM interaction lives in `src/pages/`, never in a spec.** When a new test needs a selector, you extend the POM first, then write the spec against the POM method.

This skill assumes you've also loaded [[tricura-test-standards]].

## Existing POMs (don't recreate, extend)

```
src/pages/
├── LoginPage.ts
├── components/
│   ├── AdminSidebar.ts        (shared nav)
│   ├── AdminTopBar.ts         (shared search + public-site link)
│   ├── PublicHeader.ts
│   └── PublicFooter.ts
├── admin/
│   ├── AdminApparatusPage.ts
│   ├── AdminApprovalsPage.ts
│   ├── AdminAuditPage.ts
│   ├── AdminChambersPage.ts
│   ├── AdminDashboardPage.ts
│   ├── AdminReportsPage.ts
│   ├── AdminSessionsPage.ts
│   └── AdminSubjectsPage.ts
└── public/
    ├── HeritagePage.ts
    ├── LandingPage.ts
    └── ReportsPage.ts
```

Before creating a new POM, check whether your selector belongs on an existing one. A new POM is justified only for a new route in the app.

## Anatomy of a Tricura POM

Every admin POM follows this shape (see `src/pages/admin/AdminApprovalsPage.ts` as canonical):

```ts
import { Page, Locator, expect } from '@playwright/test';
import { AdminSidebar } from '@pages/components/AdminSidebar';
import { AdminTopBar } from '@pages/components/AdminTopBar';

/**
 * Admin <Name> page (/admin/<route>).
 *
 * Short note explaining quirks (missing data-testid, BUG-XXX entanglements,
 * unusual selector workarounds). One paragraph max.
 */
export class Admin<Name>Page {
  readonly sidebar: AdminSidebar;
  readonly topBar: AdminTopBar;
  readonly heading: Locator;
  // ... other static locators

  constructor(public page: Page) {
    this.sidebar = new AdminSidebar(page);
    this.topBar = new AdminTopBar(page);

    this.heading = page.getByRole('heading', { name: '<Heading>', exact: true });
    // ... other static locators
  }

  async goto() {
    await this.sidebar.<routeLink>.click();
    await expect(this.heading).toBeVisible();
  }

  // Per-resource locator getters return Locator (NOT a Promise)
  <resource>For(id: string): Locator {
    return this.page.getByTestId(`<resource>-row-${id}`);
  }

  // Action helpers absorb multi-step interactions
  async <action>AndWaitForServer(id: string): Promise<void> {
    const action = this.page.waitForResponse(/* event predicate */);
    await this.<actionButton>For(id).click();
    await action;
  }
}
```

## Selector preference order

Reuse from [[tricura-test-standards]] §4:

1. `getByRole('<role>', { name: /.../ })` — accessible, refactor-resilient
2. `getByLabel(/.../)` — works for form fields with proper `<label>`
3. `getByTestId('...')` — when `data-testid` is in the DOM
4. `getByText(/.../)` — last resort, brittle if copy changes
5. ❌ CSS / XPath / `.nth(n)` — only if NO labelled selector exists AND a comment justifies it

When the DOM is broken (e.g. duplicate aria-labels in `AdminApprovalsPage`), document the quirk in the JSDoc and write the regex to disambiguate (`/^approve approve session/i`).

## Action helpers vs raw locators

Expose **both** when sensible:
- A bare `Locator` for assertions: `approvals.approveButtons.first()` lets specs use `await expect(...).toBeVisible()`.
- An action method for interactions: `approvals.approveAndWaitForServer(id)` encapsulates the click + response-wait dance.

Specs that only need to *assert presence* use the locator. Specs that need to *drive a workflow* use the action method. This split keeps the spec declarative without forcing every assertion through a method call.

## Action method patterns

### Pattern A — fire-and-await-server

```ts
async approveAndWaitForServer(sessionId: string): Promise<void> {
  const action = this.page.waitForResponse(
    (resp) =>
      resp.url().includes(`/api/admin/sessions/${sessionId}`) &&
      ['POST', 'PATCH', 'PUT'].includes(resp.request().method()) &&
      resp.status() < 400,
  );
  await this.approveButtonFor(sessionId).click();
  await action;
}
```

Set up the response listener **before** the click so we don't race.

### Pattern B — capture-and-return

For wizard submits where the spec needs to inspect the response (BUG-XXX workflow):

```ts
async submitWizardAndCaptureSubmit() {
  const responsePromise = this.page.waitForResponse(
    (resp) => resp.url().endsWith('/api/admin/sessions') && resp.request().method() === 'POST',
  );
  await this.scheduleSessionButton.click();
  return responsePromise;
}
```

Method name encodes intent: "submit and give me back the submit".

### Pattern C — download capture

```ts
async downloadCsv(): Promise<Download> {
  const downloadPromise = this.page.waitForEvent('download');
  await this.exportCsvLink.click();
  return downloadPromise;
}
```

Spec then awaits the returned Download and asserts on the file.

## Reusing shared components

Every admin page composes `AdminSidebar` and `AdminTopBar`. Don't redeclare their selectors — go through the component:

```ts
// In a spec
await dashboard.sidebar.goToSubjects();        // not page.getByRole('link', ...)
await dashboard.topBar.search('SES-2007');     // not page.getByRole('searchbox', ...)
```

Public pages compose `PublicHeader` + `PublicFooter` the same way.

## Helpers for unlabeled controls (BUG-XXX case)

The "New session" wizard's `<select>` elements have no id or aria-label, so `AdminSessionsPage` exposes index-based pickers and documents the bug in JSDoc:

```ts
/**
 * The "New session" wizard exposes <select> elements with no id/aria-label,
 * so the wizard helpers below pick options by index. Brittle by design
 * (BUG-XXX). When the fix adds labels, replace the index-based picks here.
 */
async pickSubjectByIndex(index = 1): Promise<void> {
  const select = this.page.locator('select').first();
  await expect(select).toBeVisible();
  await select.selectOption({ index });
  await this.nextButton.click();
}
```

The brittleness lives in **one place**, behind a method whose name encodes the brittleness, so every spec consuming it inherits the same workaround. When the bug is fixed, replace the method body and every spec keeps working.

## Validation

After extending a POM:

```bash
npm run lint        # 0 warnings
npm run typecheck   # 0 errors
# If specs already consume the POM, run them:
npx playwright test --grep "<relevant tag>" --reporter=list
```

## Anti-patterns

- ❌ Duplicating a selector across multiple specs instead of putting it on the POM.
- ❌ Returning `Promise<Locator>` from a getter — getters return `Locator` synchronously. Async lookup is `await` on the locator's actions.
- ❌ Calling `page.locator(...)` inside a spec when the POM already exposes (or could expose) the equivalent.
- ❌ Hiding `expect()` assertions inside POM methods unless the assertion is part of "navigated successfully" (the `await expect(this.heading).toBeVisible()` inside `goto()` is the only condoned exception).
- ❌ Creating a new POM file when an existing page already covers the route.
