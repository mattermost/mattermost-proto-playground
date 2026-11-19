#!/usr/bin/env bash
# Cursor Cloud Agent install ("update") hook. Runs from the project root on every Build
# and must stay idempotent; Cursor snapshots the resulting disk, including ../compass-design.

set -Eeuo pipefail

log() { printf '[cloud-agent-install] %s\n' "$*" >&2; }

is_true() {
  case "${1:-}" in
    1|true|TRUE|yes|YES) return 0 ;;
    *) return 1 ;;
  esac
}

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$repo_root"

for tool in node npm git; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    log "Required tool '$tool' is not on PATH; .cursor/Dockerfile did not build as expected"
    exit 1
  fi
done

node_major="$(node -p 'process.versions.node.split(".")[0]')"
npm_major="$(npm --version | cut -d. -f1)"
if [ "$node_major" != "24" ] || [ "$npm_major" != "11" ]; then
  log "WARNING: expected Node 24 / npm 11 (package.json engines), found node $(node --version) / npm $(npm --version)"
fi

# npm resolves `file:../compass-design/packages/compass-proto`, so the sibling must live at
# exactly this path.
compass_dir="$(dirname "$repo_root")/compass-design"
compass_url="${CLOUD_AGENT_COMPASS_DESIGN_URL:-https://github.com/mattermost/compass-design.git}"
compass_ref="${CLOUD_AGENT_COMPASS_DESIGN_REF:-}"

clone_compass_design() {
  if [ -n "${COMPASS_DESIGN_PATH:-}" ] && [ -f "$COMPASS_DESIGN_PATH/package.json" ]; then
    log "Linking $compass_dir -> $COMPASS_DESIGN_PATH (COMPASS_DESIGN_PATH set)"
    # ln -s into an existing directory would create the link inside it.
    if [ -d "$compass_dir" ] && [ ! -L "$compass_dir" ]; then
      rmdir "$compass_dir" 2>/dev/null || sudo rmdir "$compass_dir"
    fi
    ln -s "$(cd "$COMPASS_DESIGN_PATH" && pwd)" "$compass_dir" 2>/dev/null ||
      sudo ln -s "$(cd "$COMPASS_DESIGN_PATH" && pwd)" "$compass_dir"
    return
  fi

  # The repo may sit directly under a root-owned directory (e.g. /workspace); pre-create
  # an empty, user-owned target so git can clone into it.
  if [ ! -w "$(dirname "$compass_dir")" ] && [ ! -d "$compass_dir" ]; then
    sudo install -d -o "$(id -u)" -g "$(id -g)" "$compass_dir"
  fi

  log "Cloning $compass_url into $compass_dir"
  git clone "$compass_url" "$compass_dir"
}

refresh_compass_design() {
  if [ ! -d "$compass_dir/.git" ] && [ ! -f "$compass_dir/.git" ]; then
    log "$compass_dir is not a git checkout; leaving it as is"
    return
  fi
  if [ -n "$(git -C "$compass_dir" status --porcelain)" ]; then
    log "WARNING: $compass_dir has local changes; not updating it"
    return
  fi

  if [ -n "$compass_ref" ]; then
    log "Checking out compass-design $compass_ref (CLOUD_AGENT_COMPASS_DESIGN_REF)"
    git -C "$compass_dir" fetch --quiet origin "$compass_ref"
    git -C "$compass_dir" checkout --quiet --detach FETCH_HEAD
    return
  fi

  # A detached HEAD is what an earlier CLOUD_AGENT_COMPASS_DESIGN_REF run leaves behind.
  if ! git -C "$compass_dir" symbolic-ref -q HEAD >/dev/null; then
    local default_branch
    # set-head --auto fails when the new default branch has no remote-tracking ref yet.
    { git -C "$compass_dir" fetch --quiet origin &&
      git -C "$compass_dir" remote set-head origin --auto >/dev/null 2>&1; } ||
      log "WARNING: could not refresh origin/HEAD; using the cached default branch"
    default_branch="$(git -C "$compass_dir" symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)"
    default_branch="${default_branch#origin/}"
    if [ -n "$default_branch" ]; then
      log "Returning compass-design to $default_branch (no CLOUD_AGENT_COMPASS_DESIGN_REF set)"
      git -C "$compass_dir" checkout --quiet "$default_branch" ||
        log "WARNING: could not check out $default_branch in $compass_dir"
    fi
  fi

  if git -C "$compass_dir" rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
    git -C "$compass_dir" pull --quiet --ff-only ||
      log "WARNING: could not fast-forward $compass_dir; using the existing checkout"
  else
    log "compass-design is not on a tracking branch; leaving it at $(git -C "$compass_dir" rev-parse --short HEAD)"
  fi
}

