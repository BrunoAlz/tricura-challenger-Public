# Tricura hooks

Lifecycle automation for the Claude Code session running against `tricura-challenger`. All hooks emit feedback to `stderr` — they are advisory, never blocking. The model decides what to do with the messages they surface.

## Hooks registered

| Event | Script | Purpose |
|---|---|---|
| `PostToolUse` (Edit\|Write) | `scripts/lint-edited-spec.sh` | Lint only the spec file just touched, ~1 s feedback. |
| `PostToolUse` (Edit\|Write) | `scripts/typecheck-project.sh` | Typecheck the project when a `src/**/*.ts` file (POM/fixture/service) is touched — POM changes cascade. |
| `UserPromptSubmit` | `scripts/preload-bug-context.sh` | If the prompt mentions `BUG-XXX`, surface the matching catalog row(s) so the model arrives ready. |
| `SessionStart` | `scripts/session-bootstrap.sh` | Print a one-screen snapshot: spec count, POM count, last baseline, catalog coverage, latest commit. |
| `Stop` | `scripts/stop-reminder.sh` | If any `*.spec.ts` was edited during the session, remind to run `npm run lint && npm run typecheck && npm test` before claiming done. |

## Setup

The hook registration template is in `config/settings.template.json` (the harness blocks writes to the live `settings.json`, so copy it manually on first install).

```bash
# 1. Make the scripts executable
chmod +x .claude/hooks/scripts/*.sh

# 2. Install the hook registration into the live settings file
cp .claude/hooks/config/settings.template.json .claude/settings.json
# (or merge by hand if you already have local hooks/permissions)

# 3. Validate
python3 -m json.tool .claude/settings.json > /dev/null
```

The user starting the session approves the hook commands when prompted (or pre-allows them via `.claude/settings.local.json`).

## Behavioural contract

- **Non-blocking.** Every script ends with `exit 0`. A failed lint never aborts a tool call — it only emits a report.
- **Idempotent.** Running a hook twice produces the same output. No global state mutation.
- **Scoped.** Each script checks the path/payload before doing real work. A `PostToolUse` on a `README.md` edit does not trigger lint.
- **Self-contained.** Scripts depend only on tools already in the dev box (`bash`, `python3`, `jq`, `npm`, `npx`).

## Debugging

- All hook output goes to `stderr` and is visible in the Claude Code conversation transcript.
- Test a hook manually by piping a fake payload:

  ```bash
  echo '{"tool_input":{"file_path":"/path/to/file.spec.ts"}}' | .claude/hooks/scripts/lint-edited-spec.sh
  ```

- Disable a single hook locally without touching the team file by adding the same key to a personal local-overrides file with an empty array.

## Adding a new hook

1. Drop the script under `.claude/hooks/scripts/`.
2. `chmod +x` it.
3. Register the command in the template file.
4. Document it in the table above and run the manual test snippet.
