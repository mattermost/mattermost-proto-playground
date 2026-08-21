# Agent guidance (shared)

Shared instructions for Cursor, Claude Code, and other agents. `CLAUDE.md` imports this file via `@AGENTS.md`.

## Design system layers

Vocabulary used everywhere: **Foundations** (tokens, type, color, motion) → **Components** (reusable UI) → **Patterns** (composed blocks like Channel Sidebar) → **Layouts** (full screens). Docs URLs and topic categories follow this model.

Package split (in-repo):

- **`@mattermost/compass-ui`** — published core (tokens, primitives, desktop chrome pieces)
- **`@mattermost/compass-proto`** — unpublished Mobile*, `ChannelShell`, Call*, demo RHS panels, sidebar fixture helpers (prototyping / docs only)

## Building new components

Before writing new UI, audit `src/components/` (and Compass UI). Reuse an existing component when it already covers the need — especially when the name matches Figma. Only build a new sub-component when nothing suitable exists.

## Shared React hooks

Check `src/hooks/` before duplicating logic. Key hooks: `useExitAnimation` (exit animations), `useOutsideClose` (click-outside behavior).

`ProfilePopover` is content only — do not fork it for positioning; compose a page-local wrapper or a shared layout hook (e.g. `useAnchoredToRect`).

## Component usage (short)

- **Primary button:** `emphasis="Primary"` at most once per view. Prefer Secondary / Tertiary / Quaternary otherwise.
- **EmptyState actions:** omit `size` on the action `Button` unless Figma requires otherwise (default Medium).
- **Admin True/False radios:** lay out horizontally in a flex row (e.g. `admin-console-layout__radio-row`); override Radio `width: 100%` so both stay on one row; match label `padding-top: var(--spacing-xxs)`.
- **Avatars:** pass a real image from `src/assets/avatars/` when the component supports `src` / equivalent. Initials-only only when documenting fallback or unnamed users.

## Styling

Prefer design tokens from `src/styles/tokens.scss` over hardcoded px/hex/ms. Full BEM, tokens, motion, opacity, and Scrollbars rules load when editing styles — see the styling rule pair below.

## Area-specific guidance

- [src/guidelines/AGENTS.md](src/guidelines/AGENTS.md) — Docs guidelines, specimens, MDX
- [src/pages/prototypes/AGENTS.md](src/pages/prototypes/AGENTS.md) — Prototypes
- [packages/compass-ui/AGENTS.md](packages/compass-ui/AGENTS.md) — Compass UI Storybook
- [.claude/rules/styling.md](.claude/rules/styling.md) / [.cursor/rules/styling.mdc](.cursor/rules/styling.mdc) — Styling (keep both files in sync)
- [.cursor/skills/add-docs-topic/SKILL.md](.cursor/skills/add-docs-topic/SKILL.md) — Adding a docs topic (procedure)
- [.cursor/skills/scaffold-prototype/SKILL.md](.cursor/skills/scaffold-prototype/SKILL.md) — Scaffolding a multi-scene prototype (procedure)
- [.cursor/rules/creating-agent-rules.mdc](.cursor/rules/creating-agent-rules.mdc) — Adding or changing agent guidance