# An empty directory is what a failed clone into a pre-created target leaves behind.
if [ -e "$compass_dir" ] && [ -n "$(ls -A "$compass_dir" 2>/dev/null)" ]; then
  refresh_compass_design
else
  clone_compass_design
  if [ -n "$compass_ref" ]; then
    refresh_compass_design
  fi
fi

if [ ! -f "$compass_dir/packages/compass-proto/package.json" ]; then
  log "$compass_dir/packages/compass-proto is missing; compass-design checkout is incomplete"
  exit 1
fi

# npm ci wipes node_modules, so skip it when the lockfile and Node version are unchanged.
npm_ci_if_changed() {
  local dir="$1" label="$2"
  local stamp_file="$dir/node_modules/.cloud-agent-install-stamp"
  local lock_stamp
  lock_stamp="$(sha256sum "$dir/package-lock.json" | cut -d' ' -f1) node-$(node --version)"

  if is_true "${CLOUD_AGENT_SKIP_NPM_CI:-}"; then
    log "Skipping npm ci in $label (CLOUD_AGENT_SKIP_NPM_CI set)"
  elif [ -f "$stamp_file" ] && [ "$(cat "$stamp_file")" = "$lock_stamp" ] && ! is_true "${CLOUD_AGENT_FORCE_NPM_CI:-}"; then
    log "$label node_modules matches package-lock.json; skipping npm ci"
  else
    log "Installing $label dependencies (npm ci)"
    (cd "$dir" && npm ci --no-audit --no-fund)
    printf '%s\n' "$lock_stamp" > "$stamp_file"
  fi
}

npm_ci_if_changed "$compass_dir" "compass-design"

# compass-proto dist/ is what the playground imports; ensure-compass-ui.mjs rebuilds
# compass-ui and compass-proto only when dist/ is missing or stale.
if is_true "${CLOUD_AGENT_SKIP_PACKAGE_BUILD:-}"; then
  log "Skipping compass-ui / compass-proto build (CLOUD_AGENT_SKIP_PACKAGE_BUILD set)"
else
  log "Ensuring compass-design packages/*/dist are built"
  (cd "$compass_dir" && node scripts/ensure-compass-ui.mjs)
fi

if [ ! -e node_modules/@mattermost/compass-proto ]; then
  rm -f node_modules/.cloud-agent-install-stamp
fi
npm_ci_if_changed "$repo_root" "playground"

if ! is_true "${CLOUD_AGENT_SKIP_PACKAGE_BUILD:-}"; then
  log "Verifying compass-ui and compass-proto for the playground"
  node scripts/ensure-compass-packages.mjs
fi

log "Tool versions:"
printf '  node %s\n  npm %s\n  %s\n  compass-design %s\n' \
  "$(node --version)" "$(npm --version)" "$(git --version)" \
  "$(git -C "$compass_dir" log -1 --format='%h %s' 2>/dev/null || echo unknown)" >&2
command -v gh >/dev/null 2>&1 && gh --version | head -n1 | sed 's/^/  /' >&2

log "Install complete"
