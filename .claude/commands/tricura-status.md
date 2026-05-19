---
description: One-screen health snapshot of the Tricura QA suite
argument-hint: (no arguments)
allowed-tools: Agent, Bash, Read
---

# /tricura-status

Show a single-screen snapshot of the suite's current health: lint, typecheck, baseline, regression coverage, and recent activity.

## Workflow

1. **Static checks** in parallel:
   ```bash
   npm run lint 2>&1 | tail -5
   npm run typecheck 2>&1 | tail -5
   npm run format:check 2>&1 | tail -5
   ```

2. **Baseline status** from the latest results.json (if present):
   ```bash
   jq '.stats | {expected, unexpected, flaky, skipped, duration}' test-results/results.json 2>/dev/null
   ```
   Compare against the the documented baseline (counts held privately).

3. **Coverage map** — dispatch the coverage-mapper agent:
   ```
   Agent(
     subagent_type: "tricura-coverage-mapper",
     description: "Coverage snapshot",
     prompt: "Run your standard report. Be terse — this is for a one-screen status view, not a deep dive. Summarize: total bugs in catalog, covered count, uncovered regression-worthy count, orphan-tag count."
   )
   ```

4. **Recent activity** (last 5 spec edits):
   ```bash
   find tests -name '*.spec.ts' -printf '%T@ %p\n' | sort -nr | head -5 | awk '{print $2}'
   ```

## Report format

```markdown
# Tricura status — <date>

## Static checks
- Lint: <0 warnings | N warnings>
- Typecheck: <0 errors | error count>
- Format: <clean | drift>

## Baseline (target: the documented baseline)
- Last run: <expected>/<unexpected>/<flaky>/<skipped> in <duration>s
- Drift: <none | what changed>

## Regression coverage
- Catalog: N bugs (W worthy)
- Covered: C / W (X %)
- Gaps to fill: G regression-worthy bugs without a spec
- Orphan tags: O

## Recent spec edits
- tests/.../foo.spec.ts (Nm ago)

## Suggested next action
<1 line based on what's red>
```

## Constraints

- **Read-only.** Don't run `npm test` (too long); rely on cached `test-results/results.json`. If there's no cached result, say so and suggest the user run `npm test` first.
- **One screen, no waffle.** This is meant for "what's the state?" not "tell me everything".
