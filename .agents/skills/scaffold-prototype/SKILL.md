---
name: scaffold-prototype
description: Scaffold a multi-scene Compass prototype under src/pages/prototypes with PrototypeTopNav chrome and SceneSwitcher. Use when creating a new multi-scene prototype or splitting a large prototype into scenes/.
---

# Scaffold a multi-scene prototype

## Steps

1. Work on a `prototype/<slug>` branch (for example `prototype/universal-search`) before adding files. Do this even when the current checkout looks unrelated — that branch may hold other work.
   - If the working tree has uncommitted changes, stop and ask before switching branches.
   - When splitting an existing prototype into `scenes/`, check that `src/pages/prototypes/<slug>/` exists on `main`. If it does not, stop and ask how to carry its commits onto the new branch.
   - If a branch named `prototype/<slug>` already exists, reuse it only after checking that it is based on up-to-date `main` and that its contents are the prototype you intend to change. Otherwise stop and ask how to resolve the name conflict. Do not reset or recreate the branch.
   - Otherwise create `prototype/<slug>` from up-to-date `main`.
2. Add a folder `src/pages/prototypes/<slug>/` with:
   - `<Slug>.tsx` — thin orchestrator (scene state, chrome, switch)
   - `<slug>Data.ts` / `<slug>Scenes.ts` — optional fixtures and scene config
   - `<Slug>.module.scss` — shared styles
   - `components/` — prototype-only shared UI
   - `scenes/` — one file per scene-switcher entry (**not** `views/`)
   - `docs/` — input references, with a `README.md` (template below)
3. Register the prototype in `src/manifests/prototypes.ts` and wire the route.
4. In the orchestrator, use `usePrototypeChrome()` and a `useEffect` to `setCenterSlot(<SceneSwitcher …/>)`; cleanup with `setCenterSlot(null)`; sync when `activeScene` changes.
5. Prefer `SceneSwitcher` with a clear `ariaLabel`. Do not `position: fixed` the control to the viewport.
6. Import Compass pieces from `@mattermost/compass-ui` **subpaths** and `@mattermost/compass-proto` (root). Do not reimplement them under prototype `components/`. Before using a component: cheat sheet → installed `.d.ts` → sibling guideline. Desktop vs mobile and overlay wiring: [src/pages/prototypes/AGENTS.md](../../../src/pages/prototypes/AGENTS.md).

7. Ask the user for the requirements, PRFAQ, Figma, and Confluence links (and Jira / PR links if any). Record each in `docs/README.md`, labelled **requirement** or **background**. Save UX spec source as `docs/<slug>-spec.md` and screenshots under `docs/shots/`. Link rather than paste confidential content; no absolute local paths. Conventions: [Prototype docs](../../../src/pages/prototypes/AGENTS.md#prototype-docs).

### `docs/README.md` template

```md
# <Prototype name> — docs

| Item              | Link                             | Type        |
| ----------------- | -------------------------------- | ----------- |
| PRFAQ             | <url>                            | requirement |
| UX spec           | <url> (source: `<slug>-spec.md`) | requirement |
| Figma             | <url>                            | requirement |
| Jira              | <url>                            | background  |
| Engineering brief | <url>                            | background  |
```

## Invariants

See [src/pages/prototypes/AGENTS.md](../../../src/pages/prototypes/AGENTS.md).
