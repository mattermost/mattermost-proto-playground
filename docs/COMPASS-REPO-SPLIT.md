# Compass repo split

How we are splitting Compass UI work across two repositories. Replaces the earlier three-repo extraction plan.

## Repositories

| Layer | Repository | Role |
| ----- | ---------- | ---- |
| Design-system monorepo | `mattermost/compass-design` (new) | `@mattermost/compass-ui` (published), `@mattermost/compass-proto` (unpublished), docs + Storybook, GitHub Pages |
| Prototypes catalog | `mattermost/mattermost-proto-playground` (this repo, slimmed later) | Multi-scene prototype flows, device chrome (`PrototypeTopNav`, `DeviceFrame`), registry — not the long-term home of component source |

Icons stay in [`mattermost/compass-icons`](https://github.com/mattermost/compass-icons) for now (peer dependency; may move into `compass-design` later).

## Packages (today, in this monorepo)

| Package | Published | Contents |
| ------- | --------- | -------- |
| `@mattermost/compass-ui` | Yes (`alpha` until stable) | Foundations, primitives, props-driven web chrome (sidebars, headers, Message stack, …) |
| `@mattermost/compass-proto` | No (workspace / `npm pack` only) | Mobile*, `ChannelShell`, Call* composites, demo RHS panels, sidebar fixture builders |

**Chrome vs fixtures:** Core keeps presentational shells (`ChannelsSidebar`, `AdminConsoleSidebar`, `RightSidebar` header). Demo trees and specimen RHS screens live in proto or docs fixtures — not in the published core API.

**Compass vs product:** Compass owns look (props/slots). Webapp owns behavior (permissions, markdown, optimistic UI). Adopt leaf-first; do not grow Compass into a second Post/sidebar controller.

**Playground-only (not proto):** `PrototypeTopNav`, `SceneSwitcher`, `DeviceFrame`, per-prototype scene code.

## Phases

| Phase | Status | Summary |
| ----- | ------ | ------- |
| **0 — Boundary + webapp spike** | Done | `compass-proto` package; core barrel pruned; chrome vs fixtures; pack/smoke tests; local webapp `file:` + watch validation |
| **1 — Create `compass-design`** | Next | Move packages + docs app; CI publishes core only; GitHub Pages on design repo |
| **2 — Slim playground** | Later | Flows + chrome only; depend on published core + packed proto; rewrite README for catalog role |
| **3 — Alpha release** | Later | `@mattermost/compass-ui@alpha`; webapp switches from `file:` to npm for mergeable PRs |

Stop after each phase; verify before starting the next.

## Consumption

- **Docs / Storybook (in monorepo):** workspace `compass-ui` + `compass-proto`
- **Playground (after split):** published `@mattermost/compass-ui` + `file:` / `npm pack` for `@mattermost/compass-proto`
- **Webapp (testing branch):** `file:` → `packages/compass-ui` + watch; webpack React aliases — see INTEGRATION.md
- **Webapp (after alpha):** `@mattermost/compass-ui@alpha` only — no Mobile*, `ChannelShell`, or Call* from proto in product code

## Related docs

- [`packages/compass-ui/INTEGRATION.md`](../packages/compass-ui/INTEGRATION.md) — consumer setup (Vite, webapp, styles, peers)
- [`packages/compass-ui/README.md`](../packages/compass-ui/README.md) — package quick start + Storybook
- [`packages/compass-proto/README.md`](../packages/compass-proto/README.md) — unpublished proto package (if present)
- [`AGENTS.md`](../AGENTS.md) — agent guidance (layers, overlays, package split)
- [`src/guidelines/AGENTS.md`](../src/guidelines/AGENTS.md) — docs specimens and MDX
