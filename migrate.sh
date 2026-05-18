#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Reorganize the portfolio scaffold so that `LT_portfolio/` is the project root
# (instead of `LT_portfolio/My Website/`), then initialize git and wire the
# GitHub origin to LingT03/LingT03.github.io.
#
# Run from your Mac terminal:
#     bash "/Users/tataang/LT_portfolio/My Website/migrate.sh"
#
# Idempotent guards:
#   - aborts if the destination already has a .git directory
#   - aborts if anything at the destination would be overwritten by the move
# -----------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR"            # .../LT_portfolio/My Website
DEST="$(dirname "$SRC")"     # .../LT_portfolio
REMOTE_URL="https://github.com/LingT03/LingT03.github.io.git"

echo "Source:      $SRC"
echo "Destination: $DEST"
echo

# ---- safety checks ----------------------------------------------------------
if [[ ! -d "$SRC" ]]; then
  echo "ERROR: source directory does not exist: $SRC" >&2
  exit 1
fi
if [[ -e "$DEST/.git" ]]; then
  echo "ERROR: $DEST already contains a .git directory." >&2
  echo "       Resolve manually before running this migration." >&2
  exit 1
fi

# Refuse to overwrite any existing top-level entries at DEST.
shopt -s dotglob nullglob
for path in "$SRC"/*; do
  base="$(basename "$path")"
  if [[ -e "$DEST/$base" ]]; then
    echo "ERROR: $DEST/$base already exists; refusing to overwrite." >&2
    exit 1
  fi
done

# ---- move every entry (including dotfiles) up one level ---------------------
echo "Moving entries up to $DEST/ ..."
for path in "$SRC"/*; do
  mv "$path" "$DEST/"
done

# Now SRC should be empty; remove it.
if [[ -z "$(ls -A "$SRC")" ]]; then
  rmdir "$SRC"
  echo "Removed empty directory: $SRC"
else
  echo "WARNING: $SRC is not empty after move; leaving it in place." >&2
fi

# ---- git init + remote ------------------------------------------------------
cd "$DEST"
echo
echo "Initializing git in $DEST ..."
git init -b main
git add -A
git -c user.email="lingthang03@gmail.com" -c user.name="Ling Thang" \
  commit -m "Initial commit: portfolio scaffold per Portfolio_Website_Guideline.pdf"
git remote add origin "$REMOTE_URL"

echo
echo "Done."
echo "  cd \"$DEST\""
echo "  git remote -v"
echo "  git push -u origin main"
