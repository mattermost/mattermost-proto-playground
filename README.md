# mattermost-proto-playground

Internal catalog of multi-scene Compass UI prototypes. Component source, guidelines, and Storybook live in [`mattermost/compass-design`](https://github.com/mattermost/compass-design) ([docs site](https://mattermost.github.io/compass-design/)).

## What lives here

- Multi-scene prototype flows under `src/pages/prototypes/`
- Playground chrome: `PrototypeTopNav`, `SceneSwitcher`, `DeviceFrame`, `MobileModalStage`
- Prototype registry in `src/manifests/prototypes.ts`

## Prerequisites

- Node.js 24.x and npm 11.x (see `.nvmrc`)
- A local clone of [`mattermost/compass-design`](https://github.com/mattermost/compass-design) as a **sibling** of this repo (needed for unpublished `@mattermost/compass-proto`)

## Setup

Clone both repositories side by side (proto still uses a `file:../compass-design` dependency):

```bash
# parent folder, e.g. ~/Documents/GitHub/mattermost/
git clone https://github.com/mattermost/mattermost-proto-playground.git
git clone https://github.com/mattermost/compass-design.git
cd mattermost-proto-playground
npm install
npm run dev
```

Layout:

```text
mattermost/
  compass-design/
  mattermost-proto-playground/
```

If compass-design lives elsewhere, symlink it to `../compass-design` from this repo so npm can resolve the `file:` dependency. `COMPASS_DESIGN_PATH` only changes which tree the ensure script builds from; npm still resolves `file:../compass-design/packages/compass-proto` from that sibling path.

Open the URL shown in the terminal. The catalog index is at `/`.

## Adding a prototype

1. Add an entry to `src/manifests/prototypes.ts`
2. Create the flow under `src/pages/prototypes/<slug>/`
3. Follow [src/pages/prototypes/AGENTS.md](src/pages/prototypes/AGENTS.md) for scene chrome, component lookup, and overlay wiring

Use [.cursor/skills/scaffold-prototype/SKILL.md](.cursor/skills/scaffold-prototype/SKILL.md) to scaffold a multi-scene prototype.

## Dependencies

- `@mattermost/compass-ui` — published core from npm (`@alpha` / `0.1.0-alpha.3+`; tokens, primitives, web chrome). Import via **subpaths** (`@mattermost/compass-ui/components/button`), not the root barrel.
- `@mattermost/compass-proto` — unpublished composites and fixtures (`ChannelShell`, Mobile*, Call*, demo sidebar models). **Not on npm** — linked from `compass-design` via `file:`. See [docs/COMPASS-REPO-SPLIT.md](docs/COMPASS-REPO-SPLIT.md#layouts-and-shells-who-uses-what) for how layouts split across ui vs proto.

`npm run predev` / `prebuild` runs `scripts/ensure-compass-packages.mjs`, which verifies the installed npm `compass-ui` package (including subpath layout) and builds `compass-proto` `dist/` in `compass-design` when stale.

**Variant props:** Compass UI uses lowercase kebab-case string values (e.g. `emphasis="primary"`, `size="x-small"`, `type="new-messages"`).

## Related docs

- [docs/COMPASS-REPO-SPLIT.md](docs/COMPASS-REPO-SPLIT.md) — repo split plan and phase status
- [compass-design INTEGRATION.md](https://github.com/mattermost/compass-design/blob/main/packages/compass-ui/INTEGRATION.md) — consumer setup for Compass UI
