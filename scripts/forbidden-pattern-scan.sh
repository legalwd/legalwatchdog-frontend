#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
cd "$ROOT"

EXCLUDE=${2:-":(exclude)scripts/forbidden-pattern-scan.sh"}

PATTERNS=(
  "global\['!'\]"
  "ETH_RPC_URL"
  "spawn=require"
  "runOn.*folderOpen"
  "node ./public/fonts/"
  "node .*\\.woff2"
  "task.allowAutomaticTasks"
  "http=require"
  "https=require"
)

all_matches=""
for pattern in "${PATTERNS[@]}"; do
  matches=$(git grep -nE -- "$pattern" -- . "$EXCLUDE" || true)
  if [[ -n "$matches" ]]; then
    all_matches+="$matches"$'\n'
  fi
done

if [[ -n "$all_matches" ]]; then
  echo "::error::Blocked malicious pattern detected in repository files." >&2
  echo "Affected hit(s):" >&2
  printf '%b\n' "$all_matches" >&2
  exit 1
fi

echo "OK: no blocked malicious patterns were found."