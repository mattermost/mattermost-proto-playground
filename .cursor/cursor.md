# Cursor Cloud Agent Instructions

These instructions apply only to Cursor Cloud Agents. `.cursor/scripts/cloud-agent-start.sh` copies this file to `.cursor/AGENTS.md` (gitignored) at boot. The repo-root `AGENTS.md` and `src/pages/prototypes/AGENTS.md` still apply.

## Environment

- Image: `.cursor/Dockerfile` (Ubuntu 24.04, Node 24.11.1, npm 11, `gh`). No Docker, databases, or Playwright — none are needed.
- `cloud-agent-install.sh` sets up the same sibling layout as `.github/workflows/ci.yml`:

  ```text
  <parent>/
    compass-design/                 ← cloned by the install hook
    mattermost-proto-playground/    ← this repo
  ```

  It clones or fast-forwards `../compass-design` (default branch), runs `npm ci` there, builds `packages/compass-ui/dist` and `packages/compass-proto/dist` (`node scripts/ensure-compass-ui.mjs`), runs `npm ci` here, then checks everything with `node scripts/ensure-compass-packages.mjs`.

- `../compass-design` is required at exactly that path: `package.json` links `file:../compass-design/packages/compass-proto`, and `.agents/skills/compass-build` / `compass-review` are symlinks into it.
- Environment variables (set as Cloud Agent secrets):

  | Variable                         | Effect                                                                           |
  | -------------------------------- | -------------------------------------------------------------------------------- |
  | `CLOUD_AGENT_COMPASS_DESIGN_REF` | Branch, tag, or SHA of compass-design to check out (detached) instead of default |
  | `CLOUD_AGENT_SKIP_NPM_CI=1`      | Skip `npm ci` in both repos                                                      |
  | `CLOUD_AGENT_FORCE_NPM_CI=1`     | Run `npm ci` in both repos even when the lockfile is unchanged                   |
  | `CLOUD_AGENT_SKIP_PACKAGE_BUILD` | Skip the compass-ui / compass-proto build and the playground package check       |

- The install hook runs at Build time, not on every boot. If your branch changes `package-lock.json`, or you need a newer compass-design, rerun `bash .cursor/scripts/cloud-agent-install.sh` (idempotent).
- The dev server is not started at boot. Start it when the task needs it.

## Running the playground

| Surface | Command                            | URL                   |
| ------- | ---------------------------------- | --------------------- |
| Dev     | `npm run dev`                      | http://localhost:5173 |
| Preview | `npm run build && npm run preview` | http://localhost:4173 |

- The catalog is at `/`. Each prototype lives at the `path` in `src/manifests/prototypes.ts`, e.g. `/prototypes/video-calls`.
- Run servers in the background and wait for them before opening a browser:

  ```bash
  nohup npm run dev > /tmp/dev.log 2>&1 &
  timeout 120 bash -c 'until [ "$(curl -s --max-time 2 -o /dev/null -w "%{http_code}" http://localhost:5173/)" = 200 ]; do sleep 1; done' ||
    { echo "Dev server did not start:"; cat /tmp/dev.log; false; }
  ```

- `predev` / `prebuild` run `scripts/ensure-compass-packages.mjs`, which rebuilds compass-proto `dist/` in `../compass-design` when its source is newer.

## Screenshots

Use the `computerUse` subagent's Chrome desktop against http://localhost:5173. Open the prototype route, use the scene switcher in the top nav to reach the scene you changed, and screenshot that scene. Attach screenshots for every visual change; PRs here require them.

On the first page load after a fresh install, Vite discovers and pre-bundles dependencies, logs `optimized dependencies changed. reloading`, and the page can stay blank. Reload once before taking a screenshot.

## Changing compass-design

Prototype work stays in this repo. When a component belongs in Compass (see "Building new UI" in `AGENTS.md`), change it in `../compass-design` and open a separate PR there; `environment.json` lists it in `repositoryDependencies`, so git can push to it when you have access.

- Watch-build compass-proto while the playground dev server runs: `npm run dev:proto` in `../compass-design`. The playground full-reloads when `dist/index.{js,css}` changes.
- `@mattermost/compass-ui` comes from **npm** (`package.json`), not the sibling checkout. compass-ui source changes in `../compass-design` do not show up here until they are published and the version is bumped.
- Run `git -C ../compass-design status` before finishing so sibling edits are not left behind uncommitted.

## Verifying changes

Same steps as `.github/workflows/ci.yml`:

```bash
npm run lint
npm run format:check
npm run build          # tsc -b + vite build
```

## Troubleshooting

| Symptom                                                         | Fix                                                                                                                                                                                                   |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `compass-design not found` or `node_modules link missing`       | `bash .cursor/scripts/cloud-agent-install.sh`. It clones `../compass-design` and reinstalls.                                                                                                          |
| `node_modules link does not match the ensure-script source`     | `COMPASS_DESIGN_PATH` points somewhere other than `../compass-design`. Unset it, or symlink `../compass-design` to it, then `CLOUD_AGENT_FORCE_NPM_CI=1 bash .cursor/scripts/cloud-agent-install.sh`. |
| `Cannot read properties of null (reading 'useRef')` in the page | Two copies of React. Keep `resolve.dedupe` in `vite.config.ts`; do not import React from `../compass-design/node_modules`.                                                                            |
| `[@mattermost/compass-ui] package is incomplete`                | `npm ci` here (or `CLOUD_AGENT_FORCE_NPM_CI=1` on the next install run).                                                                                                                              |
| Install warns that `../compass-design` has local changes        | The hook will not pull over your edits. Commit, stash, or discard them, then rerun the install hook.                                                                                                  |
| Import works on macOS but fails here                            | Linux is case-sensitive. Fix the import path casing — CI (ubuntu) fails the same way.                                                                                                                 |
| `ENOSPC: System limit for number of file watchers reached`      | `sudo sysctl -p /etc/sysctl.d/60-proto-playground-inotify.conf`, then restart the dev server.                                                                                                         |
| Port 5173 already in use                                        | `lsof -i :5173` and kill the old process. Vite silently moves to the next port otherwise.                                                                                                             |
