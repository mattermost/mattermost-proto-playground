# Integrating `@mattermost/compass-ui`

Guide for consuming the Compass UI library in Vite apps (docs, prototypes catalog) and the Mattermost webapp (`webapp/channels`).

## Install

### Published (target — after `@mattermost` npm org access)

```bash
npm install @mattermost/compass-ui @mattermost/compass-icons simplebar-react
```

Use the `alpha` dist-tag until stable:

```bash
npm install @mattermost/compass-ui@alpha
```

### Before npm publish

**Workspace (monorepo):**

```json
{
  "dependencies": {
    "@mattermost/compass-ui": "workspace:*"
  }
}
```

**Packed tarball (smoke test / local validation):**

```bash
npm run build --workspace=@mattermost/compass-ui
npm pack --workspace=@mattermost/compass-ui
npm install /path/to/mattermost-compass-ui-0.1.0-alpha.0.tgz
```

**File path (sibling repo):**

```json
"@mattermost/compass-ui": "file:../mattermost-compass-ui"
```

Run the automated smoke test from the playground repo root:

```bash
npm run smoke-test:ui
```

---

## Required setup (all consumers)

### 1. Import styles once at app entry

```tsx
// main.tsx or app entry
import '@mattermost/compass-ui/styles';
import '@mattermost/compass-ui/component-styles';
```

| Export | Contents |
|--------|----------|
| `@mattermost/compass-ui/styles` | CSS variables (tokens), themes, reset |
| `@mattermost/compass-ui/component-styles` | Component CSS modules, SimpleBar base CSS |

**Button** does not require `/styles`. Import `component-styles` and the hashed Button CSS. Colors come from host semantic variables (`--button-bg`, `--error-text`, `--center-channel-color`, …) when the host has already themed the page (e.g. Mattermost `applyTheme()`). Prototype fallbacks (Denim hex) apply if those vars are unset.

Do **not** load `/styles` into Mattermost webapp — it includes a global reset and `:root` / `data-theme` overlays that fight Bootstrap and `applyTheme()`. Other primitives still expect `/styles` (or equivalent tokens) until they are productionized the same way.

### 2. Set a theme

```html
<html data-theme="denim">
```

Supported themes: `denim`, `sapphire`, `quartz`, `indigo`, `onyx`.

In React apps, toggle via `document.documentElement.setAttribute('data-theme', theme)` or your existing theme context.

Mattermost webapp: skip `data-theme`. Button follows CSS variables already written by `applyTheme()`.

### 3. Load fonts (recommended)

Compass typography expects Metropolis (headings) and Open Sans (body):

```bash
npm install @fontsource/metropolis @fontsource/open-sans
```

```tsx
import '@fontsource/metropolis/400.css';
import '@fontsource/metropolis/600.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
```

Fonts are not bundled in the library — consumers load them (same pattern as the playground).

### 4. Import components

```tsx
import { Button, Icon, ChannelShell } from '@mattermost/compass-ui';
```

---

## Peer dependencies

| Package | Required | Notes |
|---------|----------|-------|
| `react` | Yes | `^18.2.0` for webapp parity; `^19.0.0` works in Vite consumers |
| `react-dom` | Yes | Same range as React |
| `@mattermost/compass-icons` | Yes | Icon glyphs for `Icon`, `IconButton`, etc. |
| `simplebar-react` | Yes* | Required for `Scrollbars`; listed optional in peer meta but needed if you use scroll regions |

Ensure a single React version in the app — no duplicate React trees when linking locally.

---

## Vite consumer (docs, prototypes catalog)

Minimal `main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@mattermost/compass-ui';
import '@mattermost/compass-ui/styles';
import '@mattermost/compass-ui/component-styles';
import './app.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Button emphasis="Primary">Hello</Button>
  </StrictMode>,
);
```

**Monorepo dev:** run `npm run build:ui` (or `predev`) before `npm run dev` when consuming the built `dist/` from the workspace package.

**Do not** alias `@mattermost/compass-ui` to package source in the consumer Vite config — the monolith `@/` alias conflicts with internal package imports. Consume `dist/` via workspace or tarball.

---

## Mattermost webapp (`webapp/channels`)

Target integration path (Phase 6 — after npm alpha publish).

### Install in workspace

Add to `webapp/channels/package.json` (alongside legacy `@mattermost/compass-components` during migration):

```json
"@mattermost/compass-ui": "0.1.0-alpha.0"
```

### Import pattern

