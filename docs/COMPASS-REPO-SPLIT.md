# Compass repo split

How we are splitting Compass UI work across two repositories. Replaces the earlier three-repo extraction plan.

## Repositories

| Layer | Repository | Role |
| ----- | ---------- | ---- |
| Design system repo | [`mattermost/compass-design`](https://github.com/mattermost/compass-design) | `@mattermost/compass-ui` (published), `@mattermost/compass-proto` (unpublished), docs + Storybook, GitHub Pages |
| Prototypes catalog | **`mattermost/mattermost-proto-playground` (this repo)** | Multi-scene prototype flows, device chrome (`PrototypeTopNav`, `DeviceFrame`), registry |

Icons stay in [`mattermost/compass-icons`](https://github.com/mattermost/compass-icons) for now (peer dependency; may move into `compass-design` later).

## Packages (in compass-design)

| Package | Published | Contents |
| ------- | --------- | -------- |
| `@mattermost/compass-ui` | Yes (`alpha` until stable) | Foundations, primitives, props-driven web chrome (sidebars, headers, Message stack, …) |
| `@mattermost/compass-proto` | No (`file:` / `npm pack` only) | Mobile*, `ChannelShell`, Call* composites, demo RHS panels, sidebar fixture builders |

**Chrome vs fixtures:** Core keeps presentational shells (`ChannelsSidebar`, `AdminConsoleSidebar`, `RightSidebar` header). Demo trees and specimen RHS screens live in proto or docs fixtures — not in the published core API.

## Layouts and shells (who uses what)

**Layouts** in the docs (Foundations → Components → Patterns → **Layouts**) are **composed screens**, not a single npm export. They live as MDX specimens in [`compass-design`](https://github.com/mattermost/compass-design) (`src/guidelines/layouts/`), not in `@mattermost/compass-ui`.

| Building block | Package | Examples |
| -------------- | ------- | -------- |
| Published chrome / primitives | `@mattermost/compass-ui` | `ChannelsSidebar`, `AdminConsoleSidebar`, `GlobalHeader`, `ChannelHeader`, `Message*`, `RightSidebar` header |
| Composite shells, mobile, demo fixtures | `@mattermost/compass-proto` (never on npm) | `ChannelShell`, `MobileHome`, `MobileTabBar`, `CallWidget`, `RightSidebarChannelInfo`, `buildDefaultChannelsSidebarModel` |
| Docs specimen framing only | `compass-design` app | `DeviceFrame`, `MobileModalStage` (guidelines; playground has its own copies for flows) |

Layout specimens **stitch ui + proto together** — e.g. desktop Channel uses `ChannelShell` (proto) with headers and messages (ui); mobile Home uses `MobileHome` (proto) inside `DeviceFrame` (docs chrome).

| Consumer | `compass-ui` | `compass-proto` |
| -------- | ------------ | --------------- |
| **compass-design** (guidelines, Storybook) | yes (workspace) | yes (workspace) |
| **Proto playground** (this repo) | yes (`@mattermost/compass-ui@alpha` from npm) | yes (`file:`) — required for most multi-scene flows |
| **Mattermost webapp** (product) | yes (npm `@alpha`, Phase 3) | **no** — leaf-first adoption of published chrome only |

`@mattermost/compass-proto` is intentionally **not published to npm**. Playground and docs consumers link it from a sibling `compass-design` clone (`file:` or workspace); that is enough for prototyping. Product code must not depend on proto layouts or shells.

**Compass vs product:** Compass owns look (props/slots). Webapp owns behavior (permissions, markdown, optimistic UI). Adopt leaf-first; do not grow Compass into a second Post/sidebar controller.

**Playground-only (this repo):** `PrototypeTopNav`, `SceneSwitcher`, `DeviceFrame`, `MobileModalStage`, per-prototype scene code.

## Phases

| Phase | Status | Summary |
| ----- | ------ | ------- |
| **0 — Boundary + webapp spike** | Done | `compass-proto` package; core barrel pruned; chrome vs fixtures; pack/smoke tests; local webapp `file:` + watch validation |
| **1 — Create `compass-design`** | Done | Move packages + docs app; CI publishes core only; GitHub Pages on design repo |
| **2 — Slim playground** | Done | Flows + chrome only; depend on compass-design packages via `file:`; README for catalog role |
| **3 — Alpha release** | Done (playground) | Playground uses `@mattermost/compass-ui@alpha` from npm; proto stays `file:`. Webapp mergeable PR still pending. |
| **7 — Subpath imports** | Done | Playground on `@mattermost/compass-ui@0.1.0-alpha.5+` with `@mattermost/compass-ui/components/<kebab>` imports (not root barrel). |

Stop after each phase; verify before starting the next.

## Consumption

- **Docs / Storybook:** guidelines in compass-design use workspace `compass-ui` + `compass-proto`; **Storybook** catalogs published `@mattermost/compass-ui` only
- **Playground (this repo):** `@mattermost/compass-ui@alpha` from npm (`0.1.0-alpha.5+`, subpath imports) + `file:../compass-design/packages/compass-proto`
- **Webapp (testing branch):** `file:` → compass-ui + watch; webpack React aliases — see compass-design INTEGRATION.md
- **Webapp (after alpha):** `@mattermost/compass-ui@alpha` only — no Mobile*, `ChannelShell`, or Call* from proto in product code

## Related docs

- [compass-design INTEGRATION.md](https://github.com/mattermost/compass-design/blob/main/packages/compass-ui/INTEGRATION.md) — consumer setup (Vite, webapp, styles, peers)
- [AGENTS.md](../AGENTS.md) — agent guidance for this repo
- [src/pages/prototypes/AGENTS.md](../src/pages/prototypes/AGENTS.md) — prototype flows
