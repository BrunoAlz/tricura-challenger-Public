---
description: Author a regression test for a documented bug in deliverables/BUGS-CATALOG.md
argument-hint: <BUG-ID> (e.g. BUG-XXX)
allowed-tools: Agent, Read, Bash
---

# /tricura-regression

Generate a regression test that pins a bug already documented in `deliverables/BUGS-CATALOG.md`.

## Arguments

- `$ARGUMENTS` should be the bug ID, e.g. `BUG-XXX`. If absent, ask the user which bug they want to cover (don't guess).

## Workflow

1. **Validate the argument.** If `$ARGUMENTS` doesn't match `BUG-\d+`, prompt the user once and abort if still missing.

2. **Verify the bug exists in the catalog:**
   ```bash
   grep -nE "^\| $ARGUMENTS \|" deliverables/BUGS-CATALOG.md
   ```
   If no match, report it and stop.

3. **Dispatch the test-author agent** with the regression intent:
   ```
   Agent(
     subagent_type: "tricura-test-author",
     description: "Write regression test for $ARGUMENTS",
     prompt: "Author a regression test for $ARGUMENTS from deliverables/BUGS-CATALOG.md. Load tricura-test-standards and tricura-regression-test skills first. Read the catalog row, pick the right layer, extend a POM if needed, write the spec with the @bug-{lowercase} tag, validate with lint + typecheck. Report back: spec path, layer chosen, latch pattern (A/B/C), and baseline status."
   )
   ```

4. **Relay the agent's report** to the user with three call-outs:
   - Spec path (clickable file reference).
   - Latch pattern used and what triggers it to flip.
   - Baseline status (preserved or drifted).

## Constraints

- Do not author the test inline — the test-author agent owns that.
- If the catalog row marks `Regression-worthy? No`, surface this and ask the user to confirm before proceeding.
- If the user passes more than one BUG-ID, run the workflow once per bug, in sequence.
