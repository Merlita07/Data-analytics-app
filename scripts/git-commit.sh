#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v git >/dev/null 2>&1; then
  echo "git not found in PATH" >&2
  exit 1
fi

MSG="${1-}"
PUSH=false
if [ "${MSG}" = "-p" ] || [ "${MSG}" = "--push" ]; then
  MSG=""
  PUSH=true
fi
if [ "$#" -ge 1 ] && [ "$PUSH" = false ]; then
  MSG="$*"
fi

if [ -z "$MSG" ]; then
  read -rp "Commit message: " MSG
fi
if [ -z "$MSG" ]; then
  echo "Commit message required" >&2
  exit 1
fi

echo "Staging all changes..."
git add -A

echo "Committing..."
git commit -m "$MSG" || echo "No changes to commit or commit failed"

if [ "$PUSH" = true ]; then
  branch=$(git rev-parse --abbrev-ref HEAD)
  echo "Pushing to origin/$branch..."
  git push origin "$branch"
fi

echo "Done."
