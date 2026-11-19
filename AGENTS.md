# Agent guidance (shared)

Shared instructions for Cursor, Claude Code, and other agents. `CLAUDE.md` imports this file via `@AGENTS.md`.

## Repositories

| Repo                                                                        | Role                                                                         |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`mattermost/compass-design`](https://github.com/mattermost/compass-design) | `@mattermost/compass-ui`, `@mattermost/compass-proto`, guidelines, Storybook |
| **`mattermost/mattermost-proto-playground` (this repo)**                    | Multi-scene prototype flows + playground chrome only                         |

## Design system layers

Vocabulary used everywhere: **Foundations** → **Components** → **Patterns** → **Layouts**. Guidelines and specimens live in **compass-design**, not here.

Package split (in **compass-design**):

- **`@mattermost/compass-ui`** — published core from npm (`@alpha`; tokens, primitives, leaf chrome)
- **`@mattermost/compass-proto`** — unpublished Mobile*, `ChannelShell`, Call*, composed shells (`TeamSidebar`, `ChannelsSidebar`, `GlobalHeader`, `AdminConsoleSidebar`), menu recipes, demo fixtures (**never npm**; docs + playground link via `file:`)

**Layouts** (docs category) are composed specimens in compass-design — they import **both** packages. Product webapp uses **ui only**. Details: [docs/COMPASS-REPO-SPLIT.md](docs/COMPASS-REPO-SPLIT.md#layouts-and-shells-who-uses-what).

**Playground-only (this repo):** `PrototypeTopNav`, `SceneSwitcher`, `DeviceFrame`, `MobileModalStage`, per-prototype scene code.

## Building new UI

Look up the component first (cheat sheet → installed `.d.ts` → sibling guideline in `../compass-design`). Use `@mattermost/compass-ui` / `@mattermost/compass-proto`. Do not add design-system components under `src/components/` — extend compass-design instead.

Playground `src/components/` is for catalog chrome and layout only.

Lookup protocol, choose-this-not-that, overlays, and when to invent UI: [src/pages/prototypes/AGENTS.md](src/pages/prototypes/AGENTS.md#imports).

### Import convention

Always import from **subpaths** — never the root barrel `@mattermost/compass-ui`. `@mattermost/compass-proto` has no subpaths — import from the package root.

### Variant prop string values

Compass UI variant props (`size`, `emphasis`, `appearance`, `type`, `padding`, etc.) use **lowercase kebab-case** literals — e.g. `'primary'`, `'x-small'`, `'new-messages'`, `'center-channel'`. Do not pass Title Case values.

## Shared React hooks

Check `src/hooks/` before duplicating logic. Key hooks: `useExitAnimation`, `useOutsideClose`.

## Overlays

`Tooltip`, `PopoverMenu`, and `ProfilePopover` are **visual chrome only** — the host owns open/close, portals, positioning, and focus. `Modal` additionally owns dialog focus (initial focus, Tab trap, Escape, focus restore); the host still owns portal, backdrop, scroll lock, stacking, and open state. Wiring recipe: [src/pages/prototypes/AGENTS.md](src/pages/prototypes/AGENTS.md#overlay-wiring).

**Exceptions:** form widgets with menus (`Combobox`, `Select`, …) and proto/mobile presenters (`MobileBottomSheet`, playground `MobileModalStage`) follow their component-specific patterns.

## Component usage (short)

- **Primary button:** `emphasis="primary"` at most once per view.
- **EmptyState actions:** omit `size` on action `Button` unless Figma requires otherwise.
- **Avatars:** pass a real image from `src/assets/avatars/` when supported.

## Styling

Prefer Compass CSS variables from `@mattermost/compass-ui/styles` (`--spacing-*`, `--center-channel-color`, …). Full BEM, tokens, motion, opacity rules load when editing styles — see [.cursor/rules/styling.mdc](.cursor/rules/styling.mdc).

## Committed files

Never put absolute local paths (a home directory, `~/.claude/...`, session memory files) in committed files. Link to repo-relative paths or public URLs; if the target isn't in the repo, use inline prose instead.

## Responding to review bots (CodeRabbit, Bugbot)

Before fixing any finding, verify it against the code: read the callee, check whether the behavior is already handled, and confirm the PR's diff introduces or worsens it.

- Fix a Critical or Major finding once you have confirmed it is real. If it is wrong, or the diff neither introduces nor worsens it, reply with the reason instead. Don't dismiss a finding only because the underlying failure predates the PR: if the diff makes it worse, it counts.
- Fix a Minor finding only if it is a defect someone would hit: wrong behavior, a security or privacy gap, data loss, a crash or hang, a realistic race, a flaky or falsely passing test, a docs command that fails, a wrong fact, or a control unusable by keyboard or screen reader.
- For any other Minor finding (wording, typos, qualifying accurate text, extra assertions, defensive checks for inputs that won't occur, refactors), do not change code. Reply once: "Skipping: nit, no user impact."
- Batch all review fixes into one commit per review round.
- Never argue with the bot to create a learning; leave design disagreements for a human.

CodeRabbit commands, posted as a PR comment:

| Situation                                             | Command                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| A notice says "Reviews paused"                        | `@coderabbitai resume`                                                        |
| New commits, not paused, no review after 20 minutes   | `@coderabbitai review`                                                        |
| Findings fixed, but CodeRabbit still requests changes | `@coderabbitai resolve`                                                       |
| A rate-limit notice                                   | `@coderabbitai rate limit`, then `@coderabbitai review` once capacity returns |

Use `@coderabbitai review` only for new commits it has not reviewed.

## Area-specific guidance

- [src/pages/prototypes/AGENTS.md](src/pages/prototypes/AGENTS.md) — Prototypes
- [src/pages/prototypes/AGENTS.md#prototype-docs](src/pages/prototypes/AGENTS.md#prototype-docs) — Per-prototype `docs/` (requirements, PRFAQ, specs); read first
- [docs/COMPASS-REPO-SPLIT.md](docs/COMPASS-REPO-SPLIT.md) — Split plan
- [.agents/skills/scaffold-prototype/SKILL.md](.agents/skills/scaffold-prototype/SKILL.md) — Scaffolding a multi-scene prototype
- [compass-build](https://github.com/mattermost/compass-design/blob/main/skills/compass-toolkit/skills/compass-build/SKILL.md) — Compass rules for prototype scene UI
- [compass-review](https://github.com/mattermost/compass-design/blob/main/skills/compass-toolkit/skills/compass-review/SKILL.md) — Read-only Compass audit of that UI
- `compass-build` and `compass-review` come from the `mattermost-compass-toolkit` plugin ([install steps](https://github.com/mattermost/compass-design/blob/main/skills/compass-toolkit/README.md)). This repo also symlinks them into `.agents/skills/` from the sibling `../compass-design` checkout (see [.cursor/cursor.md](.cursor/cursor.md)), so cloud agents and fresh clones work with no setup. If you install the plugin, the symlinks are redundant but harmless.
- [.agents/skills/guided-walkthrough/SKILL.md](.agents/skills/guided-walkthrough/SKILL.md) — Guided walkthrough mode for a prototype
- [.cursor/rules/creating-agent-rules.mdc](.cursor/rules/creating-agent-rules.mdc) — Adding or changing agent guidance
- [.cursor/cursor.md](.cursor/cursor.md) — Cursor Cloud Agents: sibling compass-design setup, running the playground, screenshots, verification (environment in [.cursor/README.md](.cursor/README.md)). Cloud Agents read it before running the playground, taking screenshots, or verifying changes, including prototype-only work.

For guidelines, Storybook, and package work, use the **compass-design** repo.
