#!/usr/bin/env bash
# V2 cleanup — remove superseded placeholder content files and refresh
# the book catalog from Open Library now that the host has network access.
#
# Safe to re-run: every step is idempotent.

set -euo pipefail

cd "$(dirname "$0")/.."

# Clear any orphaned lock file left over from a sandbox session.
rm -f .git/index.lock

echo "==> Removing V2-superseded placeholder content..."
git rm -f --ignore-unmatch \
  content/projects/01-placeholder-causal-ml.md \
  content/projects/02-placeholder-portfolio.md \
  content/books/01-placeholder-elements.md \
  content/books/02-placeholder-causal.md \
  content/books/03-placeholder-fiction.md \
  content/jobs/01-placeholder-current.md \
  content/jobs/02-placeholder-previous.md \
  content/photos/01-placeholder-photo.md \
  content/photos/02-placeholder-photo.md \
  content/photos/03-placeholder-photo.md

echo
echo "==> Refreshing book catalog from Open Library (online fetch)..."
.venv/bin/python scripts/fetch_books.py

echo
echo "==> Rebuilding compiled content payloads..."
.venv/bin/python scripts/build_content.py

echo
echo "==> Done. Inspect the diff before committing:"
echo "    git status"
echo "    git diff content/books/ | head -80"
