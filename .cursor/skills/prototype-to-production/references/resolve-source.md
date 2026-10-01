# Resolve prototype source

Component mapping comes from **source**, not from scraping a published DOM. CSS modules hash class names; walkthrough `data-wt-*` attributes are playground-only.

## Inputs

Accept:

- **Required:** a git **ref** for the playground — branch name, PR URL/number, or commit SHA (prototypes usually are not on `main`)
- **Plus** one of: published URL containing `/prototypes/<slug>`, path/slug `/prototypes/<slug>` or `<slug>`, or a local playground path `…/src/pages/prototypes/<slug>/`

If the user gives only a published URL or slug **without** a branch/PR/commit, **ask once** for the ref before reading source. Do not assume `main` and do not invent a feature branch from the URL hostname.

**Exception:** a **local playground path** is OK without a separate ref string if you record the clone’s current branch/SHA (`git rev-parse --abbrev-ref HEAD` / `git rev-parse HEAD`) and use that tree — still do not silently read a different remote ref.

Use the live URL for visual context only after source is resolved on the correct ref.

## Extract the slug

1. From a URL, take the pathname; strip trailing `/`.
2. Match `/prototypes/<slug>` (ignore query/hash and deploy base paths if present).
3. `<slug>` is the prototype id / folder name by convention (see playground `src/manifests/prototypes.ts`).

Examples:

| Input | Slug |
| --- | --- |
| `https://example.com/prototypes/outbound-calls` | `outbound-calls` |
| `https://example.com/prototypes/outbound-calls/?scene=home` | `outbound-calls` |
| `/prototypes/mobile-home-channel` | `mobile-home-channel` |

## Locate source files

**Prefer local clone** when the playground (or that folder) is already on disk:

```text
<playground-root>/src/pages/prototypes/<slug>/
```

Typical layout:

```text
<Slug>.tsx              # orchestrator
<slug>Data.ts           # fixtures (optional)
<slug>Scenes.ts         # scene ids (optional)
components/             # prototype-local UI
scenes/                 # one file per scene
*Walkthrough.ts         # ignore for production translation
```

**Otherwise fetch from GitHub** using the **required ref** (branch, PR head, or commit):

```text
https://github.com/mattermost/mattermost-proto-playground/tree/<ref>/src/pages/prototypes/<slug>/
https://raw.githubusercontent.com/mattermost/mattermost-proto-playground/<ref>/src/pages/prototypes/<slug>/<file>
```

For a PR number, resolve the head SHA/branch via `gh` then fetch that ref. Use git sparse checkout / HTTP as available. Record the ref for the session so later reads stay on the same revision.

Do **not** fall back to `main` when the ref was omitted — ask for it.

**If the ref cannot be read** (private repo, 404, missing `gh`/auth, network): **stop**. Ask the user for a local playground path, access, or the relevant source files. Do **not** invent UI by scraping the published demo URL alone (hashed classes are not component IDs).

## What to read

1. Orchestrator and every `scenes/*` file — collect imports.
2. `components/*` — local compositions to rebuild.
3. Optional: playground `package.json` for the prototype’s compass-ui version (awareness only).
4. Skip walkthrough-only files unless they clarify intended product flow.

## Manifest cross-check (optional)

If the playground repo is local, `src/manifests/prototypes.ts` maps `path` → `id`. Folder slug usually equals `id`. There is no filesystem API beyond that convention.
