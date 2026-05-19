---
name: tricura-exploratory-test
description: Generate an exploratory Playwright + TypeScript test that captures a behavior the user discovered during investigation but that is NOT yet in deliverables/BUGS-CATALOG.md. Trigger when the user says "achei algo estranho", "estou investigando", "criar teste exploratório", "documentar este finding com teste", describes a hypothesis to verify, or pastes a probe result asking for a permanent test. The test must (a) latch on what is observable today, (b) carry the `@side-observation` tag (not `@bug-XXX`), and (c) end with a proposed catalog entry the user can paste into deliverables/BUGS-CATALOG.md. Builds on [[tricura-test-standards]].
---

# Tricura exploratory-test workflow

Exploratory tests sit between a one-off probe and a regression test. They turn a fresh observation into **permanent evidence** so the audit doesn't lose track while triage decides whether the finding deserves a `BUG-XXX` row.

This skill assumes you've also loaded [[tricura-test-standards]].

## Step 1 — extract the hypothesis

Get a precise statement from the user (one sentence, observable):

| Vague | Precise |
|---|---|
| "the dashboard looks weird" | "on /admin, the Pending Approvals widget shows 5 rows but the count badge says 7" |
| "API is leaking data" | "GET /api/admin/subjects returns the same JSON for test_subject and director roles" |
| "logout doesn't work" | "after POST /api/auth/logout, GET /api/auth/me still returns 200 with the previous role" |

If the user is vague, ask one targeted question. Don't author until the observable is clear — vague tests don't latch.

## Step 2 — confirm it's not already cataloged

Grep `deliverables/BUGS-CATALOG.md` for the symptom:

```bash
grep -niE '<keyword>' deliverables/BUGS-CATALOG.md
```

If a match exists, **stop the exploratory flow and switch to [[tricura-regression-test]]** with the matched BUG-XXX. Cross-referencing also catches duplicates before they hit the suite.

If nothing matches, continue here.

## Step 3 — pick the layer

Same decision tree as [[tricura-test-standards]] §1. Most exploratory findings start at the API layer because it's faster to write and easier to assert deterministically.

| Observable | Layer |
|---|---|
| API response (status, body, header) | `tests/api/<module>/` |
| Single page rendering or single component | `tests/ui/<module>/` |
| Multi-step workflow problem | `tests/e2e/<module>/workflows/` |

## Step 4 — choose tag and naming

Exploratory tests do **not** use `@bug-XXX`. They use:

- `@side-observation` — neutral phrasing, doesn't presume the behavior is a bug. The audit's `@side-observation all chambers share the same hazard_class` in `tests/api/dashboard/chambers.spec.ts` is the canonical example.
- (optionally) `@exploratory` if multiple side-observations cluster around one investigation.

File name: append a short slug describing the observation, not a bug ID. Example: `tests/api/dashboard/sessions-state-shape.spec.ts`. Don't reuse the canonical smoke filenames — keep the smoke file's signal clean.

## Step 5 — write the test that **documents current state**

Unlike regression tests (which deliberately latch on broken values), exploratory tests assert the **observed reality**. The point is: if the behavior changes later — for better or worse — the test surfaces the change so you can decide if it's a fix, a regression, or a side effect.

Pattern:

```ts
import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/test_subject.json' });

test.describe('@side-observation @<module> <one-line observation>', () => {
  test('<precise observable>', async ({ subjectsApi }) => {
    // Arrange: minimal setup (auth via storageState handles most)
    const response = await subjectsApi.list();
    expect(response.status()).toBe(200);
    const body = await response.json();

    // Assert the CURRENT state. Add a generous message so future-you understands
    // why this exact assertion was written.
    expect(
      body.some((s) => s.current_wing === 'Γ'),
      'Observation 2026-05-18: at least one subject lives in wing Γ (gamma). ' +
      'Filed pending triage — if this set goes empty, investigate whether wing Γ was migrated/removed.',
    ).toBe(true);
  });
});
```

The assertion message is **load-bearing** — it's the only thread back to the original investigation if someone reads this in 6 months. Date the observation and explain what change would invalidate it.

## Step 6 — add the catalog draft to the report-back

When done, present the user with a **paste-ready row** for `deliverables/BUGS-CATALOG.md`, even if triage will reword it:

```markdown
| BUG-??? | <one-line title> | <layer> | <severity-guess> | <CWE if applicable> | <reproduction steps in 2-3 lines> | regression-worthy: TBD | observed: 2026-MM-DD | spec: <path-to-new-spec> |
```

The user owns the decision to actually file it. Your job is to make filing trivial.

## Step 7 — verify (same as regression)

```bash
npm run lint && npm run typecheck
npx playwright test <new-spec-path> --reporter=list
```

The test must pass (it asserts current reality). If it doesn't, either the hypothesis was wrong or the test is asserting a different thing than intended.

## Anti-patterns

- ❌ Using `@bug-XXX` on a finding that isn't cataloged yet — the tag is reserved for cataloged items. Use `@side-observation`.
- ❌ Asserting "should not happen" before the behavior is even confirmed. The exploratory phase asserts what IS. Triage decides whether IS == OK or IS == bug.
- ❌ Writing five exploratory tests for the same investigation without a unifying tag. Pick one `@exploratory:<slug>` and cluster them.
- ❌ Skipping the catalog-draft step. The whole point is to make the finding actionable, not to bury it inside the spec.
- ❌ Letting an exploratory test linger longer than one audit cycle. Triage it: either it gets a BUG-XXX and the test is updated to use `@bug-XXX` (and the regression flip-rule from [[tricura-regression-test]] §3), or it gets deleted with a note in `investigation/INVESTIGATION-JOURNAL.md` about why it was dismissed.

## Transition path: exploratory → regression

Once a `@side-observation` test is triaged into the catalog:

1. Rename the test title: `@side-observation` → `@bug-XXX`.
2. Decide which latch pattern (A/B/C from [[tricura-regression-test]] §3) fits the observation.
3. Update the assertion message to explain the **flip point** (what will make the test fail).
4. Re-run `npm run lint && npm run typecheck && npm test`.

This is the moment the test stops being "a fresh observation" and starts being "the latch on a known defect".
