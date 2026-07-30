# Prototypes

Follow this when working under `src/pages/prototypes/`.

For scaffolding a new multi-scene prototype end-to-end, use [.cursor/skills/scaffold-prototype/SKILL.md](../../../.cursor/skills/scaffold-prototype/SKILL.md).

## Scene navigation (default)

URLs in `src/manifests/prototypes.ts` use **`PrototypeTopNav`** (back, title, center slot, theme) — not full Compass `TopNav`.

For multi-scene prototypes, put scene/entry controls in the **center slot**:

1. `usePrototypeChrome()` → `setCenterSlot(<SceneSwitcher …/>)` in a `useEffect`.
2. Cleanup: `() => setCenterSlot(null)`.
3. Re-run when `activeScene` (or equivalent) changes.
4. Prefer `SceneSwitcher`; clear `ariaLabel`; omit `label` unless needed.
5. **Do not** `position: fixed` the scene control to the viewport — it won’t align with the prototype header.

## Folder structure

Multi-scene prototypes under `src/pages/prototypes/<slug>/`:

```
<Slug>.tsx            # Orchestrator: scene state, chrome, switch
<slug>Data.ts         # Fixtures (optional)
<slug>Scenes.ts       # Scene ids + labels (optional)
<Slug>.module.scss    # Shared styles
components/           # Prototype-only shared UI (not design-system)
scenes/               # One file per scene-switcher entry
```

- Orchestrator stays thin; persistent cross-scene state lives there.
- Use **`scenes/`**, not `views/`.
- Design-system components stay in `src/components/` / Compass UI — do not reimplement under `components/`.
- Single-scene / tiny prototypes may stay flat until a second scene or the file grows past roughly one screen of JSX.
