# Agent guidance (shared)

Shared instructions for Cursor, Claude Code, and other agents. `CLAUDE.md` imports this file via `@AGENTS.md`.

## Repositories

| Repo | Role |
| ---- | ---- |
| [`mattermost/compass-design`](https://github.com/mattermost/compass-design) | `@mattermost/compass-ui`, `@mattermost/compass-proto`, guidelines, Storybook |
| **`mattermost/mattermost-proto-playground` (this repo)** | Multi-scene prototype flows + playground chrome only |

## Design system layers

Vocabulary used everywhere: **Foundations** → **Components** → **Patterns** → **Layouts**. Guidelines and specimens live in **compass-design**, not here.

Package split (in **compass-design**):

- **`@mattermost/compass-ui`** — published core from npm (`@alpha`; tokens, primitives, desktop chrome pieces)
- **`@mattermost/compass-proto`** — unpublished Mobile*, `ChannelShell`, Call*, demo fixtures (**never npm**; docs + playground link via `file:`)

**Layouts** (docs category) are composed specimens in compass-design — they import **both** packages. Product webapp uses **ui only**. Details: [docs/COMPASS-REPO-SPLIT.md](docs/COMPASS-REPO-SPLIT.md#layouts-and-shells-who-uses-what).

**Playground-only (this repo):** `PrototypeTopNav`, `SceneSwitcher`, `DeviceFrame`, `MobileModalStage`, per-prototype scene code.

## Building new UI

Before writing new UI in a prototype, use components from `@mattermost/compass-ui` / `@mattermost/compass-proto`. Do not add design-system components under `src/components/` — extend compass-design instead.

Playground `src/components/` is for catalog chrome and layout only.

### Import convention

Always import from **subpaths** — never the root barrel `@mattermost/compass-ui`:

```tsx
import { Button } from '@mattermost/compass-ui/components/button';
import { useExitAnimation } from '@mattermost/compass-ui/hooks/use-exit-animation';
```

PascalCase folders map to kebab-case segments (`AdminConsoleSidebar` → `components/admin-console-sidebar`). Style sub-exports (`btnStyles`, `messageStyles`) come from the owning component subpath. Split multi-component imports into separate subpath lines.

### Variant prop string values

Compass UI variant props (`size`, `emphasis`, `appearance`, `type`, `padding`, etc.) use **lowercase kebab-case** literals — e.g. `'primary'`, `'x-small'`, `'new-messages'`, `'center-channel'`. Do not pass Title Case values.

## Shared React hooks

Check `src/hooks/` before duplicating logic. Key hooks: `useExitAnimation`, `useOutsideClose`.

## Overlays

Tooltips, modals, and popovers from Compass are **visual chrome only** — the host owns open/close, portals, positioning, and focus. See compass-design overlay guidance for primitives.

**Exceptions:** form widgets with menus (`Combobox`, `Select`, …) and proto/mobile presenters (`MobileBottomSheet`, playground `MobileModalStage`) follow their component-specific patterns.

## Component usage (short)

- **Primary button:** `emphasis="primary"` at most once per view.
- **EmptyState actions:** omit `size` on action `Button` unless Figma requires otherwise.
- **Avatars:** pass a real image from `src/assets/avatars/` when supported.

## Styling

Prefer design tokens from `src/styles/tokens.scss`. Full BEM, tokens, motion, opacity rules load when editing styles — see [.cursor/rules/styling.mdc](.cursor/rules/styling.mdc).

## Area-specific guidance

- [src/pages/prototypes/AGENTS.md](src/pages/prototypes/AGENTS.md) — Prototypes
- [docs/COMPASS-REPO-SPLIT.md](docs/COMPASS-REPO-SPLIT.md) — Split plan
- [.cursor/skills/scaffold-prototype/SKILL.md](.cursor/skills/scaffold-prototype/SKILL.md) — Scaffolding a multi-scene prototype
- [.cursor/rules/creating-agent-rules.mdc](.cursor/rules/creating-agent-rules.mdc) — Adding or changing agent guidance

For guidelines, Storybook, and package work, use the **compass-design** repo.