```tsx
import { Button } from '@mattermost/compass-ui';
import '@mattermost/compass-ui/component-styles';
```

Load `component-styles` once at app bootstrap (same entry that loads global webapp SCSS). Do **not** import `@mattermost/compass-ui/styles` in channels.

Button dual-stamps legacy Mattermost classes (`btn`, `btn-primary`, `btn-danger`, …) alongside hashed Compass classes so existing `.btn` selectors keep working during migration.

### Webpack checklist

- [ ] ESM + CJS: package ships both (`module` / `main` fields).
- [ ] CSS: `@mattermost/compass-ui/component-styles` resolves without extra loaders beyond the existing CSS pipeline. Do not load `/styles` in channels.
- [ ] CSS modules: hashed class names from `component-styles` match rendered components.
- [ ] No duplicate React — one version across workspaces.
- [ ] `@mattermost/compass-icons` already external in webapp; keep as peer, do not bundle twice.
- [ ] `simplebar-react` installed if using `Scrollbars` or layout specimens that include scroll regions.
- [ ] Source maps enabled for debugging (`dist/*.map` shipped).

### Migration strategy

**Leaf-first** — do not big-bang replace `@mattermost/compass-components`.

1. Add `@mattermost/compass-ui` alongside legacy package.
2. New code uses compass-ui.
3. Replace compass-components usages file-by-file (Button, Text equivalents, etc.).
4. Storybook is the variant reference — link from internal docs.

### Theme alignment

Mattermost webapp already writes the semantic CSS variables Button consumes (`--button-bg`, `--error-text`, `--center-channel-color`, …) via `applyTheme()`. Do not also set Compass `data-theme` in channels.

---

## Pattern components and fixtures

Tier 3 patterns (`ChannelShell`, `ThreadListItem`, `RightSidebarThread`, etc.) do **not** ship demo avatar images. Pass fixtures from your app:

```tsx
import {
  ChannelShell,
  buildDefaultChannelsSidebarModel,
  RightSidebarThread,
} from '@mattermost/compass-ui';

const model = buildDefaultChannelsSidebarModel({
  avatarAikoTan: aikoSrc,
  avatarArjunPatel: arjunSrc,
  // ...
});

<ChannelShell channelsSidebarModel={model} userAvatarSrc={leonardSrc} />
```

See `src/fixtures/rightSidebarThreadDemo.tsx` in the playground for a docs-side example.

---

## Package contents (what npm ships)

Only `dist/` is published (`files: ["dist"]`):

```
dist/index.js          # ESM bundle
dist/index.cjs         # CJS bundle
dist/index.d.ts        # Type declarations
dist/index.css         # component-styles
dist/compass-ui.css    # styles (tokens/themes)
dist/components/       # per-component .d.ts
```

Storybook, `src/`, and `*.stories.tsx` are **not** in the tarball.

---

## Versioning and releases

| Channel | Version example | npm tag |
|---------|-----------------|---------|
| Alpha | `0.1.0-alpha.0` | `alpha` |
| Beta | `0.1.0-beta.0` | `beta` |
| Stable | `0.1.0` | `latest` |

Git tag format (Mattermost platform convention): `@mattermost/compass-ui@0.1.0-alpha.0`

Publish commands (requires `@mattermost` npm org write access):

```bash
npm run build --workspace=@mattermost/compass-ui
npm publish --access=public --tag alpha --workspace=@mattermost/compass-ui
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Failed to resolve @mattermost/compass-ui/styles` | Run `npm run build:ui` — `dist/compass-ui.css` must exist |
| Unstyled components (flat gray UI) | Import `/component-styles`. Playground/docs still import `/styles` for tokens used by non-Button primitives. |
| Scrollbars missing thumb/track | Ensure `simplebar-react` is installed; `component-styles` includes SimpleBar CSS |
| `@/components/Icon` errors in dev | Do not alias package to source; use built `dist/` |
| Wrong colors | Host must set semantic CSS vars (`--button-bg`, `--error-text`, …). Playground: `data-theme` on `<html>` via `/styles`. |
| Workspace link missing | Run `npm install` from repo root, not inside `packages/compass-ui` |

---

## Related docs

- [README.md](./README.md) — quick start
- [CHANGELOG.md](./CHANGELOG.md) — release history
- [Storybook](./README.md#storybook) — component variant catalog (`npm run storybook`)
- [UI Library Extraction Plan](../../docs/UI-LIBRARY-EXTRACTION-PLAN.md) — full repo split architecture
