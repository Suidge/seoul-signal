#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BRANCH="${BRANCH:-main}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-chore: refresh pages content}"

cd "$ROOT_DIR"

git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
pnpm install --frozen-lockfile
pnpm sync:sources
pnpm sync:official-updates
pnpm sync:images
pnpm sync:event-images
pnpm sync:venue-guides
pnpm refresh:editorial
pnpm redesign:visuals
pnpm prepare:pages
pnpm build

if git diff --quiet -- data app lib components README.md docs .github/workflows; then
  echo "No content changes to publish."
  exit 0
fi

git add data app lib components README.md docs .github/workflows next.config.ts package.json scripts
git commit -m "$COMMIT_MESSAGE"
git push origin "$BRANCH"
