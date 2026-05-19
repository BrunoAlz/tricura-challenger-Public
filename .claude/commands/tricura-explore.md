---
description: Author an exploratory test for a fresh finding not yet in deliverables/BUGS-CATALOG.md
argument-hint: "<one-line hypothesis>" (e.g. "logout doesn't invalidate the session cookie")
allowed-tools: Agent, Read, Bash
---

# /tricura-explore

Generate an exploratory test for an in-flight investigation. Latches on current state with `@side-observation` and ends with a paste-ready catalog draft.

## Arguments

- `$ARGUMENTS` is a one-line hypothesis or symptom description. If absent, prompt the user. The hypothesis must be **observable** — see `tricura-exploratory-test` skill §1 for examples.

## Workflow

1. **Validate the hypothesis** is concrete enough to write an assertion against. If it's vague ("the dashboard looks weird"), ask one targeted question to narrow it.

2. **Check the catalog isn't already covering this** symptom:
   ```bash
   grep -niE '<extracted keywords>' deliverables/BUGS-CATALOG.md
   ```
   If there's a match, hand off to `/tricura-regression <BUG-ID>` instead.

3. **Dispatch the test-author agent** in exploratory mode:
   ```
   Agent(
     subagent_type: "tricura-test-author",
     description: "Exploratory test: <short hypothesis>",
     prompt: "Author an exploratory test for the following hypothesis (NOT yet in deliverables/BUGS-CATALOG.md): '$ARGUMENTS'. Load tricura-test-standards and tricura-exploratory-test skills first. Confirm the symptom is not already cataloged. Pick the layer, write the spec with the @side-observation tag, validate with lint + typecheck. Report back: spec path, layer, the exact assertion (load-bearing for future readers), and a paste-ready deliverables/BUGS-CATALOG.md row draft."
   )
   ```

4. **Relay the agent's report** with the catalog-draft row in a fenced markdown block so the user can paste it directly.

## Constraints

- Don't author inline — the test-author agent owns it.
- If the user's hypothesis is too vague to assert against, ask one clarifying question; don't author until it's precise.
- Make the catalog-draft step **mandatory** — exploratory tests without a triage hand-off rot inside the suite.
