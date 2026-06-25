# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single frontend product: **mattermost-proto-playground**, a Vite + React 19 + TypeScript playground for prototyping Mattermost UI components and flows. It is an npm-workspaces monorepo whose only workspace is the local design-system package `packages/compass-ui` (`@mattermost/compass-ui`). There is no backend or database.

Standard commands live in `package.json` (root) and `packages/compass-ui/package.json`. Key ones: `npm run dev`, `npm run build`, `npm run lint`, `npm run build:ui`, and (compass-ui) `npm run typecheck --workspace=@mattermost/compass-ui`.

Non-obvious notes:

- **Dev server URL has a base path.** `npm run dev` serves at `http://localhost:5173/mattermost-proto-playground/` (set via `base` in `vite.config.ts`), not at the bare root. Hitting `/` returns the SPA but routing expects the base path.
- **The app consumes the built `compass-ui` dist, not its source.** `npm run dev`/`preview` run a `predev` hook (`scripts/ensure-compass-ui.mjs`) that builds `@mattermost/compass-ui` into `packages/compass-ui/dist/` only if the dist is missing. If you edit anything under `packages/compass-ui/src/`, the running dev server will NOT hot-reload those changes — rerun `npm run build:ui` to rebuild the dist, then restart/refresh.
- **`npm run lint` currently reports pre-existing errors** in `src/` (e.g. `jsx-a11y/anchor-is-valid`, `no-irregular-whitespace`). These exist on a clean checkout and are unrelated to environment setup.
- **`npm run build:ui` prints TS dts warnings** (e.g. `Cannot find module ...module.scss`) from `vite-plugin-dts`, but still emits `dist/index.js` + CSS and exits 0; the build is considered successful when those dist files exist.
