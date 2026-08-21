# Changelog

All notable changes to `@mattermost/compass-ui` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/). Versioning follows [Semantic Versioning](https://semver.org/) while on `0.x` (API may change between minors).

## [Unreleased]

### Added

- Storybook coverage for Tier 1 components (in progress).
- `scripts/smoke-test-compass-ui-pack.mjs` — tarball install + Vite consumer build gate.
- `INTEGRATION.md` — consumer setup guide for Vite and Mattermost webapp.
- `@mattermost/compass-ui/styles/standalone` — CSS reset + document `body` / heading chrome for Storybook and other standalone hosts.

### Changed

- `@mattermost/compass-ui/styles` is tokens/themes/webapp-compat only (no reset or document chrome), so webapp can import it safely. Standalone hosts also import `/styles/standalone`.
- Demo fixtures out of the published core surface: `buildDefaultChannelsSidebarModel` and `defaultAdminConsoleSidebarGroups` move to `@mattermost/compass-proto`; `RightSidebarThread` / `RightSidebarChannelInfo` move to proto. `ChannelsSidebar` / `AdminConsoleSidebar` remain props-driven in core (empty defaults).

First alpha extracted from `mattermost-proto-playground`.

### Added

- **`@mattermost/compass-ui` workspace package** with Vite library build (ESM + CJS).
- **81 UI components** migrated from `src/components/ui/`.
- **Style exports:**
  - `@mattermost/compass-ui/styles` — tokens, themes, reset (`dist/compass-ui.css`)
  - `@mattermost/compass-ui/component-styles` — component CSS modules + SimpleBar base styles (`dist/index.css`)
- **Root barrel** export from `src/index.ts` (components, hooks, utilities, sub-exports for layout shells).
- **Call icons:** `OutboundCallIcon`, `PhoneLockIcon` (in `compass-proto`). Dialpad uses `@mattermost/compass-icons` `dialpad`.
- **ChannelsSidebar helpers:** `buildDefaultChannelsSidebarModel`, header/navigator subcomponents.
- **Storybook** with theme toolbar (`denim`, `sapphire`, `quartz`, `indigo`, `onyx`).
- **CI workflow** (typecheck, build, `npm pack` artifact).

### Changed

- Monolith consumers (`mattermost-proto-playground`) import from `@mattermost/compass-ui` instead of `@/components/ui/*`.
- `ChannelShell`, `ThreadListItem`, `RightSidebarThread` no longer bundle demo avatar assets — consumers pass fixtures via props.

### Removed

- `src/components/ui/` and `src/components/icons/` from the playground monolith (source of truth is the package).

### Notes

- **Peer dependencies:** `react`, `react-dom`, `@mattermost/compass-icons`, `simplebar-react` (optional meta for simplebar).
- **Not yet published to npm** — install via workspace, `file:`, or packed tarball until `@mattermost` org publish access is granted.
- **Webapp integration** (webpack) validated separately in Phase 6.

[Unreleased]: https://github.com/mattermost/mattermost-proto-playground/compare/v0.1.0-alpha.0...HEAD
[0.1.0-alpha.0]: https://github.com/mattermost/mattermost-proto-playground/releases/tag/@mattermost/compass-ui@0.1.0-alpha.0
