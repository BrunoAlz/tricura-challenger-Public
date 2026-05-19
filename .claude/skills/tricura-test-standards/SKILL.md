---
name: tricura-test-standards
description: Canonical conventions for Playwright + TypeScript tests in the tricura-challenger QA suite — how to choose between tests/api, tests/ui, tests/e2e, how to consume POMs and service objects, how to authenticate via storageState, how to wait without `waitForTimeout`, how to tag specs. Trigger whenever the user asks to write, edit, review, or refactor any spec in the tricura-challenger project, even when they don't explicitly mention "standards". Other Tricura skills (regression-test, exploratory-test, pom-extend) build on top of this one.
---

# Tricura test standards

These are the conventions that hold for **every** spec in `tricura-challenger/tests/`. They were extracted from the audit + refactor that brought the suite to zero ESLint warnings while preserving the documented baseline (counts held privately). Future tests must keep both invariants.

## 1. Pick the right layer

Use this decision tree **before** writing a single line. Putting a test in the wrong directory invites the wrong tools.

```
Does the test exercise HTTP only (no browser, no DOM)?
└─ YES  →  tests/api/
└─ NO   →  Does it span more than one page or combine UI + API?
           └─ YES  →  tests/e2e/
           └─ NO   →  tests/ui/
```

| Layer | Can use | Must NOT use |
|---|---|---|
| `tests/api/` | service objects (`subjectsApi`, `chambersApi`, …), `apiClient`, `loginApiAs`, `request` fixture | `page`, `goto`, `getByRole`, `locator`, any DOM |
| `tests/ui/` | POMs (`AdminSubjectsPage`, …), sidebar/topbar navigation | raw `page.locator` / `page.getByRole` in the spec; raw `request.*` |
| `tests/e2e/` | POMs + service objects together (preconditions via API, action via POM) | `page.evaluate(pushState/popstate)` inline; `page.waitForTimeout`; selectors by index |

## 2. Auth: storageState is the default

`tests/auth.setup.ts` already produces 4 role storage states in `playwright/.auth/{test_subject,junior_coordinator,senior_coordinator,director}.json`.

```ts
test.use({ storageState: 'playwright/.auth/test_subject.json' });
```

Only use the fixtures `loginAs` (UI) or `loginApiAs` (API) when the **login flow itself is what the test exercises** (e.g. `tests/e2e/auth/login-journey.spec.ts`, the auth/me/logout specs in `tests/api/auth/`).

When importing the fixture for service objects, use `@fixtures/auth.fixture` instead of `@playwright/test`. The custom fixture wires `subjectsApi`, `chambersApi`, `sessionsApi`, `dashboardApi`, `authApi`, `systemApi` onto the per-test `request` context — they inherit any `storageState` set with `test.use()` automatically.

## 3. Navigate via `gotoAdmin`, never inline pushState

The Iris admin shell is a client-router-only SPA — `page.goto('/admin/...')` hits the FastAPI backend and returns JSON 404. The helper at `src/utils/spa-nav.ts` lands at `/` and drives the router via `pushState` + `popstate`. **Always** use it:

```ts
import { gotoAdmin } from '@utils/spa-nav';
await gotoAdmin(page, '/admin/approvals');
```

## 4. Selectors: accessible roles first, POM second

| Preference | Example |
|---|---|
| 1. `getByRole` with name | `page.getByRole('button', { name: /sign in/i })` |
| 2. `getByLabel` | `page.getByLabel(/case token/i)` |
| 3. `getByTestId` | `page.getByTestId('chamber-row-C-01')` |
| 4. `getByText` (last resort, brittle) | `page.getByText(/welcome back/i)` |
| ❌ Avoid | CSS / XPath / `.nth(n)` / `.first()` unless the bug REQUIRES it (e.g. `BUG-XXX` selects are unlabeled) |

In `tests/ui/**` and `tests/e2e/**`, the spec calls a **POM method**, not a locator. Locators live in `src/pages/`.

## 5. Waiting: events and elements, never the clock

`waitForTimeout` is banned by the project ESLint config (`playwright/no-wait-for-timeout`) and `waitForLoadState('networkidle')` is banned (`playwright/no-networkidle`). Both are flaky and signal a missing event anchor.

| Need | Pattern |
|---|---|
| Wait for element | `await expect(locator).toBeVisible()` / `toBeHidden()` / `toHaveText()` |
| Wait for navigation | `await expect(page).toHaveURL(/.../)` |
| Wait for server side-effect | `const r = await page.waitForResponse(pred); await btn.click(); await r;` |
| Assert NO side effect (e.g. silent-failure bug) | `const p = page.waitForRequest(pred, { timeout: 2_000 }).catch(() => null); await btn.click(); expect(await p).toBeNull();` |
| Wait for download | `const dl = await page.waitForEvent('download'); await link.click();` |

