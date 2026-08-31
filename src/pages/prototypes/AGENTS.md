# Prototypes

Follow this when working under `src/pages/prototypes/`.

For scaffolding a new multi-scene prototype end-to-end, use [.cursor/skills/scaffold-prototype/SKILL.md](../../../.cursor/skills/scaffold-prototype/SKILL.md).

## Imports

Use `@mattermost/compass-ui` **subpath** imports only — never the root barrel:

```tsx
import { Button } from '@mattermost/compass-ui/components/button';
import { useExitAnimation } from '@/hooks/useExitAnimation';
```

PascalCase folders map to kebab-case segments (`AdminConsoleSidebar` → `components/admin-console-sidebar`). Style sub-exports (`btnStyles`, `messageStyles`) come from the owning component subpath. Split multi-component imports into separate subpath lines.

`@mattermost/compass-proto` has **no subpath exports** — import named exports from the package root. Glyphs come from `@mattermost/compass-icons/components/<kebab>` and wrap in `Icon`.

Playground chrome (`PrototypeTopNav`, `SceneSwitcher`, `DeviceFrame`, `MobileModalStage`) lives in this repo, not either Compass package.

### Common `@mattermost/compass-ui` components

| Use for | Export | Import |
| --- | --- | --- |
| Dialog / modal (desktop) | `Modal` | `@mattermost/compass-ui/components/modal` |
| Menu row | `MenuItem` | `@mattermost/compass-ui/components/menu-item` |
| Search field | `SearchInput` | `@mattermost/compass-ui/components/search-input` |
| Text field | `TextInput` | `@mattermost/compass-ui/components/text-input` |
| User avatar | `UserAvatar` | `@mattermost/compass-ui/components/user-avatar` |
| Channel / DM sidebar row (type glyph built in) | `ChannelSidebarItem` | `@mattermost/compass-ui/components/channel-sidebar-item` |
| Icon wrapper | `Icon` | `@mattermost/compass-ui/components/icon` |
| Mention count | `MentionBadge` | `@mattermost/compass-ui/components/mention-badge` |
| Unread indicator | `UnreadBadge` | `@mattermost/compass-ui/components/unread-badge` |
| Presence (online / away / do-not-disturb) | `StatusBadge` | `@mattermost/compass-ui/components/status-badge` |
| Button | `Button` | `@mattermost/compass-ui/components/button` |
| Icon-only button | `IconButton` | `@mattermost/compass-ui/components/icon-button` |
| Empty view | `EmptyState` | `@mattermost/compass-ui/components/empty-state` |
| Tooltip (visual chrome only) | `Tooltip` | `@mattermost/compass-ui/components/tooltip` |
| Chat message | `Message` | `@mattermost/compass-ui/components/message` |
| Composer | `MessageInput` | `@mattermost/compass-ui/components/message-input` |
| Channel header | `ChannelHeader` | `@mattermost/compass-ui/components/channel-header` |
| Divider | `Divider` | `@mattermost/compass-ui/components/divider` |
| Scroll container | `Scrollbar` | `@mattermost/compass-ui/components/scrollbar` |
| Chip | `Chip` | `@mattermost/compass-ui/components/chip` |

There is no `Dialog` — use `Modal`. Overlay open/close, portal, and focus stay with the host.

There is no `ChannelIcon`. Standalone channel glyph:

```tsx
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockIcon from '@mattermost/compass-icons/components/lock';
import { Icon } from '@mattermost/compass-ui/components/icon';

<Icon glyph={<GlobeIcon />} size="16" />
```

Sidebar rows use `ChannelSidebarItem` with `leadingVisual` (`'public'` \| `'private'` \| `'direct-message'` \| …).

### Common `@mattermost/compass-proto` components

| Use for | Export | Import |
| --- | --- | --- |
| Desktop channel layout | `ChannelShell` | `@mattermost/compass-proto` |
| Default sidebar fixture | `buildDefaultChannelsSidebarModel` | `@mattermost/compass-proto` |
| Mobile home | `MobileHome` | `@mattermost/compass-proto` |
| Mobile tab bar | `MobileTabBar` | `@mattermost/compass-proto` |
| Mobile modal | `MobileModal` | `@mattermost/compass-proto` |
| Mobile message | `MobileMessage` | `@mattermost/compass-proto` |
| Mobile search | `MobileSearch` | `@mattermost/compass-proto` |
| Call widget / popout | `CallWidget`, `CallPopout` | `@mattermost/compass-proto` |

```tsx
import { ChannelShell, MobileModal } from '@mattermost/compass-proto';
```

### Discovering other exports

The tables above are not exhaustive. Confirm an export against the installed package before using it (no Storybook required). `index.d.ts` uses PascalCase source paths; the compass-ui **import subpath** is kebab-case.

