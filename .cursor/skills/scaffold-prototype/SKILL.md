---
name: scaffold-prototype
description: Scaffold a multi-scene Compass prototype under src/pages/prototypes with PrototypeTopNav chrome and SceneSwitcher. Use when creating a new multi-scene prototype or splitting a large prototype into scenes/.
---

# Scaffold a multi-scene prototype

## Steps

1. Add a folder `src/pages/prototypes/<slug>/` with:
   - `<Slug>.tsx` — thin orchestrator (scene state, chrome, switch)
   - `<slug>Data.ts` / `<slug>Scenes.ts` — optional fixtures and scene config
   - `<Slug>.module.scss` — shared styles
   - `components/` — prototype-only shared UI
   - `scenes/` — one file per scene-switcher entry (**not** `views/`)
2. Register the prototype in `src/manifests/prototypes.ts` and wire the route.
3. In the orchestrator, use `usePrototypeChrome()` and a `useEffect` to `setCenterSlot(<SceneSwitcher …/>)`; cleanup with `setCenterSlot(null)`; sync when `activeScene` changes.
4. Prefer `SceneSwitcher` with a clear `ariaLabel`. Do not `position: fixed` the control to the viewport.
5. Import design-system pieces from `src/components/` / Compass UI — do not reimplement them under `components/`.

## Invariants

See [src/pages/prototypes/AGENTS.md](../../../src/pages/prototypes/AGENTS.md).
