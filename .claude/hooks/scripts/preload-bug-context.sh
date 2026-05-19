#!/usr/bin/env bash
# UserPromptSubmit hook — if the prompt mentions BUG-XXX, pre-load the catalog
# row(s) into the conversation context. Saves a Read tool round-trip and gives
# the model the bug entry the moment it sees the reference.

set -u

INPUT=$(cat)

PROMPT=$(echo "$INPUT" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get("user_prompt", "") or data.get("prompt", ""))
except Exception:
    pass
' 2>/dev/null)

# Extract every BUG-XXX referenced in the prompt.
BUG_IDS=$(echo "$PROMPT" | grep -oE 'BUG-[0-9]{3,}' | sort -u)

if [ -z "$BUG_IDS" ]; then
  exit 0
fi

PROJECT_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
CATALOG="$PROJECT_ROOT/deliverables/BUGS-CATALOG.md"

if [ ! -f "$CATALOG" ]; then
  # Catalog should live in deliverables/ inside the project root; bail if absent.
  exit 0
fi

# Build a snippet for each bug. Match the row by ID, grab a window of 5 lines
# around it so the entry is readable in context.
{
  echo "::tricura-hook:: pre-loaded BUGS-CATALOG entries referenced in this prompt:"
  echo ""
  for ID in $BUG_IDS; do
    echo "### $ID"
    grep -B1 -A4 -E "\b$ID\b" "$CATALOG" 2>/dev/null | head -20
    echo ""
  done
} >&2

exit 0
