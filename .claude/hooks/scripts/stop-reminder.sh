#!/usr/bin/env bash
# Stop hook — if any *.spec.ts was edited during this session, remind the user
# (and the model) to run npm test before claiming the work is done. We don't
# block; we just emit a reminder to stderr.

set -u

INPUT=$(cat)

# Check the transcript for spec edits in this session. The Stop hook receives
# information about session-modified files via the harness.
TOUCHED_SPECS=$(echo "$INPUT" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    files = data.get("modified_files", []) or data.get("touched_files", []) or []
    specs = [f for f in files if f.endswith(".spec.ts")]
    print("\n".join(specs))
except Exception:
    pass
' 2>/dev/null)

if [ -z "$TOUCHED_SPECS" ]; then
  exit 0
fi

{
  echo "::tricura-hook:: spec files were edited this session:"
  echo "$TOUCHED_SPECS" | sed 's/^/  - /'
  echo ""
  echo "Before claiming the work is done, validate:"
  echo "  npm run lint && npm run typecheck && npm test"
  echo "Verify against the documented baseline (held privately)."
} >&2

exit 0
