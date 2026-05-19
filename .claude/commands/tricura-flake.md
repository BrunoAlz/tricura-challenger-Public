---
description: Run a spec N times to detect flakiness
argument-hint: <spec-path> [N=5]
allowed-tools: Agent
---

# /tricura-flake

Run a single spec multiple times in sequence and surface non-determinism.

## Arguments

- First argument: `spec-path` (e.g. `tests/e2e/dashboard/workflows/schedule-session.spec.ts`).
- Second argument (optional): `N` — number of runs (default 5, max 20).

If `spec-path` is missing, prompt for it. Don't run against the entire suite without an explicit confirmation — N × full suite is expensive.

## Workflow

1. **Parse arguments.** Validate that the spec file exists. Clamp N to `[1, 20]`.

2. **Confirm if destructive.** Check whether the spec has any `@destructive` tag:
   ```bash
   grep -l '@destructive' $1
   ```
   If yes, surface a warning and require explicit user confirmation before running N times.

3. **Dispatch the flake-hunter agent:**
   ```
   Agent(
     subagent_type: "tricura-flake-hunter",
     description: "Flake check $1 × $2",
     prompt: "Run $1 exactly $2 times in sequence. Use the workflow defined in your agent definition. Produce the report in the specified format. Clean up the temp directory at the end."
   )
   ```

4. **Relay the agent's report.** If flakes were found, highlight the top suspect cause and recommend a fix path (typically: add a `waitForResponse` anchor, replace a brittle selector, or serialize a state-mutation step).

## Constraints

- Don't auto-fix flakes. Reporting is the goal; the fix is a separate decision.
- Wall-clock is roughly `N × test_duration`. A 30-second test × 10 runs = 5 minutes — that's fine; > 10 minutes is a flag for the user.
