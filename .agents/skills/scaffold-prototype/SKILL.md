---
name: scaffold-prototype
description: Scaffold a multi-scene Compass prototype under src/pages/prototypes with PrototypeTopNav chrome and SceneSwitcher. Use when creating a new multi-scene prototype or splitting a large prototype into scenes/. Requires a requirement source before scene UI, then builds that UI with compass-build and checks it with compass-review.
---

# Scaffold a multi-scene prototype

## Steps

1. Work on a `prototype/<slug>` branch (for example `prototype/universal-search`) before adding files. Do this even when the current checkout looks unrelated — that branch may hold other work.
   - If the working tree has uncommitted changes, stop and ask before switching branches.
   - When splitting an existing prototype into `scenes/`, check that `src/pages/prototypes/<slug>/` exists on `main`. If it does not, stop and ask how to carry its commits onto the new branch.
   - If a branch named `prototype/<slug>` already exists, reuse it only after checking that it is based on up-to-date `main` and that its contents are the prototype you intend to change. Otherwise stop and ask how to resolve the name conflict. Do not reset or recreate the branch.
   - Otherwise create `prototype/<slug>` from up-to-date `main`.
2. Add the shell at `src/pages/prototypes/<slug>/` and register it in `src/manifests/prototypes.ts` (that entry is the route). Include:
   - `<Slug>.tsx` — thin orchestrator (scene state, chrome)
   - `<slug>Data.ts` / `<slug>Scenes.ts` — optional fixtures and scene config
   - `<Slug>.module.scss` — shared styles
   - `components/` — prototype-only shared UI
   - `scenes/` — one file per scene-switcher entry (**not** `views/`). Leave this empty until step 4.
   - `docs/README.md` — index of sources (template below)

   Do not mount `SceneSwitcher` until scenes exist. Leave the center slot empty.
3. Record sources in `docs/README.md` before writing a scene. A prototype needs at least one **requirement** source: a PRFAQ, a UX spec, Figma, or a Confluence page. Jira and an engineering brief are **background** and do not unlock scene work.
   - If the request has no requirement source, stop after the shell. Ask for one. Do not invent scenes, copy, or layout.
   - When a source is present, save the UX spec as `docs/<slug>-spec.md` and screenshots under `docs/shots/`. Link rather than paste confidential content. No absolute local paths. Conventions: [Prototype docs](../../../src/pages/prototypes/AGENTS.md#prototype-docs).
   - Derive the scene list from that source. Do not add a scene the source does not call for.
4. Build each scene by following [`compass-build`](../compass-build/SKILL.md) with context **prototype** (`references/context.md`). Read the references that match the screen, then run `references/checklist.md`. Playground chrome, overlays, and mobile motion stay in [src/pages/prototypes/AGENTS.md](../../../src/pages/prototypes/AGENTS.md). Do not restate Compass rules here.
   Import Compass pieces from `@mattermost/compass-ui` **subpaths** and `@mattermost/compass-proto` (root). Do not reimplement them under prototype `components/`.
5. When at least one scene exists, use `usePrototypeChrome()` and a `useEffect` to `setCenterSlot(<SceneSwitcher …/>)`; cleanup with `setCenterSlot(null)`; sync when `activeScene` changes. Give `SceneSwitcher` a clear `ariaLabel`. Do not `position: fixed` the control to the viewport.
6. Before reporting the prototype ready, follow [`compass-review`](../compass-review/SKILL.md) on the new or changed prototype files. Fix Blockers with `compass-build`'s retrofit steps, then review again. Report anything the review could not verify.

`compass-build` and `compass-review` live in the sibling compass-design repo and are linked from `.agents/skills/`. If a link does not resolve, read `../compass-design/skills/compass-build/SKILL.md` and `../compass-design/skills/compass-review/SKILL.md`.

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

Playground chrome and overlay wiring: [src/pages/prototypes/AGENTS.md](../../../src/pages/prototypes/AGENTS.md). Compass rules for the scene UI: `compass-build`.
