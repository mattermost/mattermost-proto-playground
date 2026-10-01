# Resolve prototype source

Component mapping comes from **source**, not from scraping a published DOM. CSS modules hash class names; walkthrough `data-wt-*` attributes are playground-only.

## Inputs

Accept any of:

- Published URL (GitHub Pages, Vercel, etc.) containing `/prototypes/<slug>`
- Path or slug: `/prototypes/<slug>` or `<slug>`
- Local path to a playground clone: `…/src/pages/prototypes/<slug>/`

Use the live URL for visual context only after source is resolved.

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

**Otherwise fetch from GitHub.** Prototypes often live on **feature branches**, not `main` — resolve the ref before reading files.

1. Prefer an explicit branch, PR URL, or commit from the user (or from the published deploy if it exposes one).
2. If only a slug/URL is given, search the playground repo (e.g. `gh` PRs/branches, or check whether `src/pages/prototypes/<slug>/` exists on `main`).
3. If the slug is missing on `main` or the branch is unclear, **ask once** for the branch or PR — do not guess a random feature branch.

Tree / raw patterns (substitute `<ref>` = branch, tag, or SHA):

```text
https://github.com/mattermost/mattermost-proto-playground/tree/<ref>/src/pages/prototypes/<slug>/
https://raw.githubusercontent.com/mattermost/mattermost-proto-playground/<ref>/src/pages/prototypes/<slug>/<file>
```

Use `gh` / git sparse checkout / HTTP as available. Record the ref used for the session so later reads stay on the same prototype revision.

## What to read

1. Orchestrator and every `scenes/*` file — collect imports.
2. `components/*` — local compositions to rebuild.
3. Optional: playground `package.json` for the prototype’s compass-ui version (awareness only).
4. Skip walkthrough-only files unless they clarify intended product flow.

## Manifest cross-check (optional)

If the playground repo is local, `src/manifests/prototypes.ts` maps `path` → `id`. Folder slug usually equals `id`. There is no filesystem API beyond that convention.
