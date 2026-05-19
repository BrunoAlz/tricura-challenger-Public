---
description: Review a spec (or batch) against the project test standards
argument-hint: <spec-path-or-directory> (e.g. tests/api/dashboard/chambers.spec.ts)
allowed-tools: Agent, Glob
---

# /tricura-review

Audit one or more spec files against the canonical Tricura test standards.

## Arguments

- `$ARGUMENTS` is a path to a `.spec.ts` file OR a directory under `tests/`. Globs are accepted (e.g. `tests/api/**/*.spec.ts`).
- If absent, prompt the user for a path or run against the most recently modified `.spec.ts` files.

## Workflow

1. **Resolve the path.** If it's a directory or glob, expand with:
   ```bash
   find $ARGUMENTS -name '*.spec.ts' -type f
   ```
   (or use Glob).

2. **Dispatch the spec-reviewer agent** per file (or batch if ≤5):
   ```
   Agent(
     subagent_type: "tricura-spec-reviewer",
     description: "Review <spec-path>",
     prompt: "Audit the spec(s) at <paths> against tricura-test-standards. Load that skill first. Walk the 17-point checklist, run npm run lint && npm run typecheck, and produce the report in the format defined in your agent definition. Cite line numbers for every blocker."
   )
   ```

3. **Aggregate** the reports if multiple files were reviewed: present one section per spec, plus a top-line summary (`N spec(s) reviewed: P PASS, A advisories, F fixes-needed`).

4. **Suggest next action** if any spec is FIXES-NEEDED: recommend invoking the test-author agent (or the user) with the specific blockers.

## Constraints

- Don't fix issues inline — review only. The reviewer agent enforces this.
- For batches >5 specs, run sequentially to avoid stomping each other's lint runs.
