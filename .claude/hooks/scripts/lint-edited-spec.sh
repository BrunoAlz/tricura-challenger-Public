#!/usr/bin/env bash
# PostToolUse hook for Edit/Write on *.spec.ts files.
# Lints the touched spec only (fast feedback, ~1s) and prints results to stderr
# so they surface in the conversation. Non-blocking: never exits non-zero so
# the model can decide what to do with the report.

set -u

# Claude Code passes the tool input as JSON on stdin.
INPUT=$(cat)

# Extract file_path from common Edit/Write tool shapes.
FILE_PATH=$(echo "$INPUT" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    p = data.get("tool_input", {}).get("file_path") or data.get("file_path", "")
    print(p)
except Exception:
    pass
' 2>/dev/null)

# Only fire on .spec.ts files inside tests/.
case "$FILE_PATH" in
  */tests/*.spec.ts) ;;
  *) exit 0 ;;
esac

# Resolve project root (assume hook script lives in .claude/hooks/scripts/).
PROJECT_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"

# If the file isn't under the project, skip silently.
case "$FILE_PATH" in
  "$PROJECT_ROOT"/*) ;;
  *) exit 0 ;;
esac

# Lint just this file.
cd "$PROJECT_ROOT" || exit 0
OUTPUT=$(npx eslint "$FILE_PATH" --format=compact 2>&1) || true

# Surface only if there are findings. Empty output = clean.
if [ -n "$OUTPUT" ] && echo "$OUTPUT" | grep -qE 'warning|error'; then
  echo "::tricura-hook:: lint findings on $(basename "$FILE_PATH"):" >&2
  echo "$OUTPUT" >&2
fi

exit 0
