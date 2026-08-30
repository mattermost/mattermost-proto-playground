# Prototypes

Follow this when working under `src/pages/prototypes/`.

For scaffolding a new multi-scene prototype end-to-end, use [.cursor/skills/scaffold-prototype/SKILL.md](../../../.cursor/skills/scaffold-prototype/SKILL.md).

## Imports

Use `@mattermost/compass-ui` **subpath** imports only — never the root barrel:

```tsx
import { Button } from '@mattermost/compass-ui/components/button';
import { useExitAnimation } from '@mattermost/compass-ui/hooks/use-exit-animation';
```

PascalCase folders map to kebab-case segments (`AdminConsoleSidebar` → `components/admin-console-sidebar`). Style sub-exports (`btnStyles`, `messageStyles`) come from the owning component subpath. Split multi-component imports into separate subpath lines.

## Scene navigation (default)

URLs in `src/manifests/prototypes.ts` use **`PrototypeTopNav`** (back, title, center slot, theme) — not full Compass `TopNav`.

For multi-scene prototypes, put scene/entry controls in the **center slot**:

1. `usePrototypeChrome()` → `setCenterSlot(<SceneSwitcher …/>)` in a `useEffect`.
2. Cleanup: `() => setCenterSlot(null)`.
3. Re-run when `activeScene` (or equivalent) changes.
4. Prefer `SceneSwitcher`; clear `ariaLabel`; omit `label` unless needed.
5. **Do not** `position: fixed` the scene control to the viewport — it won’t align with the prototype header.

## Mobile Home → Channel navigation

When a mobile prototype navigates from homescreen to channel (and back):

1. Keep both scenes mounted in a stacked `DeviceFrame` shell (`overflow: hidden`).
2. Use a **push** transition: channel slides in from the right (`translateX(100%)` → `0`); home may shift left (`translateX(-30%)`) while covered.
3. Timing: `var(--duration-moderate)` (300ms) with `var(--ease-transition)` (ease-in-out).
4. Pop reverses the same transform; gate pointer events / `aria-hidden` on the offscreen layer.

Tab bar destinations (Search, Mentions, Saved, Profile) use reusable Compass
layouts (`MobileSearch`, `MobileMentions`, `MobileSavedMessages`,
`MobileProfile`, plus `MobileHome` for the home tab). Swap the body above a
shared `MobileTabBar`; do not push them as channel layers. SceneSwitcher may
list those tabs as entry points that set the active tab.

## Mobile Channel → Modal

Prefer shared presenter `MobileModalStage` (`src/components/layout/MobileModalStage/`):

```tsx
<MobileModalStage
  open={open}
  modal={<MobileModal title="…" onCloseClick={close}>…</MobileModal>}
>
  {/* previous view */}
</MobileModalStage>
```

It owns:

1. Black letterbox behind a scaled previous-view peek (`translateY(status-bar-height)` + `scale(0.92)` + `opacity: 0.9`).
2. `MobileModal` slide-up (`translateY(100%)` → `0`).
3. Timing via `var(--duration-moderate)` / `var(--ease-transition)` and `useExitAnimation` so close reverses before unmount.

Pass `animate={false}` for static docs specimens. Do not reimplement this motion inside prototype folders.

When a prototype can open the modal from more than one scene, lift `MobileModalStage` to the orchestrator, wrap the stacked scenes as `children`, and remember a `modalPeek` (`'home' | 'channel'`, etc.) so the behind layer matches the opener and close returns there.

## Folder structure

Multi-scene prototypes under `src/pages/prototypes/<slug>/`:

```text
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
