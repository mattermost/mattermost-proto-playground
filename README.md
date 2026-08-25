# mattermost-proto-playground

Internal catalog of multi-scene Compass UI prototypes. Component source, guidelines, and Storybook live in [`mattermost/compass-design`](https://github.com/mattermost/compass-design) ([docs site](https://mattermost.github.io/compass-design/)).

## What lives here

- Multi-scene prototype flows under `src/pages/prototypes/`
- Playground chrome: `PrototypeTopNav`, `SceneSwitcher`, `DeviceFrame`, `MobileModalStage`
- Prototype registry in `src/manifests/prototypes.ts`

## Prerequisites

- Node.js 24.x and npm 11.x (see `.nvmrc`)
- A local clone of [`mattermost/compass-design`](https://github.com/mattermost/compass-design)

## Setup

Clone both repositories. The playground expects `compass-design` at `./compass-design` (CI uses the same layout). For a side-by-side layout, clone into `./compass-design` or symlink:

```bash
git clone https://github.com/mattermost/mattermost-proto-playground.git
cd mattermost-proto-playground
git clone https://github.com/mattermost/compass-design.git compass-design
npm install
npm run dev
```

Override the design repo location with `COMPASS_DESIGN_PATH` if needed.

Open the URL shown in the terminal. The catalog index is at `/prototypes`.

## Adding a prototype

1. Add an entry to `src/manifests/prototypes.ts`
2. Create the flow under `src/pages/prototypes/<slug>/`
3. Follow [src/pages/prototypes/AGENTS.md](src/pages/prototypes/AGENTS.md) for scene chrome and folder structure

Use [.cursor/skills/scaffold-prototype/SKILL.md](.cursor/skills/scaffold-prototype/SKILL.md) to scaffold a multi-scene prototype.

## Dependencies

This repo consumes Compass packages from `compass-design` via `file:` paths:

- `@mattermost/compass-ui` — published core (tokens, primitives, web chrome)
- `@mattermost/compass-proto` — unpublished prototyping composites (Mobile*, Call*, `ChannelShell`, fixtures)

`npm run predev` / `prebuild` runs `scripts/ensure-compass-packages.mjs`, which builds package `dist/` in `compass-design` when stale.

When `@mattermost/compass-ui@alpha` is on npm (Phase 3), switch the UI dependency to the registry; proto stays `file:` / `npm pack`.

## Related docs

- [docs/COMPASS-REPO-SPLIT.md](docs/COMPASS-REPO-SPLIT.md) — repo split plan and phase status
- [compass-design INTEGRATION.md](https://github.com/mattermost/compass-design/blob/main/packages/compass-ui/INTEGRATION.md) — consumer setup for Compass UI
