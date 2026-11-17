# Cursor Cloud Agent environment

Files in this directory configure [Cursor Cloud Agents](https://cursor.com/docs/cloud-agent/setup) for this repo. Cursor reads `environment.json` from the environment's default branch when it runs a Build.

| File                             | Purpose                                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `environment.json`               | Image, install/start hooks, `compass-design` git access, forwarded ports (5173 dev, 4173 preview)     |
| `Dockerfile`                     | Ubuntu 24.04 + Node 24.11.1 (matches `.nvmrc`) + `gh` + `xdg-utils`                                   |
| `scripts/cloud-agent-install.sh` | Clones/updates `../compass-design`, installs and builds it, then `npm ci` here (skipped if unchanged) |
| `scripts/cloud-agent-start.sh`   | Copies `cursor.md` to `.cursor/AGENTS.md`, raises inotify limits, reports the compass-design commit   |
| `cursor.md`                      | Cloud-only agent instructions: running the playground, screenshots, verification, troubleshooting     |

`rules/` holds regular Cursor project rules, shared with local IDE use.

## Sibling repo

The playground depends on unpublished `@mattermost/compass-proto` through `file:../compass-design/packages/compass-proto`, so the install hook clones [`mattermost/compass-design`](https://github.com/mattermost/compass-design) next to this repo, the same layout CI uses. Configure this as a **single-repo** environment: the hook handles the sibling, and Cursor's multi-repo checkout does not guarantee the `../compass-design` path.

`repositoryDependencies` gives agents git credentials for compass-design so they can open PRs there. The clone itself is public and needs no credentials.

## Expected secrets

None. Optional variables (`CLOUD_AGENT_COMPASS_DESIGN_REF`, `CLOUD_AGENT_SKIP_NPM_CI`, `CLOUD_AGENT_FORCE_NPM_CI`, `CLOUD_AGENT_SKIP_PACKAGE_BUILD`) are described in `cursor.md`.

## Changing the environment

- Bump `NODE_VERSION` in the `Dockerfile` together with `.nvmrc` and `package.json` `engines` (and keep it in line with compass-design).
- Test locally from the repo root. The container builds the sibling layout from scratch, so it also exercises the clone:

  ```bash
  docker build -t proto-playground-cloud-agent -f .cursor/Dockerfile .cursor/
  docker run --rm -it -v "$PWD":/src:ro proto-playground-cloud-agent bash -lc '
    mkdir -p ~/work && rsync -a --exclude node_modules --exclude dist /src/ ~/work/mattermost-proto-playground/ &&
    cd ~/work/mattermost-proto-playground &&
    bash .cursor/scripts/cloud-agent-install.sh &&
    bash .cursor/scripts/cloud-agent-start.sh &&
    npm run lint && npm run format:check && npm run build'
  ```

- Builds use the default branch's `environment.json`. "Environment ready with warnings" usually means a Build fell back to the default image — check the install log before trusting the run.
