---
name: tricura-regression-test
description: Generate a Playwright + TypeScript regression test that pins a bug already documented in tricura-challenger/deliverables/BUGS-CATALOG.md. Trigger when the user references a bug ID (e.g. BUG-XXX), asks to "cobrir o bug X com teste", "criar regressão para BUG-YYY", "regression test for the X issue", or wants automated coverage for a cataloged audit finding. ALWAYS pin the bug: the test must PASS today (capturing the broken behavior) and FAIL the day the bug is fixed. Builds on the [[tricura-test-standards]] skill — invoke that one too whenever you write a spec.
---

# Tricura regression-test workflow

A regression test exists to **detect a fix or a regression**. It is not "the bug repeated in TypeScript". It is a deliberate latch on a specific observable: while the bug stands, the test passes; when someone changes the system, the latch trips.

This skill assumes you've already loaded [[tricura-test-standards]] (or will load it now — it carries the layer/auth/wait/tag rules).

## Step 1 — read the bug entry

Open `deliverables/BUGS-CATALOG.md` and locate the row for the bug ID the user named. Extract:

- **Layer** (Frontend / Backend / API / Cross-cutting) — narrows the test directory.
- **Severity** (Critical / High / Medium / Low / Info).
- **CWE / OWASP** classification (informs whether the test must avoid sending the malicious payload to a real server — see §6).
- **Reproduction steps** — the exact observable to latch onto.
- **Regression-worthy?** — if the catalog marks it `No`, **stop and confirm with the user** before authoring. The audit explicitly excluded some findings from automation.
- **Bug ID format**: `BUG-NNN` (always 3+ digits, e.g. `BUG-XXX`, `BUG-XXX`). The tag in the spec uses lowercase: `@bug-XXX`.

If the catalog is silent on a field, read `investigation/INVESTIGATION-JOURNAL.md` (chronological probe log) — it usually carries the missing context.

## Step 2 — pick the layer (decision tree)

| Bug observable lives in | Test goes in |
|---|---|
| HTTP response status / body shape / headers | `tests/api/<module>/` |
| Single page DOM / button labels / form validation | `tests/ui/dashboard/` (or `tests/ui/landing/`) |
| Multi-page user journey (Junior creates → Senior approves) | `tests/e2e/dashboard/workflows/` |
| Role × endpoint permission grid | Add a row to `src/config/role-permissions.ts`; the existing `tests/api/role-matrix/matrix.spec.ts` picks it up automatically |
| Public landing pages | `tests/ui/landing/` |

If a single bug has multiple observables (e.g. wrong API + wrong UI), you can split into two regression tests. The catalog row stays one entry; the tag `@bug-XXX` appears on both tests.

## Step 3 — pick the latch

A regression test is only useful if it has a **clear flip point**. Three latch patterns, in order of preference:

### Latch A — assert the wrong value directly

Used when the bug surfaces as a concrete wrong string/number/attribute.

```ts
// BUG-XXX: Reject button's `title` says "Approve session" (tooltips swapped)
const rejectBtn = approvals.rejectButtonFor(sessionId);
await expect(rejectBtn).toHaveAttribute('title', 'Approve session');
```

The day the swap is fixed, `title` becomes `"Reject session"` and this assertion fails. Reviewer is forced to update the latch to the correct value.

### Latch B — assert the absence of a side effect

Used when the bug is "this button does nothing" (BUG-XXX, BUG-XXX). Race a `waitForRequest`/`waitForEvent` against a short deadline; expect `null`.

```ts
const approvePromise = page
  .waitForRequest(
    (req) => req.method() === 'POST' && /\/api\/admin\/sessions\/.+\/approve$/.test(req.url()),
    { timeout: 2_000 },
  )
  .catch(() => null);

await approveBtn.click();
expect(await approvePromise, 'BUG-XXX fixed?').toBeNull();
```

The day the handler is wired, the promise resolves with the Request object and the assertion fails. **Never** assert "absence" with `waitForTimeout` — see [[tricura-test-standards]] §5.

### Latch C — `test.fixme` for missing affordances

Used when the bug is a **missing UI element entirely** (BUG-XXX). The fixme test documents the contract you want; Playwright will fail the fixme the day the test starts passing.

```ts
test.fixme('@bug-XXX UI exposes Start + Complete affordance', async ({ page }) => {
  await gotoAdmin(page, `/admin/sessions/${sessionId}`);
  await expect(page.getByRole('heading', { name: new RegExp(sessionId) })).toBeVisible();
  // ... contract assertions for the future fix
});
```

Pair every Latch C with a passing API-layer test that proves the backend already supports the workflow. That way the spec exercises the layer that works *today* while pinning the gap on the layer that doesn't.

## Step 4 — write the spec

Follow [[tricura-test-standards]] for file structure, imports, auth, navigation, selectors, waits, tagging. The skeleton:

```ts
import { test, expect } from '@fixtures/auth.fixture';        // or '@playwright/test' for raw request
// import POMs and service objects as appropriate

test.use({ storageState: 'playwright/.auth/<role>.json' });

test.describe('@<layer-tag> @bug-XXX <short title>', () => {
  test('<what we are latching on>', async ({ /* fixtures */ }) => {
    // Arrange: preconditions (API setup, navigation)
    // Act: trigger the buggy behavior
    // Assert: the latch (Latch A / B / C from §3)
  });
});
```

Tag the test title (not just the describe) with `@bug-XXX` so `--grep "@bug-XXX"` picks it up alone.

## Step 5 — destructive-input safety

If the bug involves a security payload (SQLi, XSS, command injection — see CWE field), the test still needs to **send a benign variant**, not the live exploit, against the shared backend. Two acceptable approaches:

1. Send the payload against an **invalid resource ID** (`SES-DOES-NOT-EXIST`) so the server short-circuits at routing before execution.
2. Use the `@destructive` tag and target a sandbox ID the test creates and cleans up itself.

Coordinate with the user before sending anything potentially state-mutating against real audit data.

## Step 6 — verify

Run from `tricura-challenger/`:

```bash
npm run lint        # 0 warnings expected
npm run typecheck   # 0 errors expected
npx playwright test <new-spec-path> --reporter=list
```

The new test must:
- ✅ Pass (latch A/B) or be properly fixmed (latch C).
- ✅ Carry the `@bug-XXX` tag.
- ✅ Not introduce new lint warnings.
- ✅ Not regress the documented baseline (counts held privately). Run the full suite if uncertain.

If the test you wrote *fails* against the current system, the latch is wrong — re-read the bug entry and adjust. A regression test that fails today provides no signal tomorrow.

## Step 7 — report back

When done, tell the user:
- New spec path
- Which latch pattern (A/B/C) and why
- What event triggers the latch flip (so they know what "fixed" looks like)
- Baseline status (e.g. "still the documented baseline, no regressions")

## Anti-patterns

- ❌ Importing the test only to leave it as `test.skip` — use `test.fixme` so it surfaces when it starts passing.
- ❌ Asserting a generic "no 5xx" — too coarse, masks new regressions.
- ❌ Using `waitForTimeout` to "let the no-op settle". See [[tricura-test-standards]] §5.
- ❌ Reproducing a bug spread across multiple specs without the `@bug-XXX` tag. The tag is the index — `--grep "@bug-XXX"` must find every spec involved.
- ❌ Sending exploit payloads against real IDs on the shared backend.
