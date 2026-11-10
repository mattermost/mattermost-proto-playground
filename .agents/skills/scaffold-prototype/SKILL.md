---
name: scaffold-prototype
description: Scaffold a multi-scene Compass prototype under src/pages/prototypes with PrototypeTopNav chrome. Mount SceneSwitcher only for scenes the product UI does not already switch. Use when creating a new multi-scene prototype or splitting a large prototype into scenes/. A user prompt is enough of a requirement source to build scene UI with compass-build; check it with compass-review.
---

# Scaffold a multi-scene prototype

## Steps

1. Work on a `prototype/<slug>` branch (for example `prototype/universal-search`) before adding files. Do this even when the current checkout looks unrelated — that branch may hold other work.
   - If the working tree has uncommitted changes, stop and ask before switching branches.
   - If a branch named `prototype/<slug>` already exists, reuse it when it contains `src/pages/prototypes/<slug>/` and that is the prototype you intend to change. Otherwise, stop and ask how to resolve the name conflict. Do not reset or recreate the branch.
   - When `prototype/<slug>` does not exist yet, update `main` first, then create the branch from that `main`. When splitting an existing prototype into `scenes/`, confirm `src/pages/prototypes/<slug>/` exists on that `main` and compare it with the prototype on the branch you are leaving. If `main` lacks the directory, or the current branch has prototype commits `main` does not, stop and ask how to carry that work forward. Do not branch from `main` and split the older copy.
2. Add the shell at `src/pages/prototypes/<slug>/` and register it in `src/manifests/prototypes.ts` (that entry is the route). Include:
   - `<Slug>.tsx` — thin orchestrator (scene state, chrome)
   - `<slug>Data.ts` / `<slug>Scenes.ts` — optional fixtures and scene config
   - `<Slug>.module.scss` — shared styles
   - `components/` — prototype-only shared UI
   - `scenes/` — one file per scene-switcher entry (**not** `views/`). Leave this empty until step 4.
   - `docs/README.md` — index of sources (template below)

   Do not mount `SceneSwitcher` until scenes exist. Leave the center slot empty.

3. Record the requirement source in `docs/README.md` before writing a scene. The user's prompt is enough. A PRFAQ, UX spec, Figma file, or Confluence page also counts when one is provided. When splitting an existing prototype, read its `docs/` first and use a requirement source already listed there. Ask for a source only when the prompt and those docs do not provide one. Jira and an engineering brief are **background**.
   - If `docs/<slug>-prompt.md` already exists, save the new prompt under a distinct name and keep both entries as **requirements** in `docs/README.md`. Otherwise, save the prompt as `docs/<slug>-prompt.md` and list it as a **requirement**. Save a UX spec as `docs/<slug>-spec.md` and screenshots under `docs/shots/`. Link rather than paste confidential content. No absolute local paths. Conventions: [Prototype docs](../../../src/pages/prototypes/AGENTS.md#prototype-docs).
   - Derive the scene list from that source. A prompt that only names the prototype does not describe scenes. If `docs/` also has no usable requirement source, leave `scenes/` empty. Do not add a scene, copy, or layout the source does not call for.
4. Build each scene by following [compass-build](https://github.com/mattermost/compass-design/blob/main/skills/compass-build/SKILL.md) (local path `.agents/skills/compass-build/SKILL.md`) with context **prototype** (`references/context.md`). Read the references that match the screen, then run `references/checklist.md`. Playground chrome, overlays, and mobile motion stay in [src/pages/prototypes/AGENTS.md](../../../src/pages/prototypes/AGENTS.md). Do not restate Compass rules here.
   Compass components are the standard. A prototype may still use a `className` or `:global` override to move faster than Compass, as in the prototype-only UI notes. That is looser than `compass-build`'s ban on deep overrides, and it wins for prototype scene UI. When the override fills a gap that belongs in Compass, open a follow-up issue in the compass-design repo.
   Import Compass pieces from `@mattermost/compass-ui` **subpaths** and `@mattermost/compass-proto` (root). Do not reimplement them under prototype `components/`.
5. Mount `SceneSwitcher` only for scenes the product UI does not already switch. Tabs, a segmented control, or another control inside the prototype is that switch. If it reaches every scene, leave the center slot empty and do not mount both. If some scenes are unreachable from it (for example guest or entry-point states), mount `SceneSwitcher` alongside it, listing only those scenes.
   When `SceneSwitcher` is needed and at least one scene exists, use `usePrototypeChrome()` and a `useEffect` to `setCenterSlot(<SceneSwitcher …/>)`; cleanup with `setCenterSlot(null)`; sync when `activeScene` changes. Give `SceneSwitcher` a clear `ariaLabel`. Do not `position: fixed` the control to the viewport. `SceneSwitcher` is for jumping between prototype states the product does not already switch.
6. Before reporting the prototype ready, follow [compass-review](https://github.com/mattermost/compass-design/blob/main/skills/compass-review/SKILL.md) (local path `.agents/skills/compass-review/SKILL.md`) on the new or changed prototype files. Fix Blockers with `compass-build`'s retrofit steps, then review again. A prototype `className` or `:global` override is not a Blocker. Report anything the review could not verify, including a compass-design issue opened for an upstream gap.

`compass-build` and `compass-review` live in the sibling compass-design repo and are linked from `.agents/skills/`. If a link does not resolve, read `../compass-design/skills/compass-build/SKILL.md` and `../compass-design/skills/compass-review/SKILL.md`.

### `docs/README.md` template

```md
# <Prototype name> — docs

| Item              | Link                             | Type        |
| ----------------- | -------------------------------- | ----------- |
| Prompt            | `<slug>-prompt.md`               | requirement |
| PRFAQ             | <url>                            | requirement |
| UX spec           | <url> (source: `<slug>-spec.md`) | requirement |
| Figma             | <url>                            | requirement |
| Jira              | <url>                            | background  |
| Engineering brief | <url>                            | background  |
```

## Invariants

Playground chrome and overlay wiring: [src/pages/prototypes/AGENTS.md](../../../src/pages/prototypes/AGENTS.md). That handbook's center-slot default still applies when the product has no mode control. When the product UI already switches every scene, this skill wins: leave the center slot empty. Compass rules for the scene UI: `compass-build`.
