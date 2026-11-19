#!/usr/bin/env bash
# Cursor Cloud Agent start hook. Keep it fast: the dev server is started on demand
# (see .cursor/cursor.md), not here.

set -Eeuo pipefail

log() { printf '[cloud-agent-start] %s\n' "$*" >&2; }

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$repo_root"

# Cloud-only instructions; .cursor/AGENTS.md is gitignored so local IDE runs never see it.
if [ -f .cursor/cursor.md ]; then
  cp .cursor/cursor.md .cursor/AGENTS.md
  log "Materialized Cloud Agent instructions at .cursor/AGENTS.md"
fi

# Raising inotify limits needs a writable /proc/sys; some sandboxes refuse, which is non-fatal.
if [ -f /etc/sysctl.d/60-proto-playground-inotify.conf ]; then
  sudo sysctl -q -p /etc/sysctl.d/60-proto-playground-inotify.conf >/dev/null 2>&1 ||
    log "Could not raise inotify limits; watchers may hit ENOSPC (see .cursor/cursor.md)"
fi

compass_dir="$(dirname "$repo_root")/compass-design"
if [ -d "$compass_dir/packages/compass-proto" ]; then
  log "compass-design at $compass_dir ($(git -C "$compass_dir" rev-parse --short HEAD 2>/dev/null || echo 'not a git checkout'))"
else
  log "WARNING: $compass_dir is missing; run: bash .cursor/scripts/cloud-agent-install.sh"
fi

log "inotify max_user_watches=$(cat /proc/sys/fs/inotify/max_user_watches 2>/dev/null || echo unknown)"
log "Start complete"
