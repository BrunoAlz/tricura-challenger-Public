#!/usr/bin/env bash
# SessionStart hook — emits a one-screen project snapshot so the model arrives
# calibrated: test counts, baseline status, lint state, recent commits.

set -u

PROJECT_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$PROJECT_ROOT" || exit 0

SPEC_COUNT=$(find tests -name '*.spec.ts' -type f 2>/dev/null | wc -l | tr -d ' ')
POM_COUNT=$(find src/pages -name '*.ts' -type f 2>/dev/null | wc -l | tr -d ' ')

BASELINE=""
if [ -f test-results/results.json ]; then
  BASELINE=$(jq -r '"\(.stats.expected)/\(.stats.unexpected)/\(.stats.flaky)/\(.stats.skipped)"' test-results/results.json 2>/dev/null)
fi

CATALOG="$PROJECT_ROOT/deliverables/BUGS-CATALOG.md"
BUG_COUNT=""
if [ -f "$CATALOG" ]; then
  BUG_COUNT=$(grep -oE 'BUG-[0-9]{3,}' "$CATALOG" 2>/dev/null | sort -u | wc -l | tr -d ' ')
fi

COVERED_COUNT=$(grep -rhoE '@bug-[0-9]{3,}' tests 2>/dev/null | sort -u | wc -l | tr -d ' ')

LAST_COMMIT=""
if [ -d .git ]; then
  LAST_COMMIT=$(git log -1 --pretty='%h %s' 2>/dev/null | head -c 100)
fi

{
  echo "::tricura-hook:: Session bootstrap — tricura-challenger snapshot"
  echo ""
  echo "**Suite:** $SPEC_COUNT spec files | $POM_COUNT POMs"
  [ -n "$BASELINE" ]    && echo "**Baseline (last run):** $BASELINE"
  [ -n "$BUG_COUNT" ]   && echo "**Catalog:** $BUG_COUNT bugs documented | $COVERED_COUNT @bug-XXX tags in tests/"
  [ -n "$LAST_COMMIT" ] && echo "**Last commit:** $LAST_COMMIT"
  echo ""
  echo "Standards: see .claude/skills/tricura-test-standards/SKILL.md"
  echo "Commands available: /tricura-regression /tricura-explore /tricura-review /tricura-flake /tricura-status"
} >&2

exit 0