The "silent failure" pattern above is event-based: the promise resolves *immediately* when the event fires, and only falls through to the timeout if it doesn't — fundamentally different from a fixed sleep.

## 6. Tagging

Tags go inside the `test.describe` title so `--grep` works. Stack them in the canonical order:

```
@smoke         — must pass; included in fast feedback runs
@auth          — exercises the auth/role system
@dashboard     — exercises authenticated console
@landing       — exercises public-facing pages
@workflow      — multi-step user journey (e2e only)
@role-matrix   — role × endpoint permission grid
@side-observation  — surfaces a behavior worth filing later (no @bug-XXX yet)
@bug-XXX       — pins a documented bug; the test PASSES while the bug exists
@destructive   — mutates shared backend state (use ONLY against sandbox IDs)
```

Examples:
```ts
test.describe('@smoke @auth API login', () => { /* ... */ });
test.describe('@workflow @approve Senior approves a pending session', () => { /* ... */ });
test('@bug-XXX rejects via UI, verifies state via API', async ({ page }) => { /* ... */ });
```

## 7. Pin-the-bug pattern

A regression test for a known bug must **pass while the bug exists** and **fail the day it's fixed**. That way CI flags every fix attempt for review.

Two compatible techniques:
- Assert the broken value directly: `expect(rejectBtn).toHaveAttribute('title', 'Approve session')`. The day the swapped tooltip is fixed, this fails — flip to the correct value.
- Assert the absence of side effect: `expect(await approvePromise).toBeNull()`. The day the handler is wired, a request fires and this fails.

For UI affordances that *don't exist yet* (e.g. `BUG-XXX` missing Start/Complete buttons), use `test.fixme('@bug-XXX ...', async ({ page }) => { /* future contract */ })`. The fixme test describes the contract you want when the fix ships.

## 8. Mutating endpoints in smoke tests

The Iris backend is **shared** with audit data. A POST that succeeds against a real ID mutates state irreversibly. Default policy in `tests/api/dashboard/sessions.spec.ts` is to target invalid IDs (`SES-DOES-NOT-EXIST`) and assert a 4xx — that proves the route is wired without changing data. Any happy-path mutation test must be tagged `@destructive` and target a sandboxed ID the test creates itself.

## 9. Body shape coercion (API specs)

When the API may return either `[…]` or `{ items: […] }`, use a typed coercion helper at the top of the spec instead of conditional in tests (ESLint will flag `Array.isArray(x) ? … : …` inside `test()`):

```ts
function asChamberList(body: unknown): Chamber[] {
  if (Array.isArray(body)) return body as Chamber[];
  if (body && typeof body === 'object' && Array.isArray((body as { chambers?: Chamber[] }).chambers)) {
    return (body as { chambers: Chamber[] }).chambers;
  }
  throw new Error('Chambers API: response is neither array nor { chambers: [...] }');
}
```

If the project later confirms the canonical shape, drop the fallback and report the inconsistency as a bug.

## 10. `noUncheckedIndexedAccess`

`tsconfig.json` enables `noUncheckedIndexedAccess`. `array[0]` is typed `T | undefined`. After reading the first element, prove presence:

```ts
const first = chambers[0];
expect(first).toBeDefined();
const detailResp = await chambersApi.get(chamberId(first!));
```

## 11. Comments: WHY, not WHAT

Body comments should explain a non-obvious motivation: a hidden constraint, a known bug, a backend quirk. Don't restate the code or narrate the flow (`// Step 1: subject` is dead weight — the POM method name carries the intent).

Density target for E2E workflow specs: **≤ 15 %** comment lines (current files run at 7–11 %).

## 12. Validation gate

Before claiming a spec is done, **always** run from `tricura-challenger/`:

```bash
npm run lint        # must be 0 warnings, 0 errors
npm run typecheck   # 0 errors
npm run format:check
```

And before merging, the baseline must hold (`the documented baseline`). Running the full suite is `npm test` (~2 min).

## Canonical examples in the repo

| Want to copy | Read |
|---|---|
| API spec via service objects | `tests/api/dashboard/chambers.spec.ts` |
| UI spec via POM + `gotoAdmin` | `tests/ui/dashboard/admin-chambers.spec.ts` |
| E2E spec with API precondition + UI action | `tests/e2e/dashboard/workflows/approve-reject-session.spec.ts` |
| Silent-failure (no side effect) | `tests/ui/dashboard/admin-dashboard.spec.ts` `@bug-XXX` |
| Role-matrix (parametrized) | `tests/api/role-matrix/matrix.spec.ts` |
| POM with action helpers | `src/pages/admin/AdminApprovalsPage.ts` |
| Wizard POM with step helpers | `src/pages/admin/AdminSessionsPage.ts` |

Stay inside these rails and the suite stays green where it must, red where it documents bugs, and consistent everywhere else.
