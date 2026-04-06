#!/usr/bin/env bash
set -euo pipefail

# Updates the apathy-theme submodule in czxtm/zed-extensions (fork),
# bumps the version in extensions.toml, pushes, and opens a PR to
# the upstream zed-industries/extensions repo.

FORK_REPO="czxtm/zed-extensions"
UPSTREAM_REPO="zed-industries/extensions"
TMPDIR=$(mktemp -d)

echo "Determining source ref (tag or commit) from current repo..."
SRC_TOPLEVEL=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [ -z "$SRC_TOPLEVEL" ]; then
  echo "Not in a git repository. Exiting."
  exit 1
fi

SRC_COMMIT=$(git -C "$SRC_TOPLEVEL" rev-parse --verify HEAD)
SRC_TAG=$(git -C "$SRC_TOPLEVEL" describe --tags --exact-match HEAD 2>/dev/null || true)
if [ -n "$SRC_TAG" ]; then
  REF="$SRC_TAG"
else
  REF="$SRC_COMMIT"
fi

EXT_VERSION=$(sed -n 's/^version = "\(.*\)"/\1/p' "$SRC_TOPLEVEL/packages/zed/extension.toml")
if [ -z "$EXT_VERSION" ]; then
  echo "Could not read version from packages/zed/extension.toml"
  exit 1
fi

echo "Using ref: $REF, extension version: $EXT_VERSION"

echo "Cloning ${FORK_REPO} into ${TMPDIR}..."
if [ -n "${GITHUB_TOKEN-}" ]; then
  git clone "https://x-access-token:${GITHUB_TOKEN}@github.com/${FORK_REPO}.git" "$TMPDIR"
else
  git clone "git@github.com:${FORK_REPO}.git" "$TMPDIR"
fi

cd "$TMPDIR"

# Sync fork with upstream before branching
if [ -n "${GITHUB_TOKEN-}" ]; then
  git remote add upstream "https://x-access-token:${GITHUB_TOKEN}@github.com/${UPSTREAM_REPO}.git"
else
  git remote add upstream "git@github.com:${UPSTREAM_REPO}.git"
fi
git fetch upstream main
git checkout -B main upstream/main

BRANCH="update/apathy-theme-${REF//[^a-zA-Z0-9._-]/_}"
git checkout -b "$BRANCH"

# Update version in extensions.toml under the [apathy-theme] section
awk -v ver="$EXT_VERSION" '
  /^\[apathy-theme\]/ { in_section=1 }
  in_section && /^version = / { $0 = "version = \"" ver "\""; in_section=0 }
  in_section && /^\[/ && !/^\[apathy-theme\]/ { in_section=0 }
  { print }
' extensions.toml > extensions.toml.tmp && mv extensions.toml.tmp extensions.toml

echo "Updated extensions.toml:"
grep -A2 '\[apathy-theme\]' extensions.toml

echo "Searching .gitmodules for a submodule referencing 'apathy-theme'..."
submodule_key=$(git config -f .gitmodules --get-regexp 'submodule\..*\.url' | awk '/apathy-theme/{print $1; exit}' || true)
if [ -z "$submodule_key" ]; then
  echo "No submodule url containing 'apathy-theme' found in .gitmodules"
  exit 1
fi
submodule_name=$(echo "$submodule_key" | sed -E 's/submodule\.(.*)\.url/\1/')
submodule_path=$(git config -f .gitmodules --get "submodule.${submodule_name}.path")
if [ -z "$submodule_path" ]; then
  echo "Could not determine path for submodule ${submodule_name}"
  exit 1
fi

echo "Found submodule: ${submodule_name} at path: ${submodule_path}"
git submodule init "$submodule_path" || true
git submodule update --init --recursive "$submodule_path" || true

echo "Updating submodule to ref ${REF}..."
pushd "$submodule_path" >/dev/null
git fetch origin --tags || true
if git rev-parse --verify "$REF" >/dev/null 2>&1; then
  git checkout "$REF"
else
  git fetch --all || true
  git checkout "$REF" || { echo "Failed to checkout ${REF} in submodule"; exit 1; }
fi
popd >/dev/null

git add "$submodule_path" extensions.toml
if git commit -m "chore: update apathy-theme to ${REF}"; then
  echo "Committed submodule + version update"
else
  echo "No changes to commit"
  exit 0
fi

echo "Pushing branch ${BRANCH} to ${FORK_REPO}..."
if [ -n "${GITHUB_TOKEN-}" ]; then
  git push "https://x-access-token:${GITHUB_TOKEN}@github.com/${FORK_REPO}.git" "$BRANCH"
else
  git push "git@github.com:${FORK_REPO}.git" "$BRANCH"
fi

PR_TITLE="chore: update apathy-theme to ${REF}"
PR_BODY="Automated update of the apathy-theme extension to ${REF} (version ${EXT_VERSION})."

if command -v gh >/dev/null 2>&1; then
  echo "Creating PR to upstream..."
  gh pr create --repo "${UPSTREAM_REPO}" --title "$PR_TITLE" --body "$PR_BODY" --base main --head "czxtm:${BRANCH}"
else
  echo "gh CLI not found; attempting GitHub API PR creation"
  if [ -z "${GITHUB_TOKEN-}" ]; then
    echo "GITHUB_TOKEN not set; cannot create PR. Branch pushed: ${BRANCH}"
    exit 0
  fi
  if ! command -v jq >/dev/null 2>&1; then
    echo "jq not found; branch pushed: ${BRANCH}"
    exit 0
  fi
  data=$(jq -n --arg title "$PR_TITLE" --arg head "czxtm:${BRANCH}" --arg base "main" --arg body "$PR_BODY" \
    '{title: $title, head: $head, base: $base, body: $body}')
  resp=$(curl -s -X POST -H "Authorization: token ${GITHUB_TOKEN}" -H "Content-Type: application/json" \
    -d "$data" "https://api.github.com/repos/${UPSTREAM_REPO}/pulls")
  echo "$resp" | jq -r '.html_url'
fi

echo "Update script finished."
