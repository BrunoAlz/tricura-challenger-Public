#!/usr/bin/env bash
# PostToolUse hook for Edit/Write on src/**/*.ts (POMs, fixtures, services).
# Runs tsc --noEmit on the whole project — POM changes cascade into every spec
# that consumes them. Non-blocking.

set -u

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    p = data.get("tool_input", {}).get("file_path") or data.get("file_path", "")
    print(p)
except Exception:
    pass
' 2>/dev/null)

# Only fire on src/**/*.ts (excluding spec.ts which is handled by lint-edited-spec).
case "$FILE_PATH" in
  */src/*.ts)
    case "$FILE_PATH" in
      *.spec.ts) exit 0 ;;
      *.test.ts) exit 0 ;;
    esac
    ;;
  *) exit 0 ;;
esac

PROJECT_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"

case "$FILE_PATH" in
  "$PROJECT_ROOT"/*) ;;
  *) exit 0 ;;
esac

cd "$PROJECT_ROOT" || exit 0

# Quick typecheck of the whole project (~3-5s).
OUTPUT=$(npx tsc --noEmit 2>&1) || true

if [ -n "$OUTPUT" ] && echo "$OUTPUT" | grep -qE 'error TS'; then
  echo "::tricura-hook:: typecheck errors after editing $(basename "$FILE_PATH"):" >&2
  echo "$OUTPUT" >&2
fi

exit 0