```sh
# Does this export exist?
grep -r "export" node_modules/@mattermost/compass-ui/dist/index.d.ts | grep -i "MenuItem"

# List published component folders (kebab-case = subpath)
ls node_modules/@mattermost/compass-ui/dist/components/

# Named exports for a specific subpath
grep "export" node_modules/@mattermost/compass-ui/dist/components/menu-item/index.d.ts

# Proto (root barrel only)
grep -i "MobileModal" node_modules/@mattermost/compass-proto/dist/index.d.ts
```

### Before using a component

1. Confirm it exists (cheat sheet or grep above).
2. Read installed types for purpose and props — JSDoc on the `.d.ts` is the in-repo source of truth:
   `node_modules/@mattermost/compass-ui/dist/components/<kebab>/<Name>.d.ts`
   Proto: `node_modules/@mattermost/compass-proto/dist/index.d.ts` then the matching file under `dist/components/`.
3. If the sibling clone exists, read the guideline (do not copy it into this repo):
   - `../compass-design/src/guidelines/components/<slug>/<slug>.guideline.mdx`
   - `../compass-design/src/guidelines/patterns/<slug>/<slug>.guideline.mdx`
   - Docs: `https://mattermost.github.io/compass-design/`

Orchestration hooks in this repo live in `src/hooks/` (`useExitAnimation`, `useOutsideClose`). Prefer those over importing the same hooks from `@mattermost/compass-ui/hooks/*`.

### Choose this, not that

| Need | Use | Not |
| --- | --- | --- |
| Find / filter | `SearchInput` | `TextInput` |
| Type a value | `TextInput` | `SearchInput` |
| Selectable / removable token | `Chip` | `Tag` |
| Metadata label (BOT, Guest) | `Tag` | `Chip` |
| Mention count / unread / presence | `MentionBadge` / `UnreadBadge` / `StatusBadge` | a custom pill |
| Desktop dialog | `Modal` + host portal / focus | a restyled `div`, or `MobileModal` |
| Mobile sheet | `MobileModal` + `MobileModalStage` | desktop `Modal` |
| Desktop vs mobile message / menu / search | `Message` / `MenuItem` / `SearchInput` vs `MobileMessage` / `MobileMenuItem` / `MobileSearch` | `platform="mobile"` on the desktop component |
| Channel type glyph | `Icon` + `GlobeIcon` / `LockIcon`, or `ChannelSidebarItem` `leadingVisual` | a `ChannelIcon` |
| Full desktop channel column | `ChannelShell` (proto) + ui `ChannelHeader` / `Message*` | rebuilding the chrome |
| Sidebar chrome only | `ChannelsSidebar` | `ChannelShell` |
| Sidebar demo tree | `buildDefaultChannelsSidebarModel` | a hand-rolled tree when the fixture fits |
| Scroll region | `Scrollbar` | raw `overflow` |
| Menu surface | `PopoverMenu` + `MenuItem` | unstyled `ul` / `div` rows when a menu is what you mean |

### Overlay wiring

`Modal`, `Tooltip`, `PopoverMenu`, and `ProfilePopover` are **visual chrome only**. The host owns:

- Open / close state
- `createPortal` to `document.body` (or a dedicated overlay root)
- Position and stacking
- Focus, Escape, and outside click (`useOutsideClose`)
- Exit animation (`useExitAnimation`) so the surface unmounts after the close motion

Render `Modal` only while it should be on screen (plus the exit-animation hold). Do not wrap it in extra dialog chrome. `role="dialog"` on the surface is fine; do not add focus-trap or backdrop logic inside the Compass primitive.

**Exceptions:** `Combobox`, `Select`, and `DateRangePicker` own their menus. Mobile sheets use `MobileModal` + playground `MobileModalStage` (see **Mobile Channel → Modal** below).

### Prototype-only UI

1. Name matches a Compass export → use it. Do not restyle a cousin.
2. Flow-specific composition (a Find Channels dialog, a call PIP) → `src/pages/prototypes/<slug>/components/`, built from primitives, tokens, and BEM.
3. Reusable design-system control → implement in **compass-design**, not under playground `src/components/` or a prototype folder.

Invented UI must:

- Use Compass CSS variables (`--spacing-*`, `--font-size-*`, `--radius-*`, `--elevation-*`, `--center-channel-color`, `--duration-*`, `--ease-*`)
- Use one BEM block per CSS module (see the styling rule)
- Wrap glyphs in `Icon` + `@mattermost/compass-icons/components/<kebab>`
- Use lowercase kebab-case if you expose variant props
- Meet text ≥ **0.72** / icon ≥ **0.56** opacity floors
- Not invent Button, input, badge, or modal chrome that Compass already ships

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

Pass `animate={false}` to skip motion (for example a static screenshot scene). Do not reimplement this motion inside prototype folders.

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
- Compass UI / proto pieces come from those packages — do not reimplement them under prototype `components/`. Playground `src/components/` is catalog chrome only.
- Single-scene / tiny prototypes may stay flat until a second scene or the file grows past roughly one screen of JSX.
