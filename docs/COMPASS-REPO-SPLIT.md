# Compass repo split

How we are splitting Compass UI work across two repositories. Replaces the earlier three-repo extraction plan.

## Repositories

| Layer | Repository | Role |
| ----- | ---------- | ---- |
| Design-system monorepo | [`mattermost/compass-design`](https://github.com/mattermost/compass-design) | `@mattermost/compass-ui` (published), `@mattermost/compass-proto` (unpublished), docs + Storybook, GitHub Pages |
| Prototypes catalog | **`mattermost/mattermost-proto-playground` (this repo)** | Multi-scene prototype flows, device chrome (`PrototypeTopNav`, `DeviceFrame`), registry |

Icons stay in [`mattermost/compass-icons`](https://github.com/mattermost/compass-icons) for now (peer dependency; may move into `compass-design` later).

## Packages (in compass-design)

| Package | Published | Contents |
| ------- | --------- | -------- |
| `@mattermost/compass-ui` | Yes (`alpha` until stable) | Foundations, primitives, props-driven web chrome (sidebars, headers, Message stack, …) |
| `@mattermost/compass-proto` | No (`file:` / `npm pack` only) | Mobile*, `ChannelShell`, Call* composites, demo RHS panels, sidebar fixture builders |

**Chrome vs fixtures:** Core keeps presentational shells (`ChannelsSidebar`, `AdminConsoleSidebar`, `RightSidebar` header). Demo trees and specimen RHS screens live in proto or docs fixtures — not in the published core API.

**Compass vs product:** Compass owns look (props/slots). Webapp owns behavior (permissions, markdown, optimistic UI). Adopt leaf-first; do not grow Compass into a second Post/sidebar controller.

**Playground-only (this repo):** `PrototypeTopNav`, `SceneSwitcher`, `DeviceFrame`, `MobileModalStage`, per-prototype scene code.

## Phases

| Phase | Status | Summary |
| ----- | ------ | ------- |
| **0 — Boundary + webapp spike** | Done | `compass-proto` package; core barrel pruned; chrome vs fixtures; pack/smoke tests; local webapp `file:` + watch validation |
| **1 — Create `compass-design`** | Done | Move packages + docs app; CI publishes core only; GitHub Pages on design repo |
| **2 — Slim playground** | Done | Flows + chrome only; depend on compass-design packages via `file:`; README for catalog role |
| **3 — Alpha release** | Later | `@mattermost/compass-ui@alpha`; webapp switches from `file:` to npm for mergeable PRs |

Stop after each phase; verify before starting the next.

## Consumption

- **Docs / Storybook:** [`mattermost/compass-design`](https://github.com/mattermost/compass-design) workspace packages
- **Playground (this repo):** `file:./compass-design/packages/*` for `@mattermost/compass-ui` and `@mattermost/compass-proto`
- **Webapp (testing branch):** `file:` → compass-ui + watch; webpack React aliases — see compass-design INTEGRATION.md
- **Webapp (after alpha):** `@mattermost/compass-ui@alpha` only — no Mobile*, `ChannelShell`, or Call* from proto in product code

## Related docs

- [compass-design INTEGRATION.md](https://github.com/mattermost/compass-design/blob/main/packages/compass-ui/INTEGRATION.md) — consumer setup (Vite, webapp, styles, peers)
- [AGENTS.md](../AGENTS.md) — agent guidance for this repo
- [src/pages/prototypes/AGENTS.md](../src/pages/prototypes/AGENTS.md) — prototype flows
